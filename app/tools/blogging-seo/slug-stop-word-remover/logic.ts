/**
 * Slug Stop-Word Remover — pure logic (zero imports, zero network, zero DOM).
 *
 * Shortens a title or URL slug by removing English stop words using a FIXED
 * list of common English stop words (see STOP_WORDS below; 173 words — size
 * verified in tests). Protected words passed via keepWords are never removed, even when
 * they appear in the stop-word list. Not AI: the same input always yields the
 * same slug.
 *
 * Fixed rules:
 * 1. Tokenize: lowercase, strip apostrophes (don't -> dont), split on any
 *    non letter/number (Unicode-aware: \p{L}\p{N}).
 * 2. Drop tokens that are in the stop-word set AND not in the protected set.
 * 3. Rejoin the kept tokens with hyphens.
 * 4. If EVERY token is a stop word, the slug would be empty — instead the
 *    first word is kept (documented fallback; removedWords lists the rest).
 * 5. Non-English (Unicode) words never match the English list and pass
 *    through untouched.
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const MAX_INPUT_CHARS = 200;

/**
 * Fixed English stop-word bank: 173 words, no AI, no stemming.
 * Apostrophes are stripped from tokens before lookup, so entries are stored
 * without them ("dont", "isnt", ...).
 */
export const STOP_WORDS: readonly string[] = [
  "a", "about", "above", "after", "again", "against", "all", "am", "an",
  "and", "any", "are", "arent", "as", "at", "be", "because", "been",
  "before", "being", "below", "between", "both", "but", "by", "can",
  "cant", "cannot", "could", "couldnt", "did", "didnt", "do", "does",
  "doesnt", "doing", "dont", "down", "during", "each", "few", "for",
  "from", "further", "had", "hadnt", "has", "hasnt", "have", "havent",
  "having", "he", "hed", "hell", "hes", "her", "here", "heres", "hers",
  "herself", "him", "himself", "his", "how", "hows", "i", "id", "ill",
  "im", "ive", "if", "in", "into", "is", "isnt", "it", "its", "itself",
  "lets", "me", "more", "most", "mustnt", "my", "myself", "no", "nor",
  "not", "of", "off", "on", "once", "only", "or", "other", "ought",
  "our", "ours", "ourselves", "out", "over", "own", "same", "shant",
  "she", "shed", "shell", "shes", "should", "shouldnt", "so", "some",
  "such", "than", "that", "thats", "the", "their", "theirs", "them",
  "themselves", "then", "there", "theres", "these", "they", "theyd",
  "theyll", "theyre", "theyve", "this", "those", "through", "to", "too",
  "under", "until", "up", "very", "was", "wasnt", "we", "wed", "well",
  "were", "werent", "weve", "what", "whats", "when", "whens", "where",
  "wheres", "which", "while", "who", "whos", "whom", "why", "whys",
  "with", "wont", "would", "wouldnt", "you", "youd", "youll", "youre",
  "youve", "your", "yours", "yourself", "yourselves",
];

const STOP_SET: ReadonlySet<string> = new Set(STOP_WORDS);

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Lowercase, drop apostrophes, split on non letters/numbers (Unicode-aware). */
function tokenize(s: string): string[] {
  const normalized = s
    .toLowerCase()
    .replace(/[''ʼ`]/g, "");
  return normalized.match(/[\p{L}\p{N}]+/gu) ?? [];
}

/**
 * Parse protected words: accepts a comma/semicolon/space-separated string or
 * a string array. Multi-word entries are split into individual words.
 */
function parseKeepWords(raw: unknown): Set<string> {
  const keep = new Set<string>();
  const add = (s: string): void => {
    for (const t of tokenize(s)) keep.add(t);
  };
  if (typeof raw === "string") {
    for (const part of raw.split(/[;,]/)) add(part);
  } else if (Array.isArray(raw)) {
    for (const item of raw) if (typeof item === "string") add(item);
  }
  return keep;
}

export function runTool(values: Record<string, unknown>): ToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "No input provided." };
  }

  const titleOrSlug = clean(values["titleOrSlug"]);
  if (!titleOrSlug) {
    return {
      ok: false,
      error: "Enter a title or slug first — for example \"The Ultimate Guide to SEO\".",
    };
  }
  if (titleOrSlug.length > MAX_INPUT_CHARS) {
    return {
      ok: false,
      error: `Input is too long (${titleOrSlug.length} characters). The limit is ${MAX_INPUT_CHARS} characters.`,
    };
  }

  const keep = parseKeepWords(values["keepWords"]);
  const tokens = tokenize(titleOrSlug);
  if (tokens.length === 0) {
    return {
      ok: false,
      error: "No words found in the input. Enter a title with at least one letter or number.",
    };
  }

  const kept: string[] = [];
  const removed: string[] = [];
  for (const t of tokens) {
    if (STOP_SET.has(t) && !keep.has(t)) removed.push(t);
    else kept.push(t);
  }

  let finalKept = kept;
  let finalRemoved = removed;
  if (finalKept.length === 0) {
    // Everything was a stop word: keep the first word so the slug is never
    // empty (documented fallback).
    finalKept = [tokens[0]];
    finalRemoved = tokens.slice(1);
  }

  return {
    ok: true,
    values: {
      cleanSlug: finalKept.join("-"),
      removedWords: finalRemoved,
    },
  };
}
