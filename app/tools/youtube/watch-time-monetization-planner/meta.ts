import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/watch-time-monetization-planner/';

const DESCRIPTION =
  'Plan your path to monetization with this 4000 watch hours calculator — see exactly how many views you need at your average watch time. Set a timeline.';

export const inputs: ToolInput[] = [
  {
    id: 'path',
    label: 'Monetization path',
    type: 'select',
    required: true,
    options: ['long-form', 'shorts'],
  },
  {
    id: 'currentWatchHours',
    label: 'Current valid public watch hours (last 12 months)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 2500',
    validation: { min: 0 },
  },
  {
    id: 'currentShortsViews',
    label: 'Current valid public Shorts views (last 90 days)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 9000000',
    validation: { min: 0 },
  },
  {
    id: 'subscribers',
    label: 'Subscribers',
    type: 'number',
    required: false,
    placeholder: 'e.g. 800',
    validation: { min: 0 },
  },
  {
    id: 'uploadsLast90Days',
    label: 'Public uploads in the last 90 days',
    type: 'number',
    required: false,
    placeholder: 'e.g. 12',
    validation: { min: 0 },
  },
  {
    id: 'avgViewsPerDay',
    label: 'Average views per day',
    type: 'number',
    required: false,
    placeholder: 'e.g. 1000',
    validation: { min: 0 },
  },
  {
    id: 'avgViewDurationMinutes',
    label: 'Average view duration (minutes, long-form)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 6',
    validation: { min: 0 },
  },
  {
    id: 'targetDate',
    label: 'Target date (optional)',
    type: 'date',
    required: false,
  },
];

export const outputs: ToolOutput[] = [
  { id: 'threshold', label: 'Threshold', type: 'text' },
  { id: 'current', label: 'Current total', type: 'number' },
  { id: 'remaining', label: 'Remaining', type: 'number' },
  { id: 'estimatedDays', label: 'Estimated days at current pace', type: 'number' },
  { id: 'paceSummary', label: 'Pace summary', type: 'text' },
  { id: 'requiredDailyPace', label: 'Daily pace for target date', type: 'text' },
  { id: 'fanFunding', label: 'Fan-funding tier progress', type: 'text' },
  { id: 'warnings', label: 'Warnings', type: 'list' },
  { id: 'disclaimer', label: 'Disclaimer', type: 'text' },
  { id: 'isEstimate', label: 'Estimate flag', type: 'text' },
];

export const content: ToolContent = {
  title: '4000 Watch Hours Calculator',
  description: DESCRIPTION,
  howTo: [
    'Pick your monetization path: long-form (4,000 watch hours) or Shorts (10M views).',
    'Enter your current valid public watch hours or Shorts views from YouTube Studio > Earn.',
    'Add average views per day and average view duration so the planner can project a date.',
    'Optionally add subscribers and uploads in the last 90 days to check the fan-funding tier.',
    'Optionally set a target date to see the daily pace you would need to hit it.',
    'Treat every projection as an estimate — verify real progress in YouTube Studio.',
  ],
  methodology:
    'The planner compares your entered totals against the verified YPP thresholds (4,000 valid public watch hours in 12 months, or 10M valid public Shorts views in 90 days, both with 1,000 subscribers). Daily pace is computed as views/day × avg view duration for long-form, or views/day for Shorts; remaining ÷ pace gives estimated days. The fan-funding tier uses 500 subscribers + 3 uploads in 90 days + 3,000 watch hours or 3M Shorts views. Everything is a simplified linear projection labeled as an estimate — no AI, no channel data access.',
  examples: [
    {
      title: 'Long-form channel at 2,500 hours',
      inputs: { path: 'long-form', currentWatchHours: 2500, avgViewsPerDay: 1000, avgViewDurationMinutes: 6 },
      note: '1,500 hours remain; at 100 watch hours/day the estimate is about 15 days.',
    },
    {
      title: 'Shorts channel at 9M views',
      inputs: { path: 'shorts', currentShortsViews: 9000000, avgViewsPerDay: 50000 },
      note: '1M views remain; at 50K views/day the estimate is about 20 days — plus a warning that Shorts hours never count toward the 4,000-hour path.',
    },
  ],
  faqs: [
    {
      question: 'what is the best 4000 watch hours calculator?',
      answer:
        'The best calculator is one that uses the real YPP thresholds and labels its math as an estimate. This free planner checks you against 4,000 valid public watch hours (12-month window) plus 1,000 subscribers, projects days at your current pace, and warns about the rolling window.',
    },
    {
      question: 'is there a free 4000 watch hours calculator?',
      answer:
        'Yes — this planner is completely free with no signup. Enter your watch hours from YouTube Studio > Earn, add your daily pace, and get remaining hours, estimated days, and the daily pace for any target date.',
    },
    {
      question: 'how to calculate 4000 watch hours?',
      answer:
        'Subtract your current valid public watch hours (last 12 months) from 4,000 to get the gap, then divide by your daily watch hours (views/day × avg view duration ÷ 60). This tool does that math and also checks the fan-funding tier and Shorts path.',
    },
    {
      question: 'How does the 4000 watch hours calculator work?',
      answer:
        'Enter your details using the inputs above and the 4000 watch hours calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the 4000 watch hours calculator free to use?',
      answer:
        'Yes - this 4000 watch hours calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a 4000 watch hours calculator?',
      answer:
        'A 4000 watch hours calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the 4000 watch hours calculator?',
      answer:
        'No account needed. Open the 4000 watch hours calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Projections are simplified linear estimates that ignore the rolling window — hours/views older than 12 months (or 90 days for Shorts) expire, so real progress may be slower.',
    'Only valid public watch time counts; Shorts watch hours never count toward the 4,000-hour requirement.',
    'Meeting the thresholds does not guarantee monetization — YouTube\'s policy review and the 1,000-subscriber requirement still apply.',
  ],
  jsonLd: [
  ],
};
