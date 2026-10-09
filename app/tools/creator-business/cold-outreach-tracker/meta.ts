import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent, BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/cold-outreach-tracker/';
const DESCRIPTION =
  'Cold outreach tracker: log every prospect in one free pipeline, flag due follow-ups, see reply and win counts, and export to CSV. Start tracking today!';

export const inputs: ToolInput[] = [];

export const trackerMode: 'log' = 'log';

export const outputs: ToolOutput[] = [
  { id: 'pipelineView', label: 'Pipeline view (counts by status)', type: 'list' },
  { id: 'followUpDueList', label: 'Follow-ups due', type: 'list' },
  { id: 'conversionStats', label: 'Conversion stats', type: 'list' },
  {
    id: 'exportableCSV',
    label: 'CSV export (copy or download)',
    type: 'copy',
    description:
    'Your prospects as CSV text — copy or download it to keep a permanent copy.',
  },
];

/**
 * BuilderField only supports text/url, and BuilderTemplate renders each
 * field as a plain text input, so `status` is a required text field whose
 * placeholder names the 6 valid statuses; logic.ts validates strictly.
 * Dates are text fields expecting YYYY-MM-DD (validated in logic.ts).
 */
export const itemFields: BuilderField[] = [
  { id: 'name', label: 'Prospect name', type: 'text', required: true, placeholder: 'e.g. Sarah Chen' },
  { id: 'company', label: 'Company', type: 'text', placeholder: 'e.g. Acme Studio' },
  { id: 'contact', label: 'Contact', type: 'text', placeholder: 'e.g. sarah@acme.co or +1 555-0100' },
  {
    id: 'status',
    label: 'Pipeline status',
    type: 'text',
    required: true,
    placeholder: 'new | contacted | replied | meeting | won | lost',
  },
  { id: 'dateContacted', label: 'Date contacted', type: 'text', placeholder: 'YYYY-MM-DD (optional)' },
  { id: 'followUpDate', label: 'Follow-up date', type: 'text', placeholder: 'YYYY-MM-DD (optional)' },
  { id: 'notes', label: 'Notes', type: 'text', placeholder: 'optional notes about this prospect' },
];

export const content: ToolContent = {
  title: 'Cold Outreach Tracker',
  description: DESCRIPTION,
  howTo: [
    'Add one row per prospect: name (required) and pipeline status (required: new, contacted, replied, meeting, won, or lost).',
    'Fill in company, contact info, the date you contacted them, and a follow-up date (YYYY-MM-DD).',
    'Add notes about each conversation so you remember the context.',
    'Build to see your pipeline counts, who is due for a follow-up, and your reply/win rates.',
    'Copy or download the CSV export — entries are session-based, so the export is how you keep your data.',
  ],
  methodology:
    'This tool is a session-based builder, not a saved database: it takes the prospect records you enter, counts them across the six fixed pipeline statuses, lists records whose follow-up date is on or before today (excluding won/lost), and computes reply and win rates as simple counts from your entries. The CSV export escapes fields per RFC 4180 so it opens cleanly in any spreadsheet app. Nothing is persisted — export the CSV to keep it.',
  faqs: [
    {
      question: 'What is the best cold outreach tracker?',
      answer:
        'The best tracker is the one you update daily. Options range from spreadsheets to full CRMs. This free tool gives you pipeline counts by status, a follow-up due list, conversion stats, and a CSV export from the prospects you enter — choose whichever fits your volume and budget.',
    },
    {
      question: 'Is there a free cold outreach tracker?',
      answer:
        'Yes — this tracker is completely free with no signup. One honest limit: entries are session-based, not saved in your browser or on a server, so export the CSV to keep a permanent copy of your prospect list.',
    },
    {
      question: 'How to track cold outreach?',
      answer:
        'Log every prospect with a pipeline status (new, contacted, replied, meeting, won, lost), set a follow-up date for each contact, and review daily who is due. This tool computes the pipeline counts and the due list from the prospects you enter.',
    },
    {
      question: 'How does a cold outreach tracker work?',
      answer:
        'You enter one record per prospect — name, company, contact, status, dates, notes. The tool counts prospects by status, lists follow-ups due on or before today, calculates reply and win rates from your entries, and builds a CSV you can export. It never sends emails automatically and saves nothing server-side.',
    },
    {
      question: 'How does the cold outreach tracker work?',
      answer:
        'Enter your details using the inputs above and the cold outreach tracker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the cold outreach tracker free to use?',
      answer:
        'Yes - this cold outreach tracker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a cold outreach tracker?',
      answer:
        'A cold outreach tracker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Entries are session-based — the tool does not save to localStorage or any server; export the CSV to keep your data.',
    'A follow-up counts as due when its date is on or before today; won/lost prospects are excluded from the due list.',
    'Status must be one of: new, contacted, replied, meeting, won, lost.',
    'Dates must be entered as YYYY-MM-DD.',
    'This tool never sends emails — outreach itself stays manual.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Cold Outreach Tracker 2026 – Free Tool | HusnainBlogger',
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
          name: 'Creator Business Tools',
          item: 'https://husnainblogger.com/tools/creator-business/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Cold Outreach Tracker',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
