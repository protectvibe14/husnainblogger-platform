/**
 * Email Subject Line Generator — pure logic (tool-402).
 *
 * Deterministic template/pattern library — NOT AI. Every subject line is
 * assembled client-side from bundled pattern templates plus tone modifiers.
 *
 * BANK SIZES (documented for honesty):
 * - 30 base templates: 5 email purposes x 6 templates each.
 * - 5 tones x 4 deterministic variants = 20 tone modifiers.
 * - 30 x 20 = 600 possible (template, tone, variant) combinations; the tool
 *   serves them in fixed order, so identical inputs always produce identical
 *   output (count max 20 < 600, so no repeats within one run).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM, zero randomness. Fully
 *   deterministic: same inputs -> same outputs.
 * - Length is measured in user-perceived characters ([...s].length), so
 *   emoji count as one character each.
 * - "fitsMobile" uses the widely-used ~41-character iPhone Mail
 *   approximation, labeled as approximate in meta.ts assumptions.
 * - Overlong topic/audience input is truncated (120 chars) with a visible
 *   notice returned in `notice` — never silently dropped.
 * - Output is plain text; HTML tags are stripped from user input before
 *   insertion, and duplicate adjacent words are collapsed.
 */

export const PURPOSES = [
  "newsletter",
  "promo",
  "welcome",
  "reengagement",
  "transactional",
] as const;
export type EmailPurpose = (typeof PURPOSES)[number];

export const TONES = [
  "friendly",
  "urgent",
  "playful",
  "professional",
  "curious",
] as const;
export type GeneratorTone = (typeof TONES)[number];

export const DEFAULT_COUNT = 10;
export const MAX_COUNT = 20;
export const MIN_COUNT = 1;
export const MAX_INPUT_CHARS = 120;
export const MOBILE_FIT_CHARS = 41;

/** 5 purposes x 6 templates = 30 base patterns. */
const TEMPLATES: Record<EmailPurpose, readonly string[]> = {
  newsletter: [
    "This week's {topic} roundup",
    "{topic} insights for {audience}",
    "Your {topic} briefing is here",
    "New in {topic}: what changed",
    "{audience} guide to {topic}",
    "The {topic} digest you asked for",
  ],
  promo: [
    "{topic} sale: save on what you love",
    "Special offer: {topic} for {audience}",
    "Inside: {topic} deals",
    "Get more {topic} for less",
    "Your {topic} discount is waiting",
    "Big savings on {topic}",
  ],
  welcome: [
    "Welcome! Your {topic} starter kit",
    "You're in - let's explore {topic}",
    "Welcome aboard, {audience}",
    "Your {topic} journey starts here",
    "Thanks for joining: {topic} basics",
    "First steps with {topic}",
  ],
  reengagement: [
    "We miss you - {topic} has improved",
    "Still interested in {topic}?",
    "Come back: what's new in {topic}",
    "{audience}, we saved your spot",
    "A fresh start with {topic}",
    "You left something in {topic}",
  ],
  transactional: [
    "Your {topic} receipt",
    "Order confirmed: {topic}",
    "{topic} update: action may be needed",
    "Your {topic} is ready",
    "Reminder: {topic} is scheduled",
    "{topic} confirmation details",
  ],
};

interface ToneModifier {
  prefix: string;
  suffix: string;
  forceQuestion: boolean;
}

/** 5 tones x 4 variants = 20 deterministic modifiers. */
const TONE_MODIFIERS: Record<GeneratorTone, readonly ToneModifier[]> = {
  friendly: [
    { prefix: "", suffix: "", forceQuestion: false },
    { prefix: "Just for you: ", suffix: "", forceQuestion: false },
    { prefix: "", suffix: " - you'll love this", forceQuestion: false },
    { prefix: "", suffix: " \u{1F49B}", forceQuestion: false },
  ],
  urgent: [
    { prefix: "", suffix: "", forceQuestion: false },
    { prefix: "Last chance: ", suffix: "", forceQuestion: false },
    { prefix: "", suffix: " - today only", forceQuestion: false },
    { prefix: "Don't miss: ", suffix: "!", forceQuestion: false },
  ],
  playful: [
    { prefix: "", suffix: "", forceQuestion: false },
    { prefix: "Psst... ", suffix: "", forceQuestion: false },
    { prefix: "", suffix: " \u{1F440}", forceQuestion: false },
    { prefix: "", suffix: "", forceQuestion: true },
  ],
  professional: [
    { prefix: "", suffix: "", forceQuestion: false },
    { prefix: "Update: ", suffix: "", forceQuestion: false },
    { prefix: "", suffix: " - what you need to know", forceQuestion: false },
    { prefix: "", suffix: ": a quick brief", forceQuestion: false },
  ],
  curious: [
    { prefix: "", suffix: "", forceQuestion: true },
    { prefix: "The truth about ", suffix: "", forceQuestion: false },
    { prefix: "", suffix: " - here's why", forceQuestion: false },
    { prefix: "What if ", suffix: "?", forceQuestion: false },
  ],
};

