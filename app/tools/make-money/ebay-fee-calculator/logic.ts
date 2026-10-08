/**
 * eBay Fee Calculator — pure logic (tool-057).
 *
 * HONESTY BOUNDARIES (also surfaced in meta.ts methodology/assumptions/FAQs):
 * - KNOWN UNRESOLVED DISCREPANCY: published sources disagree on the
 *   most-categories final value fee (13.6% vs 13.25% seen Jul 2026+). The
 *   calculator does NOT hardcode a disputed figure as fact: the
 *   most-categories default is 13.6% and is LABELED AN ESTIMATE, every fee
 *   input is user-editable, and the UI copy must say "estimate — verify
 *   current rates on eBay". Category rate overrides (15.3%, 6.7%) are likewise
 *   estimates, not official current rates.
 * - eBay fee schedules vary by category, store tier, and managed-payments
 *   terms; this is a simplified client-side model, not a quote.
 * - Deterministic: same inputs -> same outputs. Zero imports, zero network,
 *   zero DOM, no randomness.
 */

/** eBay categories modeled (each maps to a default FVF rate). */
export type EbayCategory = "most-categories" | "books-dvds-music" | "guitars-bass-guitars";

/**
 * Default final-value-fee rates in PERCENT by category.
 * All three are user-editable ESTIMATES — the most-categories 13.6% is the
 * disputed figure (some sources show 13.25%), and the category overrides are
 * simplified public figures, not a full eBay rate card.
 */
export const CATEGORY_DEFAULT_FVF: Record<EbayCategory, number> = {
  "most-categories": 13.6,
  "books-dvds-music": 15.3,
  "guitars-bass-guitars": 6.7,
};

/** Human labels for the category select. */
export const EBAY_CATEGORIES: ReadonlyArray<{ id: EbayCategory; label: string }> = [
  { id: "most-categories", label: "Most categories" },
  { id: "books-dvds-music", label: "Books, DVDs & music" },
  { id: "guitars-bass-guitars", label: "Guitars & bass guitars" },
];

/**
 * FVF tier threshold: the reduced rate applies to the portion of the total
 * sale amount above this value (per item).
 */
export const TIER_THRESHOLD = 7500;

/** Reduced FVF rate in percent on the portion above TIER_THRESHOLD. */
export const TIER_RATE = 2.35;

/** International transaction surcharge in percent (on total sale amount). */
export const INTERNATIONAL_SURCHARGE_RATE = 1.65;

/** Per-order fee when total sale amount is <= $10. */
export const PER_ORDER_FEE_LOW = 0.3;

/** Per-order fee when total sale amount is > $10. */
export const PER_ORDER_FEE_HIGH = 0.4;

/** Insertion fee per listing beyond the monthly free allowance (250). */
export const INSERTION_FEE_PER_LISTING = 0.35;

/** Sanity guard: largest total sale amount the calculator will attempt. */
export const MAX_TOTAL_SALE = 1e12;

/** Output ids returned by runTool — must equal the outputs ids in meta.ts. */
export const OUTPUT_IDS = [
  "finalValueFee",
  "perOrderFee",
  "insertionFee",
  "totalFees",
  "netPayout",
] as const;

/** Round to the nearest cent, half-up (positive values). */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Parsed, validated input for the eBay fee calculation. */
export interface EbayFeeInput {
  salePrice: number;
  shippingCharged: number;
  category: EbayCategory;
  /** User override for the FVF percent; null when the category default applies. */
  finalValueRate: number | null;
  internationalBuyer: boolean;
  listingsBeyondFree: number;
}

/** Full eBay fee breakdown for one order. */
export interface EbayFeeBreakdown {
  /** salePrice + shippingCharged. */
  totalSale: number;
  /** Final value fee (tiered + optional international surcharge). */
  finalValueFee: number;
  /** Per-order fee ($0.30 / $0.40 by total sale amount). */
  perOrderFee: number;
  /** Insertion fees for listings beyond the free allowance. */
  insertionFee: number;
  /** Sum of all fee lines. */
  totalFees: number;
  /** totalSale - totalFees. */
  netPayout: number;
  /** Assumption/estimate notes surfaced to the UI. */
  assumptions: string[];
}

