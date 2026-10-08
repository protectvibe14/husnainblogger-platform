/**
 * Video Length Sweet-Spot Finder (tool-144) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * HEURISTIC GUIDANCE BANDS, NOT YOUTUBE DATA: the engine maps
 * (contentType × topicDepth) to a suggested duration band using a FIXED
 * lookup table with rationale bullets. The retention figures are labeled
 * ESTIMATES compiled from third-party benchmarks — YouTube publishes no
 * official "optimal video length" data, so this tool cannot tell you what
 * WILL perform on your channel. No personalization is possible without
 * channel analytics; output is generic guidance only.
 *
 * Deterministic: same inputs → same output, always.
 */

export type ContentType = "tutorial" | "review" | "vlog" | "essay" | "shorts";
export type TopicDepth = "quick-answer" | "deep-dive";

export const CONTENT_TYPES: ContentType[] = [
  "tutorial",
  "review",
  "vlog",
  "essay",
  "shorts",
];
export const TOPIC_DEPTHS: TopicDepth[] = ["quick-answer", "deep-dive"];

export interface DurationBand {
  /** e.g. "8–12 minutes". */
  range: string;
  min: number;
  max: number;
  /** Third-party benchmark ESTIMATE of average audience retention. */
  retentionEstimate: string;
  rationale: string[];
}

/**
 * FIXED guidance table. Retention figures are ESTIMATES compiled from
 * publicly reported third-party creator benchmarks (not YouTube-published
 * data and not a ranking signal). 10 entries = 4 formats × 2 depths +
 * shorts (depth-agnostic) + essay deep-dive extended.
 */
const BANDS: Record<string, DurationBand> = {
  "tutorial:quick-answer": {
    range: "5–8 minutes",
    min: 5,
    max: 8,
    retentionEstimate: "~45–55% (third-party benchmark estimate)",
    rationale: [
      "Quick tutorials resolve one specific problem — viewers arrive with intent and leave once answered.",
      "Under 5 minutes often feels thin for a tutorial; over 8 minutes usually signals padding for a single-answer topic.",
      "Get to the answer in the first 60 seconds, then show the full steps.",
    ],
  },
  "tutorial:deep-dive": {
    range: "10–20 minutes",
    min: 10,
    max: 20,
    retentionEstimate: "~35–45% (third-party benchmark estimate)",
    rationale: [
      "Deep dives earn longer watch time only when every section delivers a clear payoff.",
      "Use chapters so viewers can navigate — skippability keeps perceived value high.",
      "Cut ruthlessly: if a section doesn't change the outcome, it belongs in a separate video.",
    ],
  },
  "review:quick-answer": {
    range: "6–10 minutes",
    min: 6,
    max: 10,
    retentionEstimate: "~40–50% (third-party benchmark estimate)",
    rationale: [
      "Buyers want verdict, pros, cons, and alternatives — deliver the verdict in the first 90 seconds.",
      "Hands-on footage beats spec lists; show the product in real use.",
      "Longer than 10 minutes for a quick review usually means repetition.",
    ],
  },
  "review:deep-dive": {
    range: "12–18 minutes",
    min: 12,
    max: 18,
    retentionEstimate: "~30–40% (third-party benchmark estimate)",
    rationale: [
      "In-depth reviews need comparisons, testing footage, and long-term findings — viewers expect thoroughness here.",
      "Timestamp every test and comparison so researchers can jump.",
      "State your testing method up front; it is what separates a deep review from an opinion piece.",
    ],
  },
  "vlog:quick-answer": {
    range: "5–10 minutes",
    min: 5,
    max: 10,
    retentionEstimate: "~35–45% (third-party benchmark estimate)",
    rationale: [
      "Personality-driven content holds attention through energy and pacing, not information density.",
      "Front-load the day's most interesting moment — vlogs lose viewers fastest in the first 30 seconds.",
      "Cut dead time aggressively; a tight 7 minutes beats a loose 15.",
    ],
  },
  "vlog:deep-dive": {
    range: "12–20 minutes",
    min: 12,
    max: 20,
    retentionEstimate: "~30–40% (third-party benchmark estimate)",
    rationale: [
      "Longer vlogs work when there is a story arc: setup, tension, payoff.",
      "Music, b-roll, and pacing changes every 30–60 seconds fight mid-video drop-off.",
      "If the video is just a day in the life with no arc, stay under 10 minutes.",
    ],
  },
  "essay:quick-answer": {
    range: "8–12 minutes",
    min: 8,
    max: 12,
    retentionEstimate: "~40–50% (third-party benchmark estimate)",
    rationale: [
      "Short essays need one tight thesis — state it early, argue it cleanly, land the ending.",
      "Scripting quality matters more than length; a well-written 10 minutes outperforms a rambling 20.",
      "Visual variety (b-roll, graphics) keeps argument-driven videos watchable.",
    ],
  },
  "essay:deep-dive": {
    range: "15–30 minutes",
    min: 15,
    max: 30,
    retentionEstimate: "~30–40% (third-party benchmark estimate)",
    rationale: [
      "Video essays are the one format where length itself is a feature — depth is the promise.",
      "Structure with clear acts and chapter breaks; treat it like a documentary.",
      "Retention comes from the argument's momentum — never let a section repeat the thesis without new evidence.",
    ],
  },
  "shorts:quick-answer": {
    range: "15–35 seconds",
    min: 0,
    max: 1,
    retentionEstimate: "~70–85% view-through (third-party benchmark estimate)",
    rationale: [
      "Shorts live or die on the first 2 seconds — one idea, one payoff, no setup.",
      "Loop-friendly endings (the end flows into the start) earn replays.",
      "Topic depth barely matters for Shorts: anything longer than 60 seconds is not a Short.",
    ],
  },
  "shorts:deep-dive": {
    range: "15–35 seconds",
    min: 0,
    max: 1,
    retentionEstimate: "~70–85% view-through (third-party benchmark estimate)",
    rationale: [
      "Deep topics don't fit one Short — split them into a series instead.",
      "Each Short should deliver one complete micro-insight with a hook to the next part.",
      "Use on-screen text; most Shorts are watched with sound off at first glance.",
    ],
  },
};

