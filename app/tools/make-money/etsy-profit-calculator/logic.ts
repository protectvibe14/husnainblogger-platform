/**
 * Etsy Profit Calculator — pure logic (tool-056).
 *
 * Fee engine shared with tool-055 (Etsy Fee Calculator): same fee lines,
 * same per-line rounding to the nearest cent (half-up), same exclusions —
 * plus item cost (COGS) and shipping label cost so the headline result is
 * NET PROFIT per sale instead of fees alone.
 *
 * HONESTY BOUNDARIES (also surfaced in meta.ts methodology/assumptions/FAQs):
 * - Every fee rate below is a DEFAULT from Etsy's published fee schedule
 *   (last verified 2026-10-01). Etsy can change fees at any time, so every
 *   fee input is user-editable and every result is labeled an ESTIMATE.
 * - The Etsy REGULATORY OPERATING FEE (0.05%-1.97%, region-specific) and
 *   the +2.5% regulated-category surcharge are deliberately EXCLUDED from
 *   v1 — the calculator says so in its assumptions and FAQ instead of
 *   pretending the fee set is complete.
 * - Amounts are expressed in the seller-country currency. No FX conversion.
 * - Deterministic: same inputs -> same outputs. Zero imports, zero network,
 *   zero DOM, no randomness.
 */

/** Supported seller countries (drive the payment-processing schedule). */
export type SellerCountry = "US" | "UK" | "DE" | "FR" | "CA" | "AU";

/** Payment-processing schedule: rate on gross + flat per-order fee. */
export interface ProcessingSchedule {
  rate: number; // fractional, e.g. 0.03 = 3%
  fixed: number; // flat per-order fee, in the country's currency
  currency: string; // ISO code the fixed fee is charged in
}

/**
 * Default payment-processing schedules by seller country.
 * Same rule set as tool-055 (Etsy published schedule, last verified
 * 2026-10-01): US 3% + $0.25, UK 4% + £0.20, DE/FR 4% + €0.30,
 * CA 3% + CA$0.25, AU 3% + A$0.25. All rates are user-editable ESTIMATES.
 */
export const ETSY_PROCESSING_SCHEDULES: Record<SellerCountry, ProcessingSchedule> = {
  US: { rate: 0.03, fixed: 0.25, currency: "USD" },
  UK: { rate: 0.04, fixed: 0.2, currency: "GBP" },
  DE: { rate: 0.04, fixed: 0.3, currency: "EUR" },
  FR: { rate: 0.04, fixed: 0.3, currency: "EUR" },
  CA: { rate: 0.03, fixed: 0.25, currency: "CAD" },
  AU: { rate: 0.03, fixed: 0.25, currency: "AUD" },
};

/** Default listing fee per item sold (Etsy published schedule). Editable. */
export const DEFAULT_LISTING_FEE = 0.2;

/** Default transaction-fee rate in percent (Etsy published: 6.5%). Editable. */
export const DEFAULT_TRANSACTION_FEE_RATE = 6.5;

/**
 * Default Offsite Ads fee rate in percent for sellers under $10k annual
 * sales (15%; 12% at/above $10k — selectable via offsiteAdsRate). Editable.
 * Applied ONLY when the sale was attributed to an offsite ad.
 */
export const DEFAULT_OFFSITE_ADS_RATE = 15;
export const OFFSITE_ADS_RATE_HIGH_VOLUME = 12;

/** Offsite Ads fee is capped at 100 (currency units) per attributed order. */
export const OFFSITE_ADS_CAP = 100;

/** Sanity guard: largest gross amount the calculator will attempt. */
export const MAX_GROSS_AMOUNT = 1e12;

/** Valid seller-country codes (for validation). */
export const SELLER_COUNTRIES: ReadonlyArray<SellerCountry> = [
  "US",
  "UK",
  "DE",
  "FR",
  "CA",
  "AU",
];

/**
 * Round to the nearest cent, half-up. Math.round is half-up for positive
 * values; negative values round half away from zero (documented here,
 * matches tool-055).
 */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Parsed, validated input for the Etsy profit calculation. */
export interface EtsyProfitInput {
  salePrice: number;
  itemCost: number;
  shippingCharged: number;
  shippingLabelCost: number;
  sellerCountry: SellerCountry;
  transactionFeeRate: number; // percent
  listingFee: number;
  processingRate: number; // percent
  processingFixed: number;
  offsiteAdsAttributed: boolean;
  offsiteAdsRate: number; // percent
}

