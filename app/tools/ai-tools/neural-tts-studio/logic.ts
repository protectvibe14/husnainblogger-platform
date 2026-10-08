/**
 * logic.ts — Neural TTS Studio (tool-507), Lane A.
 *
 * PURE module: zero imports (no node:, no DOM, no fetch, no relative imports).
 * Input validation + model metadata for the client module. All synthesis
 * happens in the browser via kokoro-js; this file only validates the inputs
 * that reach it.
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

/** Studio text limits (characters). */
export const TEXT_MIN_CHARS = 1;
export const TEXT_MAX_CHARS = 5000;

/** Speed slider bounds. */
export const SPEED_MIN = 0.5;
export const SPEED_MAX = 2.0;

/**
 * Verified Kokoro voice IDs offered by the studio. Verified 2026-10-01
 * against the Kokoro v1.0 voice catalog (hexgrad/Kokoro-82M VOICES.md and
 * kokoro-js integrations). Only these voices are listed in the UI.
 */
export const KOKORO_VOICES: ReadonlyArray<{ id: string; label: string }> = [
  { id: 'af_bella', label: 'Bella — American female' },
  { id: 'af_nicole', label: 'Nicole — American female' },
  { id: 'af_sarah', label: 'Sarah — American female' },
  { id: 'af_sky', label: 'Sky — American female' },
  { id: 'am_adam', label: 'Adam — American male' },
  { id: 'am_michael', label: 'Michael — American male' },
  { id: 'bf_emma', label: 'Emma — British female' },
  { id: 'bf_isabella', label: 'Isabella — British female' },
  { id: 'bm_george', label: 'George — British male' },
  { id: 'bm_lewis', label: 'Lewis — British male' },
];

export function isKnownVoice(voice: unknown): voice is string {
  return typeof voice === 'string' && KOKORO_VOICES.some((v) => v.id === voice);
}

export function validateInputs(inputs: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  const text = typeof inputs.text === 'string' ? inputs.text : '';
  const trimmed = text.trim();
  if (trimmed.length < TEXT_MIN_CHARS) {
    errors.push('Enter some text to speak (at least 1 character).');
  } else if (trimmed.length > TEXT_MAX_CHARS) {
    errors.push(
      'Text is too long (' +
        trimmed.length.toLocaleString('en-US') +
        ' characters). Keep it under ' +
        TEXT_MAX_CHARS.toLocaleString('en-US') +
        ' characters.',
    );
  }

  if (!isKnownVoice(inputs.voice)) {
    errors.push('Pick one of the listed voices.');
  }

  const speed = typeof inputs.speed === 'number' ? inputs.speed : Number.NaN;
  if (!Number.isFinite(speed) || speed < SPEED_MIN || speed > SPEED_MAX) {
    errors.push('Speed must be between ' + SPEED_MIN + ' and ' + SPEED_MAX + '.');
  }

  return { ok: errors.length === 0, errors };
}

export function getModelConfig(): ModelConfig {
  return {
    task: 'text-to-speech',
    modelId: 'onnx-community/Kokoro-82M-v1.0-ONNX',
    dtype: 'q8',
    sizeMb: 86,
    license: 'Apache-2.0 (Kokoro-82M; ONNX weights via onnx-community)',
    notes: '10 verified English voices (US + UK); ~86 MB one-time download, then fully offline.',
  };
}

export function getDisclosures(): string[] {
  return [
    'The ~86 MB voice model downloads once and is cached in your browser; after that, speech is generated 100% on your device.',
    'No text is ever uploaded — everything runs locally on your computer or phone.',
    'Long text is synthesized in chunks; generation time grows with text length.',
    'Speed depends on your device — WebGPU browsers (Chrome/Edge 113+) are fastest; other browsers fall back to CPU.',
  ];
}
