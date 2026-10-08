/**
 * TikTok Comment Reply Idea Generator (tool-153) — template reply engine.
 * Zero imports, zero network, zero DOM, no Math.random.
 *
 * HONESTY: Template reply ideas only. This tool does NOT post replies, does
 * NOT access TikTok accounts, and does NOT read live comment data — it
 * assembles reply ideas from FIXED word banks around the comment you paste.
 *
 * WORD BANKS (all fixed; sizes documented — picks are deterministic):
 *   FUNNY_REPLIES      6 — playful reply frames, [COMMENT] slot
 *   WARM_REPLIES       6 — kind/thankful reply frames, [COMMENT] slot
 *   WITTY_REPLIES      6 — clever reply frames, [COMMENT] slot
 *   REDIRECT_REPLIES   6 — "reply with a video" frames, [COMMENT] slot
 *   BOUNDARY_REPLIES   6 — neutral boundary frames used when the pasted
 *                          comment looks abusive (no roast-backs, ever)
 *   TOTAL: 30 fixed reply frames.
 *
 * ABUSIVE_MARKERS: 10 fixed lowercase markers ("idiot", "stupid", "dumb",
 *   "loser", "shut up", "hate you", "kill yourself", "kys", "worthless",
 *   "ugly"). Substring match on the lowercased comment. When matched, the
 *   tool returns ONLY boundary templates — never a mocking reply.
 *
 * REPLY_MAX = 150: every reply is capped at 150 characters (TikTok comment
 * limit). [COMMENT] holds at most the first 40 characters of the comment.
 *
 * Deterministic: same comment + tone -> same replies, always.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** TikTok comment character limit. */
export const COMMENT_MAX = 150;

/** How much of the pasted comment may appear inside a reply template. */
export const COMMENT_SNIPPET_MAX = 40;

export const MAX_REPLY_LENGTH = 150;

export const TONE_OPTIONS = ["funny", "warm", "witty", "redirect-to-video"] as const;
export type ReplyTone = (typeof TONE_OPTIONS)[number];

/** 10 fixed abuse markers — substring match, lowercased. */
export const ABUSIVE_MARKERS: readonly string[] = [
  "idiot",
  "stupid",
  "dumb",
  "loser",
  "shut up",
  "hate you",
  "kill yourself",
  "kys",
  "worthless",
  "ugly",
];

export const FUNNY_REPLIES: readonly string[] = [
  '"[COMMENT]" \u2014 okay, that made me laugh \u{1F602}',
  "Plot twist: [COMMENT]",
  'Adding "[COMMENT]" to my list of favorite comments \u{1F480}',
  'Me reading "[COMMENT]" at 2am \u{1F440}',
  "This comment deserves its own video \u{1F62D}",
  "Certified [COMMENT] moment \u2728",
];

export const WARM_REPLIES: readonly string[] = [
  "This means a lot \u2014 thank you \u{1F49B}",
  '"[COMMENT]" \u2014 I\u2019m so glad it helped!',
  "Comments like this keep me posting \u{1F979}",
  "You\u2019re the best, thank you for watching \u{1F49B}",
  '"[COMMENT]" \u2014 made my whole day!',
  "Grateful for you being here \u{1F64F}",
];

export const WITTY_REPLIES: readonly string[] = [
  '"[COMMENT]" \u2014 noted, filed, framed \u{1F5BC}\uFE0F',
  "Bold of you to assume I wasn\u2019t already doing that \u{1F440}",
  '"[COMMENT]"? Groundbreaking. Truly.',
  "Adding that to the lore \u{1F4DD}",
  "Say less. Actually, say more \u2014 this is good.",
  '"[COMMENT]" \u2014 the people have spoken',
];

export const REDIRECT_REPLIES: readonly string[] = [
  "Great question \u2014 answering this in my next video \u{1F3A5}",
  '"[COMMENT]" \u2014 full breakdown dropping tomorrow, follow to catch it!',
  "This deserves more than a comment \u2014 video reply coming \u{1F3AC}",
  "I made a whole video about this, it\u2019s pinned \u{1F4CC}",
  '"[COMMENT]" \u2014 stay tuned, covering it this week!',
  "Replying with a video so everyone sees this \u{1F3A5}",
];

