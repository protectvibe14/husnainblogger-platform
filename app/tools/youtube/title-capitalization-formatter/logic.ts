/**
 * Title Capitalization Formatter — pure logic.
 *
 * ASSUMPTIONS:
 * - No DOM, no network, no imports. Unicode handled via Intl.Segmenter
 *   (available in Node 18+ and all modern browsers).
 * - "Title case" follows a Chicago/AP-flavoured rule set: first and last words
 *   are always capitalized; "small words" (articles, coordinating conjunctions,
 *   common prepositions) are lowercased mid-title.
 * - Acronyms (all-caps words of 2+ letters, e.g. AI, USB, DIY), words with
 *   internal capitals (e.g. iPhone, eBay), and tokens containing digits
 *   (e.g. 4K, 1080p) are preserved as-is — never force-cased. In sentence
 *   case, the sentence capital lands on the first non-preserved word.
 * - Small-word list is a fixed English set; non-English titles get the same
 *   structural rules (first/last capitalized, acronyms preserved) but the
 *   small-word exception only applies to English words.
 * - Character counts are graphemes (Intl.Segmenter), so emoji and CJK count
 *   as one visible character. YouTube itself counts UTF-16 code units, which
 *   can differ for emoji; the checker below is conservative and reports
 *   graphemes — see `checkTitle` JSDoc.
 */

/** Formatting styles supported by this tool. */
export type CapitalizationStyle = "title" | "sentence" | "upper" | "lower";

/**
 * Small words lowercased mid-title in "title" style. (Articles, coordinating
 * conjunctions, common prepositions — Chicago/AP-flavoured.)
 */
export const SMALL_WORDS: ReadonlySet<string> = new Set([
  "a", "an", "the",
  "and", "but", "or", "nor", "for", "so", "yet",
  "as", "at", "by", "for", "from", "in", "into", "of", "off", "on",
  "onto", "out", "over", "per", "to", "up", "upon", "via", "vs", "v",
  "with", "without",
]);

/** YouTube title hard limit (platform-rules/youtube.json -> title.hardLimit). */
export const TITLE_HARD_LIMIT = 100;
/** Search/suggestion display truncation zone (title.displayLimit). */
export const TITLE_DISPLAY_LIMIT = 70;

/**
 * Common all-caps tokens restored after normalizing an all-shouted title.
 * Heuristic, intentionally small — anything not listed is treated as a
 * normal word. Documented limitation: obscure acronyms in shouted titles
 * will be normalized (e.g. "BEST HDMI CABLES" -> "Best Hdmi Cables").
 */
export const KNOWN_ACRONYMS: ReadonlySet<string> = new Set([
  "ai", "tv", "usb", "diy", "led", "lcd", "oled", "hd", "4k", "8k",
  "gps", "vpn", "pdf", "url", "faq", "dm", "pm", "am", "fm",
]);

/**
 * If every letter-bearing word is all-caps (a pasted "shouted" title),
 * normalize: lowercase everything, then restore digit-tokens and known
 * acronyms to their canonical form. Mixed-case input is left untouched so
 * genuine acronyms (AI, USB) survive.
 */
function normalizeShouted(text: string): string {
  const segs = segmentWords(text);
  const letterWords = segs.filter((s) => s.isWord && /[\p{L}]/u.test(s.text));
  if (letterWords.length === 0) return text;
  const allCaps = letterWords.every((s) => {
    const letters = s.text.replace(/[^\p{L}]/gu, "");
    return letters.length > 0 && letters === letters.toLocaleUpperCase("en");
  });
  if (!allCaps) return text;
  return segs
    .map((s) => {
      if (!s.isWord) return s.text;
      if (/[0-9]/.test(s.text)) return s.text; // 4K stays
      const low = s.text.toLocaleLowerCase("en");
      if (KNOWN_ACRONYMS.has(low)) return low.toLocaleUpperCase("en");
      return low;
    })
    .join("");
}

