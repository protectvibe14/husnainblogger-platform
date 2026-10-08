/**
 * YouTube Title Analyzer — pure logic.
 *
 * ASSUMPTIONS:
 * - No DOM, no network, no imports. Unicode-safe via Intl.Segmenter.
 * - SCORING RUBRIC (transparent heuristic — YouTube publishes no title
 *   weighting, so this score measures observable best practices, NOT a
 *   prediction of CTR or ranking. Always label output "heuristic"):
 *
 *   Factor                          Max  How earned
 *   ──────────────────────────────  ───  ─────────────────────────────
 *   1. Length sweet spot             25   40–60 chars (full title visible in
 *                                         search/suggested): 25. 30–39 or
 *                                         61–70: 15. Under 30 or over 70: 5.
 *   2. Power words                   20   Emotional/action words from the
 *                                         built-in list: 3+ = 20, 2 = 14,
 *                                         1 = 7, 0 = 0.
 *   3. Number hook                   15   Contains a digit (listicles,
 *                                         stats, years): 15. Otherwise 0.
 *   4. Curiosity hook                15   Matches a curiosity pattern
 *                                         (how/why/what/secret/…): 15.
 *                                         Otherwise 0.
 *   5. Keyword placement             15   Target keyword (if given) starts
 *                                         the title: 15; present but later:
 *                                         8. No keyword given: first word is
 *                                         a content word (not a stopword):
 *                                         8; otherwise 0.
 *   6. Clean formatting              10   No ALL-CAPS words (2+ letters),
 *                                         no repeated !!!/???: 10. One
 *                                         issue: 5. Both: 0.
 *
 *   Total: 100. Grades: Excellent ≥80, Good ≥60, Needs work ≥40, Weak <40.
 * - Matching is case-insensitive. No stemming, no semantic similarity —
 *   documented limitation. English stopword/power-word lists — documented
 *   limitation for non-English titles.
 */

/** Stopwords for first-word / content-word checks. English-only. */
export const TITLE_STOPWORDS: ReadonlySet<string> = new Set([
  "a","an","the","and","but","or","nor","for","so","yet","as","at","by",
  "from","in","into","of","off","on","onto","out","over","per","to","up",
  "upon","via","vs","v","with","without","is","are","was","were","be",
  "this","that","these","those","it","its","my","your","how","what","why",
  "when","where","do","does","did","can","will","get","best","new","i",
]);

/** Emotion/action words commonly associated with higher CTR titles. */
export const POWER_WORDS: ReadonlySet<string> = new Set([
  "amazing","ultimate","secret","proven","free","new","best","shocking",
  "insane","crazy","epic","unbelievable","incredible","powerful","easy",
  "fast","quick","simple","guaranteed","exclusive","limited","urgent",
  "now","today","mistakes","hack","hacks","trick","tricks","tips",
  "master","complete","step","guide","revealed","truth","warning",
  "stop","never","always","everyone","nobody","wont","can't","destroyed",
  "transformed","million","billion",
]);

/** Curiosity-gap patterns (lowercased, matched as substrings). */
export const CURIOSITY_PATTERNS: readonly string[] = [
  "how to","how i","why ","what ","secret","you won't believe",
  "nobody tells","nobody talks","the truth about","what happens",
  "i tried","we tried","vs ","versus","before and after","mistake",
];

/** Weak formatting signals. */
const ALL_CAPS_WORD = /\b[A-Z]{2,}\b/;
const REPEATED_PUNCT = /([!?])\1{2,}/;

export type TitleGrade = "Excellent" | "Good" | "Needs work" | "Weak";

function tokenize(text: string): string[] {
  const seg = new Intl.Segmenter("en", { granularity: "word" });
  return [...seg.segment(text.toLowerCase())]
    .filter((s) => s.isWordLike)
    .map((s) => s.segment)
    .filter((w) => /[\p{L}\p{N}]/u.test(w));
}

function gradeFor(score: number): TitleGrade {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs work";
  return "Weak";
}

export interface TitleFactor {
  name: string;
  points: number;
  max: number;
  detail: string;
}

export interface TitleAnalysis {
  score: number;
  grade: TitleGrade;
  heuristic: true;
  charCount: number;
  wordCount: number;
  powerWordsFound: string[];
  hasNumber: boolean;
  hasCuriosity: boolean;
  factors: TitleFactor[];
  tips: string[];
}

/**
 * Analyze a YouTube title against the rubric in this file's header JSDoc.
 * @throws {TypeError} on non-string inputs. @throws {Error} on empty title.
 */
