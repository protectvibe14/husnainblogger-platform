/**
 * CTR & Impressions Log — pure logic (storage-agnostic).
 *
 * ASSUMPTIONS:
 * - No DOM, no network, no imports, no Date.now() (all dates come from the
 *   caller, so functions are deterministic and testable). The UI layer owns
 *   persistence (localStorage) and id generation.
 * - Entries are manually logged by the creator (YouTube Studio analytics
 *   cannot be imported client-side without OAuth/API). All outputs therefore
 *   describe the logged sample, not the channel's true analytics.
 * - CTR = clicks / impressions * 100. An entry with 0 impressions has CTR 0
 *   (documented; division guarded).
 * - `trendDirection` uses an ordinary-least-squares slope on the per-day CTR
 *   series: |slope| < 0.05 percentage-points/day -> "flat". Fewer than 3
 *   distinct days -> "insufficient".
 * - `compareVariants` (for tool-106 A/B tracking) declares a winner only when
 *   each variant has >= MIN_IMPRESSIONS_PER_VARIANT (default 100) impressions;
 *   otherwise "inconclusive" — the tool must never crown a winner on noise.
 * - All mutating helpers are immutable: they return new arrays.
 */

/** A single manually-logged data point. */
export interface CtrEntry {
  /** Stable id (UI layer generates; must be unique within the log). */
  id: string;
  /** ISO date (YYYY-MM-DD). Time-of-day is ignored for aggregation. */
  date: string;
  /** Human label: video title, variant name, etc. */
  label: string;
  /** Optional A/B variant (e.g. "A", "B") for thumbnail tests. */
  variant?: string;
  impressions: number;
  clicks: number;
}

/** Minimum impressions per variant before compareVariants may declare a winner. */
export const MIN_IMPRESSIONS_PER_VARIANT = 100;

export type TrendDirection = "up" | "down" | "flat" | "insufficient";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Validate one entry; returns a list of human-readable problems (empty = valid). */
export function validateEntry(entry: CtrEntry): string[] {
  const problems: string[] = [];
  if (!entry || typeof entry !== "object") return ["entry must be an object"];
  if (typeof entry.id !== "string" || entry.id.trim() === "") problems.push("id must be a non-empty string");
  if (typeof entry.label !== "string" || entry.label.trim() === "") problems.push("label must be a non-empty string");
  if (typeof entry.date !== "string" || !ISO_DATE.test(entry.date) || Number.isNaN(Date.parse(entry.date))) {
    problems.push("date must be a valid ISO date (YYYY-MM-DD)");
  }
  for (const k of ["impressions", "clicks"] as const) {
    const v = entry[k];
    if (typeof v !== "number" || !Number.isFinite(v)) problems.push(`${k} must be a finite number`);
    else if (v < 0) problems.push(`${k} must be >= 0`);
    else if (!Number.isInteger(v)) problems.push(`${k} must be an integer`);
  }
  if (
    typeof entry.impressions === "number" &&
    typeof entry.clicks === "number" &&
    entry.clicks > entry.impressions
  ) {
    problems.push("clicks cannot exceed impressions");
  }
  return problems;
}

/** CTR for one entry, percentage rounded to 2 decimals. 0 impressions -> 0. */
export function ctrOf(entry: CtrEntry): number {
  if (entry.impressions <= 0) return 0;
  return Math.round((entry.clicks / entry.impressions) * 10000) / 100;
}

/**
 * Immutable add. @throws {Error} if the entry is invalid or its id is taken.
 */
export function addEntry(entries: CtrEntry[], entry: CtrEntry): CtrEntry[] {
  if (!Array.isArray(entries)) throw new TypeError("addEntry expects an entries array");
  const problems = validateEntry(entry);
  if (problems.length > 0) throw new Error("Invalid entry: " + problems.join("; "));
  if (entries.some((e) => e.id === entry.id)) throw new Error(`Duplicate id: ${entry.id}`);
  return [...entries, entry];
}

/**
 * Immutable remove by id. @throws {Error} if the id is not found.
 */
export function removeEntry(entries: CtrEntry[], id: string): CtrEntry[] {
  if (!entries.some((e) => e.id === id)) throw new Error(`Unknown id: ${id}`);
  return entries.filter((e) => e.id !== id);
}

export interface LogSummary {
  entryCount: number;
  totalImpressions: number;
  totalClicks: number;
  /** Impression-weighted overall CTR. */
  overallCtr: number;
  best: (CtrEntry & { ctr: number }) | null;
  worst: (CtrEntry & { ctr: number }) | null;
  dateRange: { from: string; to: string } | null;
}

/**
 * Summary over the whole log. best/worst are ranked by per-entry CTR; entries
 * below `minImpressions` are excluded from best/worst (default 0 = include all).
 */
