/**
 * Prompt Token Cost Estimator — pure logic (tool-532), zero imports, zero
 * network, zero DOM.
 *
 * HONESTY CONTRACT: token counts are a ROUGH heuristic (chars/4, rounded up).
 * Real tokenizers (tiktoken, SentencePiece, etc.) differ — often by 10-30%.
 * This tool never invents provider prices: both $/1M-token rates are typed
 * in by the user. All cost math is shown step by step.
 */

export interface TokenCostResult {
  /** Raw character count of the prompt. */
  promptChars: number;
  /** ceil(promptChars / 4). Labeled "rough estimate" in the UI. */
  estimatedInputTokens: number;
  /** User-entered USD price per 1M input tokens. */
  inputPricePerM: number;
  /** User-entered USD price per 1M output tokens. */
  outputPricePerM: number;
  /** User-entered expected output tokens. */
  expectedOutputTokens: number;
  /** estimatedInputTokens / 1e6 * inputPricePerM */
  inputCostUsd: number;
  /** expectedOutputTokens / 1e6 * outputPricePerM */
  outputCostUsd: number;
  /** inputCostUsd + outputCostUsd */
  totalCostUsd: number;
  /** Human-readable money strings. */
  inputCostDisplay: string;
  outputCostDisplay: string;
  totalCostDisplay: string;
  /** Transparent step-by-step math shown to the user. */
  math: string[];
}

/** Heuristic divisor: ~4 characters per token. Labeled as an estimate. */
export const CHARS_PER_TOKEN = 4;

export const MAX_PROMPT_CHARS = 200000;
export const MAX_PRICE_PER_M = 100000;
export const MAX_OUTPUT_TOKENS = 100000000;

/**
 * Rough token estimate. ceil() so we never under-report to zero.
 * This is NOT a real tokenizer — label it as an estimate everywhere.
 */
export function estimateTokens(charCount: number): number {
  if (charCount <= 0) return 0;
  return Math.ceil(charCount / CHARS_PER_TOKEN);
}

/** Format USD with enough decimals for tiny AI costs. */
export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return "$0.00";
  if (value === 0) return "$0.00";
  const abs = Math.abs(value);
  if (abs < 0.01) return `$${value.toFixed(6)}`;
  if (abs < 1) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(4)}`;
}

function formatInt(n: number): string {
  return n.toLocaleString("en-US");
}

/**
 * Core math. All prices and the output-token count come from the user;
 * nothing here invents a provider's pricing.
 */
export function estimateCost(
  promptChars: number,
  inputPricePerM: number,
  outputPricePerM: number,
  expectedOutputTokens: number,
): TokenCostResult {
  const estimatedInputTokens = estimateTokens(promptChars);
  const inputCostUsd = (estimatedInputTokens / 1000000) * inputPricePerM;
  const outputCostUsd = (expectedOutputTokens / 1000000) * outputPricePerM;
  const totalCostUsd = inputCostUsd + outputCostUsd;

  const math: string[] = [
    `Input tokens ≈ ceil(${formatInt(promptChars)} chars ÷ 4) = ${formatInt(
      estimatedInputTokens,
    )} (rough estimate — real tokenizers differ)`,
    `Input cost = ${formatInt(estimatedInputTokens)} ÷ 1,000,000 × $${inputPricePerM} = ${formatUsd(inputCostUsd)}`,
    `Output cost = ${formatInt(expectedOutputTokens)} ÷ 1,000,000 × $${outputPricePerM} = ${formatUsd(outputCostUsd)}`,
    `Total ≈ ${formatUsd(inputCostUsd)} + ${formatUsd(outputCostUsd)} = ${formatUsd(totalCostUsd)}`,
  ];

  return {
    promptChars,
    estimatedInputTokens,
    inputPricePerM,
    outputPricePerM,
    expectedOutputTokens,
    inputCostUsd,
    outputCostUsd,
    totalCostUsd,
    inputCostDisplay: formatUsd(inputCostUsd),
    outputCostDisplay: formatUsd(outputCostUsd),
    totalCostDisplay: formatUsd(totalCostUsd),
    math,
  };
}

function asNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/**
 * Tool entry point (matches the platform ToolRunFn contract).
 * values.promptText: string, required, 1..MAX_PROMPT_CHARS chars.
 * values.inputPricePerM / values.outputPricePerM: user-entered USD per 1M tokens, >= 0.
 * values.expectedOutputTokens: user-entered integer >= 0.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawPrompt = values["promptText"];
  if (rawPrompt === undefined || rawPrompt === null || rawPrompt === "") {
    return { ok: false, error: "Please paste your prompt text first." };
  }
  if (typeof rawPrompt !== "string") {
    return { ok: false, error: "Prompt text must be text." };
  }
  const promptChars = rawPrompt.length;
  if (promptChars > MAX_PROMPT_CHARS) {
    return {
      ok: false,
      error: `Prompt is too long — keep it under ${formatInt(MAX_PROMPT_CHARS)} characters.`,
    };
  }

  const inputPricePerM = asNumber(values["inputPricePerM"]);
  if (inputPricePerM === null) {
    return {
      ok: false,
      error: "Enter the input price per 1M tokens in USD (from your provider's pricing page).",
    };
  }
  if (inputPricePerM < 0 || inputPricePerM > MAX_PRICE_PER_M) {
    return {
      ok: false,
      error: `Input price must be between 0 and $${formatInt(MAX_PRICE_PER_M)} per 1M tokens.`,
    };
  }

  const outputPricePerM = asNumber(values["outputPricePerM"]);
  if (outputPricePerM === null) {
    return {
      ok: false,
      error: "Enter the output price per 1M tokens in USD (from your provider's pricing page).",
    };
  }
  if (outputPricePerM < 0 || outputPricePerM > MAX_PRICE_PER_M) {
    return {
      ok: false,
      error: `Output price must be between 0 and $${formatInt(MAX_PRICE_PER_M)} per 1M tokens.`,
    };
  }

  const expectedOutputTokens = asNumber(values["expectedOutputTokens"]);
  if (expectedOutputTokens === null) {
    return { ok: false, error: "Enter your expected output token count." };
  }
  if (
    !Number.isInteger(expectedOutputTokens) ||
    expectedOutputTokens < 0 ||
    expectedOutputTokens > MAX_OUTPUT_TOKENS
  ) {
    return {
      ok: false,
      error: `Expected output tokens must be a whole number between 0 and ${formatInt(MAX_OUTPUT_TOKENS)}.`,
    };
  }

  const result = estimateCost(
    promptChars,
    inputPricePerM,
    outputPricePerM,
    expectedOutputTokens,
  );

  return {
    ok: true,
    values: {
      promptChars: result.promptChars,
      estimatedInputTokens: result.estimatedInputTokens,
      estimateNote: "Rough estimate — real tokenizers differ.",
      inputCostUsd: result.inputCostUsd,
      outputCostUsd: result.outputCostUsd,
      totalCostUsd: result.totalCostUsd,
      inputCostDisplay: result.inputCostDisplay,
      outputCostDisplay: result.outputCostDisplay,
      totalCostDisplay: result.totalCostDisplay,
      math: result.math,
    },
  };
}
