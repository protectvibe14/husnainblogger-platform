import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/30-day-reels-challenge-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'pillars',
    label: 'Content pillars (3–5, one per line)',
    type: 'textarea',
    required: true,
    placeholder: 'e.g.\nHooks\nTutorials\nBehind the scenes',
  },
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. skincare',
    validation: { max: 60 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'calendar',
    label: '30-day reels calendar',
    type: 'table',
    description:
    'Free 30 day reels challenge 2026: Day, pillar, reel prompt, and format for all 30 days — all prompts unique. Fast, private now.',
  },
  {
    id: 'exportCSV',
    label: 'Export as CSV',
    type: 'download',
    description:
    'The full calendar as a CSV file you can open in a spreadsheet.',
  },
];

export const content: ToolContent = {
  title: '30 Day Reels Challenge',
  description:
    'Take the 30 day reels challenge with this free tool: enter your niche and 3–5 content pillars for a 30-day calendar with unique prompts. Start now!',
  howTo: [
    'Enter your niche (up to 60 characters).',
    'List 3–5 content pillars, one per line (or comma-separated).',
    'Run the tool to get your 30-day calendar: day, pillar, reel prompt, and format.',
    'Film one reel per day following the prompt and format shown.',
    'Download the calendar as CSV to track your progress in a spreadsheet.',
  ],
  methodology:
    'The tool assigns prompts from a fixed bank of 30 hand-written prompt templates across 6 reel formats (talking head tip, POV skit, step-by-step tutorial, B-roll voiceover, before & after, myth vs fact) — no AI and no generated copy. Pillars rotate in the order you entered them, formats cycle evenly (5 days each), and prompts are picked deterministically by day number, so all 30 prompts in a calendar are unique.',
  examples: [
    {
      title: 'Skincare creator challenge',
      inputs: { pillars: 'Hooks\nTutorials\nBehind the scenes', niche: 'skincare' },
      note: 'Three pillars rotating across 30 unique reel prompts.',
    },
    {
      title: 'Fitness coach challenge',
      inputs: { pillars: 'Workouts\nNutrition\nMindset\nClient wins', niche: 'fitness coaching' },
      note: 'Four pillars with a motivational angle.',
    },
    {
      title: 'Small business challenge',
      inputs: { pillars: 'Product demos\nPackaging\nCustomer stories\nTips\nDay in the life', niche: 'handmade candles' },
      note: 'Five pillars covering the whole business.',
    },
  ],
  faqs: [
    {
      question: 'What is the best 30 day reels challenge?',
      answer:
        'The best challenge rotates 3–5 content pillars so you never run out of ideas, and mixes formats (talking head, tutorials, POV, before/after) so the feed stays fresh. This free tool builds exactly that: a 30-day calendar with 30 unique prompts matched to your pillars.',
    },
    {
      question: 'Is there a free 30 day reels challenge?',
      answer:
        'Yes — this 30-day reels challenge generator is completely free with no signup. You get the full 30-day calendar with unique daily prompts plus a downloadable CSV.',
    },
    {
      question: 'How to use 30 day reels?',
      answer:
        'Enter your niche and 3–5 content pillars, then film one reel per day following the prompt and format for that day. The calendar keeps topics rotating so your content stays varied all month.',
    },
    {
      question: 'How does a 30 day reels challenge work?',
      answer:
        'You commit to posting one reel a day for 30 days. This tool removes the planning work: it assigns each day a pillar, a specific prompt, and a reel format, cycling deterministically so you get 30 different ideas with no repeats.',
    },
    {
      question: 'What is a 30 day reels challenge?',
      answer:
        'A 30 day reels challenge is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'What makes a good 30 day reels challenge?',
      answer: 'Clarity, specificity, and relevance to your audience. Avoid generic phrases — the more specific your input, the better the output.',
    },
    {
      question: 'How do I create 30 day reels challenge?',
      answer: 'Describe what you need in the input fields, then click generate. You can regenerate as many times as you like and copy the version that fits best.',
    },
  ],
  assumptions: [
    'Prompts are fixed templates with your niche and pillars filled in — not AI-written scripts. Adapt each prompt to your style before filming.',
    'The tool plans the calendar only; it does not schedule or post reels for you.',
  ],
  jsonLd: [],
};
