/**
 * Curiosity-Gap Title Templates — pure logic.
 *
 * ENGINE: template-wordbank (fixed formula slots; no AI; clearly labeled
 * template output).
 *
 * ASSUMPTIONS:
 * - No DOM, no network, no imports. Unicode handled via Intl.Segmenter
 *   (Node 18+ and all modern browsers).
 * - This tool does NOT generate titles with AI. It instantiates a FIXED
 *   library of 60 title formulas (12 per category × 5 categories) by
 *   substituting the user's topic into the `{topic}` slot. Every output
 *   names the template that produced it.
 * - TEMPLATE BANK: 60 templates total — categories: curiosity, how-to,
 *   mistake, secret, number (12 each). Documented so the UI can say
 *   "60 fixed templates", never "AI-generated".
 * - Generated titles are truncated to 100 graphemes (YouTube's hard title
 *   limit) with an ellipsis; the template tag is appended after truncation.
 * - Deterministic: same (topic, category, count) → same titles, always.
 */

export type TemplateCategory = "curiosity" | "how-to" | "mistake" | "secret" | "number";

/** The 5 template categories offered by the tool. */
export const CATEGORIES: readonly TemplateCategory[] = [
  "curiosity",
  "how-to",
  "mistake",
  "secret",
  "number",
];

/** Max titles the tool can produce per category (bank size per category). */
export const TEMPLATES_PER_CATEGORY = 12;
/** Total fixed template bank size. */
export const TEMPLATE_BANK_SIZE = 60;
/** YouTube title hard limit — instantiated titles are truncated to this. */
export const TITLE_HARD_LIMIT = 100;
/** Max titles a user may request in one run. */
export const MAX_REQUESTED = 50;

interface TitleTemplate {
  id: string;
  pattern: string; // contains exactly one {topic} slot
}

/** Curiosity-gap formulas (12). */
const CURIOSITY: readonly string[] = [
  "Why {topic} Will Change Everything You Know",
  "The Truth About {topic} Nobody Tells You",
  "What Happens When You Try {topic} for 30 Days",
  "I Stopped Ignoring {topic} — Here's What Changed",
  "The {topic} Experiment That Shocked Everyone",
  "Nobody Expected This {topic} Result",
  "{topic}: The Untold Story Behind It",
  "This {topic} Trick Changes Everything",
  "What They Don't Want You to Know About {topic}",
  "The {topic} Secret Hiding in Plain Sight",
  "I Tried {topic} So You Don't Have To",
  "{topic} Is Not What You Think",
];

/** How-to / tutorial formulas (12). */
const HOW_TO: readonly string[] = [
  "How to Master {topic} in 7 Days",
  "How I Learned {topic} Without Spending a Dime",
  "The Only {topic} Guide You'll Ever Need",
  "How to Start {topic} From Zero",
  "{topic} for Beginners: Step-by-Step Tutorial",
  "How to Get Better at {topic} Fast",
  "The 5-Minute {topic} Crash Course",
  "How Professionals Actually Do {topic}",
  "{topic} Explained in Plain English",
  "How to Fix Your {topic} Problems Today",
  "Learn {topic} the Smart Way (No Fluff)",
  "How I Finally Got Good at {topic}",
];

/** Mistake / warning formulas (12). */
const MISTAKE: readonly string[] = [
  "5 {topic} Mistakes Beginners Always Make",
  "Stop Making These {topic} Mistakes",
  "The #1 {topic} Mistake (And How to Fix It)",
  "Why You're Failing at {topic}",
  "7 {topic} Mistakes That Cost You Views",
  "I Made Every {topic} Mistake So You Don't Have To",
  "The {topic} Mistake 90% of People Make",
  "Are You Making This {topic} Mistake?",
  "{topic} Mistakes That Are Killing Your Growth",
  "Don't Start {topic} Until You Watch This",
  "The Costly {topic} Error Nobody Talks About",
  "Fix These {topic} Mistakes in One Video",
];

/** Secret / insider formulas (12). */
const SECRET: readonly string[] = [
  "The {topic} Secret Pros Won't Share",
  "{topic} Secrets Revealed (Part 1)",
  "Hidden {topic} Tricks You Missed",
  "The Untold {topic} Secrets of Top Creators",
  "What Pros Know About {topic} That You Don't",
  "3 {topic} Secrets That Took Me Years to Learn",
  "The {topic} Playbook Nobody Shares",
  "Secret {topic} Strategies for 2026",
  "Inside the {topic} Secrets of Viral Videos",
  "The {topic} Hack Everyone Overlooks",
  "{topic} Insider Secrets — Exposed",
  "Why Pros Keep These {topic} Secrets",
];

