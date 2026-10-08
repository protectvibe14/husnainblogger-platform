/**
 * Content Scannability Checker — pure logic (zero imports, zero network, zero DOM).
 *
 * HONESTY CONTRACT (see spec honestyNote): the 0-100 score is OUR OWN
 * deterministic readability/structure heuristic, fully transparent below —
 * it is not a Google ranking factor and not a published industry standard.
 *
 * Published rubric — start at 100, subtract fixed deductions (clamped 0-100):
 *   SHORT_CONTENT    -15  fewer than 100 words
 *   NO_HEADINGS      -20  zero headings (markdown # or <h1>-<h6>)
 *   SPARSE_HEADINGS  -10  fewer than 1 heading per 300 words (when headings exist)
 *   LONG_PARAGRAPH   -15  any paragraph over 150 words
 *   DENSE_PARAGRAPHS -10  average paragraph over 80 words
 *   NO_LISTS         -10  no bullet/numbered list lines
 *   LONG_SENTENCES   -10  average sentence over 25 words
 * Max total deduction is 100; score never goes below 0.
 *
 * Grades: A 90-100, B 75-89, C 60-74, D 40-59, F 0-39.
 * No word banks are used — everything is structural counting.
 */

export const MAX_CONTENT_CHARS = 200000;
export const MIN_WORDS = 100;
export const MAX_PARAGRAPH_WORDS = 150;
export const AVG_PARAGRAPH_WARN = 80;
export const AVG_SENTENCE_WARN = 25;
export const HEADING_DENSITY_WORDS = 300;

const ABBREVIATIONS = [
  "mr", "mrs", "ms", "dr", "st", "jr", "sr", "vs", "etc",
  "no", "inc", "ltd", "co", "prof", "gen", "rep", "sen", "gov", "dept", "fig",
];
const PLACEHOLDER = "\u0001";

function protectAbbreviations(text: string): string {
  let out = text.replace(
    /\b(?:e\.g|i\.e|a\.m|p\.m|u\.s|u\.k)\./gi,
    (m) => m.replace(/\./g, PLACEHOLDER),
  );
  const names = ABBREVIATIONS.join("|");
  out = out.replace(
    new RegExp(`\\b(${names})\\.`, "gi"),
    (m, w: string) => w + PLACEHOLDER,
  );
  return out;
}

