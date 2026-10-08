/**
 * Thumbnail A/B Test Tracker — pure logic (tool-106).
 *
 * TRACKER tool (trackerMode: 'checklist'). NO runTool.
 * Pure TypeScript, zero imports, zero network, zero DOM, zero Date.now().
 * Deterministic: same inputs -> same outputs.
 *
 * ## What this does (and does NOT do)
 * A fixed 10-step checklist for running a MANUAL thumbnail A/B test log. You
 * copy impressions/clicks per variant out of YouTube Studio into your own log;
 * the pure helpers below compute CTR per variant and declare a winner — or
 * "inconclusive" when the sample is too small. The tool CANNOT pull YouTube
 * Analytics data client-side (no API keys / OAuth per locked rules), so every
 * surfaced string labels results as MANUAL TRACKING, not channel analytics.
 * YouTube's own "Test & Compare" uploads three real thumbnails — use the
 * native test for real data; this log is a manual companion.
 *
 * ## Winner rule (rule of thumb, documented — NOT a significance test)
 *   - at least 2 variants with logged data
 *   - every variant needs >= MIN_IMPRESSIONS_PER_VARIANT (default 1000)
 *     impressions; below that the verdict is "inconclusive" — the tool must
 *     never crown a winner on noise.
 *   - tied top CTRs -> "tie".
 * CTR = clicks / impressions * 100, rounded to 2 decimals. 0 impressions -> 0.
 *
 * @module thumbnail-a-b-test-tracker/logic
 */

/** A checklist step shown by the tracker UI (persisted in localStorage by the UI). */
export interface TrackerItem {
  id: string;
  label: string;
  detail?: string;
}

export const TRACKER_ITEMS: TrackerItem[] = [
  {
    id: "name-video",
    label: "Name the video under test",
    detail:
      "Write the video title or URL at the top of your log so every variant row refers to the same video.",
  },
  {
    id: "log-variant-a",
    label: "Log variant A",
    detail:
      "Describe thumbnail A (e.g. \"face + red text\") and note the dates it ran.",
  },
  {
    id: "log-variant-b",
    label: "Log variant B (or C)",
    detail:
      "Describe thumbnail B the same way. YouTube's native Test & Compare uploads three thumbnails — this log supports A/B/C.",
  },
  {
    id: "record-impressions",
    label: "Record impressions per variant",
    detail:
      "Copy the impression count for each variant from YouTube Studio. This is manual entry — the tool cannot fetch analytics for you.",
  },
  {
    id: "record-clicks",
    label: "Record clicks per variant",
    detail:
      "Copy the click count for each variant from YouTube Studio into the same row.",
  },
  {
    id: "validate-numbers",
    label: "Validate the numbers",
    detail:
      "Check every row: impressions >= clicks, no negative numbers, and at least 2 variants with data.",
  },
  {
    id: "sample-size",
    label: "Check the sample rule",
    detail:
      "Each variant needs at least 1,000 impressions before any winner is judged (documented rule of thumb, not a statistical test).",
  },
  {
    id: "compute-ctr",
    label: "Compute CTR per variant",
    detail: "CTR = clicks ÷ impressions × 100, computed separately for each variant.",
  },
  {
    id: "declare-winner",
    label: "Declare a winner — or inconclusive",
    detail:
      "The highest CTR wins only at full sample. Below 1,000 impressions per variant the result is \"inconclusive\" — never \"A wins\".",
  },
  {
    id: "manual-label",
    label: "Label the result as manual tracking",
    detail:
      "Write on your log: \"manual tracking, not YouTube Analytics data\". For real tested data, use YouTube's native Test & Compare.",
  },
];

/**
 * Progress line for the tracker UI.
 * Always reminds the user that winners require the full sample (manual tracking).
 */
export function describeProgress(checked: number, total: number): string {
  if (total <= 0) return "No steps yet — start by naming the video under test.";
  const safeChecked = Math.max(0, Math.min(checked, total));
  if (safeChecked === total) {
    return `${total}/${total} steps logged — log complete. Apply the winner rule before acting on any variant.`;
  }
  return `${safeChecked}/${total} steps logged — keep logging; never judge a variant below the 1,000-impression rule. Manual tracking only.`;
}

