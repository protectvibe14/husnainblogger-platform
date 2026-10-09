import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

// tool-288 — Multi-Platform Upload Planner. Planner tool: joins a fixed
// platform-spec table (each spec carries a lastVerified date) with
// aspect-ratio crop math. Unknown platforms are marked UNVERIFIED, never guessed.

export const inputs: ToolInput[] = [
  {
    id: 'platforms',
    label: 'Platforms (comma-separated)',
    type: 'text',
    required: true,
    placeholder: 'e.g. youtube, tiktok, instagram-reels',
  },
  {
    id: 'masterW',
    label: 'Master file width (px)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 1920',
    validation: { min: 1 },
  },
  {
    id: 'masterH',
    label: 'Master file height (px)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 1080',
    validation: { min: 1 },
  },
  {
    id: 'masterFps',
    label: 'Master file frame rate',
    type: 'number',
    required: true,
    placeholder: 'e.g. 30',
    validation: { min: 1 },
  },
  {
    id: 'masterDurationSec',
    label: 'Master file duration (seconds)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 300',
    validation: { min: 1 },
  },
  {
    id: 'scheduleDate',
    label: 'Planned upload date (optional)',
    type: 'date',
    required: false,
  },
];

export const outputs: ToolOutput[] = [
  { id: 'perPlatform', label: 'Per-platform upload plan', type: 'table' },
  { id: 'reformatList', label: 'Reformat cuts needed', type: 'list' },
];

const DESCRIPTION =
  'Repurpose one video for every platform with this free multi platform video planner: enter your master file and platforms to get specs and crop plans. Plan now.';

export const content: ToolContent = {
  title: 'Multi Platform Video Planner',
  description: DESCRIPTION,
  howTo: [
    'Enter your target platforms as a comma-separated list: youtube, tiktok, instagram-reels, facebook, x.',
    'Enter your master file details: width, height (in pixels), frame rate, and duration in seconds.',
    'Optionally set a planned upload date to appear on the plan.',
    'Run the tool to get a per-platform table with target specs, crop requirements, and upload order.',
    'Read the reformat list: it shows exactly which platforms need a re-crop and how much frame you lose.',
    'Reframe or re-export the listed cuts before uploading to each platform.',
  ],
  methodology:
    'The tool looks up each platform in a fixed spec table (target resolution, aspect ratio, container — each spec carries a lastVerified date from September 2026) and compares it to your master file with pure aspect-ratio geometry: if the aspects match within 2%, no crop is needed; otherwise it computes the center-crop and the percentage of frame width or height you lose. Platforms not in the table are marked UNVERIFIED instead of guessed. Upload order follows the order you listed the platforms; "best time" notes are general guidance, not personalized data.',
  examples: [
    {
      title: 'Landscape master to YouTube + TikTok',
      inputs: {
        platforms: 'youtube, tiktok',
        masterW: 1920,
        masterH: 1080,
        masterFps: 30,
        masterDurationSec: 300,
      },
      note: 'YouTube needs no crop; TikTok needs a 9:16 center-crop losing ~68% of frame width.',
    },
    {
      title: 'Vertical master everywhere',
      inputs: {
        platforms: 'tiktok, instagram-reels',
        masterW: 1080,
        masterH: 1920,
        masterFps: 30,
        masterDurationSec: 45,
      },
      note: 'No reformat cuts — the 9:16 master fits both platforms.',
    },
    {
      title: 'Unknown platform stays honest',
      inputs: {
        platforms: 'youtube, snapchat',
        masterW: 1920,
        masterH: 1080,
        masterFps: 30,
        masterDurationSec: 60,
      },
      note: 'Snapchat has no spec in the table, so it is marked UNVERIFIED instead of guessed.',
    },
  ],
  faqs: [
    {
      question: 'What is the best multi platform video planner?',
      answer:
        'The best multi platform video planner starts from your master file and tells you, per platform, the target spec and whether you need to re-crop. This free tool does that in your browser: enter your master dimensions and platforms, and it computes the crop cuts with pure aspect-ratio math.',
    },
    {
      question: 'Is there a free multi platform video planner?',
      answer:
        'Yes — this multi platform video planner is free with no signup. It joins a fixed platform-spec table (each spec dated September 2026) with your master file to produce a per-platform upload table and reformat list.',
    },
    {
      question: 'How to plan multi platform video?',
      answer:
        'Shoot or export one master, then map it to each platform: target resolution and aspect ratio, which cuts need a center-crop and how much frame you lose, and your upload order. This tool computes all of that from your master width, height, frame rate, and duration.',
    },
    {
      question: 'How does a multi platform video planner work?',
      answer:
        'This one looks up each platform\'s target spec in a fixed dated table, compares aspect ratios with your master file using pure geometry, and reports "no crop needed" or the exact center-crop plus frame-loss percentage. Unknown platforms are marked UNVERIFIED — the tool never invents specs.',
    },
    {
      question: 'How does the multi platform video planner work?',
      answer:
        'Enter your details using the inputs above and the multi platform video planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the multi platform video planner free to use?',
      answer:
        'Yes - this multi platform video planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a multi platform video planner?',
      answer:
        'A multi platform video planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Platform specs were compiled September 2026 and platforms change limits often — verify current limits in each app before uploading.',
    'Crop guidance is center-crop geometry only; it cannot reframe subjects or suggest better compositions.',
    '"Best time" notes are general guidance, not personalized to your audience.',
    'Platforms not in the spec table are marked UNVERIFIED; their specs are never guessed.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Multi Platform Video Planner 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/video-editing/multi-platform-upload-planner/',
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
          name: 'Multi-Platform Upload Planner',
          item: 'https://husnainblogger.com/tools/video-editing/multi-platform-upload-planner/',
        },
      ],
    },
  ],
};
