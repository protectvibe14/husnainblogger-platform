/**
 * TikTok POV Caption Bank Builder (tool-152) — word-bank caption assembler.
 * Zero imports, zero network, zero DOM, no Math.random.
 *
 * The BuilderTemplate calls runTool({ items }), one item per caption seed:
 *   { seed, niche?, tone?, bankSize? }
 * The client (BuilderTemplate) saves the resulting bank to localStorage.
 *
 * HONESTY: Captions are assembled from FIXED word banks and fixed caption
 * frames — templated, not AI-written. Each caption carries a [YOUR SPIN]
 * placeholder slot for the user to customize. No platform data is used;
 * nothing is fetched from TikTok.
 *
 * WORD BANKS (all fixed; sizes documented — picks are deterministic):
 *   POV_OPENERS        10 — opening fragments ("POV:", "Me when", ...)
 *   SCENARIO_TEMPLATES 12 — scenario frames with a [SEED] slot
 *   EMOTIONS           10 — single emojis used as tone punctuation
 *   HASHTAG_SETS        5 tones (funny, warm, motivational, sassy, generic)
 *                       x 3 tag sets = 15 fixed tag sets (3-5 tags each)
 *   TOTAL: 47 fixed bank entries.
 *
 * CAPTION LIMIT: every caption must stay within TIKTOK_CAPTION_LIMIT (2200
 * characters, conservative platform rule from the project's platform-rules
 * registry). If appending hashtags would exceed the limit, hashtags are
 * trimmed first (dropped last-to-first) until the caption fits.
 *
 * Deterministic: same items -> same captions, always.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Conservative TikTok caption limit (see header). */
export const TIKTOK_CAPTION_LIMIT = 2200;

export const MIN_BANK_SIZE = 5;
export const MAX_BANK_SIZE = 50;
export const DEFAULT_BANK_SIZE = 10;
export const MAX_SEED_LENGTH = 2000;
export const MAX_NICHE_LENGTH = 60;
export const MAX_TONE_LENGTH = 30;

/** Placeholder slot left in every caption for user customization. */
export const SPIN_SLOT = "[YOUR SPIN]";

export const POV_OPENERS: readonly string[] = [
  "POV:",
  "Me when",
  "Nobody:",
  "That moment when",
  "Tell me why",
  "It's the",
  "Day 47 of",
  "Watching",
  "The audacity of",
  "Normalize",
];

export const SCENARIO_TEMPLATES: readonly string[] = [
  "you finally [SEED] without telling anyone",
  "the [SEED] hits different at 2am",
  "nobody understands the [SEED] struggle",
  "[SEED] era officially loading",
  "me pretending I don't care about [SEED]",
  "that [SEED] plot twist nobody saw coming",
  "when [SEED] becomes the whole personality",
  "the [SEED] group chat right now",
  "day one of romanticizing [SEED]",
  "[SEED] understood the assignment",
  "not me rewatching my own [SEED] video",
  "the [SEED] lore runs deeper than you think",
];

export const EMOTIONS: readonly string[] = [
  "\u{1F62D}",
  "\u{1F480}",
  "\u2728",
  "\u{1F525}",
  "\u{1F979}",
  "\u{1F440}",
  "\u{1F921}",
  "\u{1F485}",
  "\u{1F64F}",
  "\u{1F62E}\u200D\u{1F4A8}",
];

export const TONE_KEYS = ["funny", "warm", "motivational", "sassy"] as const;
export type ToneKey = (typeof TONE_KEYS)[number];

/** 3 fixed hashtag sets per tone (3-5 tags each). */
export const HASHTAG_SETS: Record<string, readonly string[][]> = {
  funny: [
    ["#pov", "#funny", "#relatable", "#comedy"],
    ["#povtiktok", "#funnytiktok", "#lol"],
    ["#relatable", "#meme", "#pov", "#fyp"],
  ],
  warm: [
    ["#pov", "#wholesome", "#relatable"],
    ["#povtiktok", "#feelgood", "#kindness"],
    ["#wholesome", "#softlife", "#pov"],
  ],
  motivational: [
    ["#pov", "#motivation", "#mindset"],
    ["#povtiktok", "#growth", "#discipline", "#goals"],
    ["#motivational", "#selfimprovement", "#pov"],
  ],
  sassy: [
    ["#pov", "#sassy", "#unbothered"],
    ["#povtiktok", "#maincharacter", "#confidence"],
    ["#sassy", "#relatable", "#pov", "#fyp"],
  ],
  generic: [
    ["#pov", "#relatable", "#fyp"],
    ["#povtiktok", "#viral", "#foryou"],
    ["#relatable", "#pov", "#trending"],
  ],
};

function charLen(s: string): number {
  return [...s].length;
}

/** djb2 — deterministic pick index from any seed string. */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pick<T>(bank: readonly T[], seed: string, salt: string): T {
  return bank[hashString(seed + "|" + salt) % bank.length];
}

function normalizeTone(raw: string): string {
  const t = raw.trim().toLowerCase();
  return (TONE_KEYS as readonly string[]).includes(t) ? t : "generic";
}

function asWholeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.floor(value);
  if (typeof value === "string") {
    const t = value.trim();
    if (t === "") return null;
    const n = Number(t);
    if (Number.isFinite(n)) return Math.floor(n);
  }
  return null;
}

interface ParsedItem {
  seed: string;
  tone: string;
  bankSize: number;
}

/**
 * Build one caption; trims hashtags (never the body) until it fits the
 * 2200-character limit. Returns the caption and whether trimming occurred.
 */
export function buildCaption(seed: string, tone: string, salt: string): { caption: string; trimmed: boolean } {
  const opener = pick(POV_OPENERS, salt, "opener");
  const template = pick(SCENARIO_TEMPLATES, salt, "scenario");
  const emotion = pick(EMOTIONS, salt, "emotion");
  const tagSets = HASHTAG_SETS[tone] ?? HASHTAG_SETS.generic;
  const tags = [...pick(tagSets, salt, "tags")];

  const body = `${opener} ${template.split("[SEED]").join(seed)} ${emotion} ${SPIN_SLOT}`;

  let trimmed = false;
  let caption = `${body}\n${tags.join(" ")}`;
  while (charLen(caption) > TIKTOK_CAPTION_LIMIT && tags.length > 0) {
    tags.pop();
    trimmed = true;
    caption = tags.length > 0 ? `${body}\n${tags.join(" ")}` : body;
  }
  if (charLen(caption) > TIKTOK_CAPTION_LIMIT) {
    // Body alone over the limit (only possible with a very long seed):
    // hard-cap the body, still honest about it.
    caption = [...body].slice(0, TIKTOK_CAPTION_LIMIT - 3).join("") + "...";
    trimmed = true;
  }
  return { caption, trimmed };
}

function validateItem(
  raw: Record<string, unknown>,
  index: number
): { item?: ParsedItem; error?: RunResult } {
  const fail = (message: string): RunResult => ({
    ok: false,
    error: `Item ${index + 1}: ${message}`,
  });

  const seedRaw = raw.seed;
  if (typeof seedRaw !== "string" || seedRaw.trim() === "") {
    return { error: fail('Seed is required (a word, phrase, or scenario, e.g. "monday gym grind").') };
  }
  const seed = seedRaw.trim();
  if (charLen(seed) > MAX_SEED_LENGTH) {
    return { error: fail(`Seed is too long — keep it under ${MAX_SEED_LENGTH} characters.`) };
  }

  const nicheRaw = raw.niche;
  if (nicheRaw !== undefined && nicheRaw !== null && String(nicheRaw).trim() !== "") {
    if (typeof nicheRaw !== "string") return { error: fail("Niche must be text.") };
    if (charLen(nicheRaw.trim()) > MAX_NICHE_LENGTH) {
      return { error: fail(`Niche is too long — keep it under ${MAX_NICHE_LENGTH} characters.`) };
    }
  }

  const toneRaw = raw.tone;
  let tone = "generic";
  if (toneRaw !== undefined && toneRaw !== null && String(toneRaw).trim() !== "") {
    if (typeof toneRaw !== "string") return { error: fail("Tone must be text.") };
    if (charLen(toneRaw.trim()) > MAX_TONE_LENGTH) {
      return { error: fail(`Tone is too long — keep it under ${MAX_TONE_LENGTH} characters.`) };
    }
    tone = normalizeTone(toneRaw); // unknown tones fall back to generic banks
  }

  let bankSize = DEFAULT_BANK_SIZE;
  const sizeRaw = raw.bankSize;
  if (sizeRaw !== undefined && sizeRaw !== null && String(sizeRaw).trim() !== "") {
    const n = asWholeNumber(sizeRaw);
    if (n === null || n < MIN_BANK_SIZE || n > MAX_BANK_SIZE) {
      return {
        error: fail(`Bank size must be a whole number between ${MIN_BANK_SIZE} and ${MAX_BANK_SIZE}.`),
      };
    }
    bankSize = n;
  }

  return { item: { seed, tone, bankSize } };
}

export function runTool(args: { items: Record<string, unknown>[] }): RunResult {
  const items = args?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return {
      ok: false,
      error:
        'Your bank is empty. Add at least one item with a "Seed" (a word, phrase, or scenario) to build captions from.',
    };
  }

  const parsed: ParsedItem[] = [];
  for (let i = 0; i < items.length; i++) {
    const v = validateItem(items[i], i);
    if (v.error) return v.error;
    parsed.push(v.item as ParsedItem);
  }

  const captions: string[] = [];
  let trimmedCount = 0;
  parsed.forEach((item, itemIndex) => {
    for (let i = 0; i < item.bankSize; i++) {
      const salt = `${item.seed}|${item.tone}|${itemIndex}|${i}`;
      const { caption, trimmed } = buildCaption(item.seed, item.tone, salt);
      captions.push(caption);
      if (trimmed) trimmedCount++;
    }
  });

  return {
    ok: true,
    values: {
      captions,
      count: captions.length,
      trimmedCount,
    },
  };
}
