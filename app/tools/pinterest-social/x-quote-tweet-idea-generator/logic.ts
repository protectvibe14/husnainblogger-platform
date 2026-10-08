/**
 * X Quote Tweet Idea Generator — pure logic (tool-380), zero imports, zero
 * network, zero DOM.
 *
 * TEMPLATE LIBRARY, NOT AI: 5 hand-written comment drafts per stance
 * (agree / add-nuance / disagree — 15 drafts total). The user's {context}
 * (what they're quoting) is inserted into each draft; square-bracket
 * placeholders like [YOUR NUANCE] mark what the user must add. Tone is
 * matched to the stance: agree = endorsing, add-nuance = adds perspective
 * with a caveat slot, disagree = respectful pushback with a counterpoint
 * slot. Selection is deterministic: the same context + stance always
 * returns the same 5 drafts in the same order.
 *
 * Weighted budget enforced (data/platform-rules/x.json): URL = 23 chars,
 * emoji/CJK = 2 chars, everything else = 1 char (approximation — X's exact
 * segmenter is proprietary; documented limitation). The quoted post itself
 * costs 0 characters — only the comment counts — so only the comment text
 * is budgeted; long contexts are shortened with an ellipsis until the
 * comment fits 280 weighted chars.
 */

/** X post limit for free accounts (data/platform-rules/x.json). */
export const X_POST_LIMIT = 280;

export type Stance = "agree" | "add-nuance" | "disagree";

/** The three supported stances, in canonical order. */
export const STANCES: Stance[] = ["agree", "add-nuance", "disagree"];

/** Default stance when the user doesn't pick one. */
export const DEFAULT_STANCE: Stance = "add-nuance";

export const MAX_CONTEXT_LEN = 220;

/** 5 hand-written comment drafts per stance (15 total). {context} = what is quoted. */
const COMMENTS: Record<Stance, string[]> = {
  agree: [
    "100%. {context} — and most people still underestimate how true this is. 👏",
    "This. {context} deserves way more attention than it gets.",
    "Couldn’t agree more. {context} — saving this one.",
    "{context}\n\nSay it louder for the people in the back. 📢",
    "Exactly right. {context} is one of those things you only get after living it.",
  ],
  "add-nuance": [
    "True — and I’d add: {context} works best when [YOUR NUANCE]. Worth testing both.",
    "{context}\n\nOne caveat from my experience: [YOUR CAVEAT]. Still solid advice overall.",
    "Agree with the spirit of this. {context} — with the footnote that [YOUR FOOTNOTE].",
    "Mostly true. {context}, except when [YOUR EXCEPTION] — then flip it.",
    "{context}\n\nThe missing piece nobody mentions: [YOUR ADDITION].",
  ],
  disagree: [
    "Respectfully disagree. {context} misses [YOUR COUNTERPOINT] — here’s why 👇",
    "Hot take in reverse: {context} is backwards. [YOUR REASON] matters more.",
    "I used to believe this too. {context} — until [WHAT CHANGED YOUR MIND].",
    "Counterpoint: {context} ignores [YOUR COUNTERPOINT]. Both can be true, but…",
    "This gets it half right. {context} — the other half is [YOUR ADDITION].",
  ],
};

/** Approximate X weighted character count: URL=23, emoji/CJK=2, else 1. */
export function xWeightedLength(text: string): number {
  if (typeof text !== "string") throw new TypeError("xWeightedLength expects a string");
  const noUrls = text.replace(/https?:\/\/[^\s]+/g, () => "U".repeat(23));
  let n = 0;
  for (const ch of noUrls) {
    const cp = ch.codePointAt(0) as number;
    if (/\p{Extended_Pictographic}/u.test(ch)) {
      n += 2;
    } else if (
      (cp >= 0x4e00 && cp <= 0x9fff) ||
      (cp >= 0x3400 && cp <= 0x4dbf) ||
      (cp >= 0x20000 && cp <= 0x2a6df) ||
      (cp >= 0x3040 && cp <= 0x30ff) ||
      (cp >= 0xac00 && cp <= 0xd7af)
    ) {
      n += 2;
    } else {
      n += 1;
    }
  }
  return n;
}

export function isStance(v: string): v is Stance {
  return (STANCES as string[]).includes(v);
}

/** Shorten the context with an ellipsis until the filled draft fits budget. */
function fitContext(template: string, context: string): string {
  let fitted = context;
  let comment = template.replace(/\{context\}/g, fitted);
  while (xWeightedLength(comment) > X_POST_LIMIT && fitted.length > 0) {
    fitted = fitted.slice(0, -1).trimEnd();
    comment = template.replace(/\{context\}/g, fitted.length === 0 ? "…" : fitted + "…");
  }
  return comment;
}

/**
 * Build the 5 comment drafts for a stance, with context inserted and each
 * draft within the 280 weighted-char budget.
 * @throws {TypeError} on non-string inputs. @throws {Error} on empty
 *   context or unknown stance.
 */
export function buildComments(context: string, stance: string): string[] {
  if (typeof context !== "string" || typeof stance !== "string") {
    throw new TypeError("buildComments expects two strings");
  }
  const clean = context.trim();
  if (clean === "") throw new Error("buildComments requires a non-empty context");
  if (!isStance(stance)) throw new Error(`buildComments: unknown stance "${stance}"`);
  return COMMENTS[stance].map((t) => fitContext(t, clean));
}

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const ctxRaw = values["context"];
  if (typeof ctxRaw !== "string" || ctxRaw.trim() === "") {
    return { ok: false, error: "Please describe what you're quoting (the post's main point)." };
  }
  const context = ctxRaw.trim();
  if (context.length > MAX_CONTEXT_LEN) {
    return { ok: false, error: `Context is too long (max ${MAX_CONTEXT_LEN} characters).` };
  }

  const stanceRaw = values["stance"];
  const stance =
    stanceRaw === undefined || stanceRaw === null || String(stanceRaw).trim() === ""
      ? DEFAULT_STANCE
      : String(stanceRaw).trim();
  if (!isStance(stance)) {
    return { ok: false, error: "Stance must be one of: agree, add-nuance, disagree." };
  }

  return {
    ok: true,
    values: { quoteComments: buildComments(context, stance) },
  };
}
