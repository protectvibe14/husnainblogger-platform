/**
 * TikTok Voiceover Script Formatter — pure logic (tool-175). Zero imports,
 * zero network, zero DOM, zero randomness.
 *
 * FORMATTER ENGINE (pure text formatting; fully feasible):
 *   - Takes a raw voiceover script (one or more paragraphs/lines).
 *   - Splits it into non-empty lines; each non-empty line becomes a numbered
 *     SCENE (Scene 1:, Scene 2:, ...).
 *   - Inserts a "[pause]" marker line between scenes (breathing beats for
 *     the voiceover reader).
 *   - Produces caption-ready lines: each scene is word-wrapped to
 *     <= 42 characters per line (mobile caption readability guidance).
 *   - Computes a stats line: scene count, caption-line count, word count.
 *   - Mixed-language scripts are kept EXACTLY as-is: no translation, no
 *     transliteration, no language claims of any kind.
 *   - This tool NEVER claims AI and never performs text-to-speech.
 */

/** Caption readability guidance: caption lines at or under this many characters. */
export const CAPTION_MAX_CHARS = 42;

/** Pause beat inserted between scenes. */
export const PAUSE_MARKER = "[pause]";

function splitScenes(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function countWords(text: string): number {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  return words.length;
}

/**
 * Word-wrap one scene to lines of at most CAPTION_MAX_CHARS, splitting at
 * word boundaries. A single over-long word is hard-split so the guarantee
 * holds. Returns at least one line for non-empty input.
 */
export function wrapCaption(scene: string): string[] {
  const words = scene.split(/\s+/).filter((w) => w.length > 0);
  const out: string[] = [];
  let current = "";
  for (const word of words) {
    if (word.length > CAPTION_MAX_CHARS) {
      if (current.length > 0) {
        out.push(current);
        current = "";
      }
      for (let i = 0; i < word.length; i += CAPTION_MAX_CHARS) {
        out.push(word.slice(i, i + CAPTION_MAX_CHARS));
      }
      continue;
    }
    const candidate = current.length === 0 ? word : `${current} ${word}`;
    if (candidate.length <= CAPTION_MAX_CHARS) {
      current = candidate;
    } else {
      out.push(current);
      current = word;
    }
  }
  if (current.length > 0) out.push(current);
  return out;
}

export interface VoiceoverResult {
  ok: boolean;
  values?: {
    formattedScript: string;
    captionLines: string[];
    stats: string;
  };
  error?: string;
}

/**
 * Format a raw voiceover script. Deterministic: same script always
 * produces the same formatted output.
 */
export function runTool(values: Record<string, unknown>): VoiceoverResult {
  const raw = values["rawScript"];
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return { ok: false, error: "Please paste your voiceover script first." };
  }
  if (raw.length > 5000) {
    return { ok: false, error: "The script is too long — keep it under 5,000 characters." };
  }

  const scenes = splitScenes(raw);
  if (scenes.length === 0) {
    return { ok: false, error: "Could not find any text lines in the script." };
  }

  const formattedParts: string[] = [];
  const captionLines: string[] = [];
  let wordCount = 0;

  scenes.forEach((scene, index) => {
    formattedParts.push(`Scene ${index + 1}: ${scene}`);
    if (index < scenes.length - 1) formattedParts.push(PAUSE_MARKER);
    captionLines.push(...wrapCaption(scene));
    wordCount += countWords(scene);
  });

  const sceneLabel = scenes.length === 1 ? "scene" : "scenes";
  const captionLabel = captionLines.length === 1 ? "caption line" : "caption lines";
  const wordLabel = wordCount === 1 ? "word" : "words";
  const stats = `${scenes.length} ${sceneLabel} · ${captionLines.length} ${captionLabel} · ${wordCount} ${wordLabel}`;

  return {
    ok: true,
    values: {
      formattedScript: formattedParts.join("\n"),
      captionLines,
      stats,
    },
  };
}
