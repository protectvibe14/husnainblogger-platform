/**
 * Pre-Publish SEO Checklist — pure logic (tool-039).
 *
 * Zero imports, zero network, zero DOM. Given an optional draft title,
 * meta description, and target keyword, it evaluates what it can
 * AUTOMATICALLY (character counts, keyword presence — pure string checks
 * on the fields you provide) and pairs those with MANUAL checks the tool
 * cannot see (slug, headings, images, links). Items it cannot evaluate
 * are marked "manual", never guessed.
 *
 * HONESTY (also in meta.ts content.methodology + assumptions):
 * - This is general guidance, not an audit. The tool cannot see your
 *   page, CMS, or search results — it only checks the three optional
 *   strings you paste in.
 * - Length targets (title 30-60, meta 120-160 characters) are common
 *   industry guidance, not Google rules; passing them does not guarantee
 *   rankings or any SERP display.
 * - "Manual" items are honest unknowns: the tool reports what YOU need
 *   to verify by hand instead of inventing a result.
 */

/** Recommended title length range (characters) — industry guidance, not a Google rule. */
export const TITLE_MIN = 30;
export const TITLE_MAX = 60;

/** Recommended meta description length range (characters) — industry guidance. */
export const META_MIN = 120;
export const META_MAX = 160;

/** Maximum characters accepted per input field. */
export const MAX_TITLE_CHARS = 200;
export const MAX_META_CHARS = 500;
export const MAX_KEYWORD_CHARS = 100;

export type CheckStatus = "pass" | "fail" | "manual";

