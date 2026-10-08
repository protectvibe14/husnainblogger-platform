/**
 * logic.ts — AI Audio Transcriber (tool-510), Lane A.
 *
 * PURE module: zero imports (no node:, no DOM, no fetch, no relative imports).
 * Validates the audio descriptor + model choice, and carries the verified
 * Whisper model metadata (both verified on huggingface.co on 2026-10-01:
 * transformers.js-compatible, apache-2.0).
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

export interface ModelOption {
  /** UI value. */
  id: string;
  label: string;
  modelId: string;
  /** Verified weight size (MB). */
  sizeMb: number;
}

/** Plain descriptor the browser builds from the chosen file. */
export interface FileDescriptor {
  name?: string;
  sizeBytes?: number;
  mimeType?: string;
}

/** Max audio upload size the client accepts. */
export const MAX_FILE_MB = 25;

const ALLOWED_MIMES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/mp4',
  'audio/aac',
  'audio/ogg',
  'audio/webm',
  'audio/flac',
  'audio/x-m4a',
];

/** Verified 2026-10-01 via the Hugging Face model API. */
export const MODEL_OPTIONS: ReadonlyArray<ModelOption> = [
  {
    id: 'tiny',
    label: 'Tiny — ~39 MB, fast',
    modelId: 'Xenova/whisper-tiny',
    sizeMb: 39,
  },
  {
    id: 'base',
    label: 'Base — ~74 MB, more accurate',
    modelId: 'Xenova/whisper-base',
    sizeMb: 74,
  },
];

export function getAllowedMimes(): ReadonlyArray<string> {
  return ALLOWED_MIMES;
}

export function getModelOption(id: unknown): ModelOption | null {
  return MODEL_OPTIONS.find((m) => m.id === id) ?? null;
}

export function validateInputs(inputs: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const file = inputs.file as FileDescriptor | undefined;

  if (!file || typeof file !== 'object') {
    errors.push('Choose an audio file first.');
  } else {
    const mime = typeof file.mimeType === 'string' ? file.mimeType : '';
    if (!ALLOWED_MIMES.includes(mime)) {
      errors.push('That file type is not supported. Use MP3, WAV, M4A, OGG, WEBM or FLAC audio.');
    }
    const sizeBytes = typeof file.sizeBytes === 'number' ? file.sizeBytes : Number.NaN;
    if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
      errors.push('Could not read the file size — try choosing the file again.');
    } else if (sizeBytes > MAX_FILE_MB * 1024 * 1024) {
      errors.push('The audio is too large. Keep it under ' + MAX_FILE_MB + ' MB.');
    }
  }

  if (!getModelOption(inputs.model)) {
    errors.push('Pick a transcription model (Tiny or Base).');
  }

  return { ok: errors.length === 0, errors };
}

export function getModelConfig(): ModelConfig {
  const opt = MODEL_OPTIONS[0];
  return {
    task: 'automatic-speech-recognition',
    modelId: opt.modelId,
    sizeMb: opt.sizeMb,
    license: 'Apache-2.0 (Whisper via Xenova ONNX conversion)',
    notes:
      'Tiny model: English speech-to-text run in 30 s chunks with 5 s stride; audio decoded to 16 kHz in-browser.',
  };
}

export function getDisclosures(): string[] {
  return [
    'Each model downloads once (~39 MB tiny / ~74 MB base) and is cached in your browser; after that, transcription runs 100% on your device.',
    'Tiny and Base are small Whisper models — they transcribe clear English speech well but struggle with heavy accents, music, overlapping voices and low-quality recordings.',
    'Your audio never leaves your browser — no uploads, no servers.',
  ];
}
