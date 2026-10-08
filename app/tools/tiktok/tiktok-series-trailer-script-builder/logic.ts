/**
 * TikTok Series Trailer Script Builder (tool-199) — template trailer builder.
 * Zero imports, zero network, zero DOM, no Math.random.
 *
 * The BuilderTemplate calls runTool({ items }), one item per episode:
 *   { seriesTitle, episodeTopic, allowSpoilers? }
 *
 * HONESTY: assembles a trailer script from FIXED tease-beat templates and
 * fixed montage/CTA templates — templated, not AI-written. Spoiler control:
 * tease beats never reveal episode outcomes (the tool cannot know them);
 * the optional allowSpoilers flag only switches tease wording between a
 * "mystery tease" style and a "promise the payoff" style. No invented
 * episode outcomes, no invented stats.
 *
 * WORD BANKS (all fixed; sizes documented):
 *   TEASE_BEATS_SPOILER_FREE  6 mystery-style tease templates
 *   TEASE_BEATS_SPOILER_OK    6 payoff-promise tease templates
 *   MONTAGE_CUES              6 fixed montage direction cues
 *   TOTAL: 18 fixed bank entries.
 *
 * Determinism: same items -> same script, always. Beat i uses bank index
 * i % 6, so episode order is preserved and repeats are predictable.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const MIN_ITEMS = 2;
const MAX_ITEMS = 20;
const MAX_TITLE_LEN = 80;
const MAX_TOPIC_LEN = 120;

function fill(template: string, title: string, topic: string, n: number): string {
  return template
    .split("{title}").join(title)
    .split("{topic}").join(topic)
    .split("{n}").join(String(n));
}

/** Spoiler-free: tease the mystery, never the outcome. */
const TEASE_BEATS_SPOILER_FREE: readonly string[] = [
  "Episode {n}: {topic} — I'm not spoiling this one. Let's just say the ending isn't what you'd expect.",
  "Episode {n} takes on {topic}, and there's a moment in it you'll want to watch twice.",
  "In episode {n} I finally tackle {topic} — and one thing in it genuinely surprised me.",
  "Episode {n}: {topic}. I can't say more without ruining it. You'll see.",
  "{topic} gets its own episode — number {n} — and the behind-the-scenes story is half the fun.",
  "Episode {n} is all about {topic}. One word: watch until the end.",
];

/** Spoiler-ok: promise the payoff without inventing outcomes. */
const TEASE_BEATS_SPOILER_OK: readonly string[] = [
  "Episode {n}: {topic} — and yes, you'll see exactly how it plays out, start to finish.",
  "Episode {n} breaks down {topic} with nothing held back — the full result is on screen.",
  "In episode {n} I show {topic} completely: the setup, the process, and the real outcome.",
  "Episode {n}: {topic}, told straight — including the part most people would cut out.",
  "{topic} gets the full episode-{n} treatment: no cliffhanger, the whole story.",
  "Episode {n} delivers on {topic} — you'll know exactly where things landed by the last second.",
];

const MONTAGE_CUES: readonly string[] = [
  "Montage cue: 0.5-second quick cuts of your most expressive reactions — no talking, let the faces sell it.",
  "Montage cue: flash one word on screen per episode topic, synced to a beat drop.",
  "Montage cue: before/after split-screens — left side the start, right side the transformation.",
  "Montage cue: hands-only shots of the key moment from each episode, 1 second each.",
  "Montage cue: one line of voiceover per episode topic over B-roll of your workspace.",
  "Montage cue: freeze-frame on the most dramatic moment, then smash-cut to the series title card.",
];

