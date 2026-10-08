/**
 * Gear Budget Allocator (tool-136) — pure logic, zero imports.
 *
 * ENGINE: percentage allocator over 5 fixed categories
 * (camera / audio / lighting / editing / accessories).
 *
 * PROFILES (fixed, opinionated presets — not market data):
 *   starter: camera 30, audio 30, lighting 15, editing 15, accessories 10
 *   growth:  camera 35, audio 25, lighting 15, editing 15, accessories 10
 *   pro:     camera 40, audio 20, lighting 20, editing 10, accessories 10
 * Rationale for the starter split: at a small budget, audio gets the same
 * weight as camera because viewers tolerate mediocre video longer than bad
 * audio. This is a judgment call, documented here and in the honesty note.
 *
 * SHOPPING ORDER (fixed priority, documented): audio -> lighting ->
 * camera -> editing -> accessories. Upgrade the things that improve
 * perceived quality fastest first.
 *
 * MATH: whole-dollar allocations via largest-remainder rounding, so the
 * allocated amounts always sum to exactly the entered budget.
 *
 * HONESTY: arithmetic only. No product recommendations, no prices, no
 * brand names — categories only, so nothing is invented. Estimates are
 * labeled as guidance, never as purchase advice.
 */

export type ProfileId = "starter" | "growth" | "pro" | "custom";

export interface CategoryDef {
  id: string;
  label: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: "camera", label: "Camera" },
  { id: "audio", label: "Audio" },
  { id: "lighting", label: "Lighting" },
  { id: "editing", label: "Editing (software/storage)" },
  { id: "accessories", label: "Accessories" },
];

/** Fixed preset splits; each row sums to 100. */
export const PRESETS: Record<Exclude<ProfileId, "custom">, number[]> = {
  starter: [30, 30, 15, 15, 10],
  growth: [35, 25, 15, 15, 10],
  pro: [40, 20, 20, 10, 10],
};

/** Priority-ranked buy order with fixed 1-line reasons. */
export const SHOPPING_ORDER: { categoryId: string; reason: string }[] = [
  { categoryId: "audio", reason: "Viewers forgive shaky video before bad audio — a mic upgrade pays off first." },
  { categoryId: "lighting", reason: "Good light makes any camera look better, even a phone." },
  { categoryId: "camera", reason: "Upgrade once audio and light are solid." },
  { categoryId: "editing", reason: "Software and storage to handle the better footage you now shoot." },
  { categoryId: "accessories", reason: "Tripods, cables, batteries — fill the gaps last." },
];

export interface AllocatorResult {
  ok: true;
  values: {
    allocations: string[];
    shoppingOrder: string[];
    summary: string;
    honestyNote: string;
  };
}

export interface AllocatorError {
  ok: false;
  error: string;
}

function formatUSD(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

/**
 * Largest-remainder rounding to whole dollars.
 * Returns amounts that sum to exactly `budget`.
 */
export function allocateWholeDollars(budget: number, percents: number[]): number[] {
  const raw = percents.map((p) => (budget * p) / 100);
  const floored = raw.map((r) => Math.floor(r));
  let remainder = budget - floored.reduce((a, b) => a + b, 0);
  // Distribute leftover dollars to the largest fractional parts (stable).
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i)
    .map((o) => o.i);
  const amounts = [...floored];
  for (let k = 0; k < order.length && remainder > 0; k++) {
    amounts[order[k]] += 1;
    remainder -= 1;
  }
  return amounts;
}

export function runTool(values: Record<string, unknown>): AllocatorResult | AllocatorError {
  const budgetRaw = values["totalBudget"];
  const profileRaw = values["profile"];

  const budget = typeof budgetRaw === "string" ? Number(budgetRaw.trim()) : budgetRaw;
  if (typeof budget !== "number" || !Number.isFinite(budget) || budget <= 0) {
    return { ok: false, error: "Enter a budget greater than 0 (USD)." };
  }
  if (typeof profileRaw !== "string" || profileRaw.trim() === "") {
    return { ok: false, error: "Choose a profile: starter, growth, pro, or custom." };
  }
  const profile = profileRaw as ProfileId;
  if (profile !== "starter" && profile !== "growth" && profile !== "pro" && profile !== "custom") {
    return { ok: false, error: `Unknown profile "${profileRaw}".` };
  }

  let percents: number[];
  let profileLabel: string;
  if (profile === "custom") {
    const raw = values["customPercents"];
    if (typeof raw !== "string" || raw.trim() === "") {
      return { ok: false, error: "Enter 5 custom percentages (camera, audio, lighting, editing, accessories)." };
    }
    const parts = raw.split(/[,;\s]+/).filter((s) => s.length > 0);
    if (parts.length !== CATEGORIES.length) {
      return {
        ok: false,
        error: `Custom percentages need exactly ${CATEGORIES.length} numbers (camera, audio, lighting, editing, accessories) — got ${parts.length}.`,
      };
    }
    const nums = parts.map((p) => Number(p));
    if (nums.some((n) => !Number.isFinite(n) || n < 0)) {
      return { ok: false, error: "Custom percentages must be non-negative numbers." };
    }
    const sum = nums.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 100) > 0.01) {
      return { ok: false, error: `Custom percentages must add up to 100 — yours add up to ${Math.round(sum * 100) / 100}.` };
    }
    percents = nums;
    profileLabel = "custom";
  } else {
    percents = PRESETS[profile];
    profileLabel = profile;
  }

  const wholeBudget = Math.round(budget);
  const amounts = allocateWholeDollars(wholeBudget, percents);

  const allocations = CATEGORIES.map(
    (c, i) => `${c.label}: ${formatUSD(amounts[i])} (${Math.round(percents[i] * 100) / 100}%)`,
  );

  const amountById: Record<string, number> = {};
  CATEGORIES.forEach((c, i) => {
    amountById[c.id] = amounts[i];
  });
  const shoppingOrder = SHOPPING_ORDER.map(
    (s, rank) =>
      `${rank + 1}. ${CATEGORIES.find((c) => c.id === s.categoryId)!.label} — ${formatUSD(amountById[s.categoryId])}. ${s.reason}`,
  );

  const summary =
    `${formatUSD(wholeBudget)} split across 5 gear categories using the ${profileLabel} profile. ` +
    `Allocated amounts sum to exactly ${formatUSD(wholeBudget)}. ` +
    `Buy in the priority order shown — audio first, accessories last.`;

  return {
    ok: true,
    values: {
      allocations,
      shoppingOrder,
      summary,
      honestyNote:
        "Arithmetic only: percentages are applied to your budget with no product recommendations or prices — categories only, so nothing is invented. Preset splits are opinionated defaults; adjust with the custom profile.",
    },
  };
}
