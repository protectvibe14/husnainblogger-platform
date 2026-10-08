import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

// tool-287 — Export QA Checklist. Generator tool: fixed rule bank filtered by
// the user's platform, caption, music and duration inputs. Checklist only —
// it cannot inspect your project or exported file; you verify every item.

export const inputs: ToolInput[] = [
  {
    id: 'platform',
    label: 'Upload platform',
    type: 'select',
    required: true,
    options: ['YouTube', 'TikTok', 'Instagram Reels', 'Facebook'],
  },
  {
    id: 'hasCaptions',
    label: 'Does the video have captions?',
    type: 'boolean',
    required: true,
  },
  {
    id: 'hasMusic',
    label: 'Does the video have background music?',
    type: 'boolean',
    required: true,
  },
  {
    id: 'durationSec',
    label: 'Video duration (seconds)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 300',
    validation: { min: 1 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'checklist', label: 'Pre-export QA checklist', type: 'list' },
  { id: 'criticalCount', label: 'Critical items to fix', type: 'number' },
];

const DESCRIPTION =
  'Run a flawless upload with this free video export checklist: pick your platform and project details to get a tailored pre-render checklist. Start now.';

export const content: ToolContent = {
  title: 'Video Export Checklist 2026 – Free Tool | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Select your upload platform: YouTube, TikTok, Instagram Reels, or Facebook.',
    'Tell the tool whether your video has captions and whether it has background music.',
    'Enter the video duration in seconds.',
    'Run the tool to get a tailored pre-export checklist of up to 22 items.',
    'Work through every item — fix the ones marked [CRITICAL] first, then the rest.',
    'Re-run the checklist after fixes so nothing slips through before you upload.',
  ],
  methodology:
    'The tool assembles the checklist from a fixed bank of up to 22 editorial rules: 10 base checks (resolution, codec, audio, export safety) always apply, then a 4-item pack for your chosen platform is added, plus conditional checks for captions (4 quality checks, or 1 critical "add captions" item when you have none), music (licensing and loudness checks), and duration (chapter markers for long videos). Items marked [CRITICAL] reflect editorial judgment about what most often ruins an upload; nothing is measured from your actual file.',
  examples: [
    {
      title: 'YouTube tutorial',
      inputs: { platform: 'YouTube', hasCaptions: true, hasMusic: true, durationSec: 900 },
      note: '18 checks including the YouTube pack, caption sync checks, music licensing, and long-video chapter guidance.',
    },
    {
      title: 'TikTok clip without captions',
      inputs: { platform: 'TikTok', hasCaptions: false, hasMusic: false, durationSec: 30 },
      note: 'Flags "no captions" as critical and adds the 9:16 safe-zone and reframe checks.',
    },
    {
      title: 'Facebook short',
      inputs: { platform: 'Facebook', hasCaptions: true, hasMusic: false, durationSec: 45 },
      note: 'Includes silent-autoplay and safe-zone checks for feed playback.',
    },
  ],
  faqs: [
    {
      question: 'What is the best video export checklist?',
      answer:
        'The best video export checklist is tailored to where you upload: it covers resolution, codec, audio levels, captions, safe zones, and platform-specific settings. This free tool builds that checklist for you from a fixed bank of up to 22 checks based on your platform, captions, music, and duration.',
    },
    {
      question: 'Is there a free video export checklist?',
      answer:
        'Yes — this video export checklist is free and runs entirely in your browser with no signup. Pick your platform and project details and it assembles a tailored pre-render checklist, with the most important items marked [CRITICAL].',
    },
    {
      question: 'How to use video export?',
      answer:
        'Select your platform, say whether the video has captions and music, and enter its duration — then work through the generated checklist top to bottom, fixing critical items first. Re-run it after fixes so nothing is missed before you hit export.',
    },
    {
      question: 'How does a video export checklist work?',
      answer:
        'This one matches your inputs against a fixed bank of editorial QA rules: 10 base checks plus a 4-item pack for your platform, caption checks (or a critical "add captions" warning when you have none), music licensing and loudness checks, and duration-specific checks. It cannot inspect your actual project or exported file — you verify each item yourself.',
    },
    {
      question: 'How does the video export checklist work?',
      answer:
        'Enter your details using the inputs above and the video export checklist calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the video export checklist free to use?',
      answer:
        'Yes - this video export checklist is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a video export checklist?',
      answer:
        'A video export checklist is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Checklist only — it cannot inspect your project file or exported video; every item is verified by you.',
    'Up to 22 items per run; "critical" flags are editorial judgment, not measured impact.',
    'Platform-specific items are general guidance; always confirm current upload limits in the platform app.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Video Export Checklist 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/video-editing/export-qa-checklist/',
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
          name: 'Export QA Checklist',
          item: 'https://husnainblogger.com/tools/video-editing/export-qa-checklist/',
        },
      ],
    },
  ],
};
