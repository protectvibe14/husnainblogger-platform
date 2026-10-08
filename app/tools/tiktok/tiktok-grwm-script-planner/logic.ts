/**
 * TikTok GRWM Script Planner (tool-166) — pure template planner.
 *
 * Honesty: this is NOT AI. It assembles a GRWM ("get ready with me") video
 * plan from FIXED template banks, picking entries deterministically from the
 * user's inputs. It cannot watch videos, read live TikTok data, or write in
 * the creator's voice. Output is a starting outline to personalize.
 *
 * Fixed banks (sizes documented for QA):
 * - HOOKS: 8 opening hook lines
 * - CTAS: 8 closing CTA lines
 * - SKINCARE_STEPS: 10 step templates { action, talk }
 * - FASHION_STEPS: 10 step templates { action, talk }
 * - GENERIC_STEPS: 10 step templates { action, talk }
 * - PRODUCT_SLOTS: 6 product-mention line templates
 *
 * Branching: the "Skincare" niche uses SKINCARE_STEPS, the "Fashion / Outfits"
 * niche uses FASHION_STEPS; every other niche uses GENERIC_STEPS.
 *
 * Zero imports, zero network, zero DOM, no randomness. Same inputs always
 * produce the same plan (djb2 hash seed).
 */

export type GrwmResult =
  | { ok: true; values: Record<string, string | string[]> }
  | { ok: false; error: string };

export const NICHE_OPTIONS: string[] = [
  "Skincare",
  "Makeup / Beauty",
  "Fashion / Outfits",
  "Hair",
  "Fragrance",
  "Lifestyle / Other",
];

/** Template branch picked from the niche select. */
export type GrwmBranch = "Skincare" | "Fashion / Outfits" | "General";

const HOOKS: string[] = [
  'GRWM for {topic} — and I am NOT skipping any steps today.',
  'Come get ready with me for {topic}, because this one is important.',
  'GRWM: {topic} edition. Grab your products, let us do this together.',
  'Getting ready for {topic} — here is my full routine, unfiltered.',
  'POV: you have {topic} and you need to look put-together fast. GRWM.',
  'GRWM for {topic} — rating every product as I go.',
  'Realistic GRWM for {topic}: no filters, no reshoots.',
  'GRWM time: {topic}. Let me show you exactly what I use.',
];

const CTAS: string[] = [
  "Final look is done — comment which step you want a full tutorial on.",
  "And that is the finished look. Follow for part 2 with the full routine.",
  "Done! Save this video and try it for your own {topic}.",
  "That is everything for {topic}. What should I get ready for next?",
  "Finished! Drop a comment if you want links to everything I used.",
  "Look complete — duet this with your version of {topic}.",
  "And we are ready. Like if you want a slower, detailed version.",
  "All set for {topic}! Share this with someone who needs the routine.",
];

interface StepTemplate {
  action: string;
  talk: string;
}

const SKINCARE_STEPS: StepTemplate[] = [
  { action: "Start with a clean, dry face", talk: "Explain why you cleanse first and how your skin feels today." },
  { action: "Apply toner or essence", talk: "Pat it in on camera and describe the texture and absorption." },
  { action: "Apply your serum", talk: "Name the key ingredient and what it is supposed to do for {topic}." },
  { action: "Add eye cream", talk: "Tap gently with your ring finger and mention how much product you use." },
  { action: "Layer on moisturizer", talk: "Show the amount and explain how you adjust for day vs night." },
  { action: "Apply SPF (daytime) or night cream", talk: "Stress that this step is non-negotiable and why." },
  { action: "Do a mid-routine skin check", talk: "Turn to the light and give an honest first impression." },
  { action: "Apply lip treatment", talk: "Quick extra step — mention scent, texture, or finish." },
  { action: "Mist or set the routine", talk: "Finish with a facial mist and explain the order of layers." },
  { action: "Final skin reveal", talk: "Show the glow up close and rate the routine out of 10." },
];

const FASHION_STEPS: StepTemplate[] = [
  { action: "Show the outfit laid out flat", talk: "Name each piece and where it is from while pointing at it." },
  { action: "Try on the base layer", talk: "Comment on fit, fabric feel, and sizing honestly." },
  { action: "Add the statement piece", talk: "Explain why this piece makes the outfit work for {topic}." },
  { action: "Style the bottom half", talk: "Talk through the silhouette — tucked, oversized, or fitted." },
  { action: "Add shoes", talk: "Show comfort level and whether you can actually walk in them." },
  { action: "Layer accessories", talk: "Add jewelry or a belt and explain the finishing touch." },
  { action: "Do the mirror check", talk: "Full-body turn — point out what you love and what you would change." },
  { action: "Show the bag and extras", talk: "Pack on camera and mention what fits inside." },
  { action: "Rate the outfit", talk: "Give it a score out of 10 and say where you would wear it." },
  { action: "Final fit check in natural light", talk: "Step to a window — colors look different, show the real thing." },
];

