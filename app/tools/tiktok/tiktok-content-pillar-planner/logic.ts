/**
 * TikTok Content Pillar Planner (tool-162) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * Static strategy templates (per spec honestyNote). The planner holds
 * 4 fixed pillar sets — one per business goal (grow-audience | get-leads |
 * sell-products | build-authority) — each with 4 pillars. Every pillar has
 * a name, purpose, 2 formats (from a fixed 10-format bank), a weekly
 * posting frequency, and 3 example topics with a {niche} placeholder.
 *
 * Fixed content banks (sizes documented per the builder contract):
 * - PILLAR_SETS: 4 goals x 4 pillars = 16 pillars; 3 topic templates each
 *   = 48 topic templates total.
 * - FORMAT_BANK: 10 fixed TikTok formats (pillars reference 2 each).
 *
 * Deterministic: pillar choice depends only on businessGoal; the weekly
 * schedule spreads each pillar's posts across Mon–Sun by fixed rotation.
 * Same inputs always produce identical outputs.
 */

export const GOALS = ["grow-audience", "get-leads", "sell-products", "build-authority"] as const;
export type BusinessGoal = (typeof GOALS)[number];

export const GOAL_LABELS: Record<BusinessGoal, string> = {
  "grow-audience": "grow audience",
  "get-leads": "get leads",
  "sell-products": "sell products",
  "build-authority": "build authority",
};

export const MAX_NICHE_LEN = 80;

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

interface Pillar {
  name: string;
  purpose: string;
  formats: string[];
  postsPerWeek: number;
  topics: string[];
}

/** Fixed format bank — 10 formats; each pillar references 2. */
const FORMAT_BANK = [
  "talking-head tutorial",
  "on-screen text tips",
  "POV skit",
  "duet / stitch",
  "before / after reveal",
  "trending sound adaptation",
  "comment reply video",
  "green-screen commentary",
  "day-in-the-life vlog",
  "listicle countdown",
];

