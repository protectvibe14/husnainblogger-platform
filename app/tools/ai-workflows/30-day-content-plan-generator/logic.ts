/**
 * 30-Day Content Plan Generator (tool-305) — pure logic, zero imports.
 *
 * FIXED WORD BANK + FIXED ROTATION RULE, NOT AI IDEATION: topics come from
 * a fixed per-niche word bank (documented below) and are assigned to posting
 * days by a deterministic rotation. The UI must never claim creative or
 * AI generation.
 *
 * Word banks (sizes documented for honest UI copy):
 *   8 niche banks x 12 topics = 96 topics (food, fitness, travel, finance,
 *   beauty, parenting, tech, business) + 1 generic bank x 12 topics = 108.
 *   FORMATS: 6 fixed post formats. CTAS: 6 fixed call-to-action slots.
 *
 * Rotation rule (deterministic):
 *   - Posting days: postsPerWeek days spread evenly across Mon-Sun as
 *     round(i * 7 / postsPerWeek) for i in 0..postsPerWeek-1.
 *   - Day 1 is a Monday. For each of the 30 days whose weekday is a posting
 *     day, the k-th post (0-based) takes topic bank[k % 12],
 *     FORMATS[k % 6], CTAS[k % 6].
 *
 * Niche matching: the niche string is lowercased and stripped of
 * non-letters, then matched against bank keys plus a small alias map.
 * A niche with no word bank falls back to the generic bank, and the
 * `topicBank` output says so explicitly.
 */

export const TOPIC_BANKS: Record<string, string[]> = {
  food: [
    "5-ingredient weeknight dinners",
    "Meal prep for beginners",
    "One-pan chicken recipes",
    "Budget grocery haul guide",
    "Homemade bread basics",
    "15-minute lunch ideas",
    "Seasonal produce guide",
    "Pantry staples checklist",
    "Easy freezer meals",
    "Homemade sauces and dressings",
    "Baking substitutions chart",
    "Reader-favorite recipe roundup",
  ],
  fitness: [
    "Beginner bodyweight routine",
    "Home workout with no equipment",
    "How to start running",
    "Stretching routine for desk workers",
    "Strength training basics",
    "Rest day recovery tips",
    "Protein on a budget",
    "Form check: squats",
    "30-day walking challenge plan",
    "Core workout in 10 minutes",
    "How to stay consistent",
    "Workout myths debunked",
  ],
  travel: [
    "Carry-on-only packing checklist",
    "Budget travel hacks",
    "Weekend getaway planning guide",
    "How to find cheap flights",
    "Solo travel safety tips",
    "Travel insurance explained simply",
    "Hidden gems in popular cities",
    "Road trip packing list",
    "Travel photography basics",
    "Eating like a local abroad",
    "Visa and documents checklist",
    "Off-season travel benefits",
  ],
  finance: [
    "Beginner budgeting method",
    "How to build an emergency fund",
    "Paying off debt: snowball vs avalanche",
    "Simple investing basics",
    "Side hustle ideas for beginners",
    "Saving money on groceries",
    "Credit score explained",
    "Retirement accounts 101",
    "Money mistakes to avoid",
    "50/30/20 budget walkthrough",
    "How to negotiate your bills",
    "Financial goals planner",
  ],
  beauty: [
    "Beginner skincare routine",
    "Drugstore makeup dupes",
    "How to find your foundation shade",
    "5-minute everyday makeup",
    "Hair care basics by hair type",
    "Sunscreen myths debunked",
    "Skincare ingredients glossary",
    "Makeup brush guide",
    "Overnight beauty treatments",
    "Budget beauty haul",
    "How to do a facial at home",
    "Seasonal skincare swaps",
  ],
  parenting: [
    "Bedtime routine that actually works",
    "Toddler meal ideas",
    "Screen time rules that stick",
    "How to handle tantrums calmly",
    "Back-to-school checklist",
    "Indoor activities for rainy days",
    "Teaching kids about money",
    "Baby sleep basics",
    "Lunchbox ideas for picky eaters",
    "Family budget tips",
    "How to babyproof a home",
    "Parenting books worth reading",
  ],
  tech: [
    "Beginner coding roadmap",
    "Best free software tools",
    "How to speed up a slow laptop",
    "Password security basics",
    "Smartphone photography tips",
    "Cloud storage explained",
    "AI tools for everyday productivity",
    "How to back up your data",
    "Beginner guide to VPNs",
    "Tech gift guide",
    "Common online scams to avoid",
    "Setting up a home office",
  ],
  business: [
    "How to validate a business idea",
    "Writing a one-page business plan",
    "Pricing your services",
    "Finding your first customers",
    "Email marketing basics",
    "Social media for small business",
    "Bookkeeping basics",
    "How to write a client proposal",
    "Networking for introverts",
    "Time management for founders",
    "Branding on a budget",
    "Common startup mistakes",
  ],
};

