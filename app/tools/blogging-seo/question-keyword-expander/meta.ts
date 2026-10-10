import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'seedKeyword',
    label: 'Seed keyword',
    type: 'text',
    required: true,
    placeholder: 'e.g. sourdough bread',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'expansions',
    label: 'Question idea seeds',
    type: 'list',
    description:
    'Free question keyword generator 2026: Question-form variations built from fixed question templates. Get instant results. free now.',
  },
  {
    id: 'count',
    label: 'Questions generated',
    type: 'number',
    description:
    'How many question ideas were produced.',
  },
];

export const content: ToolContent = {
  title: 'Question Keyword Generator',
  description:
    'Generate question keyword ideas (who, what, how, why) from any seed keyword instantly. Free question keyword generator — expand your seed now.',
  howTo: [
    'Type your seed keyword (2-100 characters) into the Seed keyword field.',
    'Click Generate to build question variations from the fixed template bank.',
    'Review the question ideas for FAQ sections, headings and new articles.',
    'Copy the questions that match real queries your audience asks.',
    'Check the phrasing against real "People Also Ask" results before publishing.',
  ],
  methodology:
    'This tool inserts your seed keyword into 23 fixed question templates covering who, what, how, why, when, where, which, can, should and worth-it patterns (e.g. "how does {seed} work", "is {seed} worth it"). A trailing question mark on your seed is stripped first. It runs entirely in your browser — no AI model, no live search data, no real "People Also Ask" results.',
  examples: [
    {
      title: 'Baking blog',
      inputs: { seedKeyword: 'sourdough bread' },
      note: 'Produces questions like "what is sourdough bread", "how long does sourdough bread take" and "is sourdough bread worth it".',
    },
    {
      title: 'Finance blog',
      inputs: { seedKeyword: 'index funds' },
      note: 'Produces questions like "how do index funds work", "should i try index funds" and "why is index funds important".',
    },
  ],
  faqs: [
    {
      question: 'What is the best question keyword generator?',
      answer:
        'No independent ranking proves one generator "the best" — tools with real "People Also Ask" data cost money, while free ones brainstorm. This free generator is a template-based brainstorming starting point; compare its ideas against real search results.',
    },
    {
      question: 'Is there a free question keyword generator?',
      answer:
        'Yes — this tool is completely free with no signup. It builds question ideas from 23 fixed templates in your browser. It does not pull real "People Also Ask" data or search volumes.',
    },
    {
      question: 'How to generate question keyword ideas?',
      answer:
        'Take a seed keyword and apply question words: who, what, when, where, why, how, which, can and should. Enter your seed above and this tool applies those patterns automatically, giving you FAQ and heading ideas to refine.',
    },
    {
      question: 'How does a question keyword generator work?',
      answer:
        'This one inserts your seed into 23 hand-written question templates covering every major question word. It does not query Google — every output is a deterministic template combination, a starting point to validate against real questions people ask.',
    },
    {
      question: 'What is a question keyword generator?',
      answer:
        'A question keyword generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Outputs are brainstorming idea seeds, not real "People Also Ask" data — validate phrasing against actual search results.',
    'Templates follow English question grammar; some combinations may read awkwardly for unusual seeds.',
  ],
  jsonLd: [],
};
