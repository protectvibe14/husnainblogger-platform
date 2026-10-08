/**
 * TikTok Series Episode Planner (tool-155) — episode-arc planner.
 * Zero imports, zero network, zero DOM, no Math.random.
 *
 * HONESTY: Static episode-arc templates assembled from FIXED word banks —
 * no AI, no live data, no TikTok account access. It plans structure
 * (hooks, beats, CTAs, posting order), never performance.
 *
 * WORD BANKS (all fixed; sizes documented — picks are deterministic):
 *   EPISODE_HOOKS   10 — per-episode hook frames, [TITLE] / [NICHE] slots
 *   SETUP_BEATS      6 — opener setup frames
 *   VALUE_BEATS     10 — value-delivery frames
 *   RECAP_BEAT       1 — fixed "Previously on [TITLE]" frame, inserted in
 *                        every 5th episode
 *   TWIST_BEATS      6 — pre-finale twist frames
 *   PAYOFF_BEATS     4 — finale payoff frames
 *   CTAS             6 — "follow for part [NEXT]" frames
 *   FINALE_CTA       1 — fixed series-closing CTA
 *   TOTAL: 44 fixed frames.
 *
 * ARC RULES (fixed):
 *   N = 1        -> one standalone episode (setup + payoff)
 *   episode 1    -> opener (hook + setup + promise)
 *   episode N    -> finale (payoff + closing CTA)
 *   episode N-1  -> twist episode (N > 2)
 *   every 5th    -> recap episode with the "Previously on" beat
 *                   (doubles as an entry point for new viewers)
 *   all others   -> value episodes (2 value beats each)
 *
 * Long-form note: episodes are planned as single units; if your episodes
 * run long, plan each in 600-second-or-shorter sections — 60-minute
 * uploads need special account eligibility (check the TikTok app).
 *
 * Deterministic: same inputs -> same plan, always.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export const MIN_EPISODES = 1;
export const MAX_EPISODES = 50;
export const MAX_TITLE_LENGTH = 120;
export const MAX_NICHE_LENGTH = 60;
export const RECAP_EVERY = 5;

export const EPISODE_HOOKS: readonly string[] = [
  "Part [N] of [TITLE]: the [NICHE] series everyone asked for.",
  "[TITLE] continues — and this part changes everything.",
  "Welcome back to [TITLE] — [NICHE] part [N].",
  "If you missed part [N-1], catch up, then watch this.",
  "[TITLE], part [N]: the [NICHE] step nobody skips.",
  "New episode of [TITLE] — [NICHE] just got interesting.",
  "Part [N]: [TITLE] is building to something big.",
  "Back with [TITLE] — today’s [NICHE] lesson is the key one.",
  "[TITLE] part [N]: watch till the end for the twist.",
  "The [TITLE] series rolls on — [NICHE] part [N].",
];

export const SETUP_BEATS: readonly string[] = [
  "Here’s the promise: by the final episode, you’ll have the full [NICHE] playbook.",
  "Quick recap of what this series covers and why it matters.",
  "Meet the format: one [NICHE] lesson per episode, no fluff.",
  "This is episode 1 — everything builds from here.",
  "Set expectations: short episodes, one clear takeaway each.",
  "Why this series exists: the [NICHE] advice nobody gives beginners.",
];

export const VALUE_BEATS: readonly string[] = [
  "Today’s core [NICHE] lesson — the one that unlocks the next episode.",
  "The practical [NICHE] move to try before the next part drops.",
  "A common [NICHE] mistake, fixed in under a minute.",
  "The [NICHE] detail most people skip — don’t be most people.",
  "One [NICHE] framework you can reuse forever.",
  "Behind the scenes: how this [NICHE] step actually works.",
  "The [NICHE] shortcut that saves you the most time.",
  "A quick [NICHE] test to check you’re on track.",
  "The [NICHE] habit that compounds across episodes.",
  "Today’s takeaway, distilled to one sentence.",
];

export const RECAP_BEAT =
  "Previously on [TITLE]: the one-line recap a new viewer needs before this episode.";

export const TWIST_BEATS: readonly string[] = [
  "The twist: everything so far was the setup — here’s the real [NICHE] move.",
  "Plot twist: the ‘advanced’ [NICHE] tactic is simpler than the basics.",
  "What I haven’t told you about [NICHE] — until now.",
  "The episode that reframes the whole series.",
  "Forget what you assumed about [NICHE]; here’s the truth.",
  "The [NICHE] reveal that makes the finale hit harder.",
];

export const PAYOFF_BEATS: readonly string[] = [
  "The full [NICHE] playbook, assembled — you made it.",
  "Finale: everything from [TITLE] in one winning move.",
  "The payoff episode — here’s your complete [NICHE] result.",
  "[TITLE] wraps: the [NICHE] transformation, start to finish.",
];

export const CTAS: readonly string[] = [
  "Follow for part [NEXT] — it drops tomorrow.",
  "Comment ‘next’ and I’ll tag you when part [NEXT] is live.",
  "Save this series — part [NEXT] builds on it.",
  "Share part [NEXT] with someone learning [NICHE].",
  "Turn on notifications so you don’t miss part [NEXT].",
  "Duet this with your attempt before part [NEXT].",
];

export const FINALE_CTA =
  "This series wraps here — follow for the next [NICHE] series.";

/** djb2 — deterministic pick index from any seed string. */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pick(bank: readonly string[], seed: string, salt: string): string {
  return bank[hashString(seed + "|" + salt) % bank.length];
}

