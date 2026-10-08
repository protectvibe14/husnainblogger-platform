/**
 * TikTok Comment Keyword Miner (tool-154) — keyword-frequency analyzer.
 * Zero imports, zero network, zero DOM, no Math.random.
 *
 * HONESTY: This is keyword-frequency analysis of comments YOU paste in —
 * one per line. It CANNOT scrape TikTok comments (no API, no account
 * access); there is no live data here. Every count is computed from your
 * pasted text. Idea seeds are fixed templates filled with your most
 * frequent terms — suggestions, not guarantees.
 *
 * PIPELINE (all deterministic):
 *   1. Split pasted text into lines; strip URLs (http(s)://...) and
 *      @handles; drop empty lines.
 *   2. Tokenize: lowercase, Unicode letters/numbers, minimum length 3.
 *   3. Remove STOPWORDS (72 fixed English + social-media filler words).
 *   4. Emojis (\p{Extended_Pictographic}) are counted separately as
 *      sentiment tokens and reported in the summary.
 *   5. Word frequency -> top 15 (count desc, alphabetical tiebreak).
 *   6. Bigrams + trigrams of filtered tokens, minimum count 2 -> top 8.
 *   7. Idea seeds: top 5 words plugged into 5 fixed idea templates.
 *
 * Edge cases (from spec):
 *   - Fewer than 5 comments: a low-confidence warning is added to the
 *     summary (analysis still runs).
 *   - Non-English comments: frequency counting is script-agnostic, so it
 *     still works; idea seeds default to English templates.
 *
 * Deterministic: same pasted comments -> same analysis, always.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Minimum token length (spec). */
export const MIN_TOKEN_LENGTH = 3;

/** Minimum phrase frequency to surface a bigram/trigram. */
export const MIN_PHRASE_COUNT = 2;

export const TOP_WORDS_LIMIT = 15;
export const TOP_PHRASES_LIMIT = 8;
export const IDEA_SEED_LIMIT = 5;
export const LOW_CONFIDENCE_THRESHOLD = 5;

/**
 * 72 fixed stopwords: standard English function words + common
 * social-media filler ("lol", "omg", "haha", "love", "nice", ...).
 * Counts are documented; content words are never removed.
 */
export const STOPWORDS: readonly string[] = [
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "at",
  "for", "with", "is", "are", "was", "were", "be", "been", "being",
  "this", "that", "these", "those", "it", "its", "i", "me", "my",
  "mine", "we", "our", "ours", "you", "your", "yours", "he", "him",
  "his", "she", "her", "hers", "they", "them", "their", "theirs",
  "what", "when", "where", "who", "whom", "how", "why", "which",
  "not", "no", "yes", "do", "does", "did", "done", "doing",
  "so", "as", "if", "then", "than", "too", "very", "just",
  "can", "will", "would", "should", "could", "may", "might", "must",
  "have", "has", "had", "having", "from", "by", "about", "into",
  "over", "after", "before", "all", "any", "each", "other", "some",
  "such", "only", "own", "same", "more", "most", "one", "two",
  "also", "well", "really", "gotta", "gonna", "wanna", "lol", "omg",
  "haha", "hahaha", "uh", "um", "hey", "hi", "hello", "please",
  "thanks", "thank", "yay", "wow", "nice", "cool", "great", "good",
  "awesome", "amazing", "love", "loved", "best",
];

/** 5 fixed idea-seed templates — [WORD] is filled with a frequent term. */
export const IDEA_TEMPLATES: readonly string[] = [
  'Answer the #1 question about "[WORD]" in a 30-second explainer.',
  'Film a before/after: your routine before you knew about "[WORD]".',
  'Make a "3 mistakes with [WORD]" list video.',
  'Stitch a trending video and connect it to "[WORD]".',
  'Ask your audience: "What should I post about [WORD] next?"',
];

function stripNoise(line: string): string {
  return line
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/@[\p{L}\p{N}_]+/gu, " ")
    .trim();
}

