import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-30-day-posting-challenge/';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. sourdough baking',
    validation: { max: 120 },
  },
  {
    id: 'startDate',
    label: 'Start date',
    type: 'date',
    required: true,
  },
];

export const outputs: ToolOutput[] = [
  { id: 'calendar', label: '30-day calendar', type: 'table' },
];

export const content: ToolContent = {
  title: '30 Day TikTok Challenge',
  description:
    'Generate a 30 day tiktok challenge: 30 daily video ideas with format and CTA, rest days included, from your niche and start date. Free generator. Start.',
  howTo: [
    'Enter your niche — the video ideas are written around it (max 120 characters).',
    'Pick your startDate; the calendar counts 30 days forward from it.',
    'Run the tool to get a 30-row table: day number, date, video idea, format, and CTA.',
    'Treat days 7, 14, 21, and 28 as rest days: no posting, just the listed engagement activity.',
    'Check off finished days in the page UI — your progress is saved in your browser only.',
    'Swap any idea that does not fit you; the calendar is a starting structure, not a rulebook.',
  ],
  methodology:
    'This is a static template generator, not AI: 30 fixed day templates (26 posting days covering formats like talking head, duet, tutorial, myth-bust, and storytime, plus 4 rest days with fixed engagement activities) are combined with your niche and start date. Dates are computed in UTC from your start date. The same inputs always produce the same calendar.',
  examples: [
    {
      title: 'Sourdough challenge',
      inputs: { niche: 'sourdough baking', startDate: '2026-10-01' },
      note: '30 days of sourdough video ideas starting Oct 1, with rest days on 7, 14, 21, 28.',
    },
    {
      title: 'Fitness challenge',
      inputs: { niche: 'home workouts', startDate: '2026-11-01' },
      note: 'Same 30-day structure, rewritten around home workouts.',
    },
  ],
  faqs: [
    {
      question: 'What is the best 30 day tiktok challenge?',
      answer:
        'The best 30-day challenge is one you can finish: daily prompts in varied formats, rest days built in, and ideas specific to your niche. This generator builds that structure — your consistency is what makes it work.',
    },
    {
      question: 'Is there a free 30 day tiktok challenge?',
      answer:
        'Yes — this generator is free and runs entirely in your browser. Enter your niche and start date to get a 30-day calendar with video ideas, formats, and CTAs, no signup.',
    },
    {
      question: 'How to use 30 day tiktok?',
      answer:
        'Enter your niche and start date, then follow the calendar day by day. Post on the posting days, rest and engage on days 7, 14, 21, and 28, and check off each day as you finish it.',
    },
    {
      question: 'How does a 30 day tiktok challenge work?',
      answer:
        'It works through volume and rhythm: 30 prompts remove the "what do I post" decision, varied formats keep viewers interested, and rest days prevent burnout. The calendar is a static template — check-off progress is saved in your browser only.',
    },
    {
      question: 'What is a 30 day tiktok challenge?',
      answer:
        'A 30 day tiktok challenge is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Is this 30 day tiktok challenge tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
    {
      question: 'How do I use this 30 day tiktok challenge tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
  ],
  assumptions: [
    'Static calendar, not AI: ideas are fixed format frames with your niche inserted — they are not tailored to your audience or trends, and completing the challenge is not a growth guarantee.',
    'Rest days (7, 14, 21, 28) are engagement days by design, not skipped days.',
    'Check-off state lives in your browser\'s localStorage via the page UI; this tool only generates the calendar.',
  ],
  jsonLd: [],
};