function fill(line: string, title: string, niche: string, n: number): string {
  return line
    .split("[TITLE]")
    .join(title)
    .split("[NICHE]")
    .join(niche === "" ? "your niche" : niche)
    .split("[N]")
    .join(String(n))
    .split("[N-1]")
    .join(String(Math.max(1, n - 1)))
    .split("[NEXT]")
    .join(String(n + 1));
}

function asWholeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.floor(value);
  if (typeof value === "string") {
    const t = value.trim();
    if (t === "") return null;
    const n = Number(t);
    if (Number.isFinite(n)) return Math.floor(n);
  }
  return null;
}

type EpisodeKind = "standalone" | "opener" | "value" | "recap" | "twist" | "finale";

const KIND_LABELS: Record<EpisodeKind, string> = {
  standalone: "STANDALONE",
  opener: "OPENER",
  value: "VALUE",
  recap: "RECAP",
  twist: "TWIST",
  finale: "FINALE",
};

function kindFor(n: number, total: number): EpisodeKind {
  if (total === 1) return "standalone";
  if (n === 1) return "opener";
  if (n === total) return "finale";
  if (n === total - 1 && total > 2) return "twist";
  if (n % RECAP_EVERY === 0) return "recap";
  return "value";
}

export function runTool(values: Record<string, unknown>): RunResult {
  // --- validate title ---
  const titleRaw = values.seriesTitle;
  if (typeof titleRaw !== "string" || titleRaw.trim() === "") {
    return {
      ok: false,
      error: 'Give your series a title (e.g. "30 Days of Sourdough").',
    };
  }
  const title = titleRaw.trim();
  if (title.length > MAX_TITLE_LENGTH) {
    return {
      ok: false,
      error: `Series title is too long — keep it under ${MAX_TITLE_LENGTH} characters.`,
    };
  }

  // --- validate niche (optional) ---
  const nicheRaw = values.niche;
  let niche = "";
  if (nicheRaw !== undefined && nicheRaw !== null && String(nicheRaw).trim() !== "") {
    if (typeof nicheRaw !== "string") {
      return { ok: false, error: "Niche must be text." };
    }
    niche = nicheRaw.trim();
    if (niche.length > MAX_NICHE_LENGTH) {
      return {
        ok: false,
        error: `Niche is too long — keep it under ${MAX_NICHE_LENGTH} characters.`,
      };
    }
  }

  // --- validate episode count ---
  const count = asWholeNumber(values.episodeCount);
  if (count === null) {
    return {
      ok: false,
      error: `Episode count is required — enter a whole number between ${MIN_EPISODES} and ${MAX_EPISODES}.`,
    };
  }
  if (count < MIN_EPISODES || count > MAX_EPISODES) {
    return {
      ok: false,
      error: `Episode count must be between ${MIN_EPISODES} and ${MAX_EPISODES}.`,
    };
  }

  const seed = `${title}|${niche.toLowerCase()}`;
  const episodes: string[] = [];
  let recapCount = 0;

  for (let n = 1; n <= count; n++) {
    const kind = kindFor(n, count);
    const hook = fill(pick(EPISODE_HOOKS, seed, `hook${n}`), title, niche, n);
    const beats: string[] = [];

    switch (kind) {
      case "standalone":
        beats.push(fill(pick(SETUP_BEATS, seed, "setup"), title, niche, n));
        beats.push(fill(pick(PAYOFF_BEATS, seed, "payoff"), title, niche, n));
        break;
      case "opener":
        beats.push(fill(pick(SETUP_BEATS, seed, `setup${n}`), title, niche, n));
        beats.push(fill(pick(VALUE_BEATS, seed, `promise${n}`), title, niche, n));
        break;
      case "recap":
        recapCount++;
        beats.push(fill(RECAP_BEAT, title, niche, n));
        beats.push(fill(pick(VALUE_BEATS, seed, `recap${n}`), title, niche, n));
        break;
      case "twist":
        beats.push(fill(pick(TWIST_BEATS, seed, `twist${n}`), title, niche, n));
        beats.push(fill(pick(VALUE_BEATS, seed, `twistv${n}`), title, niche, n));
        break;
      case "finale":
        beats.push(fill(pick(PAYOFF_BEATS, seed, `payoff${n}`), title, niche, n));
        break;
      case "value":
        beats.push(fill(pick(VALUE_BEATS, seed, `v${n}a`), title, niche, n));
        beats.push(fill(pick(VALUE_BEATS, seed, `v${n}b`), title, niche, n));
        break;
    }

    const cta =
      kind === "finale"
        ? fill(FINALE_CTA, title, niche, n)
        : fill(pick(CTAS, seed, `cta${n}`), title, niche, n);

    episodes.push(
      `Ep ${n} \u00b7 ${KIND_LABELS[kind]} \u2014 Hook: ${hook} | Beats: ${beats.join(" / ")} | CTA: ${cta}`
    );
  }

  // --- arc summary ---
  let arcSummary: string;
  if (count === 1) {
    arcSummary =
      `A single-episode series for "${title}": one standalone episode with setup and payoff. ` +
      `Plan it in 600-second-or-shorter sections; 60-minute uploads need special account ` +
      `eligibility \u2014 check the TikTok app.`;
  } else {
    arcSummary =
      `A ${count}-episode arc for "${title}": episode 1 hooks the promise, ` +
      `episode ${count - 1} twists, and episode ${count} pays off.`;
    if (recapCount > 0) {
      arcSummary +=
        ` Every 5th episode is a recap with a "Previously on" beat \u2014 ` +
        `each recap doubles as an entry point for new viewers.`;
    }
    arcSummary +=
      ` Plan each episode in 600-second-or-shorter sections; 60-minute uploads need special ` +
      `account eligibility \u2014 check the TikTok app.`;
  }

  const postingOrder =
    count === 1
      ? "Post the episode, then pin it to your profile as the series entry point."
      : `Post in order 1 \u2192 ${count}, one episode per day. Pin episode 1 as the series entry ` +
        `point; number every caption ("Part n/${count}") so viewers can follow along; ` +
        `reply to comments with the next episode number to pull viewers forward.`;

  return {
    ok: true,
    values: { episodes, arcSummary, postingOrder },
  };
}
