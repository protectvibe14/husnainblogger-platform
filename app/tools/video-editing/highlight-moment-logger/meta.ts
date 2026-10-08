import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

// tool-286 — Highlight Moment Logger. Builder tool (tracker shape converted to
// honest builder): inputs: [] (uses itemFields). Session-based — NO persistence;
// the user exports CSV to keep the log. Timestamps are user-logged, not detected.

export const inputs: ToolInput[] = [];

export const trackerMode: 'log' = 'log';

export const outputs: ToolOutput[] = [
  { id: 'logSummary', label: 'Session summary', type: 'text' },
  { id: 'topMoments', label: 'Top moments (by rating)', type: 'list' },
  { id: 'exportCsv', label: 'Log as CSV', type: 'download' },
];

export const itemFields: BuilderField[] = [
  {
    id: 'label',
    label: 'Moment label',
    type: 'text',
    required: true,
    placeholder: 'e.g. the big save, funny reaction',
  },
  {
    id: 'timestamp',
    label: 'Timestamp',
    type: 'text',
    required: true,
    placeholder: 'mm:ss (e.g. 01:30) or milliseconds (e.g. 90500)',
  },
  {
    id: 'rating',
    label: 'Rating (1–5)',
    type: 'text',
    required: true,
    placeholder: 'Whole number from 1 to 5',
  },
];

const DESCRIPTION =
  'Log every highlight with this free video timestamp logger: note the timestamp, label and rating for each moment, get a top-moments summary and CSV. Try it now.';

export const content: ToolContent = {
  title: 'Video Timestamp Logger 2026 – Free Tool | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Add one item per highlight moment you want to log.',
    'Give each moment a short label, e.g. "the big save" or "plot twist".',
    'Enter the timestamp as mm:ss (e.g. 01:30) or in milliseconds (e.g. 90500).',
    'Rate the moment from 1 to 5 so your best moments rise to the top.',
    'Run the tool to see your session summary and top-moments list.',
    'Download the CSV export to keep your log — the tool stores nothing between sessions.',
  ],
  methodology:
    'You enter every moment by hand — this tool does not watch your video, detect highlights, or save anything. It validates your labels, timestamps and 1–5 ratings, sorts the top 5 moments by rating (earliest first on ties), and formats the full log as CSV. Duplicate timestamps are kept and flagged in the summary, never silently merged.',
  faqs: [
    {
      question: 'What is the best video timestamp logger?',
      answer:
        'The best video timestamp logger is one that stays out of your way while you watch: fast to enter a timestamp, a label, and a quick rating so you can mark clip-worthy moments in real time. This free tool does exactly that in your browser — log moments, see a top-moments summary, and export a CSV for your editor.',
    },
    {
      question: 'Is there a free video timestamp logger?',
      answer:
        'Yes — this video timestamp logger is free and runs entirely in your browser with no signup. You log each moment yourself with a timestamp, label and 1–5 rating, then export your log as CSV to keep or share.',
    },
    {
      question: 'How to log video timestamp?',
      answer:
        'While watching your footage, note the time (mm:ss), write a short label like "funny reaction", and give it a 1–5 rating. This tool validates each entry, ranks your top moments by rating, and builds a CSV you can hand to your editor or open in any spreadsheet.',
    },
    {
      question: 'How does a video timestamp logger work?',
      answer:
        'You manually mark moments as you review footage — the logger only organizes what you enter. This tool sorts your highest-rated moments to the top, flags duplicate timestamps, and produces a CSV export. It does not detect highlights automatically and does not save your session; export the CSV to keep your log.',
    },
    {
      question: 'How does the video timestamp logger work?',
      answer:
        'Enter your details using the inputs above and the video timestamp logger calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the video timestamp logger free to use?',
      answer:
        'Yes - this video timestamp logger is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a video timestamp logger?',
      answer:
        'A video timestamp logger is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Session-based only: nothing is saved between page loads — export the CSV to keep your log.',
    'Timestamps are entered by you; the tool cannot detect highlights in your footage.',
    'Ratings are your own 1–5 judgment; the tool does not score clip quality or predict performance.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Video Timestamp Logger 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/video-editing/highlight-moment-logger/',
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
          name: 'Video Editing Tools',
          item: 'https://husnainblogger.com/tools/video-editing/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Highlight Moment Logger',
          item: 'https://husnainblogger.com/tools/video-editing/highlight-moment-logger/',
        },
      ],
    },
  ],
};
