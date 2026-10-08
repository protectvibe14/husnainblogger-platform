/**
 * Reels Series Planner (tool-246) — pure logic (zero imports, zero network,
 * zero DOM).
 *
 * HONESTY CONTRACT: this is a series planner, not AI. It assembles an
 * episode-by-episode plan from hand-written template banks:
 *   - 4 goals, each with its own 6-template hook bank (24 hooks total)
 *   - 10 generic middle-episode beat templates
 *   - 1 premise template (episode 1) + 1 finale template (last episode)
 * The goal you pick selects the hook bank; hooks cycle in bank order, so a
 * 12-episode series reuses hooks deterministically (episodes 7-12 repeat
 * episodes 1-6). Beat 1 is always the premise, the last beat is always the
 * payoff, middle episodes cycle the 10 beat templates in order.
 *
 * Placeholders: {title} = your series title, {n} = episode number.
 * Deterministic: same inputs -> same plan, always.
 */

export const GOALS = [
  "Grow followers",
  "Drive sales",
  "Build community",
  "Establish authority",
] as const;
export type SeriesGoal = (typeof GOALS)[number];

export const MIN_EPISODES = 4;
export const MAX_EPISODES = 12;

/** Hook bank: 6 templates per goal (24 total). */
const HOOK_BANK: Record<SeriesGoal, string[]> = {
  "Grow followers": [
    "Episode {n}: the {title} moment that started it all",
    "Episode {n}: why nobody talks about this {title} rule",
    "Episode {n}: I tried the {title} challenge — here's what happened",
    "Episode {n}: the {title} mistake costing you followers",
    "Episode {n}: {title}, but make it a series",
    "Episode {n}: part {n} of the {title} story nobody finished",
  ],
  "Drive sales": [
    "Episode {n}: the {title} problem your audience has right now",
    "Episode {n}: how {title} actually saves you money",
    "Episode {n}: inside a real {title} result",
    "Episode {n}: the {title} objection, answered",
    "Episode {n}: what buying {title} really looks like",
    "Episode {n}: the {title} bonus nobody expected",
  ],
  "Build community": [
    "Episode {n}: tell me your {title} story",
    "Episode {n}: the {title} debate — pick a side",
    "Episode {n}: {title} confessions, part {n}",
    "Episode {n}: you asked, I answered: {title} edition",
    "Episode {n}: the {title} crew's favorite moment",
    "Episode {n}: what {title} means to this community",
  ],
  "Establish authority": [
    "Episode {n}: the {title} framework, explained",
    "Episode {n}: what the data says about {title}",
    "Episode {n}: {title} myths, busted one by one",
    "Episode {n}: the advanced {title} tactic nobody shares",
    "Episode {n}: {title} — the 80/20 breakdown",
    "Episode {n}: my {title} prediction for next year",
  ],
};

/** Middle-episode beats — 10 templates, cycled in order for episodes 2..N-1. */
const BEAT_BANK: string[] = [
  "Raise the stakes: show what happens if {title} goes wrong.",
  "Add proof: a mini before/after around {title}.",
  "Introduce a twist: the {title} shortcut nobody expected.",
  "Go deeper: the one {title} detail everyone skips.",
  "Bring a guest angle: how someone else does {title}.",
  "Answer the top comment's {title} question.",
  "Show the messy middle of {title} — no filters.",
  "Tease the payoff: what the finale of {title} reveals.",
  "Recap the series so far and reset {title} for newcomers.",
  "Turn a follower {title} story into this episode.",
];

/** Episode 1 beat. */
const PREMISE_BEAT =
  "Set up the series premise: what {title} is about and why the viewer should follow every episode.";
/** Final episode beat. */
const FINALE_BEAT =
  "Pay off the arc: the big {title} takeaway, plus a clear call to action (follow, save, share).";

