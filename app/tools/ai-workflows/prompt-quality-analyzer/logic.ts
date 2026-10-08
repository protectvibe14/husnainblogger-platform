/**
 * Prompt Quality Analyzer — pure logic.
 *
 * WHAT IT HONESTLY DOES:
 * Scores a prompt against a PUBLISHED, transparent rubric. It is NOT an AI
 * judge: it cannot assess semantic quality, creativity, factual correctness,
 * or what answer the prompt would produce. It only measures observable
 * prompt-engineering signals (action verbs, length, format cues, constraint
 * cues, example/role cues).
 *
 * ======================================================================
 * PUBLISHED RUBRIC (total: 100 points) — also published in meta.ts
 * `content.methodology`.
 * ----------------------------------------------------------------------
 *  1. Task clarity .................... 25 pts
 *     First word of the prompt is an action (imperative) verb: 25.
 *     Otherwise 2+ imperative verbs anywhere: 18. Exactly 1: 10. None: 5.
 *  2. Context & background ............ 20 pts (word-count tiers)
 *     120+ words: 20. 60–119 words: 14. 30–59 words: 8. Under 30: 4.
 *  3. Output format specified ......... 20 pts
 *     Any format cue present (format, markdown, table, bullet, JSON,
 *     outline, template, headline, word count, …): 20. Otherwise 0.
 *  4. Constraints & boundaries ........ 20 pts
 *     2+ distinct constraint cues (don't, do not, avoid, must, never,
 *     only, exactly, at least, at most, no more than, without,
 *     limit): 20. Exactly 1: 12. None: 0.
 *  5. Examples, role, or tone ......... 15 pts
 *     Any cue present (example, e.g., for instance, such as, sample,
 *     "you are", "act as", tone, audience): 15. Otherwise 0.
 * ----------------------------------------------------------------------
 *  Score bands: 85+ Excellent | 70–84 Good | 50–69 Fair | below 50 Needs work.
 *  Suggestions are fixed per-criterion tips emitted whenever a criterion
 *  scores below its maximum — they come from the rubric, not from AI.
 * ======================================================================
 *
 * ANALYSIS WINDOW: only the first 5000 characters of the prompt are scored
 * (edge case from the spec). Inputs under 20 characters are rejected.
 *
 * Deterministic: same promptText -> identical scores, always.
 * Zero imports, zero DOM, zero network, zero Math.random.
 */

export const MIN_PROMPT_LENGTH = 20;
export const ANALYSIS_WINDOW = 5000;

/** Imperative verbs that signal a clear task (size: 26). */
export const IMPERATIVE_VERBS: ReadonlyArray<string> = [
  "write", "create", "explain", "list", "generate", "summarize", "draft",
  "design", "describe", "compare", "analyze", "translate", "rewrite",
  "suggest", "recommend", "give", "produce", "outline", "plan",
  "brainstorm", "edit", "review", "convert", "craft", "build", "make",
];

/** Regex sources that count as output-format cues. */
const FORMAT_CUE_SOURCES: ReadonlyArray<string> = [
  "format", "markdown", "table", "bullet", "numbered", "json", "outline",
  "template", "headline", "paragraph", "word count", "\\bwords?\\b",
  "characters", "headings", "structure", "step-by-step",
];

/** Regex sources that count as constraint/boundary cues. */
const CONSTRAINT_CUE_SOURCES: ReadonlyArray<string> = [
  "don't", "do not", "avoid", "\\bmust\\b", "must not", "never",
  "\\bonly\\b", "exactly", "at least", "at most", "no more than",
  "without", "\\blimit\\b",
];

/** Regex sources that count as example/role/tone cues. */
const EXAMPLE_CUE_SOURCES: ReadonlyArray<string> = [
  "example", "e\\.g\\.", "for instance", "such as", "sample",
  "you are", "act as", "\\btone\\b", "audience",
];

export interface CriterionResult {
  name: string;
  score: number;
  max: number;
  note: string;
  suggestion: string | null;
}

export interface QualityReport {
  totalScore: number;
  band: string;
  criteria: CriterionResult[];
  suggestions: string[];
}

function matchesAny(text: string, sources: ReadonlyArray<string>): string[] {
  const found: string[] = [];
  for (const src of sources) {
    const re = new RegExp(src, "i");
    if (re.test(text)) found.push(src.replace(/\\b/g, ""));
  }
  return found;
}

function countWords(text: string): number {
  const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
  return words.length === 1 && words[0] === "" ? 0 : words.length;
}

