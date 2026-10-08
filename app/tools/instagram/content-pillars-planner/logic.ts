/**
 * Instagram Content Pillars Planner — pure logic (tool-241), zero imports,
 * zero network, zero DOM.
 *
 * PLANNER, NOT AI: allocates a user's weekly post slots across 3–5 named
 * content pillars using FIXED weight presets (sum to 100) and
 * largest-remainder rounding so slots always add up exactly to the weekly
 * total. Nothing is fetched, ranked, or "optimized" — it is arithmetic.
 *
 * Weight presets by pillar count (fixed, documented):
 *   3 pillars -> [40, 35, 25]
 *   4 pillars -> [35, 30, 20, 15]
 *   5 pillars -> [30, 25, 20, 15, 10]
 *
 * Slots per pillar = round by largest fractional remainder (deterministic;
 * remainder ties break toward the earlier-listed pillar). The first pillar
 * is treated as the "primary" pillar and always gets the largest share.
 *
 * Deterministic: same inputs -> same outputs, always.
 */

export const MIN_PILLARS = 3;
export const MAX_PILLARS = 5;
export const MIN_WEEKLY_SLOTS = 1;
export const MAX_WEEKLY_SLOTS = 21;

/**
 * Fixed weight presets (percent), keyed by pillar count. Each row sums
 * to exactly 100. First pillar is the primary pillar (largest share).
 */
export const WEIGHT_PRESETS: Record<number, number[]> = {
  3: [40, 35, 25],
  4: [35, 30, 20, 15],
  5: [30, 25, 20, 15, 10],
};

export interface PillarAllocation {
  pillar: string;
  pct: number;
  slotsPerWeek: number;
}

export interface PillarsPlan {
  pillars: string[];
  weeklySlots: number;
  allocation: PillarAllocation[];
  balanceWarning: string;
  /** Always true — reminds consumers this is fixed-rule arithmetic, not AI. */
  isTemplateBased: true;
}

export const ASSUMPTIONS: string[] = [
  "Allocation uses fixed weight presets ([40,35,25] / [35,30,20,15] / [30,25,20,15,10]) — a common starter split, not data about your audience.",
  "The first pillar you list is treated as your primary pillar and gets the largest share.",
  "The planner has no performance data: it cannot tell you which pillar your audience actually prefers.",
];

/**
 * Split raw pillar text into a clean list. Accepts one pillar per line or
 * comma/semicolon separated. Trims, drops empties, de-duplicates
 * case-insensitively (keeps the first occurrence's casing).
 */
export function parsePillars(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[\n,;]+/)) {
    const name = part.trim();
    if (name.length === 0) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
}

/**
 * Distribute `total` whole slots across `weights` (percent, sum = 100)
 * by largest remainder. Deterministic: ties break toward lower index.
 */
export function distributeSlots(weights: number[], total: number): number[] {
  const exact = weights.map((w) => (w / 100) * total);
  const floors = exact.map((e) => Math.floor(e));
  let remaining = total - floors.reduce((a, b) => a + b, 0);
  const order = exact
    .map((e, i) => ({ i, frac: e - Math.floor(e) }))
    .sort((a, b) => (b.frac !== a.frac ? b.frac - a.frac : a.i - b.i))
    .map((x) => x.i);
  const result = [...floors];
  for (const i of order) {
    if (remaining <= 0) break;
    result[i] += 1;
    remaining -= 1;
  }
  return result;
}

function coerceWeeklySlots(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/**
 * Build the pillars plan. Throws on invalid input with a human-readable
 * message (runTool converts these to { ok: false, error }).
 */
export function planPillars(pillarsRaw: string, weeklySlotsRaw: unknown): PillarsPlan {
  if (typeof pillarsRaw !== "string" || pillarsRaw.trim().length === 0) {
    throw new Error("Please enter your content pillars (3-5, one per line or separated by commas).");
  }
  const pillars = parsePillars(pillarsRaw);
  if (pillars.length < MIN_PILLARS) {
    throw new Error(
      `Need at least ${MIN_PILLARS} pillars — you gave ${pillars.length}. Add more distinct pillars.`
    );
  }
  if (pillars.length > MAX_PILLARS) {
    throw new Error(
      `Too many pillars — you gave ${pillars.length}, the max is ${MAX_PILLARS}. Merge or drop the weakest ones.`
    );
  }

  const slots = coerceWeeklySlots(weeklySlotsRaw);
  if (slots === null) {
    throw new Error("Please enter how many posts you publish per week.");
  }
  if (!Number.isInteger(slots) || slots < MIN_WEEKLY_SLOTS || slots > MAX_WEEKLY_SLOTS) {
    throw new Error(
      `Weekly posts must be a whole number between ${MIN_WEEKLY_SLOTS} and ${MAX_WEEKLY_SLOTS}.`
    );
  }

  const weights = WEIGHT_PRESETS[pillars.length];
  const perWeek = distributeSlots(weights, slots);
  const allocation: PillarAllocation[] = pillars.map((pillar, i) => ({
    pillar,
    pct: weights[i],
    slotsPerWeek: perWeek[i],
  }));

  let balanceWarning: string;
  const starved = allocation.filter((a) => a.slotsPerWeek === 0);
  if (starved.length > 0) {
    balanceWarning =
      `Warning: ${starved.map((a) => `"${a.pillar}"`).join(", ")} get${
        starved.length === 1 ? "s" : ""
      } no weekly slot at ${slots} post${slots === 1 ? "" : "s"}/week. ` +
      "Consider fewer pillars or more weekly posts so every pillar appears weekly.";
  } else if (allocation[0].pct >= 50) {
    balanceWarning =
      `Heads-up: "${allocation[0].pillar}" takes ${allocation[0].pct}% of your week. ` +
      "That is fine for a primary pillar, but rebalance if the other pillars feel neglected.";
  } else {
    balanceWarning =
      "Balanced: every pillar gets at least one post per week at this schedule.";
  }

  return {
    pillars,
    weeklySlots: slots,
    allocation,
    balanceWarning,
    isTemplateBased: true,
  };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Platform entry point. values: { pillars: string, weeklySlots: number|string }.
 * Returns { allocation: string[], balanceWarning: string }.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  try {
    const plan = planPillars(values["pillars"] as string, values["weeklySlots"]);
    return {
      ok: true,
      values: {
        allocation: plan.allocation.map(
          (a) => `${a.pillar} — ${a.pct}% (${a.slotsPerWeek} post${a.slotsPerWeek === 1 ? "" : "s"}/week)`
        ),
        balanceWarning: plan.balanceWarning,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input." };
  }
}
