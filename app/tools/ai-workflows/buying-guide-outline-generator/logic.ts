/**
 * Buying Guide Outline Generator (tool-337) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * HONESTY: this is an OUTLINE ASSEMBLER built from FIXED templates. It
 * structures YOUR category name and YOUR budget tiers into a buying-guide
 * outline with tier slots and a criteria checklist. No product
 * recommendations are made or invented — the "pick" slots are brackets
 * you fill after real research or testing.
 *
 * Fixed banks (documented per the honesty contract):
 *   - CRITERIA: 6 fixed buying criteria (substituted with [CATEGORY]).
 *   - FIXED_SECTIONS: 5 sections every guide carries (intro, how to
 *     choose, features worth paying for, what to avoid, final verdict).
 *   - TIER_SLOT: 1 section per budget tier.
 *   - DEFAULT_TIERS: 3 ("Budget", "Mid-range", "Premium") used only when
 *     the user enters no tiers (marked as defaults, not recommendations).
 *
 * Generator contract: runTool(values) -> { ok, values, error }.
 * `values.outline` is the full outline (Markdown, copy-ready),
 * `values.sections` is the numbered section-title list, and
 * `values.criteria` is the criteria checklist.
 * Output ids match meta.ts outputs ('outline', 'sections', 'criteria').
 *
 * Inputs:
 *   - categoryName (required; e.g. "robot vacuum cleaners")
 *   - budgetTiers (optional textarea; one tier per line, e.g. "Under $100")
 *
 * Edge cases from the spec: none beyond required categoryName.
 */

export interface GuideValues {
  /** The full buying-guide outline (Markdown, copy-ready). */
  outline: string;
  /** Numbered section titles. */
  sections: string[];
  /** The criteria checklist. */
  criteria: string[];
}

export interface GuideResult {
  ok: boolean;
  values?: GuideValues;
  error?: string;
}

/** Spec: at most 8 budget tiers. */
export const MAX_TIERS = 8;

/**
 * Fixed buying criteria. [CATEGORY] is substituted with the user's
 * category name.
 */
export const CRITERIA: string[] = [
  "Budget fit — the total cost of [CATEGORY], including any extras or subscriptions.",
  "Key features — the 3–5 features that actually matter for [CATEGORY], not the marketing list.",
  "Build quality — how long [CATEGORY] lasts and what the warranty covers.",
  "Ease of use — setup time, learning curve, and daily friction for [CATEGORY].",
  "Reviews and reputation — what verified owners say about [CATEGORY] over time.",
  "Running costs — maintenance, replacements, or fees [CATEGORY] needs after purchase.",
];

/** Default tier slots, used only when the user enters no tiers. */
export const DEFAULT_TIERS: string[] = ["Budget", "Mid-range", "Premium"];

export interface GuideSection {
  title: string;
  prompt: string;
  slot: string;
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function substitute(template: string, category: string): string {
  return template.replace(/\[CATEGORY\]/g, category);
}

/**
 * Parse the budgetTiers textarea: one tier per line, deduplicated,
 * capped at MAX_TIERS. Exported for tests.
 */
export function parseTiers(raw: unknown): string[] {
  const text = typeof raw === "string" ? raw : "";
  const tiers: string[] = [];
  for (const line of text.split("\n")) {
    const tier = line.trim();
    if (tier && !tiers.includes(tier)) {
      tiers.push(tier);
    }
  }
  return tiers.slice(0, MAX_TIERS);
}

/**
 * Build the buying-guide outline. Exported for tests.
 */
export function buildOutline(category: string, tiers: string[]): GuideSection[] {
  const tierSections: GuideSection[] = tiers.map((tier) => ({
    title: `${tier} picks`,
    prompt:
      `Recommend 1–3 ${category} at the "${tier}" tier. For each pick: one-line verdict, ` +
      `the buyer it suits, and the main trade-off versus the next tier up.`,
    slot: "[add the product after real research or testing — never invent a pick]",
  }));

  const fixed: GuideSection[] = [
    {
      title: `What this guide covers`,
      prompt:
        `State what ${category} this guide covers, who it is written for, and how the picks were chosen. ` +
        `Say plainly what you tested versus what you researched.`,
      slot: "[describe your method: tested, researched, or both]",
    },
    {
      title: "How to choose — key criteria",
      prompt:
        `Walk through each criterion below and explain what "good" looks like for ${category}. ` +
        `Keep it practical: numbers, ranges, and minimums where they exist.`,
      slot: "[work through the criteria checklist below]",
    },
    ...tierSections,
    {
      title: "Features worth paying for",
      prompt:
        `Name the ${category} features that justify a higher price, and the "premium" features that are ` +
        `marketing in your category. Help readers spend where it counts.`,
      slot: "[list 3–5 features, each with a one-line justification]",
    },
    {
      title: "What to avoid",
      prompt:
        `Name the ${category} traps: overpriced features, unreliable brands, and specs that look good ` +
        `but do not matter. Only warn about things you can back up.`,
      slot: "[only list traps you have a tested or sourced reason to warn about]",
    },
    {
      title: "Final recommendation",
      prompt:
        `Close with one top pick per tier and the single pick you would buy with your own money. ` +
        `Restate the one criterion that decided it.`,
      slot: "[your own-money pick and the deciding criterion]",
    },
  ];

  return fixed;
}

export function runTool(values: Record<string, unknown>): GuideResult {
  const category = clean(values?.categoryName);
  if (!category) {
    return { ok: false, error: "Enter the product category — it is required." };
  }

  let tiers = parseTiers(values?.budgetTiers);
  const usingDefaultTiers = tiers.length === 0;
  if (usingDefaultTiers) {
    tiers = [...DEFAULT_TIERS];
  }

  const criteria = CRITERIA.map((c) => substitute(c, category));
  const sections = buildOutline(category, tiers);

  const lines: string[] = [];
  lines.push(`# Buying Guide Outline: ${category}`);
  lines.push("");
  lines.push(
    "Each section has a write prompt and a pick slot. Fill the slots with products you researched or tested — " +
      "the tool makes no recommendations."
  );
  if (usingDefaultTiers) {
    lines.push("");
    lines.push("_No tiers entered — default tier slots are used. Replace them with your own price tiers._");
  }
  lines.push("");

  sections.forEach((s, i) => {
    lines.push(`## ${i + 1}. ${s.title}`);
    lines.push(`Write: ${s.prompt}`);
    lines.push(`Slot: ${s.slot}`);
    lines.push("");
  });

  lines.push("## Criteria checklist");
  criteria.forEach((c) => lines.push(`- [ ] ${c}`));
  lines.push("");

  const titles = sections.map((s, i) => `${i + 1}. ${s.title}`);

  return {
    ok: true,
    values: {
      outline: lines.join("\n").trimEnd(),
      sections: titles,
      criteria,
    },
  };
}
