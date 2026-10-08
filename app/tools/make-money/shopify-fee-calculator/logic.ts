/**
 * Shopify Fee Calculator — pure logic (tool-062).
 *
 * ASSUMPTIONS (all surfaced in meta.ts assumptions[]):
 * - Zero imports, zero network, zero DOM. Plain arithmetic only.
 * - Per-plan numbers live in PLAN_TABLE below — a FIXED ESTIMATE TABLE IN
 *   CODE. Every number is a documented estimate, never presented as
 *   Shopify's official/current data. Shopify changes plans and fees;
 *   verify current rates on Shopify's official pricing page.
 * - Plan schedule estimates (USD, online credit-card rates):
 *     basic:    $39/mo,  2.9% + $0.30, third-party gateway surcharge 2.0%
 *     grow:     $105/mo, 2.7% + $0.30, third-party gateway surcharge 1.0%
 *     advanced: $399/mo, 2.5% + $0.30, third-party gateway surcharge 0.6%
 *     plus:     from $2,300/mo, ~2.15–2.25% + $0.30 (coded as 2.2% midpoint
 *               estimate; Plus rates are custom/negotiated), no additional
 *               third-party gateway surcharge
 * - Third-party gateway = Shopify's surcharge STACKED ON TOP of your
 *   gateway's own fee (user-entered percent). Both are combined in the
 *   gatewaySurcharge output and included in totalMonthlyCost.
 * - PayPal/wallet transactions (~3.49% + $0.49 across plans) are out of
 *   scope and excluded — this calculator models card processing only.
 *
 * Formula (data/formulas/formulas-B.json :: tool-062, v1.0.0):
 *   monthly_subscription = plan_table(plan)
 *   processing_fees  = orders_per_month * (order_value * card_rate(plan) + 0.30)
 *   gateway_surcharge = use_shopify_payments
 *       ? 0
 *       : orders_per_month * order_value * (third_party_surcharge(plan) + gateway_rate)
 *   total_monthly_cost = monthly_subscription + processing_fees + gateway_surcharge
 *   effective_rate = total_monthly_cost / (orders_per_month * order_value) * 100
 *                    (0 when there is no revenue to spread the cost across)
 *
 * Rounding: half-up to 2 decimals (USD); 2 decimals for percent.
 */

export interface ShopifyPlanFees {
  /** Monthly subscription, USD (estimate). */
  subscription: number;
  /** Online card rate as a fraction, e.g. 0.029 (estimate). */
  cardRate: number;
  /** Fixed per-order fee, USD (estimate). */
  fixedFee: number;
  /** Additional fee fraction for third-party payment providers (estimate). */
  thirdPartySurcharge: number;
}

export type PlanId = "basic" | "grow" | "advanced" | "plus";

/**
 * Fixed estimate table. Sourced from the formula record
 * (data/formulas/formulas-B.json :: tool-062, sourceDate 2026-10-01,
 * isEstimate: true). NOT official Shopify data — verify current rates.
 */
export const PLAN_TABLE: Record<PlanId, ShopifyPlanFees> = {
  basic: { subscription: 39, cardRate: 0.029, fixedFee: 0.3, thirdPartySurcharge: 0.02 },
  grow: { subscription: 105, cardRate: 0.027, fixedFee: 0.3, thirdPartySurcharge: 0.01 },
  advanced: { subscription: 399, cardRate: 0.025, fixedFee: 0.3, thirdPartySurcharge: 0.006 },
  plus: { subscription: 2300, cardRate: 0.022, fixedFee: 0.3, thirdPartySurcharge: 0 },
};

/** Plan ids accepted by the plan select (case-insensitive input allowed). */
export const PLAN_IDS: PlanId[] = ["basic", "grow", "advanced", "plus"];

/** Sanity guard: largest amount/count the calculator will attempt. */
export const MAX_VALUE = 1e12;

/** Output ids, kept in sync with meta.ts outputs. */
export const OUTPUT_IDS = [
  "processingFees",
  "gatewaySurcharge",
  "monthlySubscription",
  "totalMonthlyCost",
  "effectiveRate",
] as const;

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const t = value.trim().toLowerCase();
    if (t === "true" || t === "1" || t === "yes") return true;
    if (t === "false" || t === "0" || t === "no") return false;
  }
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  return null;
}

