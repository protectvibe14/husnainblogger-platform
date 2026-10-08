/**
 * TikTok Carousel Text Writer — pure logic (tool-180).
 * Zero imports, zero network, zero DOM, zero randomness.
 *
 * TEMPLATE ENGINE (fixed text templates, fully client-side — NOT AI):
 *   - HOOK_BANK: 10 fixed cover-hook templates.
 *   - VALUE_BANK: 12 fixed value-line templates.
 *   - CTA_BANK: 5 fixed call-to-action templates.
 *   - Selection is DETERMINISTIC: a djb2 hash of the topic picks the
 *     starting offsets; value slides cycle through the bank. Same
 *     inputs always produce the same slide text.
 *   - Slide 1 is the cover hook, the last slide is the CTA, middle
 *     slides are value lines. Every line stays well under the 50-word
 *     per-slide readability guidance (templates are all short).
 *   - slideCount is validated as an integer in [2, 35]; requests above
 *     35 are CLAMPED to 35 with an honesty note (TikTok Photo Mode's
 *     slide cap, per the platform rule).
 */

/** TikTok Photo Mode slide cap (platform rule, per spec). */
export const MAX_SLIDES = 35;
/** Minimum slides for a meaningful carousel. */
export const MIN_SLIDES = 2;
/** Readability guidance: max words per slide. */
export const MAX_WORDS_PER_SLIDE = 50;

/** Fixed cover-hook templates. Bank size: 10. */
export const HOOK_BANK: string[] = [
  "Stop scrolling: {topic}",
  "POV: you finally get {topic} right",
  "{topic} mistakes you're probably making",
  "I wish I knew this about {topic} sooner",
  "The {topic} cheat sheet (save this)",
  "Nobody talks about this {topic} trick",
  "{topic} in a few slides — save this",
  "Read this if {topic} confuses you",
  "The {topic} glow-up starts here",
  "Rating popular {topic} advice",
];

/** Fixed value-line templates. Bank size: 12. */
export const VALUE_BANK: string[] = [
  "Start with the basics: {topic} works best when you keep it simple.",
  "Most people skip this step in {topic} — don't be most people.",
  "The biggest {topic} myth: more effort always wins. It doesn't.",
  "Step {n}: do this one thing today and {topic} gets easier.",
  "This {topic} example proves small steps compound fast.",
  "Warning: ignoring {topic} basics costs you later.",
  "The shortcut: master one {topic} skill before adding more.",
  "Reminder: consistency beats intensity in {topic}.",
  "What changed everything for my {topic}: one weekly review.",
  "The 80/20 of {topic}: focus on the few things that matter.",
  "Common {topic} trap: comparing your start to someone's middle.",
  "Quick win: apply {topic} tip #{n} before you sleep tonight.",
];

/** Fixed CTA templates. Bank size: 5. */
export const CTA_BANK: string[] = [
  "Save this post for later",
  "Follow for more {topic} tips",
  "Share with someone learning {topic}",
  "Comment your {topic} question below",
  "Try this {topic} tip today and report back",
];

/** Deterministic djb2 hash — picks bank offsets, never Math.random. */
export function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function fill(template: string, topic: string, n: number): string {
  return template.replaceAll("{topic}", topic).replaceAll("{n}", String(n));
}

function wordCount(s: string): number {
  return s.split(/\s+/).filter((w) => w.length > 0).length;
}

/** Writes the per-slide text lines deterministically. */
export function writeSlides(topic: string, slideCount: number): string[] {
  const seed = hashString(topic.toLowerCase());
  const slides: string[] = [];
  slides.push(
    `Slide 1 (cover): ${fill(HOOK_BANK[seed % HOOK_BANK.length], topic, 1)}`
  );
  for (let i = 2; i < slideCount; i++) {
    const value = fill(
      VALUE_BANK[(seed + i - 2) % VALUE_BANK.length],
      topic,
      i - 1
    );
    slides.push(`Slide ${i}: ${value}`);
  }
  slides.push(
    `Slide ${slideCount} (CTA): ${fill(CTA_BANK[seed % CTA_BANK.length], topic, slideCount)}`
  );
  return slides;
}

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
      error: "Please enter your carousel topic first — the text is written around it.",
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
  let note = `Wrote ${slideCount} slides: hook cover, ${slideCount - 2} value line${slideCount - 2 === 1 ? "" : "s"}, one CTA. Every line is under ${MAX_WORDS_PER_SLIDE} words.`;
  if (count > MAX_SLIDES) {
    slideCount = MAX_SLIDES;
    note =
      `You asked for ${count} slides — clamped to ${MAX_SLIDES} (TikTok Photo Mode's slide cap, per the platform rule). ` +
      `Wrote ${MAX_SLIDES} slides: hook cover, ${MAX_SLIDES - 2} value lines, one CTA. Every line is under ${MAX_WORDS_PER_SLIDE} words.`;
  }
  const topic = topicRaw.trim();
  const slides = writeSlides(topic, slideCount);
  return {
    ok: true,
    values: {
      slides,
      note,
    },
  };
}
