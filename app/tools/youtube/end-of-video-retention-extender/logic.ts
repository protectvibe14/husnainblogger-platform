/**
 * End-of-Video Retention Extender — pure logic (tool-140).
 *
 * TEMPLATE BEATS, NOT RETENTION PREDICTIONS: this module assembles ending
 * segment script beats from fixed template patterns for the final
 * 60–120 seconds of a video. It makes NO claims about retention numbers —
 * no fabricated percentages, no "will increase retention by X%" promises.
 * Honesty rule: all guidance stays generic ("keeps viewers watching")
 * rather than numerical.
 *
 * Static bank sizes (documented, fixed):
 *   - PATTERNS: 4 ending patterns (loop-back, next-video-bridge,
 *     open-loop, end-screen-runway). Each pattern has 5 beats
 *     (20 beats total). Beats use {topic} and {nextTopic} placeholders.
 *   - TIMING NOTE: 1 fixed timing note per pattern (4 total).
 *   - RUNWAY RULE: fixed guidance — keep the final 5–20 seconds
 *     visually clear for end-screen cards (from the spec).
 *
 * Inputs: videoTopic (text, required, ≤200 chars), nextVideoTopic
 * (text, optional — patterns fall back to a generic bridge line when
 * empty), pattern (select, required).
 *
 * Deterministic: same inputs always produce the same beats.
 * Zero imports, zero DOM, zero network.
 */

export interface EndingPattern {
  id: string;
  label: string;
  description: string;
  beats: string[];
  timingNote: string;
}

/**
 * Four patterns × 5 beats = 20 fixed beats.
 * {topic} = the current video's topic. {nextTopic} = the next video's topic.
 */
export const PATTERNS: EndingPattern[] = [
  {
    id: "loop-back",
    label: "Loop-back to the hook",
    description:
      "Close the loop you opened in the first 15 seconds — viewers feel the payoff and stick around.",
    beats: [
      "RECAP (10s): \"So here's what we covered about {topic}...\" — one-sentence summary, no new info.",
      "CALLBACK (15s): Revisit the exact promise from your intro hook (\"Remember when I said...\").",
      "PROOF MOMENT (20s): Show the final result on screen — the completed {topic} outcome viewers came for.",
      "KEY TAKEAWAY (15s): State the single most important lesson from {topic} in one quotable line.",
      "TEASE (10s): \"But there's one {topic} mistake most people still make — that's next.\"",
    ],
    timingNote:
      "Loop-back pattern fits a ~70s ending: keep the final 5–20 seconds visually clear so end-screen cards are readable.",
  },
  {
    id: "next-video-bridge",
    label: "Next-video bridge",
    description:
      "Hand off viewers directly to a related video — the bridge is the session-time engine.",
    beats: [
      "WRAP-UP (15s): \"That covers {topic}.\" Stop cleanly — no rambling past the payoff.",
      "RESULT HIGHLIGHT (15s): Replay the best 5 seconds of what the viewer just learned about {topic}.",
      "BRIDGE LINE (15s): \"If you liked this, you'll love {nextTopic} — it takes this even further.\"",
      "WHY NEXT (15s): Give one concrete reason to click: what specific question {nextTopic} answers.",
      "END-SCREEN RUNWAY (20s): Go quiet on talking, stay on screen smiling — point to the end-screen card while {nextTopic} is titled on screen.",
    ],
    timingNote:
      "Next-video bridge fits an ~80s ending: the last 20 seconds (inside the 5–20 seconds clear window) must stay visually clear — end-screen cards appear here.",
  },
  {
    id: "open-loop",
    label: "Open loop (curiosity)",
    description:
      "Plant an unanswered question so viewers need the next video to resolve it.",
    beats: [
      "SATISFY (15s): Deliver the promised {topic} payoff fully — a closed loop that teases nothing feels abrupt.",
      "PLANT THE LOOP (10s): \"But what I haven't shown you yet is the part that changes everything.\"",
      "STAKES (15s): Explain why the unanswered {topic} question matters — name the cost of not knowing.",
      "TEASE WITHOUT SPOILING (15s): Hint at the answer's shape (\"it takes 2 minutes and costs nothing\") without giving it.",
      "PROMISE (10s): \"That's exactly what I cover in {nextTopic} — click through, it's right there.\"",
    ],
    timingNote:
      "Open loop fits a ~65s ending: hold the final 5–20 seconds clear for end-screen cards so the click target is visible.",
  },
  {
    id: "end-screen-runway",
    label: "End-screen runway",
    description:
      "A calm, clean runway built purely so end-screen cards get maximum clicks.",
    beats: [
      "QUICK RECAP (10s): One line on what {topic} covered — no new content introduced.",
      "CTA — SUBSCRIBE (10s): One subscribe ask, tied to value: \"for more {topic} breakdowns like this.\"",
      "CTA — COMMENT (10s): One question that invites comments about {topic}.",
      "POINT AND PAUSE (10s): Physically gesture to where the end-screen card will appear.",
      "QUIET RUNWAY (20s): Stop talking. Stay on screen, light background music, {nextTopic} title card visible.",
    ],
    timingNote:
      "End-screen runway fits a ~60s ending: the last 20 seconds (the full 5–20 seconds clear window) are deliberately silent and visually clear — that IS the end-screen window.",
  },
];

/** Generic fallback when no next-video topic is given. */
export const NEXT_TOPIC_FALLBACK = "the next video in this series";

/** The fixed end-screen clear window guidance (spec: last 5–20s kept clear). */
export const RUNWAY_RULE =
  "Keep the final 5–20 seconds of your video visually clear (no fast cuts, no burned-in text) so YouTube's end-screen cards are readable and clickable.";

/** Topic length cap. */
export const TOPIC_MAX_CHARS = 200;

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * runTool adapter (mountToolUI generator template).
 * Validates { videoTopic, nextVideoTopic?, pattern } and returns
 * { scriptBeats, timingNote, runwayRule }. Output ids match meta.ts outputs.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Enter your video topic and pick an ending pattern." };
  }
  const topicRaw = values["videoTopic"];
  const patternRaw = values["pattern"];

  if (typeof topicRaw !== "string" || topicRaw.trim().length === 0) {
    return { ok: false, error: "Video topic is required — what is this video about?" };
  }
  const topic = topicRaw.trim();
  if (topic.length > TOPIC_MAX_CHARS) {
    return { ok: false, error: `Video topic is too long — keep it under ${TOPIC_MAX_CHARS} characters.` };
  }
  const pattern = PATTERNS.find((p) => p.id === patternRaw);
  if (typeof patternRaw !== "string" || !pattern) {
    return {
      ok: false,
      error: `Ending pattern is required. Choose one of: ${PATTERNS.map((p) => p.id).join(", ")}.`,
    };
  }

  const nextRaw = values["nextVideoTopic"];
  const nextTopic =
    typeof nextRaw === "string" && nextRaw.trim().length > 0
      ? nextRaw.trim()
      : NEXT_TOPIC_FALLBACK;

  const beats = pattern.beats.map((b, i) =>
    `Beat ${i + 1} — ${b.replaceAll("{topic}", topic).replaceAll("{nextTopic}", nextTopic)}`,
  );

  return {
    ok: true,
    values: {
      scriptBeats: beats,
      timingNote: pattern.timingNote,
      runwayRule: RUNWAY_RULE,
    },
  };
}
