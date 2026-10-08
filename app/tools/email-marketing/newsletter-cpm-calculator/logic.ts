/**
 * Newsletter CPM Calculator — pure logic (tool-420).
 *
 * HONESTY / ASSUMPTIONS (also surfaced in meta.ts):
 * - Pure arithmetic on USER-SUPPLIED assumptions. The tool has no market
 *   data: no CPM or open-rate defaults are provided anywhere, so no example
 *   value can be mistaken for a market fact. It cannot tell you what CPM
 *   you can charge — it only computes what your own numbers imply.
 * - issuesPerMonth defaults to 4 (a common weekly cadence) and is labeled
 *   as an assumption, not a fact.
 * - Currency values are rounded to 2 decimals; impressions are whole numbers.
 *
 * FORMULAS (published in meta.ts methodology):
 * - impressionsPerIssue = subscribers × openRatePct / 100
 * - revenuePerIssue = impressionsPerIssue / 1000 × cpm
 * - revenuePerMonth = revenuePerIssue × issuesPerMonth
 * - revenuePerSubscriberPerMonth = revenuePerMonth / subscribers
 *   (0 when subscribers is 0 — no division by zero)
 */

export const MAX_SUBSCRIBERS = 100_000_000;
export const MAX_CPM = 100_000;
export const DEFAULT_ISSUES_PER_MONTH = 4;
export const MIN_ISSUES_PER_MONTH = 1;
export const MAX_ISSUES_PER_MONTH = 31;

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please enter your newsletter numbers first." };
  }

  // --- subscribers (required, whole number >= 0) ---
  const rawSubs = values["subscribers"];
  if (typeof rawSubs !== "number" || !Number.isFinite(rawSubs)) {
    return { ok: false, error: "Subscriber count must be a number." };
  }
  if (!Number.isInteger(rawSubs) || rawSubs < 0) {
    return {
      ok: false,
      error: "Subscriber count must be a whole number of 0 or more.",
    };
  }
  if (rawSubs > MAX_SUBSCRIBERS) {
    return {
      ok: false,
      error: `Subscriber count looks unrealistic (max ${MAX_SUBSCRIBERS.toLocaleString("en-US")}).`,
    };
  }
  const subscribers = rawSubs;

  // --- openRatePct (required, 0-100) ---
  const rawOpen = values["openRatePct"];
  if (typeof rawOpen !== "number" || !Number.isFinite(rawOpen)) {
    return { ok: false, error: "Open rate must be a number between 0 and 100." };
  }
  if (rawOpen < 0 || rawOpen > 100) {
    return { ok: false, error: "Open rate must be between 0 and 100." };
  }
  const openRatePct = rawOpen;

  // --- cpm (required, >= 0) ---
  const rawCpm = values["cpm"];
  if (typeof rawCpm !== "number" || !Number.isFinite(rawCpm)) {
    return { ok: false, error: "CPM must be a number." };
  }
  if (rawCpm < 0 || rawCpm > MAX_CPM) {
    return {
      ok: false,
      error: `CPM must be between 0 and ${MAX_CPM.toLocaleString("en-US")}.`,
    };
  }
  const cpm = rawCpm;

  // --- issuesPerMonth (optional, default 4, clamped 1-31) ---
  let issuesPerMonth = DEFAULT_ISSUES_PER_MONTH;
  const rawIssues = values["issuesPerMonth"];
  if (rawIssues !== undefined && rawIssues !== null && rawIssues !== "") {
    if (typeof rawIssues !== "number" || !Number.isFinite(rawIssues)) {
      return { ok: false, error: "Issues per month must be a number." };
    }
    issuesPerMonth = Math.min(
      MAX_ISSUES_PER_MONTH,
      Math.max(MIN_ISSUES_PER_MONTH, Math.floor(rawIssues)),
    );
  }

  // --- formulas ---
  const impressionsPerIssue = Math.round((subscribers * openRatePct) / 100);
  const revenuePerIssue = round2((impressionsPerIssue / 1000) * cpm);
  const revenuePerMonth = round2(revenuePerIssue * issuesPerMonth);
  const revenuePerSubscriberPerMonth =
    subscribers === 0 ? 0 : round2(revenuePerMonth / subscribers);

  return {
    ok: true,
    values: {
      impressionsPerIssue,
      revenuePerIssue,
      revenuePerMonth,
      revenuePerSubscriberPerMonth,
    },
  };
}
