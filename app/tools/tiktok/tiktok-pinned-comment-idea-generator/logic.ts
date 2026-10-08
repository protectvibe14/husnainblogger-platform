/**
 * TikTok Pinned Comment Idea Generator — pure logic (tool-173). Zero imports,
 * zero network, zero DOM, zero randomness.
 *
 * WORD BANK ENGINE (template ideas; does NOT pin comments):
 *   - COMMENT_BANK: 20 hand-written pinned-comment templates across
 *     4 categories (5 per category): question, cta, linkInBio, followUp.
 *   - Per the spec edge case, CTAs use value-first wording (offer value
 *     before asking anything) and never read as spam.
 *   - Selection is deterministic: a djb2 hash of the (lowercased, trimmed)
 *     topic picks a rotation offset per category; 2 templates per category
 *     are returned, in bank order, for 8 total ideas.
 *   - Every filled comment is guaranteed <= 150 characters (TikTok's
 *     comment length limit, enforced as validation in the tool).
 *   - This tool NEVER pins anything and NEVER claims AI.
 */

/** TikTok comment length limit enforced on every output line. */
export const COMMENT_MAX_CHARS = 150;

export type CommentCategory = "question" | "cta" | "linkInBio" | "followUp";

export const CATEGORY_LABELS: Record<CommentCategory, string> = {
  question: "Question",
  cta: "Call to action",
  linkInBio: "Link in bio",
  followUp: "Follow-up",
};

const CATEGORY_ORDER: CommentCategory[] = ["question", "cta", "linkInBio", "followUp"];

/**
 * 20-entry static template bank (5 per category). {topic} is filled with the
 * user's video topic. Wording is value-first per the spec edge case.
 */
export const COMMENT_BANK: { category: CommentCategory; template: string }[] = [
  { category: "question", template: "Which {topic} tip should I demo next?" },
  { category: "question", template: "What part of {topic} confuses you the most?" },
  { category: "question", template: "Beginner or advanced at {topic} — where are you right now?" },
  { category: "question", template: "What's your biggest {topic} struggle right now?" },
  { category: "question", template: "Should I do a part 2 on {topic}? Tell me below." },
  { category: "cta", template: "Comment GUIDE and I'll DM you my free {topic} starter checklist." },
  { category: "cta", template: "Save this for your next {topic} session — future you says thanks." },
  { category: "cta", template: "Drop your {topic} question below — I answer every single one." },
  { category: "cta", template: "Follow for daily {topic} tips that actually save you time." },
  { category: "cta", template: "Double-tap if this {topic} trick helped you — it boosts the video." },
  { category: "linkInBio", template: "The full {topic} tutorial and every link I mentioned are in my bio." },
  { category: "linkInBio", template: "My complete {topic} gear list is linked in my bio." },
  { category: "linkInBio", template: "Free {topic} starter guide — grab it from the link in my bio." },
  { category: "linkInBio", template: "The exact template I used here: link in my bio." },
  { category: "linkInBio", template: "Want the full {topic} walkthrough? It's linked in my bio." },
  { category: "followUp", template: "Part 2 on {topic} drops tomorrow — follow so you don't miss it." },
  { category: "followUp", template: "I posted a deeper {topic} breakdown — check my page for it." },
  { category: "followUp", template: "New {topic} tips every weekday on this page." },
  { category: "followUp", template: "Rewatch and practice: this {topic} skill takes about a week to click." },
  { category: "followUp", template: "FAQ: see my comment replies below for more {topic} answers." },
];

/** Number of templates in the static bank (documented for QA). */
export const BANK_SIZE = COMMENT_BANK.length; // 20

/** Templates per category in the bank (documented for QA). */
export const TEMPLATES_PER_CATEGORY = 5;

/** Ideas returned per category (2 x 4 categories = 8 total). */
export const IDEAS_PER_CATEGORY = 2;

/** djb2 string hash — deterministic rotation offset. */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

/**
 * Fill a template with the topic. If the filled comment would exceed the
 * 150-character limit, the topic is trimmed at a word boundary so the
 * guarantee always holds.
 */
export function fillTemplate(template: string, topic: string): string {
  const filled = template.replace(/\{topic\}/g, topic);
  if (filled.length <= COMMENT_MAX_CHARS) return filled;
  const overBy = filled.length - COMMENT_MAX_CHARS;
  const trimmedTopic = topic.slice(0, Math.max(1, topic.length - overBy)).replace(/\s+\S*$/, "");
  return template.replace(/\{topic\}/g, trimmedTopic);
}

export interface PinnedCommentResult {
  ok: boolean;
  values?: { comments: string[]; copyAll: string };
  error?: string;
}

/**
 * Generate pinned-comment ideas for a video topic. Same topic always
 * returns the same 8 ideas.
 */
export function runTool(values: Record<string, unknown>): PinnedCommentResult {
  const rawTopic = values["videoTopic"];
  if (typeof rawTopic !== "string" || rawTopic.trim().length === 0) {
    return { ok: false, error: "Please enter your video topic first." };
  }
  const videoTopic = rawTopic.trim();
  if (videoTopic.length > 60) {
    return { ok: false, error: "The video topic is too long — keep it under 60 characters." };
  }

  const offset = hashString(videoTopic.toLowerCase());
  const displayLines: string[] = [];
  const plainLines: string[] = [];

  for (let c = 0; c < CATEGORY_ORDER.length; c++) {
    const category = CATEGORY_ORDER[c];
    const templates = COMMENT_BANK.filter((t) => t.category === category);
    const start = (offset + c) % TEMPLATES_PER_CATEGORY;
    for (let i = 0; i < IDEAS_PER_CATEGORY; i++) {
      const text = fillTemplate(templates[(start + i) % TEMPLATES_PER_CATEGORY].template, videoTopic);
      displayLines.push(`${CATEGORY_LABELS[category]}: ${text}`);
      plainLines.push(text);
    }
  }

  return {
    ok: true,
    values: {
      comments: displayLines,
      copyAll: plainLines.join("\n"),
    },
  };
}
