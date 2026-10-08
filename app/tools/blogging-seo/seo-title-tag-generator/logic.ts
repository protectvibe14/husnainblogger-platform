/**
 * SEO Title Tag Generator (tool-049) — pure logic (zero imports, zero
 * network, zero DOM).
 *
 * HONESTY CONTRACT: this tool assembles title SUGGESTIONS from a FIXED
 * template bank using the topic, target keyword, and brand YOU provide —
 * nothing is written by AI. The 50–60 character guidance and the ~600 px
 * truncation cutoff are widely published SERP display CONVENTIONS, not
 * guarantees: Google rewrites titles on its own. The pixel-width estimate
 * uses a fixed per-character width table (an approximation of Google's
 * title font) — it is an estimate, not a promise of how Google will
 * display the title, and nothing here promises rankings.
 *
 * Fixed content bank: TITLE_TEMPLATES — 6 templates with {keyword},
 * {topic}, and {brand} slots (documented as TEMPLATE_COUNT). The keyword
 * is placed FIRST in the primary title (front-loading), per the same
 * widely published convention.
 *
 * Fixed rules (documented here and in content.methodology):
 * - CHAR_WIDTHS: per-character pixel widths for a fixed set of common
 *   ASCII characters (approximation of Google SERP title font metrics).
 * - Unknown BMP characters default to DEFAULT_CHAR_WIDTH (10 px);
 *   characters outside the BMP (surrogate-pair emoji) count
 *   EMOJI_CHAR_WIDTH (24 px).
 * - TITLE_TRUNCATE_PX = 600: the widely published Google desktop title
 *   truncation cutoff (an estimate — Google varies by device/query).
 * - Titles over TITLE_MAX_RECOMMENDED (60) chars are flagged per title in
 *   lengthAnalysis.
 *
 * Deterministic: same inputs -> same titles, analysis, and estimate, always.
 */

export const TEMPLATE_COUNT = 6;
export const MIN_TOPIC_CHARS = 2;
export const MAX_TOPIC_CHARS = 200;
export const MAX_KEYWORD_CHARS = 100;
export const MAX_BRAND_CHARS = 40;
/** Widely published SERP display convention — NOT a guarantee. */
export const TITLE_MIN_RECOMMENDED = 50;
export const TITLE_MAX_RECOMMENDED = 60;
/** Published Google desktop title truncation estimate, in pixels. */
export const TITLE_TRUNCATE_PX = 600;
export const DEFAULT_CHAR_WIDTH = 10;
export const EMOJI_CHAR_WIDTH = 24;

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Approximate per-character pixel widths (Google SERP title font,
 * condensed to a fixed table). Characters not listed default to
 * DEFAULT_CHAR_WIDTH; surrogate-pair emoji count EMOJI_CHAR_WIDTH.
 */
const CHAR_WIDTHS: Record<string, number> = {
  " ": 5, "i": 5, "l": 5, ".": 5, ",": 5, ":": 5, ";": 5, "'": 5,
  "t": 6, "f": 6, "!": 6, "|": 6, "-": 7, "(": 7, ")": 7,
  "a": 10, "b": 10, "c": 9, "d": 10, "e": 10, "g": 10, "h": 10,
  "j": 5, "k": 9, "n": 10, "o": 10, "p": 10, "q": 10, "r": 7,
  "s": 9, "u": 10, "v": 9, "x": 9, "y": 9, "z": 9,
  "A": 12, "B": 11, "C": 12, "D": 12, "E": 11, "F": 10, "G": 13,
  "H": 12, "I": 5, "J": 8, "K": 11, "L": 10, "M": 15, "N": 12,
  "O": 13, "P": 11, "Q": 13, "R": 12, "S": 11, "T": 11, "U": 12,
  "V": 11, "W": 15, "X": 11, "Y": 10, "Z": 10,
  "0": 10, "1": 10, "2": 10, "3": 10, "4": 10, "5": 10,
  "6": 10, "7": 10, "8": 10, "9": 10,
  "@": 16, "#": 11, "%": 14, "&": 12, "*": 8, "+": 11,
  "?": 10, "=": 11, "<": 11, ">": 11, "[": 6, "]": 6,
  "_": 10, "~": 11, "/": 6, "\\": 6, '"': 8, "$": 10, "^": 10,
  "–": 10, "—": 14,
};

