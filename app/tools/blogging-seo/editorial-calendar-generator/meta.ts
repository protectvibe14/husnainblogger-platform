import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. home baking',
    validation: { min: 2, max: 80 },
  },
  {
    id: 'postsPerWeek',
    label: 'Posts per week',
    type: 'number',
    required: true,
    placeholder: '3',
    validation: { min: 1, max: 7 },
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
  {
    id: 'calendar',
    label: 'Editorial calendar',
    type: 'table',
    description:
    'Free editorial calendar generator 2026: 4-week calendar: week, date, day, post title, content type and status. Fast, private now.',
  },
  {
    id: 'csv',
    label: 'Calendar CSV',
    type: 'download',
    description:
    'The same calendar as comma-separated values for spreadsheets.',
  },
  {
    id: 'totalPosts',
    label: 'Total posts',
    type: 'number',
    description:
    'Number of planned posts (posts per week × 4 weeks).',
  },
];

export const content: ToolContent = {
  title: 'Editorial Calendar Generator',
  description:
    'Build a 4-week editorial calendar in seconds: dated post ideas, content types and a spreadsheet-ready CSV spread across your week. Free — start.',
  howTo: [
    'Type your niche into the Niche field (2-80 characters).',
    'Set how many posts you want per week (1-7).',
    'Pick a start date in YYYY-MM-DD format.',
    'Click Generate to build the 4-week calendar with evenly spread posting days.',
    'Review the dated post ideas and download the CSV for your spreadsheet.',
  ],
  methodology:
    'The generator spreads your weekly posts evenly across 7-day weeks measured from your start date (3/week lands on offsets 0, 2 and 4; 1/week on day 0) and repeats for 4 fixed weeks. Each post gets a title from a fixed bank of 28 niche-filled templates and a content-type label cycled from a fixed list of 7 (how-to, listicle, guide, opinion, case study, review, roundup). All date math is done in UTC so results are identical in every timezone. No AI and no live data are used.',
  examples: [
    {
      title: 'Steady 3-post rhythm',
      inputs: { niche: 'home baking', postsPerWeek: 3, startDate: '2026-10-05' },
      note: 'Produces 12 dated posts over 4 weeks with cycling content types.',
    },
    {
      title: 'Daily publishing',
      inputs: { niche: 'personal finance', postsPerWeek: 7, startDate: '2026-11-01' },
      note: 'Produces 28 dated posts — one per day for 4 weeks.',
    },
    {
      title: 'Slow and steady',
      inputs: { niche: 'urban gardening', postsPerWeek: 1, startDate: '2026-10-05' },
      note: 'Produces 4 weekly posts, each on the start weekday.',
    },
  ],
  faqs: [
    {
      question: 'What is the best editorial calendar generator?',
      answer:
        'There is no independently verified "best" — look for transparency. This free generator shows its exact method: fixed post-idea templates spread evenly across 4 weeks with a CSV export. It does not research headlines or track publishing; paid editorial suites add workflow features.',
    },
    {
      question: 'Is there a free editorial calendar generator?',
      answer:
        'Yes — this one is completely free with no signup. Enter your niche, posts per week and start date to get a dated 4-week calendar plus a spreadsheet-ready CSV. Post titles are template starting points, not researched headlines.',
    },
    {
      question: 'How to generate editorial?',
      answer:
        'Decide your niche, a sustainable weekly cadence (1-7 posts) and a start date — then generate the calendar. Enter those above and the tool lays out 4 weeks of dated post ideas with content types you can export to a spreadsheet.',
    },
    {
      question: 'How does an editorial calendar generator work?',
      answer:
        'This one spreads your weekly post count evenly across each 7-day week from your start date, assigns each post a title from a fixed bank of 28 templates filled with your niche, and cycles content-type labels. It is template assembly, not AI — the same inputs always give the same calendar.',
    },
    {
      question: 'What is an editorial calendar generator?',
      answer:
        'An editorial calendar generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Post titles come from a fixed bank of 28 templates — starting ideas, not researched headlines; rewrite for the SERP.',
    'The calendar always covers 4 weeks; export the CSV and extend it for longer horizons.',
    'Every entry is labeled "planned" — this tool tracks nothing and sends no reminders.',
    'Start dates must be real calendar dates in YYYY-MM-DD form.',
  ],
  jsonLd: [],
};
