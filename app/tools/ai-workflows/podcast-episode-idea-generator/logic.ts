/**
 * Podcast Episode Idea Generator (tool-310) — pure logic.
 *
 * Honesty: this is a WORD-BANK combiner, not AI ideation. The user's show
 * theme is inserted into fixed episode-title formulas, and each idea gets a
 * segment breakdown assembled from a fixed segment bank. Nothing is invented
 * beyond the combination.
 *
 * Word banks (documented):
 * - TITLE_FORMULAS: 6 fixed episode-title patterns with a {theme} slot.
 * - SEGMENT_BANK: 8 named segments with fixed duration hints (minutes).
 * - Segment assignment by episode length (fixed rules):
 *     < 20 min  -> SHORT_SEGMENTS (2 segments: hook + takeaways)
 *     20–45 min -> STANDARD_SEGMENTS (3 segments: hook + deep-dive + takeaways)
 *     > 45 min  -> LONG_SEGMENTS (4 segments: hook + interview + Q&A + takeaways)
 *
 * Deterministic: same inputs -> same ideas, always. Zero imports.
 */

export const DEFAULT_EPISODE_MINUTES = 30;
export const MIN_EPISODE_MINUTES = 1;
export const MAX_EPISODE_MINUTES = 300;
export const IDEA_COUNT = 6;

/** 6 fixed episode-title formulas. */
export const TITLE_FORMULAS: string[] = [
  "Why {theme} Matters More Than Ever",
  "{theme}: The Beginner's Playbook",
  "The Truth About {theme} Nobody Tells You",
  "{theme} Case Studies That Changed Everything",
  "Ask Us Anything: {theme} Edition",
  "The Future of {theme}: What Comes Next",
];

export interface PodcastSegment {
  name: string;
  /** Fixed duration hint in minutes. */
  minutes: number;
}

/** 8 named segments with fixed duration hints. */
export const SEGMENT_BANK: PodcastSegment[] = [
  { name: "Cold Open Hook", minutes: 2 },
  { name: "Theme Deep-Dive", minutes: 12 },
  { name: "Guest Interview", minutes: 20 },
  { name: "Listener Q&A", minutes: 10 },
  { name: "Rapid-Fire Round", minutes: 6 },
  { name: "Story Corner", minutes: 8 },
  { name: "Action Takeaways", minutes: 5 },
  { name: "CTA & Close", minutes: 2 },
];

/** Fixed segment sets per episode-length bucket. */
export const SHORT_SEGMENTS: string[] = ["Cold Open Hook", "Action Takeaways"];
export const STANDARD_SEGMENTS: string[] = [
  "Cold Open Hook",
  "Theme Deep-Dive",
  "Action Takeaways",
];
export const LONG_SEGMENTS: string[] = [
  "Cold Open Hook",
  "Guest Interview",
  "Listener Q&A",
  "Action Takeaways",
];

export interface PodcastIdeasResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function readString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function parseNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function segmentByName(name: string): PodcastSegment {
  const found = SEGMENT_BANK.find((s) => s.name === name);
  // All bucket segment names exist in SEGMENT_BANK by construction.
  return found as PodcastSegment;
}

/**
 * runTool({ showTheme, episodeLengthMinutes? })
 * -> { ok: true, values: { ideas: string[], planNote: string } }
 * -> { ok: false, error: '...' } on invalid/missing input.
 */
export function runTool(values: Record<string, unknown>): PodcastIdeasResult {
  if (!isRecord(values)) {
    return { ok: false, error: "Provide your inputs as an object." };
  }

  const showTheme = readString(values.showTheme);
  if (showTheme.length === 0) {
    return { ok: false, error: "Enter your show's theme." };
  }

  let episodeMinutes = DEFAULT_EPISODE_MINUTES;
  const rawMinutes = values.episodeLengthMinutes;
  const minutesProvided =
    rawMinutes !== undefined &&
    rawMinutes !== null &&
    !(typeof rawMinutes === "string" && rawMinutes.trim() === "");
  if (minutesProvided) {
    const parsed = parseNumber(rawMinutes);
    if (
      parsed === null ||
      parsed < MIN_EPISODE_MINUTES ||
      parsed > MAX_EPISODE_MINUTES
    ) {
      return {
        ok: false,
        error: `Episode length must be between ${MIN_EPISODE_MINUTES} and ${MAX_EPISODE_MINUTES} minutes.`,
      };
    }
    episodeMinutes = parsed;
  }

  const segmentNames =
    episodeMinutes < 20
      ? SHORT_SEGMENTS
      : episodeMinutes <= 45
        ? STANDARD_SEGMENTS
        : LONG_SEGMENTS;
  const segments = segmentNames.map(segmentByName);
  const segmentMinutes = segments.reduce((sum, s) => sum + s.minutes, 0);
  const segmentList = segments
    .map((s) => `${s.name} (≈${s.minutes} min)`)
    .join(" → ");

  const ideas: string[] = TITLE_FORMULAS.map((formula, i) => {
    const title = formula.split("{theme}").join(showTheme);
    return (
      `${i + 1}. ${title}\n` +
      `   Segments (${segments.length}): ${segmentList} — ≈${segmentMinutes} min of segments`
    );
  });

  const planNote =
    `Planned for ≈${episodeMinutes}-minute episodes: ${segments.length} segments per idea ` +
    `(${segmentNames.join(", ")}). Segments come from a fixed bank of ${SEGMENT_BANK.length}; ` +
    "swap any segment to fit your show.";

  return { ok: true, values: { ideas, planNote } };
}
