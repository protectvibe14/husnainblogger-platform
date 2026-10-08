/**
 * Long-Tail Keyword Expander — pure logic (tool-001), zero imports, zero
 * network, zero DOM.
 *
 * HONESTY CONTRACT: this is a fixed template/word-bank expander. It does
 * NOT query search engines, has NO search-volume or difficulty data, and
 * nothing is produced by an AI model. Outputs are "idea seeds" — starting
 * points a human must validate with a real keyword-research tool.
 *
 * Word banks (documented sizes):
 *  - INTENT_PREFIXES: 8 entries   -> "{prefix} {seed}"
 *  - SUFFIXES:        10 entries  -> "{seed} {suffix}"
 *  - AUDIENCES:       6 entries   -> "{seed} {audience}"
 *  - HOW_TOS:         4 entries   -> fixed how-to templates
 * Total deterministic expansions: 28 (deduplicated; fewer if the seed
 * causes template collisions).
 */

export interface ExpandResult {
  expansions: string[];
  count: number;
}

/** 8 prefixes -> "{prefix} {seed}" */
const INTENT_PREFIXES: string[] = [
  "best",
  "top 10",
  "affordable",
  "easy",
  "ultimate",
  "complete",
  "simple",
  "beginner friendly",
];

/** 10 suffixes -> "{seed} {suffix}" */
const SUFFIXES: string[] = [
  "guide",
  "tips",
  "for beginners",
  "step by step",
  "explained",
  "examples",
  "ideas",
  "checklist",
  "mistakes to avoid",
  "review",
];

/** 6 audiences -> "{seed} {audience}" */
const AUDIENCES: string[] = [
  "for small business",
  "for bloggers",
  "for freelancers",
  "for students",
  "for marketers",
  "for startups",
];

/** 4 how-to templates */
const HOW_TOS: string[] = [
  "how to choose {seed}",
  "how to use {seed} effectively",
  "getting started with {seed}",
  "{seed} basics for beginners",
];

/** Max expansions returned (deduped). */
export const MAX_EXPANSIONS = 28;

/**
 * Strip HTML tags and URLs from a seed keyword, collapse whitespace.
 * Pure string ops — no DOM, no network.
 */
export function sanitizeSeed(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, " ") // strip HTML tags
    .replace(/https?:\/\/\S+/gi, " ") // strip http(s) URLs
    .replace(/\bwww\.\S+/gi, " ") // strip bare www. URLs
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Expand a sanitized seed into long-tail idea seeds.
 * Deterministic: same seed -> same list, same order.
 */
export function expandSeed(seed: string): ExpandResult {
  const seen = new Set<string>();
  const out: string[] = [];

  const push = (s: string): void => {
    const v = s.replace(/\s+/g, " ").trim();
    if (v.length > 0 && !seen.has(v.toLowerCase())) {
      seen.add(v.toLowerCase());
      out.push(v);
    }
  };

  for (const p of INTENT_PREFIXES) push(`${p} ${seed}`);
  for (const s of SUFFIXES) push(`${seed} ${s}`);
  for (const a of AUDIENCES) push(`${seed} ${a}`);
  for (const t of HOW_TOS) push(t.replace("{seed}", seed));

  const expansions = out.slice(0, MAX_EXPANSIONS);
  return { expansions, count: expansions.length };
}

/**
 * Tool entry point (matches the platform ToolRunFn contract).
 * values.seedKeyword: string, required, 2-100 chars after sanitization.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const raw = values["seedKeyword"];

  if (raw === undefined || raw === null || raw === "") {
    return { ok: false, error: "Please enter a seed keyword to expand." };
  }
  if (typeof raw !== "string") {
    return { ok: false, error: "Seed keyword must be text." };
  }

  const seed = sanitizeSeed(raw);
  if (seed.length < 2) {
    return {
      ok: false,
      error: "Seed keyword must be at least 2 characters long.",
    };
  }
  if (seed.length > 100) {
    return {
      ok: false,
      error: "Seed keyword must be 100 characters or fewer.",
    };
  }

  const result = expandSeed(seed);
  return {
    ok: true,
    values: {
      expansions: result.expansions,
      count: result.count,
    },
  };
}
