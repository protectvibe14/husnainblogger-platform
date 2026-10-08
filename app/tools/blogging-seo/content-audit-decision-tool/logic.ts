/**
 * Content Audit Decision Tool — pure logic (tool-037).
 *
 * Zero imports, zero network, zero DOM. Given a list of pages with
 * USER-SUPPLIED ratings (trafficTrend, conversions, quality,
 * cannibalizationRisk — each 0-10), it applies a PUBLISHED, transparent
 * decision tree and recommends one action per page: keep, update, merge,
 * or delete.
 *
 * HONESTY (also in meta.ts content.methodology + assumptions):
 * - This tool NEVER measures real traffic, conversions, or rankings. It
 *   has no analytics connection and makes no API calls. Every number it
 *   uses is a rating YOU type in from your own data (Google Analytics,
 *   Search Console, or your editorial judgment).
 * - Output decisions are RECOMMENDATIONS from a fixed, documented rule
 *   set — not diagnoses, not guarantees, and not a substitute for
 *   editorial judgment. "Delete" recommendations should always be
 *   sanity-checked (e.g. check backlinks) before acting.
 *
 * THE PUBLISHED DECISION TREE (rules applied top to bottom, first match wins):
 *   score = (wT*trafficTrend + wC*conversions + wQ*quality
 *            + wK*(10 - cannibalizationRisk)) / (wT+wC+wQ+wK)
 *   1. DELETE: quality <= 3 AND trafficTrend <= 2 AND conversions <= 2
 *      (thin, declining, and not converting — nothing worth saving).
 *   2. KEEP: score >= 7.5 (healthy page — leave it alone).
 *   3. MERGE: cannibalizationRisk >= 7 (overlaps other content — fold it
 *      into the strongest page on the topic and redirect).
 *   4. UPDATE: score >= 3 (worth keeping — refresh the content, data,
 *      and on-page SEO).
 *   5. DELETE: score < 3 (weak on every front — remove and redirect).
 *
 * ASSUMPTIONS:
 * - Ratings are your own 0-10 judgments; the tool cannot tell whether
 *   they match your real analytics.
 * - Weights default to equal (1 each); custom weights are non-negative
 *   numbers with a positive total.
 * - URLs are format-checked only (must start with http:// or https://);
 *   nothing is fetched or verified.
 * - At most MAX_PAGES pages per run (keeps the UI responsive).
 */

/** Maximum pages accepted in one audit run. */
export const MAX_PAGES = 100;

/** Weights used when the user supplies none. */
export const DEFAULT_WEIGHTS = {
  trafficTrend: 1,
  conversions: 1,
  quality: 1,
  cannibalizationRisk: 1,
} as const;

/** The four rating metric names (also the accepted weight keys). */
export const METRIC_KEYS = [
  "trafficTrend",
  "conversions",
  "quality",
  "cannibalizationRisk",
] as const;

export type Decision = "keep" | "update" | "merge" | "delete";

export interface PageRating {
  url: string;
  trafficTrend: number;
  conversions: number;
  quality: number;
  cannibalizationRisk: number;
}

export interface PageDecision {
  url: string;
  score: number;
  decision: Decision;
  reason: string;
}

export interface AuditSummary {
  total: number;
  keep: number;
  update: number;
  merge: number;
  delete: number;
  averageScore: number;
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Format check only: must start with http(s):// and have a host. */
export function isValidUrl(url: string): boolean {
  if (typeof url !== "string") return false;
  // Unicode-aware (covers internationalized domain names / unicode URLs).
  return /^https?:\/\/\S+$/u.test(url.trim());
}

function isRating(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 10
  );
}

function parsePages(raw: unknown): { pages?: PageRating[]; error?: string } {
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return { error: "Please paste your pages as a JSON array." };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      error:
        'Pages must be valid JSON, e.g. [{"url":"https://example.com/a","trafficTrend":7,"conversions":5,"quality":8,"cannibalizationRisk":3}].',
    };
  }
  if (!Array.isArray(parsed)) {
    return { error: "Pages must be a JSON array of page objects." };
  }
  if (parsed.length === 0) {
    return { error: "Add at least one page to audit." };
  }
  if (parsed.length > MAX_PAGES) {
    return {
      error: `Maximum ${MAX_PAGES} pages per audit (got ${parsed.length}). Split larger audits into batches.`,
    };
  }
  const pages: PageRating[] = [];
  for (let i = 0; i < parsed.length; i += 1) {
    const item = parsed[i];
    const n = i + 1;
    if (item === null || typeof item !== "object" || Array.isArray(item)) {
      return { error: `Page ${n}: each page must be an object.` };
    }
    const obj = item as Record<string, unknown>;
    const url = typeof obj["url"] === "string" ? obj["url"].trim() : "";
    if (!isValidUrl(url)) {
      return {
        error: `Page ${n}: url must start with http:// or https:// (got "${String(obj["url"] ?? "").slice(0, 60)}").`,
      };
    }
    for (const key of METRIC_KEYS) {
      if (!isRating(obj[key])) {
        return {
          error: `Page ${n}: ${key} must be a number between 0 and 10 (got "${String(obj[key] ?? "missing").slice(0, 40)}").`,
        };
      }
    }
    pages.push({
      url,
      trafficTrend: obj["trafficTrend"] as number,
      conversions: obj["conversions"] as number,
      quality: obj["quality"] as number,
      cannibalizationRisk: obj["cannibalizationRisk"] as number,
    });
  }
  return { pages };
}