function graphemes(text: string): string[] {
  const seg = new Intl.Segmenter("en", { granularity: "grapheme" });
  return [...seg.segment(text)].map((s) => s.segment);
}

/**
 * True if the word should never be force-cased: acronyms (2+ uppercase
 * letters), tokens with internal capitals, or tokens containing digits.
 */
export function isPreservedWord(word: string): boolean {
  if (word.length === 0) return true;
  if (/[0-9]/.test(word)) return true; // 4K, 1080p, v2
  const letters = word.replace(/[^\p{L}]/gu, "");
  if (letters.length === 0) return true; // punctuation-only tokens
  if (letters.length >= 2 && letters === letters.toUpperCase() && letters !== letters.toLowerCase()) {
    return true; // AI, USB, DIY
  }
  const rest = word.slice(1);
  if (/[\p{Lu}]/u.test(rest) && /[\p{Ll}]/u.test(word)) return true; // iPhone, eBay
  return false;
}

/** Capitalize the first letter, lowercase the rest (grapheme-safe). */
function capitalizeWord(word: string): string {
  const gs = graphemes(word);
  const idx = gs.findIndex((g) => /\p{L}/u.test(g));
  if (idx === -1) return word;
  return (
    gs.slice(0, idx).join("") +
    gs[idx].toLocaleUpperCase("en") +
    gs.slice(idx + 1).join("").toLocaleLowerCase("en")
  );
}

function lowercaseWord(word: string): string {
  return graphemes(word).map((g) => g.toLocaleLowerCase("en")).join("");
}

interface WordSeg {
  text: string;
  isWord: boolean;
  wordIndex: number; // index among word-like segments
  wordCount: number; // total word-like segments
}

function segmentWords(text: string): WordSeg[] {
  const seg = new Intl.Segmenter("en", { granularity: "word" });
  const raw = [...seg.segment(text)];
  const words = raw.filter((s) => s.isWordLike);
  let wi = 0;
  return raw.map((s) => ({
    text: s.segment,
    isWord: s.isWordLike ?? false,
    wordIndex: s.isWordLike ? wi++ : -1,
    wordCount: words.length,
  }));
}

function titleCaseWord(seg: WordSeg): string {
  if (!seg.isWord) return seg.text;
  if (isPreservedWord(seg.text)) return seg.text;
  const first = seg.wordIndex === 0;
  const last = seg.wordIndex === seg.wordCount - 1;
  if (first || last) return capitalizeWord(seg.text);
  // Hyphenated compounds: apply small-word rule per part (state-of-the-art).
  if (seg.text.includes("-") || seg.text.includes("–")) {
    return seg.text
      .split(/(-|–)/)
      .map((part, i) =>
        i % 2 === 1 || isPreservedWord(part)
          ? part
          : SMALL_WORDS.has(part.toLocaleLowerCase("en"))
            ? lowercaseWord(part)
            : capitalizeWord(part),
      )
      .join("");
  }
  if (SMALL_WORDS.has(seg.text.toLocaleLowerCase("en"))) {
    return lowercaseWord(seg.text);
  }
  return capitalizeWord(seg.text);
}

/**
 * Format a video title in the requested style.
 * @throws {TypeError} if input is not a string.
 */
export function formatTitle(input: string, style: CapitalizationStyle = "title"): string {
  if (typeof input !== "string") {
    throw new TypeError("formatTitle expects a string");
  }
  const trimmed = input.trim();
  if (trimmed === "") return "";
  // Normalize fully-shouted titles before applying style rules.
  const source = style === "title" || style === "sentence" ? normalizeShouted(trimmed) : trimmed;
  switch (style) {
    case "upper":
      return graphemes(source).map((g) => g.toLocaleUpperCase("en")).join("");
    case "lower":
      return graphemes(source).map((g) => g.toLocaleLowerCase("en")).join("");
    case "sentence": {
      const segs = segmentWords(source);
      let firstDone = false;
      return segs
        .map((s) => {
          if (!s.isWord) return s.text;
          if (isPreservedWord(s.text)) return s.text;
          if (!firstDone) {
            firstDone = true;
            return capitalizeWord(s.text);
          }
          return lowercaseWord(s.text);
        })
        .join("");
    }
    case "title":
    default:
      return segmentWords(source).map(titleCaseWord).join("");
  }
}

