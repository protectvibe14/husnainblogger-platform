/**
 * eBook Pricing & Royalty Calculator — pure logic (tool-093).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Pure deterministic arithmetic.
 * - Implements the Amazon KDP royalty schedule from the spec (same rule set
 *   as tool-060, pricing-first framing here):
 *     eBook: 70% royalty when list price is $2.99–$9.99 (minus a $0.15/MB
 *            delivery fee); otherwise 35% of list price (floored at $0).
 *     Paperback: 60% of list price minus printing cost, where
 *            printing cost = $1.00 + pages × per-page rate
 *            (black & white $0.012, standard color $0.0255, premium color $0.065).
 * - Royalty schedules change per retailer and over time. These are the
 *   schedule values the spec was built against (2026-10-01); the UI must
 *   tell users to VERIFY the current schedule with the retailer (KDP)
 *   before pricing. The claimed 70% ceiling of $12.99 is UNVERIFIED and is
 *   NOT used here — the formula uses the plain $2.99–$9.99 band.
 * - All money rounds half-up to 2 decimals.
 * - inkType is only used for paperback; for eBooks it is accepted and
 *   ignored. fileSizeMB is only used for eBooks; pageCount only for
 *   paperback. The note output explains what applied.
 */

/** eBook format choice. */
export type EbookFormat = "kindle_ebook" | "paperback";

/** Paperback ink type (drives the per-page print cost). */
export type InkType = "bw" | "standard" | "premium";

export const EBOOK_FORMATS: ReadonlyArray<EbookFormat> = ["kindle_ebook", "paperback"];
export const INK_TYPES: ReadonlyArray<InkType> = ["bw", "standard", "premium"];

/** 70% royalty band for Kindle eBooks (USD). */
export const EBOOK_ROYALTY_70_MIN = 2.99;
export const EBOOK_ROYALTY_70_MAX = 9.99;

/** eBook delivery fee per MB (USD). */
export const EBOOK_DELIVERY_FEE_PER_MB = 0.15;

/** Paperback royalty rate (fraction of list price). */
export const PAPERBACK_ROYALTY_RATE = 0.6;

/** Paperback fixed printing cost (USD). */
export const PAPERBACK_FIXED_PRINT_COST = 1.0;

/** Per-page printing rates by ink type (USD/page). */
export const PRINT_RATES_PER_PAGE: Record<InkType, number> = {
  bw: 0.012,
  standard: 0.0255,
  premium: 0.065,
};

export const INK_LABELS: Record<InkType, string> = {
  bw: "black & white",
  standard: "standard color",
  premium: "premium color",
};

export interface EbookRoyaltyInput {
  /** Format: kindle_ebook or paperback. */
  format: EbookFormat;
  /** List price in USD. > 0. */
  listPrice: number;
  /** eBook file size in MB. >= 0. Defaults to 0. */
  fileSizeMB?: number;
  /** Paperback page count. Integer > 0 (required for paperback). */
  pageCount?: number;
  /** Paperback ink type. Defaults to "bw". */
  inkType?: InkType;
}

export interface EbookRoyaltyResult {
  /** Royalty earned per sale (USD, 2 decimals, floored at 0). */
  royaltyPerSale: number;
  /** Royalty rate as a percent (70/35 for eBook; effective % for paperback). */
  royaltyRate: number;
  /** Printing cost per copy (paperback only; 0 for eBook). */
  printCost: number;
  /** Human-readable note explaining the schedule applied + verify-with-retailer reminder. */
  note: string;
}

/** Round to 2 decimals, half-up (values here are non-negative after flooring). */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function readNumber(name: string, value: unknown): number {
  const n = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (typeof n !== "number" || Number.isNaN(n)) {
    throw new TypeError(`${name} must be a number (got ${String(value)}).`);
  }
  if (!Number.isFinite(n)) {
    throw new TypeError(`${name} must be finite (got ${String(value)}).`);
  }
  return n;
}

function readEnum<T extends string>(name: string, value: unknown, allowed: ReadonlyArray<T>): T {
  if (typeof value !== "string" || (allowed as ReadonlyArray<string>).indexOf(value) === -1) {
    throw new TypeError(
      `${name} must be one of ${allowed.join("/")} (got ${String(value)}).`,
    );
  }
  return value as T;
}

