import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

// tool-220 — Giveaway Rules Generator (generator).

export const inputs: ToolInput[] = [
  {
    id: 'prize',
    label: 'Prize',
    type: 'text',
    required: true,
    placeholder: 'e.g. a $100 gift card, a skincare bundle',
  },
  {
    id: 'entryMethod',
    label: 'Entry method',
    type: 'select',
    required: true,
    options: ['Like + comment', 'Follow both accounts', 'Tag a friend', 'Share to your story'],
  },
  {
    id: 'endDate',
    label: 'End date',
    type: 'date',
    required: true,
  },
  {
    id: 'region',
    label: 'Eligibility region (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. the US, the UK',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'rulesText', label: 'Giveaway rules text', type: 'copy' },
  { id: 'entrySteps', label: 'Entry steps', type: 'list' },
  { id: 'complianceChecklist', label: 'Compliance checklist', type: 'list' },
];

export const content: ToolContent = {
  title: 'Instagram Giveaway Rules Template',
  description:
    'Run a fair giveaway with this free rules template: add your prize, entry method, and end date for rules text plus a checklist. Get started!',
  howTo: [
    'Describe the prize — e.g. "a $100 gift card".',
    'Pick an entry method: Like + comment, Follow both accounts, Tag a friend, or Share to your story.',
    'Set the end date (must be in the future).',
    'Optionally add the eligibility region.',
    'Generate to get the rules text, entry steps, and a compliance checklist — then review with a lawyer for high-value prizes.',
  ],
  methodology:
    'The tool fills a fixed giveaway-rules template with your prize, entry method, end date, and region, and pairs it with 4 fixed entry steps per method and a 5-item compliance checklist. It runs fully client-side and is template-based — never legal advice.',
  examples: [
    {
      title: 'Gift card giveaway, tag-a-friend entry',
      inputs: { prize: 'a $100 gift card', entryMethod: 'Tag a friend', endDate: '2099-12-31', region: 'the US' },
      note: 'Full rules text with tag-a-friend steps and a compliance checklist.',
    },
    {
      title: 'Skincare bundle, no region',
      inputs: { prize: 'a skincare bundle', entryMethod: 'Follow both accounts', endDate: '2099-06-01', region: '' },
      note: 'Generic eligibility line ("where lawful") when no region is given.',
    },
  ],
  faqs: [
    {
      question: 'What is the best instagram giveaway rules template?',
      answer:
        'This free tool fills a fixed giveaway-rules template with your prize, entry method, and end date, plus a compliance checklist. It is a template only — not legal advice — so check Instagram\'s promotion guidelines and your local laws before publishing.',
    },
    {
      question: 'Is there a free instagram giveaway rules template?',
      answer:
        'Yes — this tool is free and runs entirely in your browser. You get copy-ready rules text, entry steps for your chosen entry method, and a 5-item compliance checklist.',
    },
    {
      question: 'How to use instagram giveaway rules?',
      answer:
        'Generate the rules text, paste it into your giveaway post or a linked page, set the end date with a timezone, and announce the winner exactly as the rules describe. For high-value prizes, have a lawyer review the rules first.',
    },
    {
      question: 'What is an instagram giveaway rules template?',
      answer:
        'An instagram giveaway rules template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the instagram giveaway rules template?',
      answer:
        'No account needed. Open the instagram giveaway rules template, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Template only — not legal advice; check Instagram\'s promotion guidelines and your local laws.',
    'The end date must be in the future; the tool validates this before generating.',
    'Entry steps and the compliance checklist are general guidance, not tailored legal counsel.',
  ],
  jsonLd: [],
};
