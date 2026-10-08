/**
 * logic.ts — Clip Segment Planner (tool-285)
 *
 * Pure, deterministic engine. ZERO imports.
 *
 * What this honestly is: pure interval arithmetic. The tool divides a
 * source video into clip segments for repurposing into shorts. It does NOT
 * watch your video or find highlights by analysis — the "highlights"
 * strategy places segments at fixed, documented template positions
 * (skipping a typical intro and spacing across the timeline). For real
 * highlight moments, log them with the Highlight Moment Logger and use the
 * "custom" strategy here with your timestamps.
 *
 * Strategies (fixed rules):
 *   highlights — skips the first 8% of the video (typical intro), then
 *     spaces up to 10 windows of targetClipSec across the rest. Labels say
 *     "template position" so no one mistakes them for found highlights.
 *   even       — spaces up to 10 windows of targetClipSec evenly across the
 *     whole source, including the intro.
 *   custom     — parses your own ranges (see CUSTOM_FORMAT below);
 *     overlapping ranges are merged and a warning is emitted.
 *
 * CUSTOM_FORMAT: one range per line, "start - end", where each side is
 *   seconds or mm:ss, e.g.  "0:45 - 1:15"  or  "45 - 75".
 *   A JSON array is also accepted: [{"startSec":45,"endSec":75}].
 *
 * Output is deterministic: same inputs always produce the same segments.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function toNumber(v: unknown): number {
  return typeof v === "number" ? v : Number(v);
}

/** Parses "ss", "mm:ss" or "hh:mm:ss" into seconds; NaN when invalid. */
function parseTime(s: string): number {
  const t = s.trim();
  if (/^\d+(\.\d+)?$/.test(t)) return Number(t);
  const parts = t.split(":").map((p) => Number(p));
  if (parts.some((p) => !Number.isFinite(p) || p < 0)) return NaN;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return NaN;
}

interface RangeSec { startSec: number; endSec: number; }

function parseCustom(raw: unknown, source: number): RangeSec[] | string {
  let text = typeof raw === "string" ? raw.trim() : "";
  if (!text) return "Custom strategy needs your ranges: one per line like \"0:45 - 1:15\", or a JSON array like [{\"startSec\":45,\"endSec\":75}].";

  const ranges: RangeSec[] = [];
  if (text.startsWith("[")) {
    let arr: unknown;
    try { arr = JSON.parse(text); } catch { return "Custom ranges JSON could not be parsed."; }
    if (!Array.isArray(arr)) return "Custom ranges JSON must be an array.";
    for (let i = 0; i < arr.length; i++) {
      const r = arr[i] as Record<string, unknown>;
      const s = toNumber(r.startSec);
      const e = toNumber(r.endSec);
      if (!Number.isFinite(s) || !Number.isFinite(e)) return `Custom range ${i + 1}: startSec and endSec must be numbers.`;
      ranges.push({ startSec: s, endSec: e });
    }
  } else {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return "Custom strategy needs at least 1 range.";
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].split(/\s*-\s*|\s+to\s+/i);
      if (m.length !== 2) return `Custom line ${i + 1}: use "start - end", e.g. "0:45 - 1:15".`;
      const s = parseTime(m[0]);
      const e = parseTime(m[1]);
      if (!Number.isFinite(s) || !Number.isFinite(e)) return `Custom line ${i + 1}: could not read the times. Use seconds or mm:ss.`;
      ranges.push({ startSec: s, endSec: e });
    }
  }

  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];
    if (r.startSec < 0 || r.endSec > source) {
      return `Custom range ${i + 1} is outside the video (0 to ${source}s).`;
    }
    if (r.endSec <= r.startSec) return `Custom range ${i + 1}: end must be after start.`;
  }
  return ranges.sort((a, b) => a.startSec - b.startSec);
}

function mergeOverlaps(ranges: RangeSec[]): { merged: RangeSec[]; mergedCount: number } {
  const merged: RangeSec[] = [];
  let count = 0;
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r.startSec < last.endSec) {
      last.endSec = Math.max(last.endSec, r.endSec);
      count++;
    } else {
      merged.push({ ...r });
    }
  }
  return { merged, mergedCount: count };
}

export function runTool(values: Record<string, unknown>): RunResult {
  const source = toNumber(values.sourceDurationSec);
  const target = toNumber(values.targetClipSec);
  const strategy = typeof values.strategy === "string" ? values.strategy.trim().toLowerCase() : "";

  if (!Number.isFinite(source) || source <= 0) return { ok: false, error: "Source duration must be a number of seconds greater than 0." };
  if (!Number.isFinite(target) || target <= 0) return { ok: false, error: "Target clip length must be a number of seconds greater than 0." };
  if (target >= source) {
    return { ok: false, error: `Target clip (${target}s) is not shorter than the source (${source}s) — nothing to plan. The target must be shorter than the source.` };
  }
  if (strategy !== "highlights" && strategy !== "even" && strategy !== "custom") {
    return { ok: false, error: "Strategy must be \"highlights\", \"even\", or \"custom\"." };
  }

  const warnings: string[] = [];
  let segments: { startMs: number; endMs: number; label: string }[];

  if (strategy === "custom") {
    const parsed = parseCustom(values.customRanges, source);
    if (typeof parsed === "string") return { ok: false, error: parsed };
    const { merged, mergedCount } = mergeOverlaps(parsed);
    if (mergedCount > 0) {
      warnings.push(`Merged ${mergedCount} overlapping custom range(s) into longer segments — overlapping clips would double-post the same moment.`);
    }
    segments = merged.map((r, i) => ({
      startMs: Math.round(r.startSec * 1000),
      endMs: Math.round(r.endSec * 1000),
      label: `Custom segment ${i + 1}`,
    }));
  } else {
    const count = Math.min(10, Math.max(1, Math.floor(source / target)));
    const usableStart = strategy === "highlights" ? source * 0.08 : 0; // skip typical intro for highlights
    const usableEnd = source;
    const span = usableEnd - usableStart - target;
    const step = count === 1 ? 0 : Math.max(0, span / (count - 1));
    segments = [];
    for (let i = 0; i < count; i++) {
      const startSec = usableStart + i * step;
      const label =
        strategy === "highlights"
          ? `Highlight candidate ${i + 1} (template position — verify the real moment in your footage)`
          : `Clip ${i + 1} of ${count}`;
      segments.push({
        startMs: Math.round(startSec * 1000),
        endMs: Math.round((startSec + target) * 1000),
        label,
      });
    }
    if (strategy === "highlights") {
      warnings.push(
        "Highlights strategy places segments at fixed template positions — it does not detect highlights. Verify each position in your footage or log real moments and use the custom strategy."
      );
    }
  }

  const totalSegSec = segments.reduce((s, g) => s + (g.endMs - g.startMs) / 1000, 0);
  const coveragePct = Math.round((totalSegSec / source) * 1000) / 10;

  return { ok: true, values: { segments, coveragePct, warnings } };
}
