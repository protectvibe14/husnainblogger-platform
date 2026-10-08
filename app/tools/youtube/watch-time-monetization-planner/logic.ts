/**
 * Watch-Time Monetization Planner — pure logic (tool-117).
 *
 * ARITHMETIC, NOT AI: projects how long until a channel meets the YouTube
 * Partner Program (YPP) watch-time / Shorts-view thresholds from manually
 * entered numbers. The rolling-window projection is a simplified linear
 * projection — it is labeled an ESTIMATE everywhere it appears.
 *
 * YPP thresholds consumed (verified via 2026 sources; see platform-rules):
 *   Long-form path  — 1,000 subscribers + 4,000 valid public watch hours
 *                     in the last 12 months.
 *   Shorts path     — 1,000 subscribers + 10,000,000 valid public Shorts
 *                     views in the last 90 days.
 *   Fan-funding tier — 500 subscribers + 3 public uploads in the last 90
 *                     days + (3,000 valid public watch hours in the last
 *                     12 months OR 3,000,000 valid public Shorts views in
 *                     the last 90 days).
 *
 * VERIFIED RULE baked into a warning: Shorts watch hours do NOT count
 * toward the 4,000-hour long-form requirement.
 *
 * Zero imports. Deterministic for identical inputs (target-date math uses
 * the current calendar day; two calls on the same day give identical
 * results).
 */

export type MonetizationPath = "long-form" | "shorts";

export const PATHS: MonetizationPath[] = ["long-form", "shorts"];

/** Long-form YPP threshold: 4,000 valid public watch hours / 12 months. */
export const LONG_FORM_HOURS_THRESHOLD = 4000;
/** Shorts YPP threshold: 10M valid public Shorts views / 90 days. */
export const SHORTS_VIEWS_THRESHOLD = 10000000;
/** Subscriber requirement for both main YPP paths. */
export const YPP_SUBSCRIBER_THRESHOLD = 1000;
/** Fan-funding tier thresholds. */
export const FAN_FUNDING_SUBS = 500;
export const FAN_FUNDING_UPLOADS_90D = 3;
export const FAN_FUNDING_HOURS = 3000;
export const FAN_FUNDING_SHORTS_VIEWS = 3000000;

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function isPath(p: unknown): p is MonetizationPath {
  return p === "long-form" || p === "shorts";
}

function isNonNegativeNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0;
}

/** Optional numeric input: undefined/null/"" are allowed when not required. */
function optionalNumber(
  raw: unknown,
  field: string
): { ok: true; value: number | null } | { ok: false; error: string } {
  if (raw === undefined || raw === null || raw === "") {
    return { ok: true, value: null };
  }
  if (!isNonNegativeNumber(raw)) {
    return { ok: false, error: `${field} must be a non-negative number.` };
  }
  return { ok: true, value: raw };
}

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function formatDays(days: number): string {
  if (days <= 0) return "already met";
  if (days === 1) return "about 1 day";
  if (days < 60) return `about ${Math.ceil(days)} days`;
  const months = days / 30.44;
  if (months < 24) return `about ${months.toFixed(1)} months`;
  return `about ${(months / 12).toFixed(1)} years`;
}

export interface PlanInputs {
  path: MonetizationPath;
  subscribers: number | null;
  currentWatchHours: number | null;
  currentShortsViews: number | null;
  avgViewsPerDay: number | null;
  avgViewDurationMinutes: number | null;
  uploadsLast90Days: number | null;
  targetDate: string | null;
}

export interface PlanResult {
  /** Human threshold label, e.g. "4,000 watch hours". */
  threshold: string;
  current: number;
  remaining: number;
  /** Estimated days at current pace; null when no pace could be computed. */
  estimatedDays: number | null;
  /** Plain-language summary of the pace math (or why it is missing). */
  paceSummary: string;
  /** Required daily pace to hit targetDate; null when no target date. */
  requiredDailyPace: string | null;
  /** Fan-funding tier progress summary. */
  fanFunding: string;
  /** Warnings incl. the verified Shorts-hours rule + rolling-window note. */
  warnings: string[];
  /** Estimate disclaimer, always present. */
  disclaimer: string;
  /** Always true — marks the result as a simplified projection. */
  isEstimate: true;
}

