/**
 * KDP & eBook Royalty Calculator — pure logic (tool-060).
 *
 * Royalty-schedule engine:
 *   ebook:     price inside the 70% band -> price * 70% - delivery fee
 *              price outside the band   -> price * 35% (auto-switch, notice)
 *   paperback: price * paperback rate - printing cost
 *
 * HONESTY BOUNDARIES (also surfaced in meta.ts methodology/assumptions/FAQs):
 * - KNOWN UNVERIFIED: a $12.99 ceiling for the 70% tier was claimed by one
 *   source but is UNVERIFIED — the default 70% band is $2.99–$9.99 (public
 *   KDP schedule) and the band bounds are user-editable. Never presented
 *   as confirmed KDP terms.
 * - Paperback royalty band boundary under $9.98 is disputed across sources —
 *   the 60% rate is a user-editable estimate labeled as such.
 * - Delivery fee ($0.15/MB default, editable) applies only inside the 70%
 *   tier; the royalty is floored at $0 when the delivery fee would exceed it.
 * - Same schedule is applied for every marketplace in v1 — KDP terms can
 *   differ by territory; the user must verify current KDP terms.
 * - KU page-read revenue is not in the math (mentioned as a separate line).
 * - Deterministic: same inputs -> same outputs. Zero imports, zero network,
 *   zero DOM, no randomness.
 */

/** Book format driving the royalty schedule. */
export type BookFormat = "ebook" | "paperback";

/** Paperback ink type driving the per-page print rate. */
export type InkType = "bw" | "standard" | "premium";

/** Royalty territory (same schedule applied for all in v1 — disclosed). */
export type Marketplace = "US" | "UK" | "DE" | "FR" | "CA" | "AU";

/** Default 70% royalty rate in percent (user-editable estimate). */
export const DEFAULT_ROYALTY_70 = 70;

/** Default 35% royalty rate in percent (user-editable estimate). */
export const DEFAULT_ROYALTY_35 = 35;

/** Default lower bound of the ebook 70% band (user-editable). */
export const DEFAULT_BAND_MIN = 2.99;

/** Default upper bound of the ebook 70% band (user-editable). */
export const DEFAULT_BAND_MAX = 9.99;

/** Default delivery fee per MB in the 70% tier (user-editable). */
export const DEFAULT_DELIVERY_PER_MB = 0.15;

/** Default paperback royalty rate in percent (user-editable estimate). */
export const DEFAULT_PAPERBACK_ROYALTY = 60;

/** Default fixed print cost per paperback copy (user-editable). */
export const DEFAULT_PRINT_FIXED = 1.0;

/**
 * Per-page print rates by ink type (documented KDP print-cost structure).
 * Kept as fixed documented values; assumptions tell the user to confirm
 * on KDP because the paperback band itself is disputed.
 */
export const INK_RATES: Record<InkType, number> = {
  bw: 0.012,
  standard: 0.0255,
  premium: 0.065,
};

/** Human labels for selects. */
export const FORMATS: ReadonlyArray<BookFormat> = ["ebook", "paperback"];
export const INK_TYPES: ReadonlyArray<InkType> = ["bw", "standard", "premium"];
export const MARKETPLACES: ReadonlyArray<Marketplace> = ["US", "UK", "DE", "FR", "CA", "AU"];

/** Sanity guard: largest list price the calculator will attempt. */
export const MAX_LIST_PRICE = 1e12;

/** Output ids returned by runTool — must equal the outputs ids in meta.ts. */
export const OUTPUT_IDS = ["royaltyPerSale", "royaltyRateApplied", "printingCost", "notice"] as const;

/** Round to the nearest cent, half-up (positive values). */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Parsed, validated input for the KDP royalty calculation. */
export interface KdpRoyaltyInput {
  format: BookFormat;
  listPrice: number;
  royaltyRate70: number;
  royaltyRate35: number;
  bandMin: number;
  bandMax: number;
  fileSizeMB: number;
  deliveryFeePerMB: number;
  pageCount: number;
  inkType: InkType;
  paperbackRoyaltyRate: number;
  printFixedFee: number;
  marketplace: Marketplace;
}

