/**
 * PayPal Fee Calculator — pure logic (tool-063).
 *
 * ASSUMPTIONS (all surfaced in meta.ts assumptions[]):
 * - Zero imports, zero network, zero DOM. Plain arithmetic only.
 * - PayPal has MULTIPLE fee schedules — the payment route is REQUIRED.
 *   A single blended "PayPal rate" would be wrong math, so this calculator
 *   refuses to run without an explicit route.
 * - Route schedule estimates (US domestic, documented estimates — PayPal
 *   changes fees; verify on PayPal's official fee page):
 *     direct_gs : 2.99% + $0.00  (Goods & Services sent directly — NO fixed fee)
 *     checkout  : 3.49% + $0.49  (PayPal Checkout / online payments)
 *     card      : 2.99% + $0.49  (standard card processing)
 * - international = true adds +1.5% to the rate (cross-border estimate).
 * - currencyConversion = true is a 3–4% FX spread above mid-market, shown
 *   as a documented note — it is NOT folded into the fee math.
 *
 * Formula (data/formulas/formulas-B.json :: tool-063, v1.0.0):
 *   fee            = amount * rate(route) + fixed(route)
 *   net_received   = amount - fee
 *   effective_rate = fee / amount * 100
 *   reverse_amount_to_net(target) = (target + fixed) / (1 - rate)
 *     (target = the entered amount: "charge this to receive <amount> net")
 *
 * Rounding: half-up to 2 decimals (USD).
 */

export interface RouteSchedule {
  /** Fractional rate, e.g. 0.0299 (estimate). */
  rate: number;
  /** Fixed fee in USD (estimate). */
  fixed: number;
}

export type PaymentRoute = "direct_gs" | "checkout" | "card";

/**
 * Fixed estimate table of PayPal US schedules.
 * Source estimates (data/formulas/formulas-B.json :: tool-063, sourceDate
 * 2026-10-01, isEstimate: true). NOT official PayPal data — verify current
 * rates. Note direct_gs has NO fixed fee — this is the key route difference.
 */
export const ROUTE_TABLE: Record<PaymentRoute, RouteSchedule> = {
  direct_gs: { rate: 0.0299, fixed: 0 },
  checkout: { rate: 0.0349, fixed: 0.49 },
  card: { rate: 0.0299, fixed: 0.49 },
};

/** International (cross-border) surcharge added to the rate (estimate). */
export const INTERNATIONAL_SURCHARGE = 0.015;

/** Route ids accepted by the route select (case/space/hyphen-insensitive). */
export const ROUTE_IDS: PaymentRoute[] = ["direct_gs", "checkout", "card"];

/** Sanity guard: largest amount the calculator will attempt. */
export const MAX_AMOUNT = 1e12;

/** Output ids, kept in sync with meta.ts outputs. */
export const OUTPUT_IDS = ["fee", "netReceived", "effectiveRate", "reverseAmountToNet"] as const;

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

function asRoute(value: unknown): PaymentRoute | null {
  if (typeof value === "string") {
    const t = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
    if ((ROUTE_IDS as string[]).includes(t)) return t as PaymentRoute;
  }
  return null;
}

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Run the PayPal fee estimate.
 *
 * values in:
 *   amount             (required) finite number > 0 — transaction amount, USD
 *   paymentRoute       (required) one of direct_gs/checkout/card
 *   international      (optional) boolean — cross-border payment (+1.5%);
 *                                  defaults to false
 *   currencyConversion (optional) boolean — FX involved (3–4% spread NOTE
 *                                  only, not folded into the fee); defaults
 *                                  to false
 *
 * values out: { fee, netReceived, effectiveRate, reverseAmountToNet }
 */
export function runTool(values: Record<string, unknown>): RunResult {
  if (values === null || typeof values !== "object") {
    return { ok: false, error: "Please provide the payment details to calculate PayPal fees." };
  }

  const amount = asFiniteNumber(values["amount"]);
  if (amount === null) {
    return { ok: false, error: "Please enter a valid payment amount (a number greater than 0)." };
  }
  if (amount <= 0) {
    return { ok: false, error: "Payment amount must be greater than 0." };
  }
  if (amount > MAX_AMOUNT) {
    return { ok: false, error: `Payment amount exceeds the sanity limit of ${MAX_AMOUNT}.` };
  }

  const route = asRoute(values["paymentRoute"]);
  if (route === null) {
    return {
      ok: false,
      error:
        "Please choose a payment route (direct Goods & Services, checkout, or card) — PayPal charges a different rate for each.",
    };
  }

  const rawIntl = values["international"];
  const international =
    rawIntl === undefined || rawIntl === null || rawIntl === "" ? false : asBoolean(rawIntl);
  if (international === null) {
    return { ok: false, error: '"International" must be yes or no.' };
  }

  const rawFx = values["currencyConversion"];
  const currencyConversion =
    rawFx === undefined || rawFx === null || rawFx === "" ? false : asBoolean(rawFx);
  if (currencyConversion === null) {
    return { ok: false, error: '"Currency conversion" must be yes or no.' };
  }

  const schedule = ROUTE_TABLE[route];
  const rate = schedule.rate + (international ? INTERNATIONAL_SURCHARGE : 0);
  const fixed = schedule.fixed;
  // NOTE: currencyConversion is intentionally NOT part of the fee math —
  // the 3–4% FX spread is a separate documented note.

  const fee = round2(amount * rate + fixed);
  const netReceived = round2(amount - fee);
  const effectiveRate = round2((fee / amount) * 100);
  const reverseAmountToNet =
    rate < 1 ? round2((amount + fixed) / (1 - rate)) : round2(amount + fee);

  return {
    ok: true,
    values: { fee, netReceived, effectiveRate, reverseAmountToNet },
  };
}
