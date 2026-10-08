/**
 * TikTok Photo Carousel Planner — pure logic (tool-179).
 * Zero imports, zero network, zero DOM, zero randomness.
 *
 * TEMPLATE ENGINE (static plan, fully client-side):
 *   - Builds a slide-by-slide plan: Slide 1 is always the cover (hook),
 *     the last slide is always the CTA, and the middle slides are value
 *     slides cycling through SLIDE_ANGLE_BANK (8 fixed angle templates).
 *   - Each slide line carries per-slide text guidance (word limits:
 *     cover ≤ 12 words, value slides ≤ 50 words, one idea per slide).
 *   - slideCount is validated as an integer in [2, 35]. Requests above 35
 *     are CLAMPED to 35 with an honesty note (TikTok Photo Mode's slide cap
 *     per the platform rule); below 2 is a validation error.
 *   - Deterministic: same topic + count → same plan, always.
 */

/** TikTok Photo Mode slide cap (platform rule, per spec). */
export const MAX_SLIDES = 35;
/** Minimum slides for a meaningful carousel. */
export const MIN_SLIDES = 2;
/** Readability guidance: max words per value slide. */
export const MAX_WORDS_PER_SLIDE = 50;
/** Readability guidance: max words for the cover hook. */
export const MAX_WORDS_COVER = 12;

/** Fixed value-slide angle templates. Bank size: 8. */
export const SLIDE_ANGLE_BANK: string[] = [
  "Mistake to avoid: the most common {topic} error and how to fix it",
  "Quick tip: one {topic} trick that works immediately",
  "Myth vs fact: what people get wrong about {topic}",
  "Step {n}: the next action in your {topic} process",
  "Proof: a {topic} example that shows this works",
  "Warning: what happens when you ignore {topic} basics",
  "Shortcut: the faster way to get {topic} results",
  "Reminder: the {topic} habit worth keeping",
];

const COVER_TEMPLATE = "Cover slide — hook under 12 words about {topic} (e.g. \"{topic} mistakes you're making\")";
const CTA_TEMPLATE = "CTA slide — one call to action: save, follow, share, or comment on {topic}";

export interface CarouselSlide {
  slideNumber: number;
  role: "cover" | "value" | "cta";
  plan: string;
  textGuidance: string;
}

function fill(template: string, topic: string, n: number): string {
  return template.replaceAll("{topic}", topic).replaceAll("{n}", String(n));
}

/** Builds the deterministic slide plan for a topic and slide count. */
export function buildPlan(topic: string, slideCount: number): CarouselSlide[] {
  const slides: CarouselSlide[] = [];
  slides.push({
    slideNumber: 1,
    role: "cover",
    plan: fill(COVER_TEMPLATE, topic, 1),
    textGuidance: `Cover text ≤ ${MAX_WORDS_COVER} words — a hook, not a summary.`,
  });
  for (let i = 2; i < slideCount; i++) {
    const angle = SLIDE_ANGLE_BANK[(i - 2) % SLIDE_ANGLE_BANK.length];
    slides.push({
      slideNumber: i,
      role: "value",
      plan: `Value slide ${i - 1}: ${fill(angle, topic, i - 1)}`,
      textGuidance: `One idea per slide, ≤ ${MAX_WORDS_PER_SLIDE} words. Keep text big and readable on mobile.`,
    });
  }
  slides.push({
    slideNumber: slideCount,
    role: "cta",
    plan: fill(CTA_TEMPLATE, topic, slideCount),
    textGuidance: "One CTA only — save, follow, share, or comment. Short text, high contrast.",
  });
  return slides;
}

export const PLAN_GUIDANCE =
  `Cover ≤ ${MAX_WORDS_COVER} words · value slides ≤ ${MAX_WORDS_PER_SLIDE} words each · ` +
  "one idea per slide · final slide = one clear CTA · pair each slide with a clean photo or graphic.";

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const topicRaw = values["carouselTopic"];
  const countRaw = values["slideCount"];
  if (typeof topicRaw !== "string" || topicRaw.trim().length === 0) {
    return {
      ok: false,
      error: "Please enter your carousel topic first — the plan is built around it.",
    };
  }
  const count = typeof countRaw === "string" ? Number(countRaw) : countRaw;
  if (typeof count !== "number" || !Number.isFinite(count) || !Number.isInteger(count)) {
    return {
      ok: false,
      error: "Slide count must be a whole number.",
    };
  }
  if (count < MIN_SLIDES) {
    return {
      ok: false,
      error: `A carousel needs at least ${MIN_SLIDES} slides — you asked for ${count}.`,
    };
  }
  let slideCount = count;
  let planNote = `Plan for ${slideCount} slides: cover hook, ${slideCount - 2} value slide${slideCount - 2 === 1 ? "" : "s"}, one CTA slide.`;
  if (count > MAX_SLIDES) {
    slideCount = MAX_SLIDES;
    planNote =
      `You asked for ${count} slides — clamped to ${MAX_SLIDES} (TikTok Photo Mode's slide cap, per the platform rule). ` +
      `Plan for ${MAX_SLIDES} slides: cover hook, ${MAX_SLIDES - 2} value slides, one CTA slide.`;
  }
  const topic = topicRaw.trim();
  const slides = buildPlan(topic, slideCount);
  const slidePlan = slides.map(
    (s) => `Slide ${s.slideNumber} (${s.role}): ${s.plan}`
  );
  return {
    ok: true,
    values: {
      slidePlan,
      guidance: PLAN_GUIDANCE,
      planNote,
    },
  };
}
