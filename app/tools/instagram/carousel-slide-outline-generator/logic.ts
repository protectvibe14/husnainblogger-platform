/**
 * Carousel Slide Outline Generator — pure logic (tool-210), zero imports,
 * zero network, zero DOM, no Math.random.
 *
 * TEMPLATE BANK, NOT AI: outlines are assembled from a fixed bank of 76
 * hand-written slide templates — per goal: 3 hook + 10 value + 3 proof +
 * 3 CTA formulas (19 × 4 goals). Selection is deterministic: a string hash
 * of the topic picks the hook/proof/CTA and the start offset for the value
 * slides, which then cycle in bank order (no repeats).
 *
 * Placeholders: {topic} = user's trimmed topic, {n} = total slide count,
 * {i} = 1-based index of the value slide within the outline.
 *
 * Structure: slide 1 = hook, last slide = CTA. With 4+ slides the
 * second-to-last slide is a proof slide; with exactly 3 slides it is
 * hook → value → CTA (no proof room).
 *
 * Slide-count rule (spec): 3–10. Requests above 10 are clamped to 10 with a
 * note (spec edge case: "slideCount > 20 requested -> clamp with note");
 * below 3 is an error.
 */

export type CarouselGoal = "educate" | "sell" | "grow" | "engage";

/** The four supported goals, in canonical order. */
export const CAROUSEL_GOALS: CarouselGoal[] = ["educate", "sell", "grow", "engage"];

export type SlideRole = "hook" | "value" | "proof" | "cta";

export const MIN_SLIDES = 3;
export const MAX_SLIDES = 10;

interface GoalBank {
  hook: string[];
  value: string[];
  proof: string[];
  cta: string[];
}

const GOAL_BANK: Record<CarouselGoal, GoalBank> = {
  educate: {
    hook: [
      "How to {topic} — the complete breakdown",
      "{topic} explained in {n} slides",
      "Everything about {topic}, simplified",
    ],
    value: [
      "Start with the basics: what {topic} really means",
      "Point {i}: the core principle behind {topic}",
      "Point {i}: a {topic} example you can copy",
      "Point {i}: the {topic} mistake that slows beginners",
      "Point {i}: how to practice {topic} today",
      "Point {i}: the {topic} shortcut most people miss",
      "Point {i}: what good {topic} looks like vs bad",
      "Point {i}: a simple {topic} checklist",
      "Point {i}: the {topic} rule of thumb to remember",
      "Point {i}: your next step with {topic}",
    ],
    proof: [
      "Proof: learners who follow these {topic} steps progress faster",
      "Real example: one {topic} win from our community",
      "Why this {topic} method works — the reasoning",
    ],
    cta: [
      "Save this post — your {topic} cheat sheet",
      "Follow for more {topic} breakdowns",
      "Comment '{topic}' and I'll send my starter guide",
    ],
  },
  sell: {
    hook: [
      "Why {topic} pays for itself",
      "The {topic} offer in {n} slides",
      "Stop overpaying for {topic}",
    ],
    value: [
      "Point {i}: the problem {topic} solves",
      "Point {i}: what {topic} includes",
      "Point {i}: who {topic} is for",
      "Point {i}: the {topic} result you get",
      "Point {i}: how {topic} compares to doing nothing",
      "Point {i}: the {topic} guarantee",
      "Point {i}: a common {topic} objection — answered",
      "Point {i}: the {topic} bonus inside",
      "Point {i}: {topic} pricing, made simple",
      "Point {i}: what happens after you get {topic}",
    ],
    proof: [
      "Result: a customer who switched to {topic}",
      "Before-and-after: the {topic} difference",
      "What buyers say about {topic}",
    ],
    cta: [
      "Tap the link in bio to get {topic}",
      "DM '{topic}' to start today",
      "Limited spots: claim your {topic} now",
    ],
  },
  grow: {
    hook: [
      "{n} {topic} ideas worth stealing",
      "The {topic} list everyone saves",
      "I wish I knew these {topic} tips sooner",
    ],
    value: [
      "Tip {i}: a {topic} idea you can try today",
      "Tip {i}: the {topic} habit that compounds",
      "Tip {i}: my favorite {topic} shortcut",
      "Tip {i}: a {topic} resource worth bookmarking",
      "Tip {i}: the {topic} move most people skip",
      "Tip {i}: a {topic} example to copy",
      "Tip {i}: the {topic} upgrade with the biggest payoff",
      "Tip {i}: one {topic} thing to stop doing",
      "Tip {i}: the {topic} trend to watch",
      "Tip {i}: a {topic} win you can get this week",
    ],
    proof: [
      "These {topic} tips built this account — save them",
      "Follower favorite: the {topic} post everyone shared",
      "Why savers share {topic} posts like this",
    ],
    cta: [
      "Follow for daily {topic} ideas",
      "Save this and share it with a {topic} friend",
      "Comment your {topic} goal — I'll reply with a tip",
    ],
  },
  engage: {
    hook: [
      "Let's talk about {topic}",
      "Your {topic} opinion matters",
      "{n} {topic} questions for you",
    ],
    value: [
      "Question {i}: what's your biggest {topic} struggle?",
      "Question {i}: hot take — is {topic} overrated?",
      "Question {i}: {topic} this way, or that way?",
      "Question {i}: your best {topic} win so far?",
      "Question {i}: what should I cover about {topic} next?",
      "Question {i}: {topic} — team yes or team no?",
      "Question {i}: the {topic} advice you disagree with?",
      "Question {i}: rate your {topic} skills 1–10",
      "Question {i}: which {topic} myth should I bust?",
      "Question {i}: tag someone who needs {topic}",
    ],
    proof: [
      "Our last {topic} question sparked a huge thread — your turn",
      "Top {topic} answers from our last post, summarized",
      "This {topic} debate keeps coming back",
    ],
    cta: [
      "Drop your answer in the comments",
      "Share this with someone who has a {topic} take",
      "Follow so you don't miss the {topic} results post",
    ],
  },
};

