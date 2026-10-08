/**
 * Raptive Revenue Estimator — pure logic (tool-052).
 *
 * FORMULA:
 *   estimatedMonthlyEarnings = monthlyPageviews * pageRpm / 1000
 *   earningsRangeLow  = round2(estimatedMonthlyEarnings * 0.6)
 *   earningsRangeHigh = round2(estimatedMonthlyEarnings * 1.6)
 *
 * HONESTY:
 * - Pure math on user inputs. Page RPM is niche- and geography-dependent;
 *   the default of 30 is a BENCHMARK ESTIMATE (Raptive typical $20-$50),
 *   user-editable, and every output is labeled an estimate.
 * - RPMs outside the 1-200 sanity band are rejected (flagged as invalid).
 * - Zero pageviews -> $0 earnings (valid input, not an error).
 * - Raptive requires roughly 100,000 monthly pageviews for eligibility:
 *   below that, an eligibility warning is returned alongside the numbers.
 *
 * DETERMINISM: same inputs -> identical outputs (no randomness, no clock).
 * ZERO IMPORTS: no node:, no DOM, no network, no Math.random.
 */

export const DEFAULT_PAGE_RPM = 30;
export const RANGE_LOW_FACTOR = 0.6;
export const RANGE_HIGH_FACTOR = 1.6;
export const MIN_RPM = 1;
export const MAX_RPM = 200;
/** Raptive's published minimum-traffic eligibility threshold (pageviews/month). */
export const RAPTIVE_ELIGIBILITY_THRESHOLD = 100000;

/**
 * Round to 2 decimals, half-up. (Math.round is half-up for non-negative
 * values; this estimator only handles non-negative money amounts.)
 */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function isPlainRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

export interface RaptiveResult {
  [key: string]: unknown;
  estimatedMonthlyEarnings: number;
  earningsRangeLow: number;
  earningsRangeHigh: number;
  /** Empty string when eligible; warning text below 100k pageviews. */
  eligibilityWarning: string;
}

/**
 * runTool({ monthlyPageviews, pageRpm? })
 *
 * monthlyPageviews: required, finite number >= 0 (0 -> $0 earnings).
 * pageRpm: optional, default 30 (benchmark estimate, user-editable);
 *   must be within the 1-200 sanity band.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!isPlainRecord(values)) {
    return fail("Input must be an object with your values.");
  }

  const rawPageviews = values["monthlyPageviews"];
  if (typeof rawPageviews !== "number" || Number.isNaN(rawPageviews)) {
    return fail("Monthly pageviews must be a number (e.g. 120000).");
  }
  if (!Number.isFinite(rawPageviews)) {
    return fail("Monthly pageviews must be finite — Infinity is not a valid count.");
  }
  if (rawPageviews < 0) {
    return fail("Monthly pageviews cannot be negative.");
  }

  const rawRpm = values["pageRpm"];
  let rpm: number;
  if (rawRpm === undefined || rawRpm === null || rawRpm === "") {
    rpm = DEFAULT_PAGE_RPM;
  } else {
    if (typeof rawRpm !== "number" || Number.isNaN(rawRpm) || !Number.isFinite(rawRpm)) {
      return fail("Page RPM must be a finite number (e.g. 30).");
    }
    if (rawRpm < MIN_RPM || rawRpm > MAX_RPM) {
      return fail(
        `Page RPM of ${rawRpm} is outside the sanity band of ${MIN_RPM}-${MAX_RPM} — ` +
          "that looks like a typo or a different unit (session RPM vs page RPM). " +
          `The default benchmark estimate is ${DEFAULT_PAGE_RPM}.`,
      );
    }
    rpm = rawRpm;
  }

  const estimatedMonthlyEarnings = round2((rawPageviews * rpm) / 1000);
  const result: RaptiveResult = {
    estimatedMonthlyEarnings,
    earningsRangeLow: round2(estimatedMonthlyEarnings * RANGE_LOW_FACTOR),
    earningsRangeHigh: round2(estimatedMonthlyEarnings * RANGE_HIGH_FACTOR),
    eligibilityWarning:
      rawPageviews < RAPTIVE_ELIGIBILITY_THRESHOLD
        ? `Heads up: Raptive generally requires around ${RAPTIVE_ELIGIBILITY_THRESHOLD.toLocaleString("en-US")} monthly pageviews to qualify, and you entered ${Math.floor(rawPageviews).toLocaleString("en-US")}. The numbers above are still an estimate, but you may not be eligible to apply yet.`
        : "",
  };

  return { ok: true, values: result };
}
