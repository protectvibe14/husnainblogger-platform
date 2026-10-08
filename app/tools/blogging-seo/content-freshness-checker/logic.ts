/**
 * Content Freshness Checker — pure logic (Lane C, rule-based).
 *
 * ASSUMPTIONS:
 * - No DOM, no network, no imports. Pure date arithmetic (UTC).
 * - The user provides publish date + last-updated date (+ optional word
 *   count). The tool computes age and staleness — it does NOT fetch the
 *   page and does NOT know actual rankings (labeled honestly).
 * - FRESHNESS VERDICTS (clearly labeled as editorial guidelines, not
 *   Google-published rules — Google has never published freshness
 *   thresholds; these bands come from SEO industry consensus that
 *   time-sensitive content decays faster):
 *
 *   Days since last update   Verdict        Meaning
 *   ──────────────────────   ────────────   ──────────────────────────
 *   0–90                     Fresh          Recently maintained.
 *   91–365                   Needs update   Aging; review for accuracy.
 *   366+                     Stale          Likely outdated; prioritize
 *                                           a refresh.
 *
 *   The bands are presented as guidelines the user can interpret for
 *   their niche — a news post goes stale faster than an evergreen guide,
 *   and the output says so.
 * - UPDATE PRIORITY SCORE (0–100, heuristic): starts from staleness, then
 *   adjusts for word count (longer posts = more to lose, +up to 15) and
 *   for "never updated" (published == updated and age > 180 days: +10).
 *   Formula: base = min(70, daysSinceUpdate / 365 * 70); + wordCount bonus
 *   (min(15, words/2000*15)); + 10 if never updated and age > 180.
 *   Rounded. Higher = update sooner.
 */

/** Freshness bands in days-since-update. Editorial guidelines — not Google-published. */
export const FRESH_MAX_DAYS = 90;
export const NEEDS_UPDATE_MAX_DAYS = 365;

export type FreshnessVerdict = "Fresh" | "Needs update" | "Stale";

export interface FreshnessResult {
  /** Whole days from publish date to today (UTC). */
  ageDays: number;
  /** Whole days from last-updated date to today (UTC). */
  daysSinceUpdate: number;
  /** True when the user never updated after publishing. */
  neverUpdated: boolean;
  verdict: FreshnessVerdict;
  /** 0–100 heuristic — higher means "update sooner". */
  priorityScore: number;
  /** True when the tool makes no claim beyond the documented rules. */
  heuristic: true;
  guidance: string;
}

