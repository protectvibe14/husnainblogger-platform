/**
 * SaaS Affiliate Recurring Revenue Calculator — pure logic (tool-097).
 *
 * Zero imports, zero network, zero DOM. Deterministic: same inputs → same
 * outputs. Pure math driven ENTIRELY by user-supplied inputs.
 *
 * ## HONESTY CONTRACT (also surfaced in meta.ts assumptions + UI disclaimer)
 * 1. The commission rate, churn rate, referral volume, plan price, and
 *    recurring duration are ALL user-entered. This tool contains NO
 *    program-specific data and fetches nothing.
 * 2. Software affiliate rates of 15–30% are a CLASSIFICATION-LEVEL estimate
 *    (typical range, 2026) — per-program terms vary widely (some pay
 *    one-time, some cap recurring months, some pay on annual plans only).
 *    The default rate in the UI is user-editable and the result is only as
 *    correct as the numbers the user enters.
 * 3. The model assumes a constant stream of new referrals, smooth monthly
 *    churn decay per cohort, and no seasonality, upgrades, downgrades,
 *    refunds, or plan changes. All outputs are ESTIMATES.
 *
 * ## Model (cohort stream, from spec formula)
 *   cohort_commission(t) = R * P * r * (1 - c)^t        for t = 0 .. cap-1
 *     R = referrals_per_month, P = avg_plan_price,
 *     r = commission_rate/100, c = churn_rate/100,
 *     cap = recurring_months (program lifetime cap on recurring payouts)
 *   A new cohort of R referrals is added every month. For modeled month m
 *   (1-based), the active cohorts are ages t = 0 .. min(m-1, cap-1):
 *     commission(m) = B * Σ_{t=0}^{min(m-1, cap-1)} (1 - c)^t,  B = R*P*r
 *   Horizon H = max(12, recurring_months) months is modeled.
 *   monthly_recurring_commission = commission(H)  — stacked monthly figure
 *     once the model has run its full horizon (labeled estimate).
 *   total_commission   = Σ_{m=1}^{recurring_months} commission(m)
 *   projected_annual   = Σ_{m=1}^{12} commission(m)
 * Rounding: half-up to 2 decimals (USD).
 */

/** Sanity guards to reject absurd-but-finite inputs. */
export const MAX_REFERRALS_PER_MONTH = 1e9;
export const MAX_PLAN_PRICE = 1e9;
export const MAX_RECURRING_MONTHS = 240; // 20 years — beyond this is fantasy
export const ANNUAL_HORIZON_MONTHS = 12;

export const DISCLAIMER_TEXT =
  "Estimate only. Every number here comes from YOUR inputs — commission rate, " +
  "churn, referrals, plan price, and recurring duration all vary per program. " +
  "Software affiliate rates of 15–30% are a typical range (2026), not a " +
  "promise: verify the actual terms of the program you are promoting. The " +
  "model assumes constant referrals and smooth churn, with no seasonality, " +
  "refunds, upgrades, or plan changes.";

export interface SaasAffiliateInput {
  /** New referrals per month. Integer > 0. */
  referralsPerMonth: number;
  /** Average plan price in USD. Finite number > 0. */
  avgPlanPrice: number;
  /** Affiliate commission rate in percent, 0–100. User-supplied. */
  commissionRate: number;
  /** Recurring commission duration in months (program cap). Integer > 0. */
  recurringMonths: number;
  /** Monthly churn of referred customers in percent, 0–100. */
  churnRate: number;
}

export interface SaasAffiliateResult {
  /** Stacked monthly commission at the end of the modeled horizon (USD). */
  monthlyRecurringCommission: number;
  /** Total commission over the recurring-months window (USD). */
  totalCommission: number;
  /** Projected commission over the first 12 months (USD). */
  projectedAnnual: number;
  /** Honesty disclaimer surfaced by the UI. */
  disclaimer: string;
}

