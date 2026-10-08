/**
 * E-E-A-T Checklist Generator — pure logic (tool-038).
 *
 * Zero imports, zero network, zero DOM. Given an optional content type
 * (article | review | guide | homepage, default article), it assembles a
 * checklist from a FIXED item bank: 8 base E-E-A-T items plus type-specific
 * additions. It also emits the checklist as Markdown for copying into a
 * task manager or document.
 *
 * HONESTY (also in meta.ts content.methodology + assumptions):
 * - This checklist is best-practice GUIDANCE, not a Google endorsement.
 *   Google publishes quality-rater guidelines describing E-E-A-T (Experience,
 *   Expertise, Authoritativeness, Trustworthiness); nothing here is an
 *   official Google checklist, and checking every box does not guarantee
 *   rankings or any search outcome.
 * - Items are fixed English strings — general guidance, not tailored advice.
 * - Unknown contentType values fall back to "article" (noted in the
 *   Markdown header), rather than erroring.
 *
 * ITEM BANK (documented sizes):
 * - 8 base items apply to every content type.
 * - article adds 3 (11 total), review adds 4 (12 total),
 *   guide adds 3 (11 total), homepage adds 3 (11 total).
 */

/** Content types the generator recognizes. */
export const CONTENT_TYPES = ["article", "review", "guide", "homepage"] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

/** Human labels for the content types (used in the Markdown header). */
export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  article: "Article / blog post",
  review: "Product review",
  guide: "How-to guide / tutorial",
  homepage: "Homepage",
};

