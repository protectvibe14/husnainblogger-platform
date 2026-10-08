/**
 * Question Keyword Expander — pure logic (tool-004), zero imports, zero
 * network, zero DOM.
 *
 * HONESTY CONTRACT: fixed question-word template expansion. These are
 * "idea seeds" — plausible question phrasings, NOT real "People Also Ask"
 * data, NOT search-volume data, and nothing is produced by an AI model.
 *
 * Question banks (documented sizes), each template contains "{seed}":
 *  - WHAT:      3 templates
 *  - HOW:       4 templates
 *  - WHY:       2 templates
 *  - WHEN:      2 templates
 *  - WHERE:     2 templates
 *  - WHO:       2 templates
 *  - WHICH:     2 templates
 *  - CAN:       2 templates
 *  - SHOULD:    2 templates
 *  - WORTH_IT:  2 templates
 * Total deterministic expansions: 23 (deduplicated).
 */

export interface ExpandResult {
  expansions: string[];
  count: number;
}

/** 23 fixed question templates, grouped by question word. */
const QUESTION_TEMPLATES: string[] = [
  // WHAT (3)
  "what is {seed}",
  "what are the benefits of {seed}",
  "what does {seed} mean",
  // HOW (4)
  "how does {seed} work",
  "how to use {seed}",
  "how much does {seed} cost",
  "how long does {seed} take",
  // WHY (2)
  "why is {seed} important",
  "why use {seed}",
  // WHEN (2)
  "when to use {seed}",
  "when is {seed} worth it",
  // WHERE (2)
  "where to find {seed}",
  "where to buy {seed}",
  // WHO (2)
  "who should use {seed}",
  "who uses {seed}",
  // WHICH (2)
  "which {seed} is best",
  "which {seed} should i choose",
  // CAN (2)
  "can {seed} really help",
  "can beginners use {seed}",
  // SHOULD (2)
  "should i try {seed}",
  "should beginners use {seed}",
  // WORTH IT (2)
  "is {seed} worth it",
  "does {seed} really work",
];

/** Max expansions returned (deduped). */
export const MAX_EXPANSIONS = 23;

/**
 * Expand a seed into question-form idea seeds.
 * Deterministic: same seed -> same list, same order.
 * A trailing "?" on an already-question seed is stripped first.
 */
export function expandQuestions(seed: string): ExpandResult {
  const clean = seed.replace(/\?+\s*$/, "").trim();
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of QUESTION_TEMPLATES) {
    const v = t.replace("{seed}", clean).replace(/\s+/g, " ").trim();
    const key = v.toLowerCase();
    if (v.length > 0 && !seen.has(key)) {
      seen.add(key);
      out.push(v);
    }
  }
  const expansions = out.slice(0, MAX_EXPANSIONS);
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

  const result = expandQuestions(seed);
  return {
    ok: true,
    values: {
      expansions: result.expansions,
      count: result.count,
    },
  };
}
