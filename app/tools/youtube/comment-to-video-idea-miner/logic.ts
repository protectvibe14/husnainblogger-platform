/**
 * Comment-to-Video Idea Miner — pure logic (tool-141).
 *
 * PATTERN EXTRACTION OVER USER-PASTED TEXT ONLY: this module mines video
 * ideas from comments the user PASTES into the tool. It performs no
 * automated comment scraping (YouTube ToS), calls no YouTube API, and
 * makes no sentiment "AI analysis" claims. Extraction is rule-based:
 * sentences that look like questions or explicit video requests become
 * idea cards, each paired with its source snippet.
 *
 * Detection rules (fixed, deterministic, documented here):
 *   QUESTION   — sentence ends with "?" and is 3–200 chars.
 *   REQUEST    — matches /\b(can you|could you|please|plz)\s+(make|do|post|film|upload|create|try|cover|explain|show)\b/i
 *                or /\b(video|tutorial|guide|review)\s+(about|on|for|of)\b/i
 *                or /\b(part\s*\d+|part two|next video|follow[- ]?up)\b/i
 *   HOWTO_HINT — matches /\bhow (do|does|did|can|could|to)\b/i (folded into QUESTION
 *                when a "?" is present; otherwise kept as a howto candidate)
 *
 * Dedupe: identical normalized idea texts are emitted once (first source
 * kept). Max ideas per call: 25. Ideas are served in paste order.
 *
 * Input: commentsText (textarea, required, 1–20,000 chars).
 * Outputs: ideas (list of idea cards), ideaCount (number), summary (text).
 *
 * Deterministic: same pasted text always yields the same ideas.
 * Zero imports, zero DOM, zero network.
 */

/** Max ideas returned per call. */
export const MAX_IDEAS = 25;
/** Max pasted text accepted. */
export const MAX_TEXT_CHARS = 20000;
/** Sentences shorter than this are noise; longer than this are rants. */
export const MIN_SENTENCE_CHARS = 3;
export const MAX_SENTENCE_CHARS = 200;

export type IdeaKind = "question" | "request" | "howto";

export interface MinedIdea {
  kind: IdeaKind;
  /** The cleaned source sentence. */
  source: string;
  /** The video-idea phrasing derived from the source. */
  idea: string;
}

/** "can you make a video about X" style requests. */
const REQUEST_PATTERNS: RegExp[] = [
  /\b(can you|could you|please|plz)\s+(make|do|post|film|upload|create|try|cover|explain|show)\b/i,
  /\b(video|tutorial|guide|review)\s+(about|on|for|of)\b/i,
  /\b(part\s*\d+|part two|next video|follow[- ]?up)\b/i,
];

/** "how do I ..." style hints without a question mark. */
const HOWTO_PATTERN = /\bhow (do|does|did|can|could|to)\b/i;

function cleanSentence(raw: string): string {
  return raw
    .replace(/^[@#>\-\*•\d.)\s]+/, "") // strip comment prefixes / bullets / numbering
    .replace(/\s+/g, " ")
    .trim();
}

/** Split pasted text into candidate sentences (newlines and . ! ? boundaries). */
export function splitSentences(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    // keep the trailing punctuation for "?" detection
    const parts = line.split(/(?<=[.!?…])\s+/);
    for (const p of parts) {
      const s = cleanSentence(p);
      if (s.length >= MIN_SENTENCE_CHARS) out.push(s);
    }
  }
  return out;
}

/** Classify one cleaned sentence; null = not an idea candidate. */
export function classifySentence(sentence: string): IdeaKind | null {
  const trimmed = sentence.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > MAX_SENTENCE_CHARS) return null;
  if (REQUEST_PATTERNS.some((re) => re.test(trimmed))) return "request";
  if (trimmed.endsWith("?")) return "question";
  if (HOWTO_PATTERN.test(trimmed)) return "howto";
  return null;
}

/** Derive a video-idea phrasing from a classified sentence. */
export function ideaFromSentence(kind: IdeaKind, sentence: string): string {
  const noQ = sentence.replace(/\?+$/, "").trim();
  switch (kind) {
    case "request":
      return `Audience request → make a video: "${sentence}"`;
    case "question":
      return `Answer this in a video: "${noQ}"`;
    case "howto":
      return `Tutorial idea: "${sentence}"`;
  }
}

/**
 * Mine ideas from pasted comment text. Pure and deterministic.
 * Throws TypeError on non-string input; Error on blank or over-long input.
 */
export function mineIdeas(text: string): MinedIdea[] {
  if (typeof text !== "string") throw new TypeError("mineIdeas expects a string");
  const trimmed = text.trim();
  if (trimmed.length === 0) throw new Error("mineIdeas requires non-empty text");
  if (text.length > MAX_TEXT_CHARS) {
    throw new Error(`mineIdeas: pasted text exceeds the ${MAX_TEXT_CHARS}-character limit`);
  }
  const ideas: MinedIdea[] = [];
  const seen = new Set<string>();
  for (const sentence of splitSentences(text)) {
    if (ideas.length >= MAX_IDEAS) break;
    const kind = classifySentence(sentence);
    if (!kind) continue;
    const key = sentence.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    ideas.push({ kind, source: sentence, idea: ideaFromSentence(kind, sentence) });
  }
  return ideas;
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * runTool adapter (mountToolUI generator template).
 * Validates { commentsText } and returns { ideas, ideaCount, summary }.
 * Output ids match meta.ts outputs.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Paste your comments above to mine video ideas from them." };
  }
  const raw = values["commentsText"];
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return { ok: false, error: "Paste at least one comment — the text box is empty." };
  }
  if (raw.length > MAX_TEXT_CHARS) {
    return {
      ok: false,
      error: `That text is too long — paste up to ${MAX_TEXT_CHARS.toLocaleString("en-US")} characters.`,
    };
  }
  const mined = mineIdeas(raw);
  if (mined.length === 0) {
    return {
      ok: true,
      values: {
        ideas: [],
        ideaCount: 0,
        summary:
          "No questions or video requests found in the pasted text. " +
          "Tip: this miner only works on text you paste — it looks for question marks, " +
          "\"can you make a video\"-style requests, and \"how do I\" hints.",
      },
    };
  }
  const ideas = mined.map(
    (m, i) => `#${i + 1} [${m.kind}] ${m.idea}  (from: "${m.source}")`,
  );
  return {
    ok: true,
    values: {
      ideas,
      ideaCount: mined.length,
      summary: `Mined ${mined.length} video idea${mined.length === 1 ? "" : "s"} from your pasted comments — each card quotes its source comment.`,
    },
  };
}
