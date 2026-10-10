import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/cta-text-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'goal',
    label: 'Engagement goal',
    type: 'select',
    required: true,
    options: ['comment', 'save', 'share', 'dm', 'link', 'follow'],
  },
  {
    id: 'topic',
    label: 'Post topic (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. morning routines — leave blank for a generic CTA',
  },
  {
    id: 'count',
    label: 'Number of CTAs',
    type: 'number',
    required: false,
    placeholder: '5 (default)',
    validation: { min: 1, max: 10 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'ctas',
    label: 'CTA lines',
    type: 'list',
    description:
    'Free call to action instagram post 2026: Call-to-action lines matched to your engagement goal. free.',
  },
  {
    id: 'copyAll',
    label: 'Copy all CTAs',
    type: 'copy',
    description:
    'All CTA lines as plain text, ready to paste into your caption.',
  },
  {
    id: 'bankSizes',
    label: 'Template bank info',
    type: 'text',
    description:
    'Documents the fixed template bank sizes behind the results.',
  },
];

export const content: ToolContent = {
  title: 'Call To Action Instagram Post',
  description:
    'Write a call to action Instagram post that gets comments, saves, and shares. Pick your goal, get proven CTA lines free — needed.',
  howTo: [
    'Choose your "Engagement goal": comments, saves, shares, DMs, link clicks, or follows.',
    'Optionally add your post topic so each CTA mentions it naturally.',
    'Set "Number of CTAs" (1–10, defaults to 5) and run the tool.',
    'Pick the line that fits your caption voice from the "CTA lines" list.',
    'Use "Copy all CTAs" to paste the full set into your content plan.',
  ],
  methodology:
    'This tool assembles CTAs from a fixed library of 36 hand-written formulas (6 per goal: comment, save, share, dm, link, follow). Your topic is inserted into the formula slot — "this post" is used when no topic is given — and requests beyond 6 cycle the bank in order. Nothing is written by AI.',
  examples: [
    {
      title: 'Comment CTAs for a recipe post',
      inputs: { goal: 'comment', topic: 'meal prep', count: 3 },
      note: 'Three comment-driving lines mentioning "this meal prep post".',
    },
    {
      title: 'Save CTAs without a topic',
      inputs: { goal: 'save', count: 5 },
      note: 'Five generic save lines using "this post" as the subject.',
    },
    {
      title: 'Follow CTAs for a fitness account',
      inputs: { goal: 'follow', topic: 'home workouts', count: 8 },
      note: 'Cycles the 6-template follow bank to produce 8 lines in order.',
    },
  ],
  faqs: [
    {
      question: 'What is the best call to action instagram post?',
      answer:
        'The best call to action for an Instagram post matches one engagement goal — comments, saves, shares, DMs, link clicks, or follows — and asks for it in plain words at the end of the caption. This free generator gives you up to 10 CTA lines per goal from a fixed formula library.',
    },
    {
      question: 'Is there a free call to action instagram post?',
      answer:
        'Yes — this CTA generator is completely free with no signup. You can generate up to 10 CTA lines per run for any of the 6 engagement goals, as many times as you like.',
    },
    {
      question: 'How to use call to action instagram post?',
      answer:
        'Pick your engagement goal, optionally add your post topic, and generate the lines. Append your chosen CTA to the end of your caption — one clear ask per post performs better than stacking several.',
    },
    {
      question: 'How does a call to action instagram post work?',
      answer:
        'It takes your goal and optional topic, then fills hand-written CTA formulas from a fixed 36-template library — 6 per goal — cycling the bank in order when you ask for more than 6. No AI is involved; the output is template assembly.',
    },
    {
      question: 'How does the call to action instagram post work?',
      answer:
        'Enter your details using the inputs above and the call to action instagram post calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the call to action instagram post free to use?',
      answer:
        'Yes - this call to action instagram post is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a call to action instagram post?',
      answer:
        'A call to action instagram post is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'CTAs come from a fixed bank of 36 formulas (6 per goal) — options beyond 6 repeat the bank in order.',
    'A CTA formula cannot guarantee engagement; timing, audience, and content quality matter more.',
    'Adapt the wording to your voice before posting.',
  ],
  jsonLd: [
  ],
};
