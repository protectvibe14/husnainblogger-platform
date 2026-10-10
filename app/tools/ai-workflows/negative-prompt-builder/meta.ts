import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent, BuilderField } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'term',
    label: 'Thing to avoid',
    type: 'text',
    required: true,
    placeholder: 'e.g. blurry, watermark, extra fingers',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'negativePrompt',
    label: 'Your negative prompt',
    type: 'copy',
    description:
    'Free negative prompt generator 2026: Paste this into the negative prompt field of your image generator. Get instant results. free now.',
  },
];

export const content: ToolContent = {
  title: 'Negative Prompt Generator',
  description:
    'Use this free negative prompt generator: list what your image generator should avoid and get one clean comma-joined prompt string. - build yours now.',
  howTo: [
    'Click "Add row" for each thing you want your image generator to avoid.',
    'Type a term in each row — for example "blurry", "watermark", or "extra fingers".',
    'Click run to combine your rows into one negative prompt string.',
    'Copy the result and paste it into the negative prompt field of your image generator.',
  ],
  methodology:
    'Terms are trimmed, embedded commas are removed, internal whitespace is collapsed, duplicates are dropped case-insensitively, and the remaining terms are joined with ", " in the order you added them. Fixed rules only — no AI is involved.',
  faqs: [
    {
      question: 'What is the best negative prompt generator?',
      answer:
        'The best one simply combines your avoid-list into a clean, deduplicated string you can paste anywhere. This free tool does exactly that — add your terms as rows and copy the result.',
    },
    {
      question: 'Is there a free negative prompt generator?',
      answer:
        'Yes — this Negative Prompt Generator is free with no signup. Add as many terms as you like and get one comma-joined negative prompt instantly.',
    },
    {
      question: 'How do you generate negative prompt ideas?',
      answer:
        'Start with common problem terms like blurry, low quality, watermark, extra fingers, or distorted face — or use the suggested-term list in the guide. Then run this tool to assemble them into one string.',
    },
    {
      question: 'How does a negative prompt generator work?',
      answer:
        'You list everything you want the image generator to avoid, and the tool joins them into a single comma-separated string. Paste that string into the negative prompt field of Stable Diffusion, Midjourney, or any tool that supports one.',
    },
    {
      question: 'What is a negative prompt generator?',
      answer:
        'A negative prompt generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The tool assembles your terms — it does not suggest terms or know your image model.',
    'Suggested starter terms are common examples, not a guarantee against artifacts.',
    'Duplicate removal is case-insensitive ("Blurry" and "blurry" count as one).',
  ],
  jsonLd: [],
};
