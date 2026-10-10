import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/title-swipe-file-vault/';

const DESCRIPTION =
  'Save titles with this free youtube title swipe file — a local vault to store, tag, search and export title ideas. Nothing uploads. Start free.';

export const inputs: ToolInput[] = [
  {
    id: 'action',
    label: 'Action',
    type: 'select',
    required: true,
    options: ['add', 'list', 'search', 'export'],
  },
  {
    id: 'titleText',
    label: 'Title text (for add)',
    type: 'text',
    required: false,
    placeholder: 'e.g. I Tried Waking Up at 5AM for 30 Days',
  },
  {
    id: 'source',
    label: 'Source note (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. spotted on a big channel, my idea, competitor',
  },
  {
    id: 'tags',
    label: 'Tags (comma-separated)',
    type: 'text',
    required: false,
    placeholder: 'e.g. challenge, vlog, high-ctr',
  },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    required: false,
    options: ['unused', 'used'],
  },
  {
    id: 'query',
    label: 'Search query (for search)',
    type: 'text',
    required: false,
    placeholder: 'e.g. editing',
  },
  {
    id: 'exportFormat',
    label: 'Export format (for export)',
    type: 'select',
    required: false,
    options: ['json', 'csv'],
  },
  {
    id: 'vaultJson',
    label: 'Current vault (managed by the app)',
    type: 'textarea',
    required: false,
    placeholder: 'Your saved titles live here — the app keeps this for you.',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'entries', label: 'Vault entries', type: 'list' },
  { id: 'vaultJson', label: 'Updated vault data', type: 'copy' },
  { id: 'count', label: 'Entry count', type: 'number' },
  { id: 'message', label: 'Result message', type: 'text' },
];

export const content: ToolContent = {
  title: 'Youtube Title Swipe File',
  description: DESCRIPTION,
  howTo: [
    'Choose the "add" action and type a title you want to save for later.',
    'Add an optional source note (where you spotted it) and comma-separated tags like "challenge, vlog".',
    'Run the tool — the title is added to your vault with duplicate detection and a length warning if it exceeds YouTube\'s 100-character limit.',
    'Use "list" to browse everything, "search" to find titles by word, tag, or source, and "export" to copy your vault as JSON or CSV.',
    'Your vault is stored on your own device (localStorage) — nothing is uploaded or synced anywhere.',
  ],
  methodology:
    'Storage-agnostic pure functions over an entries array: add validates and appends entries (text, source note, tags, used/unused status), list returns all entries, search filters case-insensitively across title, source, and tags, and export renders the vault as JSON or CSV text. Duplicate detection compares trimmed, case-insensitive title text. Persistence is the UI layer\'s job (localStorage); this tool never touches storage or the network. The vault is a local collection, not a content generator — it creates no titles itself.',
  examples: [
    {
      title: 'Save a title you spotted',
      inputs: { action: 'add', titleText: 'I Tried Waking Up at 5AM for 30 Days', source: 'big channel', tags: 'challenge, vlog', status: 'unused', vaultJson: '' },
      note: 'The title is saved with its source and tags; saving the identical text again is rejected as a duplicate.',
    },
    {
      title: 'Search your collection',
      inputs: { action: 'search', query: 'vlog', vaultJson: '' },
      note: 'Returns every entry whose title, source, or tags contain "vlog" — an empty vault returns an onboarding hint instead.',
    },
    {
      title: 'Export as CSV',
      inputs: { action: 'export', exportFormat: 'csv', vaultJson: '' },
      note: 'Produces header + one quoted CSV line per entry, ready to paste into a spreadsheet.',
    },
  ],
  faqs: [
    {
      question: 'what is the best youtube title swipe file?',
      answer:
        'The best swipe file is one you actually maintain: save titles you spot performing well, tag them by format (challenge, tutorial, vlog), note the source, and mark them used once published. This free tool gives you that vault — stored on your device, searchable, and exportable to CSV.',
    },
    {
      question: 'is there a free youtube title swipe file?',
      answer:
        'Yes — this tool is free with no signup. Add titles with tags and source notes, search the collection, and export as JSON or CSV. Everything is stored in your browser\'s localStorage; nothing is uploaded to any server.',
    },
    {
      question: 'how to use youtube title swipe?',
      answer:
        'When you see a title format you like, save the exact wording plus a tag like "challenge" and a source note. Later, search your vault by tag or keyword, study the patterns, and write your own title in that pattern — never copy another creator\'s title word-for-word.',
    },
    {
      question: 'how does a youtube title swipe file work?',
      answer:
        'It is a personal collection of title examples you save for inspiration: you add titles with tags and sources, then search or export them when brainstorming. This tool keeps the collection as a local vault on your device (localStorage) — it does not generate titles or sync anything online.',
    },
    {
      question: 'What is a youtube title swipe file?',
      answer:
        'A youtube title swipe file is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The vault lives on your device (localStorage) only — clearing browser data deletes it, and it does not sync across devices.',
    'Duplicate detection compares identical text (trimmed, case-insensitive); near-duplicates with different wording are still saved.',
    'Titles over 100 graphemes are saved with a warning, not rejected — trim them before using them as real YouTube titles.',
    'This tool is a local collection, not a content generator — it creates no titles and offers no performance predictions.',
  ],
  jsonLd: [],
};
