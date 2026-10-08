/**
 * Carousel Hook Slide Generator — pure logic (tool-211), zero imports, zero
 * network, zero DOM.
 *
 * TEMPLATE BANK, NOT AI: builds a slide-by-slide carousel outline from
 * hand-written templates. Slide 1 is always the hook, the last slide is
 * always the CTA, and the middle slides are value slides cycled
 * deterministically from the angle's value bank.
 *
 * Angles (fixed list):
 *   mistake — "the mistake almost everyone makes" framing
 *   myth    — myth-vs-truth framing
 *   steps   — how-to steps framing
 *   list    — listicle framing
 *   story   — personal-story framing
 *
 * Template banks per angle: 5 hook templates + 8 value templates + 3 CTA
 * templates (CTA bank is shared across angles: 3 templates). Totals: 25
 * hook + 40 value + 3 CTA = 68 templates. Sizes are documented in the
 * result so the UI can state them honestly.
 *
 * Placeholders: {topic} = user's topic, {n} = value-slide number
 * (1-based within the value section).
 */

export type CarouselAngle = "mistake" | "myth" | "steps" | "list" | "story";
export type SlideRole = "hook" | "value" | "cta";

/** The five supported angles, in canonical order. */
export const CAROUSEL_ANGLES: CarouselAngle[] = ["mistake", "myth", "steps", "list", "story"];

/** Slide-count bounds (hook + at least 1 value + CTA, max 8 value slides). */
export const MIN_SLIDES = 3;
export const MAX_SLIDES = 10;

/** Hook templates per angle — 5 each (25 total). Exported so the
 *  runTool adapter below can cycle the bank for multi-hook output. */
export const HOOK_BANK: Record<CarouselAngle, string[]> = {
  mistake: [
    "The {topic} mistake almost everyone makes",
    "Stop making this {topic} mistake",
    "You're doing {topic} wrong (here's the fix)",
    "The costly {topic} error I see everywhere",
    "If your {topic} isn't working, it's probably this",
  ],
  myth: [
    "You've been lied to about {topic}",
    "The biggest {topic} myth — busted",
    "{topic}: what everyone gets wrong",
    "Stop believing this {topic} myth",
    "The {topic} 'rule' that's actually false",
  ],
  steps: [
    "How to {topic} in {n} simple steps",
    "The {topic} process, broken down",
    "{topic} made simple: follow these steps",
    "From zero to {topic} — the exact steps",
    "The only {topic} framework you need",
  ],
  list: [
    "{n} {topic} ideas you need to steal",
    "The ultimate {topic} list",
    "{n} {topic} tips worth saving",
    "Everything I know about {topic}, in {n} slides",
    "{n} {topic} essentials (save this)",
  ],
  story: [
    "How I learned {topic} the hard way",
    "My {topic} story (and what it taught me)",
    "I failed at {topic} until I did this",
    "What {topic} taught me in 30 days",
    "The {topic} lesson nobody taught me",
  ],
};

