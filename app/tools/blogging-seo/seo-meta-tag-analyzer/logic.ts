/**
 * SEO Meta Tag Analyzer — pure logic (Lane C, rule-based).
 *
 * ASSUMPTIONS:
 * - No DOM, no network, no imports. Pure string analysis.
 * - Thresholds used are real, widely documented SEO standards (not invented):
 *   - Title tag: 50–60 characters (Google typically truncates past ~60).
 *   - Meta description: 140–155 characters (typical desktop snippet length;
 *     mobile shows less — documented limitation).
 *   These are display-based guidelines from SEO industry consensus, not
 *   ranking factors published by Google. The tool labels them as such.
 * - Checks performed:
 *   1. Title length (20 pts): 50–60 = full; 40–49 or 61–70 = 12; else 5
 *      (empty title = 0, but runTool rejects empty titles as invalid input).
 *   2. Description length (20 pts): 140–155 = full; 120–139 or 156–170 = 12;
 *      present but outside = 5; missing = 0.
 *   3. Keyword in title (15 pts): primary keyword (case-insensitive) appears
 *      in the title. Bonus note if it appears in the first half.
 *   4. Keyword in description (15 pts): primary keyword appears in the
 *      description.
 *   5. OG tags (15 pts): 5 pts each for og:title, og:description, og:image
 *      reported present (user self-reports via checkboxes — honest input).
 *   6. Uniqueness signals (15 pts): title ≠ description (5), no keyword
 *      stuffing — keyword appears ≤3 times across title+description (5),
 *      no ALL-CAPS title (5).
 *   Total: 100. Grades: Excellent ≥85, Good ≥70, Needs work ≥50, Poor <50.
 * - Verdicts per check: "pass" | "warn" | "fail".
 */

export const TITLE_IDEAL_MIN = 50;
export const TITLE_IDEAL_MAX = 60;
export const DESC_IDEAL_MIN = 140;
export const DESC_IDEAL_MAX = 155;

export type CheckVerdict = "pass" | "warn" | "fail";
export type MetaGrade = "Excellent" | "Good" | "Needs work" | "Poor";

export interface MetaCheck {
  name: string;
  verdict: CheckVerdict;
  points: number;
  max: number;
  detail: string;
}

export interface MetaAnalysis {
  /** 0–100 score. */
  score: number;
  grade: MetaGrade;
  /** True when the tool makes no claim beyond the documented rules. */
  heuristic: true;
  titleLength: number;
  descriptionLength: number;
  keywordInTitle: boolean;
  keywordEarlyInTitle: boolean;
  keywordInDescription: boolean;
  checks: MetaCheck[];
}

function gradeFor(score: number): MetaGrade {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs work";
  return "Poor";
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  let count = 0;
  let idx = 0;
  while ((idx = h.indexOf(n, idx)) !== -1) {
    count++;
    idx += n.length;
  }
  return count;
}

/**
 * Analyze meta tags using the rules in this file's header JSDoc.
 * @throws {TypeError} on non-string inputs.
 */
