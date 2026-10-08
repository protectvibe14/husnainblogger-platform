/**
 * Silence Gap Finder (tool-270) — pure logic, zero imports, zero network,
 * zero DOM. Deterministic: same level series always yields the same gaps.
 *
 * FEASIBILITY FLAG (mandatory): real silence detection needs the Web Audio
 * API to decode the user's uploaded audio file in-browser — doable fully
 * client-side, but the pure-logic layer can only operate on RMS/dB ARRAYS.
 * This function takes a numeric level series (comma-separated string or
 * number[]), NOT an audio file. File decode is the app shell's job.
 * The UI must say so.
 *
 * Values are interpreted as dB levels (e.g. -58, -55, -12, -8), one per
 * analysis window (windowMs milliseconds each, default 10 ms).
 *
 * === PUBLISHED ALGORITHM ===
 *  1. A window counts as silent when its level is BELOW thresholdDb
 *     (default -40 dB, valid range -80 to -10).
 *  2. Consecutive silent windows form a gap; it is kept only when its
 *     duration >= minGapMs (default 400 ms, valid range 100-5000).
 *  3. Suggested cut points = gap midpoints (rounded to whole ms).
 *  4. totalSilenceSec = sum of kept gap durations in seconds.
 *  5. No gaps -> empty lists and 0 total (the UI tells the user to raise the
 *     threshold, e.g. -40 to -35 dB, and re-run).
 *  6. Whole series silent -> one gap spanning the series, with a warning
 *     note on the row.
 */

interface GapRow {
  startMs: number;
  endMs: number;
  durationMs: number;
  note?: string;
}

const MIN_SAMPLES = 8;
const MAX_SAMPLES = 200000;

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function parseSeries(raw: unknown, label: string): { data: number[] } | { error: string } {
  let tokens: unknown[];
  if (Array.isArray(raw)) {
    tokens = raw;
  } else if (typeof raw === "string") {
    tokens = raw.split(/[\s,;]+/).filter((p) => p.length > 0);
  } else {
    return { error: `${label}: paste comma-separated dB numbers (e.g. -58, -55, -12) — an audio file cannot be read here.` };
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
      return { error: `${label}: "${String(t)}" is not a number — use comma-separated dB numbers only.` };
    }
    data.push(n);
  }
  return { data };
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const parsed = parseSeries(values["levelValues"], "Level values");
  if ("error" in parsed) return { ok: false, error: parsed.error };
  const data = parsed.data;

  const rawThreshold = values["thresholdDb"];
  const thresholdDb = rawThreshold === undefined || rawThreshold === null || rawThreshold === "" ? -40 : Number(rawThreshold);
  if (!Number.isFinite(thresholdDb) || thresholdDb < -80 || thresholdDb > -10) {
    return { ok: false, error: "Silence threshold must be between -80 and -10 dB (e.g. -40)." };
  }

  const rawMinGap = values["minGapMs"];
  const minGapMs = rawMinGap === undefined || rawMinGap === null || rawMinGap === "" ? 400 : Number(rawMinGap);
  if (!Number.isFinite(minGapMs) || minGapMs < 100 || minGapMs > 5000) {
    return { ok: false, error: "Minimum gap length must be between 100 and 5000 ms." };
  }

  const rawWindow = values["windowMs"];
  const windowMs = rawWindow === undefined || rawWindow === null || rawWindow === "" ? 10 : Number(rawWindow);
  if (!Number.isFinite(windowMs) || windowMs <= 0 || windowMs > 1000) {
    return { ok: false, error: "Window length must be between 0.1 and 1000 ms per value." };
  }

  // Collect silent runs: [startIdx, endIdx] inclusive.
  const runs: Array<[number, number]> = [];
  let runStart = -1;
  for (let i = 0; i < data.length; i += 1) {
    if (data[i] < thresholdDb) {
      if (runStart === -1) runStart = i;
    } else if (runStart !== -1) {
      runs.push([runStart, i - 1]);
      runStart = -1;
    }
  }
  if (runStart !== -1) runs.push([runStart, data.length - 1]);

  const wholeFileSilent = runs.length === 1 && runs[0][0] === 0 && runs[0][1] === data.length - 1;

  const gaps: GapRow[] = [];
  for (const [s, e] of runs) {
    const durationMs = (e - s + 1) * windowMs;
    if (durationMs < minGapMs) continue;
    const row: GapRow = {
      startMs: round1(s * windowMs),
      endMs: round1((e + 1) * windowMs),
      durationMs: round1(durationMs),
    };
    if (wholeFileSilent) {
      row.note = "The entire series is below the threshold — the clip may be fully silent or the threshold is set too high.";
    }
    gaps.push(row);
  }

  const suggestedCutPointsMs = gaps.map((g) => Math.round((g.startMs + g.endMs) / 2));
  const totalSilenceSec = round2(gaps.reduce((a, g) => a + g.durationMs, 0) / 1000);

  return {
    ok: true,
    values: {
      gaps,
      suggestedCutPointsMs,
      totalSilenceSec,
    },
  };
}
