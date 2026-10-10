import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'topics',
    label: 'Your topics (one per line)',
    type: 'textarea',
    required: true,
    placeholder: 'Email list building\nMorning routines\nBudget travel',
  },
  {
    id: 'formats',
    label: 'Your formats (one per line)',
    type: 'textarea',
    required: true,
    placeholder: 'blog post\nshort video\ncarousel post',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'ideaMatrix',
    label: 'Your content ideas matrix',
    type: 'table',
    description:
    'Free content ideas matrix 2026: Every topic × every format, each with a working-title template. Get instant results. free now.',
  },
];

export const content: ToolContent = {
  title: 'Content Ideas Matrix Generator',
  description:
    'Cross your topics with your formats into a content ideas matrix: every cell gets a working-title template. Free, template-based - start now.',
  howTo: [
    'Type your topics in the topics box, one topic per line.',
    'Type your content formats in the formats box, one per line.',
    'Click run to build the topic × format matrix (up to 200 cells).',
    'Read each cell as a working title — rewrite the best ones in your own voice.',
    'Export or copy the matrix and pick the cells you will actually create.',
  ],
  methodology:
    'The tool cross-multiplies your topics and formats and fills each cell with a working title assembled from a fixed bank of 8 title formulas. Nothing is AI-generated: your topics and formats are the only inputs, and formulas are applied deterministically.',
  examples: [
    {
      title: 'Blogger with 2 topics',
      inputs: { topics: 'Email list building\nMorning routines', formats: 'blog post\nshort video' },
      note: 'Produces a 2 × 2 matrix with 4 working-title templates.',
    },
    {
      title: 'YouTuber planning formats',
      inputs: { topics: 'Budget travel', formats: 'vlog\nlisticle video\nshorts' },
      note: 'One topic crossed with three formats gives three title templates.',
    },
  ],
  faqs: [
    {
      question: 'What is the best content ideas matrix?',
      answer:
        'The best matrix is simply your own topics crossed with your own formats so no combination slips through. This free tool builds that grid for you and adds a working-title template to every cell.',
    },
    {
      question: 'Is there a free content ideas matrix?',
      answer:
        'Yes — this Content Ideas Matrix Generator is free with no signup. Enter your topics and formats, one per line, and get a full matrix instantly.',
    },
    {
      question: 'How do you use content?',
      answer:
        'However you plan to publish it, a matrix helps you see every topic-format pairing at once. Fill in your real topics and formats above, then turn the best cells into finished pieces.',
    },
    {
      question: 'How does a content ideas matrix work?',
      answer:
        'It places your topics down one side and your formats across the top; each cell is one concrete idea. This tool fills every cell with a working-title template you can adapt, so you get dozens of starting points in seconds.',
    },
    {
      question: 'How does the content ideas matrix work?',
      answer:
        'Enter your details using the inputs above and the content ideas matrix calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the content ideas matrix free to use?',
      answer:
        'Yes - this content ideas matrix is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a content ideas matrix?',
      answer:
        'A content ideas matrix is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Titles come from a fixed bank of 8 formulas — they are starting templates, not AI-written ideas.',
    'Matrices are capped at 20 topics, 10 formats, and 200 cells; larger lists should be split into batches.',
    'The tool does not judge which ideas are good — that decision is yours.',
  ],
  jsonLd: [
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Content Ideas Matrix Generator',
          item: 'https://husnainblogger.com/tools/ai-workflows/content-ideas-matrix-generator/',
        },
      ],
    },
  ],
};
