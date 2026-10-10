import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. meal prep for beginners',
    validation: { max: 120 },
  },
  {
    id: 'pillarCount',
    label: 'Number of pillars',
    type: 'number',
    required: true,
    validation: { min: 3, max: 7 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'pillarGrid',
    label: 'Your content pillar grid',
    type: 'table',
    description:
    'Free content pillars template 2026: Fill-in grid: numbered pillars, subtopic slots per pillar, and suggested formats. Fast, private now.',
  },
];

export const content: ToolContent = {
  title: 'Content Pillars Template',
  description:
    'Turn your niche into a fill-in content pillars template: pick 3-7 pillars, get numbered subtopic slots and format ideas. Free - plan today.',
  howTo: [
    'Type your niche in the Your niche field (for example, "meal prep for beginners").',
    'Choose how many pillars you want, from 3 to 7.',
    'Click run to generate your pillar grid template.',
    'Fill in each pillar\'s six subtopic slots with your own topics.',
    'Use the suggested format column as a starting mix for each slot.',
  ],
  methodology:
    'This tool arranges your niche into a fixed grid template: each of the 3–7 pillars gets 6 numbered subtopic slots, and format ideas rotate deterministically from a fixed bank of 8 formats. Nothing is AI-generated — you name the pillars and subtopics yourself.',
  examples: [
    {
      title: 'Meal prep blogger',
      inputs: { niche: 'meal prep for beginners', pillarCount: 4 },
      note: 'Gets a 4-pillar grid with 24 numbered subtopic slots to fill in.',
    },
    {
      title: 'Fitness creator',
      inputs: { niche: 'home workouts', pillarCount: 3 },
      note: 'A compact 3-pillar grid with 18 subtopic slots.',
    },
  ],
  faqs: [
    {
      question: 'What is the best content pillars template?',
      answer:
        'The best one is a simple grid you actually fill in: 3–7 core themes (pillars) with numbered subtopic slots under each. This tool builds that grid for your niche so you can start planning right away.',
    },
    {
      question: 'Is there a free content pillars template?',
      answer:
        'Yes — this Content Pillars Template is completely free with no signup. Enter your niche, pick 3–7 pillars, and download your fill-in grid instantly.',
    },
    {
      question: 'How do you use content pillars?',
      answer:
        'Pick 3–7 core themes your niche covers, then plan supporting posts, videos, or newsletters under each one. Over time each pillar becomes a cluster of related content that keeps your audience engaged and builds topical authority.',
    },
    {
      question: 'How does a content pillars template work?',
      answer:
        'It lays out each pillar in a grid with numbered subtopic slots and suggested content formats. You fill in the slot names with your own topics, which turns a vague posting plan into an organized content system.',
    },
    {
      question: 'How does the content pillars template work?',
      answer:
        'Enter your details using the inputs above and the content pillars template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the content pillars template free to use?',
      answer:
        'Yes - this content pillars template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a content pillars template?',
      answer:
        'A content pillars template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'This is a fill-in template — the tool does not name your pillars or invent subtopics for you.',
    'Format suggestions rotate from a fixed bank of 8 formats, not from analysis of your niche.',
  ],
  jsonLd: [
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Content Pillars Planner',
          item: 'https://husnainblogger.com/tools/ai-workflows/ai-content-pillars-planner/',
        },
      ],
    },
  ],
};
