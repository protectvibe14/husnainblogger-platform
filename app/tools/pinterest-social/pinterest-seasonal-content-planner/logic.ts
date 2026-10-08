/**
 * Pinterest Seasonal Content Planner — pure logic (tool-363). Zero imports,
 * zero network, zero DOM.
 *
 * WHAT THIS IS: a static in-repo seasonal-events dataset (24 events,
 * listed below) combined with niche-angle templates. Angles are rendered
 * by filling the templates with the user's niche — no AI, no trend data,
 * no market data.
 *
 * DATASET: SEASONAL_EVENTS — 24 US-seasonal events, each with the months
 * it belongs to, a recommended planning lead time in weeks, a content
 * angle template (placeholder {niche}), and keyword-seed templates.
 * Last reviewed: 2026-09-30. Per spec, the dataset is reviewed quarterly.
 *
 * Lead-time honesty: events needing 4+ weeks of lead time are flagged in
 * the planning note (Pinterest users plan ahead — documented creator
 * guidance, not a platform signal).
 *
 * Evergreen niches (e.g. B2B SaaS, consulting) get curated evergreen
 * angles with an honest note that seasonal hooks are weak for them.
 *
 * Inputs: niche (string, required), month (number 1-12, optional),
 *         quarter (enum Q1-Q4, optional). At least one of month/quarter
 *         is required; when both are given, their months are combined.
 * Deterministic: same inputs -> same outputs.
 */

export interface SeasonalEvent {
  name: string;
  /** Months (1-12) this event is planned for. */
  months: number[];
  /** Recommended planning lead time in weeks. */
  leadTimeWeeks: number;
  /** Content angle template. Placeholder: {niche}. */
  angleTemplate: string;
  /** Keyword-seed templates. Placeholder: {niche}. */
  keywordSeeds: string[];
}

/**
 * The in-repo seasonal dataset.
 * SIZE: 24 events. REVIEWED: 2026-09-30 (quarterly review per spec).
 */
