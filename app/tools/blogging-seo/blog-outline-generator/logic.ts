/**
 * Blog Outline Generator — pure logic (tool-032).
 *
 * Zero imports, zero network, zero DOM. Builds a structured H1/H2/H3 blog
 * outline from FIXED heading-template banks (never AI-generated):
 *
 *   - INTRO_BANK:   4 intro heading templates
 *   - BODY_BANK:   10 body section templates ({topic} placeholder)
 *   - SUBPOINT_BANK: 6 generic H3 sub-point templates
 *   - CLOSER_BANK:  3 conclusion heading templates
 *
 * Depth picks how much of the banks are used (always in bank order — no
 * randomness, fully deterministic):
 *   - basic:    intro H2 + 4 body H2s (1 H3 each) + closer H2  = 10 headings
 *   - standard: intro H2 + 6 body H2s (2 H3s each) + closer H2 = 20 headings
 *   - deep:     intro H2 + 10 body H2s (3 H3s each) + closer H2 = 42 headings
 *
 * ASSUMPTIONS (also surfaced in the outline's footer note):
 * - Headings are generic templates filled with your title/topic — they are
 *   starting points; rewrite for the target keyword and SERP before writing.
 * - Sub-points are intentionally generic writing prompts, not topic research.
 * - The tool does not check SERPs, keyword difficulty, or search volume.
 */

/** Fixed intro-heading bank: 4 templates. */
export const INTRO_BANK: readonly string[] = [
  "Introduction: Why {topic} Matters",
  "What You'll Learn About {topic}",
  "The Short Answer on {topic}",
  "Introduction: A Quick Overview of {topic}",
];

/** Fixed body-section bank: 10 templates, used in order. */
export const BODY_BANK: readonly string[] = [
  "What Is {topic}?",
  "How {topic} Works",
  "Key Benefits of {topic}",
  "Getting Started with {topic}",
  "Common Mistakes to Avoid",
  "Pro Tips for Better Results",
  "Tools You'll Need",
  "Real Examples and Case Studies",
  "Advanced Strategies",
  "Troubleshooting Common Problems",
];

/** Fixed H3 sub-point bank: 6 generic writing prompts, cycled in order. */
export const SUBPOINT_BANK: readonly string[] = [
  "Definition and key terms",
  "Step-by-step breakdown",
  "Do's and don'ts",
  "Quick-start checklist",
  "What the experts recommend",
  "Where to learn more",
];

/** Fixed conclusion-heading bank: 3 templates. */
export const CLOSER_BANK: readonly string[] = [
  "Conclusion: Key Takeaways",
  "Your Next Steps",
  "Final Thoughts and Call to Action",
];

export const INTRO_BANK_SIZE = INTRO_BANK.length; // 4
export const BODY_BANK_SIZE = BODY_BANK.length; // 10
export const SUBPOINT_BANK_SIZE = SUBPOINT_BANK.length; // 6
export const CLOSER_BANK_SIZE = CLOSER_BANK.length; // 3

export const MIN_TITLE_LENGTH = 2;
export const MAX_TITLE_LENGTH = 150;
export const MAX_KEYWORD_LENGTH = 100;

export type OutlineDepth = "basic" | "standard" | "deep";
export const DEFAULT_DEPTH: OutlineDepth = "standard";

export interface OutlineHeading {
  level: 2 | 3;
  text: string;
}

function fillTopic(template: string, topic: string): string {
  return template.replace(/\{topic\}/g, topic);
}

/** Derive a short {topic} phrase from the title (strip common prefixes). */
export function topicFromTitle(title: string): string {
  return title
    .replace(/^(how to|the ultimate guide to|a beginner's guide to|what is|why)\s+/i, "")
    .replace(/\s*[:\-–—]\s*.*$/, "")
    .trim();
}

const DEPTH_CONFIG: Record<OutlineDepth, { bodyCount: number; subPoints: number }> = {
  basic: { bodyCount: 4, subPoints: 1 },
  deep: { bodyCount: 10, subPoints: 3 },
  standard: { bodyCount: 6, subPoints: 2 },
};

/**
 * Build the heading list. Throws TypeError on invalid input; runTool()
 * converts those into { ok: false }.
 */
export function buildOutline(
  title: string,
  targetKeyword: string,
  depth: OutlineDepth,
): OutlineHeading[] {
  const cfg = DEPTH_CONFIG[depth];
  const topic = topicFromTitle(title);
  const headings: OutlineHeading[] = [];

  headings.push({ level: 2, text: fillTopic(INTRO_BANK[0], topic) });

  const subCycle = SUBPOINT_BANK.slice(0, cfg.subPoints);
  for (let i = 0; i < cfg.bodyCount; i += 1) {
    headings.push({ level: 2, text: fillTopic(BODY_BANK[i], topic) });
    for (let s = 0; s < cfg.subPoints; s += 1) {
      headings.push({
        level: 3,
        text: subCycle[(i * cfg.subPoints + s) % subCycle.length],
      });
    }
  }

  headings.push({ level: 2, text: CLOSER_BANK[0] });
  return headings;
}

export function outlineToMarkdown(
  title: string,
  targetKeyword: string,
  headings: OutlineHeading[],
): string {
  const lines: string[] = [`# ${title}`, ""];
  if (targetKeyword.length > 0) {
    lines.push(`> Target keyword: ${targetKeyword}`, "");
  }
  for (const h of headings) {
    lines.push(`${h.level === 2 ? "##" : "###"} ${h.text}`);
  }
  lines.push(
    "",
    "---",
    "",
    "_This outline is assembled from fixed heading templates — it is not AI-generated and contains no topic research. Rewrite the headings for your target keyword and verify against the SERP before writing._",
  );
  return lines.join("\n");
}

function parseDepth(raw: unknown): OutlineDepth | null {
  if (raw === undefined) return DEFAULT_DEPTH;
  if (raw === "basic" || raw === "standard" || raw === "deep") return raw;
  return null;
}

/**
 * runTool entry point (generator template contract).
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const title = values["title"];
  const rawKeyword = values["targetKeyword"];
  const rawDepth = values["depth"];

  if (typeof title !== "string" || title.trim().length < MIN_TITLE_LENGTH) {
    return {
      ok: false,
      error: `Title is required (${MIN_TITLE_LENGTH}-${MAX_TITLE_LENGTH} characters).`,
    };
  }
  if (title.trim().length > MAX_TITLE_LENGTH) {
    return {
      ok: false,
      error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`,
    };
  }
  if (
    rawKeyword !== undefined &&
    (typeof rawKeyword !== "string" ||
      rawKeyword.trim().length === 0 ||
      rawKeyword.trim().length > MAX_KEYWORD_LENGTH)
  ) {
    return {
      ok: false,
      error: `Target keyword must be 1-${MAX_KEYWORD_LENGTH} characters when provided.`,
    };
  }
  const depth = parseDepth(rawDepth);
  if (depth === null) {
    return {
      ok: false,
      error: 'Depth must be "basic", "standard" or "deep".',
    };
  }

  const cleanTitle = (title as string).trim();
  const keyword =
    typeof rawKeyword === "string" ? (rawKeyword as string).trim() : "";
  const headings = buildOutline(cleanTitle, keyword, depth);
  return {
    ok: true,
    values: {
      outlineMarkdown: outlineToMarkdown(cleanTitle, keyword, headings),
      headingCount: headings.length,
    },
  };
}
