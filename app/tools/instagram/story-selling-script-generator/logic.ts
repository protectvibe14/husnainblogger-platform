/**
 * Story Selling Script Generator — pure logic (zero imports, zero network, zero DOM).
 *
 * Assembles a 4-part story selling script (hook, story, offer, CTA) plus a
 * 6-slide story breakdown from FIXED sentence banks — no AI, no model output.
 * The user picks the objection their audience has; every line comes from the
 * bank for that objection, with {product} / {price} filled from the inputs.
 *
 * Fixed content banks (documented per the builder honesty contract):
 * - OBJECTIONS: 5 fixed objections (price | trust | timing | need | comparison)
 * - Per objection: 3 hook frames + 3 story frames + 3 offer frames +
 *   3 CTA frames + 1 problem line + 1 reframe line = 14 fixed strings
 * - Total bank: 5 objections x 14 = 70 fixed strings
 * Variant selection is deterministic: variantIndex = product.length % 3
 * (same product + objection -> identical script, always).
 *
 * Slide breakdown: fixed 6-slide structure (Hook, Problem, Story, Offer,
 * Reframe, CTA) with a fixed sticker suggestion per slide. Slide text is
 * hard-capped at 280 characters.
 */

export const OBJECTIONS = ["price", "trust", "timing", "need", "comparison"] as const;
export type Objection = (typeof OBJECTIONS)[number];

export const MAX_PRODUCT_LEN = 60;
export const MAX_PRICE_LEN = 30;
export const MAX_SLIDE_CHARS = 280;
const VARIANTS = 3;

interface ObjectionFrames {
  hooks: string[];
  stories: string[];
  offers: string[];
  ctas: string[];
  problem: string;
  reframe: string;
}

/** 5 objections x 14 fixed strings = 70. */
const FRAMES: Record<Objection, ObjectionFrames> = {
  price: {
    hooks: [
      "Stop scrolling if {product} feels out of your budget — this story changes that.",
      "Think {product} is too expensive? Give me 60 seconds.",
      "If the price of {product} made you pause, watch this first.",
    ],
    problem: "You want the result, but the price tag keeps stopping you.",
    stories: [
      "I used to think {product} was a luxury too — until I added up what I was spending on the alternative.",
      "A follower told me {product} was too pricey. Three weeks later she messaged me saying it paid for itself.",
      "Here is what nobody tells you about {product}: the cost of doing nothing is higher.",
    ],
    offers: [
      "Get {product}{pricePart} — and here is exactly what is included.",
      "This is {product}{pricePart} with everything included, no upsells.",
      "Today you can start {product}{pricePart} — I will walk you through it.",
    ],
    reframe: "Break it down: it costs less than your weekly coffee run, for something that actually lasts.",
    ctas: [
      'Reply "YES" and I will send you the link.',
      "Tap the link sticker to grab {product} before tonight.",
      'DM me "PRICE" and I will break down the payment options.',
    ],
  },
  trust: {
    hooks: [
      "Skeptical about {product}? Good — you should be. Here is my honest story.",
      "Is {product} legit or just hype? Let me show you.",
      "I did not trust {product} at first either. Then this happened.",
    ],
    problem: "You have been burned before, so trusting a new product feels risky.",
    stories: [
      "I researched {product} for a month before trying it — here is what convinced me.",
      "I asked real users of {product} before I recommended it. Their answers surprised me.",
      "I tested {product} myself for 30 days so you do not have to take my word for it.",
    ],
    offers: [
      "Try {product}{pricePart} — and judge it for yourself.",
      "Get {product}{pricePart} with my personal walkthrough included.",
      "Here is {product}{pricePart} — I will answer every question before you decide.",
    ],
    reframe: "You do not have to trust me — trust the process I am about to show you.",
    ctas: [
      'Reply "PROOF" and I will send you real results.',
      'DM me your doubts about {product} — I answer everything.',
      "Tap the question sticker and ask me anything about {product}.",
    ],
  },
  timing: {
    hooks: [
      "Not the right time for {product}? That is exactly why you should watch this.",
      'Waiting for the "perfect moment" to try {product}? Read this.',
      "If {product} is on your someday list, this story is for you.",
    ],
    problem: "Life is busy, and starting something new never feels like the right time.",
    stories: [
      "I waited 6 months to start with {product} — I wish I had started on day one.",
      "{product} takes less time than your morning scroll. Here is my 10-minute routine.",
      "The busiest people I know use {product} — because it saves them time.",
    ],
    offers: [
      "Start {product}{pricePart} — with just 10 minutes a day.",
      "Get {product}{pricePart} and go entirely at your own pace.",
      "Begin {product}{pricePart} today; the first step takes five minutes.",
    ],
    reframe: 'There is no perfect time — but 10 minutes today beats "someday".',
    ctas: [
      'Reply "START" and I will send the 5-minute quick start.',
      "Tap the link to begin {product} — future you says thanks.",
      'DM me "TIME" and I will show you the 10-minute version.',
    ],
  },
  need: {
    hooks: [
      "Do you actually need {product}? Let me help you decide honestly.",
      "Not sure {product} is for you? Take 60 seconds with me.",
      "If you are on the fence about {product}, this story settles it.",
    ],
    problem: "You are not sure {product} solves a problem you actually have.",
    stories: [
      "I thought I did not need {product} either — then I noticed this pattern in my week.",
      "Ask yourself: does this happen to you? If yes, {product} is for you.",
      "Here is the one sign you actually need {product} — I missed it for months.",
    ],
    offers: [
      "{product}{pricePart} — built exactly for this situation.",
      "Get {product}{pricePart} if any of that sounded familiar.",
      "Try {product}{pricePart} — made for people in your exact spot.",
    ],
    reframe: 'If even one of those signs fits, it is not a "want" — it is a need you have been ignoring.',
    ctas: [
      'Reply "ME" if that sounds like you — I will send the details.',
      "Vote in the poll: is this your situation too?",
      'DM me "FIT" and I will tell you honestly if it is right for you.',
    ],
  },
  comparison: {
    hooks: [
      "{product} vs the competitors — the honest breakdown, no sponsor talk.",
      "Wondering how {product} compares? I tested them side by side.",
      "Everyone asks me: {product} or the alternative? Here is my answer.",
    ],
    problem: "Too many options, and every brand claims to be the best.",
    stories: [
      "I compared {product} with 3 alternatives — here is what actually mattered.",
      "The competitor looks cheaper until you see what is missing. Let me show you.",
      "I switched to {product} after using the alternative for a year. Night and day.",
    ],
    offers: [
      "{product}{pricePart} — here is why it wins on what matters.",
      "Get {product}{pricePart} with the feature the others skip.",
      "Choose {product}{pricePart} — I will show you the side-by-side.",
    ],
    reframe: "Cheaper is not better when it misses the one thing that matters.",
    ctas: [
      'Reply "VS" and I will send my full comparison.',
      "Tap the poll: which one would you pick after this?",
      'DM me "COMPARE" for the honest side-by-side breakdown.',
    ],
  },
};

