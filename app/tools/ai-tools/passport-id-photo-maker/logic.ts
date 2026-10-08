/**
 * logic.ts — Passport/ID Photo Maker (tool-514), Lane A.
 *
 * PURE module: zero imports (no node:, no DOM, no fetch, no relative imports).
 * Validates the portrait descriptor + size choice; carries the verified
 * RMBG-1.4 model metadata. Dimensions only — the tool makes no claim about
 * any country's current acceptance rules (see disclosures).
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

export interface PhotoSize {
  /** UI value. */
  id: string;
  label: string;
  /** Output width in px (@300 dpi). */
  width: number;
  /** Output height in px (@300 dpi). */
  height: number;
}

/** Max upload size the client accepts. */
export const MAX_FILE_MB = 20;
/** Sanity cap on input resolution (pixels per side). */
export const MAX_DIMENSION_PX = 4096;

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Official photo dimensions @300 dpi. US 2×2 in = 600×600;
 * UK/Schengen 35×45 mm = 413×531; India 51×51 mm = 602×602.
 * Dimensions only — acceptance rules are NOT encoded here.
 */
export const PHOTO_SIZES: ReadonlyArray<PhotoSize> = [
  { id: 'us', label: 'US — 2×2 in (51×51 mm)', width: 600, height: 600 },
  { id: 'uk', label: 'UK / Schengen — 35×45 mm', width: 413, height: 531 },
  { id: 'india', label: 'India — 51×51 mm', width: 602, height: 602 },
];

export function getAllowedMimes(): ReadonlyArray<string> {
  return ALLOWED_MIMES;
}

export function getPhotoSize(id: unknown): PhotoSize | null {
  return PHOTO_SIZES.find((s) => s.id === id) ?? null;
}

export function validateInputs(inputs: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const file = inputs.file as FileDescriptor | undefined;

  if (!file || typeof file !== 'object') {
    errors.push('Choose a portrait photo first.');
  } else {
    const mime = typeof file.mimeType === 'string' ? file.mimeType : '';
    if (!ALLOWED_MIMES.includes(mime)) {
      errors.push('That file type is not supported. Use JPG, PNG or WEBP.');
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

  if (!getPhotoSize(inputs.size)) {
    errors.push('Pick a photo size (US, UK/Schengen or India).');
  }

  return { ok: errors.length === 0, errors };
}

export function getModelConfig(): ModelConfig {
  return {
    task: 'image-segmentation',
    modelId: 'briaai/RMBG-1.4',
    sizeMb: 176,
    license: 'BRIA — source-available, non-commercial (check BRIA\u2019s license for commercial use)',
    notes: 'Foreground mask composited on a pure-white canvas at the chosen ID-photo dimensions.',
  };
}

export function getDisclosures(): string[] {
  return [
    'Check your country\u2019s official photo requirements — rules change; this tool formats dimensions only and does not guarantee acceptance.',
    'Check BRIA\u2019s license for commercial use — RMBG-1.4 is source-available for non-commercial use; commercial use needs a BRIA agreement.',
    'The model downloads once (~44 MB) and is cached in your browser; after that, everything runs 100% on your device.',
    'Your photo never leaves your browser — no uploads, no servers.',
  ];
}
