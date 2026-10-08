/**
 * Product Review Outline Generator (tool-336) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * HONESTY: this is an OUTLINE ASSEMBLER built from FIXED templates. It
 * fills a review structure with YOUR product name — [PRODUCT] — and ships
 * each section with a fixed write prompt plus a testing-note slot where
 * YOU record what you actually tested. No review opinions are written,
 * and no opinions, scores, or verdicts are invented.
 *
 * Fixed banks (documented per the honesty contract):
 *   - 3 review-type structures x 10 sections = 30 section templates.
 *   - "hands-on": single-product test review.
 *   - "comparison": [PRODUCT] vs [COMPETITOR] (bracket placeholder —
 *     name the second product yourself).
 *   - "roundup": multi-product list with [PRODUCT] as the anchor pick.
 *
 * Generator contract: runTool(values) -> { ok, values, error }.
 * `values.outline` is the full outline (Markdown, copy-ready) and
 * `values.sections` is the numbered section-title list.
 * Output ids match meta.ts outputs ('outline', 'sections').
 *
 * Inputs:
 *   - productName (required)
 *   - reviewType  (required: "hands-on" | "comparison" | "roundup")
 *
 * Edge cases from the spec: none beyond required productName.
 */

export interface ReviewValues {
  /** The full review outline (Markdown, copy-ready). */
  outline: string;
  /** Numbered section titles. */
  sections: string[];
}

export interface ReviewResult {
  ok: boolean;
  values?: ReviewValues;
  error?: string;
}

export type ReviewType = "hands-on" | "comparison" | "roundup";

export const REVIEW_TYPES: ReviewType[] = ["hands-on", "comparison", "roundup"];

/** Fixed structure size for every review type. */
export const SECTION_COUNT = 10;

