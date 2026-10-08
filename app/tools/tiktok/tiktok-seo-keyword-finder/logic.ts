/**
 * TikTok SEO Keyword Finder (tool-163) — pure logic, zero imports, zero
 * network, zero DOM.
 *
 * HONESTY CONTRACT (from spec honestyNote): this tool CANNOT access TikTok
 * search volume or real query data. It builds keyword-STYLE suggestions
 * from fixed word banks + modifier templates. There are NO volume,
 * difficulty, or CPC numbers anywhere — the output is explicitly labeled
 * "suggestion bank, not search-volume data" (spec edgeCase), and the user
 * is told to validate real demand in TikTok's search bar / Creative Center.
 *
 * Fixed content banks (sizes documented per the builder contract):
 * - MODIFIERS: 12 modifiers -> "{seed} {modifier}" long-tail phrases.
 * - LONGTAIL_SUFFIXES: 12 suffixes -> "{seed} {suffix}" variants.
 * - QUESTION_TEMPLATES: 8 question forms with a {seed} placeholder.
 * - HOWTO_TEMPLATES: 8 how-to forms with a {seed} placeholder.
 * - NICHE_COMBOS: 3 "{seed} for {niche}"-style combos (used when a niche
 *   is supplied).
 * - CAPTION_PLACEMENTS: 3 fixed keyword-placement tips.
 *
 * Deterministic: FNV-1a hash of (seedTopic|niche) seeds rotation picks.
 * Same inputs always produce identical outputs.
 */

export const MAX_SEED_LEN = 100;
export const MAX_NICHE_LEN = 80;

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** 12 modifiers -> "{seed} {modifier}". */
const MODIFIERS: string[] = [
  "for beginners",
  "step by step",
  "on a budget",
  "at home",
  "that actually work",
  "2026 guide",
  "quick",
  "easy",
  "pro",
  "without experience",
  "for busy people",
  "explained simply",
];

/** 12 long-tail suffixes -> "{seed} {suffix}". */
const LONGTAIL_SUFFIXES: string[] = [
  "tips",
  "ideas",
  "routine",
  "checklist",
  "mistakes",
  "hacks",
  "secrets",
  "for beginners",
  "step by step",
  "that work",
  "essentials",
  "101",
];

/** 8 question forms. {seed} is filled. */
const QUESTION_TEMPLATES: string[] = [
  "how to {seed}?",
  "what is the best {seed}?",
  "why is {seed} so popular?",
  "is {seed} worth it?",
  "how much does {seed} cost?",
  "where can I learn {seed}?",
  "what {seed} should I try first?",
  "does {seed} actually work?",
];

/** 8 how-to forms. {seed} is filled. */
const HOWTO_TEMPLATES: string[] = [
  "how to {seed} in 60 seconds",
  "{seed} tutorial for beginners",
  "3 {seed} hacks",
  "{seed} mistakes to avoid",
  "{seed} for beginners: full walkthrough",
  "the easiest way to {seed}",
  "{seed} explained in 1 minute",
  "do {seed} right: step by step",
];

/** 3 niche combos, used when a niche is supplied. {seed} and {niche} filled. */
const NICHE_COMBOS: string[] = [
  "{seed} for {niche}",
  "best {seed} for {niche} beginners",
  "{niche} {seed} that actually works",
];

/** 3 fixed keyword-placement tips. */
const CAPTION_PLACEMENTS: string[] = [
  "Say the keyword out loud in the first 3 seconds — TikTok transcribes speech and indexes it.",
  "Put the main keyword in your on-screen text, not just the caption — on-screen text is searchable.",
  "Repeat the exact phrase naturally in the caption plus 2–3 related hashtags; don't stuff 30 tags.",
];

export const DISCLAIMER =
  "Suggestion bank, not search-volume data: these phrases are built from fixed templates — this tool cannot see TikTok search volume, competition, or trending queries. Validate real demand by typing phrases into TikTok's search bar and checking the TikTok Creative Center.";

/** FNV-1a 32-bit hash — deterministic seed for bank rotation. */
function hash32(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function pick<T>(bank: T[], seed: number, salt: number, count: number): T[] {
  const out: T[] = [];
  for (let i = 0; i < count; i++) {
    out.push(bank[(seed + salt * 97 + i * 5) % bank.length]);
  }
  return out;
}

function dedupeKeepOrder(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const key = item.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}

export function runTool(values: Record<string, unknown>): RunToolResult {
  const seedTopic = clean(values["seedTopic"]).toLowerCase();
  const niche = clean(values["niche"]).toLowerCase();

  if (!seedTopic) {
    return { ok: false, error: "Enter a seed topic — e.g. \"meal prep\" or \"budget travel\"." };
  }
  if (seedTopic.length > MAX_SEED_LEN) {
    return { ok: false, error: `Seed topic must be ${MAX_SEED_LEN} characters or fewer.` };
  }
  if (niche.length > MAX_NICHE_LEN) {
    return { ok: false, error: `Niche must be ${MAX_NICHE_LEN} characters or fewer.` };
  }

  const seed = hash32(`${seedTopic}|${niche}`);

  const keywordPhrases = dedupeKeepOrder([
    ...pick(MODIFIERS, seed, 1, 6).map((m) => `${seedTopic} ${m}`),
    ...pick(LONGTAIL_SUFFIXES, seed, 2, 6).map((s) => `${seedTopic} ${s}`),
    ...(niche ? NICHE_COMBOS.map((t) => t.split("{seed}").join(seedTopic).split("{niche}").join(niche)) : []),
  ]);

  const questionPhrases = pick(QUESTION_TEMPLATES, seed, 3, 4).map((t) =>
    t.split("{seed}").join(seedTopic)
  );
  const howToPhrases = pick(HOWTO_TEMPLATES, seed, 4, 4).map((t) =>
    t.split("{seed}").join(seedTopic)
  );

  return {
    ok: true,
    values: {
      keywordPhrases,
      questionPhrases,
      howToPhrases,
      captionPlacements: [...CAPTION_PLACEMENTS],
      disclaimer: DISCLAIMER,
    },
  };
}
