/**
 * tool-286 — Highlight Moment Logger (built as BUILDER shape).
 *
 * The platform has no localStorage tracker mode, so per the task directive
 * this tool uses the honest builder shape: the BuilderTemplate calls
 * runTool({ items }), one item per logged moment:
 *   { label, timestamp, rating }
 * where timestamp is ms (number) or "mm:ss" / "hh:mm:ss" (string),
 * and rating is 1-5.
 *
 * HONESTY (from spec honestyNote):
 *  - State tracking only; timestamps are user-logged, not detected.
 *    This tool does NOT watch your video or detect highlights — you enter
 *    every moment yourself.
 *  - Session-based only: there is NO persistence. Export the CSV to keep
 *    your log; nothing is saved between page loads by this tool.
 *
 * Outputs:
 *   logSummary  (text)     — one-line session summary incl. duplicate flags
 *   topMoments  (string[]) — top 5 moments by rating (ties: earliest first)
 *   exportCsv   (string)   — CSV text with header row, downloadable
 *
 * Validation: label required; timestamp >= 0; rating integer 1-5.
 * Edge cases (from spec): duplicate timestamps are KEPT and flagged in the
 * summary; zero moments -> OK with empty topMoments and a CSV that contains
 * only the header plus an explanatory comment line.
 *
 * Pure TypeScript: zero imports, no DOM, no network, no Math.random.
 * Deterministic: same items -> same outputs, always.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

interface ParsedMoment {
  label: string;
  timestampMs: number;
  rating: number;
}

const CSV_HEADER = "timestamp_ms,timestamp,label,rating";
const TOP_MOMENTS_LIMIT = 5;

function fail(itemIndex: number, message: string): RunResult {
  return { ok: false, error: `Item ${itemIndex + 1}: ${message}` };
}

function toInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && Number.isInteger(value)) return value;
  if (typeof value === "string") {
    const t = value.trim();
    if (t === "") return null;
    const n = Number(t);
    if (Number.isInteger(n)) return n;
  }
  return null;
}

/**
 * Accepts a non-negative millisecond number, a numeric string of ms,
 * or "mm:ss" / "hh:mm:ss" strings. Returns ms, or null when invalid.
 */
function parseTimestampMs(value: unknown): number | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value < 0) return null;
    return Math.floor(value);
  }
  if (typeof value !== "string") return null;
  const t = value.trim();
  if (t === "") return null;
  if (/^\d+$/.test(t)) {
    const n = Number(t);
    return n >= 0 ? n : null;
  }
  const parts = t.split(":");
  if (parts.length < 2 || parts.length > 3) return null;
  const nums: number[] = [];
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return null;
    nums.push(Number(p));
  }
  if (nums[1] >= 60) return null;
  if (nums.length === 3 && nums[2] >= 60) return null;
  const ms =
    nums.length === 2
      ? nums[0] * 60_000 + nums[1] * 1_000
      : nums[0] * 3_600_000 + nums[1] * 60_000 + nums[2] * 1_000;
  return ms;
}

function formatMmSs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function parseItem(item: Record<string, unknown>, index: number): ParsedMoment | RunResult {
  const label = typeof item.label === "string" ? item.label.trim() : "";
  if (label === "") return fail(index, "label is required (describe the moment).");
  const timestampMs = parseTimestampMs(item.timestamp);
  if (timestampMs === null) {
    return fail(
      index,
      "timestamp must be >= 0 milliseconds or a mm:ss / hh:mm:ss string (e.g. 90500 or 01:30)."
    );
  }
  const rating = toInt(item.rating);
  if (rating === null || rating < 1 || rating > 5) {
    return fail(index, "rating must be a whole number from 1 to 5.");
  }
  return { label, timestampMs, rating };
}

export function runTool(args: { items: Record<string, unknown>[] }): RunResult {
  if (!args || !Array.isArray(args.items)) {
    return { ok: false, error: "Add at least one moment to build a log." };
  }
  const items = args.items;

  if (items.length === 0) {
    return {
      ok: true,
      values: {
        logSummary: "Session is empty — no moments logged yet.",
        topMoments: [],
        exportCsv: `${CSV_HEADER}\n# no moments logged — export is empty`,
      },
    };
  }

  const parsed: ParsedMoment[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (typeof item !== "object" || item === null) return fail(i, "moment must be an object.");
    const result = parseItem(item as Record<string, unknown>, i);
    if ("ok" in result && result.ok === false) return result;
    parsed.push(result as ParsedMoment);
  }

  // Duplicate timestamps: keep both, flag the count in the summary.
  const seen = new Map<number, number>();
  for (const m of parsed) seen.set(m.timestampMs, (seen.get(m.timestampMs) ?? 0) + 1);
  let duplicateGroups = 0;
  let duplicateItems = 0;
  for (const count of seen.values()) {
    if (count > 1) {
      duplicateGroups++;
      duplicateItems += count;
    }
  }

  const maxTs = Math.max(...parsed.map((m) => m.timestampMs));
  const topRated = parsed
    .slice()
    .sort((a, b) => b.rating - a.rating || a.timestampMs - b.timestampMs)
    .slice(0, TOP_MOMENTS_LIMIT);
  const topMoments = topRated.map(
    (m) => `${formatMmSs(m.timestampMs)} — ${m.label} (${m.rating}/5)`
  );

  const lines = [CSV_HEADER];
  for (const m of parsed) {
    lines.push(`${m.timestampMs},${formatMmSs(m.timestampMs)},${csvEscape(m.label)},${m.rating}`);
  }
  const exportCsv = lines.join("\n");

  const sessionBits = [
    `Session log: ${parsed.length} moment${parsed.length === 1 ? "" : "s"}`,
    `span ${formatMmSs(maxTs)}`,
    `top rating ${Math.max(...parsed.map((m) => m.rating))}/5`,
  ];
  if (duplicateGroups > 0) {
    sessionBits.push(
      `${duplicateItems} duplicate timestamp${duplicateItems === 1 ? "" : "s"} flagged (kept in log)`
    );
  }
  sessionBits.push("session-based — export the CSV to keep your log");

  return {
    ok: true,
    values: {
      logSummary: sessionBits.join(" · "),
      topMoments,
      exportCsv,
    },
  };
}
