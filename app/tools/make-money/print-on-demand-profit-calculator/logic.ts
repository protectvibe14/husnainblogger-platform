/**
 * Print-on-Demand Profit Calculator — pure logic (tool-061).
 *
 * ASSUMPTIONS (all surfaced in meta.ts assumptions[]):
 * - Zero imports, zero network, zero DOM. Plain arithmetic only.
 * - NO hardcoded POD provider prices. Printful, Printify, Gooten, etc. all
 *   price differently, so `baseProductCost` (provider base + print cost) is
 *   ALWAYS user-entered. Unverified provider pricing must never be embedded.
 * - `platformFeeRate` is a user-editable ESTIMATE. The default below (5%) is
 *   a generic placeholder only — it is NOT any real marketplace's or
 *   provider's published rate. The user must replace it with their own
 *   marketplace's fee rate (e.g. from their seller dashboard).
 * - margin may be negative (costs exceed price) — that is the honest answer.
 *
 * Formula (data/formulas/formulas-B.json :: tool-061, v1.0.0):
 *   platform_fee = sale_price * platform_fee_rate
 *   net_profit   = sale_price - platform_fee - base_product_cost - shipping_cost
 *   margin       = net_profit / sale_price * 100
 *
 * Rounding: half-up to 2 decimals (USD); 1 decimal for percent.
 */

/** Sanity guard: largest sale price the calculator will attempt. */
export const MAX_AMOUNT = 1e12;

/**
 * Default platform fee rate (percent) used when the user leaves the field
 * blank. ESTIMATE PLACEHOLDER ONLY — not a real provider or marketplace
 * rate. Always labeled as an estimate in the UI copy.
 */
export const DEFAULT_PLATFORM_FEE_RATE_PCT = 5;

/** Output ids, kept in sync with meta.ts outputs. */
export const OUTPUT_IDS = ["platformFee", "netProfit", "margin"] as const;

/**
 * Round to 2 decimals, half-up for positive values. Used for all USD
 * outputs. (Math.round rounds half away from zero for negatives; that is
 * documented and acceptable for display of negative profit.)
 */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Round to 1 decimal, half-up. Used for the percent margin. */
export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Coerce an unknown input to a finite number.
 * Accepts numbers and numeric strings (e.g. from URL state); rejects
 * everything else, NaN, and ±Infinity.
 */
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

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Run the print-on-demand profit calculation.
 *
 * values in:
 *   salePrice       (required) finite number > 0 — retail price in USD
 *   baseProductCost (required) finite number >= 0 — provider base + print
 *                                 cost, ALWAYS user-entered
 *   platformFeeRate (optional)  finite number >= 0 — percent; defaults to
 *                                 DEFAULT_PLATFORM_FEE_RATE_PCT (estimate)
 *   shippingCost    (optional)  finite number >= 0 — shipping cost borne by
 *                                 the seller; defaults to 0
 *
 * values out: { platformFee, netProfit, margin }
 */
export function runTool(values: Record<string, unknown>): RunResult {
  if (values === null || typeof values !== "object") {
    return { ok: false, error: "Please provide your sale inputs to calculate profit." };
  }

  const salePrice = asFiniteNumber(values["salePrice"]);
  if (salePrice === null) {
    return { ok: false, error: "Please enter a valid sale price (a number greater than 0)." };
  }
  if (salePrice <= 0) {
    return { ok: false, error: "Sale price must be greater than 0." };
  }
  if (salePrice > MAX_AMOUNT) {
    return { ok: false, error: `Sale price exceeds the sanity limit of ${MAX_AMOUNT}.` };
  }

  const baseProductCost = asFiniteNumber(values["baseProductCost"]);
  if (baseProductCost === null) {
    return {
      ok: false,
      error:
        "Please enter your base product cost (provider base + print cost) — it must be 0 or more.",
    };
  }
  if (baseProductCost < 0) {
    return { ok: false, error: "Base product cost cannot be negative." };
  }

  const rawFeeRate = values["platformFeeRate"];
  const platformFeeRate =
    rawFeeRate === undefined || rawFeeRate === null || rawFeeRate === ""
      ? DEFAULT_PLATFORM_FEE_RATE_PCT
      : asFiniteNumber(rawFeeRate);
  if (platformFeeRate === null) {
    return { ok: false, error: "Platform fee rate must be a valid number (0 or more)." };
  }
  if (platformFeeRate < 0) {
    return { ok: false, error: "Platform fee rate cannot be negative." };
  }

  const rawShipping = values["shippingCost"];
  const shippingCost =
    rawShipping === undefined || rawShipping === null || rawShipping === ""
      ? 0
      : asFiniteNumber(rawShipping);
  if (shippingCost === null) {
    return { ok: false, error: "Shipping cost must be a valid number (0 or more)." };
  }
  if (shippingCost < 0) {
    return { ok: false, error: "Shipping cost cannot be negative." };
  }

  const platformFee = round2(salePrice * (platformFeeRate / 100));
  const netProfit = round2(salePrice - platformFee - baseProductCost - shippingCost);
  const margin = round1((netProfit / salePrice) * 100);

  return {
    ok: true,
    values: { platformFee, netProfit, margin },
  };
}
