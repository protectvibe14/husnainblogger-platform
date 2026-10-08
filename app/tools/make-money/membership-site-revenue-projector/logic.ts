/**
 * Membership Site Revenue Projector — pure logic (tool-088).
 *
 * Pure TypeScript: zero imports, zero network, zero DOM, zero randomness.
 * Deterministic: identical inputs always produce identical outputs.
 *
 * FORMULA (spec data/formulas/formulas-B.json :: tool-088) — cohort model
 * with COMPOUNDING churn (the projection shows decay, never a flat line):
 *   new_t            = monthly_visitors * conversion_rate
 *   members_t        = members_{t-1} * (1 - churn_rate) + new_t
 *   mrr_t            = members_t * monthly_price
 *   projected_members   = members at the final month (integer)
 *   projected_mrr       = mrr at the final month
 *   annual_projection   = sum(mrr_1 .. mrr_months)
 *
 * HONESTY (non-negotiable):
 * - These are PROJECTIONS, not predictions. They are scenario math on
 *   user-entered assumptions (conversion and churn are guesses, not
 *   forecasts). Real memberships fluctuate with seasonality, promos, and
 *   pricing changes this model cannot see.
 * - Churn compounds: every month the retained cohort shrinks by churn_rate,
 *   so growth decelerates toward a ceiling instead of rising forever.
 * - At 100% churn there are no retained members — each month's total is just
 *   that month's new signups (no compounding benefit at all).
 * - No external data: every input is user-provided.
 *
 * Rounding: money half-up to 2 decimals (USD); members to whole integers.
 * Horizon cap: 120 months (sanity guard).
 */

export const MAX_MONTHS = 120;

export interface MembershipProjectionInput {
  /** Monthly visitors. Number > 0. */
  monthlyVisitors: number;
  /** Visitor-to-member conversion, percent 0–100. */
  conversionRate: number;
  /** Membership price per month in USD. Number > 0. */
  monthlyPrice: number;
  /** Monthly churn, percent 0–100. */
  churnRate: number;
  /** Projection horizon in months. Integer 1–120. */
  months: number;
}

export interface MonthlyRow {
  month: number;
  /** New signups this month (rounded to whole members). */
  newMembers: number;
  /** Total members at end of month (rounded to whole members). */
  totalMembers: number;
  /** MRR at end of month, USD rounded to cents. */
  mrr: number;
}

export interface MembershipProjectionResult {
  /** MRR at the final projected month (USD). */
  projectedMRR: number;
  /** Members at the final projected month (integer). */
  projectedMembers: number;
  /** Sum of monthly MRR over the horizon (USD). */
  annualProjection: number;
  /** Per-month funnel rows. */
  monthlyTable: MonthlyRow[];
}

/**
 * Round to the nearest cent, half-up. Math.round is half-up for positive
 * values; negative values round half away from zero (documented, acceptable —
 * money inputs here are never negative).
 */
export function roundToCents(value: number): number {
  // + 0 normalizes -0 to +0 so strict equality holds in tests.
  return Math.round(value * 100) / 100 + 0;
}

/**
 * Coerce a raw value to a finite number.
 * @throws {Error} with a human message when the value is missing/not numeric.
 */
function toNumber(label: string, value: unknown): number {
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  if (typeof value === "number" && Number.isFinite(value)) return value;
  throw new Error(`${label} must be a number.`);
}

/**
 * Validate a percent input (0–100 inclusive).
 * @throws {Error} with a human message when out of range.
 */
function toPercent(label: string, value: unknown): number {
  const n = toNumber(label, value);
  if (n < 0 || n > 100) {
    throw new Error(`${label} must be between 0 and 100.`);
  }
  return n;
}

/**
 * Core calculation. Throws {Error} with a human message on invalid input.
 */
export function calculateMembershipProjection(
  input: MembershipProjectionInput,
): MembershipProjectionResult {
  if (!input || typeof input !== "object") {
    throw new Error("Enter your membership numbers to run the projection.");
  }

  const monthlyVisitors = toNumber("Monthly visitors", input.monthlyVisitors);
  if (monthlyVisitors <= 0) {
    throw new Error("Monthly visitors must be greater than 0.");
  }

  const conversionRate = toPercent("Conversion rate", input.conversionRate);
  const monthlyPrice = toNumber("Monthly price", input.monthlyPrice);
  if (monthlyPrice <= 0) {
    throw new Error("Monthly price must be greater than 0 USD.");
  }
  const churnRate = toPercent("Churn rate", input.churnRate);
  const months = toNumber("Projection months", input.months);
  if (!Number.isInteger(months) || months < 1) {
    throw new Error("Projection months must be a whole number of at least 1.");
  }
  if (months > MAX_MONTHS) {
    throw new Error(`Projection months cannot exceed ${MAX_MONTHS}.`);
  }

  const newPerMonth = monthlyVisitors * (conversionRate / 100);
  const retention = 1 - churnRate / 100;

  const monthlyTable: MonthlyRow[] = [];
  let members = 0;
  let annualProjection = 0;

  for (let m = 1; m <= months; m++) {
    members = members * retention + newPerMonth;
    const mrr = members * monthlyPrice;
    const row: MonthlyRow = {
      month: m,
      newMembers: Math.round(newPerMonth),
      totalMembers: Math.round(members),
      mrr: roundToCents(mrr),
    };
    monthlyTable.push(row);
    annualProjection = roundToCents(annualProjection + row.mrr);
  }

  return {
    projectedMRR: monthlyTable[monthlyTable.length - 1].mrr,
    projectedMembers: monthlyTable[monthlyTable.length - 1].totalMembers,
    annualProjection,
    monthlyTable,
  };
}

/**
 * Contract adapter: runTool({ monthlyVisitors, conversionRate, monthlyPrice,
 * churnRate, months }) -> { ok, values?, error? }. Never throws.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  try {
    if (!values || typeof values !== "object") {
      return { ok: false, error: "Enter your membership numbers to run the projection." };
    }
    const result = calculateMembershipProjection({
      monthlyVisitors: values.monthlyVisitors as number,
      conversionRate: values.conversionRate as number,
      monthlyPrice: values.monthlyPrice as number,
      churnRate: values.churnRate as number,
      months: values.months as number,
    });
    return {
      ok: true,
      values: {
        projectedMRR: result.projectedMRR,
        projectedMembers: result.projectedMembers,
        annualProjection: result.annualProjection,
        monthlyTable: result.monthlyTable,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invalid input." };
  }
}