/** Grapheme (visible-character) count — safe for emoji, ZWJ sequences, CJK. */
export function charCountGraphemes(text: string): number {
  if (typeof text !== "string") throw new TypeError("charCountGraphemes expects a string");
  return graphemes(text).length;
}

export interface TitleCheck {
  formatted: Record<CapitalizationStyle, string>;
  charCount: number;
  overHardLimit: boolean;
  charsOver: number;
  truncatedInSearch: boolean;
  note: string;
}

/**
 * Full check: all four style variants, grapheme count, and limit flags.
 * NOTE: YouTube counts UTF-16 code units; this tool counts graphemes, so an
 * emoji-heavy title may be reported 1-2 chars shorter than YouTube's counter.
 * The tool is conservative by flagging at TITLE_DISPLAY_LIMIT (70) well below
 * the hard limit.
 */
export function checkTitle(input: string): TitleCheck {
  if (typeof input !== "string") throw new TypeError("checkTitle expects a string");
  const trimmed = input.trim();
  const charCount = charCountGraphemes(trimmed);
  const overHardLimit = charCount > TITLE_HARD_LIMIT;
  const truncatedInSearch = charCount > TITLE_DISPLAY_LIMIT;
  let note = "OK";
  if (overHardLimit) note = `Over YouTube's 100-character hard limit by ${charCount - TITLE_HARD_LIMIT}.`;
  else if (truncatedInSearch) note = "Within limits, but will truncate in search/suggestions (~70 chars).";
  return {
    formatted: {
      title: formatTitle(trimmed, "title"),
      sentence: formatTitle(trimmed, "sentence"),
      upper: formatTitle(trimmed, "upper"),
      lower: formatTitle(trimmed, "lower"),
    },
    charCount,
    overHardLimit,
    charsOver: Math.max(0, charCount - TITLE_HARD_LIMIT),
    truncatedInSearch,
    note,
  };
}

/**
 * UI adapter (formatter template dispatch): validates the form values and
 * returns the formatted title, grapheme count, and a truncation warning.
 * Output keys match meta.ts outputs: formatted, charCount, warning.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawTitle = values.title;
  if (typeof rawTitle !== "string" || rawTitle.trim() === "") {
    return { ok: false, error: "Enter a title to format — the title field is empty." };
  }
  const title = rawTitle.trim();

  const STYLE_LABELS: Record<string, CapitalizationStyle> = {
    "Title Case": "title",
    "Sentence case": "sentence",
    "ALL CAPS": "upper",
    lowercase: "lower",
    // accept internal ids too
    title: "title",
    sentence: "sentence",
    upper: "upper",
    lower: "lower",
  };
  const rawStyle = values.style;
  const styleKey = typeof rawStyle === "string" ? STYLE_LABELS[rawStyle] : undefined;
  if (styleKey === undefined) {
    return {
      ok: false,
      error: 'Pick a style: "Title Case", "Sentence case", "ALL CAPS" or "lowercase".',
    };
  }

  const count = charCountGraphemes(title);
  if (count > TITLE_HARD_LIMIT) {
    return {
      ok: false,
      error: `Your title is ${count} characters — YouTube's hard limit is 100. Shorten it before formatting.`,
    };
  }

  const formatted = formatTitle(title, styleKey);
  let warning = "OK — fits YouTube's 100-character hard limit.";
  if (count > TITLE_DISPLAY_LIMIT) {
    warning = `Fits the 100-char hard limit, but at ${count} characters it will truncate in search and suggestions (~70 chars shown).`;
  }
  return {
    ok: true,
    values: { formatted, charCount: count, warning },
  };
}
