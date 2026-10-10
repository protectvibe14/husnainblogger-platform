import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent, BuilderField } from '../../../src/templates/types.ts';

const SLUG = 'project-debrief-template-builder';
const CANONICAL = `https://husnainblogger.com/tools/creator-business/${SLUG}/`;
const NAME = 'Project Debrief Template Builder';
const DESCRIPTION =
  'Learn from every project with this project debrief template — wins, lessons, and follow-ups captured while they\'re still fresh. Capture learnings while.';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'projectName',
    label: 'Project name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Spring brand campaign',
  },
  {
    id: 'section',
    label: 'Section (wins, issues, metrics, lessons, followups)',
    type: 'text',
    required: true,
    placeholder: 'wins',
  },
  {
    id: 'note',
    label: 'Your notes (optional)',
    type: 'text',
    required: false,
    placeholder: 'Your reflections for this section',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'debriefDocument', label: 'Debrief document', type: 'copy' },
];

export const content: ToolContent = {
  title: 'Project Debrief Template',
  description: DESCRIPTION,
  howTo: [
    'Add one item per debrief section you want: wins, issues, metrics, lessons, or followups.',
    'Type your project name on each item.',
    'Optionally add your own notes under any section.',
    'Click build to generate the Markdown debrief document.',
    'Copy it into your notes app or docs and answer the prompts.',
  ],
  methodology:
    'Template assembly: each section you pick maps to a fixed template with 3 reflective prompts (15 prompts total across the 5 sections). Sections are ordered wins, issues, metrics, lessons, followups, duplicates are merged, and your optional notes are appended. Nothing is generated or estimated.',
  faqs: [
    {
      question: 'What is the best project debrief template?',
      answer:
        'The best debrief template covers wins, issues, metrics, lessons, and follow-ups with prompts that force honest reflection. This free builder generates exactly those five sections with guided questions for each.',
    },
    {
      question: 'Is there a free project debrief template?',
      answer:
        'Yes — this tool is free. Choose your sections, add your project name and notes, and get a Markdown debrief document you can copy anywhere, no sign-up required.',
    },
    {
      question: 'How to use project debrief?',
      answer:
        'Add one entry per section, answer the prompts honestly right after the project ends while details are fresh, then save the document with your project records.',
    },
    {
      question: 'How does a project debrief template work?',
      answer:
        'Each section you select maps to a fixed template with three reflective prompts; your entries are merged, ordered, and combined into a single document with your notes attached.',
    },
    {
      question: 'How does the project debrief template work?',
      answer:
        'Enter your details using the inputs above and the project debrief template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the project debrief template free to use?',
      answer:
        'Yes - this project debrief template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a project debrief template?',
      answer:
        'A project debrief template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Section prompts are fixed templates to guide reflection — they do not analyze your project.',
    'The document is a starting point; add your real numbers and details before sharing it.',
  ],
  jsonLd: [],
};
