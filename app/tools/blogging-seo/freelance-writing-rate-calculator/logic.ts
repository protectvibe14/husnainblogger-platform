/**
 * Freelance Writing Rate Calculator — pure logic (zero imports, zero network, zero DOM).
 *
 * Converts the user's OWN hourly rate and writing speed into per-word,
 * per-1,000-word, and per-project quotes.
 *
 * Honesty contract:
 * - Rates are computed ONLY from user-provided inputs. They are the user's
 *   numbers, never market data — this tool knows nothing about what other
 *   writers charge and must never claim to.
 * - Results are estimates derived from a simple division formula (see
 *   content.methodology in meta.ts), not guarantees of what a client will pay.
 * - Deterministic: same inputs → same outputs, always.
 *
 * Validation bounds (documented per the batch contract):
 * - hourlyRate: number > 0
 * - wordsPerHour: number > 0 (warning added to breakdown when > 2000)
 * - projectWords: optional number > 0 when provided
 * - currency: optional 3-letter code (case-insensitive), default "USD"
 */

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** wordsPerHour above this gets a sanity warning in the breakdown. */
export const WORDS_PER_HOUR_WARNING = 2000;

/** Round to a fixed number of decimals without floating-point drift. */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/** Coerce a raw value to a finite number, or null when not numeric. */
export function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/**
 * Tool-logic slot: validate input, compute the rates, return run values.
 * Values keys: perWordRate, per1000Words, perProjectQuote, breakdown
 * (match meta.ts output ids).
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return {
      ok: false,
      error: "Enter your hourly rate and writing speed to calculate your rates.",
    };
  }

  const hourlyRate = toNumber(values["hourlyRate"]);
  if (hourlyRate === null || hourlyRate <= 0) {
    return {
      ok: false,
      error: "Hourly rate must be a number greater than 0.",
    };
  }

  const wordsPerHour = toNumber(values["wordsPerHour"]);
  if (wordsPerHour === null || wordsPerHour <= 0) {
    return {
      ok: false,
      error: "Words per hour must be a number greater than 0.",
    };
  }

  let projectWords: number | null = null;
  const rawProjectWords = values["projectWords"];
  if (
    rawProjectWords !== undefined &&
    rawProjectWords !== null &&
    String(rawProjectWords).trim() !== ""
  ) {
    const pw = toNumber(rawProjectWords);
    if (pw === null || pw <= 0) {
      return {
        ok: false,
        error: "Project word count must be a number greater than 0.",
      };
    }
    projectWords = pw;
  }

  let currency = "USD";
  const rawCurrency = values["currency"];
  if (
    rawCurrency !== undefined &&
    rawCurrency !== null &&
    String(rawCurrency).trim() !== ""
  ) {
    const code = String(rawCurrency).trim();
    if (!/^[A-Za-z]{3}$/.test(code)) {
      return {
        ok: false,
        error: "Currency must be a 3-letter code, e.g. USD, EUR, GBP.",
      };
    }
    currency = code.toUpperCase();
  }

  // Core formula: per-word rate = your hourly rate ÷ your words per hour.
  const rawPerWord = hourlyRate / wordsPerHour;
  const perWordRate = roundTo(rawPerWord, 3);
  const per1000Words = roundTo(rawPerWord * 1000, 2);
  const perProjectQuote =
    projectWords === null ? 0 : roundTo(rawPerWord * projectWords, 2);

  const breakdown: string[] = [
    `Your per-word rate: ${perWordRate} ${currency} (${hourlyRate} ${currency}/hour ÷ ${wordsPerHour} words/hour).`,
    `Per 1,000 words: ${per1000Words} ${currency}.`,
  ];
  if (projectWords !== null) {
    breakdown.push(
      `Project quote for ${projectWords} words: ${perProjectQuote} ${currency}.`
    );
  } else {
    breakdown.push("Add a project word count to see a project quote.");
  }
  if (wordsPerHour > WORDS_PER_HOUR_WARNING) {
    breakdown.push(
      `Note: ${wordsPerHour} words/hour is unusually fast — double-check this number, since a higher speed lowers your per-word rate.`
    );
  }
  breakdown.push(
    "These rates come from the numbers you entered — they are your rates, not market rates."
  );

  return {
    ok: true,
    values: { perWordRate, per1000Words, perProjectQuote, breakdown },
  };
}