const VERIFY_REMINDER =
  "Royalty schedules change per retailer — verify the current KDP schedule with Amazon before pricing.";

/**
 * Compute per-sale royalty for a Kindle eBook or paperback.
 *
 * @param values - format, listPrice, fileSizeMB, pageCount, inkType.
 * @returns { ok: true, values } or { ok: false, error } with a human message.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  let input: EbookRoyaltyInput;
  try {
    const format = readEnum("format", values["format"], EBOOK_FORMATS);
    const listPrice = readNumber("listPrice", values["listPrice"]);
    const rawSize = values["fileSizeMB"];
    const fileSizeMB = rawSize === undefined || rawSize === null || rawSize === "" ? 0 : readNumber("fileSizeMB", rawSize);
    const rawPages = values["pageCount"];
    const pageCount =
      rawPages === undefined || rawPages === null || rawPages === "" ? undefined : readNumber("pageCount", rawPages);
    const rawInk = values["inkType"];
    const inkType: InkType =
      rawInk === undefined || rawInk === null || rawInk === "" ? "bw" : readEnum("inkType", rawInk, INK_TYPES);

    if (listPrice <= 0) {
      throw new RangeError(`listPrice must be greater than 0 (got ${listPrice}).`);
    }
    if (fileSizeMB < 0) {
      throw new RangeError(`fileSizeMB must be >= 0 (got ${fileSizeMB}).`);
    }
    if (format === "paperback") {
      if (pageCount === undefined) {
        throw new TypeError("pageCount is required for paperback format.");
      }
      if (!Number.isInteger(pageCount) || pageCount <= 0) {
        throw new RangeError(`pageCount must be a positive integer (got ${pageCount}).`);
      }
    }
    input = { format, listPrice, fileSizeMB, pageCount, inkType };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  let royaltyPerSale: number;
  let royaltyRate: number;
  let printCost = 0;
  let note: string;

  if (input.format === "kindle_ebook") {
    if (input.listPrice >= EBOOK_ROYALTY_70_MIN && input.listPrice <= EBOOK_ROYALTY_70_MAX) {
      royaltyRate = 70;
      royaltyPerSale = Math.max(input.listPrice * 0.7 - input.fileSizeMB! * EBOOK_DELIVERY_FEE_PER_MB, 0);
      note =
        `70% royalty band ($${EBOOK_ROYALTY_70_MIN}–$${EBOOK_ROYALTY_70_MAX}): ` +
        `$${input.listPrice.toFixed(2)} × 70% minus $${EBOOK_DELIVERY_FEE_PER_MB.toFixed(2)}/MB delivery fee ` +
        `(${input.fileSizeMB} MB). ${VERIFY_REMINDER}`;
    } else {
      royaltyRate = 35;
      royaltyPerSale = Math.max(input.listPrice * 0.35, 0);
      note =
        `35% royalty: $${input.listPrice.toFixed(2)} is outside the $2.99–$9.99 band for the 70% rate. ` +
        `${VERIFY_REMINDER}`;
    }
  } else {
    const pages = input.pageCount!;
    printCost = round2(PAPERBACK_FIXED_PRINT_COST + pages * PRINT_RATES_PER_PAGE[input.inkType!]);
    const rawRoyalty = input.listPrice * PAPERBACK_ROYALTY_RATE - printCost;
    royaltyPerSale = round2(Math.max(rawRoyalty, 0));
    royaltyRate = round2((royaltyPerSale / input.listPrice) * 100);
    const viability =
      rawRoyalty < 0
        ? ` At $${input.listPrice.toFixed(2)} the royalty is negative — this price is not viable; raise the list price.`
        : "";
    note =
      `Paperback: $${input.listPrice.toFixed(2)} × 60% minus $${printCost.toFixed(2)} printing cost ` +
      `(${pages} pages, ${INK_LABELS[input.inkType!]}).${viability} ${VERIFY_REMINDER}`;
  }

  const result: EbookRoyaltyResult = {
    royaltyPerSale: round2(royaltyPerSale),
    royaltyRate,
    printCost,
    note,
  };
  return { ok: true, values: { ...result } };
}
