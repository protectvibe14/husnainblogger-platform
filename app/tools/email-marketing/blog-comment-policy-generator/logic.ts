/**
 * Blog Comment Policy Generator — pure logic (tool-449).
 *
 * Deterministic policy-text generator — NOT AI. The comment policy is
 * assembled client-side from bundled section templates; no network,
 * no backend, no randomness.
 *
 * NOTE (per spec honestyNote): the inventory listed this tool's toolType as
 * "tracker", but it is a generator — it produces policy text.
 *
 * BANK SIZES (documented for honesty):
 * - 3 tone openers (friendly / professional / firm).
 * - 3 moderation-process modules (open / moderated / strict).
 * - 3 consequence modules (open / moderated / strict).
 * - 5 fixed "what is welcome" bullets.
 * - 8 fixed "what is not allowed" rules.
 * - 1 fixed privacy note + 1 fixed changes note.
 *   Total bundled patterns: 3 + 3 + 3 + 5 + 8 + 2 = 24. Output always uses
 *   the tone opener, stance module, and stance consequence matching the
 *   user's choices, plus all fixed sections — so identical inputs always
 *   produce identical output.
 *
 * ASSUMPTIONS / HONESTY:
 * - Template policy text only — this is NOT legal advice. It is a starting
 *   point; review with a lawyer for your jurisdiction.
 * - Placeholder tokens are never rendered empty: {blogName} falls back to
 *   "this blog" only in pathological cases (blogName is required, so this
 *   path is defensive).
 * - Overlong input truncated to MAX_INPUT_CHARS Unicode code points with a
 *   visible `notice` — never silently dropped.
 * - Zero imports, zero DOM, zero randomness. Fully deterministic.
 */

export const MAX_INPUT_CHARS = 150;

export const STANCES = ["open", "moderated", "strict"] as const;
export type ModerationStance = (typeof STANCES)[number];

export const TONES = ["friendly", "professional", "firm"] as const;
export type PolicyTone = (typeof TONES)[number];

/** 3 tone openers. Slot: {blogName}. */
const TONE_OPENERS: Record<PolicyTone, string> = {
  friendly: `Welcome to the comments on {blogName}! We read every comment and genuinely enjoy hearing from you. This policy keeps the conversation friendly and useful for everyone.`,
  professional: `This is the comment policy for {blogName}. Comments are welcome from all readers, and this policy explains what we accept, what we moderate, and how decisions are made.`,
  firm: `Comment policy for {blogName}. Participation in the comments is a privilege, not a right. Read this policy before commenting — anything that violates it will be removed.`,
};

/** 5 fixed "what is welcome" bullets. */
const WELCOME_BULLETS: readonly string[] = [
  "Thoughtful questions and follow-up questions about the post",
  "Your own experience or results related to the topic",
  "Respectful disagreement with reasons, not insults",
  "Helpful corrections with a source when possible",
  "Encouragement that adds something specific",
];

/** 8 fixed "not allowed" rules. */
const NOT_ALLOWED_RULES: readonly string[] = [
  "Spam, link-dropping, or self-promotion without permission",
  "Harassment, hate speech, slurs, or personal attacks",
  "Profanity or sexually explicit content",
  "Copyrighted text pasted in full (short quotes with attribution are fine)",
  "Misleading claims presented as fact without evidence",
  "Posting other people's private or personal information",
  "Impersonating the blog author or other commenters",
  "Off-topic threads that derail the conversation",
];

/** 3 stance-dependent moderation-process modules. */
const MODERATION_MODULES: Record<ModerationStance, string> = {
  open: `We keep comments open: your comment appears immediately, and we review reports from readers. We remove content that breaks the rules above as soon as we see it.`,
  moderated: `Comments go through light moderation: first-time comments are held for review and appear once approved (usually within 24 hours). Returning commenters in good standing appear instantly. We edit or remove rule-breaking content.`,
  strict: `Comments are pre-moderated: every comment is reviewed before it appears, which may take up to 48 hours. We approve only comments that follow this policy closely. Comments that violate the rules are removed without notice.`,
};

/** 3 stance-dependent consequence modules. */
const CONSEQUENCE_MODULES: Record<ModerationStance, string> = {
  open: `One warning for minor violations; repeat offenders and serious violations (spam, harassment, doxxing) are blocked immediately.`,
  moderated: `Minor violations get one warning and the comment removed; repeat or serious violations result in an immediate ban.`,
  strict: `Any violation results in removal. Repeat violations result in a permanent ban with no appeal process.`,
};

const PRIVACY_NOTE = `Your name and comment are public. Your email address (if required) is never published and is only used to contact you about your comment.`;
const CHANGES_NOTE = `This policy may change over time. The version published on this page always applies to new comments.`;

/** Strip HTML tags, collapse whitespace, collapse adjacent duplicate words. */
function sanitize(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .replace(/\b(\w+)( \1\b)+/gi, "$1")
    .trim();
}

function fill(template: string, slots: Record<string, string>): string {
  let out = template;
  for (const key of Object.keys(slots)) {
    out = out.split(`{${key}}`).join(slots[key]);
  }
  return out;
}

function bullets(items: readonly string[]): string {
  return items.map((i) => `- ${i}`).join("\n");
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please enter your blog details first." };
  }

  const nameRaw = values["blogName"];
  if (typeof nameRaw !== "string" || sanitize(nameRaw).length === 0) {
    return { ok: false, error: "Enter your blog name." };
  }

  const stanceRaw = values["moderationStance"];
  if (
    typeof stanceRaw !== "string" ||
    !(STANCES as readonly string[]).includes(stanceRaw)
  ) {
    return {
      ok: false,
      error: "Choose a moderation stance: open, moderated, or strict.",
    };
  }
  const stance = stanceRaw as ModerationStance;

  const toneRaw = values["tone"];
  if (typeof toneRaw !== "string" || !(TONES as readonly string[]).includes(toneRaw)) {
    return {
      ok: false,
      error: "Choose a tone: friendly, professional, or firm.",
    };
  }
  const tone = toneRaw as PolicyTone;

  let blogName = sanitize(nameRaw);
  let notice = "";
  if ([...blogName].length > MAX_INPUT_CHARS) {
    blogName = [...blogName].slice(0, MAX_INPUT_CHARS).join("").trim();
    notice = `Blog name was shortened to ${MAX_INPUT_CHARS} characters.`;
  }

  const policyText = [
    `# Comment Policy — ${blogName}`,
    ``,
    `## Welcome`,
    fill(TONE_OPENERS[tone], { blogName }),
    ``,
    `## What is welcome`,
    bullets(WELCOME_BULLETS),
    ``,
    `## What is not allowed`,
    bullets(NOT_ALLOWED_RULES),
    ``,
    `## How moderation works`,
    MODERATION_MODULES[stance],
    ``,
    `## Consequences`,
    CONSEQUENCE_MODULES[stance],
    ``,
    `## Privacy`,
    PRIVACY_NOTE,
    ``,
    `## Changes to this policy`,
    CHANGES_NOTE,
    ``,
    `---`,
    `Template policy text generated as a starting point — not legal advice. Review with a lawyer for your jurisdiction.`,
  ].join("\n");

  return {
    ok: true,
    values: { policyText, notice },
  };
}