/** Neutral boundary templates — the ONLY output for abusive comments. */
export const BOUNDARY_REPLIES: readonly string[] = [
  "Thanks for sharing your perspective. \u{1F49B}",
  "I hear you \u2014 let\u2019s keep this space kind.",
  "Noted. Moving on to the good stuff \u270C\uFE0F",
  "Everyone\u2019s entitled to their opinion \u2014 keeping comments respectful here.",
  "Appreciate the engagement, keeping it positive \u{1F64F}",
  "Let\u2019s keep the vibes friendly in the comments \u{1F49B}",
];

const FLAVOR_BANKS: Record<ReplyTone, readonly string[]> = {
  funny: FUNNY_REPLIES,
  warm: WARM_REPLIES,
  witty: WITTY_REPLIES,
  "redirect-to-video": REDIRECT_REPLIES,
};

/** djb2 — deterministic pick index from any seed string. */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pick(bank: readonly string[], seed: string, salt: string): string {
  return bank[hashString(seed + "|" + salt) % bank.length];
}

function charLen(s: string): number {
  return [...s].length;
}

/** Trim a reply to MAX_REPLY_LENGTH at a word boundary, never mid-word. */
export function fitReply(text: string): string {
  if (charLen(text) <= MAX_REPLY_LENGTH) return text;
  const chars = [...text];
  let cut = MAX_REPLY_LENGTH - 1; // room for the ellipsis
  while (cut > 0 && chars[cut] !== " " && chars[cut] !== "\n") cut--;
  if (cut <= 0) cut = MAX_REPLY_LENGTH - 1;
  return chars.slice(0, cut).join("").trimEnd() + "\u2026";
}

function looksAbusive(comment: string): boolean {
  const lower = comment.toLowerCase();
  return ABUSIVE_MARKERS.some((m) => lower.includes(m));
}

export function runTool(values: Record<string, unknown>): RunResult {
  // --- validate comment ---
  const commentRaw = values.pastedComment;
  if (typeof commentRaw !== "string" || commentRaw.trim() === "") {
    return {
      ok: false,
      error: "Paste a comment first — the tool needs your comment to build replies around.",
    };
  }
  const comment = commentRaw.trim();
  if (charLen(comment) > COMMENT_MAX) {
    return {
      ok: false,
      error: `That comment is ${charLen(comment)} characters — TikTok comments are capped at ${COMMENT_MAX}. Paste a comment of ${COMMENT_MAX} characters or fewer.`,
    };
  }

  // --- validate tone (optional) ---
  const toneRaw = values.tone;
  let tone: ReplyTone | null = null;
  if (toneRaw !== undefined && toneRaw !== null && String(toneRaw).trim() !== "") {
    if (typeof toneRaw !== "string") {
      return { ok: false, error: "Tone must be one of the listed options." };
    }
    const t = toneRaw.trim().toLowerCase();
    if (!(TONE_OPTIONS as readonly string[]).includes(t)) {
      return {
        ok: false,
        error: `Unknown tone "${toneRaw}". Choose one of: ${(TONE_OPTIONS as readonly string[]).join(", ")}.`,
      };
    }
    tone = t as ReplyTone;
  }

  const snippet = [...comment].slice(0, COMMENT_SNIPPET_MAX).join("");
  const seed = comment.toLowerCase();

  // --- abusive comment -> boundary templates only ---
  if (looksAbusive(comment)) {
    return {
      ok: true,
      values: {
        replies: BOUNDARY_REPLIES.map((r) => fitReply(r)),
        toneFocus: "neutral boundary",
        guidance:
          "That comment reads as hostile, so this tool only suggests neutral boundary replies — " +
          "no roast-backs. Template ideas only: this tool never posts replies to TikTok.",
      },
    };
  }

  // --- 2 replies per flavor (8 total); chosen tone's flavor goes first ---
  const order: ReplyTone[] = tone
    ? [tone, ...TONE_OPTIONS.filter((t) => t !== tone)]
    : [...TONE_OPTIONS];
  const replies: string[] = [];
  order.forEach((flavor) => {
    const bank = FLAVOR_BANKS[flavor];
    for (let i = 0; i < 2; i++) {
      const frame = pick(bank, seed, `${flavor}${i}`);
      replies.push(fitReply(frame.split("[COMMENT]").join(snippet)));
    }
  });

  return {
    ok: true,
    values: {
      replies,
      toneFocus: tone ?? "balanced (all four flavors)",
      guidance:
        "Template reply ideas only — this tool never posts replies to TikTok. " +
        "Copy the one that fits your voice; redirect-to-video frames work best for questions worth answering on camera.",
    },
  };
}
