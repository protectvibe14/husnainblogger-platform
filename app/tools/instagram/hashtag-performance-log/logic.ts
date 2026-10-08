/**
 * tool-216 — Hashtag Performance Log (builder tool).
 *
 * Manual-entry log of hashtag-set performance. The BuilderTemplate calls
 * runTool({ items }), one item per logged hashtag set:
 *   { setLabel, date, reach, likes, comments, posts? }
 *
 * The engine validates every item and returns aggregate outputs:
 * totalReach, avgEngagementRate, bestSetLabel.
 *
 * HONESTY: This is a MANUAL log. It CANNOT pull real hashtag reach from
 * Instagram — all metrics are entered by the user. No network calls exist
 * in this file; nothing is fetched, estimated, or auto-detected.
 *
 * Pure TypeScript: zero imports, no DOM, no network, no Math.random.
 * Deterministic: same items -> same outputs, always.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

interface ParsedItem {
  setLabel: string;
  date: string;
  reach: number;
  likes: number;
  comments: number;
  posts: number | null;
}

const HONESTY_NOTE =
  "This is a manual log — it cannot pull real hashtag reach from Instagram. All metrics are entered by you.";

function fail(itemIndex: number, message: string): RunResult {
  return { ok: false, error: `Item ${itemIndex + 1}: ${message}` };
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const t = value.trim();
    if (t === "") return null;
    const n = Number(t);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function validateItem(raw: Record<string, unknown>, index: number): { item?: ParsedItem; error?: RunResult } {
  const setLabel = String(raw.setLabel ?? "").trim();
  if (setLabel === "") return { error: fail(index, "Set label is required (e.g. \"fitness-core-set\").") };

  const date = String(raw.date ?? "").trim();
  if (date === "") return { error: fail(index, "Date is required (YYYY-MM-DD).") };
  const parsed = Date.parse(date);
  if (!Number.isFinite(parsed)) return { error: fail(index, `Date "${date}" is not a valid date.`) };

  const reach = toFiniteNumber(raw.reach);
  if (reach === null) return { error: fail(index, "Reach must be a number (accounts reached, user-entered).") };
  if (reach < 0) return { error: fail(index, "Reach cannot be negative.") };

  const likes = toFiniteNumber(raw.likes);
  if (likes === null) return { error: fail(index, "Likes must be a number.") };
  if (likes < 0) return { error: fail(index, "Likes cannot be negative.") };

  const comments = toFiniteNumber(raw.comments);
  if (comments === null) return { error: fail(index, "Comments must be a number.") };
  if (comments < 0) return { error: fail(index, "Comments cannot be negative.") };

  let posts: number | null = null;
  if (raw.posts !== undefined && raw.posts !== null && String(raw.posts).trim() !== "") {
    const p = toFiniteNumber(raw.posts);
    if (p === null) return { error: fail(index, "Posts must be a number.") };
    if (p < 0) return { error: fail(index, "Posts cannot be negative.") };
    posts = Math.floor(p);
  }

  return { item: { setLabel, date, reach, likes, comments, posts } };
}

/**
 * Engagement rate for one set = (likes + comments) / reach * 100.
 * reach === 0 -> 0 (no division by zero).
 */
function engagementRate(reach: number, likes: number, comments: number): number {
  if (reach <= 0) return 0;
  return ((likes + comments) / reach) * 100;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function runTool(args: { items: Record<string, unknown>[] }): RunResult {
  const items = args?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return {
      ok: false,
      error:
        "Your log is empty. Add at least one hashtag set (label, date, reach, likes, comments) to see aggregates. " +
        HONESTY_NOTE,
    };
  }

  const parsed: ParsedItem[] = [];
  for (let i = 0; i < items.length; i++) {
    const v = validateItem(items[i], i);
    if (v.error) return v.error;
    parsed.push(v.item as ParsedItem);
  }

  const totalReach = parsed.reduce((s, p) => s + p.reach, 0);
  const totalEngagement = parsed.reduce((s, p) => s + p.likes + p.comments, 0);
  const avgEngagementRate = round2(totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0);

  let best = parsed[0];
  let bestRate = engagementRate(best.reach, best.likes, best.comments);
  for (let i = 1; i < parsed.length; i++) {
    const r = engagementRate(parsed[i].reach, parsed[i].likes, parsed[i].comments);
    if (r > bestRate) {
      best = parsed[i];
      bestRate = r;
    }
  }

  return {
    ok: true,
    values: {
      totalReach,
      avgEngagementRate,
      bestSetLabel: best.setLabel,
      setCount: parsed.length,
    },
  };
}
