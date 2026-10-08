/**
 * OCR Text Extractor — pure config/validation (tool-538), zero imports,
 * zero network, zero DOM.
 *
 * The actual inference runs in client.ts via Transformers.js
 * (pipeline "image-to-text" with Xenova/trocr-small-printed) 100% on-device.
 * This module only declares the model, the disclosures, and input
 * validation so the logic stays unit-testable in Node.
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

/** Max upload size in MB enforced by the client. */
export const MAX_FILE_MB = 25;

export function getModelConfig(): AiModelInfo {
  return {
    id: "Xenova/trocr-small-printed",
    task: "image-to-text",
    sizeMb: 120,
    license: "Apache-2.0 (Microsoft)",
    notes: "Printed text, line-level OCR",
  };
}

export function getDisclosures(): string[] {
  return [
    "Runs 100% in your browser — your image is never uploaded anywhere.",
    "Downloads ~120 MB of model weights once, then works offline.",
    "Printed text only — handwriting, stylized fonts and complex layouts give poor results.",
    "Line-level model: crop dense documents to a few lines at a time for best results.",
  ];
}

export const HEADLINE =
  "Extract printed text from any image with an on-device OCR model — no uploads, no API key.";

/**
 * Validate the upload descriptor the client passes in.
 * values.fileName: string, required. values.fileSizeMb: number, required, <= MAX_FILE_MB.
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
    return {
      ok: false,
      error: `Image is too large — keep it under ${MAX_FILE_MB} MB.`,
    };
  }
  return { ok: true };
}
