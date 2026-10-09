import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent, BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/ctr-impressions-log/';

const DESCRIPTION =
  'Track click-through rates manually with this YouTube CTR tracker. Log impressions and clicks per video to learn which titles earn the click.';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  { id: 'date', label: 'Date', type: 'date', required: true },
  { id: 'label', label: 'Video / variant label', type: 'text', required: true, placeholder: 'e.g. Thumbnail A — red text' },
  { id: 'variant', label: 'A/B variant (optional)', type: 'text', required: false, placeholder: 'A, B, C…' },
  { id: 'impressions', label: 'Impressions', type: 'number', required: true, placeholder: 'e.g. 1000' },
  { id: 'clicks', label: 'Clicks', type: 'number', required: true, placeholder: 'e.g. 45' },
];

export const trackerMode: 'log' = 'log';

export const outputs: ToolOutput[] = [
  { id: 'entryCount', label: 'Logged entries', type: 'number' },
  { id: 'totalImpressions', label: 'Total impressions', type: 'number' },
  { id: 'totalClicks', label: 'Total clicks', type: 'number' },
  { id: 'overallCtr', label: 'Overall CTR', type: 'percent' },
  { id: 'summary', label: 'Plain-English summary', type: 'text' },
  { id: 'entriesTable', label: 'Per-entry CTR table', type: 'table' },
  { id: 'bestEntry', label: 'Best entry', type: 'text' },
  { id: 'worstEntry', label: 'Worst entry', type: 'text' },
  { id: 'trend', label: 'Trend direction', type: 'text' },
  { id: 'periodAggregates', label: 'Aggregates by day, week or month', type: 'list' },
  { id: 'csv', label: 'Download CSV', type: 'download' },
  { id: 'guidance', label: 'What the numbers mean', type: 'list' },
];

export const content: ToolContent = {
  title: 'Youtube CTR Tracker',
  description: DESCRIPTION,
  howTo: [
    'Every time you check YouTube Studio, jot down one entry: the date, the video or thumbnail label, its impressions, and its clicks.',
    "Keep adding entries — daily or weekly. They stay saved in your browser, and the log rejects duplicates so you can't accidentally double-count a video.",
    'Hit run and scan the table: CTR per entry, aggregates by day, week, or month, and your best and worst performers at a glance.',
    "Give it entries across at least 3 different days before trusting the trend line — it needs that much data to call it up, flat, or down.",
    'Export the CSV whenever you like. It is your backup: clearing site data wipes the in-browser log.',
  ],
  methodology:
    'Pure client-side stats on entries you log yourself: CTR = clicks ÷ impressions × 100 per entry (entries with 0 impressions are guarded at 0%), impression-weighted overall CTR, best/worst ranked by per-entry CTR, and trend direction from an ordinary-least-squares slope on the daily CTR series (|slope| < 0.05 points/day = flat). The tool cannot import YouTube Studio analytics — that requires OAuth/API access — so every figure describes only your logged sample.',
  faqs: [
    {
      question: 'what is the best youtube ctr tracker?',
      answer:
        'The best tracker shows CTR per video over time, aggregates by day/week/month, and flags best/worst performers and trend direction — not just a single number. This free tool does exactly that on a manual log you keep: date, label, impressions, clicks. It cannot pull YouTube Studio data automatically.',
    },
    {
      question: 'is there a free youtube ctr tracker?',
      answer:
        'Yes — this tool is completely free with no signup. Log entries manually (date, video label, impressions, clicks), get per-entry CTR, period aggregates, trend direction, and a CSV export. Entries are stored in your browser, never on a server.',
    },
    {
      question: 'how to track youtube ctr?',
      answer:
        'Record impressions and clicks per video over time, then compute CTR as clicks ÷ impressions × 100 and watch the trend across days or weeks. This tool does the math for you: log each data point once, and it builds the per-entry table, aggregates, and trend — just note it cannot import YouTube Studio analytics without an API connection.',
    },
    {
      question: 'how does a youtube ctr tracker work?',
      answer:
        'You log impressions and clicks per video (or per thumbnail variant) with dates; the tracker computes per-entry CTR, aggregates it by day, week, or month, ranks best/worst entries, and derives trend direction from the daily series. This one is manual — no YouTube API, no automatic imports — so it only ever describes the entries you logged.',
    },
    {
      question: 'How does the youtube ctr tracker work?',
      answer:
        'Enter your details using the inputs above and the youtube ctr tracker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube ctr tracker free to use?',
      answer:
        'Yes - this youtube ctr tracker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube ctr tracker?',
      answer:
        'A youtube ctr tracker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Manual log only: the tool cannot import YouTube Studio analytics (that needs OAuth/API); figures describe the logged sample, not the channel.',
    'Entries are stored in your browser by the UI layer — clearing site data wipes the log, so export the CSV for backup.',
    'Entries with 0 impressions are reported at 0% CTR (division guarded); trend needs entries across at least 3 different days.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Youtube CTR Tracker 2026 – Free Tool | HusnainBlogger',
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
        { '@type': 'ListItem', position: 3, name: 'YouTube Tools', item: 'https://husnainblogger.com/tools/youtube/' },
        { '@type': 'ListItem', position: 4, name: 'CTR & Impressions Log', item: TOOL_URL },
      ],
    },
  ],
};
