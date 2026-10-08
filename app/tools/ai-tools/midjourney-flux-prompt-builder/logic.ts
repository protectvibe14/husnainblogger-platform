/**
 * Midjourney + Flux Prompt Builder — pure logic (tool-522), zero imports,
 * zero network, zero DOM.
 *
 * HONESTY CONTRACT: this is a fixed template-bank assembler. It does NOT
 * generate images, does NOT call Midjourney or Flux, and nothing is produced
 * by an AI model. Outputs are deterministic combinations of hand-written
 * style descriptors, detail modifiers and parameter flags. The --ar/--v
 * flags are fixed template text — parameter names can change on Midjourney's
 * side, so check their docs before pasting.
 *
 * Template banks (documented sizes):
 *  - STYLES: 8 entries     -> style descriptor fragment
 *  - DETAILS: 3 entries    -> detail modifier fragment
 *  - ASPECTS: 5 entries    -> --ar value
 *  - LIGHTING_BANK: 6 entries -> deterministic pick by subject length
 */

/** 8 styles -> hand-written descriptor fragment. */
export const STYLES: Record<string, string> = {
  photorealistic:
    "photorealistic, ultra-detailed photograph, 85mm lens, natural textures, realistic lighting",
  cinematic:
    "cinematic film still, dramatic lighting, shallow depth of field, moody color grade",
  anime:
    "anime style, vibrant colors, clean line art, cel shading, studio-quality key visual",
  "3d-render":
    "3D render, octane render, soft studio lighting, high-poly detail, crisp edges",
  "oil-painting":
    "oil painting, visible brushstrokes, rich impasto texture, classical composition",
  watercolor:
    "watercolor painting, soft washes, visible paper texture, delicate pigment blends",
  cyberpunk:
    "cyberpunk aesthetic, neon glow, rain reflections, futuristic haze, high contrast",
  "vintage-photo":
    "vintage photograph, film grain, faded colors, analog camera look, 1970s aesthetic",
};

/** 3 detail levels -> modifier fragment. */
export const DETAILS: Record<string, string> = {
  simple: "simple composition, clean, minimal",
  balanced: "detailed, balanced composition",
  "highly-detailed":
    "hyper-detailed, intricate details, sharp focus, masterpiece quality",
};

/** 5 aspect ratios -> Midjourney --ar value. */
export const ASPECTS: Record<string, string> = {
  "1:1": "1:1",
  "16:9": "16:9",
  "9:16": "9:16",
  "4:3": "4:3",
  "3:2": "3:2",
};

/** 6 lighting fragments; index picked deterministically from subject length. */
export const LIGHTING_BANK: string[] = [
  "soft studio lighting",
  "golden hour light",
  "dramatic rim lighting",
  "natural daylight",
  "soft diffused window light",
  "low-key dramatic lighting",
];

/** Fixed Midjourney version flag used by the template (check docs for current flags). */
export const MIDJOURNEY_VERSION_FLAG = "--v 6";

export const MAX_SUBJECT_LENGTH = 200;

export interface PromptBuildResult {
  subject: string;
  style: string;
  aspect: string;
  detailLevel: string;
  midjourneyPrompt: string;
  midjourneyParams: string;
  fluxPrompt: string;
}

/**
 * Strip HTML tags and URLs, collapse whitespace. Pure string ops — no DOM.
 */
export function sanitizeSubject(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\bwww\.\S+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Validate a select-style input against an allowed-values map.
 * Returns the canonical key or null.
 */
export function validateSelect(
  raw: unknown,
  allowed: Record<string, string>,
): string | null {
  if (typeof raw !== "string") return null;
  const key = raw.trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(allowed, key) ? key : null;
}

/**
 * Deterministically pick a lighting fragment from the subject.
 * Same subject -> same lighting, always.
 */
export function pickLighting(subject: string): string {
  return LIGHTING_BANK[subject.length % LIGHTING_BANK.length];
}

export function buildPrompts(
  subject: string,
  styleKey: string,
  aspectKey: string,
  detailKey: string,
): PromptBuildResult {
  const styleDesc = STYLES[styleKey];
  const detailDesc = DETAILS[detailKey];
  const ar = ASPECTS[aspectKey];
  const lighting = pickLighting(subject);

  const core = `${subject}, ${styleDesc}, ${detailDesc}, ${lighting}`;
  const midjourneyParams = `--ar ${ar} ${MIDJOURNEY_VERSION_FLAG}`;

  // Flux uses plain natural language — no parameters.
  const fluxPrompt =
    `A ${styleKey} image of ${subject}. ` +
    `${detailDesc.charAt(0).toUpperCase()}${detailDesc.slice(1)}. ` +
    `Lighting: ${lighting}. Aspect ratio ${ar}. ` +
    `No text, no watermark.`;

  return {
    subject,
    style: styleKey,
    aspect: aspectKey,
    detailLevel: detailKey,
    midjourneyPrompt: `${core} ${midjourneyParams}`,
    midjourneyParams,
    fluxPrompt,
  };
}

/**
 * Tool entry point (matches the platform ToolRunFn contract).
 * values.subject: string, required, 2-200 chars after sanitization.
 * values.style: one of STYLES keys. values.aspect: one of ASPECTS keys.
 * values.detailLevel: one of DETAILS keys.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawSubject = values["subject"];
  if (rawSubject === undefined || rawSubject === null || rawSubject === "") {
    return { ok: false, error: "Please enter a subject for your image prompt." };
  }
  if (typeof rawSubject !== "string") {
    return { ok: false, error: "Subject must be text." };
  }
  const subject = sanitizeSubject(rawSubject);
  if (subject.length < 2) {
    return { ok: false, error: "Subject must be at least 2 characters long." };
  }
  if (subject.length > MAX_SUBJECT_LENGTH) {
    return {
      ok: false,
      error: `Subject must be ${MAX_SUBJECT_LENGTH} characters or fewer.`,
    };
  }

  const style = validateSelect(values["style"], STYLES);
  if (!style) {
    return {
      ok: false,
      error: `Style must be one of: ${Object.keys(STYLES).join(", ")}.`,
    };
  }
  const aspect = validateSelect(values["aspect"], ASPECTS);
  if (!aspect) {
    return {
      ok: false,
      error: `Aspect ratio must be one of: ${Object.keys(ASPECTS).join(", ")}.`,
    };
  }
  const detail = validateSelect(values["detailLevel"], DETAILS);
  if (!detail) {
    return {
      ok: false,
      error: `Detail level must be one of: ${Object.keys(DETAILS).join(", ")}.`,
    };
  }

  const result = buildPrompts(subject, style, aspect, detail);
  return {
    ok: true,
    values: {
      subject: result.subject,
      style: result.style,
      aspect: result.aspect,
      detailLevel: result.detailLevel,
      midjourneyPrompt: result.midjourneyPrompt,
      midjourneyParams: result.midjourneyParams,
      fluxPrompt: result.fluxPrompt,
    },
  };
}
