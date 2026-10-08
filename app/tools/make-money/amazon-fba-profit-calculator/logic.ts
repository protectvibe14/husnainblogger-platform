/**
 * Amazon FBA Profit Calculator — pure logic (tool-059).
 *
 * HONESTY BOUNDARIES (also surfaced in meta.ts methodology/assumptions/FAQs):
 * - v1 does NOT hardcode Amazon's full FBA size/weight rate card (too
 *   granular) — the fulfillment fee is USER-ENTERED, labeled an estimate.
 * - The referral-rate default is 15% (electronics/computers are 8%, other
 *   categories differ) and is user-editable. The fuel-surcharge rate default
 *   is 3.5% and is user-editable. Never presented as official current rates.
 * - Storage cost is entered as a MONTHLY figure and folded into the per-unit
 *   fee total as a v1 approximation (per the formula record) — disclosed,
 *   not hidden.
 * - Seller-plan fee (Professional $39.99/mo vs Individual $0.99/item) is an
 *   optional separate line, not hardcoded into the math.
 * - Deterministic: same inputs -> same outputs. Zero imports, zero network,
 *   zero DOM, no randomness.
 */

/** Default referral-fee rate in percent (user-editable estimate). */
export const DEFAULT_REFERRAL_RATE = 15;

/** Default fuel-surcharge rate in percent of the fulfillment fee (editable). */
export const DEFAULT_FUEL_SURCHARGE_RATE = 3.5;

/** Sanity guard: largest sale price the calculator will attempt. */
export const MAX_SALE_PRICE = 1e12;

/** Output ids returned by runTool — must equal the outputs ids in meta.ts. */
export const OUTPUT_IDS = [
  "referralFee",
  "fuelSurcharge",
  "totalAmazonFees",
  "netProfitPerUnit",
  "monthlyProfit",
  "margin",
  "roi",
] as const;

/** Round money to the nearest cent, half-up (positive values). */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Round a percentage to 1 decimal, half-up. */
export function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Parsed, validated input for the FBA profit calculation. */
export interface FbaProfitInput {
  salePrice: number;
  referralRate: number; // percent
  fulfillmentFee: number;
  productCost: number;
  unitsPerMonth: number;
  storageCost: number; // monthly
  fuelSurchargeRate: number; // percent of fulfillmentFee
  otherFeesPerUnit: number;
}

/** Full FBA profit breakdown. */
export interface FbaProfitBreakdown {
  /** salePrice * referralRate. */
  referralFee: number;
  /** fulfillmentFee * fuelSurchargeRate. */
  fuelSurcharge: number;
  /** referralFee + fulfillmentFee + fuelSurcharge + storageCost + otherFeesPerUnit. */
  totalAmazonFees: number;
  /** salePrice - totalAmazonFees - productCost. */
  netProfitPerUnit: number;
  /** netProfitPerUnit * unitsPerMonth. */
  monthlyProfit: number;
  /** netProfitPerUnit / salePrice * 100 (1 decimal). */
  margin: number;
  /** netProfitPerUnit / productCost * 100 (1 decimal); null when cost is 0. */
  roi: number | null;
  /** Assumption/estimate notes surfaced to the UI. */
  assumptions: string[];
}

