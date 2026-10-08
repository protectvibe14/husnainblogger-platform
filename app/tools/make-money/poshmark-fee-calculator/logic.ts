/**
 * Poshmark Fee Calculator — pure logic (tool-058).
 *
 * Two-tier commission model:
 *   sale price >= $15  ->  percentFeeAtOrOver15 (default 20%) of the sale price
 *   sale price <  $15   ->  flatFeeUnder15 (default $2.95)
 *   net payout = sale price - fee - shipping discount
 *
 * HONESTY BOUNDARIES (also surfaced in meta.ts methodology/assumptions/FAQs):
 * - The 20% / $2.95 figures are user-editable DEFAULTS labeled ESTIMATES —
 *   Poshmark can change its commission at any time; verify current terms on
 *   Poshmark before pricing.
 * - Payment processing is included in the commission — no separate
 *   processing fee is added (stated, not assumed silently).
 * - Deterministic: same inputs -> same outputs. Zero imports, zero network,
 *   zero DOM, no randomness.
 */

/**
 * Sale-price threshold: the percent fee applies at exactly this amount
 * and above; the flat fee applies below it.
 */
export const FEE_THRESHOLD = 15;

/** Default flat fee for sales under $15 (user-editable estimate). */
export const DEFAULT_FLAT_FEE = 2.95;

/** Default percent fee for sales at/above $15 (user-editable estimate). */
export const DEFAULT_PERCENT_FEE = 20;

/** Sanity guard: largest sale price the calculator will attempt. */
export const MAX_SALE_PRICE = 1e12;

/** Output ids returned by runTool — must equal the outputs ids in meta.ts. */
export const OUTPUT_IDS = ["poshmarkFee", "netPayout"] as const;

/** Round to the nearest cent, half-up (positive values). */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Parsed, validated input for the Poshmark fee calculation. */
export interface PoshmarkFeeInput {
  salePrice: number;
  shippingDiscount: number;
  flatFeeUnder15: number;
  percentFeeAtOrOver15: number; // percent
}

/** Fee breakdown for one Poshmark sale. */
export interface PoshmarkFeeBreakdown {
  /** The commission Poshmark takes. */
  poshmarkFee: number;
  /** salePrice - poshmarkFee - shippingDiscount. */
  netPayout: number;
  /** Assumption/estimate notes surfaced to the UI. */
  assumptions: string[];
}

type ParseResult =
  | { ok: true; input: PoshmarkFeeInput }
  | { ok: false; error: string };

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function parseValues(values: Record<string, unknown>): ParseResult {
  if (values === null || typeof values !== "object") {
    return { ok: false, error: "No input values were provided." };
  }

  const salePrice = toFiniteNumber(values.salePrice);
  if (salePrice === null) {
    return { ok: false, error: "Sale price must be a number." };
  }
  if (salePrice <= 0) {
    return { ok: false, error: "Sale price must be greater than 0." };
  }
  if (salePrice > MAX_SALE_PRICE) {
    return { ok: false, error: "Sale price is unrealistically large." };
  }

  const shippingDiscount = toFiniteNumber(values.shippingDiscount ?? 0);
  if (shippingDiscount === null || shippingDiscount < 0) {
    return { ok: false, error: "Shipping discount must be a number of 0 or more." };
  }

  const flatFeeUnder15 = toFiniteNumber(values.flatFeeUnder15 ?? DEFAULT_FLAT_FEE);
  if (flatFeeUnder15 === null || flatFeeUnder15 < 0) {
    return { ok: false, error: "Flat fee (under $15) must be a number of 0 or more." };
  }

  const percentFeeAtOrOver15 = toFiniteNumber(values.percentFeeAtOrOver15 ?? DEFAULT_PERCENT_FEE);
  if (percentFeeAtOrOver15 === null || percentFeeAtOrOver15 <= 0 || percentFeeAtOrOver15 > 100) {
    return { ok: false, error: "Commission % (at/above $15) must be a percent between 0 and 100." };
  }

  return {
    ok: true,
    input: { salePrice, shippingDiscount, flatFeeUnder15, percentFeeAtOrOver15 },
  };
}

/**
 * Calculate the Poshmark fee for one sale.
 *
 * poshmarkFee = salePrice >= 15 ? salePrice * percentFee/100 : flatFeeUnder15
 * netPayout   = salePrice - poshmarkFee - shippingDiscount
 */
export function calculatePoshmarkFee(input: PoshmarkFeeInput): PoshmarkFeeBreakdown {
  const price = roundToCents(input.salePrice);
  const discount = roundToCents(input.shippingDiscount);

  const poshmarkFee =
    price >= FEE_THRESHOLD
      ? roundToCents((price * input.percentFeeAtOrOver15) / 100)
      : roundToCents(input.flatFeeUnder15);
  const netPayout = roundToCents(price - poshmarkFee - discount);

  const assumptions: string[] = [
    `Commission figures are user-editable ESTIMATES (defaults: ${input.percentFeeAtOrOver15}% at/above $${FEE_THRESHOLD}, $${input.flatFeeUnder15.toFixed(2)} flat below $${FEE_THRESHOLD}) — Poshmark can change its commission at any time. Verify current terms on Poshmark.`,
    `The percent tier applies at exactly $${FEE_THRESHOLD} and above; below $${FEE_THRESHOLD} the flat fee applies, which can exceed 20% of the sale price.`,
    "Payment processing is included in the commission — no separate processing fee is added.",
    "Seller-funded shipping discounts reduce the payout dollar-for-dollar; a discount larger than the payout shows as a negative payout.",
    "All amounts are in USD.",
  ];

  return { poshmarkFee, netPayout, assumptions };
}

/**
 * Tool logic slot: runTool(values) -> { ok, values?, error? }.
 * Output ids match the outputs in meta.ts.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const parsed = parseValues(values);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const r = calculatePoshmarkFee(parsed.input);
  return {
    ok: true,
    values: { poshmarkFee: r.poshmarkFee, netPayout: r.netPayout },
  };
}
