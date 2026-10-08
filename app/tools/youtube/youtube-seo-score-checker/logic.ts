/**
 * YouTube SEO Score Checker (tool-146) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * HEURISTIC CHECKLIST SCORER — PUBLISHED CHECKS (weights sum to 100):
 *   1. titleHasKeyword        (15) — target keyword appears in the title
 *   2. keywordFrontLoaded     (10) — keyword starts within the first 40 chars of the title
 *   3. titleLengthOk          (10) — title is 70 visible chars or fewer
 *   4. descriptionLengthOk    (10) — description is at least 200 chars
 *   5. keywordInDescFirst150  (10) — keyword appears in the first 150 chars of the description
 *   6. validChapters          (10) — at least one valid chapter line, starting at 0:00
 *   7. descHasLink            (5)  — description contains an http(s) link
 *   8. tagsOk                 (10) — at least 1 tag and total tag length ≤ 500 chars
 *   9. tagRelevance           (10) — at least 1 tag shares a word with the keyword
 *   10. thumbnailTextProvided  (10) — thumbnail overlay text was entered (has text)
 *
 * HONESTY: this is a METADATA COMPLETENESS score, not an SEO ranking
 * prediction. YouTube publishes no ranking formula, so no tool can measure
 * ranking likelihood — this checks whether your metadata follows widely
 * recommended on-page practices. Checks 1, 2, 5, 9 need a target keyword;
 * without one they fail with a fix suggesting you add it.
 *
 * Deterministic: same inputs → same output, always.
 */

export interface SeoCheck {
  id: string;
  label: string;
  weight: number;
  passed: boolean;
  detail: string;
  fix: string;
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** YouTube's total tag-length limit per video. */
export const MAX_TAGS_CHARS = 500;
/** Title chars fully visible in search/browse before truncation. */
export const MAX_TITLE_CHARS = 70;
/** Description chars roughly visible above the fold. */
export const DESC_FOLD_CHARS = 150;
/** Minimum description length that lets keywords + links fit. */
export const MIN_DESC_CHARS = 200;
/** Front-load window: keyword should start within this many title chars. */
export const FRONT_LOAD_CHARS = 40;

export const DISCLAIMER =
  "This is a metadata completeness score (0–100), not a ranking prediction. YouTube publishes no ranking formula, and watch time, CTR, and audience behavior — which this tool cannot see — drive actual performance. Use the fix list to tidy your metadata, then measure real results in YouTube Studio.";

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function hasKeyword(haystack: string, keyword: string): boolean {
  return norm(haystack).includes(norm(keyword));
}

/** A chapter line looks like "0:00 Intro" (starts at 0:00). */
function parseChapters(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /^\d{1,3}:\d{2}\s+\S/.test(l));
}

