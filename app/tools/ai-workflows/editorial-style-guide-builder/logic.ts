/**
 * Editorial Style Guide Builder (tool-331) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * HONESTY: this is a STYLE-GUIDE ASSEMBLER, not a standards engine. It
 * compiles YOUR questionnaire answers (tone, casing, units, citations,
 * banned words, and any extra sections you add) into a formatted
 * style-guide document. It does NOT choose any standard for you — no
 * default casing rule, no default citation style, no default tone.
 *
 * Fixed questionnaire (documented per the honesty contract):
 * 6 core sections: "Voice & Tone", "Casing & Capitalization",
 * "Numbers & Units", "Citations & Sources", "Banned Words & Phrases",
 * "Grammar & Punctuation".
 *
 * Builder contract: runTool({ items }) -> { ok, values, error }.
 * `values.guide` is the compiled document (Markdown, copy-ready) and
 * `values.sections` is the list of section headings. Output ids match
 * meta.ts outputs ('guide', 'sections').
 *
 * Item shape (one repeatable row in the UI):
 *   - guideName (optional; fill on the first row — used as the title)
 *   - section   (required; name of the style section this rule belongs to)
 *   - rule      (required; your rule, in your words)
 *   - example   (optional; a do/don't example for the rule)
 *
 * Edge cases from the spec:
 *   - at least one item is required
 *   - items capped at 40
 *   - at least one rule must belong to the tone section (spec: "tone
 *     selected") — a section containing "tone" or "voice" counts
 *   - unanswered core sections get a "Decide later" placeholder instead of
 *     invented rules
 */

export interface StyleRuleItem {
  guideName?: string;
  section?: string;
  rule?: string;
  example?: string;
}

export interface StyleGuideValues {
  /** The compiled style-guide document (Markdown). */
  guide: string;
  /** Section headings in document order. */
  sections: string[];
}

export interface StyleGuideResult {
  ok: boolean;
  values?: StyleGuideValues;
  error?: string;
}

/** The fixed questionnaire every style guide is compiled against. */
export const CORE_SECTIONS: string[] = [
  "Voice & Tone",
  "Casing & Capitalization",
  "Numbers & Units",
  "Citations & Sources",
  "Banned Words & Phrases",
  "Grammar & Punctuation",
];

/** Spec edge case: builder accepts at most 40 rule rows. */
export const MAX_ITEMS = 40;

/** Placeholder for core sections the user left unanswered. */
export const DECIDE_LATER = "Decide later — no rule entered for this section yet.";

export const DEFAULT_GUIDE_NAME = "Editorial Style Guide";

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** A section counts as the tone section when it names tone or voice. */
function isToneSection(section: string): boolean {
  return /tone|voice/i.test(section);
}

interface Rule {
  rule: string;
  example: string;
}

/**
 * Assemble the style-guide document from the user's answers. Rules keep
 * the user's wording verbatim; section order follows first appearance,
 * with unanswered core sections appended as "Decide later" placeholders.
 */
export function runTool(args: { items: Record<string, unknown>[] }): StyleGuideResult {
  const items = args?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Add at least one rule to build your style guide." };
  }
  if (items.length > MAX_ITEMS) {
    return {
      ok: false,
      error: `Too many rules: the builder accepts at most ${MAX_ITEMS} rules per guide.`,
    };
  }

  let guideName = "";
  const sectionOrder: string[] = [];
  const rulesBySection: Record<string, Rule[]> = {};

  for (let i = 0; i < items.length; i++) {
    const item = items[i] as StyleRuleItem;
    const n = i + 1;
    const section = clean(item.section);
    const rule = clean(item.rule);
    const example = clean(item.example);

    if (!section) {
      return { ok: false, error: `Item ${n}: section name is required (e.g. "Voice & Tone").` };
    }
    if (!rule) {
      return { ok: false, error: `Item ${n}: the rule text is required.` };
    }
    if (!guideName) {
      guideName = clean(item.guideName);
    }
    if (!rulesBySection[section]) {
      rulesBySection[section] = [];
      sectionOrder.push(section);
    }
    rulesBySection[section].push({ rule, example });
  }

  if (!sectionOrder.some(isToneSection)) {
    return {
      ok: false,
      error:
        'Add at least one rule for the "Voice & Tone" section — every style guide starts with tone.',
    };
  }

  const title = guideName || DEFAULT_GUIDE_NAME;

  // Core sections the user never answered become "Decide later" placeholders.
  for (const core of CORE_SECTIONS) {
    if (!rulesBySection[core]) {
      rulesBySection[core] = [];
      sectionOrder.push(core);
    }
  }

  const lines: string[] = [];
  lines.push(`# ${title}`);
  lines.push("");
  lines.push("Compiled from your answers. This guide sets no standards for you — every rule below is yours.");
  lines.push("");

  sectionOrder.forEach((section, idx) => {
    const rules = rulesBySection[section];
    lines.push(`## ${idx + 1}. ${section}`);
    if (rules.length === 0) {
      lines.push(`- ${DECIDE_LATER}`);
    } else {
      for (const r of rules) {
        lines.push(`- ${r.rule}`);
        if (r.example) {
          lines.push(`  - Example: ${r.example}`);
        }
      }
    }
    lines.push("");
  });

  const headings = sectionOrder.map((section, idx) => `${idx + 1}. ${section}`);

  return {
    ok: true,
    values: { guide: lines.join("\n").trimEnd(), sections: headings },
  };
}
