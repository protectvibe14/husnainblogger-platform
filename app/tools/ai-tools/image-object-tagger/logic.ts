/**
 * Image Object Tagger — pure config/validation (tool-541), zero imports,
 * zero network, zero DOM.
 *
 * Inference runs in client.ts via Transformers.js
 * (pipeline "image-classification" with Xenova/vit-base-patch16-224) 100%
 * on-device. Verified 2026-10-01: Xenova/vit-base-patch16-224 IS the
 * default image-classification model in the transformers.js task list, and
 * the @huggingface/transformers port ships it for that task — so we use the
 * real classifier path, no heuristics fallback.
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
/** Number of top labels shown. */
export const TOP_K = 8;

export function getModelConfig(): AiModelInfo {
  return {
    id: "Xenova/vit-base-patch16-224",
    task: "image-classification",
    sizeMb: 70,
    license: "Apache-2.0 (Google)",
    notes: "ImageNet-1k labels (1,000 everyday object classes)",
  };
}

export function getDisclosures(): string[] {
  return [
    "Runs 100% in your browser — your image is never uploaded anywhere.",
    "Downloads ~70 MB of model weights once, then works offline.",
    "Labels come from 1,000 everyday ImageNet classes — unusual objects get the nearest generic label.",
    "Scores are model confidence, not certainty — the top label can be wrong.",
  ];
}

export const HEADLINE =
  "Tag the objects in any photo with an on-device image classifier — no uploads, no API key.";

/** One ranked label from the classifier. */
export interface Tag {
  label: string;
  score: number;
}

/**
 * Normalize raw classifier output into TOP_K tags sorted by score desc.
 * Accepts the transformers.js shape: [{label, score}, ...].
 * Pure and deterministic.
 */
export function normalizeTags(raw: unknown, topK: number = TOP_K): Tag[] {
  if (!Array.isArray(raw)) return [];
  const tags: Tag[] = [];
  for (const item of raw) {
    if (
      item !== null &&
      typeof item === "object" &&
      typeof (item as { label?: unknown }).label === "string" &&
      typeof (item as { score?: unknown }).score === "number"
    ) {
      const score = (item as { score: number }).score;
      if (Number.isFinite(score) && score >= 0) {
        tags.push({ label: (item as { label: string }).label, score });
      }
    }
  }
  tags.sort((a, b) => b.score - a.score);
  return tags.slice(0, topK);
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
