/**
 * Meta Description Generator (tool-048) — pure logic (zero imports,
 * zero network, zero DOM).
 *
 * HONESTY CONTRACT: this tool assembles description SUGGESTIONS from a
 * FIXED template bank using the topic and target keyword YOU provide —
 * nothing is written by AI. The 140–160 character guidance is a widely
 * published SERP display CONVENTION, not a guarantee: Google routinely
 * truncates or rewrites meta descriptions on its own. Length checks and
 * keyword checks are arithmetic on your text, not SEO scores, and nothing
 * here promises rankings.
 *
 * Fixed content bank: META_DESCRIPTION_TEMPLATES — 5 templates with
 * {keyword} and {topic} slots (documented as TEMPLATE_COUNT). When no
 * target keyword is given, {keyword} falls back to the topic.
 *
 * Analysis target: if you supply a draft, the draft is analyzed; otherwise
 * the first suggestion is analyzed. keywordPresent checks the same target.
 *
 * Deterministic: same inputs -> same suggestions and analysis, always.
 */

export const TEMPLATE_COUNT = 5;
export const MIN_TOPIC_CHARS = 2;
export const MAX_TOPIC_CHARS = 200;
export const MAX_KEYWORD_CHARS = 100;
export const MAX_DRAFT_CHARS = 500;
/** Widely published SERP display convention — NOT a guarantee. */
export const MIN_RECOMMENDED_CHARS = 140;
export const MAX_RECOMMENDED_CHARS = 160;

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const META_DESCRIPTION_TEMPLATES: string[] = [
  "Discover {keyword}: this complete guide to {topic} covers everything you need to know, with practical tips and real examples.",
  "Want to master {keyword}? Learn {topic} step by step with actionable advice, proven strategies, and expert insights.",
  "{keyword} explained: what {topic} is, how it works, and the best tips to get results fast. Read the full guide now.",
  "Everything about {keyword} in one place — {topic} tips, common mistakes to avoid, and a simple action plan to start today.",
  "New to {topic}? This beginner-friendly guide to {keyword} walks you through the basics with clear examples and next steps.",
];

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function fill(template: string, keyword: string, topic: string): string {
  return template.replaceAll("{keyword}", keyword).replaceAll("{topic}", topic);
}

export interface LengthAnalysis {
  charCount: number;
  minRecommended: number;
  maxRecommended: number;
  withinRange: boolean;
  status: "too short" | "within recommended range" | "too long";
  /** Which text was analyzed: "draft" or "suggestion". */
  analyzed: "draft" | "suggestion";
  note: string;
}

export function analyzeLength(text: string, analyzed: "draft" | "suggestion"): LengthAnalysis {
  const charCount = [...text].length; // code-point count (unicode-safe)
  const withinRange = charCount >= MIN_RECOMMENDED_CHARS && charCount <= MAX_RECOMMENDED_CHARS;
  const status: LengthAnalysis["status"] =
    charCount < MIN_RECOMMENDED_CHARS ? "too short" : charCount > MAX_RECOMMENDED_CHARS ? "too long" : "within recommended range";
  return {
    charCount,
    minRecommended: MIN_RECOMMENDED_CHARS,
    maxRecommended: MAX_RECOMMENDED_CHARS,
    withinRange,
    status,
    analyzed,
    note: "140–160 characters is a widely published SERP display convention, not a guarantee — Google may truncate or rewrite descriptions.",
  };
}

/**
 * Generator entry point. values:
 *   topic: string, required, 2-200 chars
 *   targetKeyword: string, optional, max 100 chars
 *   draft: string, optional, max 500 chars (analyzed if present)
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "No input provided." };
  }
  const topic = clean(values.topic);
  const keyword = clean(values.targetKeyword);
  const draft = clean(values.draft);

  if (topic.length < MIN_TOPIC_CHARS) {
    return { ok: false, error: `Topic is required (${MIN_TOPIC_CHARS}-${MAX_TOPIC_CHARS} characters).` };
  }
  if (topic.length > MAX_TOPIC_CHARS) {
    return { ok: false, error: `Topic must be ${MAX_TOPIC_CHARS} characters or fewer.` };
  }
  if (keyword.length > MAX_KEYWORD_CHARS) {
    return { ok: false, error: `Target keyword must be ${MAX_KEYWORD_CHARS} characters or fewer.` };
  }
  if (draft.length > MAX_DRAFT_CHARS) {
    return { ok: false, error: `Draft must be ${MAX_DRAFT_CHARS} characters or fewer.` };
  }

  const key = keyword.length > 0 ? keyword : topic;
  const suggestions = META_DESCRIPTION_TEMPLATES.map((t) => fill(t, key, topic));

  const analyzed: "draft" | "suggestion" = draft.length > 0 ? "draft" : "suggestion";
  const subject = analyzed === "draft" ? draft : suggestions[0];
  const lengthAnalysis = analyzeLength(subject, analyzed);
  const keywordPresent =
    keyword.length > 0 ? subject.toLowerCase().includes(keyword.toLowerCase()) : false;

  return {
    ok: true,
    values: {
      suggestions,
      lengthAnalysis,
      keywordPresent,
    },
  };
}
