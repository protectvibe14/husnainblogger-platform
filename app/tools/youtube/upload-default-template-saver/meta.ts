import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/upload-default-template-saver/';

const DESCRIPTION =
  'Compose a youtube upload defaults template preset — title suffixes, description footers, tags and visibility — then paste it into YouTube Studio. Start free.';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'name',
    label: 'Preset name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Weekly tutorial',
  },
  {
    id: 'titleSuffix',
    label: 'Title suffix',
    type: 'text',
    placeholder: 'e.g. | Tech Tips — appended to every video title',
  },
  {
    id: 'descriptionFooter',
    label: 'Description footer',
    type: 'text',
    placeholder: 'e.g. Subscribe for new videos every Tuesday!',
  },
  {
    id: 'defaultTags',
    label: 'Default tags (comma-separated)',
    type: 'text',
    placeholder: 'e.g. tech tips, tutorial, how to (max 500 chars total)',
  },
  {
    id: 'visibility',
    label: 'Default visibility',
    type: 'text',
    placeholder: 'public, unlisted (default) or private',
  },
  {
    id: 'playlist',
    label: 'Default playlist',
    type: 'text',
    placeholder: 'e.g. Tutorials',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'presets', label: 'Preset summaries', type: 'list' },
  { id: 'copyBlocks', label: 'Copy-paste blocks', type: 'copy' },
  { id: 'guides', label: 'YouTube Studio paste guide', type: 'list' },
  { id: 'honestyNotes', label: 'What the tool cannot do', type: 'list' },
  { id: 'count', label: 'Presets built', type: 'number' },
];

export const content: ToolContent = {
  title: 'YouTube Upload Defaults Template 2027 | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Add one item per upload style you use (e.g. weekly tutorials, Shorts, vlogs) and give each preset a name.',
    'Fill in your title suffix — the text appended to every video title, like "| Tech Tips".',
    'Write your reusable description footer — subscribe calls, disclaimers, or links you repeat every video.',
    'Enter default tags (comma-separated, 500 characters max total) plus your default visibility and playlist.',
    'Run the builder, then copy each paste block into YouTube Studio → Settings → Upload defaults and save it there.',
  ],
  methodology:
    'This tool is a session-based template composer, not an integration: it assembles your preset fields into named, copy-ready text blocks and a step-by-step paste guide. There is no YouTube API connection and nothing is written to your channel automatically — presets exist only for this session and must be pasted into YouTube Studio by hand. Tag input is validated against YouTube\'s real 500-character total tag limit before any block is built.',
  faqs: [
    {
      question: 'what is the best youtube upload defaults template?',
      answer:
        'The best template is one you actually reuse: a short title suffix, a description footer with your subscribe CTA and links, a core tag set under 500 characters, and a default visibility of unlisted so every upload starts private for review. This free tool helps you compose and organize those presets — you paste them into YouTube Studio\'s Upload defaults panel yourself.',
    },
    {
      question: 'is there a free youtube upload defaults template?',
      answer:
        'Yes — this tool is completely free with no signup. You compose named presets (title suffix, description footer, tags, visibility, playlist) and get copy-paste blocks to apply in YouTube Studio → Settings → Upload defaults. It stores nothing on a server; presets are composed for your session.',
    },
    {
      question: 'how to use youtube upload defaults?',
      answer:
        'In YouTube Studio go to Settings → Upload defaults and set a default title, description, visibility, and tags — every new upload starts with those values. This tool helps you prepare those values: build each preset here, copy the blocks, and paste them into that settings panel.',
    },
    {
      question: 'how does a youtube upload defaults template work?',
      answer:
        'A template is just reusable text: a title suffix, a description footer, default tags, and a visibility setting you paste into the Upload defaults panel once, so every future upload inherits them. This tool composes those pieces into named presets and a copy-paste guide — it cannot change your YouTube settings directly because it has no YouTube API connection.',
    },
    {
      question: 'How does the youtube upload defaults template work?',
      answer:
        'Enter your details using the inputs above and the youtube upload defaults template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube upload defaults template free to use?',
      answer:
        'Yes - this youtube upload defaults template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube upload defaults template?',
      answer:
        'A youtube upload defaults template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Presets are composed for this session only — nothing is stored on a server, synced, or persisted across sessions.',
    'The tool cannot write to YouTube Studio settings; applying presets requires manual copy-paste into Settings → Upload defaults.',
    'YouTube\'s real 500-character total tag limit is enforced during validation; individual tags should stay under 60 characters.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'YouTube Upload Defaults Template 2026 | HusnainBlogger',
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
        { '@type': 'ListItem', position: 4, name: 'Upload Default Template Saver', item: TOOL_URL },
      ],
    },
  ],
};
