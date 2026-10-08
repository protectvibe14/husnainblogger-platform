/**
 * Sales Page Outline Generator — pure logic (zero imports, zero network, zero DOM).
 *
 * Fills a fixed 10-section sales-page structure with the user's offer
 * details. NO sales copy is written by AI — each section ships with a
 * fixed "write prompt" telling the user what to write there, and the
 * user's offerName / price / targetAudience are substituted into
 * [placeholders] where provided.
 *
 * Fixed structure (documented per the BATCH-1 honesty contract):
 * 10 sections, each = title + fixed write-prompt template.
 * 1. Hero — headline + subheadline
 * 2. The problem — the pain your audience feels
 * 3. The cost of doing nothing
 * 4. The solution — introduce your offer
 * 5. What's inside — features / modules / deliverables
 * 6. Who this is for (and not for)
 * 7. Proof — testimonials and results
 * 8. Pricing, guarantee, and risk reversal
 * 9. FAQ — objection handling
 * 10. Final call to action
 */

export interface OutlineSection {
  /** "1".."10" */
  number: string;
  title: string;
  /** Fixed write prompt with the user's details substituted in. */
  prompt: string;
}

const SECTIONS: Array<{ title: string; template: string }> = [
  {
    title: "Hero — headline + subheadline",
    template:
      "Write one headline that names the main outcome of [OFFER] for [AUDIENCE], " +
      "then a subheadline that says who it is for and how fast they can expect results. " +
      "Keep the headline under 12 words.",
  },
  {
    title: "The problem — the pain your audience feels",
    template:
      "Describe the problem [AUDIENCE] faces, in their own words, that [OFFER] solves. " +
      "List 3–5 specific frustrations or symptoms they recognize immediately.",
  },
  {
    title: "The cost of doing nothing",
    template:
      "Spell out what happens if [AUDIENCE] never solves this problem: lost time, " +
      "lost money, missed opportunities. Make the status quo feel expensive.",
  },
  {
    title: "The solution — introduce your offer",
    template:
      "Introduce [OFFER] as the answer. In 2–3 sentences, say what it is, who made it, " +
      "and why it works when other options failed for [AUDIENCE].",
  },
  {
    title: "What's inside — features, modules, deliverables",
    template:
      "Break [OFFER] into its parts (modules, lessons, features, or deliverables). " +
      "For each part, write the feature AND the benefit: what it is, and what it does for [AUDIENCE].",
  },
  {
    title: "Who this is for (and not for)",
    template:
      "Write two short lists. “This is for you if…” — 3–5 traits of the ideal [AUDIENCE] buyer. " +
      "“This is NOT for you if…” — 2–3 honest disqualifiers. This filters out bad-fit buyers.",
  },
  {
    title: "Proof — testimonials and results",
    template:
      "Add 3–5 testimonials from real [AUDIENCE] customers of [OFFER], each with a name, " +
      "a specific result, and the starting point. Only use testimonials you actually have — " +
      "never invent results or quotes.",
  },
  {
    title: "Pricing, guarantee, and risk reversal",
    template:
      "Present the price ([PRICE]) with a clear stack of everything included. " +
      "Add a guarantee that reverses the risk for [AUDIENCE] — state exactly what happens if [OFFER] doesn't work for them.",
  },
  {
    title: "FAQ — objection handling",
    template:
      "Answer 5–8 questions [AUDIENCE] asks before buying [OFFER]: how it works, " +
      "how much time it takes, what happens after purchase, refunds, and support. " +
      "Every answer should remove one reason to say no.",
  },
  {
    title: "Final call to action",
    template:
      "Close with one clear instruction: tell [AUDIENCE] exactly what to do next " +
      "to get [OFFER] at [PRICE], and remind them of the main outcome one last time.",
  },
];

export const SECTION_COUNT = 10;

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Substitute user details into a fixed template; missing values stay as [placeholders]. */
function fill(template: string, offer: string, price: string, audience: string): string {
  return template
    .split("[OFFER]").join(offer.length > 0 ? offer : "[your offer]")
    .split("[PRICE]").join(price.length > 0 ? price : "[your price]")
    .split("[AUDIENCE]").join(audience.length > 0 ? audience : "[your audience]");
}

/** Build the 10 sections for the given inputs (pure, deterministic). */
export function buildOutline(offerName: string, price: string, audience: string): OutlineSection[] {
  return SECTIONS.map((s, i) => ({
    number: String(i + 1),
    title: s.title,
    prompt: fill(s.template, offerName, price, audience),
  }));
}

/**
 * Tool logic slot (generator). Returns:
 * values.outline = full plain-text outline (copy kind),
 * values.sections = ["1. Title", ...] list of section headings.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please provide your inputs first." };
  }

  const offerName = clean(values["offerName"]);
  const price = clean(values["price"]);
  const audience = clean(values["targetAudience"]);

  if (offerName.length === 0) {
    return { ok: false, error: "Enter your offer name — it is required to build the outline." };
  }

  const sections = buildOutline(offerName, price, audience);
  const outlineLines: string[] = [`Sales page outline for "${offerName}"`, ""];
  for (const s of sections) {
    outlineLines.push(`${s.number}. ${s.title}`);
    outlineLines.push(`   Write: ${s.prompt}`);
    outlineLines.push("");
  }

  return {
    ok: true,
    values: {
      outline: outlineLines.join("\n").trimEnd(),
      sections: sections.map((s) => `${s.number}. ${s.title}`),
    },
  };
}
