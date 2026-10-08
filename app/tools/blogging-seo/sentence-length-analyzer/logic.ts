/**
 * Sentence Length Analyzer — pure logic (zero imports, zero network, zero DOM).
 *
 * HONESTY CONTRACT (see spec honestyNote): computes the STANDARD PUBLISHED
 * readability formulas exactly as documented — deterministic given the text.
 * No interpretation beyond the formulas is added; scores are descriptive, not
 * a claim about Google rankings.
 *
 * Formulas (per https://en.wikipedia.org/wiki/Flesch–Kincaid_readability_tests):
 *   ASL  = words / sentences
 *   FRE  = 206.835 − 1.015·ASL − 84.6·(syllables/words)
 *   FK   = 0.39·ASL + 11.8·(syllables/words) − 15.59
 *   Fog  = 0.4·(ASL + 100·complexWords/words), complex = ≥3 syllables
 *          (simplified: no proper-noun exclusion, documented here)
 *   ARI  = 4.71·(characters/words) + 0.5·ASL − 21.43
 * All scores rounded to 2 decimals.
 *
 * Sentence splitting: abbreviations (e.g., "e.g.", "i.e.", "Mr.", "etc.") are
 * protected so they don't split sentences; text with no terminal punctuation
 * counts as one sentence.
 *
 * Syllables: deterministic vowel-group heuristic — count [aeiouy] groups,
 * subtract one for a trailing silent "e", add back for consonant+"le",
 * minimum 1 per word. An approximation, stated here and in methodology.
 *
 * "Long" sentences = over 25 words (editorial threshold).
 */

export const MAX_CONTENT_CHARS = 200000;
export const LONG_SENTENCE_WORDS = 25;
export const LONG_SENTENCES_CAP = 20;
export const SENTENCE_PREVIEW_CHARS = 90;

const PLACEHOLDER = "\u0001";

const SINGLE_ABBREVIATIONS = [
  "mr", "mrs", "ms", "dr", "st", "jr", "sr", "vs", "etc",
  "no", "inc", "ltd", "co", "prof", "gen", "rep", "sen", "gov", "dept", "fig", "approx",
];

function protectAbbreviations(text: string): string {
  let out = text.replace(
    /\b(?:e\.g|i\.e|a\.m|p\.m|u\.s|u\.k)\./gi,
    (m) => m.replace(/\./g, PLACEHOLDER),
  );
  const names = SINGLE_ABBREVIATIONS.join("|");
  out = out.replace(
    new RegExp(`\\b(${names})\\.`, "gi"),
    (m, w: string) => w + PLACEHOLDER,
  );
  return out;
}

export interface Sentence {
  text: string;
  words: string[];
}

/** Deterministic sentence splitter with abbreviation protection. */
export function splitSentences(text: string): Sentence[] {
  const prot = protectAbbreviations(text);
  const matches = prot.match(/[^.!?…]+(?:[.!?…]+["'”’)\]]?|$)/g) ?? [];
  const out: Sentence[] = [];
  for (const m of matches) {
    const restored = m.split(PLACEHOLDER).join(".").trim();
    if (!/[\p{L}\p{N}]/u.test(restored)) continue;
    const words = restored.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? [];
    if (words.length === 0) continue;
    out.push({ text: restored, words });
  }
  return out;
}

/** Deterministic syllable heuristic (vowel groups, silent-e rule, min 1). */
export function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length === 0) return 0;
  if (w.length <= 3) return 1;
  const groups = w.match(/[aeiouy]+/g);
  let n = groups ? groups.length : 0;
  if (w.endsWith("e")) n -= 1; // silent e
  // consonant + "le" (e.g. "apple", "table") keeps its syllable
  if (w.endsWith("le") && w.length > 2 && !/[aeiouy]/.test(w[w.length - 3])) n += 1;
  if (n < 1) n = 1;
  return n;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max).trimEnd() + "…" : s;
}

/**
 * Tool logic slot. values: { content }.
 * Returns { avgSentenceLength, fleschReadingEase, fleschKincaidGrade,
 *           gunningFog, ari, longSentences }.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please provide your inputs first." };
  }

  const raw = values["content"];
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return { ok: false, error: "Paste the text you want to analyze." };
  }
  const content = raw;
  if (content.length > MAX_CONTENT_CHARS) {
    return {
      ok: false,
      error: `Content must be ${MAX_CONTENT_CHARS.toLocaleString("en-US")} characters or fewer.`,
    };
  }

  const sentences = splitSentences(content);
  if (sentences.length === 0) {
    return { ok: false, error: "We couldn't find any sentences in that text." };
  }

  const allWords = sentences.flatMap((s) => s.words);
  const wordCount = allWords.length;
  const sentenceCount = sentences.length;
  const syllableCount = allWords.reduce((sum, w) => sum + countSyllables(w), 0);
  const charCount = allWords.reduce(
    (sum, w) => sum + (w.toLowerCase().match(/[a-z0-9]/g) ?? []).length,
    0,
  );
  const complexCount = allWords.filter((w) => countSyllables(w) >= 3).length;

  const asl = wordCount / sentenceCount;
  const sylPerWord = syllableCount / wordCount;

  const fleschReadingEase = round2(206.835 - 1.015 * asl - 84.6 * sylPerWord);
  const fleschKincaidGrade = round2(0.39 * asl + 11.8 * sylPerWord - 15.59);
  const gunningFog = round2(0.4 * (asl + (100 * complexCount) / wordCount));
  const ari = round2(4.71 * (charCount / wordCount) + 0.5 * asl - 21.43);

  const longRows = sentences
    .map((s, i) => ({ index: i + 1, text: s.text, words: s.words.length }))
    .filter((s) => s.words > LONG_SENTENCE_WORDS)
    .slice(0, LONG_SENTENCES_CAP)
    .map((s) => [String(s.index), String(s.words), truncate(s.text, SENTENCE_PREVIEW_CHARS)]);

  return {
    ok: true,
    values: {
      avgSentenceLength: round2(asl),
      fleschReadingEase,
      fleschKincaidGrade,
      gunningFog,
      ari,
      longSentences: {
        columns: ["Sentence #", "Words", "Sentence"],
        rows: longRows,
      },
    },
  };
}