function asPlanId(value: unknown): PlanId | null {
  if (typeof value === "string") {
    const t = value.trim().toLowerCase();
    if ((PLAN_IDS as string[]).includes(t)) return t as PlanId;
  }
  return null;
}

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Run the Shopify monthly fee estimate.
 *
 * values in:
 *   orderValue        (required) finite number > 0 — average order value, USD
 *   ordersPerMonth    (required) finite integer >= 0 — monthly order count
 *                                   (0 allowed: subscription cost still shown)
 *   plan              (required) one of basic/grow/advanced/plus
 *                                   (case-insensitive)
 *   useShopifyPayments (optional) boolean — defaults to true
 *   gatewayRate       (required when useShopifyPayments is false)
 *                                   finite number >= 0 — YOUR gateway's own
 *                                   fee rate in percent, stacked on top of
 *                                   Shopify's third-party surcharge
 *
 * values out: { processingFees, gatewaySurcharge, monthlySubscription,
 *               totalMonthlyCost, effectiveRate }
 */
export function runTool(values: Record<string, unknown>): RunResult {
  if (values === null || typeof values !== "object") {
    return { ok: false, error: "Please provide your order details to estimate Shopify fees." };
  }

  const orderValue = asFiniteNumber(values["orderValue"]);
  if (orderValue === null) {
    return { ok: false, error: "Please enter a valid average order value (a number greater than 0)." };
  }
  if (orderValue <= 0) {
    return { ok: false, error: "Average order value must be greater than 0." };
  }
  if (orderValue > MAX_VALUE) {
    return { ok: false, error: `Average order value exceeds the sanity limit of ${MAX_VALUE}.` };
  }

  const ordersPerMonth = asFiniteNumber(values["ordersPerMonth"]);
  if (ordersPerMonth === null) {
    return { ok: false, error: "Please enter your orders per month (a whole number, 0 or more)." };
  }
  if (!Number.isInteger(ordersPerMonth) || ordersPerMonth < 0) {
    return { ok: false, error: "Orders per month must be a whole number, 0 or more." };
  }
  if (ordersPerMonth > MAX_VALUE) {
    return { ok: false, error: `Orders per month exceeds the sanity limit of ${MAX_VALUE}.` };
  }

  const plan = asPlanId(values["plan"]);
  if (plan === null) {
    return {
      ok: false,
      error: "Please choose a Shopify plan: basic, grow, advanced, or plus.",
    };
  }

  const rawUsePayments = values["useShopifyPayments"];
  const useShopifyPayments =
    rawUsePayments === undefined || rawUsePayments === null || rawUsePayments === ""
      ? true
      : asBoolean(rawUsePayments);
  if (useShopifyPayments === null) {
    return {
      ok: false,
      error: '"Use Shopify Payments" must be yes or no.',
    };
  }

  let gatewayRatePct = 0;
  if (!useShopifyPayments) {
    const gatewayRate = asFiniteNumber(values["gatewayRate"]);
    if (gatewayRate === null) {
      return {
        ok: false,
        error:
          "Please enter your third-party gateway's own fee rate (percent) — it stacks on top of Shopify's surcharge.",
      };
    }
    if (gatewayRate < 0) {
      return { ok: false, error: "Gateway fee rate cannot be negative." };
    }
    gatewayRatePct = gatewayRate;
  }

  const fees = PLAN_TABLE[plan];
  const monthlySubscription = round2(fees.subscription);
  const processingFees = round2(ordersPerMonth * (orderValue * fees.cardRate + fees.fixedFee));
  const gatewaySurcharge = useShopifyPayments
    ? 0
    : round2(ordersPerMonth * orderValue * (fees.thirdPartySurcharge + gatewayRatePct / 100));
  const totalMonthlyCost = round2(monthlySubscription + processingFees + gatewaySurcharge);

  const grossRevenue = ordersPerMonth * orderValue;
  const effectiveRate = grossRevenue > 0 ? round2((totalMonthlyCost / grossRevenue) * 100) : 0;

  return {
    ok: true,
    values: { processingFees, gatewaySurcharge, monthlySubscription, totalMonthlyCost, effectiveRate },
  };
}
