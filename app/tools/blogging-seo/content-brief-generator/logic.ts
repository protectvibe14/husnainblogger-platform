/**
 * Content Brief Generator — pure logic (tool-031).
 *
 * Zero imports, zero network, zero DOM. Assembles a structured SEO content
 * brief from FIXED template banks (never AI-generated):
 *
 *   - SECTION_BANK: 14 section templates with {topic} placeholders and
 *     relative word-count weights (sizes documented below).
 *   - How many sections land in a brief depends only on the requested
 *     word count: 300-800 -> 6 sections, 801-2000 -> 9, 2001-10000 -> 12.
 *
 * Deterministic: same inputs always produce the same brief.
 *
 * ASSUMPTIONS (also surfaced to the user in the brief itself):
 * - The search-intent line is a rough keyword heuristic, not SERP-verified.
 * - Word targets are proportional estimates rounded to whole numbers; the
 *   final section is adjusted so the targets sum exactly to the word count.
 * - Suggested meta titles/descriptions are starting templates — rewrite for
 *   the target SERP before publishing.
 * - Read-time is estimated at 200 words/minute.
 * - The tool does not check keyword difficulty, search volume, or
 *   competitors; verify those with a keyword tool.
 */

/** Fixed section-template bank: 14 entries. Order is deliberate. */
export const SECTION_BANK: ReadonlyArray<{
  title: string;
  /** Relative share of the word budget. */
  weight: number;
}> = [
  { title: "Introduction: What {topic} Is (and Isn't)", weight: 1.0 },
  { title: "Why {topic} Matters", weight: 1.2 },
  { title: "Key Benefits of {topic}", weight: 1.0 },
  { title: "How {topic} Works: Step by Step", weight: 1.5 },
  { title: "Common Mistakes to Avoid with {topic}", weight: 1.0 },
  { title: "Pro Tips: Getting More Out of {topic}", weight: 1.2 },
  { title: "Tools and Resources for {topic}", weight: 0.8 },
  { title: "Real-World Examples of {topic}", weight: 1.0 },
  { title: "Beginner vs. Advanced {topic} Strategies", weight: 1.0 },
  { title: "Frequently Asked Questions About {topic}", weight: 1.0 },
  { title: "{topic} Trends Worth Watching", weight: 0.8 },
  { title: "Costs and Budgeting for {topic}", weight: 0.8 },
  { title: "Conclusion: Your Next Steps with {topic}", weight: 0.8 },
  { title: "Checklist: Your {topic} Action Plan", weight: 0.6 },
];

/** Number of section templates in the fixed bank. */
export const SECTION_BANK_SIZE = SECTION_BANK.length; // 14

/** Minimum accepted topic length. */
export const MIN_TOPIC_LENGTH = 2;
/** Maximum accepted topic length. */
export const MAX_TOPIC_LENGTH = 150;
/** Minimum accepted target-keyword length. */
export const MAX_KEYWORD_LENGTH = 100;
/** Maximum accepted audience length. */
export const MAX_AUDIENCE_LENGTH = 100;
/** Word-count bounds. */
export const MIN_WORD_COUNT = 300;
export const MAX_WORD_COUNT = 10000;
export const DEFAULT_WORD_COUNT = 1500;
/** Read-time estimate basis (words per minute). */
export const WORDS_PER_MINUTE = 200;

export interface BriefSection {
  /** H2 title with the topic filled in. */
  title: string;
  /** Proportional word target for this section. */
  wordTarget: number;
}

/** Pick how many sections a brief gets, based on the word count. */
function sectionCountFor(wordCount: number): number {
  if (wordCount <= 800) return 6;
  if (wordCount <= 2000) return 9;
  return 12;
}

/**
 * Select section templates deterministically: intro first, conclusion
 * last, body taken in bank order in between.
 */
function selectSections(count: number): number[] {
  // Bank indices: 0 = intro, 1..11 = body, 12 = conclusion, 13 = checklist.
  const bodyNeeded = count - 2;
  const picked: number[] = [0];
  for (let i = 1; i <= bodyNeeded; i += 1) picked.push(i);
  picked.push(12);
  return picked;
}

/** Rough, honest intent heuristic — labeled as a guess everywhere it appears. */
export function guessIntent(topic: string): string {
  const t = topic.toLowerCase();
  if (/\b(buy|price|pricing|discount|coupon|deal|cheap|order)\b/.test(t))
    return "transactional (heuristic guess)";
  if (/\b(best|vs|versus|review|top \d+|compare|alternative)\b/.test(t))
    return "commercial (heuristic guess)";
  return "informational (heuristic guess)";
}

function fillTopic(template: string, topic: string): string {
  return template.replace(/\{topic\}/g, topic);
}