/** Royalty breakdown for one sale. */
export interface KdpRoyaltyBreakdown {
  /** Royalty earned per sale (floored at 0). */
  royaltyPerSale: number;
  /** The royalty rate that was actually applied. */
  royaltyRateApplied: number;
  /** Paperback printing cost ($0 for ebooks). */
  printingCost: number;
  /** Human notice for auto-switch / floor / unverified items ("" when none). */
  notice: string;
  /** Assumption/estimate notes surfaced to the UI. */
  assumptions: string[];
}

type ParseResult =
  | { ok: true; input: KdpRoyaltyInput }
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

function parseRate(value: unknown, fallback: number, label: string): number | null {
  const n = toFiniteNumber(value ?? fallback);
  return n === null || n <= 0 || n > 100 ? null : n;
}

function parseValues(values: Record<string, unknown>): ParseResult {
  if (values === null || typeof values !== "object") {
    return { ok: false, error: "No input values were provided." };
  }

  const rawFormat = values.format ?? "ebook";
  if (typeof rawFormat !== "string" || !(FORMATS as ReadonlyArray<string>).includes(rawFormat)) {
    return { ok: false, error: "Format must be 'ebook' or 'paperback'." };
  }
  const format = rawFormat as BookFormat;

  const listPrice = toFiniteNumber(values.listPrice);
  if (listPrice === null) {
    return { ok: false, error: "List price must be a number." };
  }
  if (listPrice <= 0) {
    return { ok: false, error: "List price must be greater than 0." };
  }
  if (listPrice > MAX_LIST_PRICE) {
    return { ok: false, error: "List price is unrealistically large." };
  }

  const royaltyRate70 = parseRate(values.royaltyRate70, DEFAULT_ROYALTY_70, "70% royalty rate");
  if (royaltyRate70 === null) {
    return { ok: false, error: "70% royalty rate must be a percent between 0 and 100." };
  }
  const royaltyRate35 = parseRate(values.royaltyRate35, DEFAULT_ROYALTY_35, "35% royalty rate");
  if (royaltyRate35 === null) {
    return { ok: false, error: "35% royalty rate must be a percent between 0 and 100." };
  }

  const bandMin = toFiniteNumber(values.bandMin ?? DEFAULT_BAND_MIN);
  const bandMax = toFiniteNumber(values.bandMax ?? DEFAULT_BAND_MAX);
  if (bandMin === null || bandMin <= 0) {
    return { ok: false, error: "70% band lower bound must be greater than 0." };
  }
  if (bandMax === null || bandMax <= 0) {
    return { ok: false, error: "70% band upper bound must be greater than 0." };
  }
  if (bandMax < bandMin) {
    return { ok: false, error: "70% band upper bound must be at least the lower bound." };
  }

  const fileSizeMB = toFiniteNumber(values.fileSizeMB ?? 0);
  if (fileSizeMB === null || fileSizeMB < 0) {
    return { ok: false, error: "File size must be a number of 0 or more MB." };
  }

  const deliveryFeePerMB = toFiniteNumber(values.deliveryFeePerMB ?? DEFAULT_DELIVERY_PER_MB);
  if (deliveryFeePerMB === null || deliveryFeePerMB < 0) {
    return { ok: false, error: "Delivery fee per MB must be 0 or more." };
  }

  const pageCount = toFiniteNumber(values.pageCount ?? 0);
  if (format === "paperback") {
    if (pageCount === null || !Number.isInteger(pageCount) || pageCount <= 0) {
      return { ok: false, error: "Page count must be a whole number greater than 0 for paperback." };
    }
  }

  const rawInk = values.inkType ?? "bw";
  if (typeof rawInk !== "string" || !(INK_TYPES as ReadonlyArray<string>).includes(rawInk)) {
    return { ok: false, error: "Ink type must be 'bw', 'standard', or 'premium'." };
  }

  const paperbackRoyaltyRate = parseRate(values.paperbackRoyaltyRate, DEFAULT_PAPERBACK_ROYALTY, "paperback royalty rate");
  if (paperbackRoyaltyRate === null) {
    return { ok: false, error: "Paperback royalty rate must be a percent between 0 and 100." };
  }

  const printFixedFee = toFiniteNumber(values.printFixedFee ?? DEFAULT_PRINT_FIXED);
  if (printFixedFee === null || printFixedFee < 0) {
    return { ok: false, error: "Print fixed fee must be 0 or more." };
  }

  const rawMarketplace = values.marketplace ?? "US";
  if (typeof rawMarketplace !== "string" || !(MARKETPLACES as ReadonlyArray<string>).includes(rawMarketplace)) {
    return { ok: false, error: "Marketplace must be one of: US, UK, DE, FR, CA, AU." };
  }

  return {
    ok: true,
    input: {
      format,
      listPrice,
      royaltyRate70,
      royaltyRate35,
      bandMin,
      bandMax,
      fileSizeMB,
      deliveryFeePerMB,
      pageCount: pageCount ?? 0,
      inkType: rawInk as InkType,
      paperbackRoyaltyRate,
      printFixedFee,
      marketplace: rawMarketplace as Marketplace,
    },
  };
}

