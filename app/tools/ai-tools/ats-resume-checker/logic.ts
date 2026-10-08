/**
 * ATS Resume Checker — pure logic (tool-526), zero imports, zero network,
 * zero DOM.
 *
 * HONESTY CONTRACT: these are heuristic, rule-based checks with a fully
 * transparent rubric printed in the output. This is NOT a real applicant
 * tracking system and its score is NOT what an employer or ATS will give
 * your resume — it only checks surface-level signals (contact info, length,
 * action verbs, numbers, headers, keyword overlap, pronoun use).
 *
 * Rubric (100 points total, documented weights):
 *  - contact-info:    15 pts — email present AND (phone OR url/linkedin)
 *  - length:          15 pts — 400-1200 words
 *  - action-verbs:    15 pts — >=5 occurrences from ACTION_VERBS
 *  - numbers:         15 pts — >=3 numeric tokens (quantified results)
 *  - section-headers: 15 pts — >=2 headers from SECTION_HEADERS
 *  - keyword-overlap: 15 pts — proportional to JD token-overlap ratio
 *  - first-person:    10 pts — <=3 first-person pronouns
 */

/** ~30 action verbs counted in the resume. */
export const ACTION_VERBS: string[] = [
  "managed", "led", "developed", "designed", "built", "launched",
  "increased", "improved", "reduced", "delivered", "created",
  "implemented", "drove", "achieved", "streamlined", "optimized",
  "coordinated", "supervised", "trained", "mentored", "spearheaded",
  "executed", "analyzed", "automated", "negotiated", "generated",
  "grew", "saved", "shipped", "founded",
];

/** Recognized resume section headers (line must start with one). */
export const SECTION_HEADERS: string[] = [
  "experience", "education", "skills", "summary", "contact", "projects",
  "certifications", "work history", "employment", "objective", "profile",
  "awards", "languages", "references",
];

/** Stopwords removed before keyword-overlap comparison. */
export const STOPWORDS: string[] = [
  "the", "and", "for", "with", "that", "this", "from", "have", "has",
  "are", "was", "were", "will", "would", "can", "you", "your", "our",
  "their", "they", "them", "who", "what", "when", "where", "how",
  "which", "into", "over", "under", "between", "through", "about",
  "after", "before", "than", "then", "also", "such", "more", "most",
  "other", "some", "any", "all", "per", "via", "including", "etc",
];

export const MAX_TEXT_LENGTH = 20000;

export interface CheckResult {
  id: string;
  label: string;
  passed: boolean;
  earnedPoints: number;
  maxPoints: number;
  detail: string;
}

/**
 * Strip HTML tags, preserving line breaks so section-header detection keeps
 * working on pasted rich text. Pure string ops — no DOM.
 */
export function stripHtml(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "\n")
    .replace(/[ \t\r\f\v]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export function wordCount(text: string): number {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  return words.length;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 4 && !STOPWORDS.includes(t));
}

export function checkContactInfo(resume: string): CheckResult {
  const email = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(resume);
  const phone =
    /\b(?:\+\d{1,3}[\s-]?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}\b/.test(resume) ||
    /\b\d{10,}\b/.test(resume.replace(/[\s().-]/g, ""));
  const url = /https?:\/\/\S+|linkedin\.com|github\.com/i.test(resume);
  const passed = email && (phone || url);
  const found: string[] = [];
  if (email) found.push("email");
  if (phone) found.push("phone");
  if (url) found.push("link/URL");
  return {
    id: "contact-info",
    label: "Contact information",
    passed,
    earnedPoints: passed ? 15 : 0,
    maxPoints: 15,
    detail: passed
      ? `Found: ${found.join(", ")}.`
      : `Missing pieces — found only: ${found.length ? found.join(", ") : "none"}. Need an email plus a phone number or link.`,
  };
}

export function checkLength(resume: string): CheckResult {
  const words = wordCount(resume);
  const passed = words >= 400 && words <= 1200;
  return {
    id: "length",
    label: "Resume length (400-1200 words)",
    passed,
    earnedPoints: passed ? 15 : 0,
    maxPoints: 15,
    detail: passed
      ? `${words} words — inside the 400-1200 target band.`
      : `${words} words — ${words < 400 ? "below 400: likely too thin" : "above 1200: likely too long"}.`,
  };
}

export function checkActionVerbs(resume: string): CheckResult {
  const lower = resume.toLowerCase();
  const found = ACTION_VERBS.filter((v) => new RegExp(`\\b${v}\\b`).test(lower));
  const occurrences = found.reduce(
    (n, v) => n + (lower.match(new RegExp(`\\b${v}\\b`, "g")) || []).length,
    0,
  );
  const passed = occurrences >= 5;
  return {
    id: "action-verbs",
    label: "Action verbs (>=5)",
    passed,
    earnedPoints: passed ? 15 : 0,
    maxPoints: 15,
    detail: passed
      ? `${occurrences} action-verb occurrences (e.g. ${found.slice(0, 3).join(", ")}).`
      : `Only ${occurrences} action-verb occurrences found — aim for 5+ from words like "led", "built", "increased".`,
  };
}