/** Full profit breakdown for one Etsy sale. */
export interface EtsyProfitBreakdown {
  currency: string;
  /** salePrice + shippingCharged. */
  grossRevenue: number;
  /** Listing fee for this sale. */
  listingFee: number;
  /** Transaction fee on the gross amount. */
  transactionFee: number;
  /** Payment-processing fee for the seller's country / custom inputs. */
  processingFee: number;
  /** Offsite Ads fee (0 unless attributed). */
  offsiteAdsFee: number;
  /** Sum of all fee lines (each rounded to cents before summing). */
  totalFees: number;
  /** itemCost + shippingLabelCost + totalFees. */
  totalCosts: number;
  /** grossRevenue - totalCosts. May be negative (shown with a warning). */
  netProfit: number;
  /** netProfit / grossRevenue * 100, 1 decimal (0 when gross is 0). */
  profitMargin: number;
  /** Non-empty when the sale loses money at these inputs. */
  warning: string;
  /** Assumption/estimate notes surfaced to the UI. */
  assumptions: string[];
}

type ParseResult =
  | { ok: true; input: EtsyProfitInput }
  | { ok: false; error: string };

/** Coerce a raw value to a finite number, or return null when not numeric. */
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

/**
 * Parse and validate raw tool values. Returns the first human-readable
 * validation error encountered.
 */
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

  const itemCost = toFiniteNumber(values.itemCost ?? 0);
  if (itemCost === null || itemCost < 0) {
    return { ok: false, error: "Item cost must be a number of 0 or more." };
  }

  const shippingCharged = toFiniteNumber(values.shippingCharged ?? 0);
  if (shippingCharged === null || shippingCharged < 0) {
    return { ok: false, error: "Shipping charged must be a number of 0 or more." };
  }

  const shippingLabelCost = toFiniteNumber(values.shippingLabelCost ?? 0);
  if (shippingLabelCost === null || shippingLabelCost < 0) {
    return { ok: false, error: "Shipping label cost must be a number of 0 or more." };
  }

  const rawCountry = values.sellerCountry ?? "US";
  if (typeof rawCountry !== "string" || !(SELLER_COUNTRIES as ReadonlyArray<string>).includes(rawCountry)) {
    return {
      ok: false,
      error: "Seller country must be one of: US, UK, DE, FR, CA, AU.",
    };
  }
  const sellerCountry = rawCountry as SellerCountry;
  const schedule = ETSY_PROCESSING_SCHEDULES[sellerCountry];

  const transactionFeeRate = toFiniteNumber(values.transactionFeeRate ?? DEFAULT_TRANSACTION_FEE_RATE);
  if (transactionFeeRate === null || transactionFeeRate <= 0 || transactionFeeRate > 100) {
    return { ok: false, error: "Transaction fee rate must be a percent between 0 and 100." };
  }

  const listingFee = toFiniteNumber(values.listingFee ?? DEFAULT_LISTING_FEE);
  if (listingFee === null || listingFee < 0) {
    return { ok: false, error: "Listing fee must be a number of 0 or more." };
  }

  // Processing rate/fixed default to the selected country's schedule and
  // are user-editable estimates.
  const processingRate = toFiniteNumber(values.processingRate ?? schedule.rate * 100);
  if (processingRate === null || processingRate < 0 || processingRate > 100) {
    return { ok: false, error: "Processing rate must be a percent between 0 and 100." };
  }
  const processingFixed = toFiniteNumber(values.processingFixed ?? schedule.fixed);
  if (processingFixed === null || processingFixed < 0) {
    return { ok: false, error: "Processing fixed fee must be a number of 0 or more." };
  }

  const rawOffsite = values.offsiteAdsAttributed ?? false;
  if (typeof rawOffsite !== "boolean") {
    return { ok: false, error: "Offsite ads flag must be true or false." };
  }

  const offsiteAdsRate = toFiniteNumber(values.offsiteAdsRate ?? DEFAULT_OFFSITE_ADS_RATE);
  if (offsiteAdsRate === null || offsiteAdsRate <= 0 || offsiteAdsRate > 100) {
    return { ok: false, error: "Offsite ads rate must be a percent between 0 and 100." };
  }

  return {
    ok: true,
    input: {
      salePrice,
      itemCost,
      shippingCharged,
      shippingLabelCost,
      sellerCountry,
      transactionFeeRate,
      listingFee,
      processingRate,
      processingFixed,
      offsiteAdsAttributed: rawOffsite,
      offsiteAdsRate,
    },
  };
}