function scoreTaskClarity(text: string): CriterionResult {
  const firstWord = (text.trim().split(/\s+/)[0] ?? "").replace(/[^a-zA-Z]/g, "").toLowerCase();
  const startsImperative = IMPERATIVE_VERBS.includes(firstWord);
  const verbCount = IMPERATIVE_VERBS.filter((v) => new RegExp(`\\b${v}\\b`, "i").test(text)).length;
  let score: number;
  let note: string;
  if (startsImperative) {
    score = 25;
    note = `Starts with an action verb ("${firstWord}").`;
  } else if (verbCount >= 2) {
    score = 18;
    note = `Contains ${verbCount} action verbs, but the prompt does not start with one.`;
  } else if (verbCount === 1) {
    score = 10;
    note = "Contains one action verb; start the prompt with it for full marks.";
  } else {
    score = 5;
    note = "No action verbs found — the task is unclear.";
  }
  return {
    name: "Task clarity",
    score,
    max: 25,
    note,
    suggestion:
      score < 25
        ? "Start with a clear action verb (write, create, explain, list) so the task is unmistakable."
        : null,
  };
}

function scoreContext(text: string): CriterionResult {
  const words = countWords(text);
  let score: number;
  if (words >= 120) score = 20;
  else if (words >= 60) score = 14;
  else if (words >= 30) score = 8;
  else score = 4;
  return {
    name: "Context & background",
    score,
    max: 20,
    note: `${words} words — ${score === 20 ? "rich background" : "rubric awards 20 pts at 120+ words"}.`,
    suggestion:
      score < 20
        ? "Add background: who this is for, key facts, or what has already been decided."
        : null,
  };
}

function scoreFormat(text: string): CriterionResult {
  const found = matchesAny(text, FORMAT_CUE_SOURCES);
  const score = found.length > 0 ? 20 : 0;
  return {
    name: "Output format specified",
    score,
    max: 20,
    note: found.length > 0 ? `Format cues found: ${found.slice(0, 3).join(", ")}.` : "No format cues found.",
    suggestion:
      score < 20
        ? "Specify the output format: length, structure, markdown, table, or a template to follow."
        : null,
  };
}

function scoreConstraints(text: string): CriterionResult {
  const found = matchesAny(text, CONSTRAINT_CUE_SOURCES);
  let score: number;
  if (found.length >= 2) score = 20;
  else if (found.length === 1) score = 12;
  else score = 0;
  return {
    name: "Constraints & boundaries",
    score,
    max: 20,
    note:
      found.length > 0
        ? `${found.length} constraint cue${found.length > 1 ? "s" : ""} found.`
        : "No constraint cues found.",
    suggestion:
      score < 20
        ? "Set boundaries: what to avoid, limits, and rules the answer must follow."
        : null,
  };
}

function scoreExamples(text: string): CriterionResult {
  const found = matchesAny(text, EXAMPLE_CUE_SOURCES);
  const score = found.length > 0 ? 15 : 0;
  return {
    name: "Examples, role, or tone",
    score,
    max: 15,
    note: found.length > 0 ? `Cues found: ${found.slice(0, 3).join(", ")}.` : "No example, role, or tone cues found.",
    suggestion:
      score < 15
        ? 'Add an example, a role ("act as a…"), or describe the tone and audience.'
        : null,
  };
}

export function bandFor(total: number): string {
  if (total >= 85) return "Excellent";
  if (total >= 70) return "Good";
  if (total >= 50) return "Fair";
  return "Needs work";
}

/** Score a prompt against the published rubric. Exported for tests. */
export function analyzePrompt(promptText: string): QualityReport {
  const text = promptText.slice(0, ANALYSIS_WINDOW);
  const criteria = [
    scoreTaskClarity(text),
    scoreContext(text),
    scoreFormat(text),
    scoreConstraints(text),
    scoreExamples(text),
  ];
  const totalScore = criteria.reduce((sum, c) => sum + c.score, 0);
  const suggestions = criteria
    .map((c) => c.suggestion)
    .filter((s): s is string => s !== null);
  return { totalScore, band: bandFor(totalScore), criteria, suggestions };
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const raw = values["promptText"];
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return { ok: false, error: "Please paste the prompt you want to score." };
  }
  const promptText = raw.trim();
  if (promptText.length < MIN_PROMPT_LENGTH) {
    return {
      ok: false,
      error: `Your prompt is ${promptText.length} characters — it needs at least ${MIN_PROMPT_LENGTH} characters to score.`,
    };
  }

  const report = analyzePrompt(promptText);
  return {
    ok: true,
    values: {
      totalScore: report.totalScore,
      scoreBand: report.band,
      criteriaScores: {
        columns: ["Criterion", "Score", "Max", "Note"],
        rows: report.criteria.map((c) => [c.name, String(c.score), String(c.max), c.note]),
      },
      suggestions: report.suggestions,
    },
  };
}
