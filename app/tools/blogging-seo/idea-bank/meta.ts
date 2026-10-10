import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/idea-bank/';

export const inputs: ToolInput[] = [
  {
    id: 'action',
    label: 'Action',
    type: 'select',
    required: true,
    options: ['add', 'list', 'update', 'delete', 'export'],
    placeholder: 'What do you want to do?',
  },
  {
    id: 'existingIdeas',
    label: 'Your saved ideas (JSON)',
    type: 'textarea',
    required: false,
    placeholder: 'Paste your previously exported bank JSON here — leave empty to start fresh',
  },
  {
    id: 'title',
    label: 'Idea title',
    type: 'text',
    required: false,
    placeholder: 'e.g. 10 email subject line formulas',
    validation: { max: 200 },
  },
  {
    id: 'tags',
    label: 'Tags (comma-separated)',
    type: 'text',
    required: false,
    placeholder: 'e.g. email, copywriting',
  },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    required: false,
    options: ['idea', 'draft', 'published', 'archived'],
    placeholder: 'Defaults to idea',
  },
  {
    id: 'notes',
    label: 'Notes',
    type: 'textarea',
    required: false,
    placeholder: 'Anything to remember about this idea…',
  },
  {
    id: 'index',
    label: 'Idea # (for update/delete)',
    type: 'number',
    required: false,
    placeholder: 'The row number from the ideas table',
    validation: { min: 1 },
  },
  {
    id: 'filterTag',
    label: 'Filter: tag',
    type: 'text',
    required: false,
    placeholder: 'Show only ideas with this tag',
  },
  {
    id: 'filterStatus',
    label: 'Filter: status',
    type: 'select',
    required: false,
    options: ['idea', 'draft', 'published', 'archived'],
  },
  {
    id: 'filterQuery',
    label: 'Filter: search',
    type: 'text',
    required: false,
    placeholder: 'Search titles and notes',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'ideas',
    label: 'Ideas',
    type: 'table',
    description:
    'Free blog idea bank 2026: Your ideas after the action: title, tags, status, notes and flags. free.',
  },
  {
    id: 'count',
    label: 'Idea count',
    type: 'number',
    description:
    'How many ideas are shown.',
  },
  {
    id: 'exportCsv',
    label: 'Export CSV',
    type: 'download',
    description:
    'The full bank as a CSV file — download it to save your ideas between sessions.',
  },
];

export const content: ToolContent = {
  title: 'Blog Idea Bank',
  description:
    'Store and organize your blog ideas for free — titles, tags, status, notes, and flags for every idea you save. Build yours today!',
  howTo: [
    'Choose an action: add a new idea, list and filter your bank, update or delete by row number, or export.',
    'To keep ideas between sessions: download the CSV after adding, then paste your saved JSON into "Your saved ideas" next time.',
    'Add ideas with a title, comma-separated tags, a status (idea/draft/published/archived) and notes.',
    'Use the list action with tag, status or search filters to find ideas when you need one.',
    'Duplicate titles are allowed but flagged so you can spot them.',
  ],
  methodology:
    'The tool is deliberately stateless: it keeps no data between calls. Each run takes your bank as JSON (or starts empty), applies the chosen action with fixed rules — tags are trimmed, de-duplicated and capped at 20 per idea; duplicate titles are allowed and flagged; update/delete use the 1-based row number; export renders the full bank as CSV — and returns the resulting bank. It stores only the ideas you enter; it never suggests topics or invents content.',
  examples: [
    {
      title: 'Add your first idea',
      inputs: { action: 'add', title: '10 email subject line formulas', tags: 'email, copywriting', status: 'idea' },
      note: 'Bank now holds 1 idea; the CSV export contains it for saving.',
    },
    {
      title: 'Find draft ideas by tag',
      inputs: {
        action: 'list',
        existingIdeas:
          '[{"title":"SEO checklist","tags":["seo"],"status":"draft","notes":""}]',
        filterTag: 'seo',
      },
      note: 'Shows the 1 matching idea; count = 1.',
    },
  ],
  faqs: [
    {
      question: 'What is the best blog idea bank?',
      answer:
        'No independent test crowns one tool "the best" — what matters is that your ideas survive between sessions. This free bank is deliberately simple: it stores, tags, filters and exports the ideas you enter, with a downloadable CSV so nothing is lost when you leave the page.',
    },
    {
      question: 'Is there a free blog idea bank?',
      answer:
        'Yes — this tool is completely free with no signup. Add ideas with tags and statuses, filter the bank when you need inspiration, and download the CSV to keep your ideas between visits.',
    },
    {
      question: 'How to use a blog idea bank?',
      answer:
        'Capture every idea the moment it appears (title + a tag or two), mark its status as it moves from idea to draft to published, and filter by tag when you sit down to write. The CSV export is your backup — download it regularly.',
    },
    {
      question: 'How does a blog idea bank work?',
      answer:
        'You add ideas with titles, tags, statuses and notes; the bank holds them in a table you can filter and update. This one is stateless — it does not remember anything between visits, so paste your saved JSON back in or download the CSV to carry your ideas forward.',
    },
    {
      question: 'What is a blog idea bank?',
      answer:
        'A blog idea bank is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Is this blog idea bank tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
    {
      question: 'How do I use this blog idea bank tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
  ],
  assumptions: [
    'Stateless by design: nothing is saved on any server — use the CSV export to keep ideas between sessions.',
    'Stores only the ideas you enter; it never suggests topics or invents content.',
    'Duplicate titles are allowed and flagged, not blocked.',
    'Bank capped at 500 ideas per run; tags capped at 20 per idea.',
  ],
  jsonLd: [],
};
