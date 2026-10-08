/**
 * Shorts Posting-Time Experiment Tracker (tool-125) — pure logic, zero
 * imports, zero network, zero DOM, no Math.random, no Date.now().
 *
 * SELF-COLLECTED EXPERIMENT DATA ONLY. This tool cannot fetch posting-time
 * analytics — YouTube Studio data is not importable client-side without
 * OAuth/API. Everything here works on entries the creator logs manually
 * ({ datetime posted, views @24h, avg view duration }) plus a fixed
 * experiment-protocol checklist. Nothing is computed from real channel
 * data, and no "best time" is ever invented.
 *
 * Engine (documented):
 *   TRACKER_ITEMS — 12-item experiment protocol checklist (design tips:
 *     rotate slots, hold content type constant, read views at exactly 24h,
 *     sample-size guard).
 *   slotHour(entry) — posting hour (0–23) of an entry's datetime, used as
 *     the "time slot" key.
 *   summarizeSlots(entries) — per-hour aggregates: count, average views,
 *     average view duration (seconds).
 *   bestSlot(aggregates) — names a best slot ONLY when it has at least
 *     MIN_PER_SLOT (5) logged Shorts; otherwise returns a "keep-testing"
 *     verdict — never a false winner. Winner = highest average views;
 *     ties broken by larger sample, then earlier hour (deterministic).
 *   describeProgress(checked, total) — checklist progress string.
 */

/** Minimum logged Shorts per slot before a winner may be declared. */
export const MIN_PER_SLOT = 5;

/** A single manually-logged Short. */
export interface PostingEntry {
  /** ISO datetime the Short was posted, e.g. "2026-09-20T18:05:00". */
  postedAt: string;
  /** Views counted exactly 24h after posting. Must be >= 0. */
  views24h: number;
  /** Average view duration in seconds @24h. Must be >= 0. */
  avgViewDurationSec: number;
}

/** Per-slot aggregate. */
export interface SlotAggregate {
  /** Posting hour of day, 0–23. */
  slot: number;
  /** Human label, e.g. "6 PM". */
  label: string;
  /** Logged Shorts in this slot. */
  count: number;
  /** Average views @24h, rounded to 1 decimal. */
  avgViews: number;
  /** Average view duration in seconds, rounded to 1 decimal. */
  avgViewDurationSec: number;
}

/** Best-slot verdict — never a false winner on thin data. */
export type BestSlotVerdict =
  | {
      verdict: "winner";
      slot: number;
      label: string;
      count: number;
      avgViews: number;
      avgViewDurationSec: number;
    }
  | { verdict: "keep-testing"; reason: string };

export interface TrackerItem {
  id: string;
  label: string;
  detail?: string;
}

/**
 * Fixed experiment-protocol checklist (12 items). These are the
 * "experiment design tips" from the tool's classification: rotate slots,
 * hold content type constant, log consistently, and respect the
 * sample-size guard.
 */
export const TRACKER_ITEMS: TrackerItem[] = [
  {
    id: "define-test-window",
    label: "Set a test window of 2–3 weeks",
    detail:
      "Decide the start and end dates up front. A fixed window stops you from cherry-picking lucky days after the fact.",
  },
  {
    id: "pick-time-slots",
    label: "Pick 3–4 posting time slots to test",
    detail:
      "Example: 7 AM, 12 PM, 6 PM, 9 PM in your audience's timezone. Test slots you can actually sustain long-term.",
  },
  {
    id: "hold-content-type-constant",
    label: "Keep content type consistent during the test",
    detail:
      "Post similar Shorts across all slots. If you change the niche, format, or quality mid-test, the results mean nothing.",
  },
  {
    id: "rotate-slots-evenly",
    label: "Rotate slots so each gets a similar count",
    detail:
      "Don't post 10 Shorts at 6 PM and 2 at 7 AM — unequal samples make the comparison unfair.",
  },
  {
    id: "log-every-short",
    label: "Log every Short inside the window",
    detail:
      "Record the exact date and time you posted. Skip none — leaving out flops is the easiest way to lie to yourself.",
  },
  {
    id: "read-views-at-24h",
    label: "Read views exactly 24 hours after posting",
    detail:
      "Same age for every Short. Comparing a 2-day-old Short with a 1-day-old one is not an experiment.",
  },
  {
    id: "record-view-duration",
    label: "Also log average view duration",
    detail:
      "Views alone can mislead: a slot with fewer but longer-watched views may be the better slot for the algorithm.",
  },
  {
    id: "note-anomalies",
    label: "Note anything unusual per Short",
    detail:
      "A shoutout, a trending sound, or a platform outage can explain an outlier — write it down while it's fresh.",
  },
  {
    id: "reach-five-per-slot",
    label: "Aim for at least 5 Shorts per slot",
    detail:
      "The tool only names a best slot when it has 5+ logged Shorts. Fewer than that is noise, not signal.",
  },
  {
    id: "compare-averages",
    label: "Compare averages, not totals",
    detail:
      "Average views per slot is the fair metric when slots have different counts. The tool computes this for you.",
  },
  {
    id: "accept-keep-testing",
    label: "Accept a 'keep testing' verdict",
    detail:
      "If no slot leads clearly, keep testing instead of crowning a winner. A false winner costs more than waiting.",
  },
  {
    id: "retest-seasonally",
    label: "Re-run the test when your audience changes",
    detail:
      "Audience mix, school terms, and holidays shift the best slot. Treat the result as seasonal, not permanent.",
  },
];