export function analyzeMetaTags(args: {
  title: string;
  description: string;
  keyword: string;
  ogTitle: boolean;
  ogDescription: boolean;
  ogImage: boolean;
}): MetaAnalysis {
  const { title, description, keyword } = args;
  if (typeof title !== "string" || typeof description !== "string" || typeof keyword !== "string") {
    throw new TypeError("analyzeMetaTags expects string inputs");
  }
  const t = title.trim();
  const d = description.trim();
  const kw = keyword.trim().toLowerCase();

  const checks: MetaCheck[] = [];
  let score = 0;

  // 1. Title length (20)
  const tl = t.length;
  let p1: number, v1: CheckVerdict, d1: string;
  if (tl >= TITLE_IDEAL_MIN && tl <= TITLE_IDEAL_MAX) {
    p1 = 20; v1 = "pass"; d1 = `${tl} chars — inside the 50–60 display sweet spot.`;
  } else if ((tl >= 40 && tl < TITLE_IDEAL_MIN) || (tl > TITLE_IDEAL_MAX && tl <= 70)) {
    p1 = 12; v1 = "warn"; d1 = `${tl} chars — slightly outside 50–60; may truncate or under-use the snippet.`;
  } else {
    p1 = 5; v1 = "fail"; d1 = `${tl} chars — well outside 50–60; likely truncated or too short to be descriptive.`;
  }
  score += p1;
  checks.push({ name: "Title length", verdict: v1, points: p1, max: 20, detail: d1 });

  // 2. Description length (20)
  const dl = d.length;
  let p2: number, v2: CheckVerdict, d2: string;
  if (dl === 0) {
    p2 = 0; v2 = "fail"; d2 = "No meta description — search engines will auto-generate a snippet.";
  } else if (dl >= DESC_IDEAL_MIN && dl <= DESC_IDEAL_MAX) {
    p2 = 20; v2 = "pass"; d2 = `${dl} chars — inside the 140–155 snippet sweet spot.`;
  } else if ((dl >= 120 && dl < DESC_IDEAL_MIN) || (dl > DESC_IDEAL_MAX && dl <= 170)) {
    p2 = 12; v2 = "warn"; d2 = `${dl} chars — slightly outside 140–155; may truncate on desktop.`;
  } else {
    p2 = 5; v2 = "fail"; d2 = `${dl} chars — well outside 140–155; will likely be truncated or rewritten.`;
  }
  score += p2;
  checks.push({ name: "Meta description length", verdict: v2, points: p2, max: 20, detail: d2 });

  // 3. Keyword in title (15)
  const keywordInTitle = kw !== "" && t.toLowerCase().includes(kw);
  const keywordEarlyInTitle = keywordInTitle && t.toLowerCase().indexOf(kw) <= Math.floor(t.length / 2);
  const p3 = kw === "" ? 0 : keywordInTitle ? 15 : 0;
  score += p3;
  checks.push({
    name: "Keyword in title",
    verdict: kw === "" ? "warn" : keywordInTitle ? "pass" : "fail",
    points: p3,
    max: 15,
    detail: kw === ""
      ? "No keyword entered — enter your primary keyword to check placement."
      : keywordInTitle
        ? `"${keyword.trim()}" found in the title${keywordEarlyInTitle ? " (in the first half — good for CTR)." : "."}`
        : `"${keyword.trim()}" not found in the title.`,
  });

  // 4. Keyword in description (15)
  const keywordInDescription = kw !== "" && d.toLowerCase().includes(kw);
  const p4 = kw === "" ? 0 : keywordInDescription ? 15 : 0;
  score += p4;
  checks.push({
    name: "Keyword in description",
    verdict: kw === "" ? "warn" : keywordInDescription ? "pass" : "fail",
    points: p4,
    max: 15,
    detail: kw === ""
      ? "No keyword entered — enter your primary keyword to check placement."
      : keywordInDescription
        ? `"${keyword.trim()}" found in the description (helps bolding in snippets).`
        : `"${keyword.trim()}" not found in the description.`,
  });

  // 5. OG tags (15) — user self-reports
  const ogCount = (args.ogTitle ? 1 : 0) + (args.ogDescription ? 1 : 0) + (args.ogImage ? 1 : 0);
  const p5 = ogCount * 5;
  score += p5;
  const missing: string[] = [];
  if (!args.ogTitle) missing.push("og:title");
  if (!args.ogDescription) missing.push("og:description");
  if (!args.ogImage) missing.push("og:image");
  checks.push({
    name: "Open Graph tags",
    verdict: ogCount === 3 ? "pass" : ogCount >= 1 ? "warn" : "fail",
    points: p5,
    max: 15,
    detail: ogCount === 3
      ? "og:title, og:description, and og:image all present — social shares will render rich previews."
      : `Missing: ${missing.join(", ")}. Without these, social shares fall back to plain links.`,
  });

  // 6. Uniqueness signals (15)
  let p6 = 0;
  const notes: string[] = [];
  if (t.toLowerCase() !== d.toLowerCase() && d.length > 0) { p6 += 5; } else { notes.push("title and description are identical or description is empty"); }
  const kwTotal = kw === "" ? 0 : countOccurrences(t, kw) + countOccurrences(d, kw);
  if (kw === "" || kwTotal <= 3) { p6 += 5; } else { notes.push(`keyword appears ${kwTotal}× — possible stuffing`); }
  const capsRatio = t.replace(/[^A-Za-z]/g, "").length;
  const capsUpper = t.replace(/[^A-Z]/g, "").length;
  if (capsRatio === 0 || capsUpper / capsRatio < 0.7) { p6 += 5; } else { notes.push("title is mostly ALL CAPS"); }
  score += p6;
  checks.push({
    name: "Uniqueness signals",
    verdict: p6 === 15 ? "pass" : p6 >= 10 ? "warn" : "fail",
    points: p6,
    max: 15,
    detail: notes.length === 0
      ? "Title and description differ, no keyword stuffing, no ALL-CAPS title."
      : "Issues: " + notes.join("; ") + ".",
  });

  return {
    score,
    grade: gradeFor(score),
    heuristic: true,
    titleLength: tl,
    descriptionLength: dl,
    keywordInTitle,
    keywordEarlyInTitle,
    keywordInDescription,
    checks,
  };
}

/**
 * Contract adapter for the tool template.
 * Output keys: score | grade | checkResults | lengths | heuristicNote.
 */
export function runTool(
  values: Record<string, unknown>,
): { ok: boolean; values?: Record<string, unknown>; error?: string } {
  const title = values["title"];
  const description = values["description"];
  const keyword = values["keyword"];

  if (typeof title !== "string" || title.trim() === "") {
    return { ok: false, error: "Enter your page title." };
  }
  if (typeof description !== "string") {
    return { ok: false, error: "Enter your meta description (or leave it empty to score it as missing)." };
  }

  let result: MetaAnalysis;
  try {
    result = analyzeMetaTags({
      title,
      description,
      keyword: typeof keyword === "string" ? keyword : "",
      ogTitle: values["ogTitle"] === true,
      ogDescription: values["ogDescription"] === true,
      ogImage: values["ogImage"] === true,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not analyze these meta tags." };
  }

  return {
    ok: true,
    values: {
      score: result.score,
      grade: result.grade,
      checkResults: result.checks.map(
        (c) => `${c.verdict.toUpperCase()} — ${c.name} (${c.points}/${c.max}): ${c.detail}`,
      ),
      lengths: `Title: ${result.titleLength} chars (ideal 50–60) · Description: ${result.descriptionLength} chars (ideal 140–155)`,
      heuristicNote:
        "Rule-based check only — the 50–60 / 140–155 character ranges are display guidelines from SEO industry consensus (snippet truncation), not ranking factors published by Google. OG tag presence is self-reported.",
    },
  };
}
