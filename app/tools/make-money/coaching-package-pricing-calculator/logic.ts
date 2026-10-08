/**
 * Coaching Package Pricing Calculator — pure logic (tool-094).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Pure deterministic arithmetic.
 * - This is cost-plus-margin math on the USER'S OWN rates (hourly value,
 *   package discount, support valuation). Nothing here is researched market
 *   data, and the discount-vs-1:1 comparison is user-set, not a market
 *   benchmark. The UI must not present the result as "the correct price".
 * - Because there is no market data behind it, the tool also outputs a
 *   ±20% SENSITIVITY RANGE around the computed price, labeled as such —
 *   an illustration of how sensitive the price is to your own inputs, not
 *   a market band.
 * - Support hours are valued at a user-set fraction (supportRate %) of the
 *   coaching hourly value. Package discount is applied to the whole bundle.
 * - All money rounds half-up to 2 decimals.
 */

/** How far the sensitivity band extends around the computed price. */
export const SENSITIVITY_BAND = 0.2;

export interface CoachingPricingInput {
  /** Number of 1:1 sessions in the package. Integer > 0. */
  sessionsPerPackage: number;
  /** Length of each session in minutes. > 0. */
  sessionLengthMin: number;
  /** The coach's hourly value in USD. > 0. */
  hourlyValue: number;
  /** Program duration in weeks. Integer > 0. */
  programWeeks: number;
  /** Between-session support hours included. >= 0. Parser defaults to 0. */
  supportHours: number;
  /** Package discount vs the 1:1 rate, percent 0-100 (USER-SET, not researched). Parser defaults to 0. */
  packageDiscount: number;
  /** Support valued at this % of the hourly value, 0-100. Parser defaults to 50. */
  supportRate: number;
}

export interface CoachingPricingResult {
  /** Total package price (USD, 2 decimals). */
  packagePrice: number;
  /** Effective price per session (USD, 2 decimals). */
  pricePerSession: number;
  /** Effective hourly rate across coaching + support hours (USD, 2 decimals). */
  effectiveHourly: number;
  /** Low end of the ±20% sensitivity range (NOT a market band). */
  priceRangeLow: number;
  /** High end of the ±20% sensitivity range (NOT a market band). */
  priceRangeHigh: number;
  /** Honesty label that must be shown with the result. */
  honestyLabel: string;
}

/** Label the UI must show alongside the result (honesty contract). */
export const HONESTY_LABEL =
  "Computed from YOUR rates only — package discount and support valuation are user-set, not researched. The ±20% range is a sensitivity illustration, not a market band.";

/** Round to 2 decimals, half-up (values here are non-negative). */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function readNumber(name: string, value: unknown): number {
  const n = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (typeof n !== "number" || Number.isNaN(n)) {
    throw new TypeError(`${name} must be a number (got ${String(value)}).`);
  }
  if (!Number.isFinite(n)) {
    throw new TypeError(`${name} must be finite (got ${String(value)}).`);
  }
  return n;
}

function readOptional(name: string, value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === "") return fallback;
  return readNumber(name, value);
}

/**
 * Price a coaching package from the coach's own rates.
 *
 * @param values - sessionsPerPackage, sessionLengthMin, hourlyValue,
 *   programWeeks, supportHours, packageDiscount, supportRate.
 * @returns { ok: true, values } or { ok: false, error } with a human message.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  let input: CoachingPricingInput;
  try {
    const sessionsPerPackage = readNumber("sessionsPerPackage", values["sessionsPerPackage"]);
    const sessionLengthMin = readNumber("sessionLengthMin", values["sessionLengthMin"]);
    const hourlyValue = readNumber("hourlyValue", values["hourlyValue"]);
    const programWeeks = readNumber("programWeeks", values["programWeeks"]);
    const supportHours = readOptional("supportHours", values["supportHours"], 0);
    const packageDiscount = readOptional("packageDiscount", values["packageDiscount"], 0);
    const supportRate = readOptional("supportRate", values["supportRate"], 50);

    if (!Number.isInteger(sessionsPerPackage) || sessionsPerPackage <= 0) {
      throw new RangeError(`sessionsPerPackage must be a positive integer (got ${sessionsPerPackage}).`);
    }
    if (sessionLengthMin <= 0) {
      throw new RangeError(`sessionLengthMin must be greater than 0 (got ${sessionLengthMin}).`);
    }
    if (hourlyValue <= 0) {
      throw new RangeError(`hourlyValue must be greater than 0 (got ${hourlyValue}).`);
    }
    if (!Number.isInteger(programWeeks) || programWeeks <= 0) {
      throw new RangeError(`programWeeks must be a positive integer (got ${programWeeks}).`);
    }
    if (supportHours < 0) {
      throw new RangeError(`supportHours must be >= 0 (got ${supportHours}).`);
    }
    if (packageDiscount < 0 || packageDiscount > 100) {
      throw new RangeError(`packageDiscount must be between 0 and 100 (got ${packageDiscount}).`);
    }
    if (supportRate < 0 || supportRate > 100) {
      throw new RangeError(`supportRate must be between 0 and 100 (got ${supportRate}).`);
    }
    input = {
      sessionsPerPackage,
      sessionLengthMin,
      hourlyValue,
      programWeeks,
      supportHours,
      packageDiscount,
      supportRate,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  const coachingHours = (input.sessionsPerPackage * input.sessionLengthMin) / 60;
  const supportValue = input.supportHours * input.hourlyValue * (input.supportRate / 100);
  const totalHours = coachingHours + input.supportHours;

  const packagePrice = round2(
    (coachingHours * input.hourlyValue + supportValue) * (1 - input.packageDiscount / 100),
  );
  const pricePerSession = round2(packagePrice / input.sessionsPerPackage);
  const effectiveHourly = round2(packagePrice / totalHours);
  const priceRangeLow = round2(packagePrice * (1 - SENSITIVITY_BAND));
  const priceRangeHigh = round2(packagePrice * (1 + SENSITIVITY_BAND));

  const result: CoachingPricingResult = {
    packagePrice,
    pricePerSession,
    effectiveHourly,
    priceRangeLow,
    priceRangeHigh,
    honestyLabel: HONESTY_LABEL,
  };
  return { ok: true, values: { ...result } };
}
