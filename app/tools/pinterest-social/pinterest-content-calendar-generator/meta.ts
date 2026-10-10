import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/pinterest-content-calendar-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. home decor, keto recipes',
    validation: { max: 80 },
  },
  {
    id: 'yearMonth',
    label: 'Month (YYYY-MM)',
    type: 'text',
    required: true,
    placeholder: 'e.g. 2026-11',
  },
  {
    id: 'pinsPerWeek',
    label: 'Pins per week',
    type: 'number',
    required: false,
    placeholder: '5',
    validation: { min: 1, max: 21 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'calendar',
    label: 'Content calendar',
    type: 'table',
    description:
    'Free pinterest content calendar 2026: Dated schedule: theme, pin type, and keyword seed for every pin in the month. Fast, private now.',
  },
  {
    id: 'pinCount',
    label: 'Total pins',
    type: 'number',
    description:
    'How many pins the calendar contains (pins per week x weeks in the month).',
  },
  {
    id: 'monthUsed',
    label: 'Month',
    type: 'text',
    description:
    'The month the calendar was built for (YYYY-MM).',
  },
  {
    id: 'scheduleNote',
    label: 'Schedule note',
    type: 'text',
    description:
    'How the calendar was assembled, which seasonal events were merged, and any capping applied.',
  },
];

export const content: ToolContent = {
  title: 'Pinterest Content Calendar Free',
  description:
    'Plan a full month of pins in minutes: enter your niche, the target month, and pins per week for a complete dated content calendar with daily slots.',
  howTo: [
    'Type your "Your niche", e.g. "home decor" or "keto recipes".',
    'Enter the "Month (YYYY-MM)" you are planning, e.g. 2026-11. Past months are rejected.',
    'Set "Pins per week" (1-21, defaults to 5). Anything above 21 is capped at 21 with a note.',
    'Run the tool to get a dated calendar: every pin gets a theme from a fixed rotation, a pin type (standard, idea, video), and a keyword seed.',
    'Read the "Schedule note" — it tells you which seasonal events were merged into your month and how the schedule was assembled.',
  ],
  methodology:
    'The tool builds the calendar deterministically: each week of the month gets your chosen pins per week, spread evenly across the week\'s days, so the pin count always equals pins per week times the number of weeks. Themes rotate through a fixed bank of 10 hand-written templates filled with your niche, pin types rotate standard → idea → video, and in months with seasonal events every 4th pin is replaced by a seasonal angle from a compact in-repo dataset of 12 events (reviewed 2026-09-30; the full 24-event dataset lives in the Pinterest Seasonal Content Planner). No AI, no trend data, and no market data are used.',
  examples: [
    {
      title: 'November decor calendar',
      inputs: { niche: 'home decor', yearMonth: '2026-11', pinsPerWeek: 5 },
      note: 'Returns 25 dated pins; every 4th pin uses a Thanksgiving, Black Friday, or Christmas angle.',
    },
    {
      title: 'Light schedule for March',
      inputs: { niche: 'recipes', yearMonth: '2027-03', pinsPerWeek: 3 },
      note: 'Returns 15 dated pins from the theme rotation (no seasonal events in March).',
    },
    {
      title: 'Capped request',
      inputs: { niche: 'fashion', yearMonth: '2027-01', pinsPerWeek: 30 },
      note: 'Pins per week is capped at 21 with a note; the calendar contains 21 pins per week.',
    },
  ],
  faqs: [
    {
      question: 'What is the best pinterest content calendar?',
      answer:
        'The best pinterest content calendar matches your real capacity — consistent pinning beats bursts — and mixes evergreen themes with seasonal angles. This free generator builds a dated month plan from your niche and pins-per-week target, rotating 10 themes and merging seasonal events automatically.',
    },
    {
      question: 'Is there a free pinterest content calendar?',
      answer:
        'Yes — this pinterest content calendar generator is completely free with no signup. Enter your niche, any current or future month, and your pins-per-week target to get a full dated schedule, as many times as you like.',
    },
    {
      question: 'How to use pinterest content?',
      answer:
        'Enter your niche, the month as YYYY-MM, and how many pins per week you can sustain (1-21). Run the tool, then work through the calendar: each row gives you a date, a theme, a pin type, and a keyword seed to build the pin around.',
    },
    {
      question: 'Can I plan a past month?',
      answer:
        'No — past months are rejected with an error, because a content calendar only makes sense going forward. Pick the current month or any future month in YYYY-MM format.',
    },
    {
      question: 'What is a pinterest content calendar?',
      answer:
        'A pinterest content calendar is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Can I customize the generated pinterest content calendar?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
    {
      question: 'What makes a good pinterest content calendar?',
      answer: 'Clarity, specificity, and relevance to your audience. Avoid generic phrases — the more specific your input, the better the output.',
    },
  ],
  assumptions: [
    'The calendar is assembled from a fixed 10-theme bank and a 12-event seasonal subset — it does not use AI, trend data, or market data.',
    'Pin count always equals pins per week times the number of weeks in the month; requests above 21 per week are capped with a note.',
    'Seasonal merging covers 12 events only; check the schedule note to see which events applied to your month.',
  ],
  jsonLd: [],
};