const GENERIC_STEPS: StepTemplate[] = [
  { action: "Introduce the plan for {topic}", talk: "Tell viewers what you are getting ready for and the vibe." },
  { action: "Show everything you will use", talk: "Lay out products or items and give a quick preview." },
  { action: "Start step one on camera", talk: "Narrate what you are doing and why, in real time." },
  { action: "Talk through your choices", talk: "Explain why you picked this product or item over others." },
  { action: "Show a close-up mid-process", talk: "Zoom in and give an honest check-in on how it is going." },
  { action: "Add the finishing details", talk: "Small extras that elevate the result — name each one." },
  { action: "Handle something unexpected", talk: "Keep it real: fix a mistake on camera, viewers love this." },
  { action: "Do a progress check", talk: "Compare to the start and hype up the transformation." },
  { action: "Final reveal", talk: "Full reveal with good lighting — pause and let viewers take it in." },
  { action: "Recap your favorites", talk: "Name the one product or step that made the biggest difference." },
];

const PRODUCT_SLOTS: string[] = [
  "Hold the product up to the camera and say its name clearly before using it.",
  "Mention the product name again while applying — viewers join mid-video.",
  "Give a one-line honest review of the product right after this step.",
  "Show the packaging close-up so viewers can screenshot the name.",
  "Say where you got the product (store, brand site) without a hard sell.",
  "Compare it to a product you used before so viewers get context.",
];

/** Deterministic 32-bit hash of a string (djb2). */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pick<T>(bank: T[], seed: number, offset: number): T {
  return bank[(seed + offset) % bank.length];
}

function branchForNiche(niche: string): GrwmBranch {
  if (niche === "Skincare") return "Skincare";
  if (niche === "Fashion / Outfits") return "Fashion / Outfits";
  return "General";
}

function bankForBranch(branch: GrwmBranch): StepTemplate[] {
  if (branch === "Skincare") return SKINCARE_STEPS;
  if (branch === "Fashion / Outfits") return FASHION_STEPS;
  return GENERIC_STEPS;
}

function fill(template: string, topic: string): string {
  return template.split("{topic}").join(topic);
}

function coerceStepCount(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isInteger(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "" && Number.isInteger(Number(raw))) {
    return Number(raw);
  }
  return null;
}

export function runTool(values: Record<string, unknown>): GrwmResult {
  const topicRaw = values.grwmTopic;
  if (typeof topicRaw !== "string" || topicRaw.trim().length === 0) {
    return { ok: false, error: "Enter a GRWM topic (e.g. '5-minute work makeup')." };
  }
  const topic = topicRaw.trim();
  if (topic.length > 200) {
    return { ok: false, error: "GRWM topic must be 200 characters or fewer." };
  }

  const nicheRaw = values.niche;
  if (typeof nicheRaw !== "string" || nicheRaw.trim().length === 0) {
    return { ok: false, error: "Pick a niche so the right template branch loads." };
  }
  if (!NICHE_OPTIONS.includes(nicheRaw)) {
    return { ok: false, error: "Pick a niche from the list." };
  }
  const niche = nicheRaw;

  const stepCount = coerceStepCount(values.stepCount);
  if (stepCount === null) {
    return { ok: false, error: "Step count must be a whole number." };
  }
  if (stepCount < 3 || stepCount > 10) {
    return { ok: false, error: "Step count must be between 3 and 10." };
  }

  const branch = branchForNiche(niche);
  const bank = bankForBranch(branch);
  const seed = hashString(`${topic}|${niche}|${stepCount}`);

  const steps: string[] = [];
  const productSlots: string[] = [];
  const stepOffset = seed % bank.length;
  const slotOffset = (seed >>> 4) % PRODUCT_SLOTS.length;
  for (let i = 0; i < stepCount; i++) {
    const t = bank[(stepOffset + i) % bank.length];
    steps.push(`Step ${i + 1}: ${fill(t.action, topic)} — Talking point: ${fill(t.talk, topic)}`);
    productSlots.push(`Step ${i + 1} product slot: ${pick(PRODUCT_SLOTS, slotOffset, i)}`);
  }

  return {
    ok: true,
    values: {
      hook: fill(pick(HOOKS, seed, 0), topic),
      branch,
      steps,
      productSlots,
      cta: fill(pick(CTAS, seed >>> 3, 0), topic),
    },
  };
}
