/**
 * Break-Even ROAS Calculator — pure logic (tool-099).
 *
 * Zero imports, zero network, zero DOM. Deterministic: same inputs → same
 * outputs. Pure ratio math on user inputs — the output is only as correct as
 * the inputs. No external data of any kind.
 *
 * ## HONESTY CONTRACT (also surfaced in meta.ts assumptions + UI disclaimer)
 * 1. Break-even ROAS = 1 ÷ gross margin. This is algebra, not a forecast:
 *    a 40% margin needs a 2.50x ROAS to break even, exactly.
 * 2. Edge per spec: gross margin 0 → division by zero → the tool REJECTS it
 *    with an error message instead of returning Infinity.
 * 3. Ad spend must be > 0 to compute actual ROAS (revenue ÷ ad spend); a $0
 *    spend is rejected with an explanatory message rather than silently
 *    dividing by zero.
 * 4. "Gross margin" here means revenue after cost of goods sold — if the
 *    user's margin input excludes real costs (fees, shipping), the break-even
 *    figure is wrong, and that is on the input, not the math.
 *
 * Formula (from spec):
 *   break_even_roas = 1 / (gross_margin_percent / 100)
 *   actual_roas     = revenue / ad_spend
 *   profitable      = actual_roas >= break_even_roas
 * Rounding: 2 decimals. Verdict is a human sentence comparing the two ratios.
 */

export const MAX_AD_SPEND = 1e12;
export const MAX_REVENUE = 1e12;

export const DISCLAIMER_TEXT =
  "Break-even ROAS is pure ratio math (1 ÷ margin) on YOUR inputs — it is " +
  "only as correct as your margin. Make sure your gross margin accounts for " +
  "cost of goods sold (and ideally fees and shipping) or the break-even " +
  "figure will be misleadingly low.";

export interface BreakEvenRoasInput {
  /** Gross margin in percent. Must be > 0 and <= 100. */
  grossMarginPercent: number;
  /** Ad spend in USD. Must be > 0. */
  adSpend: number;
  /** Attributed revenue in USD. Must be > 0. */
  revenue: number;
}

export interface BreakEvenRoasResult {
  /** 1 / (margin/100), rounded to 2 decimals. */
  breakEvenRoas: number;
  /** revenue / adSpend, rounded to 2 decimals. */
  actualRoas: number;
  /** True when actualRoas >= breakEvenRoas. */
  profitable: boolean;
  /** Human verdict sentence surfaced by the UI. */
  verdict: string;
  /** Honesty disclaimer surfaced by the UI. */
  disclaimer: string;
}

/** Round half-up to 2 decimals (inputs to this tool are non-negative). */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function assertFiniteNumber(name: string, value: unknown): asserts value is number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new TypeError(`${name} must be a number.`);
  }
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number.`);
  }
}

function formatRatio(value: number): string {
  return `${round2(value).toFixed(2)}x`;
}

/**
 * Compute break-even ROAS, actual ROAS, and a profitability verdict.
 *
 * @param input - grossMarginPercent, adSpend, revenue.
 * @returns breakEvenRoas, actualRoas, profitable, verdict, disclaimer.
 * @throws {TypeError} for non-object / non-numeric inputs.
 * @throws {RangeError} for margin <= 0 or > 100, adSpend <= 0, revenue <= 0,
 *   or values above sanity caps.
 */
export function calculateBreakEvenRoas(
  input: BreakEvenRoasInput,
): BreakEvenRoasResult {
  if (!input || typeof input !== "object") {
    throw new TypeError("Input must be an object.");
  }
  assertFiniteNumber("grossMarginPercent", input.grossMarginPercent);
  assertFiniteNumber("adSpend", input.adSpend);
  assertFiniteNumber("revenue", input.revenue);

  if (input.grossMarginPercent <= 0) {
    throw new RangeError(
      "grossMarginPercent must be greater than 0 — a 0% margin makes break-even ROAS undefined (division by zero).",
    );
  }
  if (input.grossMarginPercent > 100) {
    throw new RangeError("grossMarginPercent must be at most 100.");
  }
  if (input.adSpend <= 0) {
    throw new RangeError(
      "adSpend must be greater than 0 — actual ROAS is revenue divided by ad spend.",
    );
  }
  if (input.adSpend > MAX_AD_SPEND) {
    throw new RangeError("adSpend is above the sanity cap.");
  }
  if (input.revenue <= 0) {
    throw new RangeError("revenue must be greater than 0.");
  }
  if (input.revenue > MAX_REVENUE) {
    throw new RangeError("revenue is above the sanity cap.");
  }

  const breakEvenRoas = round2(1 / (input.grossMarginPercent / 100));
  const actualRoas = round2(input.revenue / input.adSpend);
  const profitable = actualRoas >= breakEvenRoas;

  const verdict = profitable
    ? actualRoas === breakEvenRoas
      ? `Exactly at break-even — your ${formatRatio(actualRoas)} ROAS equals the ${formatRatio(breakEvenRoas)} break-even.`
      : `Profitable — your ${formatRatio(actualRoas)} ROAS beats the ${formatRatio(breakEvenRoas)} break-even.`
    : `Not profitable — your ${formatRatio(actualRoas)} ROAS is below the ${formatRatio(breakEvenRoas)} break-even.`;

  return {
    breakEvenRoas,
    actualRoas,
    profitable,
    verdict,
    disclaimer: DISCLAIMER_TEXT,
  };
}

// ---------------------------------------------------------------------------
// runTool adapter — contract shape for the mountToolUI / calculator template
// ---------------------------------------------------------------------------

/**
 * Contract adapter: `runTool({ grossMarginPercent, adSpend, revenue })` →
 * `{ ok, values?, error? }`. Output ids match meta.ts outputs.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const v = values && typeof values === "object" ? values : {};
  try {
    const result = calculateBreakEvenRoas({
      grossMarginPercent: v["grossMarginPercent"] as number,
      adSpend: v["adSpend"] as number,
      revenue: v["revenue"] as number,
    });
    return {
      ok: true,
      values: {
        breakEvenROAS: result.breakEvenRoas,
        actualROAS: result.actualRoas,
        verdict: result.verdict,
        disclaimer: result.disclaimer,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid input.";
    return { ok: false, error: humanize(message) };
  }
}

function humanize(message: string): string {
  if (message.startsWith("grossMarginPercent must be greater than 0")) {
    return "Enter your gross margin as a percent greater than 0 — a 0% margin makes break-even ROAS undefined.";
  }
  if (message.startsWith("grossMarginPercent")) {
    return "Gross margin must be a valid number between 0 and 100.";
  }
  if (message.startsWith("adSpend must be greater than 0")) {
    return "Enter your ad spend in USD — a number greater than 0 (actual ROAS is revenue ÷ ad spend).";
  }
  if (message.startsWith("adSpend")) {
    return "Ad spend must be a valid number.";
  }
  if (message.startsWith("revenue must be greater than 0")) {
    return "Enter your attributed revenue in USD — a number greater than 0.";
  }
  if (message.startsWith("revenue")) {
    return "Revenue must be a valid number.";
  }
  if (message.includes("sanity cap")) {
    return "That number looks unrealistically large — check it and try again.";
  }
  return message;
}
