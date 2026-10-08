/**
 * Etsy Fee Calculator — pure logic (tool-055).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Plain arithmetic only.
 * - Fee values are constants below, each with a source comment pointing at
 *   data/platform-rules/etsy.json (ruleId, effective date, last-verified
 *   date). Update the constants when the platform-rules file changes.
 * - The calculator works in ONE currency: the fixed payment-processing fee is
 *   charged in the seller-country currency (US: USD, UK: GBP, DE/FR: EUR,
 *   CA: CAD, AU: AUD). No FX conversion is performed anywhere.
 * - Transaction fee base is item price + shipping charged (gift wrap not
 *   modeled). The regulatory operating fee (0.05%-1.97%, region-specific) and
 *   the regulated-category surcharge (+2.5%) are deliberately EXCLUDED and
 *   surfaced in assumptions[].
 * - Each fee line is rounded to the nearest cent (half-up) BEFORE summing.
 *   Fractional-cent inputs are rounded to cents (half-up) first; the
 *   assumption is surfaced in assumptions[].
 * - Results are ESTIMATES based on the published fee schedule, not exact
 *   fees: Etsy can change fees at any time.
 */

/** Supported seller countries (drives the payment-processing schedule). */
export type SellerCountry = "US" | "UK" | "DE" | "FR" | "CA" | "AU";

/**
 * Payment-processing schedule per seller country.
 * rate: fractional rate applied to the gross sale amount.
 * fixed: flat per-order fee in the country's currency.
 * currency: ISO code of the currency the fixed fee is charged in.
 */
export interface ProcessingSchedule {
  rate: number;
  fixed: number;
  currency: string;
}

/**
 * Listing fee: $0.20 per listing.
 * Source: platform-rules/etsy.json -> etsy-listing-fee (value 0.20 usd),
 * effectiveDate 2026-02-13, lastVerified 2026-10-01.
 */
export const ETSY_LISTING_FEE = 0.2;

/**
 * Transaction fee: 6.5% of (item price + shipping charged + gift wrap).
 * Source: platform-rules/etsy.json -> etsy-transaction-fee (value 6.5 percent),
 * effectiveDate 2026-02-13, lastVerified 2026-10-01.
 */
export const ETSY_TRANSACTION_FEE_RATE = 0.065;

/**
 * Payment-processing schedules by seller country.
 * Sources: platform-rules/etsy.json -> etsy-processing-fee-us (3% + $0.25),
 * etsy-processing-fee-uk (4% + £0.20), etsy-processing-fee-de-fr (4% + €0.30),
 * etsy-processing-fee-ca-au (3% + CA$0.25 / A$0.25). All lastVerified
 * 2026-10-01. Note: per-order, on total sale amount incl. shipping.
 */
export const ETSY_PROCESSING_SCHEDULES: Record<SellerCountry, ProcessingSchedule> = {
  US: { rate: 0.03, fixed: 0.25, currency: "USD" },
  UK: { rate: 0.04, fixed: 0.2, currency: "GBP" },
  DE: { rate: 0.04, fixed: 0.3, currency: "EUR" },
  FR: { rate: 0.04, fixed: 0.3, currency: "EUR" },
  CA: { rate: 0.03, fixed: 0.25, currency: "CAD" },
  AU: { rate: 0.03, fixed: 0.25, currency: "AUD" },
};

/**
 * Offsite Ads fee rate for sellers under $10k annual sales (can opt out).
 * Source: platform-rules/etsy.json -> etsy-offsite-ads-fee, effectiveDate
 * 2020-01-01, lastVerified 2026-10-01.
 */
export const ETSY_OFFSITE_ADS_RATE_STANDARD = 0.15;

/**
 * Offsite Ads fee rate for sellers at/above $10k annual sales (mandatory).
 * Source: platform-rules/etsy.json -> etsy-offsite-ads-fee (same rule).
 */
export const ETSY_OFFSITE_ADS_RATE_HIGH_VOLUME = 0.12;

/**
 * Offsite Ads fee is capped at $100 per attributed order.
 * Source: platform-rules/etsy.json -> etsy-offsite-ads-fee (same rule).
 */
