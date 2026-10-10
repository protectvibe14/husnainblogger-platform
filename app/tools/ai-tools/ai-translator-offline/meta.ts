/**
 * meta.ts — AI Translator (offline) (tool-511), Lane A.
 *
 * SEO + content contract for the AiToolTemplate. Never imports client.ts.
 */
import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { LANG_PAIRS } from './logic.ts';

export const inputs: ToolInput[] = [
  {
    id: 'text',
    label: 'Text to translate',
    type: 'textarea',
    required: true,
    placeholder: 'Enter up to 5,000 characters of text…',
  },
  {
    id: 'pair',
    label: 'Language pair',
    type: 'select',
    required: true,
    options: LANG_PAIRS.map((p) => p.id),
    placeholder: '18 pairs: EN ↔ ES, FR, DE, IT, NL, RU, AR, HI, ZH — each downloads once',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'translation',
    label: 'Translation',
    type: 'text',
    description:
    'Free offline ai translator 2026: The translated text, shown on screen for reading and copying. free.',
  },
];

export const content: ToolContent = {
  title: 'Offline Ai Translator',
  description:
    'Translate text free with offline AI — the translated text shown on screen for reading and copying instantly. Translate yours now!',
  howTo: [
    'Paste or type up to 5,000 characters of text.',
    'Pick one of 18 language pairs — English to/from Spanish, French, German, Italian, Dutch, Russian, Arabic, Hindi or Chinese.',
    'Click Translate — the model for that pair downloads once (about 150–300 MB), then works offline.',
    'Read or copy the translation. Long text is translated chunk by chunk and joined.',
    'Switch pairs any time — each model is cached separately in your browser.',
  ],
  methodology:
    'This tool runs Helsinki-NLP OPUS-MT neural machine translation models (Xenova ONNX conversions) entirely in your browser via transformers.js, one model per language pair. Text over 500 characters is split on sentence boundaries and translated chunk by chunk, then joined. Nothing is sent to any server — inference is 100% local. Each pair downloads once (~150–300 MB) and is cached for offline use.',
  examples: [
    {
      title: 'English to Spanish',
      inputs: { pair: 'en-es', text: 'Where is the nearest train station?' },
      note: 'Translate a travel phrase for offline use abroad.',
    },
    {
      title: 'Chinese to English',
      inputs: { pair: 'zh-en', text: '你好，世界。' },
      note: 'Translate Chinese text to English without sending it to a server.',
    },
  ],
  faqs: [
    {
      question: 'Is this translator really free and offline?',
      answer:
        'Yes. Each language pair uses an OPUS-MT model that runs in your browser — there is no API cost, so there is nothing to charge. After the one-time download, translation works with no internet connection.',
    },
    {
      question: 'Which languages are supported?',
      answer:
        '18 pairs: English to and from Spanish, French, German, Italian, Dutch, Russian, Arabic, Hindi and Chinese. Other pairs (like Portuguese or Urdu) are not shipped because no verified in-browser model was found for them.',
    },
    {
      question: 'Is my text sent anywhere?',
      answer:
        'No. Translation happens entirely on your device — your text never leaves your browser. The only download is the AI model itself, from Hugging Face.',
    },
    {
      question: 'How good is the translation?',
      answer:
        'OPUS-MT gives solid machine-quality translation for everyday text, but it is not perfect — idioms, slang and technical terms can be off. Have a native speaker check anything important.',
    },
    {
      question: 'Why is the model download so large?',
      answer:
        'Each language pair needs its own full neural translation model (~150–300 MB). It downloads once and is cached, so repeat translations are instant and offline.',
    },
      {
      question: 'Is this offline ai translator tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
    {
      question: 'How do I use this offline ai translator tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
  ],
  assumptions: [
    'Machine-quality translation — verify important text with a native speaker.',
    'Only the 18 verified pairs are offered; no other languages.',
    'Long text is split into ~500-character chunks on sentence boundaries.',
  ],
  jsonLd: [],
};

export const aiConfig: AiToolConfig = {
  lane: 'A',
  headline: 'Neural translation in 18 language pairs — 100% in your browser, no signup, no uploads.',
  models: LANG_PAIRS.map((p) => ({
    id: p.modelId,
    task: 'translation',
    // Approximate per the field's semantics: 225 MB is the verified fp32
    // merged decoder weight for en-es (HF API, 2026-10-01); all 18 pairs are
    // the same model class, in the ~150–300 MB band.
    sizeMb: 225,
    license: 'CC-BY-4.0 (Helsinki-NLP OPUS-MT via Xenova ONNX conversion)',
    notes: p.fromName + ' → ' + p.toName + ' — one-time download, ~150–300 MB.',
  })),
  disclosures: [
    'Each language pair downloads once (roughly 150–300 MB per pair, per the model size class) and is cached; after that, translation runs 100% on your device.',
    'OPUS-MT gives machine-quality translation — fine for gist, but always have a native speaker check anything important.',
    'Your text never leaves your browser — no uploads, no servers.',
  ],
};
