import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/facebook-cover-text-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'offer',
    label: 'Your offer or headline',
    type: 'text',
    required: true,
    placeholder: 'e.g. free first haircut, 20% off all plans',
  },
  {
    id: 'coverType',
    label: 'Cover type',
    type: 'select',
    required: false,
    options: ['page', 'group'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'coverCopy',
    label: 'Cover copy options',
    type: 'list',
    description:
    'Free facebook cover photo text 2026: 5 short cover text lines (12 words or fewer each) with your offer inserted. Fast, private now.',
  },
  {
    id: 'safeZoneNote',
    label: 'Safe-zone guidance',
    type: 'text',
    description:
    'Text placement guidance for the chosen cover size (page 851x315 or group 1640x856).',
  },
  {
    id: 'count',
    label: 'Copy options generated',
    type: 'number',
    description:
    'How many cover copy options were generated.',
  },
];

export const content: ToolContent = {
  title: 'Facebook Cover Photo Text',
  description:
    'Make your cover photo do the selling: enter your offer or headline to get 5 free short cover lines plus safe-zone guidance for pages and groups.',
  howTo: [
    'Type Your offer or headline into the field (keep it under 9 words).',
    'Choose the Cover type: page (851 x 315) or group (1640 x 856).',
    'Click run to get 5 short cover copy lines with your offer inserted.',
    'Pick a line and read the safe-zone guidance before placing the text in your design.',
    'Keep text centered and clear of the edges — cover images crop on mobile.',
  ],
  methodology:
    'This tool inserts your offer into 5 fixed hand-written cover-copy templates — deterministic assembly, no AI. Every line stays at 12 words or fewer because the offer input is capped at 8 words. A fixed safe-zone note is attached per cover type (page 851 x 315, group 1640 x 856). The tool writes text copy and layout guidance only; it does not render or design any image.',
  examples: [
    {
      title: 'Cover copy for a salon offer',
      inputs: { offer: 'free first haircut', coverType: 'page' },
      note: 'Returns 5 short lines like "free first haircut — starts now" plus page safe-zone guidance.',
    },
    {
      title: 'Cover copy for a group',
      inputs: { offer: 'weekly live Q&A sessions', coverType: 'group' },
      note: 'Returns 5 lines with group (1640 x 856) safe-zone guidance.',
    },
    {
      title: 'Default cover type',
      inputs: { offer: '20% off all plans' },
      note: 'Cover type defaults to page when not chosen.',
    },
  ],
  faqs: [
    {
      question: 'What is the best facebook cover photo text?',
      answer:
        'There is no verified "best" — the best cover text is short (under 12 words), states one clear offer, and sits in the safe zone. This free generator gives you 5 such lines from fixed templates plus safe-zone guidance for page (851 x 315) and group (1640 x 856) covers.',
    },
    {
      question: 'Is there a free facebook cover photo text?',
      answer:
        'Yes — this Facebook cover text generator is completely free with no signup. Enter your offer to get 5 short cover lines plus placement guidance for page or group covers, as many times as you like.',
    },
    {
      question: 'How to use facebook cover photo text?',
      answer:
        'Pick a line, place it centered in your cover design, and keep it clear of the edges — the profile picture overlaps the lower-left on pages and mobile crops the sides. This tool writes the copy and guidance; you place it in your own design tool.',
    },
    {
      question: 'How does a facebook cover photo text work?',
      answer:
        'This tool inserts your offer into 5 fixed templates and attaches a safe-zone note for the cover type you chose. It does not design or render any image — text copy and layout guidance only.',
    },
    {
      question: 'How does the facebook cover photo text work?',
      answer:
        'Enter your details using the inputs above and the facebook cover photo text calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the facebook cover photo text free to use?',
      answer:
        'Yes - this facebook cover photo text is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a facebook cover photo text?',
      answer:
        'A facebook cover photo text is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Copy comes from 5 fixed hand-written templates — no AI, no image rendering or design.',
    'Offer input is capped at 8 words so every line stays at 12 words or fewer and readable at cover scale.',
    'Cover dimensions used are page 851 x 315 px and group 1640 x 856 px; always double-check Facebook\'s current specs before finalizing a design.',
  ],
  jsonLd: [],
};
