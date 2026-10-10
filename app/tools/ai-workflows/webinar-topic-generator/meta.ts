import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Your niche (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. real estate coaches',
  },
  {
    id: 'audiencePain',
    label: "Audience pain point",
    type: 'text',
    required: true,
    placeholder: 'e.g. inconsistent lead flow',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'topics',
    label: 'Webinar topic titles',
    type: 'list',
    description:
    'Free webinar topic ideas 2026: Topic titles with one angle variant each, from fixed title formulas. Get instant results. free now.',
  },
  {
    id: 'note',
    label: 'Word-bank note',
    type: 'text',
    description:
    'Which word bank was used (niche-specific or generic).',
  },
];

export const content: ToolContent = {
  title: 'Webinar Topic Ideas',
  description:
    'Get fresh webinar title ideas — combine your niche and pain point through 8 fixed title formulas with angle variants. Free webinar topic ideas tool.',
  howTo: [
    'Optionally enter your niche — without it, a generic bank is used and labeled as generic.',
    'Describe your audience\'s pain point in a few words.',
    'Click generate to get 8 webinar titles, each with an angle variant.',
    'Pick the titles that fit your offer and refine the wording before promoting.',
  ],
  methodology:
    'This is a word-bank combiner, not AI ideation. Your niche and pain point are inserted into 8 fixed title formulas (how-to, system, masterclass, case-study, Q&A patterns), and each title is paired with a fixed angle variant such as "Live Demo Edition". The banks are published in the tool logic; nothing is invented beyond the combination.',
  examples: [
    {
      title: 'Coaches niche',
      inputs: {
        niche: 'real estate coaches',
        audiencePain: 'inconsistent lead flow',
      },
      note: '8 niche-specific titles like "From Inconsistent lead flow to Results: A Real estate coaches Masterclass".',
    },
    {
      title: 'No niche given',
      inputs: {
        audiencePain: 'low email open rates',
      },
      note: 'Generic bank: titles say "your industry" and are labeled as generic.',
    },
  ],
  faqs: [
    {
      question: 'What is the best source of webinar topic ideas?',
      answer:
        'The best webinar topic ideas come from a real audience pain point matched to a proven title pattern — which is exactly what this tool does. It combines your niche and pain point through 8 fixed title formulas, each with an angle variant. It will not invent demand for a topic nobody wants; validate the pain with your audience first.',
    },
    {
      question: 'Is there a free webinar topic ideas tool?',
      answer:
        'Yes — this one. It is free, runs entirely in your browser, and needs no sign-up. Describe your audience\'s pain point, optionally add your niche, and you get 8 webinar titles with angle variants in seconds.',
    },
    {
      question: 'How do I pick a webinar topic?',
      answer:
        'Start from your audience\'s most painful problem, then test a title that promises a specific outcome against that pain. This tool generates the candidate titles; your job is to pick the one your audience already asks about and refine the wording before you promote it.',
    },
    {
      question: 'How does a webinar topic generator work?',
      answer:
        'This one is template-based, not AI: your niche and pain point are inserted into 8 fixed title formulas and paired with 8 fixed angle variants. If you skip the niche, a generic bank is used and clearly labeled as generic. The same inputs always produce the same list.',
    },
    {
      question: 'How does the webinar topic ideas work?',
      answer:
        'Enter your details using the inputs above and the webinar topic ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the webinar topic ideas free to use?',
      answer:
        'Yes - this webinar topic ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a webinar topic ideas?',
      answer:
        'A webinar topic ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Titles come from 8 fixed formulas + 8 angle variants — they are starting points, not final copy.',
    'Without a niche, the generic bank is used and titles say "your industry".',
    'The tool cannot validate whether your audience actually wants the topic — research that yourself.',
  ],
  jsonLd: [],
};
