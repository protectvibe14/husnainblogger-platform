import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'width',
    label: 'Width (px)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 1920 — or pick a preset instead',
    validation: { min: 1 },
  },
  {
    id: 'height',
    label: 'Height (px)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 1080 — or pick a preset instead',
    validation: { min: 1 },
  },
  {
    id: 'preset',
    label: 'Platform preset (alternative to width/height)',
    type: 'select',
    required: false,
    options: [
      'midjourney-square',
      'midjourney-landscape',
      'midjourney-portrait',
      'midjourney-widescreen',
      'midjourney-vertical',
      'youtube-thumbnail',
      'youtube-shorts',
      'tiktok-video',
      'instagram-square',
      'instagram-portrait',
      'instagram-reel',
      'x-post',
      'pinterest-pin',
      'facebook-link',
    ],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'simplifiedRatio', label: 'Simplified aspect ratio', type: 'text' },
  { id: 'nearestPresets', label: 'Nearest platform presets', type: 'list' },
  { id: 'cropGuidance', label: 'Crop guidance notes', type: 'copy' },
];

export const content: ToolContent = {
  title: 'AI Image Aspect Ratio Guide',
  description:
    'Use this AI image aspect ratio guide: enter width and height or pick a preset, get the simplified ratio, nearest presets, and crop guidance. Free.',
  howTo: [
    'Enter your image width and height in pixels as whole numbers — or choose a platform preset instead.',
    'Run the planner to simplify your size with real GCD arithmetic (e.g. 1920x1080 becomes 16:9).',
    'Read the 3 nearest platform presets ranked by how close their ratio is to yours.',
    'Follow the crop guidance: it computes exactly how many pixels to trim from each side.',
    'Copy the suggested Midjourney --ar flag (where one exists) into your image prompt.',
  ],
  methodology:
    'This tool performs real ratio simplification using greatest-common-divisor arithmetic and compares the result against a static reference table of 14 presets (5 Midjourney ratios and 9 platform references). No AI runs — the nearest presets are ranked by decimal-ratio distance and crop trims are computed from your pixel numbers. Preset ratios are reference values, not live platform specs.',
  examples: [
    {
      title: 'YouTube thumbnail size',
      inputs: { width: 1920, height: 1080 },
      note: 'Simplifies to 16:9 with YouTube thumbnail as an exact-match preset — no cropping needed.',
    },
    {
      title: 'Preset only',
      inputs: { preset: 'instagram-portrait' },
      note: 'Starts from the 4:5 Instagram portrait reference and lists the closest alternatives.',
    },
    {
      title: 'Odd size',
      inputs: { width: 1500, height: 900 },
      note: 'Simplifies to 5:3 and shows exactly how many pixels to trim to reach the nearest 16:9 preset.',
    },
  ],
  faqs: [
    {
      question: 'What is the best ai image aspect ratio guide?',
      answer:
        'The best guide starts from your actual pixels: this free planner simplifies any width and height to its lowest-terms ratio, then ranks 14 platform presets by closeness and computes the exact crop needed. The math is transparent — every preset is labeled as a reference value.',
    },
    {
      question: 'Is there a free ai image aspect ratio guide?',
      answer:
        'Yes — this planner is completely free with no signup. Enter your dimensions or pick a platform preset and get the simplified ratio, nearest presets, and crop guidance instantly.',
    },
    {
      question: 'How to use ai image aspect ratio?',
      answer:
        'Enter the width and height you want (or pick a preset like YouTube thumbnail), then use the simplified ratio with the suggested --ar flag in your image generator. The crop guidance tells you how many pixels to trim from each side to fit a preset exactly.',
    },
    {
      question: 'How does an ai image aspect ratio guide work?',
      answer:
        'It divides your width and height by their greatest common divisor to find the simplest ratio (for example 1920x1080 becomes 16:9), then measures how far that ratio sits from known platform presets. No AI is involved — it is arithmetic plus a fixed reference table.',
    },
    {
      question: 'How does the ai image aspect ratio guide work?',
      answer:
        'Enter your details using the inputs above and the ai image aspect ratio guide calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai image aspect ratio guide free to use?',
      answer:
        'Yes - this ai image aspect ratio guide is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an ai image aspect ratio guide?',
      answer:
        'An ai image aspect ratio guide is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Ratio simplification is exact GCD arithmetic; decimals are rounded to 2 places.',
    'The 14 platform presets are reference values — platforms change specs, so verify against the current spec before publishing.',
    'Crop guidance assumes trims are taken evenly from opposite edges; your editor may crop differently.',
    'This tool plans ratios — it does not generate or edit images.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'AI Image Aspect Ratio Guide 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-workflows/ai-image-aspect-ratio-planner/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Use this AI image aspect ratio guide: enter width and height or pick a preset, get the simplified ratio, nearest presets, and crop guidance. Free.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'AI Workflow Tools',
          item: 'https://husnainblogger.com/tools/ai-workflows/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'AI Image Aspect Ratio Planner',
          item: 'https://husnainblogger.com/tools/ai-workflows/ai-image-aspect-ratio-planner/',
        },
      ],
    },
  ],
};
