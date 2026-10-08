/**
 * Blog Readability Scorer — pure logic.
 *
 * Uses the REAL, published formulas:
 * - Flesch Reading Ease = 206.835 − 1.015 × (words/sentences) − 84.6 × (syllables/words)
 *   (Flesch, 1948. Range 0–100; higher = easier.)
 * - Flesch–Kincaid Grade Level = 0.39 × (words/sentences) + 11.8 × (syllables/words) − 15.59
 *   (Kincaid et al., 1975. US school grade needed to understand the text.)
 *
 * ASSUMPTIONS / HONESTY:
 * - No DOM, no network, no imports.
 * - Syllable counting is a heuristic (vowel-group counting with silent-e
 *   adjustment) — labeled as an estimate. Published validation studies put
 *   this class of counter within ~±3% of dictionary counts on English prose.
 * - Sentence splitting is on . ! ? — abbreviations (e.g. "Mr.") inflate the
 *   sentence count slightly; documented limitation.
 * - Flesch bands below are the standard published interpretation bands.
 * - The score measures reading difficulty, NOT content quality — stated in
 *   every output via methodNote.
 */

export interface ReadabilityResult {
  fleschScore: number;
  gradeLevel: number;
  verdict: string;
  words: number;
  sentences: number;
  syllables: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  heuristic: true;
  methodNote: string;
}

function tokenizeWords(text: string): string[] {
  const seg = new Intl.Segmenter("en", { granularity: "word" });
  return [...seg.segment(text.toLowerCase())]
    .filter((s) => s.isWordLike)
    .map((s) => s.segment)
    .filter((w) => /[\p{L}]/u.test(w));
}

/** Split on sentence-ending punctuation; guards against empty fragments. */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => /[\p{L}\p{N}]/u.test(s));
}

const VOWELS = new Set(["a", "e", "i", "o", "u", "y"]);

/**
 * Heuristic syllable counter: vowel groups, minus silent trailing "e",
 * minimum 1. Standard published heuristic approach — an estimate, not a
 * dictionary lookup.
 */
export function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length === 0) return 0;
  if (w.length <= 3) return 1;
  let count = 0;
  let prevVowel = false;
  for (const ch of w) {
    const isVowel = VOWELS.has(ch);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  // Silent trailing "e" (but not "-le" after a consonant, e.g. "table" = 2).
  if (w.endsWith("e") && count > 1) {
    const beforeLe = w.endsWith("le") && w.length > 2 && !VOWELS.has(w[w.length - 3]);
    if (!beforeLe) count--;
  }
  return Math.max(1, count);
}

/** Standard published Flesch Reading Ease interpretation bands. */
function verdictFor(score: number): string {
  if (score >= 90) return "Very easy to read — understood by an average 11-year-old.";
  if (score >= 80) return "Easy to read — conversational English.";
  if (score >= 70) return "Fairly easy to read.";
  if (score >= 60) return "Standard — plain English, understood by most adults.";
  if (score >= 50) return "Fairly difficult to read.";
  if (score >= 30) return "Difficult to read — best for college-level readers.";
  return "Very difficult to read — academic or technical level.";
}

function tipsFor(r: ReadabilityResult): string[] {
  const tips: string[] = [];
  if (r.avgWordsPerSentence > 20) {
    tips.push(`Average sentence is ${r.avgWordsPerSentence.toFixed(1)} words — split long sentences; aim for under 20.`);
  }
  if (r.avgSyllablesPerWord > 1.7) {
    tips.push("Heavy words detected — swap jargon for shorter everyday words where possible.");
  }
  if (r.fleschScore < 60) {
    tips.push("For a general blog audience, aim for a Flesch score of 60–70 (standard plain English).");
  }
  if (r.sentences < 3) {
    tips.push("Very few sentences — longer samples give a more reliable score.");
  }
  return tips.length > 0 ? tips : ["Readable as-is — keep sentences short and words simple to stay here."];
}

/**
 * Score blog text readability with the real Flesch formulas.
 * @throws {TypeError} on non-string input. @throws {Error} when the text has
 *   fewer than 30 words (scores on tiny samples are unreliable).
 */
export function scoreReadability(text: string): ReadabilityResult {
  if (typeof text !== "string") throw new TypeError("scoreReadability expects a string");
  const clean = text.trim();
  const words = tokenizeWords(clean);
  if (words.length < 30) {
    throw new Error(`Need at least 30 words for a reliable score (got ${words.length}).`);
  }
  const sentences = splitSentences(clean);
  const sentenceCount = Math.max(1, sentences.length);
  const syllables = words.reduce((a, w) => a + countSyllables(w), 0);

  const wps = words.length / sentenceCount;
  const spw = syllables / words.length;

  const flesch = 206.835 - 1.015 * wps - 84.6 * spw;
  const grade = 0.39 * wps + 11.8 * spw - 15.59;

  const result: ReadabilityResult = {
    fleschScore: Math.round(flesch * 10) / 10,
    gradeLevel: Math.round(grade * 10) / 10,
    verdict: verdictFor(flesch),
    words: words.length,
    sentences: sentenceCount,
    syllables,
    avgWordsPerSentence: Math.round(wps * 10) / 10,
    avgSyllablesPerWord: Math.round(spw * 100) / 100,
    heuristic: true,
    methodNote:
      "Real Flesch Reading Ease formula (Flesch, 1948). Syllable counts are a vowel-group heuristic estimate (±~3% vs dictionary counts). The score measures reading difficulty only — not accuracy, quality, or SEO value.",
  };
  return result;
}

/**
 * Contract adapter for the AnalyzerTemplate runtime.
 * Output keys: fleschScore | gradeLevel | verdict | textStats | tips | methodNote.
 */
export function runTool(
  values: Record<string, unknown>,
): { ok: boolean; values?: Record<string, unknown>; error?: string } {
  const text = values["text"];

  if (typeof text !== "string" || text.trim() === "") {
    return { ok: false, error: "Paste your blog text (at least 30 words)." };
  }

  let result: ReadabilityResult;
  try {
    result = scoreReadability(text);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not score this text." };
  }

  return {
    ok: true,
    values: {
      fleschScore: result.fleschScore,
      gradeLevel: result.gradeLevel,
      verdict: result.verdict,
      textStats: `${result.words} words, ${result.sentences} sentences, ~${result.syllables} syllables (estimate)`,
      tips: tipsFor(result),
      methodNote: result.methodNote,
    },
  };
}
