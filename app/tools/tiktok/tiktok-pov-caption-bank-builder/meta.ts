import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-pov-caption-bank-builder/';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'seed',
    label: 'Caption seed',
    type: 'text',
    required: true,
    placeholder: 'e.g. monday gym grind, exam week, first apartment',
  },
  {
    id: 'niche',
    label: 'Niche (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. fitness, study, lifestyle',
  },
  {
    id: 'tone',
    label: 'Tone (optional)',
    type: 'text',
    required: false,
    placeholder: 'funny, warm, motivational, sassy — or leave blank',
  },
  {
    id: 'bankSize',
    label: 'Bank size (optional)',
    type: 'text',
    required: false,
    placeholder: '10 — a whole number between 5 and 50',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'captions',
    label: 'POV caption templates',
    type: 'list',
    description:
    'Free tiktok pov captions 2026: Caption templates with [YOUR SPIN] placeholder slots and tone-matched hashtag sets. Fast, private now.',
  },
  {
    id: 'count',
    label: 'Captions built',
    type: 'number',
    description:
    'How many caption templates were built.',
  },
  {
    id: 'trimmedCount',
    label: 'Hashtag-trimmed captions',
    type: 'number',
    description:
    'Captions whose hashtags were trimmed to stay within the caption limit.',
  },
];

export const content: ToolContent = {
  title: 'TikTok POV Captions',
  description:
    'Build a free tiktok pov captions bank: add caption seeds and get POV caption templates with hashtag sets, all under the caption limit. Build yours now.',
  howTo: [
    'Add one item per caption theme and type the "Caption seed" — a word, phrase, or scenario like "monday gym grind".',
    'Set the "Tone" to funny, warm, motivational, or sassy (blank = generic), and the "Bank size" to 5–50 captions (blank = 10).',
    'Run the tool to build the caption bank from fixed template banks — every caption keeps a [YOUR SPIN] slot.',
    'Copy a caption, replace [YOUR SPIN] with your own line, and paste it into TikTok.',
    'Your bank is saved in the browser automatically, so you can reuse it next session.',
  ],
  methodology:
    'Each item is expanded from 47 fixed bank entries (10 POV openers, 12 scenario templates with a [SEED] slot, 10 emojis, and 15 fixed hashtag sets across 5 tones) — no AI and no platform data; unknown tones fall back to the generic tag set. Every caption is checked against the conservative 2,200-character limit, and hashtags are trimmed first (never the caption body) if the limit would be exceeded. Picks are deterministic: the same seed always builds the same bank.',
  faqs: [
    {
      question: 'What is the best tiktok pov captions?',
      answer:
        'The best POV captions pair a relatable scenario with one clear emotion and 3–5 relevant hashtags. This free builder creates banks of caption templates from your seeds, each with a [YOUR SPIN] slot so you can add your own line before posting.',
    },
    {
      question: 'Is there a free tiktok pov captions?',
      answer:
        'Yes — this POV caption bank builder is completely free with no signup. Add seeds, pick a tone, and build 5–50 caption templates per seed with hashtag sets, all kept under the TikTok caption limit.',
    },
    {
      question: 'How to use tiktok pov?',
      answer:
        'POV captions set up a relatable scenario ("POV: you finally meal-prep on Sunday") so viewers see themselves in the video. Build a bank here, copy a caption, fill in the [YOUR SPIN] slot with your own line, and paste it as your TikTok caption.',
    },
    {
      question: 'How does a tiktok pov captions work?',
      answer:
        'You add a caption seed per item (a word, phrase, or scenario), choose a tone, and the tool assembles captions from fixed template banks — openers, scenarios, emojis, and hashtag sets — then saves the bank in your browser. It never posts to TikTok for you.',
    },
    {
      question: 'What is a tiktok pov captions?',
      answer:
        'A tiktok pov captions is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Can I save or export my tiktok pov captions?',
      answer: 'Yes, copy the result or use your browser\'s print-to-PDF. Everything stays on your device — nothing is uploaded or stored.',
    },
    {
      question: 'How do I build tiktok pov captions?',
      answer: 'Fill in the fields with your details and the builder assembles everything into a polished result. Edit any section until it feels right.',
    },
  ],
  assumptions: [
    'Captions are assembled from 47 fixed template entries — templated, not AI-written. Customize the [YOUR SPIN] slot before posting.',
    'The bank is saved in your browser (localStorage); clearing browser data removes it.',
    'Hashtag sets are generic examples — swap in your niche tags for better targeting.',
    'No reach or virality is promised; the tool builds caption templates, not results.',
  ],
  jsonLd: [],
};
