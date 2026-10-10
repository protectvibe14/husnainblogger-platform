import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/ai-workflows/sales-page-outline-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'offerName',
    label: 'Offer name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Email List Accelerator',
  },
  {
    id: 'price',
    label: 'Price',
    type: 'text',
    required: false,
    placeholder: 'e.g. $97',
  },
  {
    id: 'targetAudience',
    label: 'Target audience',
    type: 'text',
    required: false,
    placeholder: 'e.g. beginner bloggers',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'outline',
    label: 'Full outline (copy)',
    type: 'copy',
    description:
    'Free sales page outline 2026: The complete 10-section outline with your details filled in — copy it whole. Fast, private now.',
  },
  {
    id: 'sections',
    label: 'Section headings',
    type: 'list',
    description:
    'Numbered list of the 10 section headings for quick reference.',
  },
];

export const content: ToolContent = {
  title: 'Sales Page Outline',
  description:
    'Build a proven sales page outline for your offer in seconds. Enter your offer details and get a 10-section structure with write prompts. Start building.',
  howTo: [
    'Enter your offer name (required).',
    'Add your price and target audience (optional — placeholders are used if you skip them).',
    'Run the tool to get a 10-section sales page structure with your details filled in.',
    'Follow each section\'s "Write" prompt to draft your own copy — the tool never writes it for you.',
    'Copy the full outline and work through it top to bottom.',
  ],
  methodology:
    'The tool fills a fixed 10-section sales-page structure (hero, problem, cost of doing nothing, solution, what\'s inside, who it\'s for, proof, pricing, FAQ, final CTA) with your offer details. Each section carries a fixed write prompt telling you what to draft. No sales copy is written by AI — the outline is a structure, not finished copy.',
  examples: [
    {
      title: 'Online course launch',
      inputs: { offerName: 'Email List Accelerator', price: '$97', targetAudience: 'beginner bloggers' },
      note: 'Full detail — every section personalized.',
    },
    {
      title: 'Offer name only',
      inputs: { offerName: 'Notion Template Pack' },
      note: 'Bracket placeholders stand in for missing price and audience.',
    },
  ],
  faqs: [
    {
      question: 'What is the best sales page outline?',
      answer:
        'A strong outline covers the classic arc: headline, problem, cost of inaction, solution, what\'s inside, who it\'s for, proof, pricing, FAQ, and final CTA. This free tool generates exactly that 10-section structure with your offer details filled in.',
    },
    {
      question: 'Is there a free sales page outline?',
      answer:
        'Yes — this sales page outline generator is completely free with no signup. Enter your offer name (plus optional price and audience) and get the full 10-section structure instantly.',
    },
    {
      question: 'How to use sales?',
      answer:
        'Start with a clear offer name, then work through the generated 10 sections in order, following each "Write" prompt to draft your own copy. The tool gives you the structure; you supply the words and the proof.',
    },
    {
      question: 'How does a sales page outline work?',
      answer:
        'You enter your offer details and the tool slots them into a fixed 10-section template, each with a fixed write prompt explaining what that section must cover. Nothing is AI-written — it is a planning structure that keeps your page complete and in the right order.',
    },
    {
      question: 'How does the sales page outline work?',
      answer:
        'Enter your details using the inputs above and the sales page outline calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the sales page outline free to use?',
      answer:
        'Yes - this sales page outline is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a sales page outline?',
      answer:
        'A sales page outline is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'No sales copy is written by AI — each section only includes a fixed write prompt for you to follow. The quality of the final page depends on your own copy and proof.',
    'The proof section requires real testimonials: only use results and quotes you actually have; never invent them.',
  ],
  jsonLd: [
  ],
};
