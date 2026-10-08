/**
 * Freelance Day Rate Calculator — pure logic (tool-452).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Plain arithmetic only.
 * - Every input is USER-PROVIDED. There is no market-rate data involved, so
 *   there is no platform-rules source to cite; the output reflects the user's
 *   own targets and costs, not what the market will pay (stated in
 *   assumptions[]).
 * - dayRate = (annualTargetIncome + annualExpenses) * (1 + taxBufferPct/100)
 *   / billableDaysPerYear.
 * - halfDayRate = dayRate / 2 (common convention, documented).
 * - hourlyEquivalent = dayRate / hoursPerDay, defaulting to an 8-hour day
 *   (documented convention, adjustable via input).
 * - Money values round to the nearest cent (half-up).
 */

export const DEFAULT_HOURS_PER_DAY = 8;

/**
 * Input for the day-rate calculation.
 */
export interface DayRateInput {
  /** Annual take-home target (pre-tax income goal). Must be > 0. */
  annualTargetIncome: number;
  /** Billable days per year (after holidays, admin, marketing). Must be > 0. */
  billableDaysPerYear: number;
  /** Annual business expenses (tools, insurance, …). >= 0. Defaults to 0. */
  annualExpenses?: number;
  /** Tax buffer percentage set aside (0–100). Defaults to 0. */
  taxBufferPct?: number;
  /** Hours in a billable day (for the hourly equivalent). > 0. Defaults to 8. */
  hoursPerDay?: number;
}

/**
 * Result of the day-rate calculation.
 */
export interface DayRateResult {
  /** Recommended day rate, rounded to cents. */
  dayRate: number;
  /** Half-day rate (dayRate / 2), rounded to cents. */
  halfDayRate: number;
  /** Hourly equivalent (dayRate / hoursPerDay), rounded to cents. */
  hourlyEquivalent: number;
  /** Hours-per-day value used for the hourly equivalent. */
  hoursPerDay: number;
  /** Annual revenue needed: (income + expenses) * (1 + taxBuffer). */
  annualRevenueTarget: number;
  /** Assumption/estimate notes surfaced to the UI. */
  assumptions: string[];
}

