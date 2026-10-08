/**
 * Digital Product Idea Generator — pure logic (tool-245), zero imports,
 * zero network, zero DOM.
 *
 * TEMPLATE ENGINE, NOT AI: assembles ideas from hand-written banks —
 * 14 product formats x 10 title templates x 8 validation steps.
 * Idea i uses format[i % 14], title template[i % 10], validation
 * step[i % 8], filled with the user's niche and skills. No AI, no
 * randomness, no market data.
 *
 * Bank sizes: 14 formats, 10 title templates, 8 validation steps.
 *
 * Price hints: the optional `priceHint` input is the user's own number,
 * repeated on every idea and labeled as theirs. The tool never suggests
 * prices from "market data" — it has none.
 *
 * Deterministic: same inputs -> same outputs, always.
 */

export const MIN_COUNT = 1;
export const MAX_COUNT = 10;
export const DEFAULT_COUNT = 5;
export const MAX_NICHE_LEN = 80;
export const MAX_SKILLS_LEN = 120;
export const MAX_PRICE_HINT_LEN = 20;

/** 14 product format bank. */
const FORMAT_BANK: string[] = [
  "Notion template pack",
  "ebook / PDF guide",
  "Canva template bundle",
  "preset / filter pack",
  "mini video course",
  "checklist & worksheet bundle",
  "prompt pack",
  "spreadsheet / tracker system",
  "email course",
  "wallpaper / phone pack",
  "planner / journal PDF",
  "audio lesson series",
  "swipe-file library",
  "coaching session script pack",
];

/** 10 title templates. {niche} and {skill} = user input (trimmed). */
const TITLE_BANK: string[] = [
  "{niche} {format} for beginners",
  "The {skill}-powered {niche} starter kit",
  "{niche} {format}: the 7-day fast start",
  "Done-for-you {niche} {format} pack",
  "{niche} results {format} — no fluff",
  "The {skill} shortcut: {niche} {format}",
  "{niche} {format} for busy creators",
  "Ultimate {niche} {format} bundle",
  "{niche} {format} that sells itself",
  "Zero-to-launch {niche} {format}",
];

/** 8 validation steps (fixed bank). */
const VALIDATION_BANK: string[] = [
  "Pre-sell to 10 people in your niche before building anything.",
  "Post a waitlist Story and count signups for 7 days.",
  "Sell one copy manually via DMs to prove demand exists.",
  "Run a 3-day comment-gated freebie test and measure replies.",
  "Survey your followers with a 2-question poll.",
  "Launch a tiny pilot version to 5 buyers at a low price.",
  "Ask 3 ideal buyers what outcome they'd pay for.",
  "Compare with 3 similar products and write down your differentiator.",
];

export const BANK_SIZES = {
  formats: FORMAT_BANK.length,
  titleTemplates: TITLE_BANK.length,
  validationSteps: VALIDATION_BANK.length,
};

export interface ProductIdea {
  title: string;
  format: string;
  /** The user's own price hint (or null) — never presented as market data. */
  priceHint: string | null;
  validationStep: string;
}

export interface IdeaResult {
  niche: string;
  skills: string;
  count: number;
  ideas: ProductIdea[];
  /** Always true — reminds consumers this is template assembly, not AI. */
  isTemplateBased: true;
}

export const ASSUMPTIONS: string[] = [
  "Ideas are assembled from fixed template banks (14 formats, 10 title templates, 8 validation steps) — starting points, not researched market opportunities.",
  "Price hints are your own input repeated back, never market pricing — the tool has no pricing data.",
  "An idea is only as good as its validation: run the listed validation step before building.",
];

function fill(template: string, niche: string, skill: string, format: string): string {
  return template
    .replaceAll("{niche}", niche)
    .replaceAll("{skill}", skill)
    .replaceAll("{format}", format.toLowerCase());
}

function coerceCount(raw: unknown): number | null {
  if (raw === undefined || raw === null || raw === "") return DEFAULT_COUNT;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/**
 * Generate product ideas. Throws on: missing/too-long niche or skills,
 * count outside 1-10, priceHint too long.
 */
export function generateIdeas(
  nicheRaw: unknown,
  skillsRaw: unknown,
  countRaw: unknown,
  priceHintRaw: unknown
): IdeaResult {
  if (typeof nicheRaw !== "string" || nicheRaw.trim().length === 0) {
    throw new Error("Please enter your niche (e.g. fitness coaching for moms).");
  }
  const niche = nicheRaw.trim();
  if (niche.length > MAX_NICHE_LEN) {
    throw new Error(`Niche is too long — keep it under ${MAX_NICHE_LEN} characters.`);
  }

  if (typeof skillsRaw !== "string" || skillsRaw.trim().length === 0) {
    throw new Error("Please enter your skills (e.g. video editing, recipe writing).");
  }
  const skills = skillsRaw.trim();
  if (skills.length > MAX_SKILLS_LEN) {
    throw new Error(`Skills text is too long — keep it under ${MAX_SKILLS_LEN} characters.`);
  }
  const skill = skills.split(/[,;]/)[0].trim() || skills;

  const count = coerceCount(countRaw);
  if (count === null) {
    throw new Error("Count must be a whole number between 1 and 10.");
  }
  if (!Number.isInteger(count) || count < MIN_COUNT || count > MAX_COUNT) {
    throw new Error(`Count must be a whole number between ${MIN_COUNT} and ${MAX_COUNT}.`);
  }

  let priceHint: string | null = null;
  if (typeof priceHintRaw === "string" && priceHintRaw.trim().length > 0) {
    priceHint = priceHintRaw.trim();
    if (priceHint.length > MAX_PRICE_HINT_LEN) {
      throw new Error(`Price hint is too long — keep it under ${MAX_PRICE_HINT_LEN} characters (e.g. $19).`);
    }
  }

  const ideas: ProductIdea[] = [];
  for (let i = 0; i < count; i++) {
    const format = FORMAT_BANK[i % FORMAT_BANK.length];
    ideas.push({
      title: fill(TITLE_BANK[i % TITLE_BANK.length], niche, skill, format),
      format,
      priceHint,
      validationStep: VALIDATION_BANK[i % VALIDATION_BANK.length],
    });
  }

  return { niche, skills, count, ideas, isTemplateBased: true };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Platform entry point. values: { niche, skills, count?, priceHint? }.
 * Returns { ideas: string[] }.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  try {
    const result = generateIdeas(values["niche"], values["skills"], values["count"], values["priceHint"]);
    return {
      ok: true,
      values: {
        ideas: result.ideas.map(
          (idea) =>
            `"${idea.title}" — Format: ${idea.format} · ` +
            `Your price hint: ${idea.priceHint ?? "not set (yours to decide — this is not market data)"} · ` +
            `Validate: ${idea.validationStep}`
        ),
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input." };
  }
}
