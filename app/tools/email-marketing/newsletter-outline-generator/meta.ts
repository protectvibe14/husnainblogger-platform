import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/email-marketing/newsletter-outline-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Newsletter topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. remote work productivity',
  },
  {
    id: 'sections',
    label: 'Custom section names (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. News, Deep dive, Tools (comma-separated)',
  },
  {
    id: 'targetWords',
    label: 'Target word count',
    type: 'number',
    required: true,
    placeholder: '800',
    validation: { min: 100, max: 10000 },
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['playful', 'professional', 'witty', 'minimal', 'bold'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'outline',
    label: 'Newsletter outline',
    type: 'table',
    description:
    'Free newsletter outline generator 2026: Each section with its writing purpose and word budget. free.',
  },
  {
    id: 'totalWords',
    label: 'Total words',
    type: 'number',
    description:
    'Sum of all section word budgets (equals your target).',
  },
  {
    id: 'notices',
    label: 'Notes',
    type: 'list',
    description:
    'Truncation or section-cap notes.',
  },
];

export const content: ToolContent = {
  title: 'Newsletter Outline Generator',
  description:
    'Build a newsletter outline fast — enter your topic and word count to get sections with word budgets. Free tool needed. Start planning now.',
  howTo: [
    'Enter your newsletter topic in the "Newsletter topic" field (e.g. remote work productivity).',
    'Set your target word count (100–10,000 words).',
    'Pick a tone for the writing guidance.',
    'Optionally list custom section names, comma-separated — or leave the field blank for the default 8-section structure.',
    'Run the tool and draft each section to its word budget.',
  ],
  methodology:
    'The default structure uses 8 fixed section templates (The Hook, Quick Wins, The Deep Dive, Worth Your Clicks, From the Inbox, Tool of the Week, Behind the Scenes, One Next Step) with fixed word-share weights; your target word count is split across them so the budgets always add up exactly. Custom section names you provide get equal word shares. Nothing is written by AI — the outline is a planning scaffold you fill in yourself.',
  examples: [
    {
      title: 'Productivity topic, 800 words',
      inputs: { topic: 'remote work productivity', targetWords: 800, tone: 'professional' },
      note: 'Default 8-section outline with budgets summing to exactly 800 words.',
    },
    {
      title: 'Custom sections',
      inputs: { topic: 'indie hacking', sections: 'News, Deep dive, Tools', targetWords: 600, tone: 'witty' },
      note: 'Your own section names split the 600-word target equally.',
    },
  ],
  faqs: [
    {
      question: 'What is the best newsletter outline generator?',
      answer:
        'The best newsletter outline generator gives you a section-by-section plan with word budgets and a clear purpose for each section — not just headings. This tool does that for free, with a default 8-section structure or your own custom sections.',
    },
    {
      question: 'Is there a free newsletter outline generator?',
      answer:
        'Yes — this newsletter outline generator is completely free with no signup. Generate outlines for any topic and any target word count from 100 to 10,000 words.',
    },
    {
      question: 'How to generate newsletter?',
      answer:
        'Enter your topic, set a target word count, and pick a tone. The tool returns a section-by-section outline with word budgets — then draft each section to its budget and your issue is structured.',
    },
    {
      question: 'How does a newsletter outline generator work?',
      answer:
        'It splits your target word count across fixed section templates using fixed weights, so every section gets a word budget and a writing purpose. If you supply your own section names, the word count is split equally instead.',
    },
    {
      question: 'What is a newsletter outline generator?',
      answer:
        'A newsletter outline generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Outlines are planning scaffolds from fixed templates — the tool does not write your newsletter copy.',
    'Word budgets are arithmetic splits of your target; adjust them to fit your style.',
    'Custom section input is capped at 12 sections; topic text is truncated at 120 characters with a notice.',
  ],
  jsonLd: [],
};
