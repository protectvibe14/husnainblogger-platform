/**
 * Voiceover Timing & Cost Calculator — pure logic (tool-531), zero imports,
 * zero network, zero DOM.
 *
 * HONESTY CONTRACT: pure arithmetic. The WPM rate is a labeled estimate
 * (real pacing varies by voice and delivery), and every price is USER-
 * ENTERED — this tool ships no price list and invents no rates. If only a
 * word count is given (no script text), characters are estimated at 5 per
 * word and the output is flagged as estimated.
 *
 * Fixed formulas (documented):
 *  - words      = wordCountOverride (if given) else counted from scriptText
 *  - chars      = counted from scriptText, else round(words * 5) [estimated]
 *  - durationSec = words / wpm * 60
 *  - costUSD    = chars / 1000 * ratePer1kChars  (rate is user-entered)
 *  - finishedMinCostUSD = durationSec / 60 * voiceoverRatePerMin (optional)
 */

export const DEFAULT_WPM = 150;
export const MIN_WPM = 60;
export const MAX_WPM = 300;
export const CHARS_PER_WORD_ESTIMATE = 5;
export const MAX_SCRIPT_LENGTH = 50000;
export const MAX_WORD_COUNT = 1000000;

export interface TimingCostResult {
  wordCount: number;
  charCount: number;
  charCountEstimated: boolean;
  wpm: number;
  durationSec: number;
  durationLabel: string;
  ratePer1kChars: number;
  estimatedCostUSD: number;
  voiceoverRatePerMin: number | null;
  finishedMinuteCostUSD: number | null;
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

export function formatDuration(totalSec: number): string {
  const s = Math.round(totalSec);
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return `${m}:${String(rest).padStart(2, "0")}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function parsePositiveInt(raw: unknown, max: number): number | null {
  if (typeof raw !== "number" || !Number.isFinite(raw) || !Number.isInteger(raw))
    return null;
  if (raw < 1 || raw > max) return null;
  return raw;
}

function parseRate(raw: unknown): number | null {
  if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
  if (raw < 0 || raw > 1000000) return null;
  return raw;
}

export function calculate(
  wordCount: number,
  charCount: number,
  charCountEstimated: boolean,
  wpm: number,
  ratePer1kChars: number,
  voiceoverRatePerMin: number | null,
): TimingCostResult {
  const durationSec = (wordCount / wpm) * 60;
  return {
    wordCount,
    charCount,
    charCountEstimated,
    wpm,
    durationSec,
    durationLabel: `${formatDuration(durationSec)} (estimate at ${wpm} wpm)`,
    ratePer1kChars,
    estimatedCostUSD: round2((charCount / 1000) * ratePer1kChars),
    voiceoverRatePerMin,
    finishedMinuteCostUSD:
      voiceoverRatePerMin === null
        ? null
        : round2((durationSec / 60) * voiceoverRatePerMin),
  };
}

/**
 * Tool entry point (matches the platform ToolRunFn contract).
 * values.scriptText: optional string. values.wordCountOverride: optional
 * integer (at least one of the two required).
 * values.wpm: optional number 60-300 (default 150).
 * values.ratePer1kChars: required number >= 0 (USD, user-entered).
 * values.voiceoverRatePerMin: optional number >= 0 (USD, user-entered).
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawScript = values["scriptText"];
  const scriptText =
    typeof rawScript === "string"
      ? rawScript.replace(/<[^>]*>/g, " ").trim()
      : "";
  const override = parsePositiveInt(values["wordCountOverride"], MAX_WORD_COUNT);

  if (scriptText.length === 0 && override === null) {
    return {
      ok: false,
      error: "Enter script text or a word count (at least one is required).",
    };
  }
  if (scriptText.length > MAX_SCRIPT_LENGTH) {
    return {
      ok: false,
      error: `Script text must be ${MAX_SCRIPT_LENGTH} characters or fewer.`,
    };
  }

  const counted = scriptText.length > 0 ? countWords(scriptText) : 0;
  const wordCount = override !== null ? override : counted;
  if (wordCount === 0) {
    return { ok: false, error: "Script text contains no countable words." };
  }

  const wpm =
    values["wpm"] === undefined || values["wpm"] === null || values["wpm"] === ""
      ? DEFAULT_WPM
      : parsePositiveInt(values["wpm"], MAX_WPM);
  if (wpm === null || wpm < MIN_WPM) {
    return {
      ok: false,
      error: `Speech rate must be a whole number between ${MIN_WPM} and ${MAX_WPM} WPM.`,
    };
  }

  const rate = parseRate(values["ratePer1kChars"]);
  if (rate === null) {
    return {
      ok: false,
      error: "Enter the provider rate per 1,000 characters in USD (your own number, 0 or more).",
    };
  }

  let perMin: number | null = null;
  if (
    values["voiceoverRatePerMin"] !== undefined &&
    values["voiceoverRatePerMin"] !== null &&
    values["voiceoverRatePerMin"] !== ""
  ) {
    perMin = parseRate(values["voiceoverRatePerMin"]);
    if (perMin === null) {
      return {
        ok: false,
        error: "Voiceover rate per finished minute must be 0 or more (USD).",
      };
    }
  }

  const charCount =
    scriptText.length > 0 ? scriptText.length : wordCount * CHARS_PER_WORD_ESTIMATE;
  const charCountEstimated = scriptText.length === 0;

  const r = calculate(wordCount, charCount, charCountEstimated, wpm, rate, perMin);
  return {
    ok: true,
    values: {
      wordCount: r.wordCount,
      charCount: r.charCount,
      charCountEstimated: r.charCountEstimated,
      wpm: r.wpm,
      duration: r.durationLabel,
      durationSec: Math.round(r.durationSec),
      estimatedCostUSD: r.estimatedCostUSD,
      ratePer1kChars: r.ratePer1kChars,
      voiceoverRatePerMin: r.voiceoverRatePerMin,
      finishedMinuteCostUSD: r.finishedMinuteCostUSD,
    },
  };
}
