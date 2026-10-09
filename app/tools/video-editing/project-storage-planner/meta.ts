import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

// tool-290 — Project Storage Planner. Builder tool: inputs: [] (uses itemFields,
// one item per clip). Pure storage arithmetic (F-STORAGE-01) with every
// assumption and bitrate preset labeled.

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [
  { id: 'perClipMb', label: 'Storage per clip', type: 'list' },
  { id: 'totalMb', label: 'Total project size (MB)', type: 'number' },
  { id: 'withBackupsMb', label: 'Total with backup copies (MB)', type: 'number' },
  { id: 'proxyComparison', label: 'Proxy vs original comparison', type: 'list' },
  { id: 'tierRecommendation', label: 'Drive recommendation', type: 'text' },
];

export const itemFields: BuilderField[] = [
  {
    id: 'clipLabel',
    label: 'Clip label',
    type: 'text',
    required: true,
    placeholder: 'e.g. Interview A-cam',
  },
  {
    id: 'durationSec',
    label: 'Duration (seconds)',
    type: 'text',
    required: true,
    placeholder: 'e.g. 600',
  },
  {
    id: 'bitrateMbps',
    label: 'Bitrate (Mbps, optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. 16 — or leave blank to use a quality preset',
  },
  {
    id: 'qualityPreset',
    label: 'Quality preset (optional)',
    type: 'text',
    required: false,
    placeholder: '720p, 1080p, or 4k (used when bitrate is blank)',
  },
  {
    id: 'projectCount',
    label: 'Number of projects like this (optional)',
    type: 'text',
    required: false,
    placeholder: 'Default: 1',
  },
  {
    id: 'backupCopies',
    label: 'Backup copies to keep (optional)',
    type: 'text',
    required: false,
    placeholder: 'Default: 2',
  },
];

const DESCRIPTION =
  'Plan your footage storage with this free video project storage planner: enter clips, bitrates and backup copies to size your drive needs. Calculate now.';

export const content: ToolContent = {
  title: 'Video Project Storage Planner',
  description: DESCRIPTION,
  howTo: [
    'Add one item per clip: give it a label and enter its duration in seconds.',
    'Enter the bitrate in Mbps if you know it (check your editor\'s export settings or file properties).',
    'If you don\'t know the bitrate, enter a quality preset instead — 720p, 1080p, or 4k — and the tool uses a labeled estimate.',
    'Optionally set how many similar projects you run and how many backup copies you keep (default 2).',
    'Run the tool to see per-clip sizes, the project total, the total with backups, and a drive recommendation.',
    'Check the proxy-vs-original list if you edit with proxies — it shows how much drive space proxies save.',
  ],
  methodology:
    'Pure arithmetic (F-STORAGE-01): each clip\'s size is duration in seconds × bitrate in Mbps ÷ 8 (8 bits per byte) = megabytes. The total sums all clips times the project count; the backup total multiplies again by the number of backup copies. Bitrate presets (720p ~8 Mbps, 1080p ~16 Mbps, 4k ~80 Mbps) and the proxy model (720p / 8 Mbps) are typical H.264 delivery estimates, not measurements of your footage — real sizes vary with codec, scene complexity, and variable bitrate. Clips with no bitrate and no preset get a labeled conservative 1080p default instead of failing.',
  faqs: [
    {
      question: 'What is the best video project storage planner?',
      answer:
        'The honest one shows its math: clip size = duration × bitrate ÷ 8, and it tells you when it is estimating. This free tool does exactly that in your browser — enter each clip\'s duration and bitrate (or a labeled quality preset), and it totals your project with backups and recommends a drive tier.',
    },
    {
      question: 'Is there a free video project storage planner?',
      answer:
        'Yes — this video project storage planner is free and runs entirely in your browser with no signup. Add your clips with durations and bitrates, set your backup copies, and it computes per-clip sizes, project totals, and a proxy-vs-original comparison.',
    },
    {
      question: 'How to plan video project storage?',
      answer:
        'List every clip with its duration and bitrate, multiply out by how many projects you run, then multiply again by the backup copies you keep (two is a sensible default). This tool does that math for you, labels any bitrate it had to estimate, and suggests a drive tier — from a plain external drive up to a multi-terabyte setup.',
    },
    {
      question: 'How does the video project storage planner work?',
      answer:
        'Enter your details using the inputs above and the video project storage planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the video project storage planner free to use?',
      answer:
        'Yes - this video project storage planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a video project storage planner?',
      answer:
        'A video project storage planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the video project storage planner?',
      answer:
        'No account needed. Open the video project storage planner, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Clip size = durationSec × bitrateMbps ÷ 8. Real files vary with codec, scene complexity, and variable bitrate — results are planning figures, not exact predictions.',
    'Bitrate presets are labeled estimates (720p ~8 Mbps, 1080p ~16 Mbps, 4k ~80 Mbps); clips with no bitrate get a labeled conservative 1080p default.',
    'Proxy comparison models proxies at 720p / 8 Mbps (estimate); your actual proxy settings may differ.',
    'Drive recommendations are general guidance, not product recommendations.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Video Project Storage Planner 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/video-editing/project-storage-planner/',
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
          name: 'Project Storage Planner',
          item: 'https://husnainblogger.com/tools/video-editing/project-storage-planner/',
        },
      ],
    },
  ],
};