/** Round to the nearest cent, half-up. */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function assertFiniteNumber(name: string, value: unknown): asserts value is number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new TypeError(`${name} must be a number (got ${String(value)}).`);
  }
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be finite (got ${String(value)}).`);
  }
}

/**
 * Calculate a freelance day rate from the user's own targets and costs.
 *
 * @param input - annualTargetIncome, billableDaysPerYear, annualExpenses,
 *   taxBufferPct, hoursPerDay.
 * @returns Day rate, half-day rate, hourly equivalent, and assumptions.
 * @throws {TypeError} for non-numeric / non-finite inputs or non-object input.
 * @throws {RangeError} for annualTargetIncome <= 0, billableDaysPerYear <= 0,
 *   negative expenses, taxBufferPct outside 0–100, or hoursPerDay <= 0.
 */
export function calculateDayRate(input: DayRateInput): DayRateResult {
  if (!input || typeof input !== "object") {
    throw new TypeError("Input must be an object.");
  }

  const income = input.annualTargetIncome;
  const days = input.billableDaysPerYear;
  const expenses = input.annualExpenses ?? 0;
  const taxPct = input.taxBufferPct ?? 0;
  const hoursPerDay = input.hoursPerDay ?? DEFAULT_HOURS_PER_DAY;

  assertFiniteNumber("annualTargetIncome", income);
  assertFiniteNumber("billableDaysPerYear", days);
  assertFiniteNumber("annualExpenses", expenses);
  assertFiniteNumber("taxBufferPct", taxPct);
  assertFiniteNumber("hoursPerDay", hoursPerDay);

  if (income <= 0) {
    throw new RangeError("annualTargetIncome must be greater than 0.");
  }
  if (days <= 0) {
    throw new RangeError("billableDaysPerYear must be greater than 0.");
  }
  if (expenses < 0) {
    throw new RangeError("annualExpenses must be >= 0.");
  }
  if (taxPct < 0 || taxPct > 100) {
    throw new RangeError("taxBufferPct must be between 0 and 100.");
  }
  if (hoursPerDay <= 0) {
    throw new RangeError("hoursPerDay must be greater than 0.");
  }

  const annualRevenueTarget = roundToCents((income + expenses) * (1 + taxPct / 100));
  const dayRate = roundToCents(annualRevenueTarget / days);
  const halfDayRate = roundToCents(dayRate / 2);
  const hourlyEquivalent = roundToCents(dayRate / hoursPerDay);

  const assumptions: string[] = [
    "Based entirely on YOUR inputs — this is not market data and does not say what clients will pay.",
    `Half-day rate uses the common dayRate / 2 convention (some freelancers charge 60% instead — adjust to taste).`,
    `Hourly equivalent assumes a ${hoursPerDay}-hour billable day.`,
    "Unpaid time (admin, marketing, holidays) is only covered if you excluded it from billableDaysPerYear.",
    "ESTIMATE: a planning starting point, not a pricing guarantee.",
  ];

  return {
    dayRate,
    halfDayRate,
    hourlyEquivalent,
    hoursPerDay,
    annualRevenueTarget,
    assumptions,
  };
}

/**
 * Tool-logic-slot adapter for tool-452.
 *
 * Maps the page's flat inputs — annualIncomeTarget, annualBusinessExpenses,
 * workingDaysPerYear (default 260), nonBillableDays (default 0), hoursPerDay
 * (default 8) — onto calculateDayRate(), where
 * billableDaysPerYear = workingDaysPerYear - nonBillableDays. No tax buffer
 * is applied (the spec formula J-DAY-RATE uses income + expenses only).
 *
 * Output keys: dayRate, halfDayRate, hourlyRate, billableDays, assumptions.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  try {
    const income = values.annualIncomeTarget;
    const expenses = values.annualBusinessExpenses ?? 0;
    const working = values.workingDaysPerYear ?? 260;
    const nonBillable = values.nonBillableDays ?? 0;
    const hours = values.hoursPerDay ?? DEFAULT_HOURS_PER_DAY;

    assertFiniteNumber("annualIncomeTarget", income);
    if (income <= 0) {
      throw new RangeError("annualIncomeTarget must be greater than 0.");
    }
    assertFiniteNumber("annualBusinessExpenses", expenses);
    if (expenses < 0) {
      throw new RangeError("annualBusinessExpenses must be >= 0.");
    }
    assertFiniteNumber("workingDaysPerYear", working);
    if (working <= 0) {
      throw new RangeError("workingDaysPerYear must be greater than 0.");
    }
    assertFiniteNumber("nonBillableDays", nonBillable);
    if (nonBillable < 0) {
      throw new RangeError("nonBillableDays must be >= 0.");
    }
    assertFiniteNumber("hoursPerDay", hours);
    if (hours <= 0) {
      throw new RangeError("hoursPerDay must be greater than 0.");
    }
    const billableDays = working - nonBillable;
    if (billableDays <= 0) {
      throw new RangeError(
        `nonBillableDays (${nonBillable}) must be less than workingDaysPerYear ` +
          `(${working}) so you have at least one billable day.`,
      );
    }

    const result = calculateDayRate({
      annualTargetIncome: income,
      billableDaysPerYear: billableDays,
      annualExpenses: expenses,
      hoursPerDay: hours,
    });

    const assumptions = result.assumptions.slice();
    if (expenses === 0) {
      assumptions.unshift(
        "Business expenses were entered as 0 — this rate covers your income target only.",
      );
    }

    return {
      ok: true,
      values: {
        dayRate: result.dayRate,
        halfDayRate: result.halfDayRate,
        hourlyRate: result.hourlyEquivalent,
        billableDays,
        assumptions,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invalid input." };
  }
}
