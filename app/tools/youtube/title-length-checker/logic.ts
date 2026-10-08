/**
 * Title Length Checker — pure logic.
 *
 * ENGINE: char-counter vs platform limits (grapheme-aware).
 *
 * ASSUMPTIONS:
 * - No DOM, no network, no imports. Unicode handled via Intl.Segmenter
 *   (Node 18+ and all modern browsers).
 * - Character counts are GRAPHEMES (visible characters): one emoji or one
 *   CJK character counts as one, including ZWJ sequences like 👨‍👩‍👧‍👦.
 * - HONESTY NOTE: YouTube's own counter uses UTF-16 code units, not
 *   graphemes. An emoji-heavy title can therefore measure 1–2 units longer
 *   on YouTube than this tool reports. The tool is conservative: it flags
 *   the ~70-character search-truncation zone well before the 100-char hard
 *   limit, and the note field states the unit difference explicitly.
 * - The "front-load guidance" heuristic is just that — a heuristic: it finds
 *   the first content word (a word of 4+ letters that is not a small word)
 *   and reports its grapheme position. It cannot know your real keyword.
 * - Limits are YouTube's public title limits: hard limit 100, display
 *   truncation zone ~70.
 */

/** YouTube title hard limit (graphemes compared against this). */
export const TITLE_HARD_LIMIT = 100;
/** Search/suggestion display truncation zone (conservative). */
export const TITLE_DISPLAY_LIMIT = 70;
/**
 * Front-load threshold: if the first content word starts after this
 * grapheme index, the tool suggests moving it earlier. Heuristic.
 */
export const FRONT_LOAD_THRESHOLD = 40;

/** Status values returned by checkTitleLength / runTool. */
export type TitleLengthStatus = "ok" | "truncated-in-search" | "over-hard-limit";

/**
 * Small words ignored when locating the "first content word" for
 * front-load guidance (fixed English set).
 */
const SMALL_WORDS: ReadonlySet<string> = new Set([
  "a", "an", "the",
  "and", "but", "or", "nor", "for", "so", "yet",
  "as", "at", "by", "from", "in", "into", "of", "off", "on",
  "onto", "out", "over", "per", "to", "up", "upon", "via", "vs", "v",
  "with", "without",
]);

function graphemes(text: string): string[] {
  const seg = new Intl.Segmenter("en", { granularity: "grapheme" });
  return [...seg.segment(text)].map((s) => s.segment);
}

/** Grapheme (visible-character) count — emoji and ZWJ sequences count as one. */
export function charCountGraphemes(text: string): number {
  if (typeof text !== "string") throw new TypeError("charCountGraphemes expects a string");
  return graphemes(text).length;
}

export interface TitleLengthCheck {
  charCount: number;
  status: TitleLengthStatus;
  charsRemaining: number;
  truncatedInSearch: boolean;
  guidance: string;
  unitNote: string;
}

/**
 * Finds the first "content word" (4+ letters, not a small word) and returns
 * its text plus its grapheme start index. Returns null when none exists.
 * HEURISTIC: the tool cannot know your real keyword — this is a structural
 * proxy, not keyword detection.
 */
export function firstContentWord(text: string): { word: string; graphemeIndex: number } | null {
  if (typeof text !== "string") throw new TypeError("firstContentWord expects a string");
  const wordSeg = new Intl.Segmenter("en", { granularity: "word" });
  const raw = [...wordSeg.segment(text)];
  const gs = graphemes(text);
  let gIndex = 0;
  for (const s of raw) {
    const len = graphemes(s.segment).length;
    if (s.isWordLike) {
      const word = s.segment;
      const letters = word.replace(/[^\p{L}]/gu, "");
      if (letters.length >= 4 && !SMALL_WORDS.has(word.toLocaleLowerCase("en"))) {
        return { word, graphemeIndex: gIndex };
      }
    }
    gIndex += len;
  }
  return null;
}

/**
 * Full check: grapheme count, status vs platform limits, and front-load
 * guidance. Empty input throws — the runTool adapter converts this into a
 * human error message.
 * @throws {TypeError} if input is not a string.
 * @throws {Error} if the trimmed input is empty.
 */
export function checkTitleLength(input: string): TitleLengthCheck {
  if (typeof input !== "string") throw new TypeError("checkTitleLength expects a string");
  const trimmed = input.trim();
  if (trimmed === "") throw new Error("Empty title: nothing to check.");
  const charCount = charCountGraphemes(trimmed);
  const status: TitleLengthStatus =
    charCount > TITLE_HARD_LIMIT
      ? "over-hard-limit"
      : charCount > TITLE_DISPLAY_LIMIT
        ? "truncated-in-search"
        : "ok";

  let guidance: string;
  if (status === "over-hard-limit") {
    guidance = `Over YouTube's 100-character hard limit by ${charCount - TITLE_HARD_LIMIT}. Cut ${charCount - TITLE_HARD_LIMIT} characters (or more) so the title saves.`;
  } else {
    const hit = firstContentWord(trimmed);
    if (hit === null) {
      guidance =
        "No clear content word found — put your main keyword within the first 40 characters so it survives search truncation (heuristic).";
    } else if (hit.graphemeIndex > FRONT_LOAD_THRESHOLD) {
      guidance = `Your first content word "${hit.word}" starts at character ${hit.graphemeIndex + 1}. Front-load it into the first ${FRONT_LOAD_THRESHOLD} characters so it shows in search results (heuristic).`;
    } else if (status === "truncated-in-search") {
      guidance = `Your keyword "${hit.word}" starts early (character ${hit.graphemeIndex + 1}) — good front-loading, but the tail past ~70 characters will be cut off in search.`;
    } else {
      guidance = `Your keyword "${hit.word}" starts at character ${hit.graphemeIndex + 1} — good front-loading, and the full title shows in search.`;
    }
  }

  return {
    charCount,
    status,
    charsRemaining: Math.max(0, TITLE_HARD_LIMIT - charCount),
    truncatedInSearch: charCount > TITLE_DISPLAY_LIMIT,
    guidance,
    unitNote:
      "This tool counts graphemes (visible characters); YouTube counts UTF-16 code units. Emoji-heavy titles may measure slightly longer on YouTube — keep a small buffer.",
  };
}

/**
 * UI adapter (checker template dispatch): validates the form values and
 * returns count, status, and front-load guidance.
 * Output keys match meta.ts outputs: charCount, status, guidance.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawTitle = values.title;
  if (typeof rawTitle !== "string" || rawTitle.trim() === "") {
    return { ok: false, error: "Enter a proposed title to check — the title field is empty." };
  }
  const check = checkTitleLength(rawTitle);
  return {
    ok: true,
    values: {
      charCount: check.charCount,
      status: check.status,
      guidance: `${check.guidance} ${check.unitNote}`,
    },
  };
}