/**
 * Calculate the KDP royalty for one sale.
 *
 * ebook:     inBand = bandMin <= listPrice <= bandMax
 *            rate = inBand ? royaltyRate70 : royaltyRate35
 *            delivery = inBand ? fileSizeMB * deliveryFeePerMB : 0
 *            royalty = max(listPrice * rate/100 - delivery, 0)
 * paperback: printingCost = printFixedFee + pageCount * INK_RATES[inkType]
 *            royalty = max(listPrice * paperbackRoyaltyRate/100 - printingCost, 0)
 */
export function calculateKdpRoyalty(input: KdpRoyaltyInput): KdpRoyaltyBreakdown {
  const price = roundToCents(input.listPrice);
  const notices: string[] = [];
  let royaltyPerSale: number;
  let royaltyRateApplied: number;
  let printingCost = 0;

  if (input.format === "ebook") {
    const inBand = price >= input.bandMin && price <= input.bandMax;
    royaltyRateApplied = inBand ? input.royaltyRate70 : input.royaltyRate35;
    const gross = (price * royaltyRateApplied) / 100;
    const delivery = inBand ? input.fileSizeMB * input.deliveryFeePerMB : 0;
    royaltyPerSale = gross - delivery;
    if (!inBand) {
      notices.push(
        `List price $${price.toFixed(2)} is outside the 70% band ($${input.bandMin.toFixed(2)}–$${input.bandMax.toFixed(2)}), so the ${royaltyRateApplied}% rate was applied automatically.`,
      );
    }
    if (royaltyPerSale < 0) {
      notices.push("The delivery fee exceeded the royalty — royalty floored at $0.");
      royaltyPerSale = 0;
    }
  } else {
    royaltyRateApplied = input.paperbackRoyaltyRate;
    printingCost = roundToCents(input.printFixedFee + input.pageCount * INK_RATES[input.inkType]);
    royaltyPerSale = (price * royaltyRateApplied) / 100 - printingCost;
    if (royaltyPerSale < 0) {
      notices.push("Printing cost exceeded the royalty share — royalty floored at $0.");
      royaltyPerSale = 0;
    }
  }
  royaltyPerSale = roundToCents(royaltyPerSale);

  const assumptions: string[] = [
    "All royalty rates and band bounds are user-editable ESTIMATES — KDP terms change; verify current terms on KDP before publishing decisions.",
    "The 70% band default ($2.99–$9.99) follows the public KDP schedule; a claimed $12.99 ceiling is UNVERIFIED and is not used as a default.",
    "Paperback royalty band boundary under $9.98 is disputed across sources — the 60% default is an estimate.",
    "Delivery fees apply only inside the 70% tier and are deducted before the royalty is floored at $0.",
    `Same schedule is applied for every marketplace in v1 (${input.marketplace} selected) — KDP terms can differ by territory.`,
    "KU (Kindle Unlimited) page-read revenue is not included — treat it as a separate line.",
    "All amounts are in USD.",
  ];

  return {
    royaltyPerSale,
    royaltyRateApplied,
    printingCost,
    notice: notices.join(" "),
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
  const r = calculateKdpRoyalty(parsed.input);
  return {
    ok: true,
    values: {
      royaltyPerSale: r.royaltyPerSale,
      royaltyRateApplied: r.royaltyRateApplied,
      printingCost: r.printingCost,
      notice: r.notice,
    },
  };
}