export const BANK_SIZES = {
  goals: GOALS.length,
  hooksPerGoal: HOOK_BANK["Grow followers"].length,
  middleBeats: BEAT_BANK.length,
  total: HOOK_BANK["Grow followers"].length * GOALS.length + BEAT_BANK.length + 2,
};

export interface EpisodePlanEntry {
  n: number;
  hook: string;
  beat: string;
}

export interface SeriesPlanResult {
  seriesTitle: string;
  goal: SeriesGoal;
  episodes: number;
  episodePlan: EpisodePlanEntry[];
  arcSummary: string;
  copyAll: string;
  bankSizes: typeof BANK_SIZES;
  /** Always true — reminds consumers this is template assembly, not AI. */
  isTemplateBased: true;
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function isGoal(value: string): value is SeriesGoal {
  return (GOALS as readonly string[]).includes(value);
}

function fill(template: string, title: string, n: number): string {
  return template.replaceAll("{title}", title).replaceAll("{n}", String(n));
}

function beatFor(index: number, episode: number, title: string): string {
  // index is 0-based across all episodes.
  if (index === 0) return fill(PREMISE_BEAT, title, episode);
  // Last episode handled by caller; this covers the middle.
  return fill(BEAT_BANK[(index - 1) % BEAT_BANK.length], title, episode);
}

export function runTool(values: Record<string, unknown>): RunToolResult {
  const rawTitle = values.seriesTitle;
  const rawEpisodes = values.episodes;
  const rawGoal = values.goal;

  if (typeof rawTitle !== "string" || rawTitle.trim().length === 0) {
    return { ok: false, error: "Series title is required — give your series a name." };
  }
  if (typeof rawEpisodes !== "number" || !Number.isInteger(rawEpisodes)) {
    return { ok: false, error: "Episodes must be a whole number." };
  }
  if (rawEpisodes < MIN_EPISODES || rawEpisodes > MAX_EPISODES) {
    return {
      ok: false,
      error: `Episodes must be between ${MIN_EPISODES} and ${MAX_EPISODES}.`,
    };
  }
  if (typeof rawGoal !== "string" || !isGoal(rawGoal)) {
    return {
      ok: false,
      error: `Goal must be one of: ${GOALS.join(", ")}.`,
    };
  }

  const title = rawTitle.trim();
  const hooks = HOOK_BANK[rawGoal];
  const episodePlan: EpisodePlanEntry[] = [];

  for (let i = 0; i < rawEpisodes; i++) {
    const n = i + 1;
    const isLast = i === rawEpisodes - 1;
    episodePlan.push({
      n,
      hook: fill(hooks[i % hooks.length], title, n),
      beat: isLast ? fill(FINALE_BEAT, title, n) : beatFor(i, n, title),
    });
  }

  const goalLower = rawGoal.charAt(0).toLowerCase() + rawGoal.slice(1);
  const arcSummary =
    `"${title}" runs as a ${rawEpisodes}-episode arc aimed at ${goalLower}: ` +
    `episode 1 sets the premise, episodes 2–${rawEpisodes - 1} escalate with proofs, ` +
    `twists and community moments, and episode ${rawEpisodes} pays the story off with ` +
    `a clear call to action. Post the episodes in order so the series reads as one ` +
    `continuous story.`;

  const lines = episodePlan.map(
    (e) => `Episode ${e.n}\nHook: ${e.hook}\nBeat: ${e.beat}`
  );
  const copyAll = `${title} — ${rawEpisodes}-episode Reels series (${rawGoal})\n\n${lines.join("\n\n")}`;

  const result: SeriesPlanResult = {
    seriesTitle: title,
    goal: rawGoal,
    episodes: rawEpisodes,
    episodePlan,
    arcSummary,
    copyAll,
    bankSizes: { ...BANK_SIZES },
    isTemplateBased: true,
  };

  return {
    ok: true,
    values: {
      episodePlan: result.episodePlan,
      arcSummary: result.arcSummary,
      copyAll: result.copyAll,
    },
  };
}