type ParseResult =
  | { ok: true; input: FbaProfitInput }
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

  const referralRate = toFiniteNumber(values.referralRate ?? DEFAULT_REFERRAL_RATE);
  if (referralRate === null || referralRate <= 0 || referralRate > 100) {
    return { ok: false, error: "Referral rate must be a percent between 0 and 100." };
  }

  const fulfillmentFee = toFiniteNumber(values.fulfillmentFee);
  if (fulfillmentFee === null) {
    return { ok: false, error: "Fulfillment fee must be a number — look it up for your size/weight tier in Amazon's fee table." };
  }
  if (fulfillmentFee < 0) {
    return { ok: false, error: "Fulfillment fee must be 0 or more." };
  }

  const productCost = toFiniteNumber(values.productCost ?? 0);
  if (productCost === null || productCost < 0) {
    return { ok: false, error: "Product cost must be a number of 0 or more." };
  }

  const unitsPerMonth = toFiniteNumber(values.unitsPerMonth ?? 0);
  if (unitsPerMonth === null || !Number.isInteger(unitsPerMonth) || unitsPerMonth < 0) {
    return { ok: false, error: "Units per month must be a whole number of 0 or more." };
  }

  const storageCost = toFiniteNumber(values.storageCost ?? 0);
  if (storageCost === null || storageCost < 0) {
    return { ok: false, error: "Storage cost must be a number of 0 or more." };
  }

  const fuelSurchargeRate = toFiniteNumber(values.fuelSurchargeRate ?? DEFAULT_FUEL_SURCHARGE_RATE);
  if (fuelSurchargeRate === null || fuelSurchargeRate < 0 || fuelSurchargeRate > 100) {
    return { ok: false, error: "Fuel surcharge rate must be a percent between 0 and 100." };
  }

  const otherFeesPerUnit = toFiniteNumber(values.otherFeesPerUnit ?? 0);
  if (otherFeesPerUnit === null || otherFeesPerUnit < 0) {
    return { ok: false, error: "Other fees per unit must be a number of 0 or more." };
  }

  return {
    ok: true,
    input: {
      salePrice,
      referralRate,
      fulfillmentFee,
      productCost,
      unitsPerMonth,
      storageCost,
      fuelSurchargeRate,
      otherFeesPerUnit,
    },
  };
}

/**
 * Calculate the Amazon FBA profit breakdown.
 *
 * referralFee      = salePrice * referralRate
 * fuelSurcharge    = fulfillmentFee * fuelSurchargeRate
 * totalAmazonFees  = referralFee + fulfillmentFee + fuelSurcharge +
 *                    storageCost + otherFeesPerUnit
 * netProfitPerUnit = salePrice - totalAmazonFees - productCost
 * monthlyProfit    = netProfitPerUnit * unitsPerMonth
 * margin           = netProfitPerUnit / salePrice * 100
 * roi              = netProfitPerUnit / productCost * 100 (null when cost = 0)
 */
export function calculateFbaProfit(input: FbaProfitInput): FbaProfitBreakdown {
  const referralFee = roundToCents((input.salePrice * input.referralRate) / 100);
  const fuelSurcharge = roundToCents((input.fulfillmentFee * input.fuelSurchargeRate) / 100);
  const totalAmazonFees = roundToCents(
    referralFee + input.fulfillmentFee + fuelSurcharge + input.storageCost + input.otherFeesPerUnit,
  );
  const netProfitPerUnit = roundToCents(input.salePrice - totalAmazonFees - input.productCost);
  const monthlyProfit = roundToCents(netProfitPerUnit * input.unitsPerMonth);
  const margin = roundToTenth((netProfitPerUnit / input.salePrice) * 100);
  const roi =
    input.productCost > 0 ? roundToTenth((netProfitPerUnit / input.productCost) * 100) : null;

  const assumptions: string[] = [
    "All fee figures are user-editable ESTIMATES — Amazon changes fees and they vary by category, size tier, and region. Verify in Amazon's official fee schedule.",
    `Referral default ${DEFAULT_REFERRAL_RATE}% (electronics/computers are 8%; other categories differ) — set it for your category.`,
    "Fulfillment fee is user-entered: v1 does not hardcode Amazon's size/weight rate card.",
    `Fuel surcharge default ${DEFAULT_FUEL_SURCHARGE_RATE}% of the fulfillment fee — user-editable estimate.`,
    "Storage cost is a MONTHLY figure folded into the per-unit total as a v1 approximation — for precise unit economics, divide monthly storage by your units and use 'other fees per unit' instead.",
    "Seller-plan fee (Professional $39.99/mo vs Individual $0.99/item) is not included — add it to 'other fees per unit' if you want it counted.",
    "Not modeled: inbound placement fees, low-inventory-level fees, returns/refunds, advertising (PPC), or taxes.",
    "All amounts are in USD.",
  ];

  return {
    referralFee,
    fuelSurcharge,
    totalAmazonFees,
    netProfitPerUnit,
    monthlyProfit,
    margin,
    roi,
    assumptions,
  };
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
  const r = calculateFbaProfit(parsed.input);
  return {
    ok: true,
    values: {
      referralFee: r.referralFee,
      fuelSurcharge: r.fuelSurcharge,
      totalAmazonFees: r.totalAmazonFees,
      netProfitPerUnit: r.netProfitPerUnit,
      monthlyProfit: r.monthlyProfit,
      margin: r.margin,
      roi: r.roi,
    },
  };
}