/**
 * Calculate the Etsy profit breakdown for one sale.
 *
 * gross = salePrice + shippingCharged
 * totalFees = listingFee + transactionFee(gross * rate) +
 *             processingFee(gross * rate + fixed) + offsiteAdsFee
 * totalCosts = itemCost + shippingLabelCost + totalFees
 * netProfit = gross - totalCosts
 * profitMargin = netProfit / gross * 100
 */
export function calculateEtsyProfit(input: EtsyProfitInput): EtsyProfitBreakdown {
  const assumptions: string[] = [];
  const schedule = ETSY_PROCESSING_SCHEDULES[input.sellerCountry];

  // Fractional-cent inputs are rounded to cents (half-up) first.
  const price = roundToCents(input.salePrice);
  const shipping = roundToCents(input.shippingCharged);
  const cost = roundToCents(input.itemCost);
  const label = roundToCents(input.shippingLabelCost);
  if (price !== input.salePrice || shipping !== input.shippingCharged) {
    assumptions.push(
      "Sale price / shipping charged were rounded to the nearest cent (half-up) before calculation.",
    );
  }

  const grossRevenue = roundToCents(price + shipping);
  if (grossRevenue > MAX_GROSS_AMOUNT) {
    throw new RangeError(
      `gross amount ${grossRevenue} exceeds the sanity cap of ${MAX_GROSS_AMOUNT}.`,
    );
  }

  const listingFee = roundToCents(input.listingFee);
  const transactionFee = roundToCents(grossRevenue * (input.transactionFeeRate / 100));
  const processingFee = roundToCents(
    grossRevenue * (input.processingRate / 100) + input.processingFixed,
  );
  const offsiteAdsFee = input.offsiteAdsAttributed
    ? roundToCents(Math.min(grossRevenue * (input.offsiteAdsRate / 100), OFFSITE_ADS_CAP))
    : 0;

  const totalFees = roundToCents(listingFee + transactionFee + processingFee + offsiteAdsFee);
  const totalCosts = roundToCents(cost + label + totalFees);
  const netProfit = roundToCents(grossRevenue - totalCosts);
  const profitMargin =
    grossRevenue === 0 ? 0 : Math.round((netProfit / grossRevenue) * 1000) / 10;

  const warning =
    netProfit < 0
      ? "Warning: at these inputs your costs exceed the sale price — this sale loses money."
      : "";

  assumptions.push(
    "Estimate based on Etsy's published fee schedule (fee rates editable above), last verified 2026-10-01. Not financial advice.",
    `All amounts are in ${schedule.currency} (seller-country currency). No FX conversion is performed.`,
    "Each fee line is rounded to the nearest cent (half-up) before summing.",
    "Offsite Ads fee applies only when the sale is attributed to an offsite ad (15% default for sellers under $10k annual sales, 12% at/above).",
    "EXCLUDED from v1: the regulatory operating fee (0.05%-1.97%, region-specific) and the +2.5% regulated-category surcharge — actual Etsy fees may be higher.",
    "Packaging, labor, taxes, and other overheads beyond item cost and the shipping label are not modeled — add them to your item cost.",
    "Etsy can change fees at any time — verify current fees on Etsy's official fee page before pricing decisions.",
  );

  return {
    currency: schedule.currency,
    grossRevenue,
    listingFee,
    transactionFee,
    processingFee,
    offsiteAdsFee,
    totalFees,
    totalCosts,
    netProfit,
    profitMargin,
    warning,
    assumptions,
  };
}

/** Output ids returned by runTool — must equal the outputs ids in meta.ts. */
export const OUTPUT_IDS = [
  "totalFees",
  "totalCosts",
  "netProfit",
  "profitMargin",
  "warning",
] as const;

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
  try {
    const r = calculateEtsyProfit(parsed.input);
    return {
      ok: true,
      values: {
        totalFees: r.totalFees,
        totalCosts: r.totalCosts,
        netProfit: r.netProfit,
        profitMargin: r.profitMargin,
        warning: r.warning,
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Calculation failed.",
    };
  }
}