/** Number / listicle formulas (12). */
const NUMBER: readonly string[] = [
  "10 {topic} Tips That Actually Work",
  "7 {topic} Hacks in 7 Minutes",
  "5 {topic} Ideas You Haven't Tried",
  "3 {topic} Rules for Instant Results",
  "12 {topic} Facts That Will Surprise You",
  "9 {topic} Tools Worth Your Time",
  "4 {topic} Strategies That Never Fail",
  "6 {topic} Trends You Need to Know",
  "8 {topic} Lessons From My First Year",
  "2 {topic} Tweaks That Double Results",
  "15 {topic} Questions Answered",
  "11 {topic} Shortcuts for Busy People",
];

/** The full fixed bank: id + pattern, in deterministic order. */
export const TEMPLATES: readonly TitleTemplate[] = [
  ...CURIOSITY.map((pattern, i) => ({ id: `curiosity-${i + 1}`, pattern })),
  ...HOW_TO.map((pattern, i) => ({ id: `how-to-${i + 1}`, pattern })),
  ...MISTAKE.map((pattern, i) => ({ id: `mistake-${i + 1}`, pattern })),
  ...SECRET.map((pattern, i) => ({ id: `secret-${i + 1}`, pattern })),
  ...NUMBER.map((pattern, i) => ({ id: `number-${i + 1}`, pattern })),
];

function graphemes(text: string): string[] {
  const seg = new Intl.Segmenter("en", { granularity: "grapheme" });
  return [...seg.segment(text)].map((s) => s.segment);
}

/**
 * Instantiate one template with the topic, truncating the title to
 * TITLE_HARD_LIMIT graphemes (ellipsis) so it always fits YouTube.
 * Returns { title, wasTruncated }.
 */
export function instantiateTemplate(
  template: TitleTemplate,
  topic: string,
): { title: string; wasTruncated: boolean } {
  if (typeof topic !== "string") throw new TypeError("instantiateTemplate expects a string topic");
  const raw = template.pattern.split("{topic}").join(topic);
  const gs = graphemes(raw);
  if (gs.length <= TITLE_HARD_LIMIT) return { title: raw, wasTruncated: false };
  return { title: gs.slice(0, TITLE_HARD_LIMIT - 1).join("") + "…", wasTruncated: true };
}

export interface GeneratedTitle {
  title: string;
  templateId: string;
  truncated: boolean;
}

/**
 * Generate up to `count` titles for a topic in a category, in fixed bank
 * order. Caps at the bank size for the category (12); callers learn about
 * the cap via the note in runTool.
 */
export function generateTitles(
  topic: string,
  category: TemplateCategory,
  count: number,
): GeneratedTitle[] {
  if (typeof topic !== "string") throw new TypeError("generateTitles expects a string topic");
  const pool = TEMPLATES.filter((t) => t.id.startsWith(category + "-"));
  const n = Math.max(0, Math.min(count, pool.length));
  const trimmed = topic.trim();
  return pool.slice(0, n).map((t) => {
    const { title, wasTruncated } = instantiateTemplate(t, trimmed);
    return { title, templateId: t.id, truncated: wasTruncated };
  });
}

/**
 * UI adapter (generator template dispatch): validates the form values and
 * returns template-instantiated titles, each labeled with its template.
 * Output keys match meta.ts outputs: titles, count, note.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawTopic = values.topic;
  if (typeof rawTopic !== "string" || rawTopic.trim() === "") {
    return { ok: false, error: "Enter a topic or keyword — the topic field is empty." };
  }
  const rawCategory = values.category;
  if (typeof rawCategory !== "string" || !(CATEGORIES as readonly string[]).includes(rawCategory)) {
    return {
      ok: false,
      error: `Pick a template category: ${CATEGORIES.join(", ")}.`,
    };
  }
  const category = rawCategory as TemplateCategory;

  let count = 10;
  const rawCount = values.count;
  if (rawCount !== undefined && rawCount !== null && rawCount !== "") {
    const parsed = typeof rawCount === "number" ? rawCount : Number(String(rawCount).trim());
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_REQUESTED) {
      return {
        ok: false,
        error: `How many titles must be a whole number between 1 and ${MAX_REQUESTED}.`,
      };
    }
    count = parsed;
  }

  const generated = generateTitles(rawTopic, category, count);
  const titles = generated.map(
    (g) => `${g.title} (template: ${g.templateId}${g.truncated ? ", truncated to 100 chars" : ""})`,
  );
  const note =
    count > generated.length
      ? `The "${category}" bank has ${TEMPLATES_PER_CATEGORY} fixed templates — you got all ${generated.length}. Ask for fewer titles or switch categories for more.`
      : `Built from a fixed bank of ${TEMPLATE_BANK_SIZE} title templates (not AI) — each title names the template that produced it.`;

  return { ok: true, values: { titles, count: generated.length, note } };
}
