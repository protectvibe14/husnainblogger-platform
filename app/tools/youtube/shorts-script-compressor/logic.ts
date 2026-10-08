/**
 * Shorts Script Compressor (tool-123) — pure logic, zero imports, zero
 * network, zero DOM, no Math.random, no Date.now().
 *
 * RULE-BASED EXTRACTION, NOT AI AND NOT SEMANTIC SUMMARIZATION. The tool
 * never understands the text; it scores sentences with transparent rules:
 *
 *   1. Split the input into sentences on [.?!] boundaries.
 *   2. Count word frequencies across the whole text, ignoring a fixed
 *      stopword list (STOPWORDS, documented below). The 12 most frequent
 *      content words become the "topic keywords" (ties broken
 *      alphabetically so the result is deterministic).
 *   3. Sentence score = total occurrences of the topic keywords in it.
 *      The first sentence is always treated as the hook candidate.
 *   4. Word budget = floor(targetSeconds / 60 * wpm). The fixed CTA template
 *      ("Follow for more.") is reserved inside the budget, not added on top.
 *   5. Keep the hook, then add remaining sentences by score (highest first,
 *      original order breaking ties) while the running total plus the CTA
 *      stays within the budget.
 *
 * Template / bank sizes: 1 fixed CTA template; 1 fixed stopword list of 46
 * words; 12 topic keywords derived per run (documented, not a claim).
 * Deterministic: same inputs -> same compression, always.
 */

/** Fixed stopword list (46 words) — excluded from topic-keyword counting. */
export const STOPWORDS: string[] = [
  "a", "an", "the", "and", "or", "but", "if", "then", "so", "because",
  "as", "at", "by", "for", "from", "in", "into", "of", "on", "to",
  "with", "is", "are", "was", "were", "be", "been", "being", "do",
  "does", "did", "have", "has", "had", "it", "its", "this", "that",
  "these", "those", "i", "you", "we", "they", "he", "she",
];

/** Fixed CTA template appended to every compressed script (3 words). */
export const CTA_TEMPLATE = "Follow for more.";

/** CTA word count, derived from the fixed template. */
export const CTA_WORDS = CTA_TEMPLATE.split(/\s+/).length;

/** Number of topic keywords derived per run. */
export const KEYWORD_COUNT = 12;

/** Default and allowed ranges for the two numeric inputs. */
export const DEFAULT_SECONDS = 45;
export const MIN_SECONDS = 5;
export const MAX_SECONDS = 180;
export const DEFAULT_WPM = 150;
export const MIN_WPM = 80;
export const MAX_WPM = 220;

/** One scored sentence. */
export interface ScoredSentence {
  index: number;
  text: string;
  words: number;
  score: number;
  role: "hook" | "body";
  kept: boolean;
  reason: string;
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Split text into sentences on [.?!] boundaries; falls back to the whole text. */
export function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?…]+[.!?…]+/g);
  if (parts && parts.length > 0) {
    return parts.map((p) => p.trim()).filter((p) => p.length > 0);
  }
  const trimmed = text.trim();
  return trimmed ? [trimmed] : [];
}

/** Count whitespace-separated tokens. */
export function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

/** Lowercase content tokens of a sentence (stopwords removed, punctuation stripped). */
function contentTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.includes(t));
}

/**
 * Derive the topic keywords: the KEYWORD_COUNT most frequent content words
 * in the text; ties broken alphabetically for determinism.
 */