function startOfDayUTC(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * Parse an ISO date string (YYYY-MM-DD). Returns null when invalid.
 * Rejects impossible dates (e.g. 2026-02-30) via round-trip check.
 */
export function parseISODate(raw: string): Date | null {
  if (typeof raw !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim());
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const d = parseInt(m[3], 10);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return dt;
}

function verdictFor(daysSinceUpdate: number): FreshnessVerdict {
  if (daysSinceUpdate <= FRESH_MAX_DAYS) return "Fresh";
  if (daysSinceUpdate <= NEEDS_UPDATE_MAX_DAYS) return "Needs update";
  return "Stale";
}

/**
 * Check content freshness. `todayISO` lets tests fix "today" (YYYY-MM-DD).
 * @throws {TypeError} on non-string dates. @throws {Error} on invalid dates,
 *   future dates, or updated-before-published.
 */
export function checkFreshness(args: {
  publishDate: string;
  updatedDate: string;
  wordCount?: number;
  todayISO?: string;
}): FreshnessResult {
  const { publishDate, updatedDate, wordCount = 0 } = args;
  if (typeof publishDate !== "string" || typeof updatedDate !== "string") {
    throw new TypeError("checkFreshness expects string dates");
  }

  const pub = parseISODate(publishDate);
  const upd = parseISODate(updatedDate);
  if (!pub) throw new Error(`Invalid publish date "${publishDate}" — use YYYY-MM-DD.`);
  if (!upd) throw new Error(`Invalid last-updated date "${updatedDate}" — use YYYY-MM-DD.`);

  const today = args.todayISO ? parseISODate(args.todayISO) : new Date();
  if (!today) throw new Error(`Invalid reference date "${args.todayISO}".`);
  const todayMs = startOfDayUTC(today instanceof Date && args.todayISO ? today : new Date(today));

  const pubMs = startOfDayUTC(pub);
  const updMs = startOfDayUTC(upd);
  if (pubMs > todayMs) throw new Error("Publish date is in the future.");
  if (updMs > todayMs) throw new Error("Last-updated date is in the future.");
  if (updMs < pubMs) throw new Error("Last-updated date is before the publish date.");

  const ageDays = Math.floor((todayMs - pubMs) / 86_400_000);
  const daysSinceUpdate = Math.floor((todayMs - updMs) / 86_400_000);
  const neverUpdated = updMs === pubMs;
  const verdict = verdictFor(daysSinceUpdate);

  // Priority score (0–100 heuristic)
  const base = Math.min(70, (daysSinceUpdate / 365) * 70);
  const words = Math.max(0, Math.floor(wordCount));
  const wordBonus = Math.min(15, (words / 2000) * 15);
  const neverBonus = neverUpdated && ageDays > 180 ? 10 : 0;
  const priorityScore = Math.min(100, Math.round(base + wordBonus + neverBonus));

  const guidance =
    verdict === "Fresh"
      ? `Updated ${daysSinceUpdate} day(s) ago — nothing urgent. Re-check in ${FRESH_MAX_DAYS - daysSinceUpdate} day(s).`
      : verdict === "Needs update"
        ? `Last updated ${daysSinceUpdate} days ago — review facts, links, screenshots, and year references for accuracy.`
        : `Last updated ${daysSinceUpdate} days ago — treat as stale. A full refresh (new examples, current data, re-publish date) is recommended.`;

  return {
    ageDays,
    daysSinceUpdate,
    neverUpdated,
    verdict,
    priorityScore,
    heuristic: true,
    guidance,
  };
}

/**
 * Contract adapter for the tool template.
 * Output keys: verdict | ageDays | daysSinceUpdate | priorityScore |
 * guidance | heuristicNote.
 */
export function runTool(
  values: Record<string, unknown>,
): { ok: boolean; values?: Record<string, unknown>; error?: string } {
  const publishDate = values["publishDate"];
  const updatedDate = values["updatedDate"];
  const wordCount = values["wordCount"];

  if (typeof publishDate !== "string" || publishDate.trim() === "") {
    return { ok: false, error: "Enter the publish date (YYYY-MM-DD)." };
  }
  if (typeof updatedDate !== "string" || updatedDate.trim() === "") {
    return { ok: false, error: "Enter the last-updated date (YYYY-MM-DD). Use the publish date if never updated." };
  }

  let words = 0;
  if (wordCount !== undefined && wordCount !== "") {
    const n = typeof wordCount === "number" ? wordCount : parseInt(String(wordCount), 10);
    if (!Number.isFinite(n) || n < 0) {
      return { ok: false, error: "Word count must be a non-negative number." };
    }
    words = Math.floor(n);
  }

  let result: FreshnessResult;
  try {
    result = checkFreshness({ publishDate, updatedDate, wordCount: words });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not check freshness." };
  }

  return {
    ok: true,
    values: {
      verdict: result.verdict,
      ageDays: result.ageDays,
      daysSinceUpdate: result.daysSinceUpdate,
      priorityScore: result.priorityScore,
      guidance: result.guidance +
        (result.neverUpdated && result.ageDays > 180 ? " Note: this post has never been updated since publishing." : ""),
      heuristicNote:
        "Guideline bands only — Google publishes no freshness thresholds. Fresh ≤90 days, Needs update 91–365, Stale 366+ days since last update. Time-sensitive topics go stale faster than evergreen ones.",
    },
  };
}
