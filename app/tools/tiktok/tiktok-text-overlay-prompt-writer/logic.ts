/**
 * TikTok Text Overlay Prompt Writer — pure logic (tool-172). Zero imports,
 * zero network, zero DOM, zero randomness.
 *
 * TEMPLATE ENGINE (text templates + readability rules; does not render):
 *   - Takes a scene description and a video topic.
 *   - Splits the description into sentences deterministically.
 *   - The first sentence becomes the HOOK line; the rest become BEAT lines.
 *   - Every output line is wrapped to <= 42 characters (mobile readability
 *     guidance — a rule of thumb, NOT a TikTok rule).
 *   - Long sentences are split into two lines with a "[pause]" beat between
 *     them (edge case from spec).
 *   - A single over-long word is hard-split so the 42-char guarantee holds.
 *   - Safe-zone guidance in copy is advisory text; this tool never renders
 *     anything on a video frame and never claims AI.
 */

/** Mobile readability guidance: keep on-screen lines at or under this many characters. */
export const MAX_LINE_CHARS = 42;

/** Pause beat inserted when one sentence is split across two lines. */
export const PAUSE_MARKER = "[pause]";

/** Advisory safe-zone text included in the copy-all output (guidance only, not a render). */
export const SAFE_ZONE_GUIDANCE =
  "Guidance: keep text in the middle of the frame — TikTok's UI covers the top and bottom edges.";

function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?…]+[.!?…]?/g);
  if (!parts) return [];
  return parts.map((s) => s.trim()).filter((s) => s.length > 0);
}

/**
 * Wrap one sentence to lines of at most MAX_LINE_CHARS, splitting at word
 * boundaries. A single word longer than the limit is hard-split so the
 * guarantee holds. Returns at least one line for non-empty input.
 */
export function wrapLine(line: string): string[] {
  const words = line.split(/\s+/).filter((w) => w.length > 0);
  const out: string[] = [];
  let current = "";
  for (const word of words) {
    if (word.length > MAX_LINE_CHARS) {
      if (current.length > 0) {
        out.push(current);
        current = "";
      }
      for (let i = 0; i < word.length; i += MAX_LINE_CHARS) {
        out.push(word.slice(i, i + MAX_LINE_CHARS));
      }
      continue;
    }
    const candidate = current.length === 0 ? word : `${current} ${word}`;
    if (candidate.length <= MAX_LINE_CHARS) {
      current = candidate;
    } else {
      out.push(current);
      current = word;
    }
  }
  if (current.length > 0) out.push(current);
  return out;
}

export interface OverlayResult {
  ok: boolean;
  values?: {
    hookLine: string;
    beatLines: string[];
    copyAll: string;
  };
  error?: string;
}

/**
 * Build on-screen text lines from a scene description. Deterministic:
 * same inputs always produce the same lines.
 */
export function runTool(values: Record<string, unknown>): OverlayResult {
  const rawScene = values["sceneDescription"];
  if (typeof rawScene !== "string" || rawScene.trim().length === 0) {
    return { ok: false, error: "Please describe the scene in the video first." };
  }
  const sceneDescription = rawScene.trim();
  if (sceneDescription.length > 2000) {
    return { ok: false, error: "The scene description is too long — keep it under 2,000 characters." };
  }

  const rawTopic = values["videoTopic"];
  if (typeof rawTopic !== "string" || rawTopic.trim().length === 0) {
    return { ok: false, error: "Please enter the video topic as well." };
  }
  const videoTopic = rawTopic.trim();
  if (videoTopic.length > 100) {
    return { ok: false, error: "The video topic is too long — keep it under 100 characters." };
  }

  const sentences = splitSentences(sceneDescription);
  if (sentences.length === 0) {
    return { ok: false, error: "Could not find any text in the scene description." };
  }

  const chunks: string[][] = sentences.map(wrapLine);

  // First sentence -> hook line (first chunk). Leftover hook chunks join the beats.
  const hookLine = chunks[0][0];
  const beatLines: string[] = [];

  const pushChunks = (lines: string[]) => {
    for (let i = 0; i < lines.length; i++) {
      beatLines.push(lines[i]);
      // Edge case: a long sentence split into two+ lines gets a pause beat
      // between the parts.
      if (i < lines.length - 1) beatLines.push(PAUSE_MARKER);
    }
  };

  if (chunks[0].length > 1) pushChunks(chunks[0].slice(1));
  for (let s = 1; s < chunks.length; s++) pushChunks(chunks[s]);

  const copyAll = [
    `TOPIC: ${videoTopic}`,
    `HOOK: ${hookLine}`,
    "BEATS:",
    ...beatLines,
    "",
    SAFE_ZONE_GUIDANCE,
  ].join("\n");

  return {
    ok: true,
    values: { hookLine, beatLines, copyAll },
  };
}
