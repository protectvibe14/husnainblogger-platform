/**
 * YouTube Script Prompt Pack (tool-304) — pure logic, zero imports.
 *
 * FIXED PACK, NOT AI (inventory type corrected generator -> library):
 * 5 human-written script-prompt templates, one per video type. Nothing is
 * generated at runtime — runTool returns the pre-written template for the
 * requested video type, and the user copies it into their own AI tool.
 *
 * Video types (fixed list): tutorial | review | vlog | commentary | unboxing
 */

export const VIDEO_TYPES = [
  "tutorial",
  "review",
  "vlog",
  "commentary",
  "unboxing",
] as const;

export type VideoType = (typeof VIDEO_TYPES)[number];

/**
 * The 5 fixed prompt templates. Each is a complete, human-written prompt
 * with [PLACEHOLDERS] the user fills in before pasting into their AI tool.
 */
export const SCRIPT_PROMPT_TEMPLATES: Record<VideoType, string> = {
  tutorial: [
    "You are an expert YouTube scriptwriter. Write a complete script for a tutorial video about [TOPIC], aimed at [AUDIENCE].",
    "",
    "Structure the script exactly like this:",
    "1. HOOK (first 15 seconds): open with the result the viewer will get, not with an introduction.",
    "2. INTRO (15-30 seconds): who this tutorial is for and what they need before starting.",
    "3. STEPS: break the process into [N] numbered steps. For each step write what I say AND an on-screen cue in [brackets] (what to show, zoom, or highlight).",
    "4. COMMON MISTAKES: the 3 mistakes beginners make with [TOPIC] and how to avoid each one.",
    "5. RECAP + CTA: summarize the steps in 3 bullet points, then one clear call to action: [CALL TO ACTION].",
    "",
    "Target video length: [X] minutes. Tone: [TONE]. Write in spoken language — short sentences, no jargon without explanation.",
  ].join("\n"),

  review: [
    "You are an expert YouTube scriptwriter. Write a complete script for an honest review video of [PRODUCT], aimed at [AUDIENCE].",
    "",
    "Structure the script exactly like this:",
    "1. HOOK (first 15 seconds): the single most important finding about [PRODUCT] — good or bad.",
    "2. CONTEXT: what [PRODUCT] is, who it is for, and what it costs.",
    "3. TESTING: describe [N] real-world tests I ran, with an on-screen cue in [brackets] for each result shown.",
    "4. PROS AND CONS: 3 genuine strengths and 3 genuine weaknesses. Do not invent specifications — only use facts I provide: [FACTS].",
    "5. COMPARISON: how it stacks up against [COMPETITOR] in one short section.",
    "6. VERDICT + CTA: who should buy it, who should skip it, and one clear call to action: [CALL TO ACTION].",
    "",
    "Target video length: [X] minutes. Tone: [TONE] and trustworthy — never hype a product I would not recommend.",
  ].join("\n"),

  vlog: [
    "You are an expert YouTube scriptwriter. Write a complete script outline for a vlog about [TOPIC / DAY / EVENT], aimed at [AUDIENCE].",
    "",
    "Structure the script exactly like this:",
    "1. HOOK (first 15 seconds): the most interesting moment of the vlog, teased without spoiling it.",
    "2. SETUP: where I am, what is happening today, and why the viewer should care — in under 30 seconds.",
    "3. SCENES: [N] scenes in order. For each scene write: location, what happens, one line I say to camera, and B-roll to capture in (parentheses).",
    "4. STORY BEAT: one reflective moment where I share what [TOPIC] taught me or how I feel about it.",
    "5. OUTRO + CTA: wrap up the day, tease the next video, and one clear call to action: [CALL TO ACTION].",
    "",
    "Target video length: [X] minutes. Tone: [TONE]. Write like I talk — casual, warm, and unscripted-sounding.",
  ].join("\n"),

  commentary: [
    "You are an expert YouTube scriptwriter. Write a complete script for a commentary video about [TOPIC / NEWS / TREND], aimed at [AUDIENCE].",
    "",
    "Structure the script exactly like this:",
    "1. HOOK (first 15 seconds): my boldest take on [TOPIC] — the opinion that makes someone keep watching.",
    "2. CONTEXT: what happened, in 60 seconds, for viewers who missed it. Stick to verified facts: [FACTS].",
    "3. MY TAKE: my argument in [N] points, each with one piece of evidence or reasoning. Mark where to cut to clips or screenshots with [CLIP: description].",
    "4. COUNTERPOINT: the strongest argument against my take, addressed fairly.",
    "5. CLOSE + CTA: my final verdict in 2-3 sentences, a question to drive comments: [QUESTION], and one clear call to action: [CALL TO ACTION].",
    "",
    "Target video length: [X] minutes. Tone: [TONE]. Be opinionated but fair — never invent facts to support the take.",
  ].join("\n"),

  unboxing: [
    "You are an expert YouTube scriptwriter. Write a complete script for an unboxing video of [PRODUCT], aimed at [AUDIENCE].",
    "",
    "Structure the script exactly like this:",
    "1. HOOK (first 15 seconds): show the box and state the one thing everyone wants to know about [PRODUCT].",
    "2. FIRST IMPRESSIONS: packaging, what is in the box (list each item), and build quality — with an on-screen cue in [brackets] for every close-up.",
    "3. SETUP / FIRST USE: walk through setup step by step, narrating what I am doing as I do it.",
    "4. HANDS-ON TEST: [N] quick real-world tests with genuine first reactions — keep the honest moments, including surprises.",
    "5. EARLY VERDICT + CTA: first impressions only (not a full review), who it is for, and one clear call to action: [CALL TO ACTION].",
    "",
    "Target video length: [X] minutes. Tone: [TONE]. Sound like a real person opening it for the first time — curiosity over polish.",
  ].join("\n"),
};

export interface RunResult {
  ok: boolean;
  values?: { template: string };
  error?: string;
}

/** Normalize the video type against the fixed list (case-insensitive). */
export function normalizeVideoType(value: unknown): VideoType | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  const found = (VIDEO_TYPES as readonly string[]).find((t) => t === v);
  return (found as VideoType | undefined) ?? null;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const videoType = normalizeVideoType(values?.videoType);
  if (videoType === null) {
    return {
      ok: false,
      error: `Video type is required. Choose one of: ${VIDEO_TYPES.join(", ")}.`,
    };
  }
  return { ok: true, values: { template: SCRIPT_PROMPT_TEMPLATES[videoType] } };
}