export function checkNumbers(resume: string): CheckResult {
  const matches = resume.match(/\b\d+(?:\.\d+)?%?\b/g) || [];
  const count = matches.length;
  const passed = count >= 3;
  return {
    id: "numbers",
    label: "Quantified results (>=3 numbers)",
    passed,
    earnedPoints: passed ? 15 : 0,
    maxPoints: 15,
    detail: passed
      ? `${count} numeric tokens found — results look quantified.`
      : `Only ${count} numeric tokens found — add measurable results (%, $, counts).`,
  };
}

export function checkSectionHeaders(resume: string): CheckResult {
  const lines = resume.split("\n").map((l) => l.trim().toLowerCase());
  const found = SECTION_HEADERS.filter((h) =>
    lines.some((l) => l === h || l.startsWith(h + " ") || l.startsWith(h + ":")),
  );
  const passed = found.length >= 2;
  return {
    id: "section-headers",
    label: "Section headers (>=2)",
    passed,
    earnedPoints: passed ? 15 : 0,
    maxPoints: 15,
    detail: passed
      ? `Detected headers: ${found.slice(0, 4).join(", ")}.`
      : `Detected only ${found.length} section header(s) — add clear headers like Experience, Education, Skills.`,
  };
}

export function checkKeywordOverlap(
  resume: string,
  jd: string,
): { check: CheckResult; overlapPct: number; matched: string[] } {
  const jdTokens = [...new Set(tokenize(jd))];
  if (jdTokens.length === 0) {
    return {
      check: {
        id: "keyword-overlap",
        label: "Job-description keyword overlap",
        passed: false,
        earnedPoints: 0,
        maxPoints: 15,
        detail: "Job description has no usable keywords after filtering — overlap cannot be scored.",
      },
      overlapPct: 0,
      matched: [],
    };
  }
  const resumeTokens = new Set(tokenize(resume));
  const matched = jdTokens.filter((t) => resumeTokens.has(t));
  const ratio = matched.length / jdTokens.length;
  const overlapPct = Math.round(ratio * 100);
  const earnedPoints = Math.round(15 * ratio);
  return {
    check: {
      id: "keyword-overlap",
      label: "Job-description keyword overlap",
      passed: ratio >= 0.25,
      earnedPoints,
      maxPoints: 15,
      detail: `${matched.length} of ${jdTokens.length} JD keywords appear in the resume (${overlapPct}%). Points scale with the overlap ratio.`,
    },
    overlapPct,
    matched: matched.slice(0, 10),
  };
}

export function checkFirstPerson(resume: string): CheckResult {
  const count = (resume.match(/\b(i|me|my|mine|myself)\b/gi) || []).length;
  const passed = count <= 3;
  return {
    id: "first-person",
    label: "First-person pronouns (<=3)",
    passed,
    earnedPoints: passed ? 10 : 0,
    maxPoints: 10,
    detail: passed
      ? `${count} first-person pronoun(s) — resumes read better in implied first person.`
      : `${count} first-person pronouns found — trim "I/me/my" and start bullets with action verbs.`,
  };
}

export function grade(score: number): string {
  if (score >= 85) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs work";
  return "Weak";
}

/**
 * Tool entry point (matches the platform ToolRunFn contract).
 * values.resumeText / values.jobDescription: strings, required, non-empty,
 * up to MAX_TEXT_LENGTH chars.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawResume = values["resumeText"];
  const rawJd = values["jobDescription"];
  if (typeof rawResume !== "string" || stripHtml(rawResume).length === 0) {
    return { ok: false, error: "Please paste your resume text." };
  }
  if (typeof rawJd !== "string" || stripHtml(rawJd).length === 0) {
    return { ok: false, error: "Please paste the job description text." };
  }
  const resume = stripHtml(rawResume);
  const jd = stripHtml(rawJd);
  if (resume.length > MAX_TEXT_LENGTH || jd.length > MAX_TEXT_LENGTH) {
    return {
      ok: false,
      error: `Each text must be ${MAX_TEXT_LENGTH} characters or fewer.`,
    };
  }

  const overlap = checkKeywordOverlap(resume, jd);
  const checks: CheckResult[] = [
    checkContactInfo(resume),
    checkLength(resume),
    checkActionVerbs(resume),
    checkNumbers(resume),
    checkSectionHeaders(resume),
    overlap.check,
    checkFirstPerson(resume),
  ];
  const score = checks.reduce((s, c) => s + c.earnedPoints, 0);

  return {
    ok: true,
    values: {
      score,
      maxScore: 100,
      grade: grade(score),
      checks,
      keywordOverlapPct: overlap.overlapPct,
      matchedKeywords: overlap.matched,
      wordCount: wordCount(resume),
    },
  };
}
