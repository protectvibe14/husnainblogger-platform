import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/best-time-to-post-planner/';

export const inputs: ToolInput[] = [
  {
    id: 'audienceRegion',
    label: 'Audience region',
    type: 'select',
    required: true,
    options: [
      'North America',
      'Europe',
      'UK & Ireland',
      'Latin America',
      'Middle East',
      'Asia Pacific',
      'Africa',
      'Global / not sure',
    ],
  },
  {
    id: 'userTimezone',
    label: 'Your timezone',
    type: 'select',
    required: true,
    options: [
      'UTC-8', 'UTC-7', 'UTC-6', 'UTC-5', 'UTC-4', 'UTC-3',
      'UTC-2', 'UTC-1', 'UTC+0', 'UTC+1', 'UTC+2', 'UTC+3',
      'UTC+4', 'UTC+5', 'UTC+6', 'UTC+7', 'UTC+8', 'UTC+9',
      'UTC+10', 'UTC+11', 'UTC+12',
    ],
  },
  {
    id: 'monday',
    label: 'Post on Monday',
    type: 'boolean',
    required: false,
  },
  {
    id: 'tuesday',
    label: 'Post on Tuesday',
    type: 'boolean',
    required: false,
  },
  {
    id: 'wednesday',
    label: 'Post on Wednesday',
    type: 'boolean',
    required: false,
  },
  {
    id: 'thursday',
    label: 'Post on Thursday',
    type: 'boolean',
    required: false,
  },
  {
    id: 'friday',
    label: 'Post on Friday',
    type: 'boolean',
    required: false,
  },
  {
    id: 'saturday',
    label: 'Post on Saturday',
    type: 'boolean',
    required: false,
  },
  {
    id: 'sunday',
    label: 'Post on Sunday',
    type: 'boolean',
    required: false,
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'suggestedSlots',
    label: 'Suggested posting slots',
    type: 'list',
    description: 'Free best time to post on instagram 2026: One slot per selected day: audience-local window, your-timezone conversion, and rationale. Fast, private, no signup -!',
  },
  {
    id: 'disclaimerNoLiveData',
    label: 'Live-data disclaimer',
    type: 'text',
    description: 'Explains that slots are generic guidance — the tool cannot see your Insights.',
  },
];

export const content: ToolContent = {
  title: 'Best Time To Post On Instagram',
  description:
    'Plan the best time to post on Instagram for free: pick your audience region and timezone for generic slot suggestions. Get your schedule now!',
  howTo: [
    'Choose your Audience Region from the dropdown (or Global / not sure).',
    'Choose Your Timezone so slots convert from audience-local time to your clock.',
    'Toggle off any day you cannot post — leave all on for a full-week schedule.',
    'Click Generate to get one posting slot per selected day with its rationale.',
    'Treat these as starting points: confirm the real winners in your Instagram Insights.',
  ],
  methodology:
    'Slots come from fixed region tables — 8 regions x 6 generic daily-routine slots (lunch-break scroll, morning routine, evening unwind) — not measured engagement data. Days you select that have no region slot get a generic midday fallback. Windows convert from the region’s reference offset to your timezone with fixed standard UTC offsets (daylight saving ignored). No AI, no live data.',
  examples: [
    {
      title: 'US audience, New York timezone',
      inputs: { audienceRegion: 'North America', userTimezone: 'UTC-5' },
      note: 'Returns one slot per day — e.g. Monday audience 12:00–13:30, which matches UTC-5 with no shift.',
    },
    {
      title: 'European audience from the US West Coast',
      inputs: { audienceRegion: 'Europe', userTimezone: 'UTC-8' },
      note: 'Converts audience-local windows to UTC-8, e.g. a 12:00 audience lunch slot shows as 03:00 your time.',
    },
  ],
  faqs: [
    {
      question: 'What is the best best time to post on instagram?',
      answer:
        'There is no single verified best time — it depends on when YOUR followers are online. This free planner gives generic rule-of-thumb slots by audience region (converted to your timezone), but the honest answer is: check your own Instagram Insights for your account’s real peak hours.',
    },
    {
      question: 'Is there a free best time to post on instagram?',
      answer:
        'Yes — this planner is completely free with no signup. Pick your audience region and timezone, choose the days you can post, and it suggests one slot per day with a rationale. Every result carries a disclaimer that the slots are generic guidance, not your account’s live data.',
    },
    {
      question: 'How to use best time to post on instagram?',
      answer:
        'Select your audience region and your timezone, leave on the days you can post, and click Generate. Each slot shows the window in your audience’s local time and converted to your time. Test these slots for a few weeks, then compare against your Insights and keep what actually works.',
    },
    {
      question: 'How does the best time to post on instagram work?',
      answer:
        'Enter your details using the inputs above and the best time to post on instagram calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the best time to post on instagram free to use?',
      answer:
        'Yes - this best time to post on instagram is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a best time to post on instagram?',
      answer:
        'A best time to post on instagram is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the best time to post on instagram?',
      answer:
        'No account needed. Open the best time to post on instagram, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'No live data: the tool cannot read your Instagram Insights and does not know when your followers are actually online.',
    'Times are generic daily-routine patterns, not measured engagement data for any region or account.',
    'Timezone conversion uses fixed standard UTC offsets and ignores daylight saving — shift windows by an hour yourself when DST applies.',
    'Days with no region-specific slot get a generic midday fallback, clearly labeled as such.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Best Time To Post On Instagram 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free best time to post on instagram 2026: One slot per selected day: audience-local window, your-timezone conversion, and rationale. Fast, private, no signup -!',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Instagram Tools',
          item: 'https://husnainblogger.com/tools/instagram/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Best Time to Post Planner',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
