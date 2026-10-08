/**
 * Email CTA Button Text Generator — pure logic (tool-405).
 *
 * Deterministic template library — NOT AI. Assembles button microcopy
 * client-side from bundled verb-first templates plus tone modifiers.
 *
 * BANK SIZES (documented for honesty):
 * - 20 verb-first base templates with {action} / {audience} slots.
 * - 4 tones x 4 deterministic variants = 16 tone modifiers.
 * - Up to 12 unique CTAs served per run in fixed order.
 *
 * RULES (from spec):
 * - Verb-first, maxWords default 4 (word limit configurable 1-8).
 * - Mobile-tap-width warning: labels over ~24 characters get flagged in
 *   `warnings` — long labels feel cramped on small phone screens.
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM, zero randomness. Deterministic:
 *   same inputs -> same CTAs.
 * - Word counts use whitespace splitting; character counts are code points.
 * - Overlong action input (>60 chars) is truncated with a visible notice in
 *   `notice` — never silently dropped.
 */

export const TONES = ["direct", "friendly", "urgent", "playful"] as const;
export type CtaTone = (typeof TONES)[number];

export const DEFAULT_MAX_WORDS = 4;
export const MIN_MAX_WORDS = 1;
export const MAX_MAX_WORDS = 8;
export const MAX_ACTION_CHARS = 60;
export const SERVE_LIMIT = 12;
export const TAP_WIDTH_WARN_CHARS = 24;

/** 20 verb-first base templates. */
const TEMPLATES: readonly string[] = [
  "Get {action}",
  "Start {action}",
  "Join {audience}: get {action}",
  "Try {action}",
  "Claim {action}",
  "Download {action}",
  "Book {action}",
  "Join {action}",
  "Shop {action}",
  "Explore {action}",
  "Unlock {action}",
  "Grab {action}",
  "Start your {action}",
  "Get your {action}",
  "Try {action} free",
  "Book your {action}",
  "Claim your {action}",
  "Yes, I want {action}",
  "Show me {action}",
  "Count me in: {action}",
  "Join {audience}: get {action}",
];

interface ToneModifier {
  prefix: string;
  suffix: string;
}

/** 4 tones x 4 variants = 16 deterministic modifiers. */
const TONE_MODIFIERS: Record<CtaTone, readonly ToneModifier[]> = {
  direct: [
    { prefix: "", suffix: "" },
    { prefix: "", suffix: " now" },
    { prefix: "", suffix: " today" },
    { prefix: "", suffix: " \u2192" },
  ],
  friendly: [
    { prefix: "", suffix: "" },
    { prefix: "Let's ", suffix: "" },
    { prefix: "", suffix: " \u{1F4AA}" },
    { prefix: "", suffix: " - easy start" },
  ],
  urgent: [
    { prefix: "", suffix: "" },
    { prefix: "", suffix: "!" },
    { prefix: "Don't wait - ", suffix: "" },
    { prefix: "", suffix: " before it's gone" },
  ],
  playful: [
    { prefix: "", suffix: "" },
    { prefix: "Psst: ", suffix: "" },
    { prefix: "", suffix: " \u{1F440}" },
    { prefix: "Yes please: ", suffix: "!" },
  ],
};

export interface CtaText {
  text: string;
  wordCount: number;
}

function sanitize(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(s: string): number {
  return s.split(/\s+/).filter((w) => w.length > 0).length;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const actionRaw = values["action"];
  if (typeof actionRaw !== "string" || actionRaw.trim().length === 0) {
    return { ok: false, error: "Describe the action your button should trigger." };
  }
  let action = sanitize(actionRaw);

  const audienceRaw = values["audience"];
  let audience = "";
  if (audienceRaw !== undefined && audienceRaw !== null && audienceRaw !== "") {
    if (typeof audienceRaw !== "string") {
      return { ok: false, error: "Audience must be text." };
    }
    audience = sanitize(audienceRaw);
  }

  const toneRaw = values["tone"];
  let tone: CtaTone = "direct";
  if (toneRaw !== undefined && toneRaw !== null && toneRaw !== "") {
    if (typeof toneRaw !== "string" || !(TONES as readonly string[]).includes(toneRaw)) {
      return {
        ok: false,
        error: "Tone must be one of: direct, friendly, urgent, playful.",
      };
    }
    tone = toneRaw as CtaTone;
  }

  let maxWords = DEFAULT_MAX_WORDS;
  const maxWordsRaw = values["maxWords"];
  if (maxWordsRaw !== undefined && maxWordsRaw !== null && maxWordsRaw !== "") {
    const n = typeof maxWordsRaw === "number" ? maxWordsRaw : Number(maxWordsRaw);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < MIN_MAX_WORDS || n > MAX_MAX_WORDS) {
      return {
        ok: false,
        error: `Max words must be a whole number from ${MIN_MAX_WORDS} to ${MAX_MAX_WORDS}.`,
      };
    }
    maxWords = n;
  }

  let notice = "";
  if ([...action].length > MAX_ACTION_CHARS) {
    action = [...action].slice(0, MAX_ACTION_CHARS).join("").trim();
    notice = `Action was shortened to ${MAX_ACTION_CHARS} characters.`;
  }

  const modifiers = TONE_MODIFIERS[tone];
  const ctaTexts: CtaText[] = [];
  const seen = new Set<string>();
  // Template-major order: each template is served with all 4 tone variants
  // before moving on, so tone markers and the audience template appear
  // within the first SERVE_LIMIT slots. 20 templates x 4 variants = 80 slots.
  for (let slot = 0; slot < TEMPLATES.length * modifiers.length && ctaTexts.length < SERVE_LIMIT; slot++) {
    const filled = TEMPLATES[Math.floor(slot / modifiers.length) % TEMPLATES.length]
      .split("{action}")
      .join(action)
      .split("{audience}")
      .join(audience || "everyone");
    const mod = modifiers[slot % modifiers.length];
    const text = `${mod.prefix}${filled}${mod.suffix}`.replace(/\s+/g, " ").trim();
    const wc = wordCount(text);
    if (wc > maxWords) continue;
    if (seen.has(text)) continue;
    seen.add(text);
    ctaTexts.push({ text, wordCount: wc });
  }

  const warnings: string[] = [];
  if (ctaTexts.length === 0) {
    return {
      ok: false,
      error: `No button text fits ${maxWords} word${maxWords === 1 ? "" : "s"} — raise the word limit.`,
    };
  }
  if (ctaTexts.some((c) => [...c.text].length > TAP_WIDTH_WARN_CHARS)) {
    warnings.push(
      `Labels over ~${TAP_WIDTH_WARN_CHARS} characters can feel cramped on small phone screens — prefer the shorter options above.`,
    );
  }

  const table = {
    columns: ["Button text", "Words"],
    rows: ctaTexts.map((c) => [c.text, String(c.wordCount)]),
  };

  return { ok: true, values: { ctaTexts: table, warnings, notice } };
}
