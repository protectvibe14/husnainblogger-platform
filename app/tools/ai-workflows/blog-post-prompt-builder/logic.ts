/**
 * Blog Post Prompt Builder (tool-302) — pure logic, zero imports.
 *
 * PROMPT ASSEMBLER, NOT AI: fills the user's item fields into a fixed
 * human-written prompt template. The tool itself generates no content —
 * the assembled prompt is meant to be pasted into the user's own LLM.
 *
 * Item fields (BuilderField type is text|url only, so free-text fields
 * carry preset hints in their placeholders):
 *   topic            text, required
 *   postType         text, one of: how-to | listicle | review | opinion | tutorial
 *                    (empty falls back to "how-to")
 *   tone             text, optional (empty falls back to "neutral")
 *   targetKeyword    text, optional
 *   targetWordCount  text, optional number 300-5000 (empty falls back to 1200)
 *
 * Sanitization: inputs are trimmed, control characters stripped, internal
 * whitespace collapsed, and capped at MAX_FIELD_CHARS so a pasted essay
 * cannot blow up the assembled prompt.
 */

export const POST_TYPES = [
  "how-to",
  "listicle",
  "review",
  "opinion",
  "tutorial",
] as const;

export type PostType = (typeof POST_TYPES)[number];

export const DEFAULT_POST_TYPE: PostType = "how-to";
export const DEFAULT_TONE = "neutral";
export const DEFAULT_WORD_COUNT = 1200;
export const MIN_WORD_COUNT = 300;
export const MAX_WORD_COUNT = 5000;
export const MAX_FIELD_CHARS = 300;
export const MAX_ITEMS = 20;

export interface BuilderItem {
  topic?: unknown;
  postType?: unknown;
  tone?: unknown;
  targetKeyword?: unknown;
  targetWordCount?: unknown;
}

export interface RunResult {
  ok: boolean;
  values?: { lines: string[] };
  error?: string;
}

/** Trim, strip control chars, collapse whitespace, cap length. */
export function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_FIELD_CHARS);
}

/** Normalize a post type against the fixed preset list. */
export function normalizePostType(value: unknown): PostType | null {
  const v = sanitize(value).toLowerCase();
  if (v === "") return DEFAULT_POST_TYPE;
  const found = (POST_TYPES as readonly string[]).find((t) => t === v);
  return (found as PostType | undefined) ?? null;
}

/** Parse the word count: empty -> default, otherwise integer 300-5000. */
export function parseWordCount(value: unknown): {
  count: number;
  defaulted: boolean;
  valid: boolean;
} {
  const v = sanitize(value);
  if (v === "") return { count: DEFAULT_WORD_COUNT, defaulted: true, valid: true };
  if (!/^\d+$/.test(v)) return { count: 0, defaulted: false, valid: false };
  const n = parseInt(v, 10);
  if (n < MIN_WORD_COUNT || n > MAX_WORD_COUNT)
    return { count: 0, defaulted: false, valid: false };
  return { count: n, defaulted: false, valid: true };
}

/** Assemble one copy-paste prompt from validated, sanitized fields. */
export function assemblePrompt(
  topic: string,
  postType: PostType,
  tone: string,
  keyword: string,
  wordCount: number,
  wordCountDefaulted: boolean,
): string {
  const keywordLine =
    keyword === ""
      ? "none provided — pick a natural primary keyword yourself"
      : `"${keyword}"`;
  const lengthLine = wordCountDefaulted
    ? `${wordCount} words (default — adjust as needed)`
    : `${wordCount} words`;
  return [
    `You are an expert blog writer and SEO editor. Write a ${postType} blog post on "${topic}".`,
    "",
    `Tone: ${tone}`,
    `Target keyword: ${keywordLine}`,
    `Target length: ${lengthLine}`,
    "",
    "Follow these rules:",
    "1. Write for a beginner-to-intermediate reader — clear, specific, no filler.",
    "2. Structure it with an engaging introduction, H2/H3 subheadings, short paragraphs, and a conclusion.",
    "3. Use bullet points and numbered steps where they help readability.",
    "4. Cover the topic completely; do not invent statistics, quotes, or facts.",
    "5. End with a practical takeaway and a call to action.",
    "",
    "Finish with 5 headline options for the post.",
  ].join("\n");
}

function validateItem(item: BuilderItem, index: number): string | null {
  const label = `Item ${index + 1}`;
  if (!item || typeof item !== "object") return `${label}: not an object.`;
  const topic = sanitize(item.topic);
  if (topic === "") return `${label}: topic is required.`;
  if (normalizePostType(item.postType) === null) {
    const given = sanitize(item.postType);
    return `${label}: post type "${given}" is not valid. Use one of: ${POST_TYPES.join(", ")}.`;
  }
  const wc = parseWordCount(item.targetWordCount);
  if (!wc.valid)
    return `${label}: word count must be a whole number between ${MIN_WORD_COUNT} and ${MAX_WORD_COUNT}.`;
  return null;
}

export function runTool(args: {
  items: Record<string, unknown>[];
}): RunResult {
  if (!args || !Array.isArray(args.items))
    return { ok: false, error: "No items were provided." };
  if (args.items.length === 0)
    return { ok: false, error: "Add at least one item to build a prompt." };
  if (args.items.length > MAX_ITEMS)
    return { ok: false, error: `Too many items (max ${MAX_ITEMS}).` };

  const lines: string[] = [];
  for (let i = 0; i < args.items.length; i++) {
    const item = args.items[i] as BuilderItem;
    const err = validateItem(item, i);
    if (err) return { ok: false, error: err };
    const topic = sanitize(item.topic);
    const postType = normalizePostType(item.postType) as PostType;
    const tone = sanitize(item.tone) === "" ? DEFAULT_TONE : sanitize(item.tone);
    const keyword = sanitize(item.targetKeyword);
    const wc = parseWordCount(item.targetWordCount);
    lines.push(assemblePrompt(topic, postType, tone, keyword, wc.count, wc.defaulted));
  }
  return { ok: true, values: { lines } };
}
