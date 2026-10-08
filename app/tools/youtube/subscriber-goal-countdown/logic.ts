/**
 * Subscriber Goal Countdown — pure logic (tool-116).
 *
 * Linear projection from a user-supplied daily growth rate: estimated days
 * to a subscriber target, the estimated target date, and the required daily
 * rate to hit a chosen date. Optional conservative/optimistic what-if bands.
 *
 * ASSUMPTIONS (documented for honesty):
 * - Zero imports, no DOM, no network, no Date.now(), no Math.random.
 *   Deterministic: same inputs -> same outputs.
 * - The LINEAR model (gap / daily rate) is an ESTIMATE — growth is not
 *   linear in reality. Every output is labeled a projection, never a promise.
 * - Subscriber counts are entered MANUALLY. This tool cannot read live
 *   YouTube subscriber counts (no API).
 * - `today` is an explicit input (the UI layer passes the current date), so
 *   the target-date math stays deterministic. Dates use UTC date-only math
 *   (timezone-safe).
 * - SCENARIO_FACTORS are fixed what-if multipliers on the user's own rate:
 *   conservative 0.7x, expected 1.0x, optimistic 1.3x. They model pace
 *   scenarios, not predictions.
 * - daysToTarget rounds UP (ceil) — you reach the goal on or before that day
 *   only if the rate holds every single day.
 */

/** Fixed what-if multipliers on the user's growth rate (documented, not predictions). */
export const SCENARIO_FACTORS = {
  conservative: 0.7,
  expected: 1.0,
  optimistic: 1.3,
} as const;

export type GrowthScenario = keyof typeof SCENARIO_FACTORS;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86400000;

/** Real-calendar ISO date check. Returns UTC ms or null. */
export function parseDateUTC(s: string): number | null {
  if (typeof s !== "string" || !ISO_DATE.test(s)) return null;
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(5, 7));
  const d = Number(s.slice(8, 10));
  const t = Date.UTC(y, m - 1, d);
  const c = new Date(t);
  if (c.getUTCFullYear() !== y || c.getUTCMonth() !== m - 1 || c.getUTCDate() !== d) return null;
  return t;
}

/** Add n days to an ISO date (UTC date-only math). */
export function addDaysUTC(dateStr: string, days: number): string {
  return new Date((parseDateUTC(dateStr) as number) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Whole days from a to b (b - a). */
export function diffDaysUTC(a: string, b: string): number {
  return Math.round(((parseDateUTC(b) as number) - (parseDateUTC(a) as number)) / DAY_MS);
}

function asNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export interface CountdownResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Project the road to a subscriber goal.
 * values: { currentSubs, targetSubs, growthRate, today, scenario?, chosenDate? }
 */
export function runTool(values: Record<string, unknown>): CountdownResult {
  if (!values || typeof values !== "object") return { ok: false, error: "No inputs were provided." };

  const current = asNumber(values["currentSubs"]);
  if (current === null || !Number.isInteger(current) || current < 0) {
    return { ok: false, error: "Current subscribers must be a whole number (0 or more)." };
  }

  const target = asNumber(values["targetSubs"]);
  if (target === null || !Number.isInteger(target) || target <= 0) {
    return { ok: false, error: "Target subscribers must be a whole number greater than 0." };
  }
  if (target <= current) {
    return { ok: false, error: "Target subscribers must be greater than current subscribers." };
  }

  const rate = asNumber(values["growthRate"]);
  if (rate === null || rate <= 0) {
    return {
      ok: false,
      error: "Growth rate must be greater than 0 subscribers per day — with no growth, the goal has no date.",
    };
  }

  const todayRaw = values["today"];
  if (typeof todayRaw !== "string" || parseDateUTC(todayRaw) === null) {
    return { ok: false, error: "Start date must be a valid calendar date (YYYY-MM-DD) — usually today." };
  }
  const today = todayRaw;

  const scenarioRaw = values["scenario"];
  const scenario: GrowthScenario =
    scenarioRaw === undefined || scenarioRaw === null || scenarioRaw === "" ? "expected" : (scenarioRaw as GrowthScenario);
  if (!(scenario in SCENARIO_FACTORS)) {
    return { ok: false, error: 'Scenario must be "conservative", "expected", or "optimistic".' };
  }

  const gap = target - current;
  const effectiveRate = rate * SCENARIO_FACTORS[scenario];
  const daysToTarget = Math.ceil(gap / effectiveRate);
  const estTargetDate = addDaysUTC(today, daysToTarget);
  const progressPercent = Math.round((current / target) * 1000) / 10;

  let requiredDailyRate: number | null = null;
  const chosenRaw = values["chosenDate"];
  if (typeof chosenRaw === "string" && chosenRaw.trim() !== "") {
    const chosen = chosenRaw.trim();
    if (parseDateUTC(chosen) === null) {
      return { ok: false, error: "Chosen date must be a valid calendar date (YYYY-MM-DD)." };
    }
    const daysLeft = diffDaysUTC(today, chosen);
    if (daysLeft <= 0) {
      return { ok: false, error: "Chosen date must be after the start date." };
    }
    requiredDailyRate = Math.ceil(gap / daysLeft);
  }

  const summary =
    `From ${current.toLocaleString("en-US")} subscribers, +${rate}/day (${scenario} scenario) ` +
    `reaches ${target.toLocaleString("en-US")} in ~${daysToTarget} days — around ${estTargetDate}. Projection, not a promise.`;

  return {
    ok: true,
    values: {
      daysToTarget,
      estTargetDate,
      progressPercent,
      requiredDailyRate,
      summary,
      guidance: [
        "Projection, not a promise: real growth is rarely linear — algorithm changes, viral spikes and slow weeks all move the date.",
        `The ${scenario} scenario multiplies your own daily rate by ${SCENARIO_FACTORS[scenario]}x as a fixed what-if — it is not a prediction.`,
        "Subscriber counts are entered manually — this tool cannot read your live YouTube subscriber count (no API).",
        "Days are rounded up: the goal is reached on or before the estimated date only if the rate holds every single day.",
      ],
    },
  };
}