function titleCase(text: string): string {
  return text
    .split(/\s+/)
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/**
 * Allocate word targets proportionally to section weights; the last
 * section absorbs rounding so the targets sum exactly to wordCount.
 */
export function allocateWords(
  indices: number[],
  wordCount: number,
): BriefSection[] {
  const picked = indices.map((i) => SECTION_BANK[i]);
  const totalWeight = picked.reduce((sum, s) => sum + s.weight, 0);
  const sections: BriefSection[] = picked.map((s) => ({
    title: s.title,
    wordTarget: 0,
  }));
  let assigned = 0;
  for (let i = 0; i < sections.length; i += 1) {
    if (i === sections.length - 1) {
      sections[i].wordTarget = wordCount - assigned;
    } else {
      const target = Math.max(
        50,
        Math.round((wordCount * picked[i].weight) / totalWeight),
      );
      sections[i].wordTarget = target;
      assigned += target;
    }
  }
  return sections;
}

export interface ContentBriefInput {
  topic: string;
  targetKeyword?: string;
  wordCount?: number;
  audience?: string;
}

export interface ContentBriefResult {
  briefMarkdown: string;
  sections: string[];
}

function validate(input: ContentBriefInput): string | null {
  if (input === null || typeof input !== "object")
    return "Input must be an object.";
  const { topic, targetKeyword, wordCount, audience } = input;
  if (typeof topic !== "string" || topic.trim().length < MIN_TOPIC_LENGTH)
    return `Topic is required (${MIN_TOPIC_LENGTH}-${MAX_TOPIC_LENGTH} characters).`;
  if (topic.trim().length > MAX_TOPIC_LENGTH)
    return `Topic must be ${MAX_TOPIC_LENGTH} characters or fewer.`;
  if (
    targetKeyword !== undefined &&
    (typeof targetKeyword !== "string" ||
      targetKeyword.trim().length === 0 ||
      targetKeyword.trim().length > MAX_KEYWORD_LENGTH)
  )
    return `Target keyword must be 1-${MAX_KEYWORD_LENGTH} characters when provided.`;
  if (wordCount !== undefined) {
    if (
      typeof wordCount !== "number" ||
      !Number.isInteger(wordCount) ||
      wordCount < MIN_WORD_COUNT ||
      wordCount > MAX_WORD_COUNT
    )
      return `Word count must be a whole number between ${MIN_WORD_COUNT} and ${MAX_WORD_COUNT}.`;
  }
  if (
    audience !== undefined &&
    (typeof audience !== "string" ||
      audience.trim().length === 0 ||
      audience.trim().length > MAX_AUDIENCE_LENGTH)
  )
    return `Audience must be 1-${MAX_AUDIENCE_LENGTH} characters when provided.`;
  return null;
}

/**
 * Build the brief. Throws TypeError/RangeError on invalid input so tests
 * can assert precisely; runTool() converts those into { ok: false }.
 */
export function buildBrief(input: ContentBriefInput): ContentBriefResult {
  const problem = validate(input);
  if (problem !== null) throw new TypeError(problem);

  const topic = input.topic.trim();
  const keyword =
    input.targetKeyword !== undefined ? input.targetKeyword.trim() : "";
  const wordCount =
    input.wordCount !== undefined ? input.wordCount : DEFAULT_WORD_COUNT;
  const audience =
    input.audience !== undefined ? input.audience.trim() : "";

  const indices = selectSections(sectionCountFor(wordCount));
  const sections = allocateWords(indices, wordCount).map((s) => ({
    title: fillTopic(s.title, topic),
    wordTarget: s.wordTarget,
  }));

  const readMinutes = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
  const intent = guessIntent(topic);
  const keywordLine =
    keyword.length > 0
      ? keyword
      : "(not specified — pick one primary keyword before writing)";
  const audienceLine =
    audience.length > 0 ? audience : "(not specified — define it before writing)";
  const metaTitle = `${titleCase(topic)}: The Complete Guide`;
  const metaDescription = `Learn everything about ${topic}: benefits, step-by-step process, mistakes to avoid, and pro tips. Start reading now.`;

  const outlineLines = sections.map(
    (s, i) => `${i + 1}. ## ${s.title} — ~${s.wordTarget} words`,
  );

  const briefMarkdown = [
    `# Content Brief: ${topic}`,
    "",
    `- Target keyword: ${keywordLine}`,
    `- Audience: ${audienceLine}`,
    `- Target word count: ${wordCount}`,
    `- Estimated read time: ~${readMinutes} min (at ${WORDS_PER_MINUTE} wpm — estimate)`,
    `- Search intent: ${intent} — verify against the real SERP before writing`,
    "",
    "## Suggested outline",
    "",
    ...outlineLines,
    "",
    "## On-page SEO notes",
    "",
    keyword.length > 0
      ? `- Use "${keyword}" in the H1, the first 100 words, and at least one H2.`
      : "- Choose one primary keyword, then use it in the H1, the first 100 words, and at least one H2.",
    `- Suggested meta title (edit before publishing): ${metaTitle}`,
    `- Suggested meta description (edit before publishing, keep under ~160 characters): ${metaDescription}`,
    "- Add 2-3 internal links to related posts on your site.",
    "- Add 1-2 external links to authoritative sources for key claims.",
    "- Use descriptive alt text on every image.",
    "",
    "## Calls to action",
    "",
    "- Primary CTA: end the post with one clear next step (e.g. download, subscribe, comment).",
    "- Secondary CTA: one contextual link mid-article to a related post or resource.",
    "",
    "---",
    "",
    "_This brief is assembled from a fixed bank of 14 section templates — it is not AI-generated and does not check SERPs, keyword difficulty, or search volume. Verify intent and facts before writing._",
  ].join("\n");

  return {
    briefMarkdown,
    sections: sections.map((s) => `${s.title} — ~${s.wordTarget} words`),
  };
}

/**
 * runTool entry point (generator template contract).
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  try {
    // Build a typed input with safe coercions; validate() inside buildBrief
    // rejects anything invalid (missing topic, wrong types) with a throw
    // that becomes { ok: false, error } below.
    const result = buildBrief({
      topic: typeof values.topic === "string" ? values.topic : "",
      targetKeyword:
        typeof values.targetKeyword === "string" ? values.targetKeyword : undefined,
      wordCount: typeof values.wordCount === "number" ? values.wordCount : undefined,
      audience: typeof values.audience === "string" ? values.audience : undefined,
    });
    return {
      ok: true,
      values: {
        briefMarkdown: result.briefMarkdown,
        sections: result.sections,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Invalid input.",
    };
  }
}
