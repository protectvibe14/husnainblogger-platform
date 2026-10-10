import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/content-angle-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. email marketing',
  },
  {
    id: 'audience',
    label: 'Audience (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. small business owners — defaults to beginners',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'angles',
    label: 'Content angles',
    type: 'table',
    description:
    'Free content angle generator 2026: 12 ready-to-write angles with a note on why each works. free.',
  },
  {
    id: 'count',
    label: 'Angle count',
    type: 'number',
    description:
    'How many angles were generated.',
  },
];

export const content: ToolContent = {
  title: 'Content Angle Generator',
  description:
    'Beat the blank page with this free content angle generator. Turn any topic into 12 ready-to-write angles for listicles, guides and more. Get angles now.',
  howTo: [
    'Type your topic into the "Topic" box, e.g. email marketing.',
    'Optionally name your audience — leave it blank to target beginners.',
    'Run the tool to get 12 angles across listicles, how-tos, comparisons, case studies, and more.',
    'Pick the angle that fits your goal and write the post yourself — these are starting frames, not finished articles.',
  ],
  methodology:
    'This tool applies a fixed bank of 12 editorial angle templates to your topic and audience — no AI writes anything at runtime, so the same inputs always give the same 12 angles. The templates cover proven formats (listicle, how-to, comparison, case study, contrarian take, checklist, data roundup, FAQ, tools roundup, myth-busting, trends, beginner primer). Angles are starting frames only; research, facts, and writing are yours to do.',
  examples: [
    {
      title: 'Email marketing for small business',
      inputs: { topic: 'email marketing', audience: 'small business owners' },
      note: '12 angles including a comparison, a case study, and a statistics roundup.',
    },
    {
      title: 'Default audience',
      inputs: { topic: 'sourdough baking' },
      note: 'Angles target beginners when no audience is given.',
    },
  ],
  faqs: [
    {
      question: 'What is the best content angle generator?',
      answer:
        'The best angle generator gives you distinct, proven formats — not 12 versions of the same listicle. This tool produces 12 different angles (listicle, how-to, comparison, case study, contrarian take, checklist, and more) so you can pick the frame that fits your goal.',
    },
    {
      question: 'Is there a free content angle generator?',
      answer:
        'Yes — this tool is completely free with no signup. Enter any topic and get 12 ready-to-write angles instantly, with your audience baked into each title idea.',
    },
    {
      question: 'How to generate content angle ideas?',
      answer:
        'Start with your topic, then rotate through proven angles: teach it (how-to), list it (listicle), compare it, show proof (case study), argue against the consensus, or round up data. This tool does the rotation for you across 12 formats.',
    },
    {
      question: 'How does a content angle generator work?',
      answer:
        'You enter a topic and optional audience; the tool fills 12 fixed editorial templates with your words. Nothing is written by AI — the angles are pre-written frames, so results are identical for the same inputs every time.',
    },
    {
      question: 'What is a content angle generator?',
      answer:
        'A content angle generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Can I customize the generated content angle generator?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
    {
      question: 'How do I create content angle generator?',
      answer: 'Describe what you need in the input fields, then click generate. You can regenerate as many times as you like and copy the version that fits best.',
    },
  ],
  assumptions: [
    'Angles are starting frames, not finished content — you still need to research, verify facts, and write the article yourself.',
    'Templates are generic and may need rewording for unusual niches or non-English audiences.',
    'The statistics angle uses the current year; verify any stats you publish from primary sources.',
  ],
  jsonLd: [],
};
