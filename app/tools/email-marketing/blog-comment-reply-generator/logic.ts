/**
 * Blog Comment Reply Generator (tool-444) — pure logic, zero imports,
 * zero network, zero DOM, no randomness.
 *
 * WHAT THIS IS (honesty, enforced):
 * - Generates 3 first-draft replies to a blog comment from FIXED
 *   hand-written templates. NOT AI copy; drafts are starting points you
 *   must review and personalize before posting.
 * - Bank size: 3 tones (friendly, professional, witty) x 6 templates
 *   = 18 reply templates. Per run, 3 consecutive templates are returned
 *   starting from a deterministic hash of the comment text, so the same
 *   comment + tone always yields the same 3 drafts — verified by tests.
 * - Slots: {author} (greeting; falls back to "Hi there," when the author
 *   name is empty, never rendered blank) and {excerpt} (a trimmed,
 *   code-point-safe quote of the comment).
 * - Sanitization: HTML tags are stripped from the comment and author name
 *   before insertion, so no unescaped markup reaches the plain-text drafts.
 *
 * Edge-case handling (shared validation rules):
 * - Comment length measured in Unicode code points ([...s].length); the
 *   excerpt never splits emoji or CJK/RTL characters mid-code-point.
 * - Overlong comments are trimmed to MAX_COMMENT_CHARS with a visible
 *   notice appended to the first draft — never dropped silently.
 * - Drafts are scanned for accidental adjacent duplicate words; any hit is
 *   reported in a visible "[Review flags]" line on that draft.
 */

export type ReplyTone = "friendly" | "professional" | "witty";

export const REPLY_TONES: readonly ReplyTone[] = ["friendly", "professional", "witty"];

/** Max Unicode code points kept from the comment; excess is trimmed. */
export const MAX_COMMENT_CHARS = 1000;

/** Max code points of the comment excerpt embedded in a draft. */
export const EXCERPT_CHARS = 120;

/** Number of reply drafts returned per run. */
export const DRAFT_COUNT = 3;

/**
 * Fixed reply template bank: 3 tones x 6 templates = 18 templates.
 * Hand-written, assembled deterministically — NOT AI-generated copy.
 */
export const REPLY_TEMPLATES: Record<ReplyTone, readonly string[]> = {
  friendly: [
    "{author} Thanks so much for reading! Your note on {excerpt} — glad that part resonated. What would you like me to cover next?",
    "{author} Really appreciate you sharing this. {excerpt} — you nailed the key point. I will keep this in mind for future posts.",
    "{author} You made my day with this comment! Re: {excerpt} — totally agree, and I would add that consistency matters more than perfection.",
    "{author} Great point in there! Re: {excerpt} — the short answer is to start small and measure what changes.",
    "{author} Love this perspective! {excerpt} — I had not framed it quite that way before. Mind if I quote you in a follow-up?",
    "{author} Thanks for stopping by! Your note on {excerpt} is spot on — this is exactly the kind of discussion I hoped this post would spark.",
  ],
  professional: [
    "{author} Thank you for your thoughtful comment. Regarding {excerpt}: you raise a valid point, and I will address it in a future update.",
    "{author} I appreciate you taking the time to write this. On {excerpt}: the evidence supports your reading, with some nuance I will expand on.",
    "{author} Thank you for the detailed feedback. Concerning {excerpt}: I have noted this and will review the section for accuracy.",
    "{author} Grateful for your input. Re: {excerpt} — happy to discuss further; feel free to share a source so I can look deeper.",
    "{author} Thank you for engaging with the post. Your point about {excerpt} is well taken and adds useful context for other readers.",
    "{author} I value this kind of constructive comment. On {excerpt}: fair point — I will clarify that passage in the next revision.",
  ],
  witty: [
    "{author} Comment of the day! {excerpt} — someone finally said it. Can I hire you as my editor?",
    "{author} Plot twist: a reader who actually read the whole post. Re: {excerpt} — chef's kiss.",
    "{author} I was today years old when I read this take. {excerpt} — adding this to the “readers are smarter than me” file.",
    "{author} This comment deserves its own post. {excerpt} — you get it, and honestly most people do not.",
    "{author} Bold of you to be this correct in my comments section. Re: {excerpt} — no notes.",
    "{author} *Slow clap.* {excerpt} — this is why I write: readers like you connecting the dots.",
  ],
};