const SLIDES: { label: string; sticker: string }[] = [
  { label: "Hook", sticker: "none — let the hook breathe" },
  { label: "Problem", sticker: "Poll: Does this sound like you? Yes / 100%" },
  { label: "Story", sticker: "none — story carries it" },
  { label: "Offer", sticker: "Link sticker to your offer page" },
  { label: "Objection reframe", sticker: "Question box: ask me anything" },
  { label: "Call to action", sticker: "Countdown sticker for urgency" },
];

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function isObjection(value: unknown): value is Objection {
  return typeof value === "string" && (OBJECTIONS as readonly string[]).includes(value);
}

function fill(template: string, product: string, pricePart: string): string {
  return template.split("{product}").join(product).split("{pricePart}").join(pricePart);
}

function cap(text: string): string {
  return text.length > MAX_SLIDE_CHARS ? text.slice(0, MAX_SLIDE_CHARS - 1) + "…" : text;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const productRaw = values["product"];
  const priceRaw = values["price"];
  const objectionRaw = values["objection"];

  const product = typeof productRaw === "string" ? productRaw.trim() : "";
  if (!product) {
    return { ok: false, error: "Please enter your product name." };
  }
  if (product.length > MAX_PRODUCT_LEN) {
    return { ok: false, error: `Product name is too long (max ${MAX_PRODUCT_LEN} characters).` };
  }

  const price = typeof priceRaw === "string" ? priceRaw.trim() : "";
  if (price.length > MAX_PRICE_LEN) {
    return { ok: false, error: `Price is too long (max ${MAX_PRICE_LEN} characters).` };
  }

  const objection: Objection = isObjection(objectionRaw) ? objectionRaw : "price";
  const frames = FRAMES[objection];
  const variant = product.length % VARIANTS; // deterministic pick, 0..2
  const pricePart = price ? ` for just ${price}` : "";

  const hook = fill(frames.hooks[variant], product, pricePart);
  const story = fill(frames.stories[variant], product, pricePart);
  const offer = fill(frames.offers[variant], product, pricePart);
  const cta = fill(frames.ctas[variant], product, pricePart);
  const problem = fill(frames.problem, product, pricePart);
  const reframe = fill(frames.reframe, product, pricePart);

  const slideTexts = [hook, problem, story, offer, reframe, cta];
  const slideBreakdown = SLIDES.map((s, i) =>
    cap(`Slide ${i + 1}/6 — ${s.label}: ${slideTexts[i]} (Sticker: ${s.sticker})`),
  );

  return {
    ok: true,
    values: {
      scriptHook: hook,
      scriptStory: story,
      scriptOffer: offer,
      scriptCta: cta,
      slideBreakdown,
    },
  };
}
