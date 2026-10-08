/**
 * Broadcast Channel Idea Generator (tool-249) — pure logic (zero imports,
 * zero network, zero DOM).
 *
 * HONESTY CONTRACT: template engine, not AI. Channel ideas are assembled
 * from fixed banks combined with your niche and goal:
 *   - 8 channel-name formulas ({niche})
 *   - 6 channel-description templates ({name}, {niche}, {cta})
 *   - 8 first-post templates ({name}, {niche}), 3 picked per idea
 *   - 4 goals, each with a fixed call-to-action baked into the description
 * Selection cycles through the banks in order (idea i uses template
 * i % bankSize), so output is deterministic: same inputs -> same ideas.
 * Bank sizes are documented below; nothing is generated, nothing is live.
 */

export const GOALS = [
  "Educate",
  "Build community",
  "Promote offers",
  "Behind the scenes",
] as const;
export type ChannelGoal = (typeof GOALS)[number];

export const MIN_COUNT = 1;
export const MAX_COUNT = 10;

/** Channel-name formulas — 8 templates. {niche} is Title-Cased. */
const NAME_BANK: string[] = [
  "{Niche} Insiders",
  "The {Niche} Wire",
  "{Niche} Daily Drops",
  "Behind {Niche}",
  "The {Niche} Playbook",
  "{Niche} Vault",
  "Ask {Niche}",
  "{Niche} Unfiltered",
];

/** Description templates — 6, with the goal's CTA spliced in. */
const DESC_BANK: string[] = [
  "{name}: your direct line for {niche} — {cta}",
  "Everything {niche}, first and unfiltered, inside {name}. {cta}",
  "{name} — the {niche} channel for people who want more than the feed. {cta}",
  "Join {name} for {niche} drops, wins and behind-the-scenes. {cta}",
  "{name}: {niche} insights you won't see on the grid. {cta}",
  "The {name} channel — {niche} without the noise. {cta}",
];

/** First-post templates — 8; each idea gets 3, rotated deterministically. */
const POST_BANK: string[] = [
  "Welcome to {name}! Reply with one {niche} question you want answered this week.",
  "First drop: the {niche} thing I wish I knew a year ago. More every week in {name}.",
  "Poll time: what {niche} topic should {name} cover next? Vote below.",
  "{name} is officially open — save this channel, because the next {niche} drop lands tomorrow.",
  "Quick win from {name}: one {niche} habit to start today. Try it, then tell me how it went.",
  "Behind the scenes of {name}: here's what I'm working on in {niche} right now.",
  "This week's {niche} roundup is live in {name} — the 3 things worth your attention.",
  "Ask me anything: drop your {niche} questions in {name} and I'll answer the best ones Friday.",
];

/** Fixed call-to-action per goal. */
const GOAL_CTA: Record<ChannelGoal, string> = {
  Educate: "Stay for weekly lessons that actually teach you {niche}.",
  "Build community": "Say hi in your first reply — this channel is a two-way conversation.",
  "Promote offers": "Subscribers hear about {niche} offers and drops before anyone else.",
  "Behind the scenes": "Get the unpolished, behind-the-scenes side of {niche} every week.",
};

export const BANK_SIZES = {
  goals: GOALS.length,
  nameFormulas: NAME_BANK.length,
  descriptionTemplates: DESC_BANK.length,
  firstPostTemplates: POST_BANK.length,
  total: NAME_BANK.length + DESC_BANK.length + POST_BANK.length + GOALS.length,
};

export interface ChannelIdea {
  name: string;
  description: string;
  firstPosts: string[];
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function isGoal(value: string): value is ChannelGoal {
  return (GOALS as readonly string[]).includes(value);
}

/** Title-Case the niche for channel names ("fitness coaching" -> "Fitness Coaching"). */
function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .map((w) => (w.length === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

export function runTool(values: Record<string, unknown>): RunToolResult {
  const rawNiche = values.niche;
  const rawGoal = values.goal;
  const rawCount = values.count;

  if (typeof rawNiche !== "string" || rawNiche.trim().length === 0) {
    return { ok: false, error: "Niche is required — what is your channel about?" };
  }
  if (typeof rawGoal !== "string" || !isGoal(rawGoal)) {
    return { ok: false, error: `Goal must be one of: ${GOALS.join(", ")}.` };
  }
  if (typeof rawCount !== "number" || !Number.isInteger(rawCount)) {
    return { ok: false, error: "Count must be a whole number." };
  }
  if (rawCount < MIN_COUNT || rawCount > MAX_COUNT) {
    return {
      ok: false,
      error: `Count must be between ${MIN_COUNT} and ${MAX_COUNT}.`,
    };
  }

  const niche = rawNiche.trim();
  const nicheTitle = titleCase(niche);
  const cta = GOAL_CTA[rawGoal].replaceAll("{niche}", niche);
  const ideas: ChannelIdea[] = [];

  for (let i = 0; i < rawCount; i++) {
    const name = NAME_BANK[i % NAME_BANK.length].replaceAll("{Niche}", nicheTitle);
    const description = DESC_BANK[i % DESC_BANK.length]
      .replaceAll("{name}", name)
      .replaceAll("{niche}", niche)
      .replaceAll("{cta}", cta);
    const firstPosts = [0, 1, 2].map((k) =>
      POST_BANK[(i * 3 + k) % POST_BANK.length]
        .replaceAll("{name}", name)
        .replaceAll("{niche}", niche)
    );
    ideas.push({ name, description, firstPosts });
  }

  return {
    ok: true,
    values: {
      ideas,
      bankNote: `Assembled from fixed template banks (${BANK_SIZES.nameFormulas} name formulas, ${BANK_SIZES.descriptionTemplates} descriptions, ${BANK_SIZES.firstPostTemplates} first-post templates) — not AI-generated.`,
    },
  };
}
