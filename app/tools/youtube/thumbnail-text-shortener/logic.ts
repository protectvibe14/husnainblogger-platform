/**
 * Thumbnail Text Shortener (tool-143) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * RULE-BASED SHORTENING, NOT AI COPYWRITING: the engine tokenizes the
 * input, strips a fixed stopword bank, scores the remaining words with a
 * fixed rule set (numbers +3, emotion/hook words from a fixed bank +2,
 * capitalized words +1), and keeps at most 5 words in original order.
 * Casing variants are mechanical transformations. Bank sizes are
 * documented below and returned in every result.
 *
 * Deterministic: same text + casing → same output, always.
 */

/**
 * Fixed stopword bank (64 words). These are stripped first because they
 * add length without impact on a thumbnail.
 */
export const STOPWORDS: string[] = [
  "a", "an", "the", "of", "to", "for", "with", "and", "or", "but", "in",
  "on", "at", "by", "from", "up", "down", "over", "under", "about",
  "into", "through", "during", "between", "after", "before", "this",
  "that", "these", "those", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "should", "could", "can", "you", "your", "yours", "my", "me", "we",
  "our", "it", "its", "as", "so", "not", "how", "what", "why", "when",
];

/**
 * Fixed emotion/hook word bank (40 words). These carry impact on a
 * thumbnail, so they are preferred when trimming to 5 words.
 */
export const HOOK_WORDS: string[] = [
  "free", "secret", "secrets", "insane", "shocking", "never", "always",
  "pro", "pros", "best", "worst", "ultimate", "amazing", "epic", "crazy",
  "powerful", "simple", "easy", "fast", "quick", "proven", "new", "real",
  "truth", "hack", "hacks", "mistake", "mistakes", "stop", "win", "wins",
  "loss", "money", "rich", "broke", "beginner", "advanced", "vs", "exposed",
  "warning",
];

/** Maximum words on a thumbnail per this tool's rule. */
export const MAX_WORDS = 5;

export type Casing = "original" | "title" | "upper";

export const CASINGS: Casing[] = ["original", "title", "upper"];

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function isCasing(s: string): s is Casing {
  return (CASINGS as string[]).includes(s);
}

/** Strip trailing/leading punctuation for stopword comparison. */
function coreWord(w: string): string {
  return w.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");
}

function isNumber(w: string): boolean {
  return /^\d+([.,]\d+)?$/.test(coreWord(w));
}

function scoreWord(w: string): number {
  const core = coreWord(w).toLowerCase();
  if (core.length === 0) return -1;
  if (isNumber(w)) return 3;
  if (HOOK_WORDS.includes(core)) return 2;
  if (/[A-Z]/.test(w) && /[a-z]/.test(w)) return 1; // proper-cased word
  return 0;
}

function applyCasing(text: string, casing: Casing): string {
  if (casing === "upper") return text.toUpperCase();
  if (casing === "title") {
    return text
      .split(" ")
      .map((w) => {
        const core = coreWord(w);
        if (core.length === 0) return w;
        const idx = w.indexOf(core);
        return (
          w.slice(0, idx) +
          core.charAt(0).toUpperCase() +
          core.slice(1).toLowerCase() +
          w.slice(idx + core.length)
        );
      })
      .join(" ");
  }
  return text;
}

export interface ShortenResult {
  original: string;
  shortened: string;
  wordCount: number;
  /** Three mechanical casing variants of the shortened text. */
  variants: { casing: Casing; text: string }[];
  wasAlreadyShort: boolean;
  stopwordsRemoved: string[];
  guidance: string;
  banks: { stopwords: number; hookWords: number };
  assumptions: string[];
}

export const ASSUMPTIONS: string[] = [
  "Shortening is rule-based (stopword removal + fixed scoring), not AI copywriting — word choice quality is the user's judgment.",
  "At most 5 words are kept; numbers and emotion/hook words from the fixed bank are preferred when trimming.",
  "Mobile-size guidance is a fixed readability rule of thumb, not measured legibility data from any device.",
];

export const GUIDANCE =
  "Thumbnail text should be readable at small sizes: keep it under 6 words, use bold sans-serif at large sizes, and prefer high-contrast colors (e.g. white text on a dark outline). Re-check legibility on an actual phone before publishing.";

function shorten(text: string, casing: Casing): ShortenResult {
  const original = text.trim();
  const tokens = original.split(/\s+/).filter((t) => t.length > 0);

  const kept: string[] = [];
  const stopwordsRemoved: string[] = [];
  for (const tok of tokens) {
    const core = coreWord(tok).toLowerCase();
    if (core.length > 0 && STOPWORDS.includes(core)) {
      stopwordsRemoved.push(tok);
    } else {
      kept.push(tok);
    }
  }

  // Already short (<= 5 words after stopword removal) → return as-is.
  if (kept.length <= MAX_WORDS) {
    const joined = kept.join(" ");
    const final = applyCasing(joined, casing);
    return {
      original,
      shortened: final,
      wordCount: kept.length,
      variants: CASINGS.map((c) => ({ casing: c, text: applyCasing(joined, c) })),
      wasAlreadyShort: true,
      stopwordsRemoved,
      guidance: GUIDANCE,
      banks: { stopwords: STOPWORDS.length, hookWords: HOOK_WORDS.length },
      assumptions: [...ASSUMPTIONS],
    };
  }

  // Trim to 5: rank by score, tie-break by original position,
  // then restore original order.
  const ranked = kept
    .map((w, i) => ({ w, i, score: scoreWord(w) }))
    .filter((e) => e.score >= 0)
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, MAX_WORDS)
    .sort((a, b) => a.i - b.i)
    .map((e) => e.w);

  const joined = ranked.join(" ");
  const final = applyCasing(joined, casing);
  return {
    original,
    shortened: final,
    wordCount: ranked.length,
    variants: CASINGS.map((c) => ({ casing: c, text: applyCasing(joined, c) })),
    wasAlreadyShort: false,
    stopwordsRemoved,
    guidance: GUIDANCE,
    banks: { stopwords: STOPWORDS.length, hookWords: HOOK_WORDS.length },
    assumptions: [...ASSUMPTIONS],
  };
}

/**
 * Formatter entry point.
 * `values.text` (required, non-empty); `values.casing` optional
 * ("original" | "title" | "upper", default "original").
 *
 * Output keys (must match meta.ts outputs): shortened, variants,
 * wordCount, guidance, wasAlreadyShort, banks.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const text = typeof values["text"] === "string" ? values["text"] : "";
  if (text.trim().length === 0) {
    return {
      ok: false,
      error: "Enter some text first — the tool needs a title or thumbnail text to shorten.",
    };
  }
  if (text.length > 5000) {
    return {
      ok: false,
      error: "Text is too long — keep it under 5,000 characters.",
    };
  }
  const casingRaw =
    typeof values["casing"] === "string" && values["casing"].trim().length > 0
      ? values["casing"].trim().toLowerCase()
      : "original";
  if (!isCasing(casingRaw)) {
    return {
      ok: false,
      error: `Unknown casing "${values["casing"]}". Choose one of: original, title, upper.`,
    };
  }

  const r = shorten(text, casingRaw);
  return {
    ok: true,
    values: {
      shortened: r.shortened,
      variants: r.variants.map((v) => v.text),
      wordCount: r.wordCount,
      guidance: r.guidance,
      wasAlreadyShort: r.wasAlreadyShort,
      banks: r.banks,
    },
  };
}
