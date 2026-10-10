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
    description:
    'Free best time to post on instagram 2026: One slot per selected day: audience-local window, your-timezone conversion, and rationale. Fast, private -.',
  },
  {
    id: 'disclaimerNoLiveData',
    label: 'Live-data disclaimer',
    type: 'text',
    description:
    'Explains that slots are generic guidance — the tool cannot see your Insights.',
  },
];

export const content: ToolContent = {
  title: 'Instagram Posting Time Planner',
  description:
    'Get one ideal slot per day with this Instagram posting time planner — audience-local windows, your-timezone conversion, and rationale. Try it now!',
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
      question: 'My audience is spread across regions — which do I pick?',
      answer:
        'Pick the region where most of your followers live — the planner converts that region\'s generic peak windows into your own timezone. If your audience is truly split (say, US and India), generate once for each region and look for overlapping windows. Then test for a few weeks and let your own Instagram Insights settle the debate.',
    },
    {
      question: 'How is this different from Googling \'best time to post on Instagram\'?',
      answer:
        'Static lists give one-size-fits-all clock times with no timezone context. This planner takes your audience region and your timezone, converts the region\'s routine-based windows (lunch-break scroll, morning routine, evening unwind) into your local time, and spreads them across the days you actually post — with a rationale per slot and an honest disclaimer that these are starting points, not your account\'s live data.',
    },
    {
      question: 'Does daylight saving time affect the slots?',
      answer:
        'The tool converts region windows to your timezone using fixed standard UTC offsets, so it does not adjust for daylight saving. If your region observes DST, the converted slots may sit about an hour off during the summer months — treat them as approximate windows and confirm the winners in your Insights.',
    },
    {
      question: 'Will the planner use my actual follower activity?',
      answer:
        'No — it cannot see your account, so it works from generic region tables instead of your real data. That is exactly why every result carries a disclaimer. For your true peak hours, open Instagram Insights (Professional dashboard, then Audience, then most active times) and compare those hours against the starting slots from the planner.',
    },
  ],
  assumptions: [
    'No live data: the tool cannot read your Instagram Insights and does not know when your followers are actually online.',
    'Times are generic daily-routine patterns, not measured engagement data for any region or account.',
    'Timezone conversion uses fixed standard UTC offsets and ignores daylight saving — shift windows by an hour yourself when DST applies.',
    'Days with no region-specific slot get a generic midday fallback, clearly labeled as such.',
  ],
  jsonLd: [],
};
