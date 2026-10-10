import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'productName',
    label: 'Product name',
    type: 'text',
    required: true,
    placeholder: 'e.g. ceramic pour-over coffee set',
    validation: { max: 150 },
  },
  {
    id: 'features',
    label: 'Features (one per line)',
    type: 'textarea',
    required: true,
    placeholder: 'e.g.\nBrews 4 cups at once\nDishwasher-safe ceramic\nIncludes reusable steel filter',
    validation: { max: 5000 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'description', label: 'Product description', type: 'copy' },
  { id: 'policyNote', label: 'Brand/IP policy reminder', type: 'text' },
];

const DESCRIPTION =
  'Write listings that convert with this TikTok shop description writer — features, benefits, and urgency in a scannable format. Highlight what makes you.';

export const content: ToolContent = {
  title: 'TikTok Shop Description Writer',
  description: DESCRIPTION,
  howTo: [
    'Type your product name into the "Product name" box — for example "ceramic pour-over coffee set".',
    'List the product\'s features in the "Features" box, one per line (up to 25 are used).',
    'Run the writer to get a structured description: hook, benefit bullets, spec placeholders, what\'s-in-the-box, and a draft keyword line.',
    'Replace every [bracketed] placeholder with your real supplier specs — never publish the placeholders.',
    'Read the policy note: it flags possible brand/IP terms (like "Nike" or "replica") for your review.',
    'Copy the finished description into your TikTok Shop listing.',
  ],
  methodology:
    'The description is assembled from fixed section templates: one of 6 opening hooks (chosen deterministically from your product name), your features as benefit bullets, and clearly labeled [bracketed] placeholders for specs and box contents that you must replace. A 58-term brand/counterfeit reminder list is scanned against your text with word-boundary matching. There is no AI, and no specs, prices, or contents are ever invented.',
  examples: [
    {
      title: 'Coffee set',
      inputs: {
        productName: 'ceramic pour-over coffee set',
        features: 'Brews 4 cups at once\nDishwasher-safe ceramic\nIncludes reusable steel filter',
      },
      note: 'Full structured description with 3 benefit bullets, spec placeholders, and a draft keyword line.',
    },
    {
      title: 'Brand-term flag',
      inputs: {
        productName: 'running socks',
        features: 'Cushioned sole\nNike-style stripe design',
      },
      note: 'The policy note flags "nike" with a reminder about TikTok Shop counterfeit and brand-use policies.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok shop description?',
      answer:
        'The best TikTok Shop descriptions open with a hook, list real benefits as bullets, give exact specs, and state what is in the box — all under the 10,000-character guideline. This free tool builds that structure from your own feature list.',
    },
    {
      question: 'Is there a free tiktok shop description?',
      answer:
        'Yes — this description writer is completely free with no signup. It assembles descriptions from fixed templates in your browser, so there is no usage limit.',
    },
    {
      question: 'How to use tiktok shop description?',
      answer:
        'Enter your product name and features (one per line), generate the description, replace the [bracketed] placeholders with your real supplier info, review the policy note, then paste it into your TikTok Shop listing editor.',
    },
    {
      question: 'What is a tiktok shop description?',
      answer:
        'A tiktok shop description is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the tiktok shop description?',
      answer:
        'No account needed. Open the tiktok shop description, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Specs and box contents are emitted as [bracketed] placeholders — the tool never invents material, size, weight, or contents, and placeholders must be replaced before publishing.',
    'The brand/IP scan uses a 58-term reminder list with word-boundary matching; it is not exhaustive and is not legal advice — always verify trademarks yourself.',
    'Descriptions are template-based suggestions, not AI copy, and cannot promise higher conversions or rankings.',
  ],
  jsonLd: [],
};
