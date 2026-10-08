/**
 * Online Course Pricing Calculator — pure logic (tool-091).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Pure deterministic arithmetic.
 * - The hourly "bands" below are MARKET HEURISTICS, not researched data.
 *   They are deliberately WIDE ranges meant only to bracket a starting
 *   point for the creator's own judgment. The UI must label the result as
 *   a "market heuristic estimate" and never as researched/optimal pricing.
 * - Longer courses scale sub-linearly: hoursFactor = hours^0.85, so the
 *   per-hour rate effectively drops for very long courses (volume discount
 *   heuristic).
 * - Platform fee is grossed up: price / (1 - feeRate), so the creator nets
 *   the band price after the platform takes its cut.
 * - Outputs are rounded to the nearest $10 (wide bands do not justify
 *   dollar precision).
 */

/** Value tier of the niche the course serves. */
export type NicheValue = "low" | "medium" | "high";

/** Primary outcome a student buys when purchasing the course. */
export type StudentOutcome = "skill" | "career" | "business";

export const NICHE_VALUES: ReadonlyArray<NicheValue> = ["low", "medium", "high"];
export const STUDENT_OUTCOMES: ReadonlyArray<StudentOutcome> = ["skill", "career", "business"];

/**
 * Heuristic per-hour price bands [low, high] in USD, keyed by niche value
 * tier x student outcome. THESE ARE INVENTED HEURISTICS for bracketing only:
 * wide on purpose, NOT researched market data, NOT in platform-rules.
 */
export const HOURLY_BANDS: Record<NicheValue, Record<StudentOutcome, [number, number]>> = {
  low: {
    skill: [15, 40],
    career: [20, 60],
    business: [30, 80],
  },
  medium: {
    skill: [25, 60],
    career: [40, 100],
    business: [60, 150],
  },
  high: {
    skill: [40, 100],
    career: [60, 150],
    business: [100, 300],
  },
};

/** Sanity guard: nobody prices a >10,000-hour course. */
export const MAX_COURSE_HOURS = 10000;

/** Exponent for sub-linear hours scaling (volume-discount heuristic). */
export const HOURS_EXPONENT = 0.85;

/** Label the UI must show alongside the price range (honesty contract). */
export const ESTIMATE_LABEL =
  "Market heuristic estimate — wide range for brainstorming only, not researched pricing.";

export interface CoursePricingInput {
  /** Total content hours. Must be a finite number > 0. */
  courseHours: number;
  /** Niche value tier. */
  nicheValue: NicheValue;
  /** Primary student outcome. */
  studentOutcome: StudentOutcome;
  /** Platform fee rate as a percent (0 <= rate < 100). Defaults to 0. */
  platformFeeRate: number;
}

export interface CoursePricingResult {
  /** Low end of the suggested price range (nearest $10). */
  priceLow: number;
  /** High end of the suggested price range (nearest $10). */
  priceHigh: number;
  /** Human-readable band detail, e.g. "$40–$100/hr band x 8h (medium niche, career outcome)". */
  bandDetail: string;
  /** Honesty label that must be shown with the result. */
  estimateLabel: string;
}

/** Round to the nearest $10 (half-up for positive values). */
export function roundToNearestTen(value: number): number {
  return Math.round(value / 10) * 10;
}

/** Sub-linear hours scaling factor (volume-discount heuristic). */
export function hoursFactor(hours: number): number {
  return Math.pow(hours, HOURS_EXPONENT);
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

function readEnum<T extends string>(name: string, value: unknown, allowed: ReadonlyArray<T>): T {
  if (typeof value !== "string" || (allowed as ReadonlyArray<string>).indexOf(value) === -1) {
    throw new TypeError(
      `${name} must be one of ${allowed.join("/")} (got ${String(value)}).`,
    );
  }
  return value as T;
}

/**
 * Compute the suggested course price range from heuristic bands.
 *
 * @param input - courseHours, nicheValue, studentOutcome, platformFeeRate.
 * @returns { ok: true, values } with priceLow/priceHigh/bandDetail/estimateLabel,
 *   or { ok: false, error } with a human-readable message.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  let input: CoursePricingInput;
  try {
    const courseHours = readNumber("courseHours", values["courseHours"]);
    const nicheValue = readEnum("nicheValue", values["nicheValue"], NICHE_VALUES);
    const studentOutcome = readEnum("studentOutcome", values["studentOutcome"], STUDENT_OUTCOMES);
    const rawFee = values["platformFeeRate"];
    const platformFeeRate =
      rawFee === undefined || rawFee === null || rawFee === "" ? 0 : readNumber("platformFeeRate", rawFee);

    if (courseHours <= 0) {
      throw new RangeError(`courseHours must be greater than 0 (got ${courseHours}).`);
    }
    if (courseHours > MAX_COURSE_HOURS) {
      throw new RangeError(
        `courseHours looks unrealistic (${courseHours}); maximum is ${MAX_COURSE_HOURS}.`,
      );
    }
    if (platformFeeRate < 0 || platformFeeRate >= 100) {
      throw new RangeError(
        `platformFeeRate must be between 0 (inclusive) and 100 (exclusive) (got ${platformFeeRate}).`,
      );
    }
    input = { courseHours, nicheValue, studentOutcome, platformFeeRate };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  const [bandLow, bandHigh] = HOURLY_BANDS[input.nicheValue][input.studentOutcome];
  const factor = hoursFactor(input.courseHours);
  const grossUp = 1 / (1 - input.platformFeeRate / 100);

  const priceLow = roundToNearestTen(bandLow * factor * grossUp);
  const priceHigh = roundToNearestTen(bandHigh * factor * grossUp);

  const bandDetail =
    `$${bandLow}–$${bandHigh}/hr heuristic band × ${input.courseHours}h ` +
    `(${input.nicheValue} niche, ${input.studentOutcome} outcome)` +
    (input.platformFeeRate > 0 ? `, grossed up for ${input.platformFeeRate}% platform fee` : "");

  const result: CoursePricingResult = {
    priceLow,
    priceHigh,
    bandDetail,
    estimateLabel: ESTIMATE_LABEL,
  };
  return { ok: true, values: { ...result } };
}
