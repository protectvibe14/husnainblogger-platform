/**
 * Content Similarity Checker — pure logic (zero imports, zero network, zero DOM).
 *
 * Compares two pasted texts with the Jaccard index over word n-grams
 * ("shingles"): |A ∩ B| / |A ∪ B|, where A and B are the sets of word
 * sequences of length `shingleSize` from each text. Deterministic — no AI,
 * no randomness, no web index.
 *
 * HONESTY: this is a text-overlap measurement between the two texts YOU
 * paste. It is NOT a plagiarism verdict: it cannot check the web, a search
 * index, or any external source. Shared boilerplate (quotes, disclosures,
 * repeated headers) raises the score without meaning either text copied the
 * other.
 *
 * Fixed rules:
 * - Tokenize: lowercase, split on non letters/numbers (Unicode-aware).
 * - Default shingle size 3 (valid range 2-5).
 * - jaccardSimilarity rounded to 4 decimals; similarityPercent = jaccard*100
 *   rounded to 2 decimals.
 * - When both texts are shorter than the shingle size (no shingles at all),
 *   the score is 1 if the normalized texts are identical, else 0.
 * - Verdict bands (the tool's own rubric, not a plagiarism judgment):
 *     >= 0.90  Near-duplicate
 *     >= 0.50  High similarity
 *     >= 0.20  Moderate similarity
 *     >  0     Low similarity
 *     == 0     No measurable similarity
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const MAX_TEXT_CHARS = 200000;
const DEFAULT_SHINGLE_SIZE = 3;
const MIN_SHINGLE_SIZE = 2;
const MAX_SHINGLE_SIZE = 5;

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function tokenize(s: string): string[] {
  return s.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

function shingles(tokens: string[], n: number): Set<string> {
  const set = new Set<string>();
  for (let i = 0; i + n <= tokens.length; i++) {
    set.add(tokens.slice(i, i + n).join(" "));
  }
  return set;
}

function round4(x: number): number {
  return Math.round(x * 10000) / 10000;
}

function parseShingleSize(raw: unknown): { size: number; error?: string } {
  if (raw === undefined || raw === null || raw === "") {
    return { size: DEFAULT_SHINGLE_SIZE };
  }
  const n = typeof raw === "string" ? Number(raw.trim()) : raw;
  if (typeof n !== "number" || !Number.isFinite(n) || !Number.isInteger(n)) {
    return {
      size: DEFAULT_SHINGLE_SIZE,
      error: "Shingle size must be a whole number.",
    };
  }
  if (n < MIN_SHINGLE_SIZE || n > MAX_SHINGLE_SIZE) {
    return {
      size: DEFAULT_SHINGLE_SIZE,
      error: `Shingle size must be between ${MIN_SHINGLE_SIZE} and ${MAX_SHINGLE_SIZE}.`,
    };
  }
  return { size: n };
}

function verdictFor(j: number): string {
  if (j >= 0.9) {
    return "Near-duplicate — the two texts share almost all of their word sequences. Review the overlapping passages before publishing.";
  }
  if (j >= 0.5) {
    return "High similarity — large overlapping passages. Check whether shared boilerplate (quotes, disclosures, headers) explains the score.";
  }
  if (j >= 0.2) {
    return "Moderate similarity — some shared phrases, often boilerplate or quoted material. Usually fine unless whole sections match.";
  }
  if (j > 0) {
    return "Low similarity — only minor word-sequence overlap.";
  }
  return "No measurable similarity — the texts share no word sequences of this size.";
}

export function runTool(values: Record<string, unknown>): ToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "No input provided." };
  }

  const textA = clean(values["textA"]);
  const textB = clean(values["textB"]);
  if (!textA || !textB) {
    return { ok: false, error: "Paste both texts — Text A and Text B are both required." };
  }
  if (textA.length > MAX_TEXT_CHARS || textB.length > MAX_TEXT_CHARS) {
    return {
      ok: false,
      error: `Each text is limited to ${MAX_TEXT_CHARS.toLocaleString("en-US")} characters.`,
    };
  }

  const { size, error } = parseShingleSize(values["shingleSize"]);
  if (error) return { ok: false, error };

  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);
  const setA = shingles(tokensA, size);
  const setB = shingles(tokensB, size);

  let jaccard: number;
  if (setA.size === 0 && setB.size === 0) {
    // Both texts shorter than the shingle size: identical text = 1, else 0.
    jaccard = tokensA.join(" ") === tokensB.join(" ") ? 1 : 0;
  } else {
    let intersection = 0;
    for (const s of setA) if (setB.has(s)) intersection++;
    const union = setA.size + setB.size - intersection;
    jaccard = union === 0 ? 0 : intersection / union;
  }

  const j = round4(jaccard);
  const percent = Math.round(j * 10000) / 100;

  return {
    ok: true,
    values: {
      jaccardSimilarity: j,
      similarityPercent: percent,
      verdict: verdictFor(j),
    },
  };
}