function validate(raw: Record<string, unknown>):
  | { ok: true; inputs: PlanInputs }
  | { ok: false; error: string } {
  const path = raw["path"];
  if (!isPath(path)) {
    return { ok: false, error: "Choose a path: long-form or shorts." };
  }

  const subs = optionalNumber(raw["subscribers"], "Subscribers");
  if (!subs.ok) return subs;
  const uploads = optionalNumber(raw["uploadsLast90Days"], "Uploads in the last 90 days");
  if (!uploads.ok) return uploads;
  const viewsDay = optionalNumber(raw["avgViewsPerDay"], "Average views per day");
  if (!viewsDay.ok) return viewsDay;

  let current: number;
  let avgDuration: number | null = null;
  if (path === "long-form") {
    const hours = optionalNumber(raw["currentWatchHours"], "Current watch hours");
    if (!hours.ok) return hours;
    if (hours.value === null) {
      return { ok: false, error: "Enter your current valid public watch hours (last 12 months)." };
    }
    current = hours.value;
    const dur = optionalNumber(raw["avgViewDurationMinutes"], "Average view duration");
    if (!dur.ok) return dur;
    avgDuration = dur.value;
  } else {
    const sv = optionalNumber(raw["currentShortsViews"], "Current Shorts views");
    if (!sv.ok) return sv;
    if (sv.value === null) {
      return { ok: false, error: "Enter your current valid public Shorts views (last 90 days)." };
    }
    current = sv.value;
  }

  let targetDate: string | null = null;
  const td = raw["targetDate"];
  if (td !== undefined && td !== null && td !== "") {
    if (typeof td !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(td)) {
      return { ok: false, error: "Target date must be a valid date (YYYY-MM-DD)." };
    }
    const targetMs = new Date(td + "T00:00:00").getTime();
    if (Number.isNaN(targetMs)) {
      return { ok: false, error: "Target date must be a valid date (YYYY-MM-DD)." };
    }
    if (targetMs <= startOfToday()) {
      return { ok: false, error: "Target date must be in the future." };
    }
    targetDate = td;
  }

  return {
    ok: true,
    inputs: {
      path,
      subscribers: subs.value,
      currentWatchHours: path === "long-form" ? current : null,
      currentShortsViews: path === "shorts" ? current : null,
      avgViewsPerDay: viewsDay.value,
      avgViewDurationMinutes: avgDuration,
      uploadsLast90Days: uploads.value,
      targetDate,
    },
  };
}

function fanFundingStatus(i: PlanInputs): string {
  const missing: string[] = [];
  if (i.subscribers === null) missing.push("subscribers");
  if (i.uploadsLast90Days === null) missing.push("uploads in the last 90 days");
  if (missing.length > 0) {
    return `Add ${missing.join(" and ")} to check the fan-funding tier (needs 500 subs, 3 uploads in 90 days, plus 3,000 watch hours or 3M Shorts views).`;
  }
  const subs = i.subscribers as number;
  const uploads = i.uploadsLast90Days as number;
  const parts: string[] = [];
  parts.push(subs >= FAN_FUNDING_SUBS ? `subscribers ${formatNumber(subs)}/500 met` : `subscribers ${formatNumber(subs)}/500 not met`);
  parts.push(uploads >= FAN_FUNDING_UPLOADS_90D ? `uploads ${uploads}/3 met` : `uploads ${uploads}/3 not met`);
  const hoursOk = i.currentWatchHours !== null && i.currentWatchHours >= FAN_FUNDING_HOURS;
  const shortsOk = i.currentShortsViews !== null && i.currentShortsViews >= FAN_FUNDING_SHORTS_VIEWS;
  if (i.path === "long-form") {
    parts.push(hoursOk ? "watch hours 3,000 met" : `watch hours ${formatNumber(i.currentWatchHours ?? 0)}/3,000 not met`);
  } else {
    parts.push(shortsOk ? "Shorts views 3M met" : `Shorts views ${formatNumber(i.currentShortsViews ?? 0)}/3M not met`);
  }
  const eligible = subs >= FAN_FUNDING_SUBS && uploads >= FAN_FUNDING_UPLOADS_90D && (hoursOk || shortsOk);
  return eligible
    ? `Fan-funding tier (Supers, channel memberships, Shopping): likely eligible — ${parts.join("; ")}. Final approval is YouTube's.`
    : `Fan-funding tier: not yet eligible — ${parts.join("; ")}.`;
}

/**
 * Project the path to YPP eligibility. Throws nothing — validation
 * failures are returned as { ok: false, error } by runTool.
 */
