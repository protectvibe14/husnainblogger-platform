/**
 * Comment Reply Template Generator — pure logic (tool-213), zero imports,
 * zero network, zero DOM.
 *
 * TEMPLATE BANK, NOT AI: comment replies are assembled from a fixed bank of
 * hand-written reply templates keyed by comment type and tone.
 *
 * Comment types (fixed list, 4):
 *   praise     — compliments, love, positive feedback
 *   question   — questions about the post, product, or process
 *   criticism  — complaints, negative feedback, disagreements
 *   spam       — spammy / off-topic comments
 *
 * Tones (fixed list, 4): friendly, professional, playful, formal.
 *
 * Template banks: 4 types × 4 tones × 3 templates = 48 total. Every template
 * contains a literal {name} slot for the commenter's name (left for the user
 * to fill). Templates also contain a {brand} slot, filled with the user's
 * brand name when provided; otherwise the {brand} placeholder is kept so the
 * user can fill it later. Deterministic: same inputs → same 3 replies.
 */

export type CommentType = "praise" | "question" | "criticism" | "spam";
export type ReplyTone = "friendly" | "professional" | "playful" | "formal";

/** The four supported comment types, in canonical order. */
export const COMMENT_TYPES: CommentType[] = ["praise", "question", "criticism", "spam"];

export const COMMENT_TYPE_LABELS: Record<CommentType, string> = {
  praise: "Praise / compliments",
  question: "Questions",
  criticism: "Criticism / complaints",
  spam: "Spam / off-topic",
};

/** The four supported tones, in canonical order. */
export const REPLY_TONES: ReplyTone[] = ["friendly", "professional", "playful", "formal"];

export const TONE_LABELS: Record<ReplyTone, string> = {
  friendly: "Friendly",
  professional: "Professional",
  playful: "Playful",
  formal: "Formal",
};

/** Reply templates per comment type × tone — 3 each (48 total). */
const REPLY_BANK: Record<CommentType, Record<ReplyTone, string[]>> = {
  praise: {
    friendly: [
      "Thank you so much, {name}! We're thrilled you loved it. 💛 — {brand}",
      "This comment made our day, {name}! Thanks for being here. — {brand}",
      "So glad it resonated with you, {name}! More like this coming soon. — {brand}",
    ],
    professional: [
      "Thank you for your kind words, {name}. We appreciate your support. — {brand}",
      "We're glad you found it valuable, {name}. Thank you for engaging. — {brand}",
      "Your feedback means a great deal to us, {name}. Thank you. — {brand}",
    ],
    playful: [
      "Okay {name}, you're officially our favorite commenter today. 🏆 — {brand}",
      "Stop it, {name} — you're making us blush! Thanks a ton. — {brand}",
      "{name} bringing the good vibes as always! Appreciate you. ✨ — {brand}",
    ],
    formal: [
      "We sincerely thank you for your gracious comment, {name}. — {brand}",
      "Your commendation is most appreciated, {name}. Thank you. — {brand}",
      "We are grateful for your positive remarks, {name}. — {brand}",
    ],
  },
  question: {
    friendly: [
      "Great question, {name}! Here's the short answer: {brand} will DM you the details. 💌",
      "Love that you're asking, {name}! Drop a few more details and we'll point you the right way. — {brand}",
      "Good eye, {name}! We covered this in our highlights — check the \"FAQ\" story, or ask us here. — {brand}",
    ],
    professional: [
      "Thank you for your question, {name}. We will respond with full details shortly. — {brand}",
      "We appreciate the inquiry, {name}. Please see our FAQ highlight, or we can assist you here. — {brand}",
      "Noted, {name}. A member of the {brand} team will follow up with an answer. — {brand}",
    ],
    playful: [
      "Ooh, {name} asking the real questions! 🕵️ Short answer: yes — long answer is in our DMs. — {brand}",
      "We love a curious mind, {name}! The answer is hiding in our FAQ highlight. Go find it! 🔍 — {brand}",
      "Plot twist, {name}: great question! We'll break it down for you right here. — {brand}",
    ],
    formal: [
      "Thank you for your inquiry, {name}. We shall provide a complete response forthwith. — {brand}",
      "Your question has been noted, {name}. Please allow us a moment to furnish the details. — {brand}",
      "We appreciate your interest, {name}. The requested information will follow. — {brand}",
    ],
  },
  criticism: {
    friendly: [
      "We're really sorry about that, {name}. Can you DM us so we can make it right? 💛 — {brand}",
      "Thank you for telling us, {name} — that's not the experience we want for you. Let's fix it together. — {brand}",
      "We hear you, {name}, and we're sorry. Your feedback helps us do better. — {brand}",
    ],
    professional: [
      "We apologize for the inconvenience, {name}. Please DM us so we can resolve this promptly. — {brand}",
      "Thank you for bringing this to our attention, {name}. We take this seriously and will address it. — {brand}",
      "We regret that we fell short, {name}. A member of the {brand} team will reach out to assist. — {brand}",
    ],
    playful: [
      "Ouch — fair point, {name}! 😅 We're on it, and we'd love to make it up to you in the DMs. — {brand}",
      "Noted, {name}! Even our best days have bloopers — let us fix this one for you. — {brand}",
      "You got us, {name}! Consider this our official \"we'll do better\" comment. DM us? 🙏 — {brand}",
    ],
    formal: [
      "Please accept our sincere apologies, {name}. We would welcome the opportunity to rectify this. — {brand}",
      "We deeply regret the inconvenience, {name}. Kindly contact us directly so we may assist. — {brand}",
      "Your dissatisfaction is duly noted, {name}, and we assure you of our attention to this matter. — {brand}",
    ],
  },
  spam: {
    friendly: [
      "Hey {name}! This one's a bit off-topic for this post — but we'd love to chat in DMs instead. 💛 — {brand}",
      "Thanks for stopping by, {name}! Let's keep this thread on topic — happy to talk elsewhere. — {brand}",
      "Appreciate the enthusiasm, {name}! This thread is for post discussion — DM us anytime. — {brand}",
    ],
    professional: [
      "Thank you, {name}. This comment appears unrelated to the post; we will remove off-topic comments to keep discussion useful. — {brand}",
      "We appreciate your engagement, {name}, but ask that comments stay on topic. — {brand}",
      "Noted, {name}. Off-topic comments may be removed to preserve discussion quality. — {brand}",
    ],
    playful: [
      "Wrong post, {name}? 😄 No worries — the DMs are that way! 👉 — {brand}",
      "{name} really said \"any comment section is my comment section.\" Respect — but let's stay on topic! 😅 — {brand}",
      "Plot twist: {name} commented on the wrong post! We still love the energy though. ✨ — {brand}",
    ],
    formal: [
      "We must respectfully request that comments remain pertinent to the post, {name}. — {brand}",
      "This comment appears unrelated to the subject at hand, {name}. We shall remove off-topic remarks. — {brand}",
      "Kindly refrain from unrelated commentary, {name}, so the discussion remains constructive. — {brand}",
    ],
  },
};