/**
 * Progress string for the checklist UI.
 * Exported per the tracker contract (no runTool for tracker tools).
 */
export function describeProgress(checked: number, total: number): string {
  const t = Math.max(0, Math.floor(Number.isFinite(total) ? total : 0));
  const c = Math.min(Math.max(0, Math.floor(Number.isFinite(checked) ? checked : 0)), t);
  if (t === 0) return "0 of 0 experiment steps complete (0%)";
  const pct = Math.round((c / t) * 100);
  const base = `${c} of ${t} experiment steps complete (${pct}%)`;
  return c === t ? `${base} — ready to judge the results` : base;
}

/** "6 PM" style label for an hour of day. */
export function slotLabel(hour: number): string {
  const h = ((Math.floor(hour) % 24) + 24) % 24;
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

/** Validate one entry; returns an error string or null when valid. */
export function validateEntry(entry: PostingEntry): string | null {
  if (!entry || typeof entry !== "object") return "Entry must be an object.";
  const ms = Date.parse(entry.postedAt);
  if (typeof entry.postedAt !== "string" || Number.isNaN(ms)) {
    return "postedAt must be a valid datetime (e.g. 2026-09-20T18:05:00).";
  }
  if (!Number.isFinite(entry.views24h) || entry.views24h < 0) {
    return "views24h must be a non-negative number.";
  }
  if (!Number.isFinite(entry.avgViewDurationSec) || entry.avgViewDurationSec < 0) {
    return "avgViewDurationSec must be a non-negative number.";
  }
  return null;
}

/** Posting hour (0–23) of an entry — the "time slot" key. Uses UTC to stay deterministic. */
export function slotHour(entry: PostingEntry): number {
  return new Date(entry.postedAt).getUTCHours();
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Aggregate entries by posting hour. Invalid entries are skipped (they are
 * reported in `skipped`). Exported for tests and future UI wiring.
 */
export function summarizeSlots(entries: PostingEntry[]): {
  aggregates: SlotAggregate[];
  skipped: number;
} {
  const bySlot = new Map<number, { views: number; avd: number; count: number }>();
  let skipped = 0;
  for (const e of entries) {
    if (validateEntry(e) !== null) {
      skipped++;
      continue;
    }
    const slot = slotHour(e);
    const cur = bySlot.get(slot) ?? { views: 0, avd: 0, count: 0 };
    cur.views += e.views24h;
    cur.avd += e.avgViewDurationSec;
    cur.count += 1;
    bySlot.set(slot, cur);
  }
  const aggregates: SlotAggregate[] = [...bySlot.entries()]
    .map(([slot, a]) => ({
      slot,
      label: slotLabel(slot),
      count: a.count,
      avgViews: round1(a.views / a.count),
      avgViewDurationSec: round1(a.avd / a.count),
    }))
    .sort((a, b) => a.slot - b.slot);
  return { aggregates, skipped };
}

/**
 * Best-slot verdict with the sample-size guard: a slot is only named when
 * it has >= MIN_PER_SLOT logged Shorts. Otherwise "keep-testing" — the
 * tool never crowns a winner on thin data.
 */
export function bestSlot(aggregates: SlotAggregate[]): BestSlotVerdict {
  const eligible = aggregates.filter((a) => a.count >= MIN_PER_SLOT);
  if (eligible.length === 0) {
    const best = aggregates.length;
    return {
      verdict: "keep-testing",
      reason:
        best === 0
          ? "No valid entries logged yet — log your first Shorts to start the experiment."
          : `No slot has ${MIN_PER_SLOT} logged Shorts yet (best is below the guard). Keep testing — do not crown a winner on thin data.`,
    };
  }
  const sorted = [...eligible].sort(
    (a, b) => b.avgViews - a.avgViews || b.count - a.count || a.slot - b.slot,
  );
  const w = sorted[0];
  return {
    verdict: "winner",
    slot: w.slot,
    label: w.label,
    count: w.count,
    avgViews: w.avgViews,
    avgViewDurationSec: w.avgViewDurationSec,
  };
}