export interface ChecklistCheck {
  id: string;
  label: string;
  detail: string;
  /** pass/fail = evaluated from your inputs; manual = verify by hand. */
  status: CheckStatus;
  /** Concrete finding for evaluated checks (e.g. "42 characters"). */
  finding?: string;
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function readString(raw: unknown): string {
  return typeof raw === "string" ? raw.trim() : "";
}

function containsKeyword(text: string, keyword: string): boolean {
  return text.toLowerCase().includes(keyword.toLowerCase());
}

export interface CheckInputs {
  title: string;
  metaDescription: string;
  targetKeyword: string;
}

/** Build the full checklist for the given (optional) inputs. */
export function buildChecks(input: CheckInputs): ChecklistCheck[] {
  const { title, metaDescription, targetKeyword } = input;
  const checks: ChecklistCheck[] = [];

  // --- Automatic checks (evaluated from the pasted fields) ---

  if (title.length === 0) {
    checks.push({
      id: "title-length",
      label: "Title length 30-60 characters",
      detail:
        "Keep titles roughly 30-60 characters so they are less likely to be truncated in search results. Paste your title to evaluate this.",
      status: "manual",
    });
  } else if (title.length >= TITLE_MIN && title.length <= TITLE_MAX) {
    checks.push({
      id: "title-length",
      label: "Title length 30-60 characters",
      detail:
        "Keep titles roughly 30-60 characters so they are less likely to be truncated in search results.",
      status: "pass",
      finding: `${title.length} characters.`,
    });
  } else {
    checks.push({
      id: "title-length",
      label: "Title length 30-60 characters",
      detail:
        "Keep titles roughly 30-60 characters so they are less likely to be truncated in search results.",
      status: "fail",
      finding: `${title.length} characters (aim ${TITLE_MIN}-${TITLE_MAX}).`,
    });
  }

  if (title.length === 0 || targetKeyword.length === 0) {
    checks.push({
      id: "title-keyword",
      label: "Target keyword in the title",
      detail:
        "Include your target keyword in the title, ideally near the start. Requires both a title and a keyword to evaluate.",
      status: "manual",
    });
  } else if (containsKeyword(title, targetKeyword)) {
    checks.push({
      id: "title-keyword",
      label: "Target keyword in the title",
      detail:
        "Include your target keyword in the title, ideally near the start.",
      status: "pass",
      finding: `Found "${targetKeyword}" in the title.`,
    });
  } else {
    checks.push({
      id: "title-keyword",
      label: "Target keyword in the title",
      detail:
        "Include your target keyword in the title, ideally near the start.",
      status: "fail",
      finding: `"${targetKeyword}" not found in the title.`,
    });
  }

  if (metaDescription.length === 0) {
    checks.push({
      id: "meta-length",
      label: "Meta description 120-160 characters",
      detail:
        "A 120-160 character meta description is less likely to be cut off and can improve click-through. Paste yours to evaluate this.",
      status: "manual",
    });
  } else if (
    metaDescription.length >= META_MIN &&
    metaDescription.length <= META_MAX
  ) {
    checks.push({
      id: "meta-length",
      label: "Meta description 120-160 characters",
      detail:
        "A 120-160 character meta description is less likely to be cut off and can improve click-through.",
      status: "pass",
      finding: `${metaDescription.length} characters.`,
    });
  } else {
    checks.push({
      id: "meta-length",
      label: "Meta description 120-160 characters",
      detail:
        "A 120-160 character meta description is less likely to be cut off and can improve click-through.",
      status: "fail",
      finding: `${metaDescription.length} characters (aim ${META_MIN}-${META_MAX}).`,
    });
  }

  if (metaDescription.length === 0 || targetKeyword.length === 0) {
    checks.push({
      id: "meta-keyword",
      label: "Target keyword in the meta description",
      detail:
        "Work the keyword into the meta description naturally so searchers see a relevant snippet. Requires both a meta description and a keyword to evaluate.",
      status: "manual",
    });
  } else if (containsKeyword(metaDescription, targetKeyword)) {
    checks.push({
      id: "meta-keyword",
      label: "Target keyword in the meta description",
      detail:
        "Work the keyword into the meta description naturally so searchers see a relevant snippet.",
      status: "pass",
      finding: `Found "${targetKeyword}" in the meta description.`,
    });
  } else {
    checks.push({
      id: "meta-keyword",
      label: "Target keyword in the meta description",
      detail:
        "Work the keyword into the meta description naturally so searchers see a relevant snippet.",
      status: "fail",
      finding: `"${targetKeyword}" not found in the meta description.`,
    });
  }

  // --- Manual checks (the tool cannot see your page — verify by hand) ---

  const manual: Array<[string, string, string]> = [
    [
      "slug-keyword",
      "Keyword in the URL slug",
      "The post slug should contain the target keyword, be short, and use hyphens — check this in your CMS.",
    ],
    [
      "h1-keyword",
      "One H1 containing the keyword",
      "Use exactly one H1 per post and include the target keyword (or a close variant) in it.",
    ],
    [
      "keyword-in-intro",
      "Keyword in the first 100 words",
      "Mention the target keyword naturally in the opening paragraph so the topic is clear immediately.",
    ],
    [
      "images-alt",
      "Descriptive alt text on images",
      "Every content image needs descriptive alt text; decorative images should have empty alt attributes.",
    ],
    [
      "internal-links",
      "Internal links both ways",
      "Link out to related posts on your site, and make sure at least one related post links to this one.",
    ],
    [
      "external-sources",
      "Cite reputable external sources",
      "Back up factual claims with links to trustworthy sources — it supports both readers and E-E-A-T.",
    ],
    [
      "mobile-preview",
      "Preview on mobile",
      "Open the draft on a phone: readable text size, no broken layout, no overlapping elements.",
    ],
    [
      "read-aloud",
      "Read the post aloud",
      "Read it end to end (aloud is best) to catch typos, awkward phrasing, and flow problems.",
    ],
  ];
  for (const [id, label, detail] of manual) {
    checks.push({ id, label, detail, status: "manual" });
  }

  return checks;
}

/** Shape the checklist as a { columns, rows } table for the UI. */
function checklistTable(checks: ChecklistCheck[]): {
  columns: string[];
  rows: string[][];
} {
  return {
    columns: ["#", "Check", "Status", "How to do it", "Finding"],
    rows: checks.map((c, i) => [
      String(i + 1),
      c.label,
      c.status.toUpperCase(),
      c.detail,
      c.finding ?? "Verify by hand.",
    ]),
  };
}

export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    // All inputs optional: return the generic checklist (all manual).
    const checks = buildChecks({ title: "", metaDescription: "", targetKeyword: "" });
    return {
      ok: true,
      values: {
        checklist: checklistTable(checks),
        passCount: 0,
        failCount: 0,
      },
    };
  }

  const title = readString(values["title"]);
  const metaDescription = readString(values["metaDescription"]);
  const targetKeyword = readString(values["targetKeyword"]);

  if (title.length > MAX_TITLE_CHARS) {
    return {
      ok: false,
      error: `Title is ${title.length} characters (max ${MAX_TITLE_CHARS}).`,
    };
  }
  if (metaDescription.length > MAX_META_CHARS) {
    return {
      ok: false,
      error: `Meta description is ${metaDescription.length} characters (max ${MAX_META_CHARS}).`,
    };
  }
  if (targetKeyword.length > MAX_KEYWORD_CHARS) {
    return {
      ok: false,
      error: `Target keyword is ${targetKeyword.length} characters (max ${MAX_KEYWORD_CHARS}).`,
    };
  }

  const checks = buildChecks({ title, metaDescription, targetKeyword });
  const passCount = checks.filter((c) => c.status === "pass").length;
  const failCount = checks.filter((c) => c.status === "fail").length;

  return {
    ok: true,
    values: {
      checklist: checklistTable(checks),
      passCount,
      failCount,
    },
  };
}
