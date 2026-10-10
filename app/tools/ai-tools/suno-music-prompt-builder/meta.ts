import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'genre',
    label: 'Genre',
    type: 'select',
    required: true,
    options: [
      'pop',
      'rock',
      'hiphop',
      'electronic',
      'lofi',
      'country',
      'jazz',
      'classical',
      'rnb',
      'folk',
      'metal',
      'ambient',
    ],
  },
  {
    id: 'mood',
    label: 'Mood',
    type: 'select',
    required: true,
    options: [
      'happy',
      'sad',
      'energetic',
      'chill',
      'romantic',
      'dark',
      'hopeful',
      'nostalgic',
    ],
  },
  {
    id: 'tempo',
    label: 'Tempo',
    type: 'select',
    required: true,
    options: ['slow', 'medium', 'fast'],
  },
  {
    id: 'vocals',
    label: 'Vocals',
    type: 'select',
    required: true,
    options: ['instrumental', 'female-vocal', 'male-vocal', 'duet', 'choir'],
  },
  {
    id: 'theme',
    label: 'Theme / lyrics topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. rainy sunday mornings',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'styleField',
    label: 'Suno style field',
    type: 'copy',
    description:
    'Free suno prompt generator 2026: Genre, mood, tempo and vocal description for Suno\\u2019s style box. Get instant results. free now.',
  },
  {
    id: 'lyricsDraft',
    label: 'Lyrics draft',
    type: 'copy',
    description:
    'Verse/chorus/outro lyric skeleton with your theme inserted — rewrite before use.',
  },
  {
    id: 'pasteNote',
    label: 'How to use',
    type: 'text',
    description:
    'Where each output goes inside Suno.',
  },
];

export const content: ToolContent = {
  title: 'Suno Music Prompt Builder',
  description:
    'Build a Suno-ready style field plus a verse/chorus lyric skeleton from fixed templates: 12 genres, 8 moods, 3 tempos. Free prompt text to paste into Suno.',
  howTo: [
    'Pick a genre, mood, tempo and vocal option from the dropdowns.',
    'Type your theme or lyrics topic (2-200 characters).',
    'Click Build prompt to generate the style field and lyric skeleton.',
    'Copy the style field into Suno\u2019s style box.',
    'Rewrite the lyric skeleton lines in your own words, then paste them into Suno\u2019s lyrics box.',
  ],
  methodology:
    'This tool combines your picks into a fixed style-field template ("genre, mood, tempo, vocals") and fills a fixed verse/chorus/outro lyric skeleton with your theme. It runs entirely in your browser — it does not generate music, does not call Suno, and no AI model is involved.',
  examples: [
    {
      title: 'Lo-fi study track',
      inputs: { genre: 'lofi', mood: 'chill', tempo: 'slow', vocals: 'female-vocal', theme: 'rainy sunday mornings' },
      note: 'Produces a "lo-fi, laid-back and relaxed, slow tempo, female vocal" style field plus a rain-themed lyric skeleton.',
    },
    {
      title: 'Workout anthem',
      inputs: { genre: 'electronic', mood: 'energetic', tempo: 'fast', vocals: 'instrumental', theme: 'midnight city run' },
      note: 'Produces an instrumental style field and a lyric skeleton you can ignore or replace.',
    },
  ],
  faqs: [
    {
      question: 'Does this tool create music?',
      answer:
        'No. It writes prompt text — a style description and a lyric skeleton — that you paste into Suno. Suno does the actual music generation; nothing here plays or renders audio.',
    },
    {
      question: 'Are the lyrics ready to publish?',
      answer:
        'No — they are fixed template lines with your theme inserted (e.g. "I woke up thinking about your theme"). Treat them as a starting skeleton and rewrite them into real songwriting.',
    },
    {
      question: 'Where do the two outputs go in Suno?',
      answer:
        'The style field goes into Suno\u2019s style/description box; the lyrics draft goes into its lyrics box. The tool tells you this in the "How to use" output.',
    },
    {
      question: 'Is this affiliated with Suno?',
      answer:
        'No. This is an independent prompt-writing helper. Suno is a separate product with its own terms and pricing.',
    },
    {
      question: 'Is the prompt builder free?',
      answer:
        'Yes — completely free, no signup. It runs in your browser using fixed templates.',
    },
    {
      question: 'How does the suno prompt generator work?',
      answer:
        'Enter your details using the inputs above and the suno prompt generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the suno prompt generator free to use?',
      answer:
        'Yes - this suno prompt generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'Outputs are template-assembled text, not finished songwriting — rewrite the lyric lines before using them.',
    'Suno\u2019s interface labels and prompt behavior can change; check Suno\u2019s own docs for current field names.',
  ],
  jsonLd: [],
};
