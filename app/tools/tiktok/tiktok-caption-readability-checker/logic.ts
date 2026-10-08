/**
 * TikTok Caption Readability Checker — pure logic (tool-177).
 * Zero imports, zero network, zero DOM, zero randomness.
 *
 * SCORING ENGINE (fully client-side, feasible per spec honesty note):
 *   - Flesch Reading Ease (206.835 − 1.015 × words/sentences − 84.6 ×
 *     syllables/words) and Flesch–Kincaid Grade Level
 *     (0.39 × words/sentences + 11.8 × syllables/words − 15.59).
 *     Both are PUBLIC, long-established formulas — not TikTok data.
 *   - Syllables are counted with a FIXED English heuristic (vowel-group
 *     counting); scores are labeled estimates, never predictions.
 *   - Flags sentences longer than LONG_SENTENCE_WORDS (20) words and
 *     produces rule-based rewrite suggestions from fixed templates.
 *   - Non-English-looking captions are labeled "English-model only" via a
 *     notes output — the score is not presented as a fact for them.
 *   - Captions over TIKTOK_CAPTION_LIMIT (2200) characters produce a
 *     warning note instead of an error (per spec: warns if over).
 */

export const TIKTOK_CAPTION_LIMIT = 2200;

/** Sentences longer than this many words are flagged as hard to read. */
export const LONG_SENTENCE_WORDS = 20;

/** Words with more syllables than this are flagged as complex. */
export const COMPLEX_WORD_SYLLABLES = 3;

/** More hashtags than this triggers a density suggestion. */
export const HASHTAG_SUGGEST_THRESHOLD = 5;

/** Below this share of ASCII-letter words, caption is labeled non-English. */
export const NON_ENGLISH_ASCII_RATIO = 0.6;

const VOWELS = "aeiouy";

/**
 * Fixed English syllable heuristic: count vowel groups, drop a silent
 * trailing "e". Estimate — not a dictionary lookup.
 */
export function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (clean.length === 0) return 0;
  if (clean.length <= 3) return 1;
  let count = 0;
  let prevVowel = false;
  for (const ch of clean) {
    const isVowel = VOWELS.includes(ch);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  if (clean.endsWith("e") && count > 1) count--;
  return Math.max(count, 1);
}

function splitWords(text: string): string[] {
  return text.split(/\s+/).filter((w) => w.length > 0);
}

function splitSentences(text: string): string[] {
  const matches = text.match(/[^.!?…]+[.!?…]+[""')\]]*\s*/g);
  if (!matches) return text.trim().length > 0 ? [text.trim()] : [];
  return matches.map((s) => s.trim()).filter((s) => s.length > 0);
}

/** Share of words made only of ASCII letters — English-likeness estimate. */
export function asciiWordRatio(text: string): number {
  const words = splitWords(text);
  if (words.length === 0) return 1;
  const ascii = words.filter((w) => /^[a-zA-Z][a-zA-Z'\-]*$/.test(w)).length;
  return ascii / words.length;
}

export interface CaptionScore {
  fleschScore: number;
  gradeLevel: string;
  gradeNumeric: number;
  longSentences: string[];
  suggestions: string[];
  notes: string[];
}

export function scoreCaption(captionText: string): CaptionScore {
  const text = captionText.trim();
  const words = splitWords(text);
  const sentences = splitSentences(text);
  const syllableTotal = words.reduce((sum, w) => sum + countSyllables(w), 0);

  const wordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
  const syllablesPerWord = words.length > 0 ? syllableTotal / words.length : 0;

  const flesch =
    words.length === 0
      ? 0
      : 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  const fleschScore = Math.round(Math.max(0, Math.min(121.22, flesch)) * 10) / 10;

  const gradeNumeric =
    words.length === 0
      ? 0
      : Math.round((0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59) * 10) / 10;
  const gradeLevel = `Grade ${gradeNumeric} (US school level, estimated)`;

  const longSentences = sentences.filter(
    (s) => splitWords(s).length > LONG_SENTENCE_WORDS
  );

  const suggestions: string[] = [];
  for (const s of longSentences.slice(0, 5)) {
    const preview = s.length > 60 ? `${s.slice(0, 60)}…` : s;
    suggestions.push(
      `Split this long sentence into two shorter ones: "${preview}"`
    );
  }
  const complexWords = Array.from(
    new Set(
      words.filter(
        (w) =>
          countSyllables(w) > COMPLEX_WORD_SYLLABLES && /^[a-zA-Z'\-]+$/.test(w)
      )
    )
  ).slice(0, 3);
  if (complexWords.length > 0)
    suggestions.push(
      `Consider simpler words for: ${complexWords.join(", ")} — shorter words read faster on small screens.`
    );
  const hashtagCount = (text.match(/#[\p{L}\p{N}_]+/gu) || []).length;
  if (hashtagCount > HASHTAG_SUGGEST_THRESHOLD)
    suggestions.push(
      `You use ${hashtagCount} hashtags — consider keeping 3–5 so the caption itself stays readable.`
    );
  const capsWords = words.filter((w) => /^[A-Z]{2,}$/.test(w)).length;
  if (capsWords > 0)
    suggestions.push(
      `${capsWords} ALL-CAPS word${capsWords === 1 ? "" : "s"} detected — all-caps slows reading; use it sparingly.`
    );
  if (suggestions.length === 0)
    suggestions.push(
      "No issues found — your caption is easy to read. Keep sentences short and hashtags to a few."
    );

  const notes: string[] = [];
  notes.push(
    "Score is an estimate from the public Flesch Reading Ease formula — a general English readability model, not a prediction of views or engagement."
  );
  if (text.length > TIKTOK_CAPTION_LIMIT)
    notes.push(
      `Caption is ${text.length} characters — over TikTok's ${TIKTOK_CAPTION_LIMIT}-character caption limit. Shorten it before posting.`
    );
  if (asciiWordRatio(text) < NON_ENGLISH_ASCII_RATIO)
    notes.push(
      "Caption looks non-English: scores use an English syllable model — treat them as 'English-model only', not as facts."
    );

  return { fleschScore, gradeLevel, gradeNumeric, longSentences, suggestions, notes };
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const raw = values["captionText"];
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return {
      ok: false,
      error: "Please paste your caption text first — the checker needs something to score.",
    };
  }
  const result = scoreCaption(raw);
  return {
    ok: true,
    values: {
      fleschScore: result.fleschScore,
      gradeLevel: result.gradeLevel,
      longSentences: result.longSentences,
      suggestions: result.suggestions,
      notes: result.notes,
    },
  };
}