export const SEASONAL_EVENTS: SeasonalEvent[] = [
  { name: "New Year's Resolutions", months: [12, 1], leadTimeWeeks: 6,
    angleTemplate: "{niche} fresh-start guide: goals and habits for the new year",
    keywordSeeds: ["new year {niche} goals", "january {niche} reset", "{niche} new year planner"] },
  { name: "Valentine's Day", months: [1, 2], leadTimeWeeks: 8,
    angleTemplate: "{niche} Valentine's gift ideas and date-night inspiration",
    keywordSeeds: ["valentine's day {niche} gifts", "{niche} date night ideas", "valentine {niche} diy"] },
  { name: "Super Bowl", months: [1, 2], leadTimeWeeks: 6,
    angleTemplate: "{niche} game-day hosting guide: food, decor, and setup",
    keywordSeeds: ["super bowl {niche} party", "game day {niche} ideas", "{niche} party snacks"] },
  { name: "Spring Cleaning & Home Refresh", months: [2, 3], leadTimeWeeks: 6,
    angleTemplate: "{niche} spring refresh checklist: declutter and reset your space",
    keywordSeeds: ["spring cleaning {niche} checklist", "{niche} home refresh", "spring {niche} organization"] },
  { name: "St. Patrick's Day", months: [2, 3], leadTimeWeeks: 6,
    angleTemplate: "{niche} St. Patrick's Day ideas: green-themed inspiration",
    keywordSeeds: ["st patrick's day {niche}", "green {niche} ideas", "{niche} march ideas"] },
  { name: "Spring Break", months: [2, 3], leadTimeWeeks: 6,
    angleTemplate: "{niche} spring break guide: packing, plans, and budget tips",
    keywordSeeds: ["spring break {niche} packing", "{niche} spring break ideas", "spring break {niche} on a budget"] },
  { name: "Garden & Planting Season", months: [3, 4], leadTimeWeeks: 6,
    angleTemplate: "{niche} spring planting guide for beginners",
    keywordSeeds: ["spring {niche} garden", "{niche} planting guide", "beginner {niche} gardening"] },
  { name: "Easter", months: [3, 4], leadTimeWeeks: 6,
    angleTemplate: "{niche} Easter ideas: decor, brunch, and hosting",
    keywordSeeds: ["easter {niche} decor", "{niche} easter brunch", "easter {niche} diy"] },
  { name: "Mother's Day", months: [4, 5], leadTimeWeeks: 8,
    angleTemplate: "{niche} Mother's Day gift guide: thoughtful ideas at every budget",
    keywordSeeds: ["mother's day {niche} gifts", "{niche} gifts for mom", "diy mother's day {niche}"] },
  { name: "Graduation", months: [4, 5], leadTimeWeeks: 6,
    angleTemplate: "{niche} graduation celebration guide: parties and gifts",
    keywordSeeds: ["graduation {niche} party", "{niche} graduation gifts", "grad {niche} ideas"] },
  { name: "Wedding Season", months: [5, 6], leadTimeWeeks: 8,
    angleTemplate: "{niche} wedding guide: planning ideas and inspiration boards",
    keywordSeeds: ["wedding {niche} ideas", "{niche} wedding planning", "summer wedding {niche}"] },
  { name: "Father's Day", months: [5, 6], leadTimeWeeks: 8,
    angleTemplate: "{niche} Father's Day gift guide for every kind of dad",
    keywordSeeds: ["father's day {niche} gifts", "{niche} gifts for dad", "diy father's day {niche}"] },
  { name: "Summer Travel", months: [5, 6, 7], leadTimeWeeks: 8,
    angleTemplate: "{niche} summer travel guide: itineraries and packing lists",
    keywordSeeds: ["summer {niche} travel", "{niche} vacation packing", "{niche} travel itinerary"] },
  { name: "Summer BBQ & Outdoor Living", months: [6, 7], leadTimeWeeks: 6,
    angleTemplate: "{niche} summer hosting guide: BBQ menus and outdoor setups",
    keywordSeeds: ["summer {niche} bbq", "{niche} outdoor living", "backyard {niche} ideas"] },
  { name: "4th of July", months: [6, 7], leadTimeWeeks: 6,
    angleTemplate: "{niche} 4th of July ideas: red-white-and-blue inspiration",
    keywordSeeds: ["4th of july {niche}", "{niche} july 4th party", "patriotic {niche} diy"] },
  { name: "Back to School", months: [7, 8], leadTimeWeeks: 8,
    angleTemplate: "{niche} back-to-school guide: supplies, routines, and organization",
    keywordSeeds: ["back to school {niche}", "{niche} school supplies", "{niche} study organization"] },
  { name: "Labor Day / End of Summer", months: [8], leadTimeWeeks: 4,
    angleTemplate: "{niche} end-of-summer checklist: close out the season right",
    keywordSeeds: ["labor day {niche}", "end of summer {niche}", "{niche} summer bucket list"] },
  { name: "Fall Decor & Home", months: [8, 9], leadTimeWeeks: 6,
    angleTemplate: "{niche} fall home refresh: cozy decor on any budget",
    keywordSeeds: ["fall {niche} decor", "cozy {niche} home", "{niche} autumn ideas"] },
  { name: "Fall Fashion / Capsule Wardrobe", months: [8, 9], leadTimeWeeks: 6,
    angleTemplate: "{niche} fall wardrobe guide: capsule pieces and layering",
    keywordSeeds: ["fall {niche} fashion", "{niche} capsule wardrobe", "autumn {niche} outfits"] },
  { name: "Halloween", months: [9, 10], leadTimeWeeks: 8,
    angleTemplate: "{niche} Halloween guide: costumes, decor, and party ideas",
    keywordSeeds: ["halloween {niche} costumes", "{niche} halloween decor", "halloween {niche} party"] },
  { name: "Thanksgiving", months: [10, 11], leadTimeWeeks: 8,
    angleTemplate: "{niche} Thanksgiving hosting guide: menus, tablescapes, and timelines",
    keywordSeeds: ["thanksgiving {niche} menu", "{niche} thanksgiving table", "hosting thanksgiving {niche}"] },
  { name: "Black Friday / Cyber Monday", months: [10, 11], leadTimeWeeks: 6,
    angleTemplate: "{niche} holiday deal guide: what to buy and what to skip",
    keywordSeeds: ["black friday {niche} deals", "{niche} gift deals", "cyber monday {niche}"] },
  { name: "Christmas / Holiday Season", months: [10, 11, 12], leadTimeWeeks: 10,
    angleTemplate: "{niche} Christmas guide: gift ideas, decor, and holiday hosting",
    keywordSeeds: ["christmas {niche} gifts", "{niche} holiday decor", "{niche} christmas ideas"] },
  { name: "Winter Cozy / Hygge", months: [12, 1], leadTimeWeeks: 6,
    angleTemplate: "{niche} cozy winter guide: warmth, comfort, and slow living",
    keywordSeeds: ["cozy winter {niche}", "{niche} hygge ideas", "winter {niche} comfort"] },
];

export const DATASET_SIZE = 24;
export const DATASET_REVIEWED = "2026-09-30";

/** Lead times at or above this are flagged (Pinterest planning behavior). */
export const LEAD_TIME_FLAG_WEEKS = 4;

/** Substrings marking niches with weak seasonal hooks (edge case from spec). */
export const EVERGREEN_NICHE_HINTS: string[] = [
  "b2b", "saas", "software", "consulting", "accounting", "legal",
  "insurance", "recruiting", "hr", "payroll", "cybersecurity",
];

