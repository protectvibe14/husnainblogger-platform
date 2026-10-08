/**
 * AI Image Captioner & Alt Text — pure config/validation (tool-540), zero
 * imports, zero network, zero DOM.
 *
 * Inference runs in client.ts via Transformers.js
 * (pipeline "image-to-text" with Xenova/vit-gpt2-image-captioning) 100%
 * on-device. This module only declares the model + disclosures, validates
 * the upload, and provides the pure alt-text truncation helper.
 */

/** Local re-declaration (zero-import rule); mirrors lib/ai/types.ts. */
export interface AiModelInfo {
  id: string;
  task: string;
  sizeMb: number;
  license: string;
  dtype?: string;
  notes?: string;
}

export const MAX_FILE_MB = 25;
/** SEO best practice: keep alt text at or under this many characters. */
export const ALT_MAX_CHARS = 125;

export function getModelConfig(): AiModelInfo {
  return {
    id: "Xenova/vit-gpt2-image-captioning",
    task: "image-to-text",
    sizeMb: 350,
    license: "Apache-2.0 (nlpconnect)",
    notes: "ViT encoder + GPT-2 decoder, generic captions",
  };
}

export function getDisclosures(): string[] {
  return [
    "Runs 100% in your browser — your image is never uploaded anywhere.",
    "Downloads ~350 MB of model weights once, then works offline.",
    "Captions are generic model guesses — they can miss details or misidentify objects.",
    "Alt text is truncated to 125 characters per SEO best practice; always review it before publishing.",
  ];
}

export const HEADLINE =
  "Generate an image caption and SEO-friendly alt text with an on-device captioning model — no uploads, no API key.";

/**
 * Trim a caption to SEO-friendly alt text: at most ALT_MAX_CHARS, cut at a
 * word boundary, single sentence. Pure and deterministic.
 */
export function toAltText(caption: string): string {
  let text = caption.trim().replace(/\s+/g, " ");
  // Drop a trailing period for alt-text style; keep it readable.
  if (text.length <= ALT_MAX_CHARS) return text;
  const cut = text.slice(0, ALT_MAX_CHARS);
  const lastSpace = cut.lastIndexOf(" ");
  text = (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim();
  return text.replace(/[.,;:!?]+$/, "");
}

/**
 * Validate the upload descriptor the client passes in.
 * values.fileName: string, required. values.fileSizeMb: number, <= MAX_FILE_MB.
 */
export function validateInputs(values: Record<string, unknown>): {
  ok: boolean;
  error?: string;
} {
  const name = values["fileName"];
  if (typeof name !== "string" || name.trim().length === 0) {
    return { ok: false, error: "Please choose an image file first." };
  }
  const size = values["fileSizeMb"];
  if (typeof size !== "number" || !Number.isFinite(size) || size <= 0) {
    return { ok: false, error: "Could not read the file size — please try another image." };
  }
  if (size > MAX_FILE_MB) {
    return { ok: false, error: `Image is too large — keep it under ${MAX_FILE_MB} MB.` };
  }
  return { ok: true };
}