/** 16 pillars: 4 goals x 4 pillars. {niche} is filled at run time. */
const PILLAR_SETS: Record<BusinessGoal, Pillar[]> = {
  "grow-audience": [
    {
      name: "Educational Quick Wins",
      purpose: "Teach one useful {niche} thing per video — saves and shares compound into reach.",
      formats: [FORMAT_BANK[0], FORMAT_BANK[1]],
      postsPerWeek: 3,
      topics: [
        "3 {niche} mistakes beginners make",
        "The 60-second {niche} shortcut nobody talks about",
        "{niche} explained in plain English",
      ],
    },
    {
      name: "Relatable Entertainment",
      purpose: "Skits and POVs about {niche} life — entertainment earns follows, education earns saves.",
      formats: [FORMAT_BANK[2], FORMAT_BANK[9]],
      postsPerWeek: 2,
      topics: [
        "POV: your first week doing {niche}",
        "{niche} expectations vs. reality",
        "Things only {niche} people understand",
      ],
    },
    {
      name: "Trend Riding",
      purpose: "Adapt this week's sounds and formats to {niche} — borrowed attention, niche payoff.",
      formats: [FORMAT_BANK[5], FORMAT_BANK[3]],
      postsPerWeek: 2,
      topics: [
        "This week's trending sound, {niche} edition",
        "{niche} POV on the viral meme",
        "Stitching the biggest {niche} video this week",
      ],
    },
    {
      name: "Community & Proof",
      purpose: "Answer comments and show {niche} results — turns viewers into a community.",
      formats: [FORMAT_BANK[6], FORMAT_BANK[4]],
      postsPerWeek: 1,
      topics: [
        "Answering your top {niche} question",
        "Stitching a {niche} myth",
        "My {niche} results this month",
      ],
    },
  ],
  "get-leads": [
    {
      name: "Problem Spotlights",
      purpose: "Name the expensive {niche} problems your offer solves — pain creates demand.",
      formats: [FORMAT_BANK[0], FORMAT_BANK[7]],
      postsPerWeek: 3,
      topics: [
        "The {niche} problem quietly costing you money",
        "Why most people fail at {niche} (and the fix)",
        "3 signs you need help with {niche}",
      ],
    },
    {
      name: "Mini Transformations",
      purpose: "Show small {niche} wins on camera — proof that your method works.",
      formats: [FORMAT_BANK[4], FORMAT_BANK[8]],
      postsPerWeek: 2,
      topics: [
        "Before/after: one week of proper {niche}",
        "Client {niche} win — what changed",
        "Fixing a follower's {niche} mistake live",
      ],
    },
    {
      name: "Authority Proof",
      purpose: "Credentials, process, and depth — why YOU are the {niche} person to hire.",
      formats: [FORMAT_BANK[7], FORMAT_BANK[1]],
      postsPerWeek: 2,
      topics: [
        "How I learned {niche} (my real background)",
        "My {niche} process, step by step",
        "{niche} myths I believed before I knew better",
      ],
    },
    {
      name: "Soft Offer CTAs",
      purpose: "One gentle ask per week — free {niche} value in exchange for a DM or comment.",
      formats: [FORMAT_BANK[6], FORMAT_BANK[9]],
      postsPerWeek: 1,
      topics: [
        "Free {niche} audit — comment YES and I'll check yours",
        "I made a free {niche} checklist — link in bio",
        "DM me '{niche}' for the starter guide",
      ],
    },
  ],
  "sell-products": [
    {
      name: "Product Demos",
      purpose: "Show the product solving real {niche} problems — demos outsell descriptions.",
      formats: [FORMAT_BANK[0], FORMAT_BANK[4]],
      postsPerWeek: 3,
      topics: [
        "{niche} demo: watch it work in 30 seconds",
        "3 things this does for your {niche} routine",
        "Unboxing + first use for {niche}",
      ],
    },
    {
      name: "Before/After Results",
      purpose: "Visual {niche} proof — the transformation is the sales pitch.",
      formats: [FORMAT_BANK[4], FORMAT_BANK[8]],
      postsPerWeek: 2,
      topics: [
        "{niche} results: day 1 vs. day 30",
        "Customer {niche} transformation",
        "What changed after switching my {niche} setup",
      ],
    },
    {
      name: "Objection Busters",
      purpose: "Answer the 'but...' questions stopping {niche} buyers — price, trust, fit.",
      formats: [FORMAT_BANK[6], FORMAT_BANK[7]],
      postsPerWeek: 2,
      topics: [
        "Is it worth the price? Honest {niche} math",
        "{niche} product vs. the cheaper alternative",
        "Answering 'does this work for beginners in {niche}?'",
      ],
    },
    {
      name: "Urgency & Offers",
      purpose: "One offer post per week — drops, bundles, and limited {niche} deals.",
      formats: [FORMAT_BANK[9], FORMAT_BANK[5]],
      postsPerWeek: 1,
      topics: [
        "{niche} bundle deal — this week only",
        "New drop for {niche} lovers",
        "Last chance: {niche} restock ends Sunday",
      ],
    },
  ],
  "build-authority": [
    {
      name: "Deep Dives",
      purpose: "Long-form {niche} knowledge in short videos — depth is what experts are known for.",
      formats: [FORMAT_BANK[0], FORMAT_BANK[7]],
      postsPerWeek: 2,
      topics: [
        "The {niche} framework I wish I knew on day one",
        "{niche} deep dive: how it actually works",
        "Advanced {niche} tactics nobody teaches",
      ],
    },
    {
      name: "Hot Takes & Opinions",
      purpose: "Strong {niche} opinions spark debate — debate sparks reach and credibility.",
      formats: [FORMAT_BANK[7], FORMAT_BANK[2]],
      postsPerWeek: 2,
      topics: [
        "Unpopular {niche} opinion",
        "The {niche} advice I'd never follow",
        "Why the {niche} gurus are wrong about this",
      ],
    },
    {
      name: "Behind the Scenes",
      purpose: "Show your real {niche} work — transparency builds expert trust.",
      formats: [FORMAT_BANK[8], FORMAT_BANK[4]],
      postsPerWeek: 2,
      topics: [
        "A real day doing {niche} work",
        "My {niche} workspace and workflow",
        "What I got wrong in {niche} this week",
      ],
    },
    {
      name: "Q&A Authority",
      purpose: "Answer hard {niche} questions on camera — each answer is a credential.",
      formats: [FORMAT_BANK[6], FORMAT_BANK[3]],
      postsPerWeek: 2,
      topics: [
        "Answering the hardest {niche} question I get",
        "Stitching bad {niche} advice with the correction",
        "{niche} AMA: rapid-fire answers",
      ],
    },
  ],
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function fill(text: string, niche: string): string {
  return text.split("{niche}").join(niche);
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Spread a pillar's weekly posts across the week with a fixed rotation
 * so pillars don't all land on the same days. Deterministic.
 */
function pillarDays(postsPerWeek: number, pillarIndex: number): number[] {
  const days: number[] = [];
  for (let j = 0; j < postsPerWeek; j++) {
    days.push((pillarIndex * 2 + j * 3) % 7);
  }
  return days;
}

export function runTool(values: Record<string, unknown>): RunToolResult {
  const niche = clean(values["niche"]);
  const goalRaw = clean(values["businessGoal"]).toLowerCase().replace(/[\s_]+/g, "-");

  if (!niche) {
    return { ok: false, error: "Enter your niche — the whole plan is built around it." };
  }
  if (niche.length > MAX_NICHE_LEN) {
    return { ok: false, error: `Niche must be ${MAX_NICHE_LEN} characters or fewer.` };
  }

  // Edge case from spec: no business goal -> default to grow-audience pillars.
  let goal: BusinessGoal = "grow-audience";
  if (goalRaw) {
    if (!(GOALS as readonly string[]).includes(goalRaw)) {
      return { ok: false, error: "Pick a business goal: grow audience, get leads, sell products, or build authority." };
    }
    goal = goalRaw as BusinessGoal;
  }

  const pillars = PILLAR_SETS[goal];
  const totalPosts = pillars.reduce((sum, p) => sum + p.postsPerWeek, 0);

  const pillarLines = pillars.map((p, i) => {
    const topics = p.topics.map((t) => `"${fill(t, niche)}"`).join("; ");
    return `Pillar ${i + 1}: ${p.name} — ${p.postsPerWeek} posts/week. Formats: ${p.formats.join(", ")}. Purpose: ${fill(
      p.purpose,
      niche
    )} Example topics: ${topics}.`;
  });

  // Weekly schedule: one line per day; pillars rotated so posting is spread out.
  const schedule: string[] = DAYS.map((day) => `${day} — rest / engage with comments`);
  pillars.forEach((p, pi) => {
    const days = pillarDays(p.postsPerWeek, pi);
    days.forEach((d, j) => {
      const topic = fill(p.topics[j % p.topics.length], niche);
      const entry = `${p.name}: ${topic}`;
      schedule[d] = schedule[d].endsWith("rest / engage with comments")
        ? `${DAYS[d]} — ${entry}`
        : `${schedule[d]} + ${entry}`;
    });
  });

  const planSummary =
    `For the ${niche} niche with a "${GOAL_LABELS[goal]}" goal: 4 content pillars, ` +
    `${totalPosts} posts/week. Post every pillar weekly — consistency across all four beats posting only one.`;

  return {
    ok: true,
    values: {
      pillars: pillarLines,
      weeklySchedule: schedule,
      planSummary,
    },
  };
}