function parseWeights(
  raw: unknown,
): { weights?: Record<string, number>; error?: string } {
  if (raw === undefined || raw === null || (typeof raw === "string" && raw.trim().length === 0)) {
    return {
      weights: {
        trafficTrend: 1,
        conversions: 1,
        quality: 1,
        cannibalizationRisk: 1,
      },
    };
  }
  if (typeof raw !== "string") {
    return { error: "Weights must be a JSON object, e.g. {\"quality\": 2}." };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      error:
        'Weights must be valid JSON, e.g. {"quality": 2, "conversions": 1.5}. Leave blank for equal weights.',
    };
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { error: "Weights must be a JSON object." };
  }
  const weights: Record<string, number> = {
    trafficTrend: 1,
    conversions: 1,
    quality: 1,
    cannibalizationRisk: 1,
  };
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (!(METRIC_KEYS as readonly string[]).includes(key)) {
      return {
        error: `Unknown weight key "${key}". Allowed: ${METRIC_KEYS.join(", ")}.`,
      };
    }
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      return {
        error: `Weight "${key}" must be a non-negative number (got "${String(value).slice(0, 30)}").`,
      };
    }
    weights[key] = value;
  }
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  if (total <= 0) {
    return { error: "Weights must total more than 0." };
  }
  return { weights };
}

/** Weighted 0-10 score; cannibalization risk counts against the page. */
export function scorePage(
  page: PageRating,
  weights: Record<string, number>,
): number {
  const total =
    weights["trafficTrend"] +
    weights["conversions"] +
    weights["quality"] +
    weights["cannibalizationRisk"];
  const score =
    (weights["trafficTrend"] * page.trafficTrend +
      weights["conversions"] * page.conversions +
      weights["quality"] * page.quality +
      weights["cannibalizationRisk"] * (10 - page.cannibalizationRisk)) /
    total;
  return Math.round(score * 10) / 10;
}

/**
 * The published decision tree — first matching rule wins.
 * See the file header comment for the full rule set.
 */
export function decidePage(page: PageRating, score: number): PageDecision {
  if (page.quality <= 3 && page.trafficTrend <= 2 && page.conversions <= 2) {
    return {
      url: page.url,
      score,
      decision: "delete",
      reason:
        "Thin, declining, and not converting (quality ≤3, traffic ≤2, conversions ≤2) — nothing here worth saving. Remove and redirect. Double-check backlinks first.",
    };
  }
  if (score >= 7.5) {
    return {
      url: page.url,
      score,
      decision: "keep",
      reason:
        "Healthy page (score ≥ 7.5). Leave it alone — put effort into weaker pages instead.",
    };
  }
  if (page.cannibalizationRisk >= 7) {
    return {
      url: page.url,
      score,
      decision: "merge",
      reason:
        "High overlap risk (cannibalization ≥ 7). Fold this content into the strongest page on the topic and redirect — do not keep two pages fighting for the same query.",
    };
  }
  if (score >= 3) {
    return {
      url: page.url,
      score,
      decision: "update",
      reason:
        "Worth keeping but underperforming. Refresh the content, update data and examples, and improve on-page SEO.",
    };
  }
  return {
    url: page.url,
    score,
    decision: "delete",
    reason:
      "Weak on every front (score < 3). Remove and redirect to the closest surviving page.",
  };
}

export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please paste your pages to audit first." };
  }

  const parsedPages = parsePages(values["pages"]);
  if (parsedPages.error || !parsedPages.pages) {
    return { ok: false, error: parsedPages.error as string };
  }
  const parsedWeights = parseWeights(values["weights"]);
  if (parsedWeights.error || !parsedWeights.weights) {
    return { ok: false, error: parsedWeights.error as string };
  }
  const weights = parsedWeights.weights;

  const decisions: PageDecision[] = parsedPages.pages.map((page) =>
    decidePage(page, scorePage(page, weights)),
  );

  const counts: Record<Decision, number> = {
    keep: 0,
    update: 0,
    merge: 0,
    delete: 0,
  };
  let scoreSum = 0;
  for (const d of decisions) {
    counts[d.decision] += 1;
    scoreSum += d.score;
  }
  const summary: AuditSummary = {
    total: decisions.length,
    ...counts,
    averageScore:
      decisions.length === 0
        ? 0
        : Math.round((scoreSum / decisions.length) * 10) / 10,
  };

  const columns = ["URL", "Score /10", "Decision", "Reason"];
  const rows: string[][] = decisions.map((d) => [
    d.url,
    String(d.score),
    d.decision.toUpperCase(),
    d.reason,
  ]);

  const summaryText =
    `${summary.total} page(s) audited — ${summary.keep} keep, ` +
    `${summary.update} update, ${summary.merge} merge, ${summary.delete} delete. ` +
    `Average score ${summary.averageScore}/10. ` +
    `Recommendations come from your own ratings via the published decision tree; ` +
    `this tool measures no real traffic.`;

  return {
    ok: true,
    values: {
      decisions: { columns, rows },
      summary: summaryText,
    },
  };
}
