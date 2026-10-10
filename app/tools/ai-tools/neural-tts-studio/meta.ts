/**
 * meta.ts — Neural TTS Studio (tool-507), Lane A.
 *
 * SEO + content contract for the AiToolTemplate. Never imports client.ts.
 */
import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'text',
    label: 'Text to speak',
    type: 'textarea',
    required: true,
    placeholder: 'Type or paste up to 5,000 characters…',
    validation: { min: 1, max: 5000, unit: 'characters' },
  },
  {
    id: 'voice',
    label: 'Voice',
    type: 'select',
    required: true,
    options: [
      'af_bella',
      'af_nicole',
      'af_sarah',
      'af_sky',
      'am_adam',
      'am_michael',
      'bf_emma',
      'bf_isabella',
      'bm_george',
      'bm_lewis',
    ],
  },
  {
    id: 'speed',
    label: 'Speed',
    type: 'number',
    required: true,
    placeholder: '1.0',
    validation: { min: 0.5, max: 2.0 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'audioWav',
    label: 'Speech audio (WAV)',
    type: 'download',
    description:
    'Free free text to speech ai voice 2026: Generated 24 kHz WAV you can play in the browser or download. Get instant results. free now.',
  },
  {
    id: 'durationSec',
    label: 'Audio duration',
    type: 'text',
    description:
    'Length of the generated speech in seconds.',
  },
];

export const content: ToolContent = {
  title: 'AI Text to Speech Voice',
  description:
    'Turn text into a natural AI text to speech voice — generated 24 kHz WAV you can play in the browser or download. Try it now!',
  howTo: [
    'Type or paste your text (up to 5,000 characters) into the Text to speak field.',
    'Pick a voice from the 10 verified English voices — American or British, female or male.',
    'Drag the Speed slider between 0.5 and 2.0 to slow down or speed up the speech.',
    'Click Generate speech and wait — the ~86 MB voice model downloads once, then runs fully on your device.',
    'Play the result in the built-in player or download the WAV file for your videos and podcasts.',
  ],
  methodology:
    'This tool runs the Kokoro-82M neural text-to-speech model (onnx-community/Kokoro-82M-v1.0-ONNX, q8 quantization) entirely in your browser via kokoro-js and WebGPU/WASM. Long text is split into sentence-based chunks (about 400 characters each), synthesized chunk by chunk at 24 kHz, then stitched into a single WAV with short pauses between chunks. No text is sent to any server; the model downloads once (~86 MB) and is cached by your browser for offline use.',
  examples: [
    {
      title: 'YouTube intro',
      inputs: { text: 'Welcome back to the channel. Today we break down five free AI tools.', voice: 'af_bella', speed: 1 },
      note: 'A friendly American female voice at normal speed — ready to download and drop into an edit.',
    },
    {
      title: 'Slow narration',
      inputs: { text: 'Once upon a time, in a small coastal town, there lived a curious inventor.', voice: 'bm_george', speed: 0.85 },
      note: 'A British male voice slowed slightly — suits storytelling and audiobook-style narration.',
    },
  ],
  faqs: [
    {
      question: 'Is this text to speech tool really free?',
      answer:
        'Yes — it runs a real neural TTS model (Kokoro-82M) entirely in your browser. There is no account, no credit system and no server doing the work, so nothing to bill you for. Your only cost is the one-time ~86 MB model download.',
    },
    {
      question: 'Does it work offline?',
      answer:
        'After the first visit, yes. The voice model is cached by your browser, so later generations work with no internet connection. The very first generation needs a connection to download the model.',
    },
    {
      question: 'What voices are available?',
      answer:
        'Ten verified English voices: Bella, Nicole, Sarah, Sky (American female), Adam, Michael (American male), Emma, Isabella (British female), George and Lewis (British male). Only these are offered — every listed voice is confirmed working with the model.',
    },
    {
      question: 'Can I use the audio commercially, for YouTube or ads?',
      answer:
        'The model itself is Apache-2.0 licensed, which permits commercial use, but you are responsible for how you use the output — for example, platform rules for AI-generated voices on YouTube or ad networks. When in doubt, check the policy of the platform where you publish.',
    },
    {
      question: 'Why does the first generation take so long?',
      answer:
        'The first run downloads the ~86 MB model and warms up your device\'s AI runtime. Later runs skip the download entirely and are much faster, especially in browsers with WebGPU (Chrome/Edge 113+).',
    },
  ],
  assumptions: [
    'Output is 24 kHz mono WAV — fine for voiceovers and podcasts, not studio-grade music production.',
    'Very long texts are chunked, so intonation resets at chunk boundaries; splitting paragraphs yourself gives the most natural result.',
    'Voices are fixed presets — this tool cannot clone your own voice.',
  ],
  jsonLd: [],
};

export const aiConfig: AiToolConfig = {
  lane: 'A',
  headline: 'Neural text-to-speech in your browser — type, pick a voice, download the WAV. No sign-up, no server.',
  models: [
    {
      id: 'onnx-community/Kokoro-82M-v1.0-ONNX',
      task: 'text-to-speech',
      dtype: 'q8',
      sizeMb: 86,
      license: 'Apache-2.0 (Kokoro-82M; ONNX weights via onnx-community)',
      notes: '10 verified English voices (US + UK); 24 kHz output.',
    },
  ],
  disclosures: [
    'The ~86 MB voice model downloads once and is cached in your browser; after that, speech is generated 100% on your device.',
    'No text is ever uploaded — everything runs locally on your computer or phone.',
    'Long text is synthesized in chunks; generation time grows with text length.',
    'Speed depends on your device — WebGPU browsers (Chrome/Edge 113+) are fastest; other browsers fall back to CPU.',
  ],
};
