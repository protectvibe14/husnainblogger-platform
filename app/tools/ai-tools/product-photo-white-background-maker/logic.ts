/**
 * logic.ts — Product Photo White Background Maker (tool-513), Lane A.
 *
 * PURE module: zero imports (no node:, no DOM, no fetch, no relative imports).
 * Validates the image descriptor + output format; carries the verified
 * RMBG-1.4 model metadata. Output is a fixed 2000×2000 pure-white canvas.
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
  width?: number;
  height?: number;
}

/** Max upload size the client accepts. */
export const MAX_FILE_MB = 20;
/** Sanity cap on input resolution (pixels per side). */
export const MAX_DIMENSION_PX = 4096;
/** Fixed output canvas size (square, marketplace-ready). */
export const OUTPUT_PX = 2000;

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const FORMATS = ['jpg', 'png'] as const;
export type OutputFormat = (typeof FORMATS)[number];

export function getAllowedMimes(): ReadonlyArray<string> {
  return ALLOWED_MIMES;
}

export function getOutputFormat(v: unknown): OutputFormat | null {
  return (FORMATS as readonly string[]).includes(v as string) ? (v as OutputFormat) : null;
}

export function validateInputs(inputs: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const file = inputs.file as FileDescriptor | undefined;

  if (!file || typeof file !== 'object') {
    errors.push('Choose a product photo first.');
  } else {
    const mime = typeof file.mimeType === 'string' ? file.mimeType : '';
    if (!ALLOWED_MIMES.includes(mime)) {
      errors.push('That file type is not supported. Use JPG, PNG, WEBP or GIF.');
    }
    const sizeBytes = typeof file.sizeBytes === 'number' ? file.sizeBytes : Number.NaN;
    if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
      errors.push('Could not read the file size — try choosing the file again.');
    } else if (sizeBytes > MAX_FILE_MB * 1024 * 1024) {
      errors.push('The photo is too large. Keep it under ' + MAX_FILE_MB + ' MB.');
    }
    const width = typeof file.width === 'number' ? file.width : Number.NaN;
    const height = typeof file.height === 'number' ? file.height : Number.NaN;
    if (Number.isFinite(width) && Number.isFinite(height)) {
      if (width > MAX_DIMENSION_PX || height > MAX_DIMENSION_PX) {
        errors.push(
          'The photo is ' + Math.round(width) + '×' + Math.round(height) +
            ' px — resize it to ' + MAX_DIMENSION_PX + ' px per side or smaller first.',
        );
      }
    }
  }

  if (!getOutputFormat(inputs.format)) {
    errors.push('Pick an output format (JPG or PNG).');
  }

  return { ok: errors.length === 0, errors };
}

export function getModelConfig(): ModelConfig {
  return {
    task: 'image-segmentation',
    modelId: 'briaai/RMBG-1.4',
    sizeMb: 176,
    license: 'BRIA — source-available, non-commercial (check BRIA\u2019s license for commercial use)',
    notes: 'Foreground mask applied over a pure-white 2000×2000 canvas, composited in-browser.',
  };
}

export function getDisclosures(): string[] {
  return [
    'Check BRIA\u2019s license for commercial use — RMBG-1.4 is source-available for non-commercial use; commercial use needs a BRIA agreement.',
    'The model downloads once (~44 MB) and is cached in your browser; after that, everything runs 100% on your device.',
    'Your photo never leaves your browser — no uploads, no servers.',
    'Output is a fixed 2000×2000 px white-background square — the AI mask is an estimate, so check edges before publishing.',
  ];
}