export function runTool(args: { items: Record<string, unknown>[] }): RunResult {
  const items = args && args.items;
  if (!Array.isArray(items) || items.length === 0) {
    return {
      ok: false,
      error: `Please add ${MIN_ITEMS} to ${MAX_ITEMS} episode items — each with a series title and an episode topic — then run the builder.`,
    };
  }
  if (items.length < MIN_ITEMS) {
    return {
      ok: false,
      error: `A trailer needs at least ${MIN_ITEMS} episodes — you added ${items.length}. Add ${MIN_ITEMS - items.length} more episode topic${MIN_ITEMS - items.length === 1 ? "" : "s"}.`,
    };
  }
  if (items.length > MAX_ITEMS) {
    return {
      ok: false,
      error: `A trailer covers at most ${MAX_ITEMS} episodes — you added ${items.length}. Split longer series into two trailers.`,
    };
  }

  interface Episode {
    seriesTitle: string;
    episodeTopic: string;
    spoilerOk: boolean;
  }
  const episodes: Episode[] = [];
  for (let i = 0; i < items.length; i++) {
    const label = `Item ${i + 1}`;
    const item = items[i];
    if (item === null || typeof item !== "object") {
      return { ok: false, error: `${label}: episode entry is invalid — expected an object with seriesTitle and episodeTopic.` };
    }
    const rawTitle = item["seriesTitle"];
    if (typeof rawTitle !== "string" || rawTitle.trim().length === 0) {
      return { ok: false, error: `${label}: series title is required — name the series this episode belongs to.` };
    }
    const seriesTitle = rawTitle.trim();
    if (seriesTitle.length > MAX_TITLE_LEN) {
      return { ok: false, error: `${label}: series title must be ${MAX_TITLE_LEN} characters or fewer.` };
    }
    const rawTopic = item["episodeTopic"];
    if (typeof rawTopic !== "string" || rawTopic.trim().length === 0) {
      return { ok: false, error: `${label}: episode topic is required — what is this episode about?` };
    }
    const episodeTopic = rawTopic.trim();
    if (episodeTopic.length > MAX_TOPIC_LEN) {
      return { ok: false, error: `${label}: episode topic must be ${MAX_TOPIC_LEN} characters or fewer.` };
    }
    const rawSpoil = item["allowSpoilers"];
    const spoilerOk = typeof rawSpoil === "string" && rawSpoil.trim().toLowerCase() === "yes";
    episodes.push({ seriesTitle, episodeTopic, spoilerOk });
  }

  const seriesTitle = episodes[0].seriesTitle;

  const teaseBeats = episodes.map((ep, i) => {
    const bank = ep.spoilerOk ? TEASE_BEATS_SPOILER_OK : TEASE_BEATS_SPOILER_FREE;
    return fill(bank[i % bank.length], seriesTitle, ep.episodeTopic, i + 1);
  });

  const montageCues = MONTAGE_CUES.map((c) => c);

  const subscribeCta =
    `Follow for the full "${seriesTitle}" series — episode 1 drops soon, and the best moments are saved for ` +
    `later episodes. Turn on notifications so you don't miss one. Comment which episode you're most excited for.`;

  const lines: string[] = [];
  lines.push(`"${seriesTitle.toUpperCase()}" — SERIES TRAILER SCRIPT`);
  lines.push("");
  lines.push(`[HOOK, 0:00-0:03] "${seriesTitle} is coming — and here's why you need to watch every episode."`);
  lines.push("");
  lines.push("[TEASE BEATS]");
  teaseBeats.forEach((beat, i) => lines.push(`${i + 1}. ${beat}`));
  lines.push("");
  lines.push("[MONTAGE CUES]");
  montageCues.forEach((cue, i) => lines.push(`${i + 1}. ${cue}`));
  lines.push("");
  lines.push(`[CLOSE, CTA] "${subscribeCta}"`);
  lines.push("");
  lines.push("Spoiler note: teases above reveal episode topics only — outcomes stay unspoiled unless you wrote them into the tease yourself.");
  const trailerScript = lines.join("\n");

  return {
    ok: true,
    values: {
      trailerScript,
      teaseBeats,
      montageCues,
      subscribeCta,
      episodeCount: episodes.length,
    },
  };
}
