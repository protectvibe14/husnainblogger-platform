/**
 * Late Payment Fee Calculator — pure logic (tool-453).
 *
 * ZERO imports, zero network, zero DOM, deterministic.
 *
 * HONESTY:
 * - Math only. The late-fee RATE is a USER assumption — this tool presents
 *   no default rate as legally standard (there is none baked in).
 * - Late-fee enforceability varies by jurisdiction; results are informational
 *   only and are labeled as such in the output note.
 *
 * FORMULA (J-LATE-FEE):
 * - mode "percent-per-day": lateFee = invoiceAmount * (lateFeeRatePct/100) * daysLate
 * - mode "flat-plus-daily":  lateFee = flatFee + (dailyFee * daysLate)
 * - totalDue = invoiceAmount + lateFee
 * - Money rounds to the nearest cent (half-up).
 */

export const LATE_FEE_MODES = ["percent-per-day", "flat-plus-daily"] as const;
export type LateFeeMode = (typeof LATE_FEE_MODES)[number];

export interface LateFeeInput {
  /** Invoice principal. >= 0. */
  invoiceAmount: number;
  /** Fee model to apply. */
  feeMode: LateFeeMode;
  /** USER ASSUMPTION: daily late rate, 0-100. Required for percent-per-day. */
  lateFeeRatePct?: number;
  /** One-time flat late fee. >= 0. Defaults to 0. */
  flatFee?: number;
  /** Daily late fee added on top of the flat fee. >= 0. Defaults to 0. */
  dailyFee?: number;
  /** Whole days past the due date. Integer >= 0. */
  daysLate: number;
}

export interface LateFeeResult {
  /** Computed late fee, rounded to cents. */
  lateFeeAmount: number;
  /** Invoice principal + late fee, rounded to cents. */
  totalAmountDue: number;
  /** Plain-English annualized equivalent (informational estimate only). */
  effectiveAnnualizedNote: string;
  /** Empty string when nothing to flag. */
  warning: string;
}

export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function fail(name: string, problem: string): Error {
  return new Error(`${name}: ${problem}`);
}

function readNumber(name: string, value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw fail(name, "must be a number.");
  }
  if (!Number.isFinite(value)) {
    throw fail(name, "must be finite.");
  }
  return value;
}

function annualizedNote(mode: LateFeeMode, invoice: number, fee: number, days: number, ratePct: number): string {
  const info = "Informational estimate only — not a legal standard.";
  if (fee <= 0 || days <= 0 || invoice <= 0) {
    return "No annualized equivalent: no fee was charged (or no invoice amount to compare against). " + info;
  }
  let annualizedPct: number;
  if (mode === "percent-per-day") {
    annualizedPct = ratePct * 365;
  } else {
    annualizedPct = ((fee / invoice) / days) * 365 * 100;
  }
  return (
    `Simple annualized equivalent of this fee is about ${annualizedPct.toFixed(2)}% per year ` +
    `(daily rate × 365, no compounding). ${info}`
  );
}

/**
 * Calculate a late-payment fee from user-supplied terms.
 *
 * @throws {Error} for missing/invalid inputs (human-readable messages).
 */
export function calculateLateFee(input: LateFeeInput): LateFeeResult {
  if (!input || typeof input !== "object") {
    throw new Error("Input must be an object.");
  }

  const invoice = readNumber("invoiceAmount", input.invoiceAmount);
  if (invoice < 0) throw fail("invoiceAmount", "must be >= 0.");

  const mode = input.feeMode;
  if (!LATE_FEE_MODES.includes(mode)) {
    throw fail("feeMode", `must be one of: ${LATE_FEE_MODES.join(", ")}.`);
  }

  const daysRaw = readNumber("daysLate", input.daysLate);
  if (!Number.isInteger(daysRaw) || daysRaw < 0) {
    throw fail("daysLate", "must be an integer >= 0.");
  }
  const daysLate = daysRaw;

  let lateFee: number;
  let ratePct = 0;
  if (mode === "percent-per-day") {
    if (input.lateFeeRatePct === undefined || input.lateFeeRatePct === null) {
      throw fail("lateFeeRatePct", "is required for the percent-per-day model — enter your own rate.");
    }
    ratePct = readNumber("lateFeeRatePct", input.lateFeeRatePct);
    if (ratePct < 0 || ratePct > 100) {
      throw fail("lateFeeRatePct", "must be between 0 and 100.");
    }
    lateFee = invoice * (ratePct / 100) * daysLate;
  } else {
    const flat = input.flatFee ?? 0;
    const daily = input.dailyFee ?? 0;
    const flatFee = readNumber("flatFee", flat);
    const dailyFee = readNumber("dailyFee", daily);
    if (flatFee < 0) throw fail("flatFee", "must be >= 0.");
    if (dailyFee < 0) throw fail("dailyFee", "must be >= 0.");
    lateFee = flatFee + dailyFee * daysLate;
  }

  const lateFeeAmount = roundToCents(lateFee);
  const totalAmountDue = roundToCents(invoice + lateFeeAmount);

  let warning = "";
  if (invoice > 0 && lateFeeAmount > invoice) {
    warning =
      `Warning: the late fee (${lateFeeAmount.toFixed(2)}) is larger than the invoice ` +
      `principal (${invoice.toFixed(2)}). Check your rate — this is informational only.`;
  }

  return {
    lateFeeAmount,
    totalAmountDue,
    effectiveAnnualizedNote: annualizedNote(mode, invoice, lateFeeAmount, daysLate, ratePct),
    warning,
  };
}

/**
 * Tool-logic-slot adapter: validates flat UI values and runs calculateLateFee.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  try {
    const result = calculateLateFee({
      invoiceAmount: values.invoiceAmount as number,
      feeMode: values.feeMode as LateFeeMode,
      lateFeeRatePct: values.lateFeeRatePct as number | undefined,
      flatFee: values.flatFee as number | undefined,
      dailyFee: values.dailyFee as number | undefined,
      daysLate: values.daysLate as number,
    });
    return {
      ok: true,
      values: {
        lateFeeAmount: result.lateFeeAmount,
        totalAmountDue: result.totalAmountDue,
        effectiveAnnualizedNote: result.effectiveAnnualizedNote,
        warning: result.warning,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invalid input." };
  }
}