/** Value-slide templates per angle — 8 each (40 total). {n} = value-slide number. */
const VALUE_BANK: Record<CarouselAngle, string[]> = {
  mistake: [
    "Mistake #{n}: skipping the basics of {topic}",
    "Mistake #{n}: copying others instead of learning {topic} properly",
    "Mistake #{n}: expecting {topic} results overnight",
    "Mistake #{n}: ignoring feedback on your {topic}",
    "Mistake #{n}: overcomplicating {topic}",
    "Mistake #{n}: quitting {topic} too early",
    "Mistake #{n}: no clear goal for your {topic}",
    "Mistake #{n}: doing {topic} without a plan",
  ],
  myth: [
    "Myth #{n}: {topic} is only for experts — Truth: beginners can start today",
    "Myth #{n}: you need expensive tools for {topic} — Truth: free tools work",
    "Myth #{n}: {topic} takes years to learn — Truth: fundamentals take weeks",
    "Myth #{n}: {topic} is all talent — Truth: it's mostly process",
    "Myth #{n}: there's one right way to do {topic} — Truth: many paths work",
    "Myth #{n}: {topic} doesn't work anymore — Truth: the basics still win",
    "Myth #{n}: you must be perfect at {topic} — Truth: done beats perfect",
    "Myth #{n}: {topic} is too saturated — Truth: new voices still break through",
  ],
  steps: [
    "Step {n}: define your {topic} goal clearly",
    "Step {n}: gather the minimum tools for {topic}",
    "Step {n}: do your first small {topic} rep",
    "Step {n}: review what worked in your {topic} attempt",
    "Step {n}: fix the weakest part of your {topic}",
    "Step {n}: repeat until {topic} feels natural",
    "Step {n}: share your {topic} progress publicly",
    "Step {n}: teach {topic} to someone else",
  ],
  list: [
    "#{n}: a {topic} idea you can try today",
    "#{n}: the {topic} tip most people skip",
    "#{n}: my favorite {topic} shortcut",
    "#{n}: a {topic} resource worth bookmarking",
    "#{n}: the {topic} habit that compounds",
    "#{n}: a {topic} example to copy",
    "#{n}: the {topic} upgrade with biggest ROI",
    "#{n}: one {topic} thing to avoid",
  ],
  story: [
    "Part {n}: where my {topic} journey started",
    "Part {n}: the first {topic} failure",
    "Part {n}: what I changed about my {topic} approach",
    "Part {n}: the small {topic} win that kept me going",
    "Part {n}: the {topic} breakthrough moment",
    "Part {n}: what I'd do differently with {topic}",
    "Part {n}: how {topic} looks for me now",
    "Part {n}: the lesson I'll never forget about {topic}",
  ],
};

/** CTA templates — shared across angles (3 total). */
const CTA_BANK: string[] = [
  "Save this post for later — which slide hit hardest? Tell me in the comments.",
  "Found this useful? Save it and share with someone learning {topic}.",
  "Follow for more {topic} breakdowns — comment '{topic}' and I'll DM you my starter guide.",
];

export const BANK_SIZES = {
  hookPerAngle: HOOK_BANK.mistake.length,
  valuePerAngle: VALUE_BANK.mistake.length,
  ctaShared: CTA_BANK.length,
  angles: CAROUSEL_ANGLES.length,
  total:
    HOOK_BANK.mistake.length * CAROUSEL_ANGLES.length +
    VALUE_BANK.mistake.length * CAROUSEL_ANGLES.length +
    CTA_BANK.length,
};

export interface CarouselSlide {
  slideNumber: number;
  role: SlideRole;
  text: string;
  /** Design guidance for the slide (not a rendered layout). */
  formatHint: string;
}

export interface CarouselResult {
  topic: string;
  angle: CarouselAngle;
  slideCount: number;
  slides: CarouselSlide[];
  bankSizes: typeof BANK_SIZES;
  assumptions: string[];
  /** Always true — reminds consumers these are templates, not AI output. */
  isTemplateBased: true;
}

export const ASSUMPTIONS: string[] = [
  "Outlines come from 68 hand-written templates (25 hooks + 40 value + 3 CTAs), not AI generation.",
  "Value slides cycle in bank order when the slide count exceeds an angle's value bank.",
  "Outlines are starting points — adapt wording, examples and CTAs to your voice and audience.",
];

const FORMAT_HINTS: Record<SlideRole, string> = {
  hook: "Bold headline, high contrast, max ~12 words — must stop the scroll.",
  value: "One idea per slide, short lines, generous whitespace.",
  cta: "Clear call-to-action: save, share, comment or follow.",
};

function isCarouselAngle(s: string): s is CarouselAngle {
  return (CAROUSEL_ANGLES as string[]).includes(s);
}

function fill(template: string, topic: string, n: number): string {
  return template.replaceAll("{topic}", topic).replaceAll("{n}", String(n));
}

/**
 * Generate a carousel outline. Throws for: empty/non-string topic,
 * unknown angle, non-integer slideCount outside 3–10. Never throws for
 * unicode topics — they are inserted verbatim.
 */
