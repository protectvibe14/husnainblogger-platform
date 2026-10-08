/**
 * Spam Word Checker — pure logic (tool-403).
 *
 * A PATTERN LINTER, not a live spam-filter test. It matches pasted text
 * against a BUNDLED, curated trigger-word/phrase list. Real mailbox filters
 * are behavioral and ML-based (sender reputation, engagement, auth) and
 * cannot be tested client-side — the tool says so in its output notice and
 * in meta.ts assumptions.
 *
 * BANK SIZE (documented for honesty): 45 bundled trigger terms/phrases in
 * 6 categories. The list is a curated heuristic, NOT an authoritative
 * spam-filter database.
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM, zero randomness. Deterministic:
 *   same text -> same matches.
 * - Matching is case-insensitive on word boundaries, so "free" does not
 *   match inside "freelance".
 * - Input over 5000 characters is truncated with a visible notice in
 *   `notice` — never silently dropped.
 */

export const MAX_TEXT_CHARS = 5000;

export type SpamSeverity = "high" | "medium" | "low";

export interface SpamTerm {
  term: string;
  category: string;
  severity: SpamSeverity;
}

/**
 * Bundled curated trigger list: 45 terms in 6 categories.
 * Heuristic only — NOT an authoritative spam-filter database.
 */
export const SPAM_TERMS: readonly SpamTerm[] = [
  // urgency
  { term: "act now", category: "urgency", severity: "high" },
  { term: "urgent", category: "urgency", severity: "high" },
  { term: "limited time", category: "urgency", severity: "high" },
  { term: "last chance", category: "urgency", severity: "medium" },
  { term: "expires soon", category: "urgency", severity: "medium" },
  { term: "only today", category: "urgency", severity: "medium" },
  { term: "don't wait", category: "urgency", severity: "medium" },
  // money
  { term: "free", category: "money", severity: "high" },
  { term: "100% free", category: "money", severity: "high" },
  { term: "cash", category: "money", severity: "high" },
  { term: "winner", category: "money", severity: "high" },
  { term: "prize", category: "money", severity: "high" },
  { term: "make money", category: "money", severity: "high" },
  { term: "double your income", category: "money", severity: "high" },
  { term: "extra income", category: "money", severity: "medium" },
  { term: "no cost", category: "money", severity: "medium" },
  { term: "cash bonus", category: "money", severity: "medium" },
  // deceptive
  { term: "guaranteed", category: "deceptive", severity: "high" },
  { term: "miracle", category: "deceptive", severity: "high" },
  { term: "no risk", category: "deceptive", severity: "high" },
  { term: "risk-free", category: "deceptive", severity: "high" },
  { term: "no obligation", category: "deceptive", severity: "medium" },
  { term: "no strings attached", category: "deceptive", severity: "medium" },
  // pressure
  { term: "buy now", category: "pressure", severity: "medium" },
  { term: "order now", category: "pressure", severity: "medium" },
  { term: "call now", category: "pressure", severity: "medium" },
  { term: "click here", category: "pressure", severity: "medium" },
  { term: "click below", category: "pressure", severity: "medium" },
  { term: "apply now", category: "pressure", severity: "medium" },
  { term: "sign up now", category: "pressure", severity: "medium" },
  { term: "don't delete", category: "pressure", severity: "medium" },
  // shady
  { term: "dear friend", category: "shady", severity: "high" },
  { term: "congratulations", category: "shady", severity: "medium" },
  { term: "you've been selected", category: "shady", severity: "medium" },
  { term: "you have won", category: "shady", severity: "medium" },
  { term: "amazing deal", category: "shady", severity: "low" },
  { term: "bargain", category: "shady", severity: "low" },
  // common marketing words (low-severity watch list)
  { term: "sale", category: "common", severity: "low" },
  { term: "discount", category: "common", severity: "low" },
  { term: "deal", category: "common", severity: "low" },
  { term: "offer", category: "common", severity: "low" },
  { term: "save big", category: "common", severity: "low" },
  { term: "bonus", category: "common", severity: "low" },
  { term: "free trial", category: "common", severity: "low" },
  { term: "opportunity", category: "common", severity: "low" },
];

/** Rewrite guidance per matched category (deduplicated in output). */
const CATEGORY_GUIDANCE: Record<string, string> = {
  urgency:
    "Replace manufactured urgency with a genuine deadline — or drop it; fake urgency is a classic spam signal.",
  money:
    "Replace vague money words with a specific, verifiable benefit (e.g. an exact price or amount).",
  deceptive:
    "Remove guarantee-style claims unless you can prove them; unprovable promises read as deceptive.",
  pressure:
    "Soften hard-sell commands like 'buy now' — let the offer do the persuading.",
  shady:
    "Remove phrases associated with scam emails ('dear friend', prize claims); they hurt trust even when innocent.",
  common:
    "Common marketing words are usually fine in context — keep them if your email is clearly opt-in and expected.",
};

export type RiskLevel = "low" | "medium" | "high";

export interface SpamMatch {
  term: string;
  category: string;
  severity: SpamSeverity;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const raw = values["text"];
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return { ok: false, error: "Paste your email text (subject or body) to check it." };
  }

  let text = raw;
  let notice = "";
  if ([...text].length > MAX_TEXT_CHARS) {
    text = [...text].slice(0, MAX_TEXT_CHARS).join("");
    notice = `Text was shortened to ${MAX_TEXT_CHARS} characters for checking.`;
  }

  const lowered = text.toLowerCase();
  const matches: SpamMatch[] = [];
  for (const t of SPAM_TERMS) {
    const pattern = new RegExp(`\\b${escapeRegExp(t.term)}\\b`, "i");
    if (pattern.test(lowered)) {
      matches.push({ term: t.term, category: t.category, severity: t.severity });
    }
  }

  // Dedupe overlapping reports: if both "free" and "100% free" matched,
  // keep only the longer phrase.
  const deduped: SpamMatch[] = [];
  for (const m of matches) {
    const coveredByLonger = matches.some(
      (other) => other !== m && other.term.includes(m.term),
    );
    if (!coveredByLonger) deduped.push(m);
  }

  let riskLevel: RiskLevel = "low";
  const highCount = deduped.filter((m) => m.severity === "high").length;
  const mediumCount = deduped.filter((m) => m.severity === "medium").length;
  if (highCount > 0 || deduped.length >= 6) {
    riskLevel = "high";
  } else if (mediumCount > 0 || deduped.length >= 2) {
    riskLevel = "medium";
  }

  const seenCategories = new Set<string>();
  const rewriteSuggestions: string[] = [];
  for (const m of deduped) {
    if (seenCategories.has(m.category)) continue;
    seenCategories.add(m.category);
    rewriteSuggestions.push(CATEGORY_GUIDANCE[m.category]);
  }
  if (deduped.length === 0) {
    rewriteSuggestions.push(
      "No trigger words found. Remember: this is a pattern linter, not a live spam-filter test — sender reputation, authentication (SPF/DKIM/DMARC), and list hygiene matter more.",
    );
  }

  const matchesTable = {
    columns: ["Term", "Category", "Severity"],
    rows: deduped.map((m) => [m.term, m.category, m.severity]),
  };

  return {
    ok: true,
    values: { matches: matchesTable, riskLevel, rewriteSuggestions, notice },
  };
}
