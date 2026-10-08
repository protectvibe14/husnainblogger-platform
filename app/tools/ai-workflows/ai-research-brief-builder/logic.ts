/**
 * AI Research Brief Builder (tool-333) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * HONESTY: this is a BRIEF ASSEMBLER, not a research engine. It
 * structures YOUR research question into a brief: sub-questions, a
 * source checklist, and verification steps. It performs NO research and
 * cites NO sources — every fact still has to be found by you.
 *
 * Fixed banks (documented per the honesty contract):
 *   - SUB_QUESTIONS: 4 templates (quick), 6 (standard), 8 (deep).
 *     [QUESTION] is substituted with the user's research question.
 *   - VERIFICATION_STEPS: 3 (quick), 5 (standard), 7 (deep).
 *   - DEFAULT_SOURCES: 5 suggested source types used only when the user
 *     adds no source rows (labeled as suggestions, not endorsements).
 *
 * Builder contract: runTool({ items }) -> { ok, values, error }.
 * `values.brief` is the full brief (Markdown, copy-ready),
 * `values.subQuestions` is the sub-question list, and
 * `values.verification` is the verification-step list.
 * Output ids match meta.ts outputs ('brief', 'subQuestions', 'verification').
 *
 * Item shape (one repeatable row in the UI):
 *   - researchQuestion (required; fill on the first row)
 *   - depth            (fill on the first row: "quick" | "standard" | "deep";
 *                       blank defaults to "standard")
 *   - sourceType       (one per row: a source type you plan to consult)
 *
 * Edge cases from the spec:
 *   - researchQuestion is required
 *   - depth must be one of the three allowed values
 *   - source rows capped at 15; duplicates are removed
 */

export interface BriefItem {
  researchQuestion?: string;
  depth?: string;
  sourceType?: string;
}

export interface BriefValues {
  /** The full research brief (Markdown, copy-ready). */
  brief: string;
  /** Sub-question list. */
  subQuestions: string[];
  /** Verification-step list. */
  verification: string[];
}

export interface BriefResult {
  ok: boolean;
  values?: BriefValues;
  error?: string;
}

export type Depth = "quick" | "standard" | "deep";

export const DEPTHS: Depth[] = ["quick", "standard", "deep"];
export const DEFAULT_DEPTH: Depth = "standard";

/** Spec: at most 15 source rows. */
export const MAX_ITEMS = 15;

/**
 * Fixed sub-question templates. Sizes: quick = 4, standard = 6, deep = 8.
 * [QUESTION] is replaced with the user's research question.
 */
export const SUB_QUESTIONS: Record<Depth, string[]> = {
  quick: [
    "What is [QUESTION], in one paragraph?",
    "What are the 3 most important facts about [QUESTION]?",
    "What is commonly misunderstood about [QUESTION]?",
    "What has changed about [QUESTION] recently?",
  ],
  standard: [
    "What is [QUESTION], in one paragraph?",
    "What are the 3 most important facts about [QUESTION]?",
    "What is commonly misunderstood about [QUESTION]?",
    "What has changed about [QUESTION] recently?",
    "What evidence supports each key claim about [QUESTION]?",
    "Who disagrees on [QUESTION], and what is their argument?",
  ],
  deep: [
    "What is [QUESTION], in one paragraph?",
    "What are the 3 most important facts about [QUESTION]?",
    "What is commonly misunderstood about [QUESTION]?",
    "What has changed about [QUESTION] recently?",
    "What evidence supports each key claim about [QUESTION]?",
    "Who disagrees on [QUESTION], and what is their argument?",
    "What primary sources can be read directly on [QUESTION]?",
    "What evidence would prove or disprove the main claims about [QUESTION]?",
  ],
};

/**
 * Fixed verification steps. Sizes: quick = 3, standard = 5, deep = 7.
 */