export function analyzeTitle(title: string, keyword: string): TitleAnalysis {
  if (typeof title !== "string" || typeof keyword !== "string") {
    throw new TypeError("analyzeTitle expects two strings");
  }
  const cleanTitle = title.trim();
  if (cleanTitle === "") throw new Error("analyzeTitle requires a non-empty title");
  const cleanKeyword = keyword.trim().toLowerCase();

  const lower = cleanTitle.toLowerCase();
  const words = tokenize(cleanTitle);
  const factors: TitleFactor[] = [];
  const tips: string[] = [];
  let score = 0;

  // 1. Length sweet spot (25)
  const len = [...cleanTitle].length;
  const p1 = len >= 40 && len <= 60 ? 25 : (len >= 30 && len <= 70 ? 15 : 5);
  score += p1;
  factors.push({
    name: "Length sweet spot",
    points: p1,
    max: 25,
    detail: `${len} characters. 40–60 keeps the full title visible in search and suggested.`,
  });
  if (len < 40) tips.push("Your title is short — add a specific detail or benefit to reach 40–60 characters.");
  if (len > 60) tips.push("Titles over 60 characters get cut off in search — move the key words to the front.");

  // 2. Power words (20)
  const found = [...new Set(words.filter((w) => POWER_WORDS.has(w)))];
  const p2 = found.length >= 3 ? 20 : found.length === 2 ? 14 : found.length === 1 ? 7 : 0;
  score += p2;
  factors.push({
    name: "Power words",
    points: p2,
    max: 20,
    detail: found.length > 0 ? `Found: ${found.join(", ")}.` : "No power words detected.",
  });
  if (found.length === 0) tips.push("Add 1–2 power words (e.g. ultimate, proven, secret, mistakes) to lift CTR.");

  // 3. Number hook (15)
  const hasNumber = /\d/.test(cleanTitle);
  const p3 = hasNumber ? 15 : 0;
  score += p3;
  factors.push({
    name: "Number hook",
    points: p3,
    max: 15,
    detail: hasNumber ? "Contains a number — listicles and stats earn clicks." : "No number found.",
  });
  if (!hasNumber) tips.push("Consider adding a number (7 tips, 2026, 3 mistakes) — numbered titles stand out.");

  // 4. Curiosity hook (15)
  const hasCuriosity = CURIOSITY_PATTERNS.some((p) => lower.includes(p));
  const p4 = hasCuriosity ? 15 : 0;
  score += p4;
  factors.push({
    name: "Curiosity hook",
    points: p4,
    max: 15,
    detail: hasCuriosity ? "Opens a curiosity gap (how/why/what/secret…). " : "No curiosity pattern detected.",
  });
  if (!hasCuriosity) tips.push("Open a curiosity gap — how/why/what or a 'secret' angle makes people click to find out.");

  // 5. Keyword placement (15)
  let p5 = 0;
  let kwDetail: string;
  if (cleanKeyword) {
    if (lower.startsWith(cleanKeyword)) {
      p5 = 15;
      kwDetail = "Target keyword starts the title — best placement.";
    } else if (lower.includes(cleanKeyword)) {
      p5 = 8;
      kwDetail = "Target keyword is present but not at the start — move it forward.";
      tips.push("Move your target keyword to the very start of the title.");
    } else {
      kwDetail = "Target keyword not found in the title.";
      tips.push("Your target keyword is missing from the title — add it near the front.");
    }
  } else {
    const first = words[0] ?? "";
    if (first && !TITLE_STOPWORDS.has(first)) {
      p5 = 8;
      kwDetail = "No keyword given — first word is a content word (good default).";
    } else {
      kwDetail = "No keyword given — title starts with a filler word.";
      tips.push("Start the title with your main topic keyword instead of a filler word.");
    }
  }
  score += p5;
  factors.push({ name: "Keyword placement", points: p5, max: 15, detail: kwDetail });

  // 6. Clean formatting (10)
  const hasCaps = ALL_CAPS_WORD.test(cleanTitle);
  const hasPunct = REPEATED_PUNCT.test(cleanTitle);
  const p6 = !hasCaps && !hasPunct ? 10 : hasCaps !== hasPunct ? 5 : 0;
  score += p6;
  factors.push({
    name: "Clean formatting",
    points: p6,
    max: 10,
    detail:
      !hasCaps && !hasPunct
        ? "No ALL-CAPS words or repeated punctuation."
        : [
            hasCaps ? "ALL-CAPS words detected (looks spammy)" : "",
            hasPunct ? 'Repeated !!!/??? detected' : "",
          ]
            .filter(Boolean)
            .join(" "),
  });
  if (hasCaps) tips.push("Drop the ALL-CAPS words — one capitalized word is fine, shouting hurts trust.");
  if (hasPunct) tips.push("Remove repeated !!! or ??? — a single mark is enough.");

  return {
    score,
    grade: gradeFor(score),
    heuristic: true,
    charCount: len,
    wordCount: words.length,
    powerWordsFound: found,
    hasNumber,
    hasCuriosity,
    factors,
    tips: tips.length > 0 ? tips : ["Solid title — test it against a variant and keep the winner."],
  };
}

/**
 * Contract adapter for the AnalyzerTemplate runtime.
 * Output keys: score | grade | factorBreakdown | tips | charCount | heuristicNote.
 */
export function runTool(
  values: Record<string, unknown>,
): { ok: boolean; values?: Record<string, unknown>; error?: string } {
  const title = values["title"];
  const keyword = values["keyword"];

  if (typeof title !== "string" || title.trim() === "") {
    return { ok: false, error: "Enter your video title." };
  }
  if (keyword !== undefined && typeof keyword !== "string") {
    return { ok: false, error: "Keyword must be text." };
  }

  let result: TitleAnalysis;
  try {
    result = analyzeTitle(title, typeof keyword === "string" ? keyword : "");
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not analyze this title." };
  }

  return {
    ok: true,
    values: {
      score: result.score,
      grade: result.grade,
      factorBreakdown: result.factors.map((f) => `${f.name}: ${f.points}/${f.max} — ${f.detail}`),
      tips: result.tips,
      charCount: `${result.charCount} characters, ${result.wordCount} words`,
      heuristicNote:
        "Heuristic only — YouTube publishes no title weighting, so this scores observable best practices (length, hooks, keyword placement, formatting), not CTR or ranking.",
    },
  };
}