export function summarize(entries: CtrEntry[], minImpressions = 0): LogSummary {
  const totalImpressions = entries.reduce((a, e) => a + e.impressions, 0);
  const totalClicks = entries.reduce((a, e) => a + e.clicks, 0);
  const eligible = entries.filter((e) => e.impressions >= minImpressions);
  const ranked = [...eligible]
    .map((e) => ({ ...e, ctr: ctrOf(e) }))
    .sort((a, b) => b.ctr - a.ctr);
  const dates = entries.map((e) => e.date).sort();
  return {
    entryCount: entries.length,
    totalImpressions,
    totalClicks,
    overallCtr: totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0,
    best: ranked[0] ?? null,
    worst: ranked[ranked.length - 1] ?? null,
    dateRange: dates.length > 0 ? { from: dates[0], to: dates[dates.length - 1] } : null,
  };
}

export interface PeriodBucket {
  period: string; // YYYY-MM-DD | YYYY-Www | YYYY-MM
  impressions: number;
  clicks: number;
  ctr: number;
  entries: number;
}

function periodKey(date: string, period: "day" | "week" | "month"): string {
  const d = new Date(date + "T00:00:00Z");
  if (period === "day") return date;
  if (period === "month") return date.slice(0, 7);
  // ISO week: YYYY-Www
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = (t.getUTCDay() + 6) % 7; // Mon=0
  t.setUTCDate(t.getUTCDate() - day + 3); // Thursday of this week
  const firstThursday = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  const fday = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - fday + 3);
  const week = 1 + Math.round((t.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Aggregate impressions/clicks/CTR by day, ISO week, or month. */
export function aggregateByPeriod(
  entries: CtrEntry[],
  period: "day" | "week" | "month",
): PeriodBucket[] {
  const map = new Map<string, PeriodBucket>();
  for (const e of entries) {
    const key = periodKey(e.date, period);
    const b = map.get(key) ?? { period: key, impressions: 0, clicks: 0, ctr: 0, entries: 0 };
    b.impressions += e.impressions;
    b.clicks += e.clicks;
    b.entries += 1;
    map.set(key, b);
  }
  const out = [...map.values()];
  for (const b of out) {
    b.ctr = b.impressions > 0 ? Math.round((b.clicks / b.impressions) * 10000) / 100 : 0;
  }
  return out.sort((a, b) => (a.period < b.period ? -1 : 1));
}

/**
 * Direction of the per-day CTR series via OLS slope.
 * Returns "insufficient" when fewer than 3 distinct days are present.
 */
export function trendDirection(entries: CtrEntry[]): TrendDirection {
  const daily = aggregateByPeriod(entries, "day");
  if (daily.length < 3) return "insufficient";
  const n = daily.length;
  const xs = daily.map((_, i) => i);
  const ys = daily.map((b) => b.ctr);
  const meanX = xs.reduce((a, x) => a + x, 0) / n;
  const meanY = ys.reduce((a, y) => a + y, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den; // CTR points per day
  if (Math.abs(slope) < 0.05) return "flat";
  return slope > 0 ? "up" : "down";
}

export interface VariantResult {
  variant: string;
  impressions: number;
  clicks: number;
  ctr: number;
  entries: number;
}

export interface VariantComparison {
  variants: VariantResult[];
  /** Winner variant name, or null when inconclusive/tied. */
  winner: string | null;
  verdict: "inconclusive" | "tie" | "winner";
  reason: string;
}

/**
 * Compare A/B variants (tool-106). A winner is declared only when every
 * variant has at least `minImpressions` impressions (default
 * MIN_IMPRESSIONS_PER_VARIANT = 100) — otherwise "inconclusive".
 */
export function compareVariants(
  entries: CtrEntry[],
  minImpressions: number = MIN_IMPRESSIONS_PER_VARIANT,
): VariantComparison {
  const map = new Map<string, VariantResult>();
  for (const e of entries) {
    const v = e.variant ?? "default";
    const r = map.get(v) ?? { variant: v, impressions: 0, clicks: 0, ctr: 0, entries: 0 };
    r.impressions += e.impressions;
    r.clicks += e.clicks;
    r.entries += 1;
    map.set(v, r);
  }
  const variants = [...map.values()].sort((a, b) => b.ctr - a.ctr);
  for (const v of variants) {
    v.ctr = v.impressions > 0 ? Math.round((v.clicks / v.impressions) * 10000) / 100 : 0;
  }
  variants.sort((a, b) => b.ctr - a.ctr);
  if (variants.length < 2) {
    return { variants, winner: null, verdict: "inconclusive", reason: "Need at least 2 variants to compare." };
  }
  const underSampled = variants.filter((v) => v.impressions < minImpressions);
  if (underSampled.length > 0) {
    return {
      variants,
      winner: null,
      verdict: "inconclusive",
      reason: `Inconclusive: variant(s) ${underSampled.map((v) => v.variant).join(", ")} below ${minImpressions} impressions.`,
    };
  }
  if (variants[0].ctr === variants[1].ctr) {
    return { variants, winner: null, verdict: "tie", reason: "Top variants are tied on CTR." };
  }
  return {
    variants,
    winner: variants[0].variant,
    verdict: "winner",
    reason: `Variant ${variants[0].variant} leads at ${variants[0].ctr}% CTR over ${variants[0].impressions} impressions.`,
  };
}

// ---------------------------------------------------------------------------
// runTool adapter (platform dispatch). Reuses the engine above unchanged.
// ---------------------------------------------------------------------------

/** Max log entries accepted per runTool call (keeps the run bounded). */
export const MAX_RUN_ENTRIES = 500;

export type RunPeriod = "day" | "week" | "month";

function csvCell(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/**
 * Platform adapter: runTool({ entries, period }).
 * `entries` is the creator's manually logged array of CtrEntry objects
 * (the UI layer owns persistence in localStorage and id generation).
 * Returns computed stats: per-entry CTR table, period aggregates,
 * best/worst entry, trend direction, and a CSV export string.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!values || typeof values !== "object") return { ok: false, error: "No inputs were provided." };

  const raw = (values as { entries?: unknown }).entries ?? (values as { items?: unknown }).items;
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: "Log at least one entry (date, label, impressions, clicks) before running." };
  }
  if (raw.length > MAX_RUN_ENTRIES) {
    return { ok: false, error: `Too many entries (max ${MAX_RUN_ENTRIES} per run).` };
  }

  const seen = new Set<string>();
  const entries: CtrEntry[] = [];
  for (let i = 0; i < raw.length; i++) {
    const e = raw[i] as CtrEntry;
    const problems = validateEntry(e);
    if (problems.length > 0) return { ok: false, error: `Entry ${i + 1}: ${problems.join("; ")}` };
    if (seen.has(e.id)) return { ok: false, error: `Entry ${i + 1}: duplicate id "${e.id}".` };
    seen.add(e.id);
    entries.push(e);
  }

  const periodRaw = (values as { period?: unknown }).period;
  const period: RunPeriod =
    periodRaw === "week" || periodRaw === "month" || periodRaw === "day" ? periodRaw : "day";

  const s = summarize(entries);
  const buckets = aggregateByPeriod(entries, period);
  const trend = trendDirection(entries);

  const table = {
    columns: ["Date", "Label", "Impressions", "Clicks", "CTR"],
    rows: [...entries]
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map((e) => [
        e.date,
        e.label,
        e.impressions.toLocaleString("en-US"),
        e.clicks.toLocaleString("en-US"),
        `${ctrOf(e).toFixed(2)}%`,
      ]),
  };

  const periodAggregates: string[] = buckets.map(
    (b) =>
      `${b.period}: ${b.impressions.toLocaleString("en-US")} impressions, ${b.clicks.toLocaleString("en-US")} clicks, ${b.ctr.toFixed(2)}% CTR (${b.entries} ${b.entries === 1 ? "entry" : "entries"})`,
  );

  const fmtEntry = (e: (CtrEntry & { ctr: number }) | null): string =>
    e === null
      ? "—"
      : `"${e.label}" (${e.date}) — ${e.ctr.toFixed(2)}% CTR (${e.clicks.toLocaleString("en-US")}/${e.impressions.toLocaleString("en-US")})`;

  const trendText: Record<TrendDirection, string> = {
    up: "Up — daily CTR is trending higher across the logged days.",
    down: "Down — daily CTR is trending lower across the logged days.",
    flat: "Flat — daily CTR is roughly unchanged across the logged days.",
    insufficient: "Insufficient data — log entries across at least 3 different days to see a trend.",
  };

  const csv =
    "date,label,impressions,clicks,ctr_pct\n" +
    entries
      .map((e) => [e.date, csvCell(e.label), String(e.impressions), String(e.clicks), ctrOf(e).toFixed(2)].join(","))
      .join("\n");

  const guidance: string[] = [];
  if (trend === "insufficient") {
    guidance.push("Trend needs entries across at least 3 different days — keep logging to unlock it.");
  }
  guidance.push(
    "Manual log only: these numbers describe the entries you logged here. The tool cannot import YouTube Studio analytics (that needs OAuth/API access).",
  );
  guidance.push("Entries with 0 impressions are logged with 0% CTR (division guarded).");

  const range = s.dateRange ? ` · ${s.dateRange.from} to ${s.dateRange.to}` : "";

  return {
    ok: true,
    values: {
      entryCount: s.entryCount,
      totalImpressions: s.totalImpressions,
      totalClicks: s.totalClicks,
      overallCtr: s.overallCtr,
      summary: `${s.entryCount} ${s.entryCount === 1 ? "entry" : "entries"} · ${s.totalImpressions.toLocaleString("en-US")} impressions · ${s.totalClicks.toLocaleString("en-US")} clicks · ${s.overallCtr.toFixed(2)}% overall CTR${range}.`,
      entriesTable: table,
      bestEntry: fmtEntry(s.best),
      worstEntry: fmtEntry(s.worst),
      trend: trendText[trend],
      periodAggregates,
      csv,
      guidance,
    },
  };
}
