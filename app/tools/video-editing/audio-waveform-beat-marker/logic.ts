/**
 * Audio Waveform Beat Marker (tool-269) — pure logic, zero imports, zero
 * network, zero DOM. Deterministic: same value series always yields the same
 * peaks.
 *
 * FEASIBILITY FLAG (mandatory): real onset detection needs the Web Audio API
 * to decode the user's uploaded audio file and run an energy-flux algorithm —
 * doable fully client-side, but the pure-logic layer can only implement the
 * PEAK-PICKING MATH on a provided amplitude array. This function operates on
 * a numeric series (comma-separated string or number[]), NOT an audio file.
 * File decode + waveform rendering is the app shell's job. The UI must say so.
 *
 * Inputs are numeric amplitude series: one value per analysis window
 * (documented as windowMs milliseconds each, default 10 ms). Values are
 * expected in the 0-1 range; negative values are clamped to 0.
 *
 * === PUBLISHED ALGORITHM ===
 *  1. Clamp negatives to 0; if every value is 0 -> silent: zero peaks with an
 *     explicit message.
 *  2. Normalize by the series maximum.
 *  3. Threshold = mean + k * stddev, with k = 1.5 (low) | 1.0 (med) | 0.6 (high).
 *  4. Candidates = local maxima (x[i] > x[i-1] and x[i] >= x[i+1]) at or
 *     above the threshold.
 *  5. Greedy refractory filter: sort candidates by amplitude desc, keep a
 *     candidate only if no kept peak is within 100 ms of it.
 *  6. Peaks are reported sorted by time. strength = normalized amplitude.
 *  7. Suggested cut points = the peak times.
 *
 * Honesty: these are energy-peak CANDIDATES, not true tempo beats —
 * variable-tempo music, swing, and fills will not be modeled. Confirm by ear.
 */

interface PeakRow {
  timeMs: number;
  strength: number;
}

const MIN_SAMPLES = 32;
const MAX_SAMPLES = 200000;
const REFRACTORY_MS = 100;

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function parseSeries(raw: unknown, label: string): { data: number[] } | { error: string } {
  let tokens: unknown[];
  if (Array.isArray(raw)) {
    tokens = raw;
  } else if (typeof raw === "string") {
    tokens = raw.split(/[\s,;]+/).filter((p) => p.length > 0);
  } else {
    return { error: `${label}: paste comma-separated numbers (e.g. 0.02, 0.5, 0.9) — an audio file cannot be read here.` };
  }
  if (tokens.length < MIN_SAMPLES) {
    return { error: `${label}: need at least ${MIN_SAMPLES} values (got ${tokens.length}). Paste a longer series.` };
  }
  if (tokens.length > MAX_SAMPLES) {
    return { error: `${label}: capped at ${MAX_SAMPLES} values (got ${tokens.length}). Paste a shorter series.` };
  }
  const data: number[] = [];
  for (const t of tokens) {
    const n = typeof t === "number" ? t : Number(t);
    if (!Number.isFinite(n)) {
      return { error: `${label}: "${String(t)}" is not a number — use comma-separated numbers only.` };
    }
    data.push(n < 0 ? 0 : n); // clamp negative amplitudes to 0
  }
  return { data };
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const parsed = parseSeries(values["amplitudeValues"], "Amplitude values");
  if ("error" in parsed) return { ok: false, error: parsed.error };
  const data = parsed.data;

  const rawSens = values["sensitivity"];
  const sensitivity =
    typeof rawSens === "string" && rawSens.trim() !== ""
      ? rawSens.trim().toLowerCase()
      : "med";
  const K_BY_SENSITIVITY: Record<string, number> = { low: 1.5, med: 1.0, high: 0.6 };
  if (!(sensitivity in K_BY_SENSITIVITY)) {
    return { ok: false, error: "Sensitivity must be one of: low, med, high." };
  }
  const k = K_BY_SENSITIVITY[sensitivity];

  const rawWindow = values["windowMs"];
  const windowMs = rawWindow === undefined || rawWindow === null || rawWindow === "" ? 10 : Number(rawWindow);
  if (!Number.isFinite(windowMs) || windowMs <= 0 || windowMs > 1000) {
    return { ok: false, error: "Window length must be between 0.1 and 1000 ms per value." };
  }

  let max = 0;
  for (const v of data) if (v > max) max = v;

  const durationSec = round1((data.length * windowMs) / 1000);
  if (max === 0) {
    return {
      ok: true,
      values: {
        peaks: [] as PeakRow[],
        suggestedCutPointsMs: [] as number[],
        waveformSummary: `No peaks found — every value is 0, so the series looks completely silent. Try a louder section, or check that the values were pasted correctly.`,
      },
    };
  }

  const norm = data.map((v) => v / max);
  let mean = 0;
  for (const v of norm) mean += v;
  mean /= norm.length;
  let varSum = 0;
  for (const v of norm) varSum += (v - mean) * (v - mean);
  const std = Math.sqrt(varSum / norm.length);
  const threshold = mean + k * std;

  const candidates: number[] = [];
  for (let i = 1; i < norm.length - 1; i += 1) {
    if (norm[i] > norm[i - 1] && norm[i] >= norm[i + 1] && norm[i] >= threshold) {
      candidates.push(i);
    }
  }
  candidates.sort((a, b) => norm[b] - norm[a]);

  const minSepIdx = Math.max(1, Math.ceil(REFRACTORY_MS / windowMs));
  const kept: number[] = [];
  for (const idx of candidates) {
    let tooClose = false;
    for (const prev of kept) {
      if (Math.abs(prev - idx) < minSepIdx) {
        tooClose = true;
        break;
      }
    }
    if (!tooClose) kept.push(idx);
  }
  kept.sort((a, b) => a - b);

  const peaks: PeakRow[] = kept.map((i) => ({
    timeMs: round1(i * windowMs),
    strength: round3(norm[i]),
  }));
  const suggestedCutPointsMs = peaks.map((p) => p.timeMs);

  let strongestNote = "";
  if (peaks.length > 0) {
    const strongest = kept.reduce((a, b) => (norm[a] >= norm[b] ? a : b));
    strongestNote = ` Strongest peak at ${round1(strongest * windowMs)} ms (strength ${round3(norm[strongest])}).`;
  }

  const waveformSummary =
    peaks.length === 0
      ? `No peaks found in ${durationSec} s of audio at "${sensitivity}" sensitivity (threshold ${round3(threshold)}). The series may be too flat — try "high" sensitivity or a busier section.`
      : `${peaks.length} candidate beat(s) in ${durationSec} s of audio at "${sensitivity}" sensitivity (threshold ${round3(threshold)}).${strongestNote} These are energy-peak candidates, not true tempo beats — confirm by ear.`;

  return {
    ok: true,
    values: {
      peaks,
      suggestedCutPointsMs,
      waveformSummary,
    },
  };
}