export const ETSY_OFFSITE_ADS_CAP = 100;

/** Largest gross amount the calculator will attempt (sanity guard). */
export const MAX_GROSS_AMOUNT = 1e12;

/**
 * Input for the Etsy fee calculation.
 */
export interface EtsyFeeInput {
  /** Item sale price (per unit). Must be a finite number > 0. */
  itemPrice: number;
  /** Number of units sold. Integer >= 1. Defaults to 1. */
  quantity?: number;
  /** Shipping amount charged to the buyer. >= 0. Defaults to 0. */
  shippingCharged?: number;
  /** Seller country (drives processing schedule). Defaults to "US". */
  sellerCountry?: SellerCountry;
  /**
   * True when this sale is attributed to an Offsite Ad (seller enrolled).
   * Defaults to false.
   */
  offsiteAdsAttributed?: boolean;
  /**
   * Offsite Ads rate: 0.15 for <$10k/yr sellers, 0.12 for >=$10k/yr sellers.
   * Defaults to 0.15.
   */
  offsiteAdsRate?: typeof ETSY_OFFSITE_ADS_RATE_STANDARD | typeof ETSY_OFFSITE_ADS_RATE_HIGH_VOLUME;
}

/**
 * Full fee breakdown for one Etsy sale.
 */
export interface EtsyFeeBreakdown {
  /** Currency the amounts are expressed in (seller-country currency). */
  currency: string;
  /** Gross sale amount: itemPrice * quantity + shippingCharged. */
  grossRevenue: number;
  /** Listing fee: $0.20 * quantity. */
  listingFee: number;
  /** Transaction fee: 6.5% of gross. */
  transactionFee: number;
  /** Payment-processing fee for the seller's country. */
  paymentProcessingFee: number;
  /** Offsite Ads fee (0 unless the sale was ad-attributed). */
  offsiteAdsFee: number;
  /** Sum of all fee lines (each rounded to cents before summing). */
  totalFees: number;
  /** Gross minus total fees. Excludes COGS and shipping label cost. */
  netProfit: number;
  /** netProfit / grossRevenue * 100 (0 when gross is 0). */
  marginPct: number;
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
 * Calculate the full Etsy fee breakdown for one sale.
 *
 * @param input - itemPrice, quantity, shippingCharged, sellerCountry.
 * @returns Full fee breakdown with assumptions surfaced for the UI.
 * @throws {TypeError} for non-numeric / non-finite inputs or unknown country.
 * @throws {RangeError} for itemPrice <= 0, quantity < 1 / non-integer,
 *   negative shipping, or gross above the sanity cap.
 */
export function calculateEtsyFees(input: EtsyFeeInput): EtsyFeeBreakdown {
  if (input === null || typeof input !== "object") {
    throw new TypeError("input must be an object.");
  }
  const {
    itemPrice,
    quantity = 1,
    shippingCharged = 0,
    sellerCountry = "US",
    offsiteAdsAttributed = false,
    offsiteAdsRate = ETSY_OFFSITE_ADS_RATE_STANDARD,
  } = input;

  assertFiniteNumber("itemPrice", itemPrice);
  assertFiniteNumber("quantity", quantity);
  assertFiniteNumber("shippingCharged", shippingCharged);

  if (itemPrice <= 0) {
    throw new RangeError(`itemPrice must be greater than 0 (got ${itemPrice}).`);
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new RangeError(`quantity must be an integer >= 1 (got ${quantity}).`);
  }
  if (shippingCharged < 0) {
    throw new RangeError(`shippingCharged must be >= 0 (got ${shippingCharged}).`);
  }
  if (!(sellerCountry in ETSY_PROCESSING_SCHEDULES)) {
    throw new TypeError(
      `sellerCountry must be one of US/UK/DE/FR/CA/AU (got ${String(sellerCountry)}).`,
    );
  }
  if (
    offsiteAdsRate !== ETSY_OFFSITE_ADS_RATE_STANDARD &&
    offsiteAdsRate !== ETSY_OFFSITE_ADS_RATE_HIGH_VOLUME
  ) {
    throw new RangeError(
      `offsiteAdsRate must be 0.15 (<$10k/yr) or 0.12 (>=$10k/yr) (got ${offsiteAdsRate}).`,
    );
  }

  const assumptions: string[] = [];

  // Inputs with more than 2 decimals are rounded to cents (half-up) first.
  const price = roundToCents(itemPrice);
  const shipping = roundToCents(shippingCharged);
  if (price !== itemPrice || shipping !== shippingCharged) {
    assumptions.push(
      "Price/shipping inputs were rounded to the nearest cent (half-up) before calculation.",
    );
  }

  const grossRevenue = roundToCents(price * quantity + shipping);
  if (grossRevenue > MAX_GROSS_AMOUNT) {
    throw new RangeError(
      `gross amount ${grossRevenue} exceeds the sanity cap of ${MAX_GROSS_AMOUNT}.`,
    );
  }

  const schedule = ETSY_PROCESSING_SCHEDULES[sellerCountry as SellerCountry];
  const listingFee = roundToCents(ETSY_LISTING_FEE * quantity);
  const transactionFee = roundToCents(grossRevenue * ETSY_TRANSACTION_FEE_RATE);
  const paymentProcessingFee = roundToCents(grossRevenue * schedule.rate + schedule.fixed);
  const offsiteAdsFee = offsiteAdsAttributed
    ? roundToCents(Math.min(grossRevenue * offsiteAdsRate, ETSY_OFFSITE_ADS_CAP))
    : 0;

  const totalFees = roundToCents(listingFee + transactionFee + paymentProcessingFee + offsiteAdsFee);
  const netProfit = roundToCents(grossRevenue - totalFees);
  const marginPct = grossRevenue === 0 ? 0 : roundToCents((netProfit / grossRevenue) * 100);

  assumptions.push(
    "Estimate based on Etsy's published fee schedule (listing $0.20, transaction 6.5%, processing per country), last verified 2026-10-01. Not financial advice.",
    `All amounts are in ${schedule.currency} (seller-country currency). No FX conversion is performed.`,
    "Each fee line is rounded to the nearest cent (half-up) before summing.",
    "Offsite Ads fee applies only when the sale is attributed to an offsite ad; the 15% rate is for sellers under $10k annual sales, 12% at/above.",
    "Excludes the regulatory operating fee (0.05%-1.97%, region-specific), the +2.5% regulated-category surcharge, product cost, and shipping label cost.",
    "Etsy can change fees at any time -- confirm current fees on Etsy's official fee page before pricing decisions.",
  );

  return {
    currency: schedule.currency,
    grossRevenue,
    listingFee,
    transactionFee,
    paymentProcessingFee,
    offsiteAdsFee,
    totalFees,
    netProfit,
    marginPct,
    assumptions,
  };
}

// ---------------------------------------------------------------------------
// runTool adapter (tool platform contract)
// ---------------------------------------------------------------------------

/**
 * Offsite Ads tier options, exactly as they appear in meta.ts inputs.
 * Standard tier: sellers under $10k annual sales (15%). High-volume tier:
 * sellers at/above $10k annual sales (12%).
 */
export const OFFSITE_TIER_STANDARD = "Under $10k/yr sales — 15% rate";
export const OFFSITE_TIER_HIGH_VOLUME = "$10k+/yr sales — 12% rate";
export const OFFSITE_TIER_OPTIONS: readonly string[] = [
  OFFSITE_TIER_STANDARD,
  OFFSITE_TIER_HIGH_VOLUME,
] as const;

function isPlainRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

/**
 * runTool({ itemPrice, quantity?, shippingCharged?, sellerCountry?,
 *           offsiteAdsAttributed?, offsiteAdsTier? })
 *
 * Maps the platform's flat values record onto calculateEtsyFees and returns
 * the exact output ids declared in meta.ts. On invalid input returns
 * { ok: false, error } with a human message — never throws.
 *
 * NOTE: the regulatory operating fee (0.05%-1.97%, region-specific) and the
 * +2.5% regulated-category surcharge are EXCLUDED from this v1 calculation,
 * per the spec. The exclusion is disclosed in content.methodology,
 * content.assumptions, and the FAQ in meta.ts.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!isPlainRecord(values)) {
    return fail("Input must be an object with your values.");
  }

  const rawPrice = values["itemPrice"];
  if (rawPrice === undefined || rawPrice === null || rawPrice === "") {
    return fail("Item price is required — enter the sale price per item (e.g. 25).");
  }
  if (typeof rawPrice !== "number" || Number.isNaN(rawPrice)) {
    return fail("Item price must be a number (e.g. 25).");
  }
  if (!Number.isFinite(rawPrice)) {
    return fail("Item price must be finite — Infinity is not a valid price.");
  }
  if (rawPrice <= 0) {
    return fail("Item price must be greater than 0.");
  }

  const rawQty = values["quantity"];
  let quantity = 1;
  if (rawQty !== undefined && rawQty !== null && rawQty !== "") {
    if (typeof rawQty !== "number" || Number.isNaN(rawQty) || !Number.isFinite(rawQty)) {
      return fail("Quantity must be a whole number (1, 2, 3, ...).");
    }
    if (!Number.isInteger(rawQty) || rawQty < 1) {
      return fail("Quantity must be a whole number of 1 or more.");
    }
    quantity = rawQty;
  }

  const rawShipping = values["shippingCharged"];
  let shippingCharged = 0;
  if (rawShipping !== undefined && rawShipping !== null && rawShipping !== "") {
    if (typeof rawShipping !== "number" || Number.isNaN(rawShipping) || !Number.isFinite(rawShipping)) {
      return fail("Shipping charged must be a number (e.g. 5).");
    }
    if (rawShipping < 0) {
      return fail("Shipping charged cannot be negative.");
    }
    shippingCharged = rawShipping;
  }

  const rawCountry = values["sellerCountry"];
  let sellerCountry: SellerCountry = "US";
  if (rawCountry !== undefined && rawCountry !== null && rawCountry !== "") {
    if (typeof rawCountry !== "string" || !(rawCountry in ETSY_PROCESSING_SCHEDULES)) {
      return fail(
        `Seller country must be one of US, UK, DE, FR, CA, AU (got ${String(rawCountry)}).`,
      );
    }
    sellerCountry = rawCountry as SellerCountry;
  }

  const rawAttributed = values["offsiteAdsAttributed"];
  let offsiteAdsAttributed = false;
  if (rawAttributed !== undefined && rawAttributed !== null && rawAttributed !== "") {
    if (typeof rawAttributed !== "boolean") {
      return fail("Offsite Ads attributed must be a true/false choice.");
    }
    offsiteAdsAttributed = rawAttributed;
  }

  const rawTier = values["offsiteAdsTier"];
  let offsiteAdsRate: typeof ETSY_OFFSITE_ADS_RATE_STANDARD | typeof ETSY_OFFSITE_ADS_RATE_HIGH_VOLUME =
    ETSY_OFFSITE_ADS_RATE_STANDARD;
  if (rawTier !== undefined && rawTier !== null && rawTier !== "") {
    if (rawTier === OFFSITE_TIER_STANDARD) {
      offsiteAdsRate = ETSY_OFFSITE_ADS_RATE_STANDARD;
    } else if (rawTier === OFFSITE_TIER_HIGH_VOLUME) {
      offsiteAdsRate = ETSY_OFFSITE_ADS_RATE_HIGH_VOLUME;
    } else {
      return fail(
        `Offsite Ads tier must be one of: ${OFFSITE_TIER_OPTIONS.join(" | ")}.`,
      );
    }
  }

  let breakdown: EtsyFeeBreakdown;
  try {
    breakdown = calculateEtsyFees({
      itemPrice: rawPrice,
      quantity,
      shippingCharged,
      sellerCountry,
      offsiteAdsAttributed,
      offsiteAdsRate,
    });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Could not calculate the fees.");
  }

  return {
    ok: true,
    values: {
      grossRevenue: breakdown.grossRevenue,
      listingFee: breakdown.listingFee,
      transactionFee: breakdown.transactionFee,
      processingFee: breakdown.paymentProcessingFee,
      offsiteAdsFee: breakdown.offsiteAdsFee,
      totalFees: breakdown.totalFees,
      netPayout: breakdown.netProfit,
    },
  };
}