/** Deterministic sentence splitter; abbreviations (e.g. "e.g.", "Mr.") don't split. */
export function splitSentences(text: string): string[] {
  const prot = protectAbbreviations(text);
  const matches = prot.match(/[^.!?…]+(?:[.!?…]+["'”’)\]]?|$)/g) ?? [];
  return matches
    .map((s) => s.split(PLACEHOLDER).join(".").trim())
    .filter((s) => /[\p{L}\p{N}]/u.test(s));
}

function countWords(text: string): number {
  const m = text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu);
  return m ? m.length : 0;
}

function countHeadings(text: string): number {
  const lines = text.split("\n");
  let n = 0;
  for (const line of lines) {
    if (/^\s*#{1,6}\s+\S/.test(line)) n++;
    else if (/<h[1-6][\s>]/i.test(line)) n++;
  }
  return n;
}

function countListItems(text: string): number {
  const m = text.match(/^\s*(?:[-*+]|\d{1,3}[.)])\s+\S/gm);
  return m ? m.length : 0;
}

interface Deduction {
  id: string;
  points: number;
  check: string;
  recommendation: string;
}

function gradeFor(score: number): string {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

/**
 * Tool logic slot. values: { content }.
 * Returns { score, grade, checks, recommendations }.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please provide your inputs first." };
  }

  const raw = values["content"];
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return { ok: false, error: "Paste the blog content you want to check." };
  }
  const content = raw;
  if (content.length > MAX_CONTENT_CHARS) {
    return {
      ok: false,
      error: `Content must be ${MAX_CONTENT_CHARS.toLocaleString("en-US")} characters or fewer.`,
    };
  }

  const words = countWords(content);
  const headings = countHeadings(content);
  const lists = countListItems(content);
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const paraWords = paragraphs.map(countWords);
  const avgParaWords = paraWords.length > 0 ? words / paraWords.length : words;
  const longestPara = paraWords.length > 0 ? Math.max(...paraWords) : 0;
  const sentences = splitSentences(content);
  const avgSentenceWords = sentences.length > 0 ? words / sentences.length : 0;

  const deductions: Deduction[] = [];
  if (words < MIN_WORDS) {
    deductions.push({
      id: "SHORT_CONTENT",
      points: 15,
      check: `FAIL — Content length: only ${words} words (under ${MIN_WORDS}; −15).`,
      recommendation: `Aim for at least ${MIN_WORDS} words — longer posts give readers more substance to scan.`,
    });
  }
  if (headings === 0) {
    deductions.push({
      id: "NO_HEADINGS",
      points: 20,
      check: "FAIL — Headings: none found (−20). Readers can't scan a wall of text.",
      recommendation:
        "Add descriptive subheadings (markdown # or ##) every few paragraphs so readers can skim the structure.",
    });
  } else if (words / headings > HEADING_DENSITY_WORDS) {
    deductions.push({
      id: "SPARSE_HEADINGS",
      points: 10,
      check: `FAIL — Heading density: ${headings} heading(s) for ${words} words, under 1 per ${HEADING_DENSITY_WORDS} words (−10).`,
      recommendation:
        "Break long sections with more subheadings — one every few hundred words keeps skimmers moving.",
    });
  }
  if (longestPara > MAX_PARAGRAPH_WORDS) {
    deductions.push({
      id: "LONG_PARAGRAPH",
      points: 15,
      check: `FAIL — Longest paragraph: ${longestPara} words (over ${MAX_PARAGRAPH_WORDS}; −15).`,
      recommendation:
        "Split oversized paragraphs into 2–4 sentence chunks — short paragraphs are far easier to scan.",
    });
  }
  if (avgParaWords > AVG_PARAGRAPH_WARN) {
    deductions.push({
      id: "DENSE_PARAGRAPHS",
      points: 10,
      check: `FAIL — Average paragraph: ${avgParaWords.toFixed(1)} words (over ${AVG_PARAGRAPH_WARN}; −10).`,
      recommendation: "Keep most paragraphs under 80 words; hit Enter more often.",
    });
  }
  if (lists === 0) {
    deductions.push({
      id: "NO_LISTS",
      points: 10,
      check: "FAIL — Lists: none found (−10). Lists are the most scannable format there is.",
      recommendation: "Turn grouped ideas, steps, or features into bullet or numbered lists.",
    });
  }
  if (avgSentenceWords > AVG_SENTENCE_WARN) {
    deductions.push({
      id: "LONG_SENTENCES",
      points: 10,
      check: `FAIL — Average sentence: ${avgSentenceWords.toFixed(1)} words (over ${AVG_SENTENCE_WARN}; −10).`,
      recommendation: "Break long sentences in two. Shorter sentences scan faster.",
    });
  }

  const totalDeduction = deductions.reduce((sum, d) => sum + d.points, 0);
  const score = Math.max(0, 100 - totalDeduction);

  const checks: string[] = [];
  if (words >= MIN_WORDS) checks.push(`PASS — Content length: ${words} words.`);
  checks.push(
    headings > 0 && words / headings <= HEADING_DENSITY_WORDS
      ? `PASS — Headings: ${headings} found, good density.`
      : "",
  );
  if (longestPara <= MAX_PARAGRAPH_WORDS)
    checks.push(`PASS — Paragraphs: longest is ${longestPara} words.`);
  if (avgParaWords <= AVG_PARAGRAPH_WARN)
    checks.push(`PASS — Paragraph density: ${avgParaWords.toFixed(1)} words on average.`);
  if (lists > 0) checks.push(`PASS — Lists: ${lists} list item(s) found.`);
  if (avgSentenceWords <= AVG_SENTENCE_WARN)
    checks.push(
      `PASS — Sentence length: ${sentences.length} sentence(s), ${avgSentenceWords.toFixed(1)} words on average.`,
    );
  const failChecks = deductions.map((d) => d.check);
  // Fails first, then passes.
  const orderedChecks = [...failChecks, ...checks.filter((c) => c.length > 0)];

  const recommendations = deductions.map((d) => d.recommendation);

  return {
    ok: true,
    values: {
      score,
      grade: gradeFor(score),
      checks: orderedChecks,
      recommendations,
    },
  };
}
