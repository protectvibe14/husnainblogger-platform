/**
 * Follower Milestone Tracker — pure logic (tool-215), zero imports, zero
 * network, zero DOM.
 *
 * BUILDER TOOL (not a live tracker): the platform's tracker template only
 * supports fixed-item checklist/library modes, not manual-entry logs, so
 * this tool is built as a Builder. Each item is one milestone entry:
 *   { label, targetFollowers, currentFollowers, targetDate? }
 * runTool({ items }) validates every item and returns a progress summary.
 *
 * HONESTY (must surface in UI copy): MANUAL ENTRY ONLY — this tool CANNOT
 * read live Instagram follower counts (no API access). The user types their
 * own numbers; entries persist for this browser session only (the UI offers
 * copy/download to keep records). Percent complete and remaining are simple
 * arithmetic on the entered numbers — never growth predictions.
 *
 * Validation per item:
 *   - label: required, non-empty
 *   - targetFollowers: integer >= 1
 *   - currentFollowers: integer >= 0
 *   - targetDate (optional): must be a real calendar date in YYYY-MM-DD
 * On any invalid item: { ok: false, error: "Item N: ..." }.
 *
 * Outputs: per-milestone lines, overall percent, total remaining, a progress
 * verdict, and the manual-entry notice. Fully deterministic (no clock reads).
 */

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export interface MilestoneItem {
  label: string;
  targetFollowers: number;
  currentFollowers: number;
  targetDate?: string;
}

export const MANUAL_ENTRY_NOTICE =
  "Manual entry only — this tool cannot read your live Instagram follower counts. " +
  "Update your numbers by hand, and use copy/download to keep your records: entries persist " +
  "for this browser session only.";

function parseCount(raw: unknown, field: string, index: number, min: number): number {
  const n = typeof raw === "string" && raw.trim() !== "" ? Number(raw.trim()) : raw;
  if (typeof n !== "number" || Number.isNaN(n) || !Number.isInteger(n) || n < min) {
    throw new Error(
      `Item ${index}: ${field} must be a whole number${min === 0 ? ", 0 or higher" : " of at least 1"}.`
    );
  }
  return n;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
  );
}

/** Insert thousands separators manually (locale-independent, deterministic). */
export function formatInt(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function validateItem(raw: unknown, index: number): MilestoneItem {
  const n = index + 1;
  if (!raw || typeof raw !== "object") {
    throw new Error(`Item ${n}: not an object.`);
  }
  const item = raw as Record<string, unknown>;
  const label = item["label"];
  if (typeof label !== "string" || label.trim().length === 0) {
    throw new Error(`Item ${n}: label is required — name the milestone.`);
  }
  const targetFollowers = parseCount(item["targetFollowers"], "targetFollowers", n, 1);
  const currentFollowers = parseCount(item["currentFollowers"], "currentFollowers", n, 0);

  let targetDate: string | undefined;
  const rawDate = item["targetDate"];
  if (typeof rawDate === "string" && rawDate.trim() !== "") {
    const clean = rawDate.trim();
    if (!isValidDate(clean)) {
      throw new Error(`Item ${n}: targetDate must be a real date in YYYY-MM-DD format.`);
    }
    targetDate = clean;
  }

  return { label: label.trim(), targetFollowers, currentFollowers, targetDate };
}

function itemStatus(percent: number, current: number): string {
  if (percent >= 100) return "Reached — celebrate!";
  if (percent >= 75) return "Almost there";
  if (percent >= 50) return "Over halfway";
  if (current > 0) return "In progress";
  return "Not started";
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Validate items and return the progress summary. Returns
 * { ok: false, error: "Item N: ..." } on the first invalid item.
 */
export function runTool(args: { items: Record<string, unknown>[] }): RunToolResult {
  if (!args || typeof args !== "object" || !Array.isArray(args.items)) {
    return { ok: false, error: "No milestone entries to track." };
  }
  if (args.items.length === 0) {
    return { ok: false, error: "Add at least one milestone entry." };
  }

  let items: MilestoneItem[];
  try {
    items = args.items.map((raw, i) => validateItem(raw, i));
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  const lines: string[] = [];
  let totalTarget = 0;
  let totalCurrent = 0;
  let reached = 0;

  for (const item of items) {
    const percent = round1(Math.min(100, (item.currentFollowers / item.targetFollowers) * 100));
    const remaining = Math.max(0, item.targetFollowers - item.currentFollowers);
    totalTarget += item.targetFollowers;
    totalCurrent += item.currentFollowers;
    if (percent >= 100) reached++;
    const datePart = item.targetDate ? ` · target date ${item.targetDate}` : "";
    lines.push(
      `${item.label}: ${formatInt(item.currentFollowers)}/${formatInt(item.targetFollowers)} ` +
        `(${percent}%) — ${formatInt(remaining)} to go — ${itemStatus(percent, item.currentFollowers)}${datePart}`
    );
  }

  const overallPercent = totalTarget === 0 ? 0 : round1(Math.min(100, (totalCurrent / totalTarget) * 100));
  const totalRemaining = Math.max(0, totalTarget - totalCurrent);

  const verdict =
    reached === items.length
      ? `All ${items.length} milestone${items.length === 1 ? "" : "s"} reached — set your next targets!`
      : overallPercent >= 75
        ? `Almost there: ${reached}/${items.length} milestones reached, ${overallPercent}% of total target.`
        : overallPercent >= 25
          ? `Making progress: ${reached}/${items.length} milestones reached, ${overallPercent}% of total target.`
          : totalCurrent > 0
            ? `Getting started: ${reached}/${items.length} milestones reached, ${overallPercent}% of total target.`
            : `Not started yet: log your current follower counts to begin tracking.`;

  return {
    ok: true,
    values: {
      lines,
      overallPercent,
      totalRemaining,
      verdict,
      notice: MANUAL_ENTRY_NOTICE,
    },
  };
}
