/**
 * Mediavine Earnings Calculator — pure logic (tool-051).
 *
 * FORMULA:
 *   estimatedMonthlyEarnings = monthlySessions * sessionRpm / 1000
 *   earningsRangeLow  = round2(estimatedMonthlyEarnings * 0.6)
 *   earningsRangeHigh = round2(estimatedMonthlyEarnings * 1.6)
 *
 * HONESTY:
 * - Pure math on user inputs. Session RPM is publisher- and niche-dependent;
 *   the default of 25 is a BENCHMARK ESTIMATE (Mediavine typical $15-$40),
 *   user-editable, and every output is labeled an estimate.
 * - RPMs outside the 1-200 sanity band are rejected (flagged as invalid).
 * - Zero sessions -> $0 earnings (valid input, not an error).
 * - Assumes every session serves ads; invalid traffic, ad blockers, and
 *   seasonality are ignored.
 *
 * DETERMINISM: same inputs -> identical outputs (no randomness, no clock).
 * ZERO IMPORTS: no node:, no DOM, no network, no Math.random.
 */

export const DEFAULT_SESSION_RPM = 25;
export const RANGE_LOW_FACTOR = 0.6;
export const RANGE_HIGH_FACTOR = 1.6;
export const MIN_RPM = 1;
export const MAX_RPM = 200;

/**
 * Round to 2 decimals, half-up. (Math.round is half-up for non-negative
 * values; this calculator only handles non-negative money amounts.)
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

export interface MediavineResult {
  [key: string]: unknown;
  estimatedMonthlyEarnings: number;
  earningsRangeLow: number;
  earningsRangeHigh: number;
}

/**
 * runTool({ monthlySessions, sessionRpm? })
 *
 * monthlySessions: required, finite number >= 0 (0 -> $0 earnings).
 * sessionRpm: optional, default 25 (benchmark estimate, user-editable);
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

  const rawSessions = values["monthlySessions"];
  if (typeof rawSessions !== "number" || Number.isNaN(rawSessions)) {
    return fail("Monthly sessions must be a number (e.g. 50000).");
  }
  if (!Number.isFinite(rawSessions)) {
    return fail("Monthly sessions must be finite — Infinity is not a valid count.");
  }
  if (rawSessions < 0) {
    return fail("Monthly sessions cannot be negative.");
  }

  const rawRpm = values["sessionRpm"];
  let rpm: number;
  if (rawRpm === undefined || rawRpm === null || rawRpm === "") {
    rpm = DEFAULT_SESSION_RPM;
  } else {
    if (typeof rawRpm !== "number" || Number.isNaN(rawRpm) || !Number.isFinite(rawRpm)) {
      return fail("Session RPM must be a finite number (e.g. 25).");
    }
    if (rawRpm < MIN_RPM || rawRpm > MAX_RPM) {
      return fail(
        `Session RPM of ${rawRpm} is outside the sanity band of ${MIN_RPM}-${MAX_RPM} — ` +
          "that looks like a typo or a different unit (page RPM vs session RPM). " +
          `The default benchmark estimate is ${DEFAULT_SESSION_RPM}.`,
      );
    }
    rpm = rawRpm;
  }

  const estimatedMonthlyEarnings = round2((rawSessions * rpm) / 1000);
  const result: MediavineResult = {
    estimatedMonthlyEarnings,
    earningsRangeLow: round2(estimatedMonthlyEarnings * RANGE_LOW_FACTOR),
    earningsRangeHigh: round2(estimatedMonthlyEarnings * RANGE_HIGH_FACTOR),
  };

  return { ok: true, values: result };
}
