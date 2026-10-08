/**
 * Alphabet Soup Keyword Expander — pure logic (tool-005), zero imports, zero
 * network, zero DOM.
 *
 * HONESTY CONTRACT: the classic "alphabet soup" brainstorming trick — the
 * seed keyword followed by each letter a-z ("{seed} a" ... "{seed} z").
 * These are "idea seeds", NOT real autocomplete suggestions and NOT
 * search-volume data; nothing is produced by an AI model. For non-Latin
 * seeds the a-z letters still apply as suffixes (documented edge case).
 *
 * Word bank: 26 fixed letters (a-z) -> exactly 26 deterministic expansions.
 */

export interface ExpandResult {
  expansions: string[];
  count: number;
}

/** 26 fixed letters. */
const LETTERS: string[] = "abcdefghijklmnopqrstuvwxyz".split("");

/** Exact expansion count: 26 (one per letter). */
export const EXPANSION_COUNT = 26;

/**
 * Expand a seed into alphabet-soup idea seeds.
 * Deterministic: same seed -> same 26 items, a-z order.
 */
export function expandAlphabetSoup(seed: string): ExpandResult {
  const expansions = LETTERS.map((l) => `${seed} ${l}`);
  return { expansions, count: expansions.length };
}

/**
 * Tool entry point (matches the platform ToolRunFn contract).
 * values.seedKeyword: string, required, 2-100 chars after trimming.
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

  const seed = raw.replace(/\s+/g, " ").trim();
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

  const result = expandAlphabetSoup(seed);
  return {
    ok: true,
    values: {
      expansions: result.expansions,
      count: result.count,
    },
  };
}
