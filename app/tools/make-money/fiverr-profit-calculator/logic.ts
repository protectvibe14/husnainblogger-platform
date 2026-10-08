/**
 * Fiverr Profit Calculator — pure logic (tool-067).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Plain arithmetic only.
 * - Fiverr charges sellers a FLAT 20% commission on ALL freelancer earnings,
 *   including tips. Source: data/platform-rules/fiverr.json ->
 *   fiverr-seller-commission (value "20% flat on all freelancer earnings,
 *   including tips"), effectiveDate 2026-07-01, lastVerified 2026-10-01,
 *   status "verified". The commission rate is identical for every seller
 *   level — sellerLevel is accepted as informational input only and does not
 *   change the math (stated in assumptions[]).
 * - The buyer service fee (~5.5%) is buyer-paid and does NOT reduce the
 *   seller payout. Source: fiverr-buyer-service-fee (same file). It is shown
 *   in assumptions[] for transparency but excluded from the calculation.
 * - Withdrawal fees (PayPal / bank transfer / Fiverr Revenue Card) vary by
 *   country and method and no platform-wide verified value exists in the
 *   rules file, so withdrawalFee is a USER-PROVIDED input (defaults to 0).
 * - All amounts are USD. No FX conversion is performed anywhere.
 * - Each fee line is rounded to the nearest cent (half-up) BEFORE summing.
 *   Fractional-cent inputs are rounded to cents (half-up) first; the
 *   assumption is surfaced in assumptions[].
 * - Results are ESTIMATES: Fiverr can change its fee schedule at any time.
 */

export const FIVERR_SELLER_COMMISSION_RATE = 0.2;

/**
 * Currency the calculator works in. Fiverr seller balances and the verified
 * commission rule are USD-denominated. No conversion is performed.
 */
export const FIVERR_CURRENCY = "USD";

/** Largest order value the calculator will attempt (sanity guard). */
export const MAX_ORDER_VALUE = 1e9;

/** Seller levels on Fiverr (informational only — commission is flat 20%). */
export const FIVERR_SELLER_LEVELS = [
  "New Seller",
  "Level 1",
  "Level 2",
  "Top Rated Seller",
] as const;
export type FiverrSellerLevel = (typeof FIVERR_SELLER_LEVELS)[number];

/**
 * Input for the Fiverr profit calculation.
 */
export interface FiverrProfitInput {
  /** Base gig/order price. Must be a finite number > 0. */
  orderValue: number;
  /** Gig extras total. Finite number >= 0. Defaults to 0. */
  extrasValue?: number;
  /** Tips received on the order. Finite number >= 0. Defaults to 0. */
  tipsValue?: number;
  /**
   * Withdrawal fee in USD, USER-PROVIDED (no verified platform-wide value
   * exists). Finite number >= 0. Defaults to 0.
   */
  withdrawalFee?: number;
  /**
   * Seller level. Informational only — does not change the 20% commission.
   * Defaults to "New Seller".
   */
  sellerLevel?: FiverrSellerLevel;
}

/**
 * Full profit breakdown for one Fiverr order.
 */
export interface FiverrProfitBreakdown {
  /** Currency the amounts are expressed in. Always "USD". */
  currency: string;
  /** orderValue + extrasValue + tipsValue (inputs rounded to cents first). */
  grossEarnings: number;
  /** Fiverr commission: 20% of grossEarnings, rounded to cents. */
  commission: number;
  /** The commission rate applied (0.20). */
  commissionRate: number;
  /** User-provided withdrawal fee (rounded to cents). */
  withdrawalFee: number;
  /** grossEarnings - commission - withdrawalFee. */
  netPayout: number;
  /** netPayout / grossEarnings * 100, rounded to 2 decimals. */
  effectiveTakeHomePct: number;
  /** Assumption/estimate notes surfaced to the UI. */
  assumptions: string[];
}

/**
 * Round to the nearest cent, half-up. Math.round is half-up for positive
 * values; negative values round half away from zero (documented, acceptable).
 */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Round to 2 decimals (used for percentages). */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Validate that value is a finite number.
 * @throws {TypeError} for non-numeric, NaN, or non-finite input.
 */
