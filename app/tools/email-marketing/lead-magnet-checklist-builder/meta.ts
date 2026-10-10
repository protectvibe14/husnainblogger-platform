import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/email-marketing/lead-magnet-checklist-builder/';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'magnetTopic',
    label: 'Lead magnet topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. Morning Routine Checklist (required on the first row)',
  },
  {
    id: 'step',
    label: 'Checklist step',
    type: 'text',
    required: false,
    placeholder: 'e.g. Define the one win (leave blank to auto-suggest)',
  },
  {
    id: 'detail',
    label: 'Step detail (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. what to include or how to do it',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'checklist',
    label: 'Lead magnet checklist',
    type: 'table',
    description:
    'Free lead magnet checklist template 2026: Table of checklist steps: number, step, and detail. Rows with blank steps are auto-filled. Fast, private -.',
  },
  {
    id: 'printable',
    label: 'Printable checklist',
    type: 'copy',
    description:
    'Plain-text checklist with the magnet title, numbered steps, and details — ready to copy into a document or designer brief.',
  },
];

export const content: ToolContent = {
  title: 'Lead Magnet Checklist Template',
  description:
    'Plan your freebie with this free lead magnet checklist template: add rows for steps, or auto-fill blank steps from a fixed framework. Start building.',
  howTo: [
    'Add one row per checklist step. On the first row, enter your lead magnet topic (required).',
    'Enter each step and an optional one-line detail, or leave a step blank to auto-fill it from a fixed 12-step framework.',
    'Add up to 30 rows, then run the builder to get your checklist table.',
    'Copy the printable plain-text version into your document, designer brief, or task manager.',
    'Work through the checklist in the tool — checking off steps stays saved in your browser.',
  ],
  methodology:
    'No AI is involved: rows you enter are used verbatim, and blank steps are filled from a fixed bank of 12 generic lead-magnet build steps. Output is assembled deterministically from your rows in order — same rows always produce the same checklist.',
  faqs: [
    {
      question: 'What is the best lead magnet checklist template?',
      answer:
        'The best one covers the full build: the promise, the content outline, proof, design, delivery email, opt-in copy, thank-you page, and testing. This free builder ships a fixed 12-step framework covering exactly that, and you can replace any step with your own.',
    },
    {
      question: 'Is there a free lead magnet checklist template?',
      answer:
        'Yes — this lead magnet checklist builder is completely free with no signup. Add up to 30 rows, get a checklist table plus a printable plain-text copy, and your progress stays saved in your browser.',
    },
    {
      question: 'How to use lead magnet?',
      answer:
        'Build a short, specific freebie around one outcome, plan it with this checklist, gate it behind an opt-in form on a relevant page, and deliver it instantly by email. Follow up with a short sequence that turns downloaders into buyers.',
    },
    {
      question: 'How does the lead magnet checklist template work?',
      answer:
        'Enter your details using the inputs above and the lead magnet checklist template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the lead magnet checklist template free to use?',
      answer:
        'Yes - this lead magnet checklist template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a lead magnet checklist template?',
      answer:
        'A lead magnet checklist template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the lead magnet checklist template?',
      answer:
        'No account needed. Open the lead magnet checklist template, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Suggested steps come from a fixed 12-step general framework — no AI, and not tailored to your specific topic or business.',
    'Progress tracking lives in the browser (localStorage); clearing site data resets it.',
    'The checklist is general planning guidance — it does not replace testing your actual signup flow end to end.',
  ],
  jsonLd: [
  ],
};
