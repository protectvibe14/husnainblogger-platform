import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent, BuilderField } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'productName',
    label: 'Product name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Aurora Vitamin C Serum',
  },
  {
    id: 'keyFeatures',
    label: 'Key features (comma-separated, max 5)',
    type: 'text',
    required: true,
    placeholder: 'e.g. 20% vitamin C, fragrance-free, glass dropper',
  },
  {
    id: 'isSponsored',
    label: 'Sponsored or affiliate demo?',
    type: 'text',
    placeholder: 'Type "yes" if paid/affiliate — adds an #ad disclosure line',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'script', label: 'Full demo script', type: 'copy' },
  { id: 'beats', label: 'Script beats', type: 'list' },
];

export const content: ToolContent = {
  title: 'Tiktok Product Demo Script',
  description:
    'Build a TikTok product demo script from templates: hook, feature demo beats, proof moment, and CTA. Adds an #ad disclosure for paid demos. Free —.',
  howTo: [
    'Add one item per product you want to demo.',
    'Enter the productName and list up to 5 keyFeatures, comma-separated (one demo beat each).',
    'If the demo is sponsored or affiliate, type "yes" in the sponsored field to insert an #ad disclosure line.',
    'Generate to get the full script: hook, feature beats, proof moment, CTA, and shop CTA.',
    'Replace the template demo actions with your real on-camera test of each feature.',
    'Keep the disclosure line in the final video if the demo is paid or affiliate.',
  ],
  methodology:
    'The builder picks a hook, proof line, CTA, and shop CTA from fixed banks (8 hooks, 6 proof lines, 6 CTAs, 4 shop CTAs) using a deterministic hash of each product name, then assigns one demo-action template from a bank of 8 to every listed feature. A sponsored flag inserts a fixed #ad disclosure line. Same items always produce the same script — no AI is involved.',
  faqs: [
    {
      question: 'What is the best TikTok product demo script?',
      answer:
        'The strongest demo scripts follow a fixed flow: a hook that names the product, one unedited demo beat per feature, a proof moment skeptics can trust, and a CTA. This builder produces that flow from templates — you supply the real on-camera test and honest results.',
    },
    {
      question: 'Is there a free TikTok product demo script?',
      answer:
        'Yes — this builder is free and runs entirely in your browser. You get the full script with hook, feature beats, proof moment, CTA, and an optional shop CTA with no signup.',
    },
    {
      question: 'How do I use the product demo builder?',
      answer:
        'Add each product as an item with its name and up to 5 comma-separated features, mark sponsored demos as "yes" to get the #ad disclosure line, then generate. Film each beat as written, testing the product live with no edits for credibility.',
    },
    {
      question: 'What is a tiktok product demo script?',
      answer:
        'A tiktok product demo script is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the tiktok product demo script?',
      answer:
        'No account needed. Open the tiktok product demo script, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Template-based, not AI: the tool cannot test your product or verify your claims — every claim in the final video must be true.',
    'The #ad disclosure line is a template reminder, not legal advice; you are responsible for FTC and local disclosure rules.',
    'Maximum 5 features per item — one demo beat each — to keep demos short and watchable.',
  ],
  jsonLd: [],
};
