import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Your TikTok niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. skincare, fitness, real estate',
    validation: { max: 48 },
  },
  {
    id: 'formatCategory',
    label: 'Format category',
    type: 'select',
    required: true,
    options: ['challenge', 'story', 'tutorial', 'trend-jack', 'series'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'formats', label: 'Curated format library', type: 'table' },
];

export const content: ToolContent = {
  title: 'Viral TikTok Formats',
  description:
    'Browse viral TikTok formats in a free evergreen library: pick challenge, story, tutorial, trend-jack, or series for 6 proven format breakdowns. Explore.',
  howTo: [
    'Enter your niche so every format entry is written for your audience.',
    'Pick a formatCategory: challenge, story, tutorial, trend-jack, or series.',
    'Generate to get 6 curated format entries — each with a setup, beat-by-beat structure, and when to use it.',
    'Pick one format and film it this week; repeat the format with new topics to build a series.',
    'Remember: this is an evergreen library, not live trend data — check TikTok’s Creative Center for what is viral right now.',
  ],
  methodology:
    'The tool looks up the fixed library for your chosen category (5 categories × 6 entries = 30 total evergreen formats) and fills the [NICHE] slot in each entry’s name, setup, beats, and when-to-use guidance. No AI is used and no live TikTok data is fetched, so the library never claims to know what is viral right now.',
  examples: [
    {
      title: 'Skincare tutorials',
      inputs: { niche: 'skincare', formatCategory: 'tutorial' },
      note: 'Returns 6 tutorial formats (3-step fix, mistakes tutorial, tool teardown…) with setups, beats, and when-to-use for skincare.',
    },
    {
      title: 'Fitness challenges',
      inputs: { niche: 'home workouts', formatCategory: 'challenge' },
      note: 'Returns 6 challenge formats including the 30-day challenge and the $0 vs $100 comparison.',
    },
    {
      title: 'Finance story series',
      inputs: { niche: 'personal finance', formatCategory: 'series' },
      note: 'Returns 6 series formats including the numbered 101 series and the myth-vs-fact format.',
    },
  ],
  faqs: [
    {
      question: 'What is the best viral TikTok format?',
      answer:
        'There is no single best format — the strongest creators rotate 2–3 proven formats (like the 3-step tutorial, the 30-day challenge, or a numbered series) and repeat them with fresh topics. This library gives you 6 curated entries per category with beat-by-beat structures.',
    },
    {
      question: 'Is there a free viral TikTok formats library?',
      answer:
        'Yes — this library is free with no signup. Pick from 5 categories (challenge, story, tutorial, trend-jack, series) and get 6 evergreen format breakdowns tailored to your niche.',
    },
    {
      question: 'How do I use the viral format library?',
      answer:
        'Enter your niche, pick a category, and generate. Each entry tells you the setup, the beats to film, and when to use it. Film one format this week and reuse it with new topics to build consistency.',
    },
    {
      question: 'How does the viral format library work?',
      answer:
        'It retrieves fixed, evergreen format entries from a 30-entry library for your chosen category and fills in your niche. It does not track live trends — for what is viral right now, check TikTok’s Creative Center or trending page.',
    },
    {
      question: 'How does the viral tiktok formats work?',
      answer:
        'Enter your details using the inputs above and the viral tiktok formats calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the viral tiktok formats free to use?',
      answer:
        'Yes - this viral tiktok formats is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a viral tiktok formats?',
      answer:
        'A viral tiktok formats is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Static evergreen library (30 entries): it never claims to know what is currently viral — there is no live data source.',
    'Formats are proven structures, not guarantees; results depend on execution, niche, and consistency.',
    'Niche substitution is a text fill — entries stay generic enough to fit any niche.',
  ],
  jsonLd: [
  ],
};