export function generateCarousel(
  topic: string,
  angle: string,
  slideCount: number
): CarouselResult {
  if (typeof topic !== "string" || topic.trim().length === 0) {
    throw new Error("topic must be a non-empty string.");
  }
  if (!isCarouselAngle(angle)) {
    throw new Error(
      `unknown carousel angle "${angle}". Valid angles: ${CAROUSEL_ANGLES.join(", ")}.`
    );
  }
  if (!Number.isInteger(slideCount) || slideCount < MIN_SLIDES || slideCount > MAX_SLIDES) {
    throw new Error(`slideCount must be an integer between ${MIN_SLIDES} and ${MAX_SLIDES}.`);
  }

  const cleanTopic = topic.trim();
  const hooks = HOOK_BANK[angle];
  const values = VALUE_BANK[angle];
  const valueCount = slideCount - 2; // everything between hook and CTA

  const slides: CarouselSlide[] = [];
  // Slide 1: hook (deterministic — first template of the angle's bank).
  slides.push({
    slideNumber: 1,
    role: "hook",
    text: fill(hooks[0], cleanTopic, valueCount),
    formatHint: FORMAT_HINTS.hook,
  });
  // Middle: value slides, cycling the bank.
  for (let i = 0; i < valueCount; i++) {
    slides.push({
      slideNumber: i + 2,
      role: "value",
      text: fill(values[i % values.length], cleanTopic, i + 1),
      formatHint: FORMAT_HINTS.value,
    });
  }
  // Last: CTA (deterministic — first template).
  slides.push({
    slideNumber: slideCount,
    role: "cta",
    text: fill(CTA_BANK[0], cleanTopic, valueCount),
    formatHint: FORMAT_HINTS.cta,
  });

  return {
    topic: cleanTopic,
    angle,
    slideCount,
    slides,
    bankSizes: { ...BANK_SIZES },
    assumptions: [...ASSUMPTIONS],
    isTemplateBased: true,
  };
}

/* ---------------------------------------------------------------------------
 * Contract adapter (mountToolUI generator template).
 *
 * runTool(values) validates { topic, angle, count } (count 1–10) and wraps the
 * existing generateCarousel engine to return `count` first-slide hook
 * options: it cycles the angle's 5-template hook bank deterministically
 * (wraps in bank order when count > 5) and pairs every hook with a fixed
 * visual note. Output ids ("hooks", "copyAll") match meta.ts outputs.
 * Pure, deterministic, zero imports.
 * ------------------------------------------------------------------------- */

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Fixed visual guidance attached to every hook option (not AI output). */
export const HOOK_VISUAL_NOTE =
  "Bold headline, high contrast, keep it under ~12 words so it stops the scroll.";

function parseCount(raw: unknown): number | null {
  const n = typeof raw === "string" && raw.trim() !== "" ? Number(raw.trim()) : raw;
  if (typeof n !== "number" || !Number.isInteger(n) || n < 1 || n > 10) {
    return null;
  }
  return n;
}

export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please enter your carousel topic to generate hooks." };
  }
  const topic = values["topic"];
  const angle = values["angle"];
  const count = parseCount(values["count"]);

  if (typeof topic !== "string" || topic.trim().length === 0) {
    return { ok: false, error: "Topic is required — tell the tool what your carousel is about." };
  }
  if (typeof angle !== "string" || !(CAROUSEL_ANGLES as string[]).includes(angle)) {
    return {
      ok: false,
      error: `Angle is required. Choose one of: ${CAROUSEL_ANGLES.join(", ")}.`,
    };
  }
  if (count === null) {
    return { ok: false, error: "Count must be a whole number between 1 and 10." };
  }

  const bank = HOOK_BANK[angle as CarouselAngle];
  const cleanTopic = topic.trim();
  const hooks: string[] = [];
  for (let i = 0; i < count; i++) {
    const template = bank[i % bank.length];
    const text = template
      .replaceAll("{topic}", cleanTopic)
      .replaceAll("{n}", String(count));
    hooks.push(`${text}  •  Visual note: ${HOOK_VISUAL_NOTE}`);
  }
  return { ok: true, values: { hooks, copyAll: hooks.join("\n\n") } };
}
