import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/ai-workflows/email-sequence-planner/';

export const inputs: ToolInput[] = [
  {
    id: 'sequenceGoal',
    label: 'Sequence goal',
    type: 'select',
    required: true,
    options: ['welcome', 'nurture', 'sales', 're-engagement'],
  },
  {
    id: 'emailCount',
    label: 'Number of emails',
    type: 'number',
    required: true,
    placeholder: 'e.g. 5',
    validation: { min: 2, max: 12 },
  },
  {
    id: 'daysBetween',
    label: 'Days between emails',
    type: 'number',
    required: true,
    placeholder: 'e.g. 2',
    validation: { min: 0, max: 14 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'schedule',
    label: 'Send calendar',
    type: 'table',
    description:
    'Free email sequence planner 2026: Day-by-day grid: email number, send day, subject slot, and purpose per email. Fast, private now.',
  },
  {
    id: 'summary',
    label: 'Sequence summary',
    type: 'text',
    description:
    'One-line summary of email count, spacing, and finish day.',
  },
];

export const content: ToolContent = {
  title: 'Email Sequence Planner',
  description:
    'Plan your email sequence with a free email sequence planner. Pick a goal, set email count and spacing, and get a day-by-day send calendar. Plan yours now.',
  howTo: [
    'Choose your sequence goal: welcome, nurture, sales, or re-engagement.',
    'Enter the number of emails (2–12).',
    'Enter the days between emails (0–14; 0 sends everything on day 1).',
    'Run the tool to get your day-by-day send calendar with subject slots and purposes.',
    'Fill in the [bracket] placeholders in each subject slot with your own details.',
  ],
  methodology:
    'The planner does pure grid arithmetic: email #i is scheduled on day 1 + round((i-1) x days-between), with fractional gaps rounded to whole days. Subject lines are fixed template slots (96 fixed strings across 4 goals x 12 emails) with placeholders you fill in — no email copy is written for you.',
  examples: [
    {
      title: '5-email welcome sequence',
      inputs: { sequenceGoal: 'welcome', emailCount: 5, daysBetween: 2 },
      note: 'New-subscriber onboarding over 9 days.',
    },
    {
      title: '7-email product launch',
      inputs: { sequenceGoal: 'sales', emailCount: 7, daysBetween: 1 },
      note: 'Daily launch sequence finishing on day 7.',
    },
    {
      title: '3-email re-engagement burst',
      inputs: { sequenceGoal: 're-engagement', emailCount: 3, daysBetween: 4 },
      note: 'Win-back series for cold subscribers.',
    },
  ],
  faqs: [
    {
      question: 'What is the best email sequence planner?',
      answer:
        'The best planner matches your goal: this free tool builds welcome, nurture, sales, and re-engagement sequences into a day-by-day send calendar with subject slots and purposes, so you can see the whole series before writing a word.',
    },
    {
      question: 'Is there a free email sequence planner?',
      answer:
        'Yes — this email sequence planner is completely free with no signup. You get the full send calendar for sequences of 2–12 emails with 0–14 days between sends.',
    },
    {
      question: 'How to plan email sequence?',
      answer:
        'Pick the goal of the series (welcome, nurture, sales, or re-engagement), decide how many emails it needs and how far apart to send them, then map each email to a send day, a subject slot, and a purpose. This tool does the mapping; you write the copy.',
    },
    {
      question: 'How does an email sequence planner work?',
      answer:
        'It turns your goal, email count, and spacing into a calendar grid: each email gets a send day (day 1 + gap x position), a fixed subject-line template slot, and a purpose label. No copy is written — it plans the structure only.',
    },
    {
      question: 'How does the email sequence planner work?',
      answer:
        'Enter your details using the inputs above and the email sequence planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the email sequence planner free to use?',
      answer:
        'Yes - this email sequence planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an email sequence planner?',
      answer:
        'An email sequence planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Subject slots are fixed template patterns with [bracket] placeholders — no actual email copy is written. You write the emails yourself.',
    'Sequences are capped at 12 emails and 14 days between sends; longer campaigns need multiple plans.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Email Sequence Planner 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free email sequence planner 2026: Day-by-day grid: email number, send day, subject slot, and purpose per email. Fast, private now.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'AI Workflow Tools',
          item: 'https://husnainblogger.com/tools/ai-workflows/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Email Sequence Planner',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
