/**
 * Welcome DM Template Generator — pure logic (zero imports, zero network, zero DOM).
 *
 * Assembles welcome DM templates from FIXED word banks — no AI, no generation
 * from a model. Every template is a hand-written string with {brand}, {offer},
 * and {name} placeholders; runTool fills {brand}/{offer} from the inputs and
 * leaves {name} as a personalization slot for the user to fill per follower.
 *
 * Fixed content banks (documented per the builder honesty contract):
 * - TONES: 4 fixed tones (friendly | professional | playful | bold)
 * - DM_TEMPLATES: 4 tones x 5 hand-written templates = 20 fixed templates
 * - PERSONALIZATION_SLOTS: 3 fixed slot descriptions
 * Template selection is deterministic: count N returns the first N templates
 * of the chosen tone (no random pick, no shuffle).
 *
 * DM length guard: every output DM is capped at 1,000 characters
 * (Instagram's DM character limit) — current banks are all under 400 chars.
 */

export const TONES = ["friendly", "professional", "playful", "bold"] as const;
export type Tone = (typeof TONES)[number];

export const MIN_COUNT = 1;
export const MAX_COUNT = 5;
export const DEFAULT_COUNT = 3;
export const MAX_DM_CHARS = 1000;
export const MAX_BRAND_LEN = 60;
export const MAX_OFFER_LEN = 140;

/** 4 tones x 5 fixed templates = 20. */
const DM_TEMPLATES: Record<Tone, string[]> = {
  friendly: [
    'Hey {name}! Thanks for following {brand} — you are officially in the club. Quick intro: we help people with {offer}. Want the details? Just reply "info" and I will send them over. 🎉',
    'Hi {name}! Saw you followed {brand} — welcome aboard. If you are curious about {offer}, I put together a quick-start guide. Reply "guide" and I will DM it to you!',
    'Welcome to {brand}, {name}! 🎉 Most new followers come here for {offer}. Tell me — what is the #1 thing you are trying to figure out right now?',
    'Hey {name}, thanks for the follow! At {brand}, everything revolves around {offer}. Reply with your biggest question and I will point you to the right resource.',
    'Hi {name}, and welcome! 👋 {brand} is all about {offer}. New here? Start with our pinned post — or just say hi and tell me what brought you here.',
  ],
  professional: [
    'Hello {name}, thank you for following {brand}. We specialize in {offer}. If you would like a brief overview, reply "overview" and I will share it.',
    'Welcome, {name}. You have joined the {brand} community, where we focus on {offer}. Feel free to message me with any questions.',
    'Hi {name}, I appreciate the follow. {brand} exists to help with {offer}. Would a short intro call or a resource be useful? Let me know.',
    '{name}, welcome to {brand}. Our core focus is {offer}. Reply "start" and I will send you the best place to begin.',
    'Thank you for connecting, {name}. At {brand}, we help our followers with {offer}. Do not hesitate to reach out if I can help.',
  ],
  playful: [
    'Plot twist: you followed {brand} and now {name} gets the VIP treatment 🎬 We do {offer} — want the grand tour? Reply "tour"!',
    '{name} just unlocked the {brand} starter pack 🎮 Inside: all things {offer}. Reply "open" to unbox it.',
    'Warning: following {brand} may cause sudden clarity about {offer} 😄 Welcome, {name}! Reply with an emoji describing your mood today.',
    'New follower alert! 🚨 {name} has entered the {brand} zone, home of {offer}. First mission: reply "go" and I will send your starter guide.',
    'Hey {name}, welcome to the {brand} party 🎉 Dress code: curiosity. Main event: {offer}. Reply "party" for your welcome gift.',
  ],
  bold: [
    '{name}, you followed {brand} — smart move. We do {offer}, and we do it better than anyone. Reply "proof" and I will show you.',
    'Welcome to {brand}, {name}. No fluff here: {offer}, done right. Ready? Reply "start".',
    'Hey {name}. You want {offer}? You are in the right place — that is literally all {brand} does. Reply "how" for the details.',
    '{name}, most people follow and lurk. The smart ones reply. {brand} = {offer}. Reply "in" and let us get you sorted.',
    'Welcome aboard, {name}. {brand} does not do boring — we deliver {offer} that actually works. Reply "show me" for the receipts.',
  ],
};

/** 3 fixed slot descriptions. */
const PERSONALIZATION_SLOTS: string[] = [
  "{name} — the follower's first name. Fill this in manually for each DM you send.",
  "{brand} — filled automatically from the brand name you entered above.",
  "{offer} — filled automatically from the offer you entered above.",
];

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function isTone(value: unknown): value is Tone {
  return typeof value === "string" && (TONES as readonly string[]).includes(value);
}

function fillTemplate(template: string, brand: string, offer: string): string {
  return template.split("{brand}").join(brand).split("{offer}").join(offer);
}

export function runTool(values: Record<string, unknown>): RunResult {
  const brandRaw = values["brandName"];
  const offerRaw = values["offer"];
  const toneRaw = values["tone"];
  const countRaw = values["count"];

  const brand = typeof brandRaw === "string" ? brandRaw.trim() : "";
  const offer = typeof offerRaw === "string" ? offerRaw.trim() : "";

  if (!brand) {
    return { ok: false, error: "Please enter your brand name." };
  }
  if (brand.length > MAX_BRAND_LEN) {
    return { ok: false, error: `Brand name is too long (max ${MAX_BRAND_LEN} characters).` };
  }
  if (!offer) {
    return { ok: false, error: "Please describe your offer." };
  }
  if (offer.length > MAX_OFFER_LEN) {
    return { ok: false, error: `Offer is too long (max ${MAX_OFFER_LEN} characters).` };
  }

  const tone: Tone = isTone(toneRaw) ? toneRaw : "friendly";

  let count = DEFAULT_COUNT;
  if (countRaw !== undefined && countRaw !== null && countRaw !== "") {
    const parsed = typeof countRaw === "number" ? countRaw : Number(String(countRaw).trim());
    if (!Number.isInteger(parsed) || parsed < MIN_COUNT || parsed > MAX_COUNT) {
      return { ok: false, error: `Count must be a whole number from ${MIN_COUNT} to ${MAX_COUNT}.` };
    }
    count = parsed;
  }

  const dms = DM_TEMPLATES[tone].slice(0, count).map((t) => {
    const filled = fillTemplate(t, brand, offer);
    return filled.length > MAX_DM_CHARS ? filled.slice(0, MAX_DM_CHARS - 1) + "…" : filled;
  });

  return {
    ok: true,
    values: {
      dms,
      personalizationSlots: [...PERSONALIZATION_SLOTS],
    },
  };
}