export interface GeneratedSubjectLine {
  text: string;
  charCount: number;
  fitsMobile: boolean;
}

/** Collapse whitespace, strip HTML tags, collapse adjacent duplicate words. */
function sanitizeInput(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .replace(/\b(\w+)( \1\b)+/gi, "$1")
    .trim();
}

function fillTemplate(template: string, topic: string, audience: string): string {
  return template.split("{topic}").join(topic).split("{audience}").join(audience);
}

function applyTone(line: string, tone: GeneratorTone, variant: number): string {
  const mod = TONE_MODIFIERS[tone][variant % TONE_MODIFIERS[tone].length];
  let out = `${mod.prefix}${line}${mod.suffix}`;
  if (mod.forceQuestion && !out.includes("?")) {
    out = `${out}?`;
  }
  return out.replace(/\s+/g, " ").trim();
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const purposeRaw = values["emailPurpose"];
  if (typeof purposeRaw !== "string" || !(PURPOSES as readonly string[]).includes(purposeRaw)) {
    return {
      ok: false,
      error: "Choose an email purpose: newsletter, promo, welcome, reengagement, or transactional.",
    };
  }
  const purpose = purposeRaw as EmailPurpose;

  const topicRaw = values["topic"];
  if (typeof topicRaw !== "string" || topicRaw.trim().length === 0) {
    return { ok: false, error: "Enter a topic for the subject lines." };
  }
  const audienceRaw = values["audience"];
  if (typeof audienceRaw !== "string" || audienceRaw.trim().length === 0) {
    return { ok: false, error: "Enter your audience for the subject lines." };
  }

  const toneRaw = values["tone"];
  let tone: GeneratorTone = "friendly";
  if (toneRaw !== undefined && toneRaw !== null && toneRaw !== "") {
    if (typeof toneRaw !== "string" || !(TONES as readonly string[]).includes(toneRaw)) {
      return {
        ok: false,
        error: "Tone must be one of: friendly, urgent, playful, professional, curious.",
      };
    }
    tone = toneRaw as GeneratorTone;
  }

  let count = DEFAULT_COUNT;
  const countRaw = values["count"];
  if (countRaw !== undefined && countRaw !== null && countRaw !== "") {
    const n = typeof countRaw === "number" ? countRaw : Number(countRaw);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < MIN_COUNT || n > MAX_COUNT) {
      return { ok: false, error: `Count must be a whole number from ${MIN_COUNT} to ${MAX_COUNT}.` };
    }
    count = n;
  }

  let topic = sanitizeInput(topicRaw);
  let audience = sanitizeInput(audienceRaw);
  let notice = "";
  if ([...topic].length > MAX_INPUT_CHARS) {
    topic = [...topic].slice(0, MAX_INPUT_CHARS).join("").trim();
    notice = `Topic was shortened to ${MAX_INPUT_CHARS} characters.`;
  }
  if ([...audience].length > MAX_INPUT_CHARS) {
    audience = [...audience].slice(0, MAX_INPUT_CHARS).join("").trim();
    notice = notice
      ? `${notice} Audience was shortened to ${MAX_INPUT_CHARS} characters.`
      : `Audience was shortened to ${MAX_INPUT_CHARS} characters.`;
  }

  const templates = TEMPLATES[purpose];
  const subjectLines: GeneratedSubjectLine[] = [];
  const seen = new Set<string>();
  // Serve (template, variant) pairs in fixed order; 30 templates x 4 tone
  // variants = 120 slots >> max count 20, so one run never repeats.
  for (let slot = 0; slot < templates.length * 4 && subjectLines.length < count; slot++) {
    const line = applyTone(
      fillTemplate(templates[slot % templates.length], topic, audience),
      tone,
      Math.floor(slot / templates.length),
    );
    if (seen.has(line)) continue;
    seen.add(line);
    const charCount = [...line].length;
    subjectLines.push({
      text: line,
      charCount,
      fitsMobile: charCount <= MOBILE_FIT_CHARS,
    });
  }

  return {
    ok: true,
    values: { subjectLines, notice },
  };
}
