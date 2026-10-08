/**
 * End Screen Strategy Planner — rule-based planner (NOT AI, NOT automation).
 *
 * Encodes YouTube's published end-screen rules and turns a video duration +
 * goal into a concrete element layout and timing plan:
 *
 * Verified rules encoded here (documented limitations — YouTube can change these):
 * - End screens require a video of at least 25 seconds.
 * - Up to 4 elements can be shown on a 16:9 video.
 * - Elements can appear during the last 5–20 seconds of the video.
 * - End screens are unavailable on videos marked made-for-kids.
 *
 * The planner picks a goal-based element set (3 elements each, fixed order)
 * and staggers them across the final RUNWAY_SECONDS. Applying the plan
 * happens in YouTube Studio — this tool only produces the plan.
 *
 * Pure: no imports, no DOM, no network, no randomness.
 */

const MIN_DURATION_SECONDS = 25;
const MAX_DURATION_SECONDS = 86400; // 24h sanity cap
const RUNWAY_SECONDS = 20; // elements may appear during the last 5–20s
const MAX_ELEMENTS = 4;

export type EndScreenGoal = "subs" | "watch-time" | "external-link";

const GOALS: readonly EndScreenGoal[] = ["subs", "watch-time", "external-link"];

interface ElementSpec {
  name: string;
  placement: string;
}

/**
 * Fixed element sets per goal (3 elements each, <= 4 allowed on 16:9).
 * Order = stagger order across the end-screen runway.
 */
const ELEMENT_SETS: Record<EndScreenGoal, readonly ElementSpec[]> = {
  "subs": [
    { name: "Subscribe button", placement: "bottom-left circle" },
    { name: "Recommended video (best for viewer)", placement: "right side, large rectangle" },
    { name: "Playlist (channel highlights)", placement: "left side, small rectangle" },
  ],
  "watch-time": [
    { name: "Playlist (next in series)", placement: "right side, large rectangle" },
    { name: "Specific video (next episode)", placement: "left side, rectangle" },
    { name: "Subscribe button", placement: "bottom-left circle" },
  ],
  "external-link": [
    { name: "Associated website link", placement: "right side, large rectangle" },
    { name: "Recommended video", placement: "left side, rectangle" },
    { name: "Subscribe button", placement: "bottom-left circle" },
  ],
};

const GOAL_LABELS: Record<EndScreenGoal, string> = {
  "subs": "more subscribers",
  "watch-time": "more watch time",
  "external-link": "external link clicks",
};

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function formatTimestamp(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function runTool(values: Record<string, unknown>): RunToolResult {
  const rawDuration = values["videoDuration"];
  const rawGoal = values["goal"];
  const madeForKids = values["madeForKids"] === true;

  if (typeof rawDuration !== "number" || !Number.isFinite(rawDuration)) {
    return { ok: false, error: "Enter your video duration in seconds (a number)." };
  }
  const duration = Math.floor(rawDuration);
  if (duration <= 0) {
    return { ok: false, error: "Video duration must be longer than 0 seconds." };
  }
  if (duration > MAX_DURATION_SECONDS) {
    return { ok: false, error: "Video duration looks unrealistically long — check your input." };
  }
  if (duration < MIN_DURATION_SECONDS) {
    return {
      ok: false,
      error:
        `End screens are unavailable on videos shorter than ${MIN_DURATION_SECONDS} seconds — ` +
        "your video is too short for an end screen.",
    };
  }

  if (typeof rawGoal !== "string" || !GOALS.includes(rawGoal as EndScreenGoal)) {
    return {
      ok: false,
      error: "Pick a goal: subs, watch-time, or external-link.",
    };
  }
  const goal = rawGoal as EndScreenGoal;

  const runway = Math.min(RUNWAY_SECONDS, duration - 5);
  const zoneStart = duration - runway;

  if (madeForKids) {
    // Graceful edge case: not an input error, but the plan cannot be applied.
    return {
      ok: true,
      values: {
        layout: [],
        timing: "No timing plan — end screens cannot be applied to made-for-kids videos.",
        eligibility:
          "UNAVAILABLE: this video is marked made-for-kids, and YouTube disables end " +
          "screens on made-for-kids content. Change the audience setting (if the video is " +
          "not actually made for kids) before planning an end screen.",
        runwaySeconds: 0,
      },
    };
  }

  const elements = ELEMENT_SETS[goal];
  const stagger = elements.length > 1 ? Math.floor(runway / elements.length) : runway;
  const layout: string[] = elements.map((el, i) => {
    const start = zoneStart + i * stagger;
    return `${formatTimestamp(start)} → ${formatTimestamp(duration)} — ${el.name} (${el.placement})`;
  });

  const timing =
    `End-screen zone: last ${runway}s of the video (${formatTimestamp(zoneStart)} → ${formatTimestamp(duration)}). ` +
    `Elements appear staggered every ~${stagger}s so each gets screen time. ` +
    `In YouTube Studio: Content → select the video → Editor → End screen → add each element at its planned timestamp. ` +
    `Keep the final ${runway}s free of talking-head content so the elements are visible.`;

  const eligibility =
    `ELIGIBLE: ${duration}s video meets the ≥${MIN_DURATION_SECONDS}s requirement, ` +
    `and this plan uses ${elements.length} of the maximum ${MAX_ELEMENTS} elements allowed on 16:9. ` +
    `Goal: ${GOAL_LABELS[goal]}. Apply this plan in YouTube Studio — the tool plans, YouTube applies.`;

  return {
    ok: true,
    values: { layout, timing, eligibility, runwaySeconds: runway },
  };
}