export interface OutlineSection {
  title: string;
  prompt: string;
  testingNote: string;
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Fixed 10-section structures. [PRODUCT] is substituted with the user's
 * product name; [COMPETITOR] stays a bracket placeholder the user fills.
 */
export const STRUCTURES: Record<ReviewType, OutlineSection[]> = {
  "hands-on": [
    {
      title: "Quick verdict",
      prompt:
        "Write your verdict on [PRODUCT] in 2–3 sentences: who it is for and whether you recommend it. Do not invent a score.",
      testingNote: "[state how long you used the product before writing this]",
    },
    {
      title: "Who this is for (and not for)",
      prompt:
        "Describe the reader who will get the most from [PRODUCT], and the reader who should skip it. Be specific, not flattering.",
      testingNote: "[note which user profile you had in mind while testing]",
    },
    {
      title: "What I tested",
      prompt:
        "List exactly what you tested on [PRODUCT] and under what conditions. Readers trust specifics, not adjectives.",
      testingNote: "[list each test you ran, and for how long]",
    },
    {
      title: "Design and build quality",
      prompt:
        "Describe [PRODUCT]'s design, materials, and build quality from your own handling. Compare it to what you expected at its price.",
      testingNote: "[record what you physically handled or measured]",
    },
    {
      title: "Performance and key features",
      prompt:
        "Walk through [PRODUCT]'s headline features one by one. Say what each feature did in your testing, not what the box claims.",
      testingNote: "[attach your measured results or observations per feature]",
    },
    {
      title: "Standout strengths",
      prompt:
        "List 3–5 things [PRODUCT] does better than its alternatives, with the specific moment in testing that proved each one.",
      testingNote: "[reference the test moment behind each strength]",
    },
    {
      title: "What could be better",
      prompt:
        "List 2–4 honest drawbacks of [PRODUCT]. A review with no cons reads like an ad — readers notice.",
      testingNote: "[note any issue you actually hit, however small]",
    },
    {
      title: "How it compares",
      prompt:
        "Compare [PRODUCT] against its closest alternative on the 3 criteria that matter most to buyers. Keep it factual.",
      testingNote: "[name the alternative and what you compared head-to-head]",
    },
    {
      title: "Price and value",
      prompt:
        "State [PRODUCT]'s price and judge its value against what you tested — would you pay for it yourself?",
      testingNote: "[record the price you verified and your value call]",
    },
    {
      title: "Final verdict",
      prompt:
        "Close with a clear recommendation for [PRODUCT]: buy, skip, or wait — and the one reason that decides it.",
      testingNote: "[restate your single deciding reason]",
    },
  ],
  comparison: [
    {
      title: "The contenders",
      prompt:
        "Introduce the two products: [PRODUCT] and [COMPETITOR]. Say why these two, and what kind of buyer is choosing between them.",
      testingNote: "[name the second product and why it is the right rival]",
    },
    {
      title: "Quick verdict: who wins what",
      prompt:
        "Give a one-line winner per category (design, performance, value). No invented scores — verdicts must trace to your testing below.",
      testingNote: "[tie each verdict to a section below]",
    },
    {
      title: "Side-by-side specs",
      prompt:
        "Table the key specs of [PRODUCT] vs [COMPETITOR] from the manufacturers' published pages. Cite the source of each figure.",
      testingNote: "[record where each spec figure came from]",
    },
    {
      title: "Design and build",
      prompt:
        "Compare how [PRODUCT] and [COMPETITOR] feel in hand: materials, finish, ergonomics. Note which one is better made.",
      testingNote: "[record what you physically compared]",
    },
    {
      title: "Performance head-to-head",
      prompt:
        "Run the same tests on [PRODUCT] and [COMPETITOR] and report the results side by side. Same conditions, same metrics.",
      testingNote: "[record the identical test conditions you used]",
    },
    {
      title: "Where [PRODUCT] wins",
      prompt:
        "List the categories where [PRODUCT] beats [COMPETITOR], with the specific test result that proves each win.",
      testingNote: "[reference the result behind each win]",
    },
    {
      title: "Where the alternative wins",
      prompt:
        "List the categories where [COMPETITOR] beats [PRODUCT]. A comparison that never loses reads like sponsored content.",
      testingNote: "[note any category where you would pick the rival]",
    },
    {
      title: "Price and value",
      prompt:
        "State both prices and judge which product gives more for the money. Mention any price you could not verify.",
      testingNote: "[record both verified prices]",
    },
    {
      title: "Who should buy which",
      prompt:
        "Write two buyer profiles: the buyer who should pick [PRODUCT], and the buyer who should pick [COMPETITOR].",
      testingNote: "[check each profile against your test results]",
    },
    {
      title: "Bottom line",
      prompt:
        "Close with one clear pick between [PRODUCT] and [COMPETITOR] — or the honest answer that it depends, with the deciding factor.",
      testingNote: "[state the deciding factor in one line]",
    },
  ],
  roundup: [
    {
      title: "How I chose these",
      prompt:
        "Explain your selection method: how many products you considered, what you tested, and what cut a product from the list.",
      testingNote: "[describe your testing method in 2–3 sentences]",
    },
    {
      title: "At a glance: the winners",
      prompt:
        "Table the winners by category, with [PRODUCT] as your anchor pick. One row per category, one reason per row.",
      testingNote: "[confirm every winner was actually tested]",
    },
    {
      title: "Best overall: [PRODUCT]",
      prompt:
        "Make the case for [PRODUCT] as the best overall pick: its 3 biggest strengths and the buyer it suits best.",
      testingNote: "[tie each strength to a test you ran]",
    },
    {
      title: "Best budget pick",
      prompt:
        "Name the cheapest product that is still worth buying, and say exactly what you give up versus [PRODUCT].",
      testingNote: "[record the trade-offs you verified]",
    },
    {
      title: "Best premium pick",
      prompt:
        "Name the upgrade pick worth the extra money, and say who actually needs the step up from [PRODUCT].",
      testingNote: "[justify the premium with a tested difference]",
    },
    {
      title: "Best for beginners",
      prompt:
        "Name the easiest pick for a first-time buyer, and explain why it is simpler or safer than [PRODUCT].",
      testingNote: "[note what makes it beginner-friendly]",
    },
    {
      title: "Honorable mentions",
      prompt:
        "List 2–3 products that almost made the cut, with the single reason each one missed.",
      testingNote: "[give the one disqualifying reason per product]",
    },
    {
      title: "What to skip",
      prompt:
        "Name products buyers should avoid, with the specific flaw or dealbreaker. Never invent a flaw — skip this section if you have none.",
      testingNote: "[only list products you have a tested reason to warn about]",
    },
    {
      title: "Buying advice",
      prompt:
        "Give 4–6 timeless buying tips for this category: what specs matter, what marketing to ignore, when to buy.",
      testingNote: "[check each tip against your testing experience]",
    },
    {
      title: "Final picks",
      prompt:
        "Restate the final picks by category with one-line reasons. End with the single pick you would buy with your own money.",
      testingNote: "[state your own-money pick]",
    },
  ],
};

function substitute(template: string, product: string): string {
  return template.replace(/\[PRODUCT\]/g, product);
}

/**
 * Build the review outline for a product name and review type.
 * Exported for tests.
 */
export function buildOutline(productName: string, reviewType: ReviewType): OutlineSection[] {
  return STRUCTURES[reviewType].map((s) => ({
    title: substitute(s.title, productName),
    prompt: substitute(s.prompt, productName),
    testingNote: substitute(s.testingNote, productName),
  }));
}

export function runTool(values: Record<string, unknown>): ReviewResult {
  const productName = clean(values?.productName);
  if (!productName) {
    return { ok: false, error: "Enter the product name — it is required." };
  }

  const reviewTypeRaw = clean(values?.reviewType).toLowerCase();
  if (!reviewTypeRaw) {
    return { ok: false, error: "Choose a review type: hands-on, comparison, or roundup." };
  }
  if (!REVIEW_TYPES.includes(reviewTypeRaw as ReviewType)) {
    return {
      ok: false,
      error: `Review type must be one of: ${REVIEW_TYPES.join(", ")} — you entered "${reviewTypeRaw}".`,
    };
  }
  const reviewType = reviewTypeRaw as ReviewType;

  const sections = buildOutline(productName, reviewType);

  const lines: string[] = [];
  lines.push(`# Product Review Outline: "${productName}"`);
  lines.push("");
  lines.push(`Review type: ${reviewType}.`);
  lines.push("");
  lines.push(
    "Each section has a write prompt and a testing-note slot. Fill the slots with what you actually tested — the tool writes no opinions for you."
  );
  lines.push("");

  sections.forEach((s, i) => {
    lines.push(`## ${i + 1}. ${s.title}`);
    lines.push(`Write: ${s.prompt}`);
    lines.push(`Testing note: ${s.testingNote}`);
    lines.push("");
  });

  const titles = sections.map((s, i) => `${i + 1}. ${s.title}`);

  return {
    ok: true,
    values: { outline: lines.join("\n").trimEnd(), sections: titles },
  };
}
