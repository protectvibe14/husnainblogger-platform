/**
 * Headshot Prompt Pack Builder — pure logic (tool-529), zero imports, zero
 * network, zero DOM.
 *
 * HONESTY CONTRACT: this builds PROMPT TEXT from fixed templates. It does
 * NOT generate headshots, does NOT call any image tool, and no AI model is
 * involved. You paste the prompts into the image generator of your choice.
 *
 * Template banks (documented sizes):
 *  - STYLES: 4 entries -> style descriptor fragment
 *  - POSE_TEMPLATES: 5 entries -> one prompt per pose (the "pack")
 *  - NEGATIVE_PROMPT: 1 fixed line
 */

/** 4 styles -> descriptor fragment. */
export const STYLES: Record<string, string> = {
  corporate: "clean corporate photography style, neutral color grade",
  creative: "creative editorial style, vibrant color grade",
  studio: "studio portrait, seamless backdrop, softbox lighting",
  outdoor: "natural outdoor light, shallow depth of field",
};

/** 5 fixed poses -> one copy-ready prompt each. */
export const POSE_TEMPLATES: string[] = [
  "confident head-and-shoulders portrait, slight smile, looking at camera",
  "three-quarter turn portrait, arms crossed, assured expression",
  "candid portrait with a natural laugh, relaxed expression",
  "seated portrait, thoughtful pose, chin resting on hand",
  "close-up portrait, soft-focus background, sharp focus on eyes",
];

/** One fixed negative-prompt line used for every prompt in the pack. */
export const NEGATIVE_PROMPT =
  "blurry, distorted face, extra fingers, bad anatomy, cartoon, illustration, watermark, text overlay, oversaturated, harsh shadows";

export const MAX_FIELD_LENGTH = 150;

export interface HeadshotPackResult {
  profession: string;
  style: string;
  prompts: string[];
  negativePrompt: string;
}

export function cleanField(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\bwww\.\S+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function validateStyle(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const key = raw.trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(STYLES, key) ? key : null;
}

/**
 * Deterministically build the 5-prompt pack. Same inputs -> same pack.
 */
export function buildPack(
  profession: string,
  styleKey: string,
  background: string,
  attire: string,
): HeadshotPackResult {
  const styleDesc = STYLES[styleKey];
  const prompts = POSE_TEMPLATES.map(
    (pose) =>
      `Professional headshot of a ${profession}, ${pose}, ${styleDesc}, ` +
      `wearing ${attire}, ${background}, photorealistic, 85mm lens, ` +
      `natural skin texture, sharp focus on eyes`,
  );
  return { profession, style: styleKey, prompts, negativePrompt: NEGATIVE_PROMPT };
}

/**
 * Tool entry point (matches the platform ToolRunFn contract).
 * values.profession/values.background/values.attire: strings, required,
 * 2-150 chars after cleaning. values.style: one of STYLES keys.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const fields: Record<string, string> = {};
  for (const id of ["profession", "background", "attire"] as const) {
    const raw = values[id];
    if (typeof raw !== "string" || cleanField(raw).length < 2) {
      const label = id === "profession" ? "Profession" : id === "background" ? "Background" : "Attire";
      return { ok: false, error: `Please enter the ${label.toLowerCase()} (2+ characters).` };
    }
    const cleaned = cleanField(raw);
    if (cleaned.length > MAX_FIELD_LENGTH) {
      return {
        ok: false,
        error: `Each field must be ${MAX_FIELD_LENGTH} characters or fewer.`,
      };
    }
    fields[id] = cleaned;
  }

  const style = validateStyle(values["style"]);
  if (!style) {
    return {
      ok: false,
      error: `Style must be one of: ${Object.keys(STYLES).join(", ")}.`,
    };
  }

  const r = buildPack(fields["profession"], style, fields["background"], fields["attire"]);
  return {
    ok: true,
    values: {
      prompts: r.prompts,
      promptCount: r.prompts.length,
      negativePrompt: r.negativePrompt,
      profession: r.profession,
      style: r.style,
    },
  };
}
