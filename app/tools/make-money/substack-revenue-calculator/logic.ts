/**
 * Substack Revenue Calculator — pure logic (tool-087).
 *
 * Pure TypeScript: zero imports, zero network, zero DOM, zero randomness.
 * Deterministic: identical inputs always produce identical outputs.
 *
 * FORMULA (spec data/formulas/formulas-B.json :: tool-087):
 *   gross_revenue = paid_subscribers * monthly_price
 *   substack_fee  = gross_revenue * 0.10
 *   stripe_fees   = paid_subscribers * (monthly_price * 0.029 + 0.30)
 *   net_revenue   = gross_revenue - substack_fee - stripe_fees
 *
 * The two fees are STACKED, not compounded (Substack takes 10% of gross;
 * Stripe takes 2.9% + $0.30 of each subscription payment).
 *
 * HONESTY (non-negotiable):
 * - Platform fee schedules CHANGE. The 10% platform fee and Stripe
 *   ~2.9% + $0.30 rates are the schedule captured in the spec
 *   (sourceDate 2026-10-01). Every fee-derived figure is an ESTIMATE —
 *   verify the current fee schedule on Substack's pricing page before
 *   relying on these numbers.
 * - Annual-billing discounts and taxes are out of scope (per spec).
 * - USD only. No currency conversion.
 *
 * Rounding: half-up to 2 decimals (USD) on every money output.
 */

export const SUBSTACK_PLATFORM_FEE_RATE = 0.1;
export const STRIPE_RATE = 0.029;
export const STRIPE_FIXED_PER_TXN = 0.3;

export interface SubstackRevenueInput {
  /** Paid subscriber count. Integer > 0. */
  paidSubscribers: number;
  /** Subscription price per month in USD. Number > 0. */
  monthlyPrice: number;
}

export interface SubstackRevenueResult {
  /** paidSubscribers * monthlyPrice, rounded to cents. */
  grossRevenue: number;
  /** 10% of grossRevenue, rounded to cents. */
  substackFee: number;
  /** paidSubscribers * (monthlyPrice * 0.029 + 0.30), rounded to cents. */
  stripeFees: number;
  /** grossRevenue - substackFee - stripeFees (from rounded lines). */
  netRevenue: number;
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
 * Core calculation. Throws {Error} with a human message on invalid input.
 */
export function calculateSubstackRevenue(input: SubstackRevenueInput): SubstackRevenueResult {
  if (!input || typeof input !== "object") {
    throw new Error("Enter your Substack numbers to run the calculation.");
  }

  const paidSubscribers = toNumber("Paid subscribers", input.paidSubscribers);
  if (!Number.isInteger(paidSubscribers) || paidSubscribers <= 0) {
    throw new Error("Paid subscribers must be a whole number greater than 0.");
  }

  const monthlyPrice = toNumber("Monthly price", input.monthlyPrice);
  if (monthlyPrice <= 0) {
    throw new Error("Monthly price must be greater than 0 USD.");
  }

  const grossRevenue = roundToCents(paidSubscribers * monthlyPrice);
  const substackFee = roundToCents(grossRevenue * SUBSTACK_PLATFORM_FEE_RATE);
  const stripeFees = roundToCents(paidSubscribers * (monthlyPrice * STRIPE_RATE + STRIPE_FIXED_PER_TXN));
  const netRevenue = roundToCents(grossRevenue - substackFee - stripeFees);

  return { grossRevenue, substackFee, stripeFees, netRevenue };
}

/**
 * Contract adapter: runTool({ paidSubscribers, monthlyPrice }) ->
 * { ok, values?, error? }. Never throws.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  try {
    if (!values || typeof values !== "object") {
      return { ok: false, error: "Enter your Substack numbers to run the calculation." };
    }
    const result = calculateSubstackRevenue({
      paidSubscribers: values.paidSubscribers as number,
      monthlyPrice: values.monthlyPrice as number,
    });
    return {
      ok: true,
      values: {
        grossRevenue: result.grossRevenue,
        substackFee: result.substackFee,
        stripeFees: result.stripeFees,
        netRevenue: result.netRevenue,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invalid input." };
  }
}
