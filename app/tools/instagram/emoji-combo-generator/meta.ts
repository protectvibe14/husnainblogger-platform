import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/emoji-combo-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'vibe',
    label: 'Vibe',
    type: 'select',
    required: true,
    options: [
      'cute',
      'aesthetic',
      'soft',
      'dark',
      'kawaii',
      'nature',
      'luxury',
      'minimal',
      'y2k',
      'beach',
    ],
  },
  {
    id: 'count',
    label: 'Number of combos',
    type: 'number',
    required: true,
    placeholder: 'e.g. 5',
    validation: { min: 1, max: 10 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'combos',
    label: 'Emoji combos',
    type: 'list',
    description:
    'Free aesthetic emoji combos copy paste 2026: The requested number of curated combos for the chosen vibe. Get instant results. free now.',
  },
  {
    id: 'copyAll',
    label: 'Copy all',
    type: 'copy',
    description:
    'All combos joined with line breaks, ready to paste.',
  },
];

export const content: ToolContent = {
  title: 'Aesthetic Emoji Combos Copy Paste',
  description:
    'Grab ready-to-paste aesthetic emoji combos for free: pick a vibe, choose how many you want, and copy combos for bios, captions and comments.',
  howTo: [
    'Choose a vibe from the Vibe dropdown (cute, aesthetic, dark, kawaii and 6 more).',
    'Enter how many combos you want (1–10) in the Number of Combos field.',
    'Click Generate to pull the first combos from that vibe’s curated bank.',
    'Use the Copy All button to paste every combo at once into your bio or caption.',
    'Preview each combo on your own device — emoji rendering varies by phone and app.',
  ],
  methodology:
    'Combos come from a fixed curated bank of 120 hand-picked combos (10 vibes x 12 each). The tool returns the first N combos from your chosen vibe’s bank in order — no randomness, no AI, no personalization. Everything runs in your browser.',
  examples: [
    {
      title: 'Cute bio decorations',
      inputs: { vibe: 'cute', count: 3 },
      note: 'Returns the first 3 cute combos, e.g. 🎀🌷✨💗, ready to paste into a bio.',
    },
    {
      title: 'Dark caption accents',
      inputs: { vibe: 'dark', count: 5 },
      note: 'Returns 5 dark-vibe combos such as 🖤⛓️🌙🔪 for captions and comments.',
    },
    {
      title: 'Beach comment set',
      inputs: { vibe: 'beach', count: 10 },
      note: 'Returns the full 10-combo beach set with a copy-all button.',
    },
  ],
  faqs: [
    {
      question: 'What is the best aesthetic emoji combos copy paste?',
      answer:
        'There is no verified “best” — it depends on the vibe you want. This free tool offers 10 curated vibes (cute, aesthetic, dark, kawaii, nature, luxury, minimal, y2k, beach, soft) with 12 hand-picked combos each, so you can judge for yourself.',
    },
    {
      question: 'Is there a free aesthetic emoji combos copy paste?',
      answer:
        'Yes — this tool is completely free with no signup. Pick a vibe and a count from 1–10, and it shows the combos with a copy-all button for bios, captions and comments.',
    },
    {
      question: 'How to use aesthetic emoji combos copy paste?',
      answer:
        'Select a vibe, enter how many combos you want (1–10), and click Generate. Copy individual combos or use Copy All, then paste them into your Instagram bio, caption or comment.',
    },
    {
      question: 'How does an aesthetic emoji combos copy paste work?',
      answer:
        'This one takes the first N combos from your chosen vibe’s curated bank in order — N is the count you enter. It is a fixed library lookup, not AI generation, and everything runs in your browser with no account needed.',
    },
    {
      question: 'How does the aesthetic emoji combos copy paste work?',
      answer:
        'Enter your details using the inputs above and the aesthetic emoji combos copy paste calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the aesthetic emoji combos copy paste free to use?',
      answer:
        'Yes - this aesthetic emoji combos copy paste is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an aesthetic emoji combos copy paste?',
      answer:
        'An aesthetic emoji combos copy paste is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Combos come from a fixed curated bank of 120 combos (10 vibes x 12) — picked in bank order, not generated or personalized.',
    'Emoji rendering varies by device and app — preview a combo in your bio or caption before relying on it.',
  ],
  jsonLd: [
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Emoji Combo Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