const TITLE_TEMPLATES: string[] = [
  "{keyword} – {topic} (Complete Guide)",
  "{topic}: {keyword} Explained Step by Step",
  "{keyword} for {topic}: Tips, Examples & FAQs",
  "How to Use {keyword} for {topic}",
  "The Ultimate {keyword} Guide for {topic}",
  "{keyword} – {topic} | {brand}",
];

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function fill(template: string, keyword: string, topic: string, brand: string): string {
  return template
    .replaceAll("{keyword}", keyword)
    .replaceAll("{topic}", topic)
    .replaceAll("{brand}", brand);
}

/** Estimate rendered pixel width using the fixed CHAR_WIDTHS table. */
export function estimatePixelWidth(text: string): number {
  let total = 0;
  for (const ch of text) {
    const w = CHAR_WIDTHS[ch];
    if (w !== undefined) {
      total += w;
    } else {
      const code = ch.codePointAt(0) ?? 0;
      total += code > 0xffff ? EMOJI_CHAR_WIDTH : DEFAULT_CHAR_WIDTH;
    }
  }
  return total;
}

export interface TitleAnalysis {
  title: string;
  charCount: number;
  overCharLimit: boolean;
  pixelWidthEstimate: number;
  overPixelCutoff: boolean;
}

/**
 * Generator entry point. values:
 *   topic: string, required, 2-200 chars
 *   targetKeyword: string, required, max 100 chars
 *   brand: string, optional, max 40 chars
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "No input provided." };
  }
  const topic = clean(values.topic);
  const keyword = clean(values.targetKeyword);
  const brand = clean(values.brand);

  if (topic.length < MIN_TOPIC_CHARS) {
    return { ok: false, error: `Topic is required (${MIN_TOPIC_CHARS}-${MAX_TOPIC_CHARS} characters).` };
  }
  if (topic.length > MAX_TOPIC_CHARS) {
    return { ok: false, error: `Topic must be ${MAX_TOPIC_CHARS} characters or fewer.` };
  }
  if (keyword.length === 0) {
    return { ok: false, error: "Target keyword is required." };
  }
  if (keyword.length > MAX_KEYWORD_CHARS) {
    return { ok: false, error: `Target keyword must be ${MAX_KEYWORD_CHARS} characters or fewer.` };
  }
  if (brand.length > MAX_BRAND_CHARS) {
    return { ok: false, error: `Brand must be ${MAX_BRAND_CHARS} characters or fewer.` };
  }

  const effectiveBrand = brand.length > 0 ? brand : "Your Brand";
  const rawTitles = TITLE_TEMPLATES.map((t) => fill(t, keyword, topic, effectiveBrand));

  // Dedupe (templates can collide when topic == keyword or brand matches).
  const seen = new Set<string>();
  const titles: string[] = [];
  for (const t of rawTitles) {
    const key = t.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      titles.push(t);
    }
  }

  const perTitle: TitleAnalysis[] = titles.map((title) => {
    const charCount = [...title].length;
    const pixelWidthEstimate = estimatePixelWidth(title);
    return {
      title,
      charCount,
      overCharLimit: charCount > TITLE_MAX_RECOMMENDED,
      pixelWidthEstimate,
      overPixelCutoff: pixelWidthEstimate > TITLE_TRUNCATE_PX,
    };
  });

  const lengthAnalysis = {
    recommendedMin: TITLE_MIN_RECOMMENDED,
    recommendedMax: TITLE_MAX_RECOMMENDED,
    pixelCutoff: TITLE_TRUNCATE_PX,
    titles: perTitle,
    note: "50–60 characters and the ~600 px cutoff are widely published SERP display conventions, not guarantees — Google may truncate or rewrite titles.",
  };

  return {
    ok: true,
    values: {
      titles,
      lengthAnalysis,
      pixelWidthEstimate: perTitle.length > 0 ? perTitle[0].pixelWidthEstimate : 0,
    },
  };
}
