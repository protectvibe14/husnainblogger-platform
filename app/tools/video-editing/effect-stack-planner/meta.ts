import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/video-editing/effect-stack-planner/';

export const inputs: ToolInput[] = [
  {
    id: 'desiredLook',
    label: 'Desired look',
    type: 'text',
    required: true,
    placeholder: 'e.g. cinematic, vintage, neon glow',
  },
  {
    id: 'deviceTier',
    label: 'Device tier',
    type: 'select',
    required: true,
    options: ['low', 'mid', 'high'],
  },
  {
    id: 'clipCount',
    label: 'Number of clips',
    type: 'number',
    required: false,
    placeholder: '1',
    validation: { min: 1, max: 500 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'stack',
    label: 'Effect stack (in order)',
    type: 'list',
    description: 'Free capcut effects order planner 2026: The effects to apply, in order: correction first, then grade, then stylization, then. Fast, private, no signup - try it!',
  },
  {
    id: 'perfWarnings',
    label: 'Performance warnings',
    type: 'list',
    description: 'Warnings about heavy effects on weak devices, redundant effects, and long render queues.',
  },
  {
    id: 'renderImpact',
    label: 'Render impact',
    type: 'text',
    description: 'Qualitative render-impact estimate: low, med, or high.',
  },
];

export const content: ToolContent = {
  title: 'Capcut Effects Order Planner 2026 – Free | HusnainBlogger',
  description:
    'Plan your CapCut effects order in seconds: pick a look and device tier for a correctly ordered stack with intensity and render-impact guidance. Start now!',
  howTo: [
    'Describe the look you want, e.g. cinematic, vintage, neon glow, or glitchy.',
    'Select your device tier (low, mid, or high) so the plan accounts for performance.',
    'Enter the number of clips (optional — default 1).',
    'Run the tool to get the effect stack in the correct order with intensity values.',
    'Read the performance warnings before applying heavy effects on a weak device.',
  ],
  methodology:
    'Your look text is keyword-matched against 8 curated look presets, each with a fixed, correctly-ordered effect stack: correction (exposure, white balance) first, then grade/filter, then stylization (grain, vignette, glow), then finishing (sharpen). Render impact is qualitative guidance computed from fixed per-effect costs, nudged up for low-tier and down for high-tier devices. The tool never applies effects or reads your video.',
  examples: [
    {
      title: 'Cinematic on mid-tier phone',
      inputs: { desiredLook: 'cinematic movie look', deviceTier: 'mid', clipCount: 12 },
      note: 'Teal-orange LUT stack with a med render impact.',
    },
    {
      title: 'Neon glow on low-tier phone',
      inputs: { desiredLook: 'neon glow city night', deviceTier: 'low', clipCount: 5 },
      note: 'Triggers a strong warning with a lighter alternative.',
    },
  ],
  faqs: [
    {
      question: 'What is the best capcut effects order planner?',
      answer:
        'The best order follows the classic pipeline: correction (exposure, white balance) first, then grade or filter, then stylization (grain, vignette, glow), and sharpen last. This free tool plans exactly that order for 8 curated looks, adjusted to your device tier.',
    },
    {
      question: 'Is there a free capcut effects order planner?',
      answer:
        'Yes — this CapCut effects order planner is completely free with no signup. Describe your look, pick your device tier, and get an ordered stack with intensity and render-impact guidance.',
    },
    {
      question: 'How to plan capcut effects order?',
      answer:
        'Always correct first (exposure, white balance), apply your grade or LUT second, add stylization like grain or vignette third, and sharpen last. This tool does that planning for you and warns when a stack is too heavy for your device.',
    },
    {
      question: 'How does a capcut effects order planner work?',
      answer:
        'You describe the look you want, and the tool keyword-matches it to one of 8 curated presets, each with a fixed effect order. It then checks your device tier, flags heavy or redundant effects, and gives a qualitative low/med/high render-impact estimate.',
    },
    {
      question: 'How does the capcut effects order planner work?',
      answer:
        'Enter your details using the inputs above and the capcut effects order planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the capcut effects order planner free to use?',
      answer:
        'Yes - this capcut effects order planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a capcut effects order planner?',
      answer:
        'A capcut effects order planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Effect names are generic — your CapCut version may name the same feature differently; match by function, not exact label.',
    'Render impact is qualitative guidance from fixed per-effect costs, not a benchmark measured on your device.',
    'Redundancy detection only catches pairs from a fixed blur-family list; creative stacking of two filters is a style choice, not always a mistake.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Capcut Effects Order Planner 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free capcut effects order planner 2026: The effects to apply, in order: correction first, then grade, then stylization, then. Fast, private, no signup - try it!',
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
          name: 'Effect Stack Planner',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
