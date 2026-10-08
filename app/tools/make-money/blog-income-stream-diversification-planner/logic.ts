/**
 * Blog Income Stream Diversification Planner — pure logic (tool-505).
 *
 * FIXED BANKS (documented sizes):
 * - STREAM_CATALOG: 8 entries — 7 income streams + 1 "just starting" sentinel
 *   (the sentinel is never recommended; it only marks an empty current set).
 * - COMPLEMENT_RULES: 8 entries — one fixed "what pairs well with it" list
 *   per catalog entry, each naming 2-4 candidate streams in priority order.
 *
 * ENGINE RULES (deterministic, fixed):
 *  1. currentStreams is normalized to a deduped string[] (a single string is
 *     accepted too); every value must be a known catalog label.
 *  2. Candidates = catalog streams not already in the current set.
 *  3. Each candidate gets one vote per complement rule that recommends it
 *     for one of the user's current streams.
 *  4. Candidates rank by (votes desc, catalog order asc); top 4 become the
 *     plan rows with fixed timing labels by rank.
 *  5. "Income potential" is a QUALITATIVE, effort-based band — never dollar
 *     figures, never invented platform payout data.
 *  6. If monthlyRevenue is provided, the strategy note shows a 10-30%
 *     diversification target band computed from the user's own number and
 *     explicitly labeled an estimate built from their assumption.
 *
 * HONESTY: revenue figures are user-provided or labeled estimates. The tool
 * invents no platform payout data (no RPMs, no commissions, no CPMs), runs no
 * analysis of the user's actual blog, and never claims AI.
 *
 * DETERMINISM: same inputs -> identical outputs (no randomness, no clock).
 * ZERO IMPORTS: no node:, no DOM, no network, no Math.random.
 */

export interface StreamDef {
  id: string;
  label: string;
  effort: "Low" | "Medium" | "High";
  incomePotential: string;
  whyFits: string;
}

export const STREAM_CATALOG: StreamDef[] = [
  {
    id: "display-ads",
    label: "Display ads",
    effort: "Low",
    incomePotential: "Modest at first; scales with pageviews",
    whyFits:
      "Adds passive income that grows with the traffic your blog already earns.",
  },
  {
    id: "affiliate-marketing",
    label: "Affiliate marketing",
    effort: "Low",
    incomePotential: "Grows with buyer-intent content",
    whyFits:
      "Monetizes the buying intent already inside your reviews and tutorials.",
  },
  {
    id: "sponsored-posts",
    label: "Sponsored posts",
    effort: "Medium",
    incomePotential: "Per-deal payouts; varies by niche",
    whyFits:
      "Turns your existing audience trust into paid brand partnerships.",
  },
  {
    id: "digital-products",
    label: "Digital products",
    effort: "High",
    incomePotential: "Higher margin; built once, sold repeatedly",
    whyFits:
      "Packages your expertise into something you sell on repeat with no inventory.",
  },
  {
    id: "memberships",
    label: "Memberships / subscriptions",
    effort: "High",
    incomePotential: "Recurring; compounds as members join",
    whyFits:
      "Converts your most loyal readers into predictable recurring revenue.",
  },
  {
    id: "services",
    label: "Services / freelancing",
    effort: "Medium",
    incomePotential: "High ticket; trades time for money",
    whyFits:
      "Turns the expertise you demonstrate on the blog into high-ticket client work.",
  },
  {
    id: "newsletter-sponsorships",
    label: "Newsletter sponsorships",
    effort: "Medium",
    incomePotential: "Scales with subscriber count",
    whyFits:
      "Monetizes your email list separately from your on-site traffic.",
  },
  {
    id: "just-starting",
    label: "Just starting (no streams yet)",
    effort: "Low",
    incomePotential: "",
    whyFits: "",
  },
];

/**
 * COMPLEMENT_RULES: for each current stream id, the ordered list of stream
 * ids recommended as its best-fit additions. 8 entries, 2-4 ids each.
 */
export const COMPLEMENT_RULES: Record<string, string[]> = {
  "display-ads": ["affiliate-marketing", "digital-products"],
  "affiliate-marketing": ["digital-products", "display-ads"],
  "sponsored-posts": ["newsletter-sponsorships", "services"],
  "digital-products": ["memberships", "affiliate-marketing"],
  memberships: ["digital-products", "newsletter-sponsorships"],
  services: ["digital-products", "sponsored-posts"],
  "newsletter-sponsorships": ["memberships", "sponsored-posts"],
  "just-starting": [
    "display-ads",
    "affiliate-marketing",
    "digital-products",
    "sponsored-posts",
  ],
};

export const PLAN_ROWS = 4;
export const TIMING_BY_RANK = [
  "Start this month",
  "Next 1-3 months",
  "Within 6 months",
  "Later this year",
] as const;

const byId = new Map<string, StreamDef>(STREAM_CATALOG.map((s) => [s.id, s]));
const byLabel = new Map<string, StreamDef>(
  STREAM_CATALOG.map((s) => [s.label, s]),
);

function isPlainRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

function fmtMoney(v: number): string {
  return `$${round2(v).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export interface PlanTable {
  columns: string[];
  rows: string[][];
}

export function normalizeStreams(raw: unknown): { ok: true; ids: string[] } | { ok: false; error: string } {
  const list: unknown[] =
    typeof raw === "string" ? [raw] : Array.isArray(raw) ? raw : [];
  if (list.length === 0) {
    return {
      ok: false,
      error:
        "Select at least one current income stream (choose “Just starting” if your blog has no revenue streams yet).",
    };
  }
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const item of list) {
    if (typeof item !== "string" || item.trim() === "") {
      return fail("Each selected stream must be a non-empty choice from the list.");
    }
    const def = byLabel.get(item.trim()) ?? byId.get(item.trim());
    if (!def) {
      return fail(`“${item.trim()}” is not a recognized income stream. Choose from the list.`);
    }
    if (!seen.has(def.id)) {
      seen.add(def.id);
      ids.push(def.id);
    }
  }
  if (ids.includes("just-starting") && ids.length > 1) {
    return fail(
      "“Just starting” means you have no streams yet — select it alone, or select your actual streams instead.",
    );
  }
  return { ok: true, ids };
}

function concentrationNote(count: number, labels: string[]): string {
  if (count === 0) {
    return "You are starting from zero income streams, so every addition is pure diversification.";
  }
  if (count === 1) {
    return `Your blog is highly concentrated: ${labels[0]} is your only named stream, so one traffic or policy change affects all of your income.`;
  }
  if (count === 2) {
    return `Your blog is moderately concentrated across ${labels.join(" and ")}.`;
  }
  return `Your blog is already diversified across ${labels.join(", ")} — the plan below focuses on deepening the mix.`;
}

/**
 * runTool({ currentStreams, monthlyRevenue? })
 *
 * currentStreams: string | string[] — one or more catalog labels (or ids),
 *   required, at least one.
 * monthlyRevenue: number, optional — current monthly revenue in USD;
 *   non-negative finite number.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!isPlainRecord(values)) {
    return fail("Input must be an object with your values.");
  }

  const normalized = normalizeStreams(values.currentStreams);
  if (!normalized.ok) {
    return fail(normalized.error);
  }
  const ids = normalized.ids;
  const hasRealStreams = !ids.includes("just-starting");

  let monthlyRevenue: number | null = null;
  const rawRevenue = values.monthlyRevenue;
  if (rawRevenue !== undefined && rawRevenue !== null && rawRevenue !== "") {
    if (
      typeof rawRevenue !== "number" ||
      Number.isNaN(rawRevenue) ||
      !Number.isFinite(rawRevenue)
    ) {
      return fail("Monthly revenue must be a finite number.");
    }
    if (rawRevenue < 0) {
      return fail("Monthly revenue cannot be negative.");
    }
    monthlyRevenue = rawRevenue;
  }

  // Score candidates: one vote per complement rule that recommends them.
  const votes = new Map<string, number>();
  for (const id of ids) {
    for (const rec of COMPLEMENT_RULES[id] ?? []) {
      votes.set(rec, (votes.get(rec) ?? 0) + 1);
    }
  }
  const current = new Set(ids);
  const candidates = STREAM_CATALOG.filter(
    (s) => s.id !== "just-starting" && !current.has(s.id),
  )
    .map((s, order) => ({ def: s, order, vote: votes.get(s.id) ?? 0 }))
    .sort((a, b) => b.vote - a.vote || a.order - b.order)
    .slice(0, PLAN_ROWS);

  const rows = candidates.map((c, i) => [
    c.def.label,
    c.def.whyFits,
    c.def.effort,
    `${c.def.incomePotential} (estimate)`,
    TIMING_BY_RANK[i] ?? "Later this year",
  ]);

  const labels = ids.map((id) => (byId.get(id) as StreamDef).label);
  let strategyNote = concentrationNote(hasRealStreams ? ids.length : 0, labels);
  if (rows.length > 0) {
    strategyNote += ` Add streams top-down: start with “${rows[0][0]}” this month before stacking the next one.`;
  } else {
    strategyNote +=
      " Every stream in the catalog is already in your mix — focus on growing what you have rather than adding new ones.";
  }
  if (monthlyRevenue !== null && monthlyRevenue > 0) {
    const low = fmtMoney(monthlyRevenue * 0.1);
    const high = fmtMoney(monthlyRevenue * 0.3);
    strategyNote += ` As an estimate built from your own ${fmtMoney(monthlyRevenue)}/month figure (not a prediction), a realistic diversification goal is ${low}–${high}/month — 10–30% of current revenue — coming from new streams over time.`;
  }

  return {
    ok: true,
    values: {
      diversificationPlan: {
        columns: [
          "Recommended stream",
          "Why it fits your blog",
          "Effort",
          "Income potential",
          "When to add",
        ],
        rows,
      } as PlanTable,
      strategyNote,
    },
  };
}
