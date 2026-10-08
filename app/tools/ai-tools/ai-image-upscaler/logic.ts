/**
 * logic.ts — AI Image Upscaler (tool-509), Lane A.
 *
 * PURE module: zero imports (no node:, no DOM, no fetch, no relative imports).
 * Validates the image descriptor + scale choice, and carries the verified
 * Swin2SR model metadata. Both scale models were verified on huggingface.co
 * on 2026-10-01 (pipeline_tag: image-to-image, transformers.js, not gated).
 */

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export interface ModelConfig {
  task: string;
  modelId: string;
  dtype?: string;
  sizeMb?: number;
  license: string;
  notes?: string;
}

export interface ScaleOption {
  /** UI value, e.g. "2x". */
  id: string;
  label: string;
  modelId: string;
  /** Verified fp32 ONNX weight size (MB). */
  sizeMb: number;
}

/** Plain descriptor the browser builds from the chosen file. */
export interface FileDescriptor {
  name?: string;
  sizeBytes?: number;
  mimeType?: string;
  width?: number;
  height?: number;
}

/** Max upload size the client accepts. */
export const MAX_FILE_MB = 20;
/**
 * Max input resolution per side. The client downscales larger images to this
 * first — on-device super-resolution of huge images takes too long on
 * typical devices. Stated in the UI and disclosures.
 */
export const MAX_DIMENSION_PX = 1024;

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

/** Verified 2026-10-01 via the Hugging Face model API (onnx/model.onnx sizes). */
export const SCALE_OPTIONS: ReadonlyArray<ScaleOption> = [
  {
    id: '2x',
    label: '2x upscale',
    modelId: 'Xenova/swin2SR-classical-sr-x2-64',
    sizeMb: 52,
  },
  {
    id: '4x',
    label: '4x upscale',
    modelId: 'Xenova/swin2SR-classical-sr-x4-64',
    sizeMb: 53,
  },
];

export function getAllowedMimes(): ReadonlyArray<string> {
  return ALLOWED_MIMES;
}

export function getScaleOption(id: unknown): ScaleOption | null {
  return SCALE_OPTIONS.find((s) => s.id === id) ?? null;
}

export function validateInputs(inputs: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const file = inputs.file as FileDescriptor | undefined;

  if (!file || typeof file !== 'object') {
    errors.push('Choose an image file first.');
  } else {
    const mime = typeof file.mimeType === 'string' ? file.mimeType : '';
    if (!ALLOWED_MIMES.includes(mime)) {
      errors.push('That file type is not supported. Use JPG, PNG or WEBP.');
    }
    const sizeBytes = typeof file.sizeBytes === 'number' ? file.sizeBytes : Number.NaN;
    if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
      errors.push('Could not read the file size — try choosing the file again.');
    } else if (sizeBytes > MAX_FILE_MB * 1024 * 1024) {
      errors.push('The image is too large. Keep it under ' + MAX_FILE_MB + ' MB.');
    }
    const width = typeof file.width === 'number' ? file.width : Number.NaN;
    const height = typeof file.height === 'number' ? file.height : Number.NaN;
    if (Number.isFinite(width) && Number.isFinite(height)) {
      if (width > MAX_DIMENSION_PX || height > MAX_DIMENSION_PX) {
        errors.push(
          'The image is ' + Math.round(width) + '×' + Math.round(height) +
            ' px. This tool upscales images up to ' + MAX_DIMENSION_PX + ' px per side.',
        );
      }
      if (width < 16 || height < 16) {
        errors.push('The image is too small to upscale meaningfully (under 16 px per side).');
      }
    }
  }

  if (!getScaleOption(inputs.scale)) {
    errors.push('Pick an upscale factor (2x or 4x).');
  }

  return { ok: errors.length === 0, errors };
}

export function getModelConfig(): ModelConfig {
  const opt = SCALE_OPTIONS[1];
  return {
    task: 'image-to-image',
    modelId: opt.modelId,
    dtype: 'fp32',
    sizeMb: opt.sizeMb,
    license: 'Apache-2.0 (Swin2SR via Xenova ONNX conversion)',
    notes: 'Classical 4x super-resolution; runs fully in-browser via transformers.js.',
  };
}

export function getDisclosures(): string[] {
  return [
    'Each model downloads once (~52–53 MB) and is cached in your browser; after that, upscaling runs 100% on your device.',
    'Inputs are limited to 1024 px per side — larger images are downscaled first so the browser can finish in reasonable time.',
    'AI upscaling works best on photos; text and fine line-art may look softened rather than sharper.',
    'Your image never leaves your browser — no uploads, no servers.',
  ];
}
