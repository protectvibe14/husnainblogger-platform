import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'productName',
    label: 'Product name',
    type: 'text',
    required: true,
    placeholder: 'e.g. insulated gym water bottle',
    validation: { max: 120 },
  },
  {
    id: 'keywords',
    label: 'Keywords (comma-separated or one per line)',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. insulated bottle, gym bottle, 1L flask, BPA free',
    validation: { max: 2000 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'optimizedTitles', label: 'Optimized title options', type: 'list' },
  { id: 'checksNote', label: 'Limit + stuffing check note', type: 'text' },
];

const DESCRIPTION =
  'Sell more with this TikTok shop title optimizer — keywords and benefit words arranged for search visibility and impulse clicks. Find your best converters.';

export const content: ToolContent = {
  title: 'TikTok Shop Title Optimizer',
  description: DESCRIPTION,
  howTo: [
    'Type your product name into the "Product name" box — for example "insulated gym water bottle".',
    'Paste your keywords into "Keywords", comma-separated or one per line (up to 12 are used).',
    'Run the optimizer to get 8 keyword-first title variants built from 8 fixed patterns.',
    'Read the checks note: every title is verified against the 255-character Shop limit and a keyword-stuffing guard.',
    'Copy your favorite title into the product-name field of your TikTok Shop listing.',
  ],
  methodology:
    'Each run cycles your keywords through 8 fixed keyword-first title patterns in a deterministic order, trims every title to 255 characters at a word boundary, and rejects any title where one keyword repeats more than 3 times. There is no AI and no TikTok search data — the tool organizes your keywords, it does not predict rankings.',
  examples: [
    {
      title: 'Water bottle',
      inputs: {
        productName: 'insulated gym water bottle',
        keywords: 'insulated bottle, gym bottle, 1L flask, BPA free',
      },
      note: '8 keyword-first variants like "insulated bottle | insulated gym water bottle", each within 255 characters.',
    },
    {
      title: 'Single keyword',
      inputs: { productName: 'LED sunset lamp', keywords: 'sunset lamp' },
      note: 'Still produces 8 unique titles — the 8 patterns carry the variety when keywords are few.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok shop title?',
      answer:
        'The best TikTok Shop titles put the main keyword first, name the product clearly, and stay under TikTok\'s 255-character product-name limit. This free tool builds 8 keyword-first variants from your own keywords and checks each against that limit.',
    },
    {
      question: 'Is there a free tiktok shop title?',
      answer:
        'Yes — this title optimizer is completely free with no signup. It assembles titles from fixed templates in your browser, so you can regenerate as often as you like.',
    },
    {
      question: 'How to use tiktok shop title?',
      answer:
        'Enter your product name and keywords, generate 8 variants, pick one, and paste it into the product-name field when creating or editing your TikTok Shop listing.',
    },
    {
      question: 'How does a tiktok shop title work?',
      answer:
        'You type a product name and keyword list; the tool combines them into 8 keyword-first title patterns, trims each to 255 characters, and rejects any title where a keyword repeats more than 3 times. It is rule-based — there is no AI and no access to TikTok\'s search data.',
    },
    {
      question: 'How does the tiktok shop title work?',
      answer:
        'Enter your details using the inputs above and the tiktok shop title calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok shop title free to use?',
      answer:
        'Yes - this tiktok shop title is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok shop title?',
      answer:
        'A tiktok shop title is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Titles are assembled from 8 fixed patterns — they are organizational suggestions, not AI-written copy, and cannot promise higher search rankings or sales.',
    'The 255-character cap reflects TikTok Shop\'s product-name limit; the keyword-stuffing guard (max 3 repetitions) is this tool\'s own heuristic, not a published platform rule.',
    'The tool cannot check whether a title is already used by another seller or whether your keywords match real TikTok search demand.',
  ],
  jsonLd: [
  ],
};