export const GENERIC_BANK: string[] = [
  "How-to guide for beginners",
  "Top 10 list roundup",
  "Common myths debunked",
  "Tools and resources list",
  "Behind-the-scenes post",
  "Reader questions answered",
  "Mistakes to avoid",
  "Quick tips roundup",
  "Case study breakdown",
  "Beginner's glossary",
  "Checklist download post",
  "Lessons learned recap",
];

export const FORMATS = [
  "How-to post",
  "Listicle",
  "Short video / reel",
  "Carousel / infographic",
  "Tips post",
  "Story / poll",
] as const;

export const CTAS = [
  "Comment your take",
  "Save this post",
  "Share with a friend",
  "Join the newsletter",
  "Link in bio",
  "Follow for part 2",
] as const;

export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const PLAN_DAYS = 30;
export const MIN_POSTS_PER_WEEK = 1;
export const MAX_POSTS_PER_WEEK = 7;
export const MAX_PLATFORMS = 6;
export const MAX_PLATFORM_CHARS = 40;

const NICHE_ALIASES: Record<string, string> = {
  money: "finance",
  health: "fitness",
  wellness: "fitness",
  recipes: "food",
  cooking: "food",
  wanderlust: "travel",
  makeup: "beauty",
  skincare: "beauty",
  kids: "parenting",
  mom: "parenting",
  startup: "business",
  marketing: "business",
  gadgets: "tech",
  software: "tech",
};

export interface PlanTable {
  columns: string[];
  rows: string[][];
}

export interface RunResult {
  ok: boolean;
  values?: { plan: PlanTable; topicBank: string };
  error?: string;
}

/** Match a free-text niche to a bank key; null when no bank exists. */
export function matchNiche(niche: string): string | null {
  const key = niche.toLowerCase().replace(/[^a-z]/g, "");
  if (key in TOPIC_BANKS) return key;
  if (key in NICHE_ALIASES) return NICHE_ALIASES[key];
  return null;
}

/** Posting weekdays (0=Mon..6=Sun) spread evenly for n posts/week. */
export function postingWeekdays(postsPerWeek: number): number[] {
  const days: number[] = [];
  for (let i = 0; i < postsPerWeek; i++) {
    days.push(Math.round((i * 7) / postsPerWeek) % 7);
  }
  return [...new Set(days)].sort((a, b) => a - b);
}

/** Parse a comma-separated platform list; dedupe case-insensitively. */
export function parsePlatforms(value: unknown): string[] {
  if (typeof value !== "string") return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of value.split(",")) {
    const p = raw.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
    if (p === "" || seen.has(p.toLowerCase())) continue;
    seen.add(p.toLowerCase());
    out.push(p.slice(0, MAX_PLATFORM_CHARS));
    if (out.length >= MAX_PLATFORMS) break;
  }
  return out;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const nicheRaw = typeof values?.niche === "string" ? values.niche.trim() : "";
  if (nicheRaw === "") return { ok: false, error: "Niche is required." };

  const platforms = parsePlatforms(values?.platforms);
  if (platforms.length === 0)
    return { ok: false, error: "Enter at least one platform (comma-separated)." };

  const ppwRaw = values?.postsPerWeek;
  const ppw =
    typeof ppwRaw === "number"
      ? ppwRaw
      : typeof ppwRaw === "string" && ppwRaw.trim() !== ""
        ? Number(ppwRaw.trim())
        : NaN;
  if (!Number.isInteger(ppw) || ppw < MIN_POSTS_PER_WEEK || ppw > MAX_POSTS_PER_WEEK)
    return {
      ok: false,
      error: `Posts per week must be a whole number between ${MIN_POSTS_PER_WEEK} and ${MAX_POSTS_PER_WEEK}.`,
    };

  const bankKey = matchNiche(nicheRaw);
  const bank = bankKey !== null ? TOPIC_BANKS[bankKey] : GENERIC_BANK;
  const topicBank =
    bankKey !== null
      ? `${bankKey} (${bank.length} topics)`
      : `generic (${GENERIC_BANK.length} topics) — fallback: no word bank for "${nicheRaw}"`;

  const days = postingWeekdays(ppw);
  const rows: string[][] = [];
  let k = 0;
  for (let d = 1; d <= PLAN_DAYS; d++) {
    const weekday = (d - 1) % 7;
    if (!days.includes(weekday)) continue;
    rows.push([
      `Day ${d}`,
      WEEKDAYS[weekday],
      bank[k % bank.length],
      FORMATS[k % FORMATS.length],
      CTAS[k % CTAS.length],
    ]);
    k++;
  }

  return {
    ok: true,
    values: {
      plan: {
        columns: ["Day", "Weekday", "Topic", "Format", "CTA"],
        rows,
      },
      topicBank,
    },
  };
}