/** Design guidance per slide role, cycled deterministically by slide index. */
const VISUAL_NOTES: Record<SlideRole, string[]> = {
  hook: [
    "Big bold headline, one idea, high contrast — must stop the scroll.",
    "Cover-style slide: 5–8 words max, brand color background.",
  ],
  value: [
    "One idea per slide, short lines, generous whitespace.",
    "Number the point, pair it with one simple visual.",
  ],
  proof: [
    "Screenshot or quote layout — let the evidence breathe.",
    "Keep it short: claim on top, proof below, one visual.",
  ],
  cta: [
    "Clear call-to-action: save, share, comment or follow.",
    "End frame: one action only, arrow or button visual.",
  ],
};

/** Documented bank sizes. */
export const BANK_SIZES = {
  goals: CAROUSEL_GOALS.length,
  hookPerGoal: 3,
  valuePerGoal: 10,
  proofPerGoal: 3,
  ctaPerGoal: 3,
  perGoal: 19,
  total: 76,
};

export interface OutlineSlide {
  slide: number;
  role: SlideRole;
  text: string;
  visualNote: string;
}

export interface SlideOutlineResult {
  topic: string;
  goal: CarouselGoal;
  slideCount: number;
  clamped: boolean;
  requestedCount: number;
  slides: OutlineSlide[];
  copyAll: string;
  isTemplateBased: true;
}

/** Deterministic FNV-1a 32-bit hash (no Math.random anywhere). */
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function isCarouselGoal(s: string): s is CarouselGoal {
  return (CAROUSEL_GOALS as string[]).includes(s);
}

function toSlideCount(value: unknown): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value.trim()) : NaN;
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function fill(template: string, topic: string, n: number, i: number): string {
  return template.replaceAll("{topic}", topic).replaceAll("{n}", String(n)).replaceAll("{i}", String(i));
}

export function generateOutline(topicRaw: string, goal: CarouselGoal, requested: number): SlideOutlineResult {
  const topic = topicRaw.trim().replace(/\s+/g, " ");
  const clamped = requested > MAX_SLIDES;
  const slideCount = clamped ? MAX_SLIDES : requested;
  const bank = GOAL_BANK[goal];
  const h = hashString(topic.toLowerCase() + "|" + goal);

  const roles: SlideRole[] = [];
  for (let s = 1; s <= slideCount; s++) {
    if (s === 1) roles.push("hook");
    else if (s === slideCount) roles.push("cta");
    else if (slideCount >= 4 && s === slideCount - 1) roles.push("proof");
    else roles.push("value");
  }

  const valueOffset = h % bank.value.length;
  let valueIndex = 0;
  const slides: OutlineSlide[] = roles.map((role, idx) => {
    const slide = idx + 1;
    let text: string;
    if (role === "hook") {
      text = fill(bank.hook[h % bank.hook.length], topic, slideCount, 0);
    } else if (role === "cta") {
      text = fill(bank.cta[(h >>> 4) % bank.cta.length], topic, slideCount, 0);
    } else if (role === "proof") {
      text = fill(bank.proof[(h >>> 8) % bank.proof.length], topic, slideCount, 0);
    } else {
      valueIndex++;
      text = fill(bank.value[(valueOffset + valueIndex - 1) % bank.value.length], topic, slideCount, valueIndex);
    }
    const notes = VISUAL_NOTES[role];
    return { slide, role, text, visualNote: notes[(h + slide) % notes.length] };
  });

  const lines = [
    `Carousel outline: "${topic}" — ${slideCount} slides, goal: ${goal}`,
    "",
    ...slides.flatMap((s) => [
      `Slide ${s.slide} — ${s.role.toUpperCase()}`,
      s.text,
      `Visual: ${s.visualNote}`,
      "",
    ]),
    "Built from a fixed bank of 76 hand-written slide templates (19 per goal) — not AI-generated. Adapt wording, examples and CTAs to your voice.",
  ];
  if (clamped) {
    lines.push(`Note: requested ${requested} slides — clamped to ${MAX_SLIDES} with this note (Instagram readability range is 3–10).`);
  }
  return {
    topic,
    goal,
    slideCount,
    clamped,
    requestedCount: requested,
    slides,
    copyAll: lines.join("\n"),
    isTemplateBased: true,
  };
}

/** Template entry point. values: topic (text), slideCount (number), goal (select). */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const topicRaw = values.topic;
  if (typeof topicRaw !== "string" || topicRaw.trim() === "") {
    return { ok: false, error: "Topic is required — what is the carousel about? (e.g. \"email marketing\")." };
  }
  const goalRaw = values.goal;
  const goal: string =
    goalRaw === undefined || goalRaw === null || String(goalRaw).trim() === ""
      ? "educate"
      : String(goalRaw).trim().toLowerCase();
  if (!isCarouselGoal(goal)) {
    return { ok: false, error: `Goal "${String(goalRaw)}" is not supported — pick one: ${CAROUSEL_GOALS.join(", ")}.` };
  }
  const requested = toSlideCount(values.slideCount);
  if (requested === null || requested < MIN_SLIDES) {
    return { ok: false, error: `Slide count must be a whole number of at least ${MIN_SLIDES}.` };
  }
  const result = generateOutline(topicRaw, goal, requested);
  return {
    ok: true,
    values: {
      outline: {
        columns: ["Slide", "Role", "Text", "Visual note"],
        rows: result.slides.map((s) => [String(s.slide), s.role, s.text, s.visualNote]),
      },
      copyAll: result.copyAll,
    },
  };
}
