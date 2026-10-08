/**
 * Affiliate EPC Calculator — pure logic (tool-098).
 *
 * Zero imports, zero network, zero DOM. Deterministic: same inputs → same
 * outputs. Pure ratio math on user inputs — the output is only as correct as
 * the inputs. No external data of any kind.
 *
 * ## HONESTY CONTRACT (also surfaced in meta.ts assumptions + UI note)
 * 1. EPC here follows the industry convention: (total_commission /
 *    total_clicks) × 100 — earnings per 100 clicks, in USD.
 * 2. Edge per spec: ZERO conversions → EPC $0, conversion rate 0%, and
 *    earnings-per-conversion is not computed (division guard) → $0.
 *    Rationale: EPC without any conversion is undefined; reporting $0 with
 *    an explicit note is the honest, spec-defined behavior.
 * 3. Clicks, conversions, and commission are entirely user-entered.
 *    "Clicks" means whatever the user's tracking reports (bot traffic,
 *    duplicates, and misattributed clicks all flow straight into the math).
 *
 * Formula (from spec):
 *   epc                    = total_commission / total_clicks * 100
 *   conversion_rate        = total_conversions / total_clicks * 100
 *   earnings_per_conversion =
 *     total_conversions > 0 ? total_commission / total_conversions : 0
 * Rounding: half-up to 2 decimals (USD amounts and percent).
 */

export const MAX_CLICKS = 1e12;

export const NOTE_TEXT =
  "EPC is reported per 100 clicks (the industry convention). " +
  "With zero conversions, EPC is $0 and earnings-per-conversion is not " +
  "computed. Results are pure math on your inputs — verify your tracking " +
  "data, since bot or duplicate clicks flow straight into these ratios.";

export interface AffiliateEpcInput {
  /** Total tracked clicks. Integer > 0. */
  totalClicks: number;
  /** Total conversions. Integer >= 0. */
  totalConversions: number;
  /** Total commission earned in USD. Finite number >= 0. */
  totalCommission: number;
}

export interface AffiliateEpcResult {
  /** Earnings per 100 clicks (USD). $0 when conversions are 0. */
  epc: number;
  /** Conversion rate in percent. 0 when conversions are 0. */
  conversionRate: number;
  /** Commission per conversion (USD). $0 when conversions are 0. */
  earningsPerConversion: number;
  /** Honesty note surfaced by the UI. */
  note: string;
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

/**
 * Compute EPC, conversion rate, and earnings per conversion.
 *
 * @param input - totalClicks, totalConversions, totalCommission.
 * @returns epc, conversionRate, earningsPerConversion, note.
 * @throws {TypeError} for non-object / non-numeric inputs.
 * @throws {RangeError} for clicks <= 0, non-integer clicks/conversions,
 *   negative conversions/commission, or clicks above the sanity cap.
 */
export function calculateAffiliateEpc(input: AffiliateEpcInput): AffiliateEpcResult {
  if (!input || typeof input !== "object") {
    throw new TypeError("Input must be an object.");
  }
  assertFiniteNumber("totalClicks", input.totalClicks);
  assertFiniteNumber("totalConversions", input.totalConversions);
  assertFiniteNumber("totalCommission", input.totalCommission);

  if (!Number.isInteger(input.totalClicks) || input.totalClicks <= 0) {
    throw new RangeError("totalClicks must be a whole number greater than 0.");
  }
  if (input.totalClicks > MAX_CLICKS) {
    throw new RangeError("totalClicks is above the sanity cap.");
  }
  if (!Number.isInteger(input.totalConversions) || input.totalConversions < 0) {
    throw new RangeError("totalConversions must be a whole number >= 0.");
  }
  if (input.totalCommission < 0) {
    throw new RangeError("totalCommission must be >= 0.");
  }

  // Spec edge: zero conversions -> EPC $0 (division guard for
  // earnings-per-conversion as well).
  if (input.totalConversions === 0) {
    return {
      epc: 0,
      conversionRate: 0,
      earningsPerConversion: 0,
      note: NOTE_TEXT,
    };
  }

  return {
    epc: round2((input.totalCommission / input.totalClicks) * 100),
    conversionRate: round2((input.totalConversions / input.totalClicks) * 100),
    earningsPerConversion: round2(input.totalCommission / input.totalConversions),
    note: NOTE_TEXT,
  };
}

// ---------------------------------------------------------------------------
// runTool adapter — contract shape for the mountToolUI / calculator template
// ---------------------------------------------------------------------------

/**
 * Contract adapter: `runTool({ totalClicks, totalConversions,
 * totalCommission })` → `{ ok, values?, error? }`. Output ids match
 * meta.ts outputs.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const v = values && typeof values === "object" ? values : {};
  try {
    const result = calculateAffiliateEpc({
      totalClicks: v["totalClicks"] as number,
      totalConversions: v["totalConversions"] as number,
      totalCommission: v["totalCommission"] as number,
    });
    return {
      ok: true,
      values: {
        epc: result.epc,
        conversionRate: result.conversionRate,
        earningsPerConversion: result.earningsPerConversion,
        note: result.note,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid input.";
    return { ok: false, error: humanize(message) };
  }
}

function humanize(message: string): string {
  if (message.startsWith("totalClicks must be a whole number")) {
    return "Enter your total clicks — a whole number greater than 0.";
  }
  if (message.startsWith("totalClicks")) {
    return "Total clicks must be a valid number.";
  }
  if (message.startsWith("totalConversions must be")) {
    return "Enter your total conversions — a whole number, 0 or more.";
  }
  if (message.startsWith("totalConversions")) {
    return "Total conversions must be a valid number.";
  }
  if (message.startsWith("totalCommission must be")) {
    return "Enter your total commission in USD — 0 or more.";
  }
  if (message.includes("sanity cap")) {
    return "That number looks unrealistically large — check it and try again.";
  }
  return message;
}
