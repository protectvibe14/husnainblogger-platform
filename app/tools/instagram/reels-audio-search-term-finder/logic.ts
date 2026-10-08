/**
 * Reels Audio Search Term Finder (tool-248) — pure logic (zero imports, zero
 * network, zero DOM).
 *
 * HONESTY CONTRACT: this tool CANNOT show live trending audio. Instagram's
 * trending-audio charts live inside the Instagram app and have no public
 * API, so no website can query them. What it honestly does: it assembles
 * search phrases you type into Instagram's Reels audio search box, built
 * from a fixed formula bank so you find the right mood/niche sounds fast.
 *
 * Formula bank: 10 templates with {niche} and {mood} placeholders.
 * Moods (6): Upbeat, Chill, Dramatic, Funny, Romantic, Inspirational.
 * The first `count` templates are returned (count is 1-10), so output is
 * deterministic: same inputs -> same terms, always.
 */

export const MOODS = [
  "Upbeat",
  "Chill",
  "Dramatic",
  "Funny",
  "Romantic",
  "Inspirational",
] as const;
export type AudioMood = (typeof MOODS)[number];

export const MIN_COUNT = 1;
export const MAX_COUNT = 10;

/** Search-term formulas — 10 fixed templates. */
const TERM_BANK: string[] = [
  "trending {mood} audio for {niche}",
  "{mood} {niche} reels songs",
  "viral {mood} sounds {niche}",
  "{niche} {mood} background music",
  "{mood} trending reels audio",
  "popular {mood} songs for {niche} reels",
  "{mood} beats for {niche} content",
  "viral audio {niche} {mood}",
  "{mood} {niche} trending sound",
  "{niche} {mood} audio trend",
];

export const BANK_SIZES = {
  moods: MOODS.length,
  termTemplates: TERM_BANK.length,
  total: MOODS.length + TERM_BANK.length,
};

export const TIP_NOTE =
  "Type any of these phrases into Instagram's Reels audio search box (Reels composer → Audio → search). " +
  "Look for tracks with a rising arrow — that marks audio that is trending. " +
  "These are search phrases, not live trending-audio data: Instagram's trending charts only exist inside the Instagram app, " +
  "and this tool cannot fetch them (no API, fully client-side).";

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function isMood(value: string): value is AudioMood {
  return (MOODS as readonly string[]).includes(value);
}

function fill(template: string, niche: string, mood: AudioMood): string {
  const moodLower = mood.toLowerCase();
  return template
    .replaceAll("{niche}", niche)
    .replaceAll("{Niche}", niche)
    .replaceAll("{mood}", moodLower)
    .replaceAll("{Mood}", mood);
}

export function runTool(values: Record<string, unknown>): RunToolResult {
  const rawNiche = values.niche;
  const rawMood = values.mood;
  const rawCount = values.count;

  if (typeof rawNiche !== "string" || rawNiche.trim().length === 0) {
    return { ok: false, error: "Niche is required — tell us what your content is about." };
  }
  if (typeof rawMood !== "string" || !isMood(rawMood)) {
    return { ok: false, error: `Mood must be one of: ${MOODS.join(", ")}.` };
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
  const searchTerms = TERM_BANK.slice(0, rawCount).map((t) => fill(t, niche, rawMood));

  return {
    ok: true,
    values: {
      searchTerms,
      tipNote: TIP_NOTE,
    },
  };
}