/** Deterministic 32-bit FNV-1a hash over Unicode code points. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (const ch of s) {
    h ^= ch.codePointAt(0) as number;
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Strip anything that looks like an HTML tag; keep plain text only. */
export function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, "");
}

/** Keep at most n Unicode code points, never splitting a surrogate pair. */
export function takeCodePoints(s: string, n: number): string {
  return [...s].slice(0, n).join("");
}

/**
 * Build a short, code-point-safe excerpt of the comment for embedding in
 * drafts. Trims at a word boundary where possible and adds an ellipsis.
 */
export function excerptOf(comment: string): string {
  const clean = comment.replace(/\s+/g, " ").trim();
  if ([...clean].length <= EXCERPT_CHARS) return clean;
  const cut = takeCodePoints(clean, EXCERPT_CHARS).trimEnd();
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut) + "…";
}

/** True when two identical words sit next to each other (case-insensitive). */
export function hasRepeatedWords(text: string): boolean {
  const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
  for (let i = 0; i + 1 < words.length; i++) {
    if (words[i] === words[i + 1]) return true;
  }
  return false;
}

function cleanComment(raw: unknown): [string, boolean] {
  const s = stripTags(String(raw)).replace(/\s+/g, " ").trim();
  if ([...s].length > MAX_COMMENT_CHARS) {
    return [takeCodePoints(s, MAX_COMMENT_CHARS).trimEnd(), true];
  }
  return [s, false];
}

export interface ReplyDraftsResult {
  replyDrafts: string[];
}

/**
 * Core generator. Throws RangeError on invalid input; runTool converts
 * those into the { ok: false, error } contract shape.
 */
export function generateReplyDrafts(
  commentText: string,
  replyTone: string,
  authorName: string,
): ReplyDraftsResult {
  if (typeof commentText !== "string" || stripTags(commentText).trim().length === 0) {
    throw new RangeError("commentText must not be empty or whitespace-only.");
  }
  if (!REPLY_TONES.includes(replyTone as ReplyTone)) {
    throw new RangeError(`replyTone must be one of: ${REPLY_TONES.join(", ")}.`);
  }

  const [comment, commentTrimmed] = cleanComment(commentText);
  const authorClean = stripTags(String(authorName ?? "")).trim();
  const author = authorClean.length > 0 ? `Hi ${takeCodePoints(authorClean, 60)},` : "Hi there,";
  const excerpt = excerptOf(comment);

  const bank = REPLY_TEMPLATES[replyTone as ReplyTone];
  const start = hashString(comment) % bank.length;
  const replyDrafts: string[] = [];
  for (let i = 0; i < DRAFT_COUNT; i++) {
    let draft = bank[(start + i) % bank.length]
      .replaceAll("{author}", author)
      .replaceAll("{excerpt}", excerpt);
    if (hasRepeatedWords(draft)) {
      draft += " [Review flag: repeated word — fix before posting.]";
    }
    replyDrafts.push(draft);
  }

  if (commentTrimmed) {
    replyDrafts[0] += ` [Note: your comment was trimmed to ${MAX_COMMENT_CHARS} characters. Nothing was dropped silently.]`;
  }

  return { replyDrafts };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * mountToolUI contract: runTool(values) -> { ok, values?, error? }.
 * values in:  { commentText, replyTone, authorName? }
 * values out: { replyDrafts }
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const { commentText, replyTone, authorName } = values;
  if (typeof commentText !== "string" || stripTags(commentText).trim().length === 0) {
    return { ok: false, error: "Please paste the blog comment you want to reply to." };
  }
  if (typeof replyTone !== "string" || !REPLY_TONES.includes(replyTone as ReplyTone)) {
    return { ok: false, error: `Please choose a reply tone: ${REPLY_TONES.join(", ")}.` };
  }

  let result: ReplyDraftsResult;
  try {
    result = generateReplyDrafts(commentText, replyTone, (authorName as string) ?? "");
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not generate reply drafts.",
    };
  }

  return { ok: true, values: { replyDrafts: result.replyDrafts } };
}
