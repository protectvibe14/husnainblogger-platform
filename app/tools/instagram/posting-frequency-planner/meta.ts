import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'postsPerWeek',
    label: 'Posts per week',
    type: 'number',
    required: true,
    placeholder: 'e.g. 3',
    validation: { min: 1, max: 14 },
  },
  {
    id: 'formatReels',
    label: 'Include Reels',
    type: 'boolean',
    required: false,
  },
  {
    id: 'formatCarousel',
    label: 'Include carousels',
    type: 'boolean',
    required: false,
  },
  {
    id: 'formatStories',
    label: 'Include stories',
    type: 'boolean',
    required: false,
  },
  {
    id: 'availableHours',
    label: 'Hours you can spend on content per week',
    type: 'number',
    required: true,
    placeholder: 'e.g. 5',
    validation: { min: 1, max: 168 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'weeklyPlan',
    label: 'Your weekly posting plan',
    type: 'table',
    description:
    'Free how often to post on instagram 2026: One row per post: the day, the format, and the task for that post. Fast, private now.',
  },
  {
    id: 'workloadWarning',
    label: 'Workload check',
    type: 'text',
    description:
    'Whether your plan fits your available hours, or a warning to scale back.',
  },
  {
    id: 'consistencyTips',
    label: 'Consistency tips',
    type: 'list',
    description:
    'Four practical tips for sticking to your posting cadence.',
  },
];

export const content: ToolContent = {
  title: 'Instagram Posting Frequency Planner',
  description:
    'Plan how often to post on Instagram with this posting frequency planner — set posts per week and hours available for an even weekly plan. Try it now!',
  howTo: [
    'Enter how many posts you want to publish in the "Posts per week" field (1 to 14).',
    'Tick the formats you will use: Reels, carousels, and/or stories.',
    'Enter how many hours per week you can spend creating content.',
    'Click run to get your day-by-day weekly plan, a workload check against your hours, and four consistency tips.',
  ],
  methodology:
    'Posts are spread evenly across Monday to Sunday using fixed spacing math, and your chosen formats rotate in a fixed order (Reels, then Carousel, then Stories). Each format carries a fixed per-post time estimate — 90 minutes for a Reel, 60 for a carousel, 20 for a story set — which are estimates, not measured data. If total estimated time exceeds your available hours, the tool raises a workload warning instead of silently overloading you.',
  examples: [
    {
      title: 'Busy student, 3 posts a week',
      inputs: { postsPerWeek: 3, formatReels: true, formatCarousel: true, formatStories: false, availableHours: 6 },
      note: 'Gets a 3-post plan spread across the week with a workload check that fits 6 hours.',
    },
    {
      title: 'Full-time creator, daily posts',
      inputs: { postsPerWeek: 7, formatReels: true, formatCarousel: true, formatStories: true, availableHours: 15 },
      note: 'Gets a full 7-day plan rotating all three formats, plus four consistency tips.',
    },
  ],
  faqs: [
    {
      question: 'What is the best how often to post on instagram?',
      answer:
        'The best frequency is the one you can sustain for months — consistency beats bursts. Many creators post 3-5 times per week. Enter your target and your available hours in this planner to get a realistic weekly plan that fits your schedule instead of burning you out.',
    },
    {
      question: 'Is there a free how often to post on instagram?',
      answer:
        'Yes — this Posting Frequency Planner is completely free with no signup. Set your posts per week, pick your formats, and enter your available hours to get an instant weekly plan with a workload check.',
    },
    {
      question: 'How to use how often to post on instagram?',
      answer:
        'Enter how many posts you want per week (1-14), tick the formats you use, and add how many hours you can spend creating content. The tool spreads your posts evenly across the week, rotates your formats, and warns you if the workload exceeds your available time.',
    },
    {
      question: 'What is a how often to post on instagram?',
      answer:
        'A how often to post on instagram is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the how often to post on instagram?',
      answer:
        'No account needed. Open the how often to post on instagram, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Per-post time figures (90 min Reel, 60 min carousel, 20 min story set) are estimates — your real creation time may be higher or lower.',
    'The plan does not use your Instagram analytics; it cannot optimize timing or frequency from your real audience data.',
    'Even spacing is a simple starting rule, not a guarantee of better reach.',
  ],
  jsonLd: [],
};
