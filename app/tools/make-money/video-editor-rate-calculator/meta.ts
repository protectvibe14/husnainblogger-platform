import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'experienceLevel',
    label: 'Your experience level',
    type: 'select',
    required: true,
    options: ['entry', 'mid', 'senior'],
  },
  {
    id: 'projectHours',
    label: 'Estimated project hours',
    type: 'number',
    required: true,
    placeholder: 'e.g. 8',
    validation: { min: 0 },
  },
  {
    id: 'videoMinutes',
    label: 'Finished video length (minutes)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 10',
    validation: { min: 0 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'hourlyRateLow', label: 'Suggested hourly rate — low (estimate)', type: 'currency' },
  { id: 'hourlyRateHigh', label: 'Suggested hourly rate — high (estimate)', type: 'currency' },
  { id: 'projectTotalLow', label: 'Estimated project total — low', type: 'currency' },
  { id: 'projectTotalHigh', label: 'Estimated project total — high', type: 'currency' },
  { id: 'perFinishedMinuteNote', label: 'Per finished minute (planning figure)', type: 'text' },
];

const DESCRIPTION =
  'Estimate your freelance video editing price with this free video editor rates calculator. Pick a level, enter hours, and get a rate range and total.';

export const content: ToolContent = {
  title: 'Video Editor Rates Calculator',
  description: DESCRIPTION,
  howTo: [
    'Choose your experience level: Entry (under ~2 years), Mid (2–5 years), or Senior (5+ years / specialized).',
    'Enter your estimated project hours — include editing, revisions, and review rounds.',
    'Enter the finished video length in minutes — this only contextualizes the result, it does not change the rate.',
    'Run the calculator to see the estimated hourly range and the project total (rate × hours).',
    'Adjust the numbers up or down for your niche, client budget, and turnaround speed — treat the result as a starting point.',
  ],
  methodology:
    'The tool looks up a fixed benchmark table in code (Entry $15–$40/hr, Mid $50–$100/hr, Senior $100–$250/hr — 3 rows), multiplies each end of the band by your project hours, and divides the totals by the finished minutes for a per-minute planning figure. There is no AI and no live market lookup. Every band is a survey/market estimate, not an official or current rate.',
  examples: [
    {
      title: 'Mid-level editor, 8 hours, 10-minute video',
      inputs: { experienceLevel: 'mid', projectHours: 8, videoMinutes: 10 },
      note: 'Returns $50–$100/hr and a $400–$800 project total — about $40–$80 per finished minute.',
    },
    {
      title: 'Senior editor, 20-hour project',
      inputs: { experienceLevel: 'senior', projectHours: 20, videoMinutes: 30 },
      note: 'Returns $100–$250/hr and a $2,000–$5,000 project total.',
    },
  ],
  faqs: [
    {
      question: 'What is the best video editor rates calculator?',
      answer:
        'A good calculator shows you a realistic range — not a single "correct" price — and explains where the numbers come from. This free tool uses fixed benchmark bands (Entry $15–$40/hr, Mid $50–$100/hr, Senior $100–$250/hr) labeled as survey estimates, so you always know the result is a starting point.',
    },
    {
      question: 'Is there a free video editor rates calculator?',
      answer:
        'Yes — this calculator is completely free with no signup. Enter your experience level, project hours, and video length to get an estimated hourly range and project total.',
    },
    {
      question: 'How to calculate video editor rates?',
      answer:
        'Multiply your hourly rate by your estimated hours (including revisions), then sanity-check the total against the finished video length. This tool does exactly that using fixed benchmark bands per experience level — treat the result as a starting point and adjust for your niche and client.',
    },
    {
      question: 'How does the video editor rates calculator work?',
      answer:
        'Enter your details using the inputs above and the video editor rates calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the video editor rates calculator free to use?',
      answer:
        'Yes - this video editor rates calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a video editor rates calculator?',
      answer:
        'A video editor rates calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the video editor rates calculator?',
      answer:
        'No account needed. Open the video editor rates calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Benchmark bands (Entry $15–$40, Mid $50–$100, Senior $100–$250 per hour) are survey/market estimates of typical freelance asking rates — NOT official union or guild rates and NOT current verified market data.',
    'Results are starting-point estimates. Real rates vary by niche (weddings, corporate, YouTube), turnaround speed, client budget, and region.',
    'Video length is context only — it does not change the hourly band.',
    'All amounts are USD. No taxes, platform fees, or revision overruns are included.',
  ],
  jsonLd: [
  ],
};
