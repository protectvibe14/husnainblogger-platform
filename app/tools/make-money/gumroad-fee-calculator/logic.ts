/**
 * Gumroad Fee Calculator — pure logic (tool-065).
 *
 * ASSUMPTIONS (all surfaced in meta.ts assumptions[]):
 * - Zero imports, zero network, zero DOM. Plain arithmetic only.
 * - Channel determines the fee stack — the channel is REQUIRED.
 * - Fee schedule estimates (documented estimates — Gumroad's fee structure
 *   has CHANGED historically; verify current rates on Gumroad's official
 *   pricing page):
 *     direct   : 10% + $0.50 per unit, PLUS card processing (2.9% + $0.30)
 *                charged ON TOP
 *     discover : 30% flat per unit, processing INCLUDED — never add
 *                2.9% + $0.30 on Discover
 * - Each per-unit fee line is rounded to the nearest cent (half-up) BEFORE
 *   multiplying by quantity.
 * - Gumroad is the merchant of record (sales tax handled by Gumroad), there
 *   is no monthly fee, and the platform fee is kept even on refunds.
 *
 * Formula (data/formulas/formulas-B.json :: tool-065, v1.0.0):
 *   direct:   per_unit_fee = sale_price*0.10 + 0.50 + (sale_price*0.029 + 0.30)
 *   discover: per_unit_fee = sale_price*0.30
 *   total_fees = per_unit_fee * quantity
 *   net_payout = sale_price * quantity - total_fees
 *
 * Rounding: half-up to 2 decimals (USD).
 */

export type SaleChannel = "direct" | "discover";

/** Channel ids accepted by the channel select (case-insensitive). */
export const CHANNEL_IDS: SaleChannel[] = ["direct", "discover"];

/**
 * Gumroad platform fee: 10% + $0.50 per unit on DIRECT sales (estimate).
 * Does not include card processing — that stacks on top.
 */
export const DIRECT_PLATFORM_RATE = 0.1;
export const DIRECT_PLATFORM_FIXED = 0.5;

/**
 * Card processing on DIRECT sales: 2.9% + $0.30 per unit (estimate).
 * Charged ON TOP of the platform fee.
 */
export const DIRECT_PROCESSING_RATE = 0.029;
export const DIRECT_PROCESSING_FIXED = 0.3;

/**
 * Discover fee: 30% flat per unit, processing INCLUDED (estimate).
 * Never add DIRECT_PROCESSING_* on top of this.
 */
export const DISCOVER_FLAT_RATE = 0.3;

/** Sanity guard: largest sale price / quantity the calculator will attempt. */
export const MAX_AMOUNT = 1e12;
export const MAX_QUANTITY = 1e9;

/** Output ids, kept in sync with meta.ts outputs. */
export const OUTPUT_IDS = ["gumroadFee", "processingFee", "totalFees", "netPayout"] as const;

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

function asChannel(value: unknown): SaleChannel | null {
  if (typeof value === "string") {
    const t = value.trim().toLowerCase();
    if ((CHANNEL_IDS as string[]).includes(t)) return t as SaleChannel;
  }
  return null;
}

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Run the Gumroad fee estimate.
 *
 * values in:
 *   salePrice   (required) finite number > 0 — unit sale price, USD
 *   saleChannel (required) one of direct/discover (case-insensitive)
 *   quantity    (optional)  finite integer >= 1 — units sold; defaults to 1
 *
 * values out: { gumroadFee, processingFee, totalFees, netPayout }
 */
export function runTool(values: Record<string, unknown>): RunResult {
  if (values === null || typeof values !== "object") {
    return { ok: false, error: "Please provide your sale details to calculate Gumroad fees." };
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

  const channel = asChannel(values["saleChannel"]);
  if (channel === null) {
    return {
      ok: false,
      error: "Please choose a sale channel (direct or discover) — the fee stack depends on it.",
    };
  }

  const rawQty = values["quantity"];
  const quantity =
    rawQty === undefined || rawQty === null || rawQty === "" ? 1 : asFiniteNumber(rawQty);
  if (quantity === null) {
    return { ok: false, error: "Quantity must be a whole number, 1 or more." };
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { ok: false, error: "Quantity must be a whole number, 1 or more." };
  }
  if (quantity > MAX_QUANTITY) {
    return { ok: false, error: `Quantity exceeds the sanity limit of ${MAX_QUANTITY}.` };
  }

  // Per-unit fee lines, each rounded to cents (half-up) before multiplying.
  const gumroadPerUnit =
    channel === "direct"
      ? round2(salePrice * DIRECT_PLATFORM_RATE + DIRECT_PLATFORM_FIXED)
      : round2(salePrice * DISCOVER_FLAT_RATE);
  const processingPerUnit =
    channel === "direct" ? round2(salePrice * DIRECT_PROCESSING_RATE + DIRECT_PROCESSING_FIXED) : 0;

  const gumroadFee = round2(gumroadPerUnit * quantity);
  const processingFee = round2(processingPerUnit * quantity);
  const totalFees = round2(gumroadFee + processingFee);
  const netPayout = round2(salePrice * quantity - totalFees);

  return {
    ok: true,
    values: { gumroadFee, processingFee, totalFees, netPayout },
  };
}
