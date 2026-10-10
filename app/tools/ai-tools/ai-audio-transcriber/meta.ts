/**
 * meta.ts — AI Audio Transcriber (tool-510), Lane A.
 *
 * SEO + content contract for the AiToolTemplate. Never imports client.ts.
 */
import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'file',
    label: 'Audio file',
    type: 'file',
    required: true,
    accept: 'audio/*',
    mediaKind: 'audio',
    maxFileMB: 25,
    placeholder: 'Drop an audio file or click to browse (MP3, WAV, M4A, OGG, WEBM, FLAC — up to 25 MB)',
  },
  {
    id: 'model',
    label: 'Model',
    type: 'select',
    required: true,
    options: ['tiny', 'base'],
    placeholder: 'Tiny = ~39 MB download, fast · Base = ~74 MB, more accurate',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'transcript',
    label: 'Transcript text',
    type: 'text',
    description:
    'Free ai audio transcriber 2026: The transcribed speech, shown on screen for reading and copying. Get instant results. free now.',
  },
  {
    id: 'transcriptFile',
    label: 'Transcript file',
    type: 'download',
    description:
    'The transcript as a.txt file download.',
  },
];

export const content: ToolContent = {
  title: 'Ai Audio Transcriber',
  description:
    'Transcribe audio free with AI in your browser — MP3, WAV, M4A to text.txt download Speech recognition runs 100% on your device.',
  howTo: [
    'Drop an audio file (MP3, WAV, M4A, OGG, WEBM or FLAC up to 25 MB) onto the upload area, or click to browse.',
    'Pick Tiny for a fast ~39 MB model, or Base (~74 MB) for more accurate transcription.',
    'Click Transcribe — the model loads once, then converts your audio to text on your device.',
    'Read the transcript, copy it, or download it as a .txt file.',
    'Transcribe more files — after the first load, the model is cached and each run is faster.',
  ],
  methodology:
    'This tool runs OpenAI Whisper (tiny/base ONNX variants by Xenova) entirely in your browser via transformers.js. Your audio is decoded and resampled to 16 kHz mono locally, then transcribed in 30-second chunks with 5-second overlap so long recordings stay coherent. Nothing is uploaded — speech recognition runs 100% on your device. The model downloads once (~39 MB tiny, ~74 MB base) and is cached for offline use.',
  examples: [
    {
      title: 'Voice memo',
      inputs: { model: 'tiny' },
      note: 'Upload a voice memo — Tiny transcribes a few minutes of speech in seconds.',
    },
    {
      title: 'Lecture recording',
      inputs: { model: 'base' },
      note: 'Upload a lecture — Base gives more accurate results on longer recordings.',
    },
  ],
  faqs: [
    {
      question: 'Is this audio transcriber really free?',
      answer:
        'Yes. The Whisper speech-recognition model runs on your own device, so there is no per-minute cost — no account, no credits, no watermarks, no time limits beyond the 25 MB upload cap.',
    },
    {
      question: 'Are my recordings uploaded anywhere?',
      answer:
        'No. Your audio is decoded and transcribed entirely in your browser and never leaves your device. The only download is the AI model itself, from Hugging Face.',
    },
    {
      question: 'Which model should I choose: Tiny or Base?',
      answer:
        'Tiny (~39 MB) is fast and good for clear voice memos. Base (~74 MB) is noticeably more accurate on longer recordings, varied speakers and mild background noise. Try Tiny first; switch to Base if words are wrong.',
    },
    {
      question: 'How accurate is the transcription?',
      answer:
        'Good on clear English speech. Tiny and Base are small models, so heavy accents, music, overlapping voices, jargon and low-quality recordings will have errors — always review important transcripts.',
    },
    {
      question: 'How long an audio file can I transcribe?',
      answer:
        'Files up to 25 MB — roughly an hour of MP3 or a few minutes of uncompressed WAV. Audio is processed in 30-second chunks, so length only affects processing time.',
    },
    {
      question: 'How does the ai audio transcriber work?',
      answer:
        'Enter your details using the inputs above and the ai audio transcriber calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai audio transcriber free to use?',
      answer:
        'Yes - this ai audio transcriber is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'Models are English-focused; other languages transcribe with lower accuracy.',
    'No speaker labels (diarization) — the output is one continuous transcript.',
    'Results are a best-effort AI transcript; verify anything critical.',
  ],
  jsonLd: [
        {
          '@type': 'ListItem',
          position: 4,
          name: 'AI Audio Transcriber',
          item: 'https://husnainblogger.com/tools/ai-tools/ai-audio-transcriber/',
        },
      ],
    },
  ],
};

export const aiConfig: AiToolConfig = {
  lane: 'A',
  headline: 'Turn speech into text with AI — transcription happens entirely on your device.',
  models: [
    {
      id: 'Xenova/whisper-tiny',
      task: 'automatic-speech-recognition',
      sizeMb: 39,
      license: 'Apache-2.0 (Whisper via Xenova ONNX conversion)',
      notes: 'Fast default: 30 s chunks with 5 s stride.',
    },
    {
      id: 'Xenova/whisper-base',
      task: 'automatic-speech-recognition',
      sizeMb: 74,
      license: 'Apache-2.0 (Whisper via Xenova ONNX conversion)',
      notes: 'More accurate, ~74 MB one-time download.',
    },
  ],
  disclosures: [
    'Each model downloads once (~39 MB tiny / ~74 MB base) and is cached in your browser; after that, transcription runs 100% on your device.',
    'Tiny and Base are small Whisper models — they transcribe clear English speech well but struggle with heavy accents, music, overlapping voices and low-quality recordings.',
    'Your audio never leaves your browser — no uploads, no servers.',
  ],
};