export function planMonetization(i: PlanInputs): PlanResult {
  const isLong = i.path === "long-form";
  const threshold = isLong ? LONG_FORM_HOURS_THRESHOLD : SHORTS_VIEWS_THRESHOLD;
  const current = (isLong ? i.currentWatchHours : i.currentShortsViews) as number;
  const remaining = Math.max(0, threshold - current);

  // Daily pace from manual inputs.
  let dailyPace: number | null = null;
  let paceSummary: string;
  if (isLong) {
    if (i.avgViewsPerDay !== null && i.avgViewDurationMinutes !== null && i.avgViewsPerDay > 0 && i.avgViewDurationMinutes > 0) {
      dailyPace = (i.avgViewsPerDay * i.avgViewDurationMinutes) / 60; // watch hours/day
      paceSummary = `Current pace: ~${dailyPace.toFixed(1)} watch hours/day (${formatNumber(i.avgViewsPerDay)} views/day x ${i.avgViewDurationMinutes} min avg duration).`;
    } else {
      paceSummary = "No pace estimated — add average views/day and average view duration to project a date.";
    }
  } else {
    if (i.avgViewsPerDay !== null && i.avgViewsPerDay > 0) {
      dailyPace = i.avgViewsPerDay;
      paceSummary = `Current pace: ~${formatNumber(dailyPace)} Shorts views/day.`;
    } else {
      paceSummary = "No pace estimated — add average views/day to project a date.";
    }
  }

  const estimatedDays = dailyPace !== null && dailyPace > 0 ? remaining / dailyPace : null;

  let requiredDailyPace: string | null = null;
  if (i.targetDate !== null) {
    const daysUntil = Math.ceil((new Date(i.targetDate + "T00:00:00").getTime() - startOfToday()) / MS_PER_DAY);
    if (remaining <= 0) {
      requiredDailyPace = "Threshold already met — no daily pace needed.";
    } else if (daysUntil > 0) {
      const need = remaining / daysUntil;
      requiredDailyPace = isLong
        ? `To hit ${i.targetDate} (${daysUntil} days): ~${need.toFixed(1)} watch hours/day${i.avgViewDurationMinutes && i.avgViewDurationMinutes > 0 ? ` (~${formatNumber((need * 60) / i.avgViewDurationMinutes)} views/day at your avg duration)` : ""}.`
        : `To hit ${i.targetDate} (${daysUntil} days): ~${formatNumber(need)} Shorts views/day.`;
    }
  }

  const warnings: string[] = [];
  if (!isLong) {
    warnings.push("Shorts watch hours do NOT count toward the 4,000-hour long-form requirement — this plan uses the separate 10M Shorts-views path.");
  }
  warnings.push(
    isLong
      ? "12-month rolling window: watch hours older than 12 months expire, so the linear projection is optimistic if early hours are about to drop off."
      : "90-day rolling window: Shorts views older than 90 days expire, so the linear projection is optimistic if early views are about to drop off."
  );
  if (i.subscribers !== null && i.subscribers < YPP_SUBSCRIBER_THRESHOLD) {
    warnings.push(`You also need 1,000 subscribers for YPP (you entered ${formatNumber(i.subscribers)}).`);
  }
  if (remaining <= 0) {
    warnings.push("Threshold already met on watch time/views — subscribers and policy review are the remaining gates.");
  }

  return {
    threshold: isLong ? "4,000 watch hours" : "10,000,000 Shorts views",
    current,
    remaining,
    estimatedDays: estimatedDays === null ? null : Math.ceil(estimatedDays),
    paceSummary: remaining <= 0
      ? "Threshold already met — the remaining gates are 1,000 subscribers and YouTube's policy review."
      : estimatedDays === null
        ? paceSummary
        : `${paceSummary} At that pace you reach the threshold in ${formatDays(estimatedDays)} (estimate).`,
    requiredDailyPace,
    fanFunding: fanFundingStatus(i),
    warnings,
    disclaimer:
      "Estimate only: this is a simplified linear projection from numbers you entered. It ignores the rolling window expiring old hours/views, viral spikes or slumps, and YouTube's final policy review. Verify progress in YouTube Studio > Earn.",
    isEstimate: true,
  };
}

/** Template entry point. values keys: path, subscribers, currentWatchHours, currentShortsViews, avgViewsPerDay, avgViewDurationMinutes, uploadsLast90Days, targetDate. */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const v = validate(values);
  if (!v.ok) return { ok: false, error: v.error };
  const r = planMonetization(v.inputs);
  return {
    ok: true,
    values: {
      threshold: r.threshold,
      current: r.current,
      remaining: r.remaining,
      estimatedDays: r.estimatedDays,
      paceSummary: r.paceSummary,
      requiredDailyPace: r.requiredDailyPace,
      fanFunding: r.fanFunding,
      warnings: r.warnings,
      disclaimer: r.disclaimer,
      isEstimate: r.isEstimate,
    },
  };
}
