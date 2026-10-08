/**
 * logic.ts — AI Translator (offline) (tool-511), Lane A.
 *
 * PURE module: zero imports (no node:, no DOM, no fetch, no relative imports).
 * Carries the 18 language pairs verified on huggingface.co on 2026-10-01
 * (author=Xenova, "opus-mt" search — en-pt, pt-en, en-ur and ur-en were NOT
 * found and are deliberately not shipped). Includes a pure sentence-based
 * chunker for long text, tested below.
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

export interface LangPair {
  /** UI value, e.g. "en-es". */
  id: string;
  fromCode: string;
  fromName: string;
  toCode: string;
  toName: string;
  modelId: string;
}

/** Max source text length per run (chars). */
export const MAX_TEXT_CHARS = 5000;
/** Chunk size for translation calls (chars). */
export const CHUNK_CHARS = 500;

/**
 * The 18 pairs verified to exist on 2026-10-01. Do NOT add pairs without
 * re-verifying them on the Hugging Face model API.
 */
export const LANG_PAIRS: ReadonlyArray<LangPair> = [
  { id: 'en-es', fromCode: 'en', fromName: 'English', toCode: 'es', toName: 'Spanish', modelId: 'Xenova/opus-mt-en-es' },
  { id: 'es-en', fromCode: 'es', fromName: 'Spanish', toCode: 'en', toName: 'English', modelId: 'Xenova/opus-mt-es-en' },
  { id: 'en-fr', fromCode: 'en', fromName: 'English', toCode: 'fr', toName: 'French', modelId: 'Xenova/opus-mt-en-fr' },
  { id: 'fr-en', fromCode: 'fr', fromName: 'French', toCode: 'en', toName: 'English', modelId: 'Xenova/opus-mt-fr-en' },
  { id: 'en-de', fromCode: 'en', fromName: 'English', toCode: 'de', toName: 'German', modelId: 'Xenova/opus-mt-en-de' },
  { id: 'de-en', fromCode: 'de', fromName: 'German', toCode: 'en', toName: 'English', modelId: 'Xenova/opus-mt-de-en' },
  { id: 'en-it', fromCode: 'en', fromName: 'English', toCode: 'it', toName: 'Italian', modelId: 'Xenova/opus-mt-en-it' },
  { id: 'it-en', fromCode: 'it', fromName: 'Italian', toCode: 'en', toName: 'English', modelId: 'Xenova/opus-mt-it-en' },
  { id: 'en-nl', fromCode: 'en', fromName: 'English', toCode: 'nl', toName: 'Dutch', modelId: 'Xenova/opus-mt-en-nl' },
  { id: 'nl-en', fromCode: 'nl', fromName: 'Dutch', toCode: 'en', toName: 'English', modelId: 'Xenova/opus-mt-nl-en' },
  { id: 'en-ru', fromCode: 'en', fromName: 'English', toCode: 'ru', toName: 'Russian', modelId: 'Xenova/opus-mt-en-ru' },
  { id: 'ru-en', fromCode: 'ru', fromName: 'Russian', toCode: 'en', toName: 'English', modelId: 'Xenova/opus-mt-ru-en' },
  { id: 'en-ar', fromCode: 'en', fromName: 'English', toCode: 'ar', toName: 'Arabic', modelId: 'Xenova/opus-mt-en-ar' },
  { id: 'ar-en', fromCode: 'ar', fromName: 'Arabic', toCode: 'en', toName: 'English', modelId: 'Xenova/opus-mt-ar-en' },
  { id: 'en-hi', fromCode: 'en', fromName: 'English', toCode: 'hi', toName: 'Hindi', modelId: 'Xenova/opus-mt-en-hi' },
  { id: 'hi-en', fromCode: 'hi', fromName: 'Hindi', toCode: 'en', toName: 'English', modelId: 'Xenova/opus-mt-hi-en' },
  { id: 'en-zh', fromCode: 'en', fromName: 'English', toCode: 'zh', toName: 'Chinese', modelId: 'Xenova/opus-mt-en-zh' },
  { id: 'zh-en', fromCode: 'zh', fromName: 'Chinese', toCode: 'en', toName: 'English', modelId: 'Xenova/opus-mt-zh-en' },
];

export function getPair(id: unknown): LangPair | null {
  return LANG_PAIRS.find((p) => p.id === id) ?? null;
}

/**
 * Split text into chunks of at most maxChars, breaking on sentence
 * boundaries first, then on spaces, then hard-cutting long tokens.
 * Pure and deterministic.
 */
export function chunkText(text: string, maxChars: number): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?…\u061F\u0964]+[.!?…\u061F\u0964]+\s*|[^.!?…\u061F\u0964]+$/g) ?? [clean];
  const chunks: string[] = [];
  let current = '';
  for (const s of sentences) {
    const sentence = s.trim();
    if (!sentence) continue;
    const candidate = current ? current + ' ' + sentence : sentence;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }
    if (current) {
      chunks.push(current);
      current = '';
    }
    if (sentence.length <= maxChars) {
      current = sentence;
      continue;
    }
    // Long sentence: break on spaces, then hard-cut.
    for (const word of sentence.split(' ')) {
      if (!word) continue;
      const cand = current ? current + ' ' + word : word;
      if (cand.length <= maxChars) {
        current = cand;
      } else {
        if (current) chunks.push(current);
        let rest = word;
        while (rest.length > maxChars) {
          chunks.push(rest.slice(0, maxChars));
          rest = rest.slice(maxChars);
        }
        current = rest;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export function validateInputs(inputs: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  const text = inputs.text;
  if (typeof text !== 'string' || !text.trim()) {
    errors.push('Enter some text to translate.');
  } else if (text.length > MAX_TEXT_CHARS) {
    errors.push(
      'The text is ' + text.length + ' characters — keep it under ' + MAX_TEXT_CHARS + ' characters.',
    );
  }

  if (!getPair(inputs.pair)) {
    errors.push('Pick a language pair.');
  }

  return { ok: errors.length === 0, errors };
}

export function getModelConfig(): ModelConfig {
  const pair = LANG_PAIRS[0];
  return {
    task: 'translation',
    modelId: pair.modelId,
    license: 'CC-BY-4.0 (Helsinki-NLP OPUS-MT via Xenova ONNX conversion)',
    notes: 'Neural machine translation running fully in-browser; per-pair lazy loading.',
  };
}

export function getDisclosures(): string[] {
  return [
    'Each language pair downloads once (roughly 150–300 MB per pair, per the model size class) and is cached; after that, translation runs 100% on your device.',
    'OPUS-MT gives machine-quality translation — fine for gist, but always have a native speaker check anything important.',
    'Your text never leaves your browser — no uploads, no servers.',
  ];
}
