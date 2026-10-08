/**
 * Heading Structure Analyzer — pure logic (zero imports, zero network, zero DOM).
 *
 * Analyzes the <h1>-<h6> heading structure of pasted HTML with FIXED,
 * published rules (not AI). It only reads the HTML you paste — it never
 * fetches your live page and cannot see headings rendered by JavaScript.
 *
 * Parsing: <h1..h6> tags are matched case-insensitively with a regular
 * expression; inner markup is stripped and common entities (&amp; &lt; &gt;
 * &quot; &#39; &nbsp;) are decoded. Malformed or unclosed heading tags are
 * not detected as headings.
 *
 * Scoring rubric (starts at 100, floor 0):
 * - No <h1> at all:                -25
 * - Each extra <h1> beyond one:    -10
 * - Each skipped level (H1 -> H3):  -10
 * - Each empty heading:             -10
 * - Each repeated heading text:      -5  (second occurrence onwards, once per text)
 *
 * Issue severity: "error" (missing H1 count problems, empty headings),
 * "warning" (skipped levels, duplicates), "ok" (no issues found).
 * Deterministic: same HTML always yields the same issues, outline, and score.
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export interface Heading {
  level: number;
  text: string;
}

const MAX_HTML_CHARS = 500000;

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ");
}

/** Extract headings in document order (level + visible text). */
export function extractHeadings(html: string): Heading[] {
  const re = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1\s*>/gi;
  const out: Heading[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const text = decodeEntities(m[2].replace(/<[^>]*>/g, "")).trim();
    out.push({ level: Number(m[1]), text });
  }
  return out;
}

interface Issue {
  severity: "error" | "warning" | "ok";
  issue: string;
  detail: string;
}

function analyze(headings: Heading[]): { issues: Issue[]; score: number } {
  let score = 100;
  const issues: Issue[] = [];

  const h1Count = headings.filter((h) => h.level === 1).length;
  if (h1Count === 0) {
    score -= 25;
    issues.push({
      severity: "error",
      issue: "Missing H1",
      detail: "No <h1> tag found. Use exactly one H1 per page for the main topic.",
    });
  } else if (h1Count > 1) {
    score -= 10 * (h1Count - 1);
    issues.push({
      severity: "error",
      issue: `Multiple H1s (${h1Count} found)`,
      detail: "Keep a single <h1> per page; demote the extra H1s to H2.",
    });
  }

  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1].level;
    const cur = headings[i].level;
    if (cur > prev + 1) {
      score -= 10;
      issues.push({
        severity: "warning",
        issue: `Skipped heading level (H${prev} → H${cur})`,
        detail:
          "Do not skip levels — for example, an H3 should follow an H2, not jump straight from an H1.",
      });
    }
  }

  headings.forEach((h, i) => {
    if (!h.text) {
      score -= 10;
      issues.push({
        severity: "error",
        issue: `Empty H${h.level} (heading #${i + 1})`,
        detail: "Remove the empty heading or add descriptive text inside it.",
      });
    }
  });

  const seen = new Map<string, number>();
  for (const h of headings) {
    const key = h.text.toLowerCase();
    if (!key) continue;
    const count = (seen.get(key) ?? 0) + 1;
    seen.set(key, count);
    if (count === 2) {
      score -= 5;
      const short = h.text.length > 60 ? h.text.slice(0, 60) + "…" : h.text;
      issues.push({
        severity: "warning",
        issue: `Duplicate heading text ("${short}")`,
        detail: "Repeated headings confuse readers and crawlers — make each heading unique.",
      });
    }
  }

  if (issues.length === 0) {
    issues.push({
      severity: "ok",
      issue: "No issues found",
      detail: "Your heading structure follows every checked rule: one H1, no skipped levels, no empty or duplicate headings.",
    });
  }

  return { issues, score: Math.max(0, score) };
}

/** Table payload the template renderer understands: { columns, rows }. */
function toTable(columns: string[], rows: string[][]): { columns: string[]; rows: string[][] } {
  return { columns, rows };
}

export function runTool(values: Record<string, unknown>): ToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "No input provided." };
  }

  const html = clean(values["html"]);
  if (!html) {
    return {
      ok: false,
      error: "Paste your HTML first — the input field is empty.",
    };
  }
  if (html.length > MAX_HTML_CHARS) {
    return {
      ok: false,
      error: `HTML is too long (${html.length.toLocaleString("en-US")} characters). The limit is ${MAX_HTML_CHARS.toLocaleString("en-US")} characters.`,
    };
  }

  const headings = extractHeadings(html);
  if (headings.length === 0) {
    return {
      ok: false,
      error: "No heading tags (<h1>–<h6>) found in the pasted HTML.",
    };
  }

  const { issues, score } = analyze(headings);

  return {
    ok: true,
    values: {
      issues: toTable(
        ["Severity", "Issue", "Detail"],
        issues.map((i) => [i.severity, i.issue, i.detail]),
      ),
      outline: toTable(
        ["Level", "Heading"],
        headings.map((h) => [`H${h.level}`, h.text || "(empty)"]),
      ),
      score,
    },
  };
}