export const EVERGREEN_ANGLES: string[] = [
  "{niche} beginner's guide: everything you need to know to start",
  "{niche} mistakes to avoid (and what to do instead)",
  "{niche} tools and resources worth bookmarking",
  "{niche} case study: how it works step by step",
  "{niche} FAQ: the questions everyone asks, answered",
  "{niche} checklist: a reusable workflow you can follow every time",
];

export const QUARTER_MONTHS: Record<string, number[]> = {
  Q1: [1, 2, 3],
  Q2: [4, 5, 6],
  Q3: [7, 8, 9],
  Q4: [10, 11, 12],
};

export const MONTH_NAMES: string[] = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function fill(template: string, niche: string): string {
  return template.split("{niche}").join(niche);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export function isEvergreenNiche(niche: string): boolean {
  const n = niche.toLowerCase();
  return EVERGREEN_NICHE_HINTS.some((hint) => n.includes(hint));
}

export interface SeasonalPlannerValues {
  ok: boolean;
  values?: {
    seasonalAngles: { columns: string[]; rows: string[][] };
    planningNote: string;
    eventCount: number;
    periodUsed: string;
  };
  error?: string;
}

export function runTool(values: Record<string, unknown>): SeasonalPlannerValues {
  const nicheRaw = values["niche"];
  if (!isNonEmptyString(nicheRaw)) {
    return { ok: false, error: "Please enter your niche (e.g. home decor, keto recipes)." };
  }
  const niche = nicheRaw.trim();

  const monthRaw = values["month"];
  const quarterRaw = values["quarter"];
  const months: number[] = [];

  if (typeof monthRaw === "number" && !Number.isNaN(monthRaw)) {
    if (!Number.isInteger(monthRaw) || monthRaw < 1 || monthRaw > 12) {
      return { ok: false, error: "Month must be a whole number from 1 to 12." };
    }
    months.push(monthRaw);
  } else if (monthRaw !== undefined && monthRaw !== null && monthRaw !== "") {
    return { ok: false, error: "Month must be a whole number from 1 to 12." };
  }

  let quarterLabel = "";
  if (typeof quarterRaw === "string" && quarterRaw.trim().length > 0) {
    const q = quarterRaw.trim().toUpperCase();
    if (!(q in QUARTER_MONTHS)) {
      return { ok: false, error: "Quarter must be Q1, Q2, Q3, or Q4." };
    }
    quarterLabel = q;
    for (const m of QUARTER_MONTHS[q]) {
      if (!months.includes(m)) months.push(m);
    }
  }

  if (months.length === 0) {
    return { ok: false, error: "Please pick a month (1-12) or a quarter (Q1-Q4) — at least one is required." };
  }
  months.sort((a, b) => a - b);

  const periodUsed =
    months.map((m) => MONTH_NAMES[m]).join(", ") + (quarterLabel ? ` (${quarterLabel})` : "");

  // Evergreen-niche edge case: seasonal hooks are weak; return evergreen
  // angles with an honest note.
  if (isEvergreenNiche(niche)) {
    const rows = EVERGREEN_ANGLES.map((t) => [
      "Evergreen",
      "Ongoing",
      fill(t, niche),
      `${niche} tips, ${niche} guide, ${niche} for beginners`,
    ]);
    return {
      ok: true,
      values: {
        seasonalAngles: { columns: ["Event", "Lead time", "Content angle", "Keyword seeds"], rows },
        planningNote:
          `'${niche}' looks like an evergreen niche with weak seasonal hooks, so these are ` +
          `timeless angles rather than seasonal ones. Seasonal events for ${periodUsed} are still ` +
          `listed in the dataset, but forcing a seasonal tie-in usually reads as inauthentic.`,
        eventCount: rows.length,
        periodUsed,
      },
    };
  }

  const matched = SEASONAL_EVENTS.filter((e) => e.months.some((m) => months.includes(m)));
  const rows = matched.map((e) => [
    e.name,
    `${e.leadTimeWeeks} weeks`,
    fill(e.angleTemplate, niche),
    e.keywordSeeds.map((s) => fill(s, niche)).join(", "),
  ]);

  const longLead = matched.filter((e) => e.leadTimeWeeks >= LEAD_TIME_FLAG_WEEKS);
  const flagged =
    longLead.length > 0
      ? ` Start planning now for the ${longLead.length} event(s) needing ${LEAD_TIME_FLAG_WEEKS}+ weeks of lead time: ` +
        longLead.map((e) => e.name).join(", ") +
        "."
      : "";

  return {
    ok: true,
    values: {
      seasonalAngles: { columns: ["Event", "Lead time", "Content angle", "Keyword seeds"], rows },
      planningNote:
        `Found ${matched.length} seasonal event(s) for ${periodUsed} in the in-repo dataset ` +
        `(${DATASET_SIZE} events, reviewed ${DATASET_REVIEWED}).` +
        flagged +
        " Angles are templates filled with your niche — no trend or market data is used.",
      eventCount: matched.length,
      periodUsed,
    },
  };
}