export const BANK_SIZES = {
  templatesPerPair: REPLY_BANK.praise.friendly.length,
  commentTypes: COMMENT_TYPES.length,
  tones: REPLY_TONES.length,
  total:
    REPLY_BANK.praise.friendly.length * COMMENT_TYPES.length * REPLY_TONES.length,
};

export const ASSUMPTIONS: string[] = [
  "Replies come from 48 hand-written templates (4 comment types × 4 tones × 3), not AI generation.",
  "The {name} slot is always left for you to fill with the commenter's name.",
  "The {brand} slot is filled with your brand name when provided, otherwise left as a placeholder.",
  "For serious complaints or legal issues, have a human review the reply before posting.",
];

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function isCommentType(s: string): s is CommentType {
  return (COMMENT_TYPES as string[]).includes(s);
}

function isReplyTone(s: string): s is ReplyTone {
  return (REPLY_TONES as string[]).includes(s);
}

/**
 * Generate reply templates. Throws for unknown commentType. Tone defaults to
 * "friendly" when omitted; unknown tones throw. brandName is optional.
 */
export function generateReplies(
  commentType: string,
  tone: string | undefined,
  brandName: string | undefined
): { replies: string[]; commentType: CommentType; tone: ReplyTone } {
  if (typeof commentType !== "string" || !isCommentType(commentType)) {
    throw new Error(`commentType must be one of: ${COMMENT_TYPES.join(", ")}.`);
  }
  const cleanTone: ReplyTone = tone === undefined || tone === null || tone === ""
    ? "friendly"
    : tone as ReplyTone;
  if (!isReplyTone(cleanTone)) {
    throw new Error(`tone must be one of: ${REPLY_TONES.join(", ")}.`);
  }
  const brand = typeof brandName === "string" ? brandName.trim() : "";
  const templates = REPLY_BANK[commentType][cleanTone];
  const replies = templates.map((t) =>
    brand === "" ? t : t.replaceAll("{brand}", brand)
  );
  return { replies, commentType, tone: cleanTone };
}

/**
 * Contract adapter for the mountToolUI generator template.
 * Values keys: replies, copyAll (match meta.ts output ids).
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please choose the type of comment first." };
  }
  try {
    const result = generateReplies(
      values["commentType"] as string,
      values["tone"] as string | undefined,
      values["brandName"] as string | undefined
    );
    return {
      ok: true,
      values: {
        replies: result.replies,
        copyAll: result.replies.join("\n\n"),
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