export function deriveKeywords(sentences: string[]): string[] {
  const freq = new Map<string, number>();
  for (const s of sentences) {
    for (const tok of contentTokens(s)) {
      freq.set(tok, (freq.get(tok) ?? 0) + 1);
    }
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .slice(0, KEYWORD_COUNT)
    .map(([w]) => w);
}

/** Word budget for the compressed script: floor(targetSeconds / 60 * wpm). */
export function wordBudget(targetSeconds: number, wpm: number): number {
  return Math.floor((targetSeconds / 60) * wpm);
}

/**
 * Compress a script to the word budget. Exported so the rule pipeline is
 * unit-testable without runTool.
 */
export function compressScript(
  text: string,
  targetSeconds: number,
  wpm: number,
): {
  compressedScript: string;
  wordCount: number;
  estimatedSeconds: number;
  cutList: string[];
  note: string;
} {
  const sentences = splitSentences(text);
  const budget = wordBudget(targetSeconds, wpm);
  const keywords = deriveKeywords(sentences);

  const scored: ScoredSentence[] = sentences.map((s, i) => {
    const toks = contentTokens(s);
    const score = toks.filter((t) => keywords.includes(t)).length;
    return {
      index: i,
      text: s,
      words: countWords(s),
      score,
      role: i === 0 ? "hook" : "body",
      kept: false,
      reason: "",
    };
  });

  const totalWords = scored.reduce((sum, s) => sum + s.words, 0);
  const hook = scored[0];
  const label = (s: ScoredSentence): string =>
    `“${s.text.length > 60 ? s.text.slice(0, 60) + "…" : s.text}”`;

  if (totalWords <= budget) {
    // Edge case: input already fits — return as-is with a note.
    const cutList = scored.map(
      (s) => `KEEP — ${label(s)} (already fits the ${budget}-word budget)`,
    );
    return {
      compressedScript: text.trim(),
      wordCount: totalWords,
      estimatedSeconds: Math.round((totalWords / wpm) * 60 * 10) / 10,
      cutList,
      note:
        "Already fits: the script is within the word budget, so it was returned unchanged. " +
        "Rule-based extraction — sentences were scored by keyword frequency, not AI summarization.",
    };
  }

  // Greedy selection: hook first, then highest-scoring sentences, CTA reserved.
  const kept: ScoredSentence[] = [hook];
  hook.kept = true;
  hook.reason = "hook (first sentence)";
  let used = hook.words;
  const rest = scored.slice(1).sort((a, b) => b.score - a.score || a.index - b.index);
  for (const s of rest) {
    if (used + s.words + CTA_WORDS <= budget) {
      kept.push(s);
      s.kept = true;
      s.reason = `keyword match (${s.score} topic-keyword hit${s.score === 1 ? "" : "s"})`;
      used += s.words;
    } else {
      s.kept = false;
      s.reason = "over word budget";
    }
  }
  kept.sort((a, b) => a.index - b.index);
  const body = kept.map((s) => s.text).join(" ");
  const compressedScript = `${body} ${CTA_TEMPLATE}`;
  const wordCount = countWords(compressedScript);

  const cutList = scored
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((s) => `${s.kept ? "KEEP" : "DROP"} — ${label(s)} (${s.reason})`);

  const overBudget = wordCount > budget;
  const note =
    "Rule-based extraction — the hook (first sentence) was kept and remaining sentences " +
    "were ranked by topic-keyword frequency; this is keyword counting, not AI summarization. " +
    (overBudget
      ? `Over budget: hook + CTA alone exceed the ${budget}-word budget, so the output is ${wordCount} words. Shorten the opening line and re-run.`
      : `Compressed from ${totalWords} words to ${wordCount} words (budget: ${budget}).`);

  return {
    compressedScript,
    wordCount,
    estimatedSeconds: Math.round((wordCount / wpm) * 60 * 10) / 10,
    cutList,
    note,
  };
}

/**
 * runTool — formatter dispatch shape.
 * values in:  { scriptText, targetSeconds?, wpm? }
 * values out: { compressedScript, wordCount, estimatedSeconds, cutList, note }
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const rawText = values["scriptText"];
  const text = typeof rawText === "string" ? rawText.trim() : "";
  if (!text) {
    return { ok: false, error: "Paste your long-form script or outline text first." };
  }

  const rawSeconds = values["targetSeconds"];
  const targetSeconds =
    rawSeconds === undefined || rawSeconds === null || rawSeconds === ""
      ? DEFAULT_SECONDS
      : typeof rawSeconds === "number"
        ? rawSeconds
        : Number(String(rawSeconds).trim());
  if (!Number.isFinite(targetSeconds) || targetSeconds < MIN_SECONDS || targetSeconds > MAX_SECONDS) {
    return {
      ok: false,
      error: `Target seconds must be between ${MIN_SECONDS} and ${MAX_SECONDS}.`,
    };
  }

  const rawWpm = values["wpm"];
  const wpm =
    rawWpm === undefined || rawWpm === null || rawWpm === ""
      ? DEFAULT_WPM
      : typeof rawWpm === "number"
        ? rawWpm
        : Number(String(rawWpm).trim());
  if (!Number.isFinite(wpm) || wpm < MIN_WPM || wpm > MAX_WPM) {
    return {
      ok: false,
      error: `Speaking pace (WPM) must be between ${MIN_WPM} and ${MAX_WPM}.`,
    };
  }

  const result = compressScript(text, targetSeconds, wpm);
  return { ok: true, values: { ...result } };
}
