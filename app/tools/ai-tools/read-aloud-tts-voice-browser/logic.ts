/**
 * logic.ts — Read-Aloud TTS (tool-512), Lane A.
 *
 * PURE module: zero imports (no node:, no DOM, no fetch, no relative imports).
 * This tool uses the browser's built-in Web Speech API — there is NO model.
 * getModelConfig describes the "browser-native" engine honestly so the
 * contract is satisfied without inventing a model identity.
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

/** Max characters per read-aloud run. */
export const MAX_TEXT_CHARS = 5000;
/** Valid SpeechSynthesis rate/pitch ranges. */
export const RATE_MIN = 0.5;
export const RATE_MAX = 2;
export const PITCH_MIN = 0;
export const PITCH_MAX = 2;

export function validateInputs(inputs: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  const text = inputs.text;
  if (typeof text !== 'string' || !text.trim()) {
    errors.push('Enter some text to read aloud.');
  } else if (text.length > MAX_TEXT_CHARS) {
    errors.push(
      'The text is ' + text.length + ' characters — keep it under ' + MAX_TEXT_CHARS + ' characters.',
    );
  }

  const rate = inputs.rate;
  if (rate !== undefined && (typeof rate !== 'number' || !Number.isFinite(rate) || rate < RATE_MIN || rate > RATE_MAX)) {
    errors.push('Rate must be between ' + RATE_MIN + ' and ' + RATE_MAX + '.');
  }

  const pitch = inputs.pitch;
  if (pitch !== undefined && (typeof pitch !== 'number' || !Number.isFinite(pitch) || pitch < PITCH_MIN || pitch > PITCH_MAX)) {
    errors.push('Pitch must be between ' + PITCH_MIN + ' and ' + PITCH_MAX + '.');
  }

  return { ok: errors.length === 0, errors };
}

export function getModelConfig(): ModelConfig {
  return {
    task: 'text-to-speech',
    modelId: 'browser-native:window.speechSynthesis',
    sizeMb: 0,
    license: 'Device voices (provided by the visitor\u2019s OS/browser)',
    notes: 'No model is downloaded — speech is synthesized by the browser itself.',
  };
}

export function getDisclosures(): string[] {
  return [
    'Voices come from your device and browser — the list varies by operating system and browser, and quality differs.',
    'No model downloads and no internet is needed once the page loads; nothing is uploaded.',
    'Some browsers limit long utterances; very long text may pause or stop — split it into parts.',
  ];
}
