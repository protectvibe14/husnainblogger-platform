/**
 * Sentiment Analyzer — pure config/validation (tool-542), zero imports,
 * zero network, zero DOM.
 *
 * Inference runs in client.ts via Transformers.js
 * (pipeline "text-classification" with
 * Xenova/distilbert-base-uncased-finetuned-sst-2-english) 100% on-device.
 * This module declares the model + disclosures, validates the text input,
 * and normalizes raw classifier output into a display-ready result.
 */

/** Local re-declaration (zero-import rule); mirrors lib/ai/types.ts. */
export interface AiModelInfo {
  id: string;
  task: string;
  sizeMb: number;
  license: string;
  dtype?: string;
  notes?: string;
}

export const MAX_TEXT_CHARS = 5000;
export const MIN_TEXT_CHARS = 3;

export function getModelConfig(): AiModelInfo {
  return {
    id: "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
    task: "text-classification",
    sizeMb: 67,
    license: "Apache-2.0",
    notes: "Binary sentiment (POSITIVE / NEGATIVE), English, short texts",
  };
}

export function getDisclosures(): string[] {
  return [
    "Runs 100% in your browser — your text is never uploaded anywhere.",
    "Downloads ~67 MB of model weights once, then works offline.",
    "Binary sentiment only (POSITIVE / NEGATIVE) — no neutral, no emotions, no sarcasm detection.",
    "Trained on English movie-review-style text; slang, sarcasm and other languages degrade results.",
  ];
}

export const HEADLINE =
  "Analyze the sentiment of English text with an on-device classifier — positive or negative with confidence scores.";

export type SentimentLabel = "POSITIVE" | "NEGATIVE";

export interface SentimentResult {
  label: SentimentLabel;
  /** Confidence of the winning label, 0..1. */
  score: number;
  positive: number;
  negative: number;
}

/**
 * Normalize raw text-classification output into a SentimentResult.
 * Accepts [{label, score}, ...] (any order/casing). Pure, deterministic.
 */
export function normalizeSentiment(raw: unknown): SentimentResult | null {
  if (!Array.isArray(raw)) return null;
  let positive = 0;
  let negative = 0;
  let found = false;
  for (const item of raw) {
    if (
      item !== null &&
      typeof item === "object" &&
      typeof (item as { label?: unknown }).label === "string" &&
      typeof (item as { score?: unknown }).score === "number" &&
      Number.isFinite((item as { score: number }).score)
    ) {
      const label = (item as { label: string }).label.toUpperCase();
      const score = Math.min(1, Math.max(0, (item as { score: number }).score));
      if (label === "POSITIVE") {
        positive = Math.max(positive, score);
        found = true;
      } else if (label === "NEGATIVE") {
        negative = Math.max(negative, score);
        found = true;
      }
    }
  }
  if (!found) return null;
  const label: SentimentLabel = positive >= negative ? "POSITIVE" : "NEGATIVE";
  return { label, score: label === "POSITIVE" ? positive : negative, positive, negative };
}

/**
 * Validate the text input.
 * values.text: string, required, MIN_TEXT_CHARS..MAX_TEXT_CHARS chars.
 */
export function validateInputs(values: Record<string, unknown>): {
  ok: boolean;
  error?: string;
} {
  const raw = values["text"];
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return { ok: false, error: "Please enter the text to analyze." };
  }
  const text = raw.trim();
  if (text.length < MIN_TEXT_CHARS) {
    return { ok: false, error: "Please enter at least a few words." };
  }
  if (text.length > MAX_TEXT_CHARS) {
    return {
      ok: false,
      error: `Keep the text under ${MAX_TEXT_CHARS.toLocaleString("en-US")} characters.`,
    };
  }
  return { ok: true };
}