type ParseResult =
  | { ok: true; input: EbayFeeInput }
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

  const shippingCharged = toFiniteNumber(values.shippingCharged ?? 0);
  if (shippingCharged === null || shippingCharged < 0) {
    return { ok: false, error: "Shipping charged must be a number of 0 or more." };
  }

  const rawCategory = values.category ?? "most-categories";
  const categoryIds = EBAY_CATEGORIES.map((c) => c.id);
  if (typeof rawCategory !== "string" || !categoryIds.includes(rawCategory as EbayCategory)) {
    return {
      ok: false,
      error: "Category must be one of: Most categories, Books, DVDs & music, Guitars & bass guitars.",
    };
  }
  const category = rawCategory as EbayCategory;

  let finalValueRate: number | null = null;
  if (values.finalValueRate !== undefined && values.finalValueRate !== null && values.finalValueRate !== "") {
    const rate = toFiniteNumber(values.finalValueRate);
    if (rate === null || rate <= 0 || rate > 100) {
      return { ok: false, error: "Final value fee rate must be a percent between 0 and 100." };
    }
    finalValueRate = rate;
  }

  const rawIntl = values.internationalBuyer ?? false;
  if (typeof rawIntl !== "boolean") {
    return { ok: false, error: "International buyer flag must be true or false." };
  }

  const listingsBeyondFree = toFiniteNumber(values.listingsBeyondFree ?? 0);
  if (listingsBeyondFree === null || !Number.isInteger(listingsBeyondFree) || listingsBeyondFree < 0) {
    return { ok: false, error: "Listings beyond the free allowance must be a whole number of 0 or more." };
  }

  return {
    ok: true,
    input: {
      salePrice,
      shippingCharged,
      category,
      finalValueRate,
      internationalBuyer: rawIntl,
      listingsBeyondFree,
    },
  };
}

/**
 * Calculate the eBay fee breakdown for one order.
 *
 * totalSale = salePrice + shippingCharged
 * finalValueFee = rate% * min(totalSale, 7500) + 2.35% * max(totalSale - 7500, 0)
 *                 + (internationalBuyer ? 1.65% * totalSale : 0)
 * perOrderFee = totalSale > 10 ? 0.40 : 0.30
 * insertionFee = listingsBeyondFree * 0.35
 * totalFees = finalValueFee + perOrderFee + insertionFee
 * netPayout = totalSale - totalFees
 */
export function calculateEbayFees(input: EbayFeeInput): EbayFeeBreakdown {
  const totalSale = roundToCents(input.salePrice + input.shippingCharged);
  if (totalSale > MAX_TOTAL_SALE) {
    throw new RangeError(
      `total sale amount ${totalSale} exceeds the sanity cap of ${MAX_TOTAL_SALE}.`,
    );
  }

  const rate = input.finalValueRate ?? CATEGORY_DEFAULT_FVF[input.category];
  const belowTier = Math.min(totalSale, TIER_THRESHOLD);
  const aboveTier = Math.max(totalSale - TIER_THRESHOLD, 0);
  let finalValueFee = (belowTier * rate) / 100 + (aboveTier * TIER_RATE) / 100;
  if (input.internationalBuyer) {
    finalValueFee += (totalSale * INTERNATIONAL_SURCHARGE_RATE) / 100;
  }
  finalValueFee = roundToCents(finalValueFee);

  const perOrderFee = totalSale > 10 ? PER_ORDER_FEE_HIGH : PER_ORDER_FEE_LOW;
  const insertionFee = roundToCents(input.listingsBeyondFree * INSERTION_FEE_PER_LISTING);

  const totalFees = roundToCents(finalValueFee + perOrderFee + insertionFee);
  const netPayout = roundToCents(totalSale - totalFees);

  const assumptions: string[] = [
    `Final value fee uses ${rate}% as an ESTIMATE${input.finalValueRate === null ? " (category default)" : " (your override)"} — published sources disagree (13.6% vs 13.25% for most categories), so this is an estimate, not eBay's current official rate. Verify on eBay.`,
    "The reduced 2.35% rate applies only to the portion of the total sale amount above $7,500 per item.",
    "Per-order fee: $0.30 when the total sale amount is $10 or less, $0.40 above $10.",
    "Insertion fees assume 250 free listings/month; only listings beyond the allowance are charged at $0.35 each.",
    input.internationalBuyer
      ? "A 1.65% international transaction surcharge estimate was added."
      : "No international surcharge added (buyer not marked international).",
    "Store-tier discounts, managed-payments terms, promoted-listing ad fees, and taxes are not modeled.",
    "eBay changes fee schedules by category and region — confirm current rates in eBay's official fee schedule before pricing decisions.",
  ];

  return {
    totalSale,
    finalValueFee,
    perOrderFee,
    insertionFee,
    totalFees,
    netPayout,
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
  try {
    const r = calculateEbayFees(parsed.input);
    return {
      ok: true,
      values: {
        finalValueFee: r.finalValueFee,
        perOrderFee: r.perOrderFee,
        insertionFee: r.insertionFee,
        totalFees: r.totalFees,
        netPayout: r.netPayout,
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Calculation failed.",
    };
  }
}
