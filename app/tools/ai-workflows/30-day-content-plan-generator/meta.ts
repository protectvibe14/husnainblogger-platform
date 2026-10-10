import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. fitness, food, travel, finance, beauty, parenting, tech, business',
  },
  {
    id: 'platforms',
    label: 'Platforms (comma-separated)',
    type: 'text',
    required: true,
    placeholder: 'e.g. blog, instagram, tiktok',
  },
  {
    id: 'postsPerWeek',
    label: 'Posts per week',
    type: 'number',
    required: true,
    validation: { min: 1, max: 7 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'plan', label: '30-day content plan', type: 'table' },
  { id: 'topicBank', label: 'Topic bank used', type: 'text' },
];

export const content: ToolContent = {
  title: '30 Day Content Plan Generator',
  description:
    'Free 30 day content plan generator 2026: generate a 30-day content plan from a fixed topic bank: enter your niche, platforms, and. Fast, private -.',
  howTo: [
    'Enter your niche (fitness, food, travel, finance, beauty, parenting, tech, or business).',
    'List your platforms, comma-separated — e.g. blog, instagram, tiktok.',
    'Set posts per week (1–7); posting days spread evenly across the week.',
    'Generate to get a 30-day table: day, weekday, topic, format, and CTA slot.',
    'Adapt each topic to your voice and audience before you publish — treat the bank as a starting point.',
  ],
  methodology:
    'Topics come from a fixed per-niche word bank (8 niches × 12 topics, plus a 12-topic generic bank = 108 topics), rotated by a fixed rule across evenly-spread posting days, with 6 formats and 6 CTAs cycling in order. It is not AI ideation — no model generates or personalizes anything.',
  examples: [
    {
      title: 'Fitness blogger, 3 posts/week',
      inputs: { niche: 'fitness', platforms: 'blog, instagram', postsPerWeek: 3 },
      note: 'Posts land on Mon/Wed/Sat; topics cycle through the 12-topic fitness bank.',
    },
    {
      title: 'Food creator, daily posting',
      inputs: { niche: 'food', platforms: 'tiktok, instagram', postsPerWeek: 7 },
      note: '30 rows — one per day; the food bank cycles twice plus 6 extra topics.',
    },
  ],
  faqs: [
    {
      question: 'What is the best 30 day content plan generator?',
      answer:
        'The best one matches your niche and posting rhythm without inventing ideas for you. This free generator builds a 30-day calendar from a fixed 108-topic word bank across 8 niches, rotating topics, formats, and CTAs by a fixed rule.',
    },
    {
      question: 'Is there a free 30 day content plan generator?',
      answer:
        'Yes — this generator is completely free with no signup. Enter your niche, platforms, and posts per week to get your 30-day table instantly.',
    },
    {
      question: 'How to generate 30 day content?',
      answer:
        'Pick your niche and how many times per week you can realistically post (1–7). The generator spreads posting days evenly across each week and assigns a topic, format, and CTA to every posting day from its fixed bank.',
    },
    {
      question: 'How does a 30 day content plan generator work?',
      answer:
        'It does not use AI. It takes your niche, matches it to a fixed 12-topic word bank (or a generic bank with a clear label), then rotates topics, formats, and CTAs across 30 days using a fixed, repeatable rule.',
    },
    {
      question: 'What is a 30 day content plan generator?',
      answer:
        'A 30 day content plan generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Topics come from a fixed word bank (108 topics total) — not AI-generated ideas.',
    'Day 1 is treated as a Monday; posting days spread evenly across the week.',
    'A niche without a word bank uses the generic bank, clearly labeled as a fallback.',
    'Treat bank topics as starting points — adapt them to your audience before publishing.',
  ],
  jsonLd: [],
};
