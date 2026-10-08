import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/video-series-planner/';

const DESCRIPTION =
  'Plan your youtube series planner calendar fast — set episodes, cadence and start date to get dated episodes with intro, deep-dive and finale slots. Try it free.';

export const inputs: ToolInput[] = [
  {
    id: 'seriesTitle',
    label: 'Series title',
    type: 'text',
    required: true,
    placeholder: 'e.g. 30-day drawing challenge',
  },
  {
    id: 'episodeCount',
    label: 'Episode count',
    type: 'number',
    required: true,
    placeholder: 'e.g. 8',
    validation: { min: 2, max: 52 },
  },
  {
    id: 'cadence',
    label: 'Publishing cadence',
    type: 'select',
    required: true,
    options: ['daily', 'twice-weekly', 'weekly', 'biweekly', 'monthly'],
  },
  {
    id: 'startDate',
    label: 'Start date',
    type: 'date',
    required: true,
    placeholder: 'YYYY-MM-DD',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'schedule', label: 'Episode calendar', type: 'table' },
  { id: 'summary', label: 'Series summary', type: 'text' },
  { id: 'endDate', label: 'Final episode date', type: 'text' },
];

export const content: ToolContent = {
  title: 'Youtube Series Planner 2026 – Free Tool | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Enter your series title (e.g. "30-day drawing challenge").',
    'Set the episode count — any whole number from 2 to 52.',
    'Pick a publishing cadence: daily, twice-weekly, weekly, biweekly, or monthly.',
    'Choose your start date (YYYY-MM-DD) and run the planner.',
    'Use the dated episode calendar: EP1 is the intro slot, EP2 onward are deep-dive slots, and the last episode is the finale — rewrite each working title with your real topic.',
  ],
  methodology:
    'Fixed arc template, no AI. Episode 1 is always the intro slot, the last episode is always the finale, and everything between gets a deep-dive working-title slot with a fill-in "[your topic here]" marker. Dates are computed from your start date with fixed steps (daily +1 day, twice-weekly +3 days, weekly +7, biweekly +14, monthly +1 calendar month), in UTC so they never shift with timezones. The tool does not watch your channel or write real titles — it gives you a structured calendar to fill in.',
  examples: [
    {
      title: 'Weekly 8-part challenge',
      inputs: {
        seriesTitle: '30-day drawing challenge',
        episodeCount: 8,
        cadence: 'weekly',
        startDate: '2026-11-02',
      },
      note: 'Intro on Nov 2, six deep-dive slots, finale on Dec 21.',
    },
    {
      title: 'Daily mini-series',
      inputs: {
        seriesTitle: 'guitar basics week',
        episodeCount: 7,
        cadence: 'daily',
        startDate: '2026-12-01',
      },
      note: 'One episode per day for a full week-long arc.',
    },
    {
      title: 'Monthly documentary',
      inputs: {
        seriesTitle: 'van build diaries',
        episodeCount: 6,
        cadence: 'monthly',
        startDate: '2026-10-15',
      },
      note: 'Steps calendar months, so episodes land on the 15th each month.',
    },
  ],
  faqs: [
    {
      question: 'What is the best youtube series planner?',
      answer:
        'The best one is the one you actually follow. A useful planner gives you dated episodes and a clear arc — intro, deep dives, finale — so viewers know what is coming and you know what to film. This free planner builds that calendar from your title, episode count, cadence, and start date.',
    },
    {
      question: 'Is there a free youtube series planner?',
      answer:
        'Yes — this planner is completely free with no signup. Enter your series title, pick 2–52 episodes and a cadence, and you get a dated episode calendar with working-title slots for every episode.',
    },
    {
      question: 'How to plan youtube series?',
      answer:
        'Start with the series promise (one sentence), pick an episode count that fits the topic, choose a cadence you can sustain, and map the arc: episode 1 introduces the series, middle episodes go deep on one sub-topic each, and the finale wraps up. This tool turns those four decisions into a dated calendar.',
    },
    {
      question: 'How does a youtube series planner work?',
      answer:
        'You enter a series title, episode count, publishing cadence, and start date. The planner steps forward by fixed intervals to date every episode, then labels EP1 as the intro, the middle episodes as deep-dive slots, and the last episode as the finale — with template working titles you rewrite with real topics. No AI is involved; it is date math plus a fixed arc template.',
    },
    {
      question: 'How does the youtube series planner work?',
      answer:
        'Enter your details using the inputs above and the youtube series planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube series planner free to use?',
      answer:
        'Yes - this youtube series planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube series planner?',
      answer:
        'A youtube series planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Assumes you publish exactly on schedule — skipped or shifted uploads need a re-run with a new start date.',
    'Working titles are templates with fill-in slots, not finished titles; rewrite each with your real topic and keywords.',
    'Monthly cadence steps calendar months from the same calendar day (Jan 31 rolls to Feb 28/29); day-based cadences step fixed day counts.',
    'Dates are computed in UTC; a "day" is a calendar date, not a local timezone shift.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Youtube Series Planner 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: DESCRIPTION,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'YouTube Tools',
          item: 'https://husnainblogger.com/tools/youtube/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Video Series Planner',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