export const DISCLAIMER =
  "Guidance bands are generic estimates compiled from publicly reported third-party creator retention benchmarks — not YouTube-published optima, and not a prediction of your video's performance. Only your own channel analytics can tell you what your audience actually watches; treat these bands as a starting plan, not a guarantee.";

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function isContentType(s: string): s is ContentType {
  return (CONTENT_TYPES as string[]).includes(s);
}
function isTopicDepth(s: string): s is TopicDepth {
  return (TOPIC_DEPTHS as string[]).includes(s);
}

/**
 * Planner entry point.
 * `values.contentType` (required): tutorial | review | vlog | essay | shorts.
 * `values.topicDepth` (required): quick-answer | deep-dive.
 *
 * Output keys (must match meta.ts outputs): durationRange, minMinutes,
 * maxMinutes, rationale, retentionEstimate, disclaimer.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const contentTypeRaw =
    typeof values["contentType"] === "string" ? values["contentType"].trim().toLowerCase() : "";
  const topicDepthRaw =
    typeof values["topicDepth"] === "string" ? values["topicDepth"].trim().toLowerCase() : "";

  if (contentTypeRaw.length === 0) {
    return { ok: false, error: "Choose a content type first." };
  }
  if (!isContentType(contentTypeRaw)) {
    return {
      ok: false,
      error: `Unknown content type "${values["contentType"]}". Choose one of: ${CONTENT_TYPES.join(", ")}.`,
    };
  }
  if (topicDepthRaw.length === 0) {
    return { ok: false, error: "Choose a topic depth: quick-answer or deep-dive." };
  }
  if (!isTopicDepth(topicDepthRaw)) {
    return {
      ok: false,
      error: `Unknown topic depth "${values["topicDepth"]}". Choose one of: ${TOPIC_DEPTHS.join(", ")}.`,
    };
  }

  const band = BANDS[`${contentTypeRaw}:${topicDepthRaw}`];
  return {
    ok: true,
    values: {
      durationRange: band.range,
      minMinutes: band.min,
      maxMinutes: band.max,
      rationale: [...band.rationale],
      retentionEstimate: band.retentionEstimate,
      disclaimer: DISCLAIMER,
    },
  };
}
