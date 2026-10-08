/**
 * Karaoke Timing Grid Planner (tool-259) — pure logic, zero imports, zero
 * network, zero DOM. Deterministic: the same lines, duration, and BPM
 * always produce the same grid.
 *
 * Honesty: this is PROPORTIONAL ALLOCATION math, not audio analysis. The
 * planner never hears your song — the grid and word timings are ESTIMATES
 * meant as starting points for manual sync in your editor (CapCut, Premiere,
 * etc.). The UI must label word timings as estimates, never measured timings.
 *
 * === PUBLISHED RULES ===
 *  MIN_LINE_MS = 833  — each line gets at least 833ms on screen (matches the
 *                       Netflix flash-risk floor; karaoke lines need at
 *                       least this to be readable while highlighted).
 *  Duration is distributed by CHARACTER WEIGHT (uneven line lengths get
 *  proportional time), not by equal split: each line first reserves
 *  MIN_LINE_MS, then the remaining time is shared in proportion to line
 *  length (a line of zero visible length would divide by zero, so lines
 *  shorter than 1 char are impossible after trimming).
 *  If lines * 833ms exceeds the total duration, the run fails with an error
 *  suggesting fewer lines or a longer duration.
 *  When BPM is given (30-240), each line's start boundary (except the first
 *  at 0ms and the last at the total) snaps to the nearest beat
 *  (beatMs = 60000 / bpm).
 *  Word-level timings distribute a line's duration across its words by word
 *  character weight — again estimates only.
 */

export interface GridRow {
  lineIndex: number; // 1-based
  text: string;
  startMs: number;
  endMs: number;
  wordsPerSec: number;
  snappedToBeat: boolean;
}

export interface WordTiming {
  lineIndex: number; // 1-based
  wordIndex: number; // 1-based within the line
  word: string;
  startMs: number;
  endMs: number;
  estimated: true; // always true — these are starting points, not measured timings
}

const MIN_LINE_MS = 833;
const MAX_INPUT_CHARS = 100_000;
const MAX_LINES = 500;

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawLines = values["lyricLines"];
  const linesText = typeof rawLines === "string" ? rawLines : "";
  if (linesText.trim() === "") {
    return {
      ok: false,
      error: "Paste your lyric lines first — one line per line.",
    };
  }
  if (linesText.length > MAX_INPUT_CHARS) {
    return {
      ok: false,
      error: "Too many lyrics — keep the input under 100,000 characters.",
    };
  }
  const lines = linesText
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) {
    return {
      ok: false,
      error: "No lyric lines found — paste at least one line.",
    };
  }
  if (lines.length > MAX_LINES) {
    return {
      ok: false,
      error: `Too many lines (${lines.length}) — the planner supports up to ${MAX_LINES}.`,
    };
  }

  const totalSec = toNumber(values["totalDurationSec"]);
  if (totalSec === null || !(totalSec > 0)) {
    return {
      ok: false,
      error: "Enter a total duration greater than 0 seconds.",
    };
  }
  const totalMs = Math.round(totalSec * 1000);

  let bpm: number | null = null;
  if (
    values["beatsPerMinute"] !== undefined &&
    values["beatsPerMinute"] !== null &&
    String(values["beatsPerMinute"]).trim() !== ""
  ) {
    const b = toNumber(values["beatsPerMinute"]);
    if (b === null || !Number.isInteger(b) || b < 30 || b > 240) {
      return {
        ok: false,
        error: "BPM must be a whole number between 30 and 240, or left blank.",
      };
    }
    bpm = b;
  }

  const minTotal = lines.length * MIN_LINE_MS;
  if (minTotal > totalMs) {
    const needSec = (minTotal / 1000).toFixed(1);
    return {
      ok: false,
      error:
        `${lines.length} lines need at least ${needSec}s at the ${MIN_LINE_MS}ms minimum per line, ` +
        `but you gave ${totalSec}s. Use fewer lines or a longer duration.`,
    };
  }

  // Allocate: reserve the 833ms floor per line, share the rest by character weight.
  const weights = lines.map((l) => Math.max(1, l.length));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const remaining = totalMs - minTotal;
  const durations: number[] = weights.map((w) =>
    Math.round(MIN_LINE_MS + (remaining * w) / totalWeight),
  );
  // Fix integer rounding drift on the last line so the grid ends exactly on time.
  const drift = totalMs - durations.reduce((a, b) => a + b, 0);
  durations[durations.length - 1] += drift;

  // Boundary positions (line 0 starts at 0, last ends at totalMs).
  let boundaries: number[] = [0];
  let acc = 0;
  for (const d of durations) {
    acc += d;
    boundaries.push(acc);
  }

  // BPM snapping: interior boundaries snap to the nearest beat.
  let snappedAny = false;
  if (bpm !== null) {
    const beatMs = 60000 / bpm;
    boundaries = boundaries.map((b, i) => {
      if (i === 0 || i === boundaries.length - 1) return b;
      const snapped = Math.round(b / beatMs) * beatMs;
      const clamped = Math.max(0, Math.min(totalMs, Math.round(snapped)));
      if (clamped !== b) snappedAny = true;
      return clamped;
    });
  }

  const grid: GridRow[] = lines.map((text, i) => {
    const startMs = boundaries[i];
    const endMs = boundaries[i + 1];
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    const wps = Math.round((words.length / ((endMs - startMs) / 1000)) * 100) / 100;
    return {
      lineIndex: i + 1,
      text,
      startMs,
      endMs,
      wordsPerSec: wps,
      snappedToBeat: snappedAny,
    };
  });

  // Word-level estimates: split each line's span by word character weight.
  const suggestedWordTimings: WordTiming[] = [];
  grid.forEach((row) => {
    const words = row.text.split(/\s+/).filter((w) => w.length > 0);
    const wWeights = words.map((w) => Math.max(1, w.length));
    const wTotal = wWeights.reduce((a, b) => a + b, 0);
    const span = row.endMs - row.startMs;
    let cursor = row.startMs;
    words.forEach((word, wi) => {
      const isLast = wi === words.length - 1;
      const wMs = isLast
        ? row.endMs - cursor // absorb rounding drift on the last word
        : Math.round((span * wWeights[wi]) / wTotal);
      suggestedWordTimings.push({
        lineIndex: row.lineIndex,
        wordIndex: wi + 1,
        word,
        startMs: cursor,
        endMs: cursor + wMs,
        estimated: true,
      });
      cursor += wMs;
    });
  });

  return {
    ok: true,
    values: { grid, suggestedWordTimings },
  };
}