/** Round half-up to 2 decimals (inputs to this tool are non-negative). */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function assertFiniteNumber(name: string, value: unknown): asserts value is number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new TypeError(`${name} must be a number.`);
  }
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number.`);
  }
}

/**
 * Monthly commission for modeled month m (1-based) of the cohort stream.
 * Closed-form geometric sum; q = 1 - churn.
 */
function commissionForMonth(
  month: number,
  base: number,
  churnFraction: number,
  cap: number,
): number {
  const n = Math.min(month, cap); // active cohort count
  const q = 1 - churnFraction;
  if (q <= 0) return base; // 100% churn: only the fresh cohort pays
  if (churnFraction === 0) return base * n; // no churn: simple stacking
  return base * ((1 - Math.pow(q, n)) / (1 - q));
}

/**
 * Project recurring affiliate revenue over a cohort stream.
 *
 * @param input - referralsPerMonth, avgPlanPrice, commissionRate,
 *   recurringMonths, churnRate.
 * @returns monthlyRecurringCommission, totalCommission, projectedAnnual,
 *   disclaimer.
 * @throws {TypeError} for non-object / non-numeric inputs.
 * @throws {RangeError} for out-of-range inputs.
 */
export function calculateSaasAffiliate(input: SaasAffiliateInput): SaasAffiliateResult {
  if (!input || typeof input !== "object") {
    throw new TypeError("Input must be an object.");
  }

  assertFiniteNumber("referralsPerMonth", input.referralsPerMonth);
  assertFiniteNumber("avgPlanPrice", input.avgPlanPrice);
  assertFiniteNumber("commissionRate", input.commissionRate);
  assertFiniteNumber("recurringMonths", input.recurringMonths);
  assertFiniteNumber("churnRate", input.churnRate);

  if (!Number.isInteger(input.referralsPerMonth) || input.referralsPerMonth <= 0) {
    throw new RangeError("referralsPerMonth must be a whole number greater than 0.");
  }
  if (input.referralsPerMonth > MAX_REFERRALS_PER_MONTH) {
    throw new RangeError("referralsPerMonth is above the sanity cap.");
  }
  if (input.avgPlanPrice <= 0) {
    throw new RangeError("avgPlanPrice must be greater than 0.");
  }
  if (input.avgPlanPrice > MAX_PLAN_PRICE) {
    throw new RangeError("avgPlanPrice is above the sanity cap.");
  }
  if (input.commissionRate < 0 || input.commissionRate > 100) {
    throw new RangeError("commissionRate must be between 0 and 100.");
  }
  if (!Number.isInteger(input.recurringMonths) || input.recurringMonths <= 0) {
    throw new RangeError("recurringMonths must be a whole number greater than 0.");
  }
  if (input.recurringMonths > MAX_RECURRING_MONTHS) {
    throw new RangeError(
      `recurringMonths is above the sanity cap (${MAX_RECURRING_MONTHS}).`,
    );
  }
  if (input.churnRate < 0 || input.churnRate > 100) {
    throw new RangeError("churnRate must be between 0 and 100.");
  }

  const base = input.referralsPerMonth * input.avgPlanPrice * (input.commissionRate / 100);
  const churnFraction = input.churnRate / 100;
  const horizon = Math.max(ANNUAL_HORIZON_MONTHS, input.recurringMonths);

  let totalCommission = 0;
  let projectedAnnual = 0;
  let monthlyRecurringCommission = 0;
  for (let m = 1; m <= horizon; m++) {
    const cm = commissionForMonth(m, base, churnFraction, input.recurringMonths);
    if (m <= input.recurringMonths) totalCommission += cm;
    if (m <= ANNUAL_HORIZON_MONTHS) projectedAnnual += cm;
    monthlyRecurringCommission = cm; // final loop value = commission(horizon)
  }

  return {
    monthlyRecurringCommission: round2(monthlyRecurringCommission),
    totalCommission: round2(totalCommission),
    projectedAnnual: round2(projectedAnnual),
    disclaimer: DISCLAIMER_TEXT,
  };
}

// ---------------------------------------------------------------------------
// runTool adapter — contract shape for the mountToolUI / calculator template
// ---------------------------------------------------------------------------

/**
 * Contract adapter: `runTool({ referralsPerMonth, avgPlanPrice,
 * commissionRate, recurringMonths, churnRate })` → `{ ok, values?, error? }`.
 * Output ids match meta.ts outputs.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const v = values && typeof values === "object" ? values : {};
  try {
    const result = calculateSaasAffiliate({
      referralsPerMonth: v["referralsPerMonth"] as number,
      avgPlanPrice: v["avgPlanPrice"] as number,
      commissionRate: v["commissionRate"] as number,
      recurringMonths: v["recurringMonths"] as number,
      churnRate: v["churnRate"] as number,
    });
    return {
      ok: true,
      values: {
        monthlyRecurringCommission: result.monthlyRecurringCommission,
        totalCommission: result.totalCommission,
        projectedAnnual: result.projectedAnnual,
        disclaimer: result.disclaimer,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid input.";
    return { ok: false, error: humanize(message) };
  }
}

function humanize(message: string): string {
  if (message.startsWith("referralsPerMonth must be a whole number")) {
    return "Enter your new referrals per month — a whole number greater than 0.";
  }
  if (message.startsWith("referralsPerMonth")) {
    return "Referrals per month must be a valid number.";
  }
  if (message.startsWith("avgPlanPrice must be greater than 0")) {
    return "Enter the average plan price in USD — a number greater than 0.";
  }
  if (message.startsWith("avgPlanPrice")) {
    return "Average plan price must be a valid number.";
  }
  if (message.startsWith("commissionRate must be between")) {
    return "Enter your commission rate as a percent between 0 and 100 (rates vary per program).";
  }
  if (message.startsWith("recurringMonths must be a whole number")) {
    return "Enter the recurring duration in months — a whole number greater than 0 (use your program's cap).";
  }
  if (message.startsWith("recurringMonths")) {
    return "Recurring months must be a valid number.";
  }
  if (message.startsWith("churnRate must be between")) {
    return "Enter the monthly churn rate as a percent between 0 and 100.";
  }
  if (message.includes("sanity cap")) {
    return "That number looks unrealistically large — check it and try again.";
  }
  return message;
}