function runChecks(
  title: string,
  keyword: string,
  description: string,
  tagsRaw: string,
  chaptersRaw: string,
  thumbnailText: string
): SeoCheck[] {
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  const tagChars = tags.join(", ").length;
  const chapters = parseChapters(chaptersRaw);
  const hasValidChapters =
    chapters.length > 0 && chapters[0].startsWith("0:00");
  const kwWords = norm(keyword)
    .split(" ")
    .filter((w) => w.length > 2);
  const tagWordSet = new Set(
    tags.flatMap((t) => norm(t).split(" ").filter((w) => w.length > 2))
  );
  const tagRelevant =
    keyword.length > 0 && kwWords.some((w) => tagWordSet.has(w));
  const descFold = description.slice(0, DESC_FOLD_CHARS);
  const hasLink = /https?:\/\/\S+/i.test(description);

  const checks: SeoCheck[] = [
    {
      id: "titleHasKeyword",
      label: "Title contains the target keyword",
      weight: 15,
      passed: keyword.length > 0 && hasKeyword(title, keyword),
      detail:
        keyword.length === 0
          ? "No target keyword entered, so this cannot pass."
          : hasKeyword(title, keyword)
            ? `Keyword "${keyword}" found in the title.`
            : `Keyword "${keyword}" not found in the title.`,
      fix: `Add your exact target keyword ("${keyword || "your main topic"}") to the title.`,
    },
    {
      id: "keywordFrontLoaded",
      label: "Keyword front-loaded in the title",
      weight: 10,
      passed:
        keyword.length > 0 &&
        norm(title).slice(0, FRONT_LOAD_CHARS).includes(norm(keyword)),
      detail:
        keyword.length === 0
          ? "No target keyword entered."
          : norm(title).slice(0, FRONT_LOAD_CHARS).includes(norm(keyword))
            ? `Keyword appears within the first ${FRONT_LOAD_CHARS} characters.`
            : `Keyword starts after the first ${FRONT_LOAD_CHARS} characters.`,
      fix: "Move the keyword to the start of the title — the first 40 characters matter most in search results.",
    },
    {
      id: "titleLengthOk",
      label: `Title is ${MAX_TITLE_CHARS} visible characters or fewer`,
      weight: 10,
      passed: title.length <= MAX_TITLE_CHARS,
      detail: `Title is ${title.length} characters${title.length > MAX_TITLE_CHARS ? " — it will be truncated in search" : ""}.`,
      fix: `Trim the title to ${MAX_TITLE_CHARS} characters or fewer so it shows fully in search.`,
    },
    {
      id: "descriptionLengthOk",
      label: `Description is at least ${MIN_DESC_CHARS} characters`,
      weight: 10,
      passed: description.trim().length >= MIN_DESC_CHARS,
      detail: `Description is ${description.trim().length} characters.`,
      fix: `Expand the description to at least ${MIN_DESC_CHARS} characters — summarize the video, add timestamps and links.`,
    },
    {
      id: "keywordInDescFirst150",
      label: `Keyword in the first ${DESC_FOLD_CHARS} description characters`,
      weight: 10,
      passed: keyword.length > 0 && hasKeyword(descFold, keyword),
      detail:
        keyword.length === 0
          ? "No target keyword entered."
          : hasKeyword(descFold, keyword)
            ? "Keyword found above the fold."
            : "Keyword not found in the first 150 characters.",
      fix: `Work the keyword ("${keyword || "your main topic"}") into the first 2 sentences of the description.`,
    },
    {
      id: "validChapters",
      label: "Valid chapter list starting at 0:00",
      weight: 10,
      passed: hasValidChapters,
      detail:
        chapters.length === 0
          ? "No chapter lines detected."
          : chapters[0].startsWith("0:00")
            ? `${chapters.length} chapter line(s) detected, starting at 0:00.`
            : "Chapter lines found but the first does not start at 0:00.",
      fix: "Add chapters as lines like '0:00 Intro' (first chapter must start at 0:00) — YouTube requires 3+ chapters to show them on the progress bar.",
    },
    {
      id: "descHasLink",
      label: "Description contains a link",
      weight: 5,
      passed: hasLink,
      detail: hasLink ? "At least one http(s) link found." : "No link found in the description.",
      fix: "Add at least one relevant link (your site, a related video, a resource) to the description.",
    },
    {
      id: "tagsOk",
      label: `Tags present and within ${MAX_TAGS_CHARS} chars`,
      weight: 10,
      passed: tags.length > 0 && tagChars <= MAX_TAGS_CHARS,
      detail:
        tags.length === 0
          ? "No tags entered."
          : `${tags.length} tag(s), ${tagChars}/${MAX_TAGS_CHARS} characters.`,
      fix: `Add relevant tags (comma-separated); keep total length under ${MAX_TAGS_CHARS} characters.`,
    },
    {
      id: "tagRelevance",
      label: "At least one tag matches the keyword",
      weight: 10,
      passed: tagRelevant,
      detail:
        keyword.length === 0
          ? "No target keyword entered."
          : tagRelevant
            ? "A tag shares a word with the target keyword."
            : "No tag shares a word with the target keyword.",
      fix: `Include a tag containing your keyword ("${keyword || "your main topic"}") or its key words.`,
    },
    {
      id: "thumbnailTextProvided",
      label: "Thumbnail text entered for readability check",
      weight: 10,
      passed: thumbnailText.trim().length > 0,
      detail:
        thumbnailText.trim().length > 0
          ? "Thumbnail text provided — pair with the Thumbnail Text Shortener for a readability pass."
          : "No thumbnail text entered.",
      fix: "Enter your planned thumbnail text so you can run a readability check (keep it to 5 words or fewer).",
    },
  ];
  return checks;
}

function grade(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs work";
  return "Weak";
}

/**
 * Checker entry point.
 * `values.title` (required). Optional: targetKeyword, description, tags
 * (comma-separated), chapters (one "0:00 Name" per line), thumbnailText.
 *
 * Output keys (must match meta.ts outputs): score, grade, checkResults,
 * fixes, disclaimer.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const str = (k: string): string =>
    typeof values[k] === "string" ? (values[k] as string) : "";

  const title = str("title").trim();
  if (title.length === 0) {
    return {
      ok: false,
      error: "Enter a video title first — the checker needs it to score anything.",
    };
  }
  if (title.length > 500) {
    return {
      ok: false,
      error: "Title is too long — keep it under 500 characters.",
    };
  }

  const keyword = str("targetKeyword").trim();
  const description = str("description");
  const tagsRaw = str("tags");
  const chaptersRaw = str("chapters");
  const thumbnailText = str("thumbnailText");

  const checks = runChecks(
    title,
    keyword,
    description,
    tagsRaw,
    chaptersRaw,
    thumbnailText
  );
  const score = checks.reduce((sum, c) => sum + (c.passed ? c.weight : 0), 0);
  const fixes = checks.filter((c) => !c.passed).map((c) => c.fix);

  return {
    ok: true,
    values: {
      score,
      grade: grade(score),
      checkResults: checks.map(
        (c) => `${c.passed ? "PASS" : "FAIL"} [${c.weight} pts] ${c.label} — ${c.detail}`
      ),
      fixes,
      disclaimer: DISCLAIMER,
    },
  };
}
