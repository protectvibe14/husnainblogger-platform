/**
 * Video Scene Planner — pure logic (tool-523), zero imports, zero network,
 * zero DOM.
 *
 * HONESTY CONTRACT: this is fixed arithmetic plus hand-written template
 * banks. It does NOT generate video, does NOT call any video tool, and no
 * AI model is involved. Scene narration lines are template sentences that
 * insert your (sanitized) video idea — they are placeholders to rewrite in
 * your own words, not a finished script.
 *
 * Template banks (documented sizes):
 *  - SHOT_TYPES: 8 entries   -> cycled per scene for the visual prompt
 *  - NARRATION_TEMPLATES: 8 entries -> cycled per scene, "{idea}" replaced
 */

export interface ScenePlan {
  scene: number;
  visualPrompt: string;
  narration: string;
  durationSec: number;
}

/** 8 shot types, cycled across scenes. */
export const SHOT_TYPES: string[] = [
  "Wide establishing shot",
  "Medium shot",
  "Close-up detail shot",
  "Overhead top-down shot",
  "Slow push-in shot",
  "Side profile shot",
  "Text overlay card",
  "Split-screen comparison",
];

/** 8 narration templates; "{idea}" is replaced with the video idea. */
export const NARRATION_TEMPLATES: string[] = [
  "Open with a hook that introduces {idea}.",
  "State the single biggest benefit of {idea}.",
  "Walk through the first key step of {idea}.",
  "Show a concrete example of {idea} in action.",
  "Address the most common question about {idea}.",
  "Reveal the part of {idea} most people miss.",
  "Recap why {idea} is worth trying.",
  "Close with a clear call to action about {idea}.",
];

export const MIN_SCENES = 2;
export const MAX_SCENES = 12;
export const MIN_LENGTH_SEC = 5;
export const MAX_LENGTH_SEC = 600;
export const MAX_IDEA_LENGTH = 200;

export function sanitizeIdea(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\bwww\.\S+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateIdea(idea: string, max = 120): string {
  if (idea.length <= max) return idea;
  return idea.slice(0, max).trimEnd() + "...";
}

/**
 * Split total seconds across `count` scenes: floor division, with the
 * leftover seconds dealt one-per-scene starting at scene 1.
 * Guarantees the parts sum exactly to `total`.
 */
export function splitDurations(total: number, count: number): number[] {
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  return Array.from({ length: count }, (_, i) =>
    i < remainder ? base + 1 : base,
  );
}

/**
 * Build the scene plan deterministically. Same inputs -> same plan.
 */
export function planScenes(
  idea: string,
  targetLengthSec: number,
  sceneCount: number,
): { scenes: ScenePlan[]; totalSec: number } {
  const ideaShort = truncateIdea(idea);
  const durations = splitDurations(targetLengthSec, sceneCount);
  const scenes: ScenePlan[] = durations.map((durationSec, i) => {
    const shot = SHOT_TYPES[i % SHOT_TYPES.length];
    const narration = NARRATION_TEMPLATES[i % NARRATION_TEMPLATES.length].replace(
      "{idea}",
      ideaShort,
    );
    return {
      scene: i + 1,
      visualPrompt: `${shot}: ${ideaShort}`,
      narration,
      durationSec,
    };
  });
  return { scenes, totalSec: targetLengthSec };
}

function parseLength(raw: unknown): number | null {
  if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
  const sec = Math.round(raw);
  if (sec < MIN_LENGTH_SEC || sec > MAX_LENGTH_SEC) return null;
  return sec;
}

function parseSceneCount(raw: unknown): number | null {
  if (typeof raw !== "number" || !Number.isFinite(raw) || !Number.isInteger(raw))
    return null;
  const n = raw;
  if (n < MIN_SCENES || n > MAX_SCENES) return null;
  return n;
}

/**
 * Tool entry point (matches the platform ToolRunFn contract).
 * values.videoIdea: string, required, 2-200 chars after sanitization.
 * values.targetLengthSec: number, 5-600. values.sceneCount: number, 2-12.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawIdea = values["videoIdea"];
  if (rawIdea === undefined || rawIdea === null || rawIdea === "") {
    return { ok: false, error: "Please enter your video idea." };
  }
  if (typeof rawIdea !== "string") {
    return { ok: false, error: "Video idea must be text." };
  }
  const idea = sanitizeIdea(rawIdea);
  if (idea.length < 2) {
    return { ok: false, error: "Video idea must be at least 2 characters long." };
  }
  if (idea.length > MAX_IDEA_LENGTH) {
    return {
      ok: false,
      error: `Video idea must be ${MAX_IDEA_LENGTH} characters or fewer.`,
    };
  }

  const length = parseLength(values["targetLengthSec"]);
  if (length === null) {
    return {
      ok: false,
      error: `Target length must be a number between ${MIN_LENGTH_SEC} and ${MAX_LENGTH_SEC} seconds.`,
    };
  }
  const count = parseSceneCount(values["sceneCount"]);
  if (count === null) {
    return {
      ok: false,
      error: `Scene count must be a whole number between ${MIN_SCENES} and ${MAX_SCENES}.`,
    };
  }
  if (length < count) {
    return {
      ok: false,
      error: `Target length must be at least ${count} seconds so every scene gets 1+ second.`,
    };
  }

  const { scenes, totalSec } = planScenes(idea, length, count);
  return {
    ok: true,
    values: {
      scenes,
      totalSec,
      sceneCount: scenes.length,
    },
  };
}