function tokenize(line: string): string[] {
  const words = line.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? [];
  return words.filter((w) => !(STOPWORDS as readonly string[]).includes(w));
}

function emojisOf(line: string): string[] {
  return line.match(/\p{Extended_Pictographic}/gu) ?? [];
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const raw = values.pastedComments;
  if (typeof raw !== "string" || raw.trim() === "") {
    return {
      ok: false,
      error: "Paste at least one comment (one per line) to analyze.",
    };
  }

  const comments = raw
    .split(/\r?\n/)
    .map(stripNoise)
    .filter((l) => l.length > 0);

  if (comments.length === 0) {
    return {
      ok: false,
      error: "Nothing to analyze — every line was empty after removing URLs and @handles.",
    };
  }

  const wordFreq = new Map<string, number>();
  const emojiFreq = new Map<string, number>();
  const phraseFreq = new Map<string, number>();
  let totalTokens = 0;

  for (const line of comments) {
    const tokens = tokenize(line);
    totalTokens += tokens.length;
    for (const t of tokens) wordFreq.set(t, (wordFreq.get(t) ?? 0) + 1);
    for (const e of emojisOf(line)) emojiFreq.set(e, (emojiFreq.get(e) ?? 0) + 1);

    // Bigrams + trigrams over filtered tokens.
    for (let n = 2; n <= 3; n++) {
      for (let i = 0; i + n <= tokens.length; i++) {
        const phrase = tokens.slice(i, i + n).join(" ");
        phraseFreq.set(phrase, (phraseFreq.get(phrase) ?? 0) + 1);
      }
    }
  }

  if (totalTokens === 0) {
    return {
      ok: false,
      error:
        "No analyzable words found — comments contained only stopwords, emojis, or very short tokens.",
    };
  }

  // Top words: count desc, alphabetical tiebreak.
  const topWords = [...wordFreq.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .slice(0, TOP_WORDS_LIMIT);

  const wordRows: string[][] = topWords.map(([word, count]) => [
    word,
    String(count),
    `${round1((count / totalTokens) * 100)}%`,
  ]);

  // Top phrases: min count 2, count desc, alphabetical tiebreak.
  const topPhrases = [...phraseFreq.entries()]
    .filter(([, c]) => c >= MIN_PHRASE_COUNT)
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .slice(0, TOP_PHRASES_LIMIT)
    .map(([phrase, count]) => `${phrase} (\u00d7${count})`);

  // Idea seeds from the top words.
  const ideaSeeds = topWords
    .slice(0, IDEA_SEED_LIMIT)
    .map(([word], i) =>
      IDEA_TEMPLATES[i % IDEA_TEMPLATES.length].split("[WORD]").join(word)
    );

  // Top emojis as sentiment tokens.
  const topEmojis = [...emojiFreq.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .slice(0, 5);

  const [topWord, topCount] = topWords[0];
  let summary =
    `Analyzed ${comments.length} pasted comment${comments.length === 1 ? "" : "s"} ` +
    `\u00b7 ${totalTokens} meaningful words \u00b7 top term "${topWord}" ` +
    `(${topCount}\u00d7, ${round1((topCount / totalTokens) * 100)}%).`;
  if (topEmojis.length > 0) {
    summary += ` Top emojis: ${topEmojis.map(([e, c]) => `${e} (${c}\u00d7)`).join(", ")}.`;
  }
  if (comments.length < LOW_CONFIDENCE_THRESHOLD) {
    summary +=
      " Low-confidence sample: fewer than 5 comments pasted — treat these trends as hints, not proof.";
  }
  summary +=
    " Paste-only analysis: this tool cannot read your TikTok comments directly — copy and paste them in.";

  return {
    ok: true,
    values: {
      topWords: { columns: ["Word", "Count", "Share %"], rows: wordRows },
      topPhrases,
      ideaSeeds,
      summary,
    },
  };
}