export interface ChecklistItem {
  /** Lowercase kebab id, unique within the generated checklist. */
  id: string;
  /** Short check name. */
  label: string;
  /** One-line how-to for the check (general guidance, not legal advice). */
  detail: string;
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const BASE_ITEMS: ChecklistItem[] = [
  {
    id: "author-byline",
    label: "Show a real author byline",
    detail:
      "Name the human who wrote it and link the byline to an author page with a short bio.",
  },
  {
    id: "author-credentials",
    label: "State the author's credentials",
    detail:
      "Say why this author is qualified: relevant experience, role, or years in the field.",
  },
  {
    id: "first-hand-experience",
    label: "Demonstrate first-hand experience",
    detail:
      "Include evidence you actually did/used/tested it: original photos, screenshots, quotes, or 'I tried' details.",
  },
  {
    id: "original-analysis",
    label: "Add original analysis, not just summary",
    detail:
      "Go beyond rephrasing sources: add your own data, opinions, examples, or conclusions.",
  },
  {
    id: "sources-cited",
    label: "Cite reputable sources for claims",
    detail:
      "Link factual claims to trustworthy sources; avoid unsourced statistics and vague 'studies show'.",
  },
  {
    id: "about-contact",
    label: "Link About and Contact pages",
    detail:
      "The site should have an About page (who runs it) and a Contact page (how to reach you) — link them site-wide.",
  },
  {
    id: "dates-visible",
    label: "Show publish and update dates",
    detail:
      "Display when the content was published and last meaningfully updated.",
  },
  {
    id: "corrections-policy",
    label: "Have a corrections path",
    detail:
      "Give readers a way to report errors and fix mistakes visibly when found.",
  },
];

const TYPE_ITEMS: Record<ContentType, ChecklistItem[]> = {
  article: [
    {
      id: "headline-accuracy",
      label: "Headline matches the content",
      detail:
        "No clickbait: the headline should describe what the article actually delivers.",
    },
    {
      id: "depth-check",
      label: "Cover the topic fully",
      detail:
        "Answer the obvious follow-up questions a reader would have; don't publish a thin take on a deep topic.",
    },
    {
      id: "original-images",
      label: "Use original or properly licensed images",
      detail:
        "Prefer your own visuals; any stock or third-party image must be licensed and credited with descriptive alt text.",
    },
  ],
  review: [
    {
      id: "tested-product",
      label: "Actually test what you review",
      detail:
        "The reviewer should have used the product themselves — say how long and in what conditions.",
    },
    {
      id: "balanced-pros-cons",
      label: "Give balanced pros and cons",
      detail:
        "List genuine downsides, not only selling points; a review with no cons reads as an ad.",
    },
    {
      id: "compare-alternatives",
      label: "Compare against alternatives",
      detail:
        "Show how the product stacks up against at least one real alternative the reader might buy instead.",
    },
    {
      id: "verdict-criteria",
      label: "Tie the verdict to stated criteria",
      detail:
        "State how you judged it (price, performance, ease of use…) and let the verdict follow from those criteria.",
    },
  ],
  guide: [
    {
      id: "steps-complete",
      label: "Make every step complete and actionable",
      detail:
        "No skipped steps or 'figure it out yourself' gaps — each step should be doable as written.",
    },
    {
      id: "prerequisites",
      label: "List prerequisites up front",
      detail:
        "State required tools, skills, accounts, or costs before step one so readers don't get stuck halfway.",
    },
    {
      id: "difficulty-level",
      label: "State the difficulty level",
      detail:
        "Tell the reader whether this is beginner, intermediate, or advanced — and roughly how long it takes.",
    },
  ],
  homepage: [
    {
      id: "clear-offer",
      label: "State what the site offers in one sentence",
      detail:
        "A first-time visitor should understand what the site does within seconds of landing.",
    },
    {
      id: "trust-signals",
      label: "Show trust signals",
      detail:
        "Testimonials, reviews, client logos, press mentions, or usage stats — real ones, not invented.",
    },
    {
      id: "easy-navigation",
      label: "Make key sections reachable in one click",
      detail:
        "Navigation should surface the site's main sections and the About/Contact pages without hunting.",
    },
  ],
};

/** Normalize a raw contentType value; unknown values fall back to "article". */
export function normalizeContentType(raw: unknown): {
  type: ContentType;
  fellBack: boolean;
} {
  if (typeof raw === "string" && (CONTENT_TYPES as readonly string[]).includes(raw)) {
    return { type: raw as ContentType, fellBack: false };
  }
  return { type: "article", fellBack: true };
}

/** Build the checklist for a content type: base items + type-specific items. */
export function buildChecklist(contentType: ContentType): ChecklistItem[] {
  return [...BASE_ITEMS, ...TYPE_ITEMS[contentType]];
}

/** Render the checklist as copyable Markdown, with the honesty header. */
export function renderMarkdown(
  contentType: ContentType,
  items: ChecklistItem[],
  fellBack: boolean,
): string {
  const lines: string[] = [
    `# E-E-A-T Checklist — ${CONTENT_TYPE_LABELS[contentType]}`,
    "",
  ];
  if (fellBack) {
    lines.push(
      '_Showing the article checklist ("unknown type" falls back to article)._',
      "",
    );
  }
  lines.push(
    "> Best-practice guidance only — not a Google endorsement, and checking every box does not guarantee rankings.",
    "",
  );
  for (const item of items) {
    lines.push(`- [ ] **${item.label}** — ${item.detail}`);
  }
  return lines.join("\n");
}

export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    // contentType is optional: default to the article checklist.
    const items = buildChecklist("article");
    return {
      ok: true,
      values: {
        checklist: checklistTable(items),
        checklistMarkdown: renderMarkdown("article", items, false),
      },
    };
  }

  const { type, fellBack } = normalizeContentType(values["contentType"]);
  const items = buildChecklist(type);

  return {
    ok: true,
    values: {
      checklist: checklistTable(items),
      checklistMarkdown: renderMarkdown(type, items, fellBack),
    },
  };
}

/** Shape the checklist as a { columns, rows } table for the UI. */
function checklistTable(items: ChecklistItem[]): {
  columns: string[];
  rows: string[][];
} {
  return {
    columns: ["#", "Check", "How to do it"],
    rows: items.map((item, i) => [
      String(i + 1),
      item.label,
      item.detail,
    ]),
  };
}
