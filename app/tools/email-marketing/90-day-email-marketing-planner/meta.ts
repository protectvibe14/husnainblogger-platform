import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/email-marketing/90-day-email-marketing-planner/';

export const inputs: ToolInput[] = [
  { id: 'startDate', label: 'Start date', type: 'date', required: true },
  {
    id: 'emailsPerWeek',
    label: 'Emails per week',
    type: 'number',
    required: true,
    placeholder: '2',
    validation: { min: 1, max: 7 },
  },
  {
    id: 'goalMix',
    label: 'Goal mix (nurture / promo / content)',
    type: 'select',
    required: true,
    options: [
      'Nurture 60% / Promo 20% / Content 20%',
      'Nurture 50% / Promo 30% / Content 20%',
      'Nurture 40% / Promo 30% / Content 30%',
      'Nurture 70% / Promo 20% / Content 10%',
      'Nurture 30% / Promo 40% / Content 30%',
    ],
  },
  {
    id: 'blackoutDates',
    label: 'Blackout dates (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'One YYYY-MM-DD date per line, e.g.\n2026-12-25',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'calendar',
    label: '90-day calendar',
    type: 'table',
    description: 'Free email marketing plan template 2026: Date, email type, and content pillar for every planned send across the 90 days. Fast, private, no signup - try it now!',
  },
  {
    id: 'milestones',
    label: 'Milestones',
    type: 'list',
    description: 'Day 1 / 30 / 60 / 90 checkpoints with cumulative send counts.',
  },
  {
    id: 'totals',
    label: 'Plan totals',
    type: 'text',
    description: 'Total planned emails broken down by pillar, plus skipped blackout dates.',
  },
];

export const content: ToolContent = {
  title: 'Email Marketing Plan Template',
  description:
    'Build a 90-day email marketing plan template in seconds. Pick a start date, weekly frequency, and goal mix to get a full calendar plus milestones. Free!',
  howTo: [
    'Pick the plan start date and how many emails you will send per week (1–7).',
    'Choose your goal mix — the nurture/promo/content split you want (your input, not a recommendation).',
    'Optionally list blackout dates (one YYYY-MM-DD per line) to skip holidays.',
    'Run the tool to get the 90-day calendar, day 30/60/90 milestones, and totals.',
    'Work the plan week by week, then compare milestone checkpoints against your own open and click data.',
  ],
  methodology:
    'The planner does client-side date arithmetic only: it walks 90 days from your start date in UTC, places sends on fixed weekdays per your frequency (e.g. 2/week = Tue and Thu), interleaves your chosen goal mix through a fixed 10-slot pattern, cycles 6 sub-topics per pillar, and skips your blackout dates. No AI, no network, and no recommendation about which mix to choose — the mix is your input.',
  examples: [
    {
      title: 'Twice-weekly nurture plan',
      inputs: {
        startDate: '2026-10-06',
        emailsPerWeek: 2,
        goalMix: 'Nurture 60% / Promo 20% / Content 20%',
        blackoutDates: '',
      },
      note: '26 sends on Tue/Thu across 90 days, mostly nurture with promo and content woven in.',
    },
    {
      title: 'Daily plan skipping a holiday',
      inputs: {
        startDate: '2026-11-01',
        emailsPerWeek: 7,
        goalMix: 'Nurture 40% / Promo 30% / Content 30%',
        blackoutDates: '2026-12-25',
      },
      note: '89 sends (one skipped for the blackout date), balanced across all three pillars.',
    },
  ],
  faqs: [
    {
      question: 'What is the best email marketing plan template?',
      answer:
        'The best email marketing plan template maps 90 days of sends to dates, types, and content pillars while respecting your frequency and blackout dates. This free planner builds exactly that from your start date, emails per week, and goal mix — then adjust the plan against your own open and click data at each milestone.',
    },
    {
      question: 'Is there a free email marketing plan template?',
      answer:
        'Yes — this 90-day email marketing planner is completely free with no signup. You get a full send calendar, day 30/60/90 milestone checkpoints, and per-pillar totals you can copy into your own planning doc.',
    },
    {
      question: 'How to use email marketing plan?',
      answer:
        'Enter a start date, your weekly send frequency, and the nurture/promo/content mix you want, plus any blackout dates. Run the tool, then work the calendar week by week — the milestones at day 30, 60, and 90 are your natural review points.',
    },
    {
      question: 'How does an email marketing plan template work?',
      answer:
        'It turns your inputs into a dated schedule: sends are placed on fixed weekdays per your frequency, your chosen mix is interleaved across the 90 days, each send gets a rotating content-pillar topic, and blackout dates are skipped. This template does all of that locally and deterministically — the goal mix stays your choice, not a recommendation.',
    },
    {
      question: 'How does the email marketing plan template work?',
      answer:
        'Enter your details using the inputs above and the email marketing plan template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the email marketing plan template free to use?',
      answer:
        'Yes - this email marketing plan template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an email marketing plan template?',
      answer:
        'An email marketing plan template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The goal mix is your input, not a recommendation — the planner does not advise which split performs best.',
    'Send weekdays are fixed per frequency (e.g. 2/week = Tue and Thu); all date math is done in UTC.',
    'Milestone advice (review opens/clicks, double down on winners) is general guidance, not a performance guarantee.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Email Marketing Plan Template 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free email marketing plan template 2026: Date, email type, and content pillar for every planned send across the 90 days. Fast, private, no signup - try it now!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Email Marketing Tools',
          item: 'https://husnainblogger.com/tools/email-marketing/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: '90-Day Email Marketing Planner',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
