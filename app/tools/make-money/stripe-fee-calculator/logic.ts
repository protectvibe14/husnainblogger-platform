/**
 * Stripe Fee Calculator — pure logic (tool-064).
 *
 * ASSUMPTIONS (all surfaced in meta.ts assumptions[]):
 * - Zero imports, zero network, zero DOM. Plain arithmetic only.
 * - Method schedule estimates (US domestic, documented estimates — Stripe
 *   changes fees; verify on Stripe's official pricing page):
 *     online    : 2.9% + $0.30  (card payments online)
 *     in_person : 2.7% + $0.05  (card-present / terminal)
 *     ach       : 0.8% capped at $5 per charge (US bank debit)
 *   The method is REQUIRED — in-person and online rates genuinely differ.
 * - international_card = true adds +1.5% (non-US card estimate).
 * - currency_conversion = true adds +1% (FX estimate). Both stack on the
 *   rate, including ACH (documented).
 * - ACH cap binds on the FINAL stacked fee: fee = min(amount * rate, 5).
 * - Volume or negotiated rates are out of scope — standard rates only.
 *
 * Formula (data/formulas/formulas-B.json :: tool-064, v1.0.0):
 *   fee = amount * rate(method) + fixed(method)
 *   ach: fee = min(amount * 0.008, 5)  (cap applies after stacking)
 *   net_received   = amount - fee
 *   effective_rate = fee / amount * 100
 *   reverse_amount_to_net(target) = (target + fixed) / (1 - rate)
 *     ACH is piecewise (cap breaks linearity): if charging target/(1-rate)
 *     keeps the fee at/below the $5 cap, use it; otherwise charge target+5.
 *
 * Rounding: half-up to 2 decimals (USD and percent).
 */

export interface MethodSchedule {
  /**
   * Rate in BASIS POINTS (integer, e.g. 290 = 2.90%). Stored as an integer
   * so stacked rates (2.9% + 1.5% + 1.0% = 540 bps) convert to the exact
   * decimal the fee schedule documents — plain FP addition of fractions
   * (0.029+0.015+0.01) can drift by a cent on rounding boundaries.
   * (estimate — verify current Stripe rates)
   */
  rateBps: number;
  /** Fixed fee in USD (estimate). */
  fixed: number;
  /** True for ACH: fee = min(amount * rate, cap) instead of rate + fixed. */
  capped?: boolean;
}

export type PaymentMethod = "online" | "in_person" | "ach";

/**
 * Fixed estimate table of Stripe US schedules.
 * Source estimates (data/formulas/formulas-B.json :: tool-064, sourceDate
 * 2026-10-01, isEstimate: true). NOT official Stripe data — verify current
 * rates.
 */
export const METHOD_TABLE: Record<PaymentMethod, MethodSchedule> = {
  online: { rateBps: 290, fixed: 0.3 },
  in_person: { rateBps: 270, fixed: 0.05 },
  ach: { rateBps: 80, fixed: 0, capped: true },
};

/** ACH per-charge fee cap, USD (estimate). */
export const ACH_FEE_CAP = 5;

/** International-card surcharge, basis points (estimate). */
export const INTERNATIONAL_SURCHARGE_BPS = 150;

/** Currency-conversion surcharge, basis points (estimate). */
export const FX_SURCHARGE_BPS = 100;

/** Method ids accepted by the method select (case/space/hyphen-insensitive). */
export const METHOD_IDS: PaymentMethod[] = ["online", "in_person", "ach"];

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

function asMethod(value: unknown): PaymentMethod | null {
  if (typeof value === "string") {
    const t = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
    if ((METHOD_IDS as string[]).includes(t)) return t as PaymentMethod;
  }
  return null;
}

/**
 * Piecewise reverse for the ACH cap: solve A - min(A*r, cap) = target.
 * If the uncapped solution keeps the fee at/below the cap, it is valid;
 * otherwise the cap binds and A = target + cap.
 */
function reverseAch(target: number, rate: number, cap: number): number {
  if (rate >= 1) return target + cap;
  const uncapped = target / (1 - rate);
  return uncapped * rate <= cap ? uncapped : target + cap;
}

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Run the Stripe fee estimate.
 *
 * values in:
 *   amount            (required) finite number > 0 — charge amount, USD
 *   paymentMethod     (required) one of online/in_person/ach
 *   internationalCard (optional) boolean — non-US card (+1.5%);
 *                                 defaults to false
 *   currencyConversion (optional) boolean — FX conversion (+1%, stacked);
 *                                  defaults to false
 *
 * values out: { fee, netReceived, effectiveRate, reverseAmountToNet }
 */
export function runTool(values: Record<string, unknown>): RunResult {
  if (values === null || typeof values !== "object") {
    return { ok: false, error: "Please provide the payment details to calculate Stripe fees." };
  }

  const amount = asFiniteNumber(values["amount"]);
  if (amount === null) {
    return { ok: false, error: "Please enter a valid charge amount (a number greater than 0)." };
  }
  if (amount <= 0) {
    return { ok: false, error: "Charge amount must be greater than 0." };
  }
  if (amount > MAX_AMOUNT) {
    return { ok: false, error: `Charge amount exceeds the sanity limit of ${MAX_AMOUNT}.` };
  }

  const method = asMethod(values["paymentMethod"]);
  if (method === null) {
    return {
      ok: false,
      error:
        "Please choose a payment method (online, in-person, or ACH) — Stripe charges a different rate for each.",
    };
  }

  const rawIntl = values["internationalCard"];
  const internationalCard =
    rawIntl === undefined || rawIntl === null || rawIntl === "" ? false : asBoolean(rawIntl);
  if (internationalCard === null) {
    return { ok: false, error: '"International card" must be yes or no.' };
  }

  const rawFx = values["currencyConversion"];
  const currencyConversion =
    rawFx === undefined || rawFx === null || rawFx === "" ? false : asBoolean(rawFx);
  if (currencyConversion === null) {
    return { ok: false, error: '"Currency conversion" must be yes or no.' };
  }

  const schedule = METHOD_TABLE[method];
  const rateBps =
    schedule.rateBps +
    (internationalCard ? INTERNATIONAL_SURCHARGE_BPS : 0) +
    (currencyConversion ? FX_SURCHARGE_BPS : 0);
  const rate = rateBps / 10000;

  const fee = schedule.capped
    ? round2(Math.min(amount * rate, ACH_FEE_CAP))
    : round2(amount * rate + schedule.fixed);
  const netReceived = round2(amount - fee);
  const effectiveRate = round2((fee / amount) * 100);
  const reverseAmountToNet = schedule.capped
    ? round2(reverseAch(amount, rate, ACH_FEE_CAP))
    : round2((amount + schedule.fixed) / (1 - rate));

  return {
    ok: true,
    values: { fee, netReceived, effectiveRate, reverseAmountToNet },
  };
}