function assertFiniteNumber(name: string, value: unknown): asserts value is number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new TypeError(`${name} must be a number (got ${String(value)}).`);
  }
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be finite (got ${String(value)}).`);
  }
}

/**
 * Calculate the seller's net payout for one Fiverr order.
 *
 * @param input - orderValue, extrasValue, tipsValue, withdrawalFee, sellerLevel.
 * @returns Full profit breakdown with assumptions surfaced for the UI.
 * @throws {TypeError} for non-numeric / non-finite inputs or a non-object input.
 * @throws {RangeError} for orderValue <= 0, negative extras/tips/withdrawal,
 *   or gross above the sanity cap.
 */
export function calculateFiverrProfit(input: FiverrProfitInput): FiverrProfitBreakdown {
  if (!input || typeof input !== "object") {
    throw new TypeError("Input must be an object.");
  }

  const assumptions: string[] = [];

  assertFiniteNumber("orderValue", input.orderValue);
  if (input.orderValue <= 0) {
    throw new RangeError("orderValue must be greater than 0.");
  }

  const extras = input.extrasValue ?? 0;
  const tips = input.tipsValue ?? 0;
  const withdrawal = input.withdrawalFee ?? 0;
  assertFiniteNumber("extrasValue", extras);
  assertFiniteNumber("tipsValue", tips);
  assertFiniteNumber("withdrawalFee", withdrawal);
  if (extras < 0) throw new RangeError("extrasValue must be >= 0.");
  if (tips < 0) throw new RangeError("tipsValue must be >= 0.");
  if (withdrawal < 0) throw new RangeError("withdrawalFee must be >= 0.");

  const sellerLevel = input.sellerLevel ?? "New Seller";
  if (!FIVERR_SELLER_LEVELS.includes(sellerLevel)) {
    throw new TypeError(
      `sellerLevel must be one of: ${FIVERR_SELLER_LEVELS.join(", ")}.`,
    );
  }

  const orderValue = roundToCents(input.orderValue);
  const extrasValue = roundToCents(extras);
  const tipsValue = roundToCents(tips);
  const withdrawalFee = roundToCents(withdrawal);
  if (
    orderValue !== input.orderValue ||
    extrasValue !== extras ||
    tipsValue !== tips ||
    withdrawalFee !== withdrawal
  ) {
    assumptions.push(
      "Inputs with more than 2 decimals were rounded to the nearest cent (half-up) before calculation.",
    );
  }

  const grossEarnings = roundToCents(orderValue + extrasValue + tipsValue);
  if (grossEarnings > MAX_ORDER_VALUE) {
    throw new RangeError(
      `Gross earnings above the sanity cap (${MAX_ORDER_VALUE}).`,
    );
  }

  const commission = roundToCents(grossEarnings * FIVERR_SELLER_COMMISSION_RATE);
  const netPayout = roundToCents(grossEarnings - commission - withdrawalFee);
  const effectiveTakeHomePct = round2((netPayout / grossEarnings) * 100);

  assumptions.push(
    "Fiverr charges a flat 20% commission on ALL freelancer earnings, including tips " +
      "(platform-rules/fiverr.json -> fiverr-seller-commission, last verified 2026-10-01).",
  );
  assumptions.push(
    `Seller level (${sellerLevel}) does not change the commission — the 20% rate is flat for all seller levels.`,
  );
  assumptions.push(
    "The buyer service fee (~5.5%) is paid by the buyer and does NOT reduce the seller payout.",
  );
  if (withdrawal === 0) {
    assumptions.push(
      "No withdrawal fee was entered: actual payout is lower once the " +
        "withdrawal method fee (PayPal / bank / Revenue Card, varies by country) is applied.",
    );
  } else {
    assumptions.push(
      "Withdrawal fee is a user-provided value — no platform-wide verified figure exists.",
    );
  }
  assumptions.push("All amounts are USD. No currency conversion is performed.");
  assumptions.push(
    "ESTIMATE: Fiverr can change its fee schedule at any time; verify against Fiverr's current terms.",
  );

  return {
    currency: FIVERR_CURRENCY,
    grossEarnings,
    commission,
    commissionRate: FIVERR_SELLER_COMMISSION_RATE,
    withdrawalFee,
    netPayout,
    effectiveTakeHomePct,
    assumptions,
  };
}

// ---------------------------------------------------------------------------
// runTool adapter (tool-067 contract: values in -> outputs out).
//
// Inputs: orderValue (required, >0), tipsValue (optional, >=0 — Fiverr takes
// 20% of tips too), deliveryCost (optional, >=0 — outsourcing/tools cost for
// the order), hoursWorked (optional, >0 — enables the effective-hourly
// output), serviceFeeRate (optional, 0–100, default 20 — user-editable; the
// 20% default is Fiverr's documented seller commission, labeled estimate),
// revisionRounds (optional whole number >=0 — informational only).
//
// Outputs: fiverrFee (USD), netEarnings (USD), effectiveHourly (USD/hour or
// null when hoursWorked was not entered), note (text — estimate labeling).
// ---------------------------------------------------------------------------

/** Default seller commission (Fiverr's documented flat rate, labeled estimate). */
export const FIVERR_DEFAULT_SERVICE_FEE_RATE = 20;

interface NumberResult {
  ok: boolean;
  value: number;
  error?: string;
}

function parseNumber(
  values: Record<string, unknown>,
  id: string,
  opts: { required: boolean; min: number; max: number; integer?: boolean; label: string },
): NumberResult {
  const raw = values[id];
  if (raw === undefined || raw === null || raw === "") {
    if (!opts.required) return { ok: true, value: NaN };
    return { ok: false, value: NaN, error: `Please enter ${opts.label}.` };
  }
  const n = typeof raw === "number" ? raw : Number(raw);
  if (typeof raw === "boolean" || Number.isNaN(n)) {
    return { ok: false, value: NaN, error: `${opts.label} must be a number.` };
  }
  if (!Number.isFinite(n)) {
    return { ok: false, value: NaN, error: `${opts.label} must be a finite number.` };
  }
  if (opts.integer && !Number.isInteger(n)) {
    return { ok: false, value: NaN, error: `${opts.label} must be a whole number.` };
  }
  if (n < opts.min) {
    return { ok: false, value: NaN, error: `${opts.label} must be at least ${opts.min}.` };
  }
  if (n > opts.max) {
    return { ok: false, value: NaN, error: `${opts.label} must be at most ${opts.max}.` };
  }
  return { ok: true, value: n };
}

/**
 * runTool adapter for the Fiverr Profit Calculator.
 */
export function runTool(
  values: Record<string, unknown>,
): { ok: boolean; values?: Record<string, unknown>; error?: string } {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "No input values were provided." };
  }

  const orderValue = parseNumber(values, "orderValue", {
    required: true,
    min: 0.01,
    max: MAX_ORDER_VALUE,
    label: "Order value",
  });
  if (!orderValue.ok) return { ok: false, error: orderValue.error };

  const tips = parseNumber(values, "tipsValue", {
    required: false,
    min: 0,
    max: MAX_ORDER_VALUE,
    label: "Tips received",
  });
  if (!tips.ok) return { ok: false, error: tips.error };

  const deliveryCost = parseNumber(values, "deliveryCost", {
    required: false,
    min: 0,
    max: MAX_ORDER_VALUE,
    label: "Delivery cost",
  });
  if (!deliveryCost.ok) return { ok: false, error: deliveryCost.error };

  const hoursWorked = parseNumber(values, "hoursWorked", {
    required: false,
    min: 0.01,
    max: 100000,
    label: "Hours worked",
  });
  if (!hoursWorked.ok) return { ok: false, error: hoursWorked.error };

  const feeRate = parseNumber(values, "serviceFeeRate", {
    required: false,
    min: 0,
    max: 100,
    label: "Service fee rate",
  });
  if (!feeRate.ok) return { ok: false, error: feeRate.error };

  const revisionRounds = parseNumber(values, "revisionRounds", {
    required: false,
    min: 0,
    max: 1000,
    integer: true,
    label: "Revision rounds",
  });
  if (!revisionRounds.ok) return { ok: false, error: revisionRounds.error };

  const tipsValue = Number.isNaN(tips.value) ? 0 : tips.value;
  const cost = Number.isNaN(deliveryCost.value) ? 0 : deliveryCost.value;
  const hours = Number.isNaN(hoursWorked.value) ? null : hoursWorked.value;
  const ratePct = Number.isNaN(feeRate.value) ? FIVERR_DEFAULT_SERVICE_FEE_RATE : feeRate.value;
  const rateUsedDefault = ratePct === FIVERR_DEFAULT_SERVICE_FEE_RATE;
  const revisions = Number.isNaN(revisionRounds.value) ? null : revisionRounds.value;

  // Reuse the tested fee logic for the documented default 20% path.
  let fiverrFee: number;
  if (rateUsedDefault) {
    const breakdown = calculateFiverrProfit({ orderValue: orderValue.value, tipsValue });
    fiverrFee = breakdown.commission;
  } else {
    // User-edited rate: same formula as the tested logic, with the custom rate.
    const gross = roundToCents(orderValue.value) + roundToCents(tipsValue);
    fiverrFee = roundToCents(gross * (ratePct / 100));
  }

  const netEarnings = roundToCents(orderValue.value + tipsValue - fiverrFee - cost);
  const effectiveHourly = hours === null ? null : round2(netEarnings / hours);

  let note =
    "ESTIMATE — Fiverr charges sellers a flat 20% commission on all earnings " +
    "including tips (default rate; user-adjustable). The buyer service fee (~5.5%) " +
    "is buyer-paid and excluded. All amounts are USD; verify Fiverr's current terms.";
  if (!rateUsedDefault) {
    note += ` Service fee rate overridden to ${ratePct}% by the user.`;
  }
  if (revisions !== null) {
    note += ` Revision rounds (${revisions}) are informational and do not change the fee math.`;
  }

  return {
    ok: true,
    values: { fiverrFee, netEarnings, effectiveHourly, note },
  };
}
