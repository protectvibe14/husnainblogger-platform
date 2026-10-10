/**
 * logic.ts — AI Background Remover (tool-508), Lane A.
 *
 * PURE module: zero imports (no node:, no DOM, no fetch, no relative imports).
 * Validates the file descriptor the client passes (never the File itself)
 * and carries the verified RMBG-1.4 model metadata.
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

/** Plain descriptor the browser builds from the chosen file. */
export interface FileDescriptor {
  name?: string;
  sizeBytes?: number;
  mimeType?: string;
  /** Natural image dimensions in pixels (when known). */
  width?: number;
  height?: number;
}

/** Max upload size the client accepts (RMBG runs at 1024px internally). */
export const MAX_FILE_MB = 20;
/** Sanity cap on input resolution (pixels per side). */
export const MAX_DIMENSION_PX = 4096;

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function getAllowedMimes(): ReadonlyArray<string> {
  return ALLOWED_MIMES;
}

export function validateInputs(inputs: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const file = inputs.file as FileDescriptor | undefined;

  if (!file || typeof file !== 'object') {
    errors.push('Choose an image file first.');
    return { ok: false, errors };
  }

  const mime = typeof file.mimeType === 'string' ? file.mimeType : '';
  if (!ALLOWED_MIMES.includes(mime)) {
    errors.push('That file type is not supported. Use JPG, PNG, WEBP or GIF.');
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
          ' px — resize it to ' + MAX_DIMENSION_PX + ' px per side or smaller first.',
      );
    }
  }

  return { ok: errors.length === 0, errors };
}

export function getModelConfig(): ModelConfig {
  return {
    task: 'image-segmentation',
    modelId: 'imgdesignart/rmbg-1-4-onnx (RMBG-1.4 ONNX)',
    sizeMb: 44,
    license: 'BRIA — source-available, non-commercial (check BRIA\u2019s license for commercial use)',
    notes: 'ONNX weights run in-browser via onnxruntime-web; one-time download (~44 MB quantized), then fully offline.',
  };
}

export function getDisclosures(): string[] {
  return [
    'Check BRIA\u2019s license for commercial use — RMBG-1.4 is source-available for non-commercial use; commercial use needs a BRIA agreement.',
    'The model downloads once (~44 MB balanced / ~176 MB best quality) and is cached in your browser; after that, removal runs 100% on your device.',
    'Your image never leaves your browser — no uploads, no servers.',
    'Segmentation is AI-estimated: fine hair, fur and glass edges may need manual touch-ups.',
  ];
}