/** One manually-logged thumbnail variant row. */
export interface ThumbnailVariant {
  /** Human label, e.g. "A", "B", "face-red-text". */
  label: string;
  impressions: number;
  clicks: number;
}

/** Rule-of-thumb minimum impressions per variant before a winner may be declared. */
export const MIN_IMPRESSIONS_PER_VARIANT = 1000;

export type VariantVerdict = "inconclusive" | "tie" | "winner";

export interface VariantResult extends ThumbnailVariant {
  ctr: number;
}

export interface VariantComparison {
  variants: VariantResult[];
  /** Winning variant label, or null when inconclusive/tied. */
  winner: string | null;
  verdict: VariantVerdict;
  reason: string;
}

/** CTR as a percentage rounded to 2 decimals. 0 impressions -> 0 (guarded). */
export function variantCtr(impressions: number, clicks: number): number {
  if (!Number.isFinite(impressions) || impressions <= 0) return 0;
  return Math.round((clicks / impressions) * 10000) / 100;
}

/**
 * Validate one variant row; returns human-readable problems (empty = valid).
 * Rules: non-empty label, finite integer impressions/clicks, non-negative,
 * clicks <= impressions.
 */
export function validateVariantNumbers(v: ThumbnailVariant): string[] {
  const problems: string[] = [];
  if (!v || typeof v !== "object") return ["variant must be an object"];
  if (typeof v.label !== "string" || v.label.trim() === "")
    problems.push("label must be a non-empty string");
  for (const k of ["impressions", "clicks"] as const) {
    const n = v[k];
    if (typeof n !== "number" || !Number.isFinite(n))
      problems.push(`${k} must be a finite number`);
    else if (!Number.isInteger(n)) problems.push(`${k} must be an integer`);
    else if (n < 0) problems.push(`${k} must be >= 0`);
  }
  if (
    typeof v.impressions === "number" &&
    typeof v.clicks === "number" &&
    v.clicks > v.impressions
  ) {
    problems.push("clicks cannot exceed impressions");
  }
  return problems;
}

/**
 * Compare A/B(/C) thumbnail variants from manually logged numbers.
 * Declares a winner only when there are >= 2 variants AND every variant has
 * at least `minImpressions` impressions; otherwise "inconclusive". Tied top
 * CTRs -> "tie". This is a rule-of-thumb comparison, not a significance test.
 */
export function compareThumbnailVariants(
  variants: ThumbnailVariant[],
  minImpressions: number = MIN_IMPRESSIONS_PER_VARIANT,
): VariantComparison {
  const rows: VariantResult[] = (Array.isArray(variants) ? variants : []).map((v) => ({
    label: String(v.label),
    impressions: v.impressions,
    clicks: v.clicks,
    ctr: variantCtr(v.impressions, v.clicks),
  }));
  rows.sort((a, b) => b.ctr - a.ctr);

  if (rows.length < 2) {
    return {
      variants: rows,
      winner: null,
      verdict: "inconclusive",
      reason: "Inconclusive: log at least 2 variants to compare.",
    };
  }
  const underSampled = rows.filter((r) => r.impressions < minImpressions);
  if (underSampled.length > 0) {
    return {
      variants: rows,
      winner: null,
      verdict: "inconclusive",
      reason:
        `Inconclusive (manual tracking): variant(s) ${underSampled
          .map((r) => r.label)
          .join(", ")} below the ${minImpressions}-impression rule of thumb. ` +
        "Keep logging — never judge a variant on a small sample.",
    };
  }
  if (rows[0].ctr === rows[1].ctr) {
    return {
      variants: rows,
      winner: null,
      verdict: "tie",
      reason: `Tie (manual tracking): top variants both sit at ${rows[0].ctr}% CTR.`,
    };
  }
  return {
    variants: rows,
    winner: rows[0].label,
    verdict: "winner",
    reason:
      `Winner (manual tracking): variant ${rows[0].label} leads at ${rows[0].ctr}% CTR ` +
      `over ${rows[0].impressions} impressions.`,
  };
}
