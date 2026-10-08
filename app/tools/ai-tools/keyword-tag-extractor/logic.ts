/**
 * Keyword & Tag Extractor — pure logic (tool-544 inventory slot), zero
 * imports, zero network, zero DOM.
 *
 * HONESTY CONTRACT: frequency-based keyword extraction on a single
 * document. Because there is no background corpus, there is no real IDF —
 * the method is labeled "TF-IDF-ish" only in the loose sense: tokenize,
 * drop stopwords (fixed list), score by frequency, and boost bigrams with a
 * fixed 1.5x phrase bonus. Scores measure in-document prominence, NOT
 * search demand, SEO value, or trend strength.
 */

/** Fixed English stopword list. */
export const STOPWORDS: string[] = [
  "a", "about", "above", "after", "again", "against", "all", "am", "an",
  "and", "any", "are", "as", "at", "be", "because", "been", "before",
  "being", "below", "between", "both", "but", "by", "can", "cannot",
  "could", "did", "do", "does", "doing", "don", "down", "during", "each",
  "few", "for", "from", "further", "get", "had", "has", "have", "having",
  "he", "her", "here", "hers", "herself", "him", "himself", "his", "how",
  "i", "if", "in", "into", "is", "it", "its", "itself", "just", "like",
  "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of",
  "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
  "ourselves", "out", "over", "own", "same", "she", "should", "so",
  "some", "such", "than", "that", "the", "their", "theirs", "them",
  "themselves", "then", "there", "these", "they", "this", "those",
  "through", "to", "too", "under", "until", "up", "very", "was", "we",
  "were", "what", "when", "where", "which", "while", "who", "whom",
  "why", "will", "with", "would", "you", "your", "yours", "yourself",
  "yourselves", "also", "may", "might", "must", "shall", "let", "us",
  "one", "two", "first", "new", "used", "using", "use", "many", "much",
  "every", "per", "within", "without", "across", "along", "among",
  "around", "toward", "towards", "upon", "whether", "whose", "yet",
];

const STOP_SET = new Set(STOPWORDS);

/** Bigrams get a fixed phrase bonus over raw frequency. */
export const BIGRAM_BONUS = 1.5;

export const MAX_TEXT_CHARS = 100000;
export const MIN_TOP_N = 5;
export const MAX_TOP_N = 50;

export interface KeywordHit {
  keyword: string;
  /** Raw occurrence count. */
  count: number;
  /** count, or count * BIGRAM_BONUS for phrases. */
  score: number;
  type: "word" | "phrase";
}

export interface ExtractResult {
  keywords: KeywordHit[];
  hashtags: string[];
  totalWords: number;
  uniqueWords: number;
}

/** Lowercase, keep letters/numbers/apostrophes, split on the rest. */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^'+|'+$/g, ""))
    .filter((t) => t.length >= 3 && !STOP_SET.has(t));
}

/**
 * Extract top-N keywords: unigram frequency + bigram frequency with the
 * 1.5x phrase bonus. Bigrams only pair adjacent kept tokens. Deterministic:
 * ties break alphabetically.
 */
export function extractKeywords(text: string, topN: number): ExtractResult {
  const tokens = tokenize(text);
  const totalWords = text.toLowerCase().match(/[a-z0-9']+/g)?.length ?? 0;

  const wordCounts = new Map<string, number>();
  for (const t of tokens) wordCounts.set(t, (wordCounts.get(t) ?? 0) + 1);

  const bigramCounts = new Map<string, number>();
  for (let i = 0; i + 1 < tokens.length; i++) {
    const b = `${tokens[i]} ${tokens[i + 1]}`;
    bigramCounts.set(b, (bigramCounts.get(b) ?? 0) + 1);
  }

  const hits: KeywordHit[] = [];
  for (const [keyword, count] of wordCounts) {
    hits.push({ keyword, count, score: count, type: "word" });
  }
  for (const [keyword, count] of bigramCounts) {
    if (count >= 2) {
      hits.push({
        keyword,
        count,
        score: Math.round(count * BIGRAM_BONUS * 100) / 100,
        type: "phrase",
      });
    }
  }

  hits.sort((a, b) => b.score - a.score || a.keyword.localeCompare(b.keyword));
  const keywords = hits.slice(0, topN);
  const hashtags = keywords.map((k) => toHashtag(k.keyword));

  return {
    keywords,
    hashtags,
    totalWords,
    uniqueWords: wordCounts.size,
  };
}

/** "email marketing" -> "#EmailMarketing". */
export function toHashtag(keyword: string): string {
  const tag = keyword
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
  return `#${tag}`;
}

export const METHOD_NOTE =
  "Frequency-based ranking on your text alone (no background corpus, so no true IDF). Scores measure in-document prominence — not search demand or SEO value.";

/**
 * Tool entry point (matches the platform ToolRunFn contract).
 * values.text: string, required, 1..MAX_TEXT_CHARS chars.
 * values.topN: number, optional, default 15, 5..50.
 * values.includeHashtags: boolean, optional, default true.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const raw = values["text"];
  if (raw === undefined || raw === null || raw === "") {
    return { ok: false, error: "Please paste the text you want to analyze." };
  }
  if (typeof raw !== "string") {
    return { ok: false, error: "Text must be text." };
  }
  const text = raw.trim();
  if (text.length === 0) {
    return { ok: false, error: "Please paste the text you want to analyze." };
  }
  if (text.length > MAX_TEXT_CHARS) {
    return {
      ok: false,
      error: `Text must be ${MAX_TEXT_CHARS.toLocaleString("en-US")} characters or fewer.`,
    };
  }

  let topN = 15;
  const rawTopN = values["topN"];
  if (rawTopN !== undefined && rawTopN !== null && rawTopN !== "") {
    const n = typeof rawTopN === "number" ? rawTopN : Number(rawTopN);
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      return { ok: false, error: "Top N must be a whole number." };
    }
    if (n < MIN_TOP_N || n > MAX_TOP_N) {
      return {
        ok: false,
        error: `Top N must be between ${MIN_TOP_N} and ${MAX_TOP_N}.`,
      };
    }
    topN = n;
  }

  const includeHashtags =
    values["includeHashtags"] === undefined || values["includeHashtags"] === null
      ? true
      : values["includeHashtags"] === true || values["includeHashtags"] === "true";

  const result = extractKeywords(text, topN);
  return {
    ok: true,
    values: {
      keywords: result.keywords,
      hashtags: includeHashtags ? result.hashtags : [],
      count: result.keywords.length,
      totalWords: result.totalWords,
      uniqueWords: result.uniqueWords,
      methodNote: METHOD_NOTE,
    },
  };
}
