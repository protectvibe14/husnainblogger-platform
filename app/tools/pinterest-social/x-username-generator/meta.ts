import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/x-username-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'baseName',
    label: 'Base name',
    type: 'text',
    required: true,
    placeholder: 'e.g. cozy kitchen',
  },
  {
    id: 'style',
    label: 'Style',
    type: 'select',
    required: false,
    options: ['short', 'professional', 'keyword'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'handles',
    label: 'Username ideas',
    type: 'list',
    description:
    'Free twitter username ideas 2026: 10 handle ideas, each within the 15-character limit. free.',
  },
  {
    id: 'notes',
    label: 'Notes',
    type: 'list',
    description:
    'Truncation notes and the availability reminder.',
  },
];

export const content: ToolContent = {
  title: 'Twitter Username Ideas',
  description:
    'Get Twitter username ideas instantly: enter a base name and get 10 X handle ideas in short, professional, or keyword styles. Free — find yours now.',
  howTo: [
    'Type a base name — your name, brand, or niche (for example, "cozy kitchen").',
    'Pick a style: short (punchy, 8 characters or fewer), professional (clean suffixes like _hq), or keyword (niche words like tips or daily).',
    'Click run to get 10 handle ideas, each checked against the 15-character limit with only letters, numbers, and underscores.',
    'Take your favorites to X and check availability there — handles are first-come, first-served.',
  ],
  methodology:
    'This tool is a client-side combinatorial generator, not AI. It sanitizes your base name (lowercase, letters/numbers/underscores only) and combines it with fixed affix banks per style: 10 short-style shapes, 8 professional suffixes plus 4 prefixes, or 10 keyword suffixes. Every handle is normalized to 15 characters or fewer, never starts with a digit or underscore, and contains no spaces. Availability checking is out of scope — you must check handles on X itself.',
  examples: [
    {
      title: 'Food niche, keyword style',
      inputs: { baseName: 'cozy kitchen', style: 'keyword' },
      note: 'Gets handles like cozykitchentips and cozykitchendaily (spaces removed automatically).',
    },
    {
      title: 'Personal brand, short style',
      inputs: { baseName: 'Husnain Creates', style: 'short' },
      note: 'Gets punchy 8-character ideas like husnainx and thehusna.',
    },
    {
      title: 'Business, professional style',
      inputs: { baseName: 'OptiOfficial', style: 'professional' },
      note: 'Gets clean ideas like optiofficial_hq and the_optiofficial.',
    },
  ],
  faqs: [
    {
      question: 'What is the best twitter username ideas?',
      answer:
        'The best ideas match your style: short and punchy for personal brands, professional suffixes like _hq for businesses, and keyword suffixes like _tips for niche accounts. This tool generates 10 ideas per style from your base name, all within the 15-character handle limit.',
    },
    {
      question: 'Is there a free twitter username ideas?',
      answer:
        'Yes — this X Username Generator is completely free with no signup. Enter a base name, pick short, professional, or keyword style, and get 10 handle ideas instantly.',
    },
    {
      question: 'How to use twitter username?',
      answer:
        'Pick a handle that is short, memorable, and close to your brand name. Generate ideas with this tool, check your favorites for availability directly on X (handles cannot be reserved here), then claim the winner before someone else does.',
    },
    {
      question: 'How does a twitter username ideas work?',
      answer:
        'You enter a base name and a style. The tool sanitizes the name (lowercase, letters/numbers/underscores only), combines it with fixed prefix and suffix banks for that style, and normalizes every result to 15 characters or fewer with no leading digits. Everything runs in your browser — no AI involved.',
    },
    {
      question: 'What is a twitter username ideas?',
      answer:
        'A twitter username ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Can I customize the generated twitter username ideas?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
    {
      question: 'What makes a good twitter username ideas?',
      answer: 'Clarity, specificity, and relevance to your audience. Avoid generic phrases — the more specific your input, the better the output.',
    },
  ],
  assumptions: [
    'Handles use conservative rules (15 characters max, letters/numbers/underscores, no leading digit) — always confirm against X\u2019s current rules when you sign up.',
    'Availability is not checked: popular handles may already be taken, so verify on X itself.',
    'Handles are lowercased; X treats handles as case-insensitive.',
  ],
  jsonLd: [],
};