export const VERIFICATION_STEPS: Record<Depth, string[]> = {
  quick: [
    "Check the publication date of every key source.",
    "Prefer primary sources over summaries.",
    "Flag any claim you cannot verify.",
  ],
  standard: [
    "Check the publication date of every key source.",
    "Prefer primary sources over summaries.",
    "Compare at least two independent sources for each key claim.",
    "Note where sources disagree — do not average them silently.",
    "Flag any claim you cannot verify.",
  ],
  deep: [
    "Check the publication date of every key source.",
    "Prefer primary sources over summaries.",
    "Compare at least two independent sources for each key claim.",
    "Note where sources disagree — do not average them silently.",
    "Read one primary source end-to-end before citing it.",
    "Record your confidence level next to each claim.",
    "Flag any claim you cannot verify.",
  ],
};

/**
 * Suggested source types, used ONLY when the user adds no source rows.
 * Labeled as suggestions in the output — never presented as a verdict.
 */
export const DEFAULT_SOURCES: string[] = [
  "Primary sources (official docs, studies, raw data)",
  "Industry publications",
  "News coverage",
  "Expert interviews or quotes",
  "Statistics and datasets",
];

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function substitute(template: string, question: string): string {
  return template.replace(/\[QUESTION\]/g, question);
}

/**
 * Structure the user's research question into a brief. The depth controls
 * how many sub-questions and verification steps are included; the source
 * checklist uses the user's own source types (or marked suggestions).
 */
export function runTool(args: { items: Record<string, unknown>[] }): BriefResult {
  const items = args?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Enter your research question to build the brief." };
  }
  if (items.length > MAX_ITEMS) {
    return {
      ok: false,
      error: `Too many rows: the builder accepts at most ${MAX_ITEMS} source rows.`,
    };
  }

  let question = "";
  let depthRaw = "";
  const sources: string[] = [];

  for (const raw of items) {
    const item = raw as BriefItem;
    if (!question) {
      question = clean(item.researchQuestion);
    }
    if (!depthRaw) {
      depthRaw = clean(item.depth).toLowerCase();
    }
    const source = clean(item.sourceType);
    if (source && !sources.includes(source)) {
      sources.push(source);
    }
  }

  if (!question) {
    return { ok: false, error: "Your research question is required — fill it in on the first row." };
  }

  let depth: Depth = DEFAULT_DEPTH;
  if (depthRaw) {
    if (!DEPTHS.includes(depthRaw as Depth)) {
      return {
        ok: false,
        error: `Depth must be one of: ${DEPTHS.join(", ")} — you entered "${depthRaw}".`,
      };
    }
    depth = depthRaw as Depth;
  }

  const usingDefaultSources = sources.length === 0;
  const checklistSources = usingDefaultSources ? DEFAULT_SOURCES : sources;

  const subQuestions = SUB_QUESTIONS[depth].map((t) => substitute(t, question));
  const verification = VERIFICATION_STEPS[depth];

  const lines: string[] = [];
  lines.push(`# Research Brief: ${question}`);
  lines.push("");
  lines.push(`Depth: ${depth} (${subQuestions.length} sub-questions, ${verification.length} verification steps).`);
  lines.push("");
  lines.push("## Sub-questions to answer");
  subQuestions.forEach((q, i) => lines.push(`${i + 1}. ${q}`));
  lines.push("");
  lines.push("## Source checklist");
  checklistSources.forEach((s) => lines.push(`- [ ] ${s}`));
  if (usingDefaultSources) {
    lines.push("");
    lines.push("_Suggested starting points — replace with the sources you actually plan to use._");
  }
  lines.push("");
  lines.push("## Verification steps");
  verification.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  lines.push("");
  lines.push(
    "_This brief structures your question — it performs no research and cites no sources. Verify every claim yourself._"
  );

  return {
    ok: true,
    values: {
      brief: lines.join("\n").trimEnd(),
      subQuestions,
      verification,
    },
  };
}
