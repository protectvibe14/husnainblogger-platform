/**
 * Voiceover Level Meter (tool-271) — pure logic, zero imports, zero network,
 * zero DOM. Deterministic: the same sample batch always yields the same
 * measurements.
 *
 * FEASIBILITY (F-DB-01): the dB math here is pure and runs anywhere. Getting
 * the samples in the first place needs the Web Audio API (file decode or
 * getUserMedia) in the app shell — this logic layer is NOT a live meter and
 * does NOT capture audio. It accepts a textarea of comma/whitespace-separated
 * sample values or a number[] (the shape the runtime's audio file-input lane
 * hands to runTool) and returns peak/RMS measurements in dBFS.
 *
 * === PUBLISHED FORMULAS ===
 *  peakDb = 20 * log10(max |x|)                      (x = normalized samples)
 *  rmsDb  = 20 * log10(sqrt(mean(x^2)))
 *  gainAdjustmentDb = targetDb - rmsDb  (positive = turn the gain up)
 *  clippingDetected = any |x| >= 1.0  (a sample at 0 dBFS)
 *  loudnessVerdict: |rmsDb - targetDb| <= 3 dB -> "On target";
 *    rmsDb < targetDb - 3 -> "Too quiet"; rmsDb > targetDb + 3 -> "Too loud".
 *  All-silence input (every sample 0): peak/rms reported at the -120 dB
 *  floor with an explicit silence verdict — never as real measurements.
 */

const SILENCE_FLOOR_DB = -120;
const MAX_SAMPLES = 4_000_000;
const MIN_SAMPLES = 8;

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function parseSamples(raw: unknown): { samples?: number[]; error?: string } {
  let tokens: string[];
  if (Array.isArray(raw)) {
    tokens = raw.map((v) => String(v));
  } else if (typeof raw === "string") {
    tokens = raw.split(/[\s,;]+/).filter((t) => t.length > 0);
  } else {
    return { error: "Paste your audio samples as comma-separated numbers (-1 to 1), e.g. 0.0, 0.12, -0.34." };
  }
  if (tokens.length === 0) {
    return { error: "Paste your audio samples as comma-separated numbers (-1 to 1), e.g. 0.0, 0.12, -0.34." };
  }
  if (tokens.length < MIN_SAMPLES) {
    return { error: `Paste at least ${MIN_SAMPLES} sample values — got ${tokens.length}.` };
  }
  if (tokens.length > MAX_SAMPLES) {
    return { error: `Too many samples (max ${MAX_SAMPLES.toLocaleString("en-US")}) — paste a shorter excerpt.` };
  }
  const samples: number[] = new Array(tokens.length);
  for (let i = 0; i < tokens.length; i++) {
    const n = Number(tokens[i]);
    if (!Number.isFinite(n)) {
      return { error: `Sample #${i + 1} ("${tokens[i]}") is not a number — use plain decimals only.` };
    }
    if (Math.abs(n) > 1) {
      return { error: `Sample #${i + 1} is ${tokens[i]} — samples must be normalized to the -1..1 range.` };
    }
    samples[i] = n;
  }
  return { samples };
}

function parseTargetDb(raw: unknown): { target?: number; error?: string } {
  if (raw === undefined || raw === null || raw === "") return { target: -12 };
  const n = typeof raw === "number" ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n)) {
    return { error: "Target level must be a number of dBFS between -30 and -3 (default -12)." };
  }
  if (n < -30 || n > -3) {
    return { error: `Target level ${n} dBFS is outside the -30 to -3 dBFS range.` };
  }
  return { target: n };
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const parsed = parseSamples(values["samples"]);
  if (parsed.error || !parsed.samples) return { ok: false, error: parsed.error };
  const samples = parsed.samples;

  const tParsed = parseTargetDb(values["targetDb"]);
  if (tParsed.error || tParsed.target === undefined) return { ok: false, error: tParsed.error };
  const targetDb = tParsed.target;

  let peak = 0;
  let sumSq = 0;
  let clipping = false;
  for (const s of samples) {
    const a = Math.abs(s);
    if (a > peak) peak = a;
    sumSq += s * s;
    if (a >= 1) clipping = true;
  }

  if (peak === 0) {
    return {
      ok: true,
      values: {
        peakDb: SILENCE_FLOOR_DB,
        rmsDb: SILENCE_FLOOR_DB,
        loudnessVerdict:
          "All silence — every sample is 0, so there is no audio signal to measure. Record or paste real audio and re-check.",
        gainAdjustmentDb: 0,
        clippingDetected: "No",
      },
    };
  }

  const rms = Math.sqrt(sumSq / samples.length);
  const peakDb = round1(20 * Math.log10(peak));
  const rmsDb = round1(20 * Math.log10(rms));
  const gainAdjustmentDb = round1(targetDb - rmsDb);
  const diff = rmsDb - targetDb;

  let verdict: string;
  if (diff <= -3) {
    verdict = `Too quiet — RMS is ${Math.abs(round1(diff))} dB under your ${targetDb} dBFS target. Raise gain by about ${gainAdjustmentDb} dB.`;
  } else if (diff >= 3) {
    verdict = `Too loud — RMS is ${round1(diff)} dB over your ${targetDb} dBFS target. Lower gain by about ${Math.abs(gainAdjustmentDb)} dB.`;
  } else {
    verdict = `On target — RMS sits within ±3 dB of your ${targetDb} dBFS target. Fine for voiceover.`;
  }
  if (clipping) {
    verdict += " Clipping detected: at least one sample hit 0 dBFS — lower the input gain and re-record; clipped peaks cannot be fixed in the mix.";
  } else if (peakDb > -1) {
    verdict += ` Near-clipping: peak is ${peakDb} dBFS, under 1 dB of headroom — leave more headroom on the next take.`;
  }

  return {
    ok: true,
    values: {
      peakDb,
      rmsDb,
      loudnessVerdict: verdict,
      gainAdjustmentDb,
      clippingDetected: clipping ? "Yes" : "No",
    },
  };
}
