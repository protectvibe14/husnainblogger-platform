import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL =
  'https://husnainblogger.com/tools/creator-business/scope-of-work-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'projectTitle',
    label: 'Project title',
    type: 'text',
    required: true,
    placeholder: 'Launch campaign content pack',
  },
  {
    id: 'clientName',
    label: 'Client name',
    type: 'text',
    required: true,
    placeholder: 'Client name or company',
  },
  {
    id: 'deliverables',
    label: 'Deliverables (one per line)',
    type: 'textarea',
    required: true,
    placeholder: '3 Instagram Reels\n5 product photos\n1 launch email',
  },
  {
    id: 'timeline',
    label: 'Timeline',
    type: 'text',
    required: true,
    placeholder: '4 weeks from kickoff call',
  },
  {
    id: 'revisionLimit',
    label: 'Included revision rounds',
    type: 'number',
    required: true,
    placeholder: '2',
    validation: { min: 0, unit: 'rounds' },
  },
  {
    id: 'outOfScope',
    label: 'Out of scope (one per line)',
    type: 'textarea',
    required: false,
    placeholder: 'Paid ad management\nWebsite redesign',
  },
  {
    id: 'paymentTerms',
    label: 'Payment terms',
    type: 'text',
    required: true,
    placeholder: '50% upfront, 50% on delivery',
  },
  {
    id: 'assumptions',
    label: 'Assumptions (one per line)',
    type: 'textarea',
    required: false,
    placeholder: 'Client provides product samples by week 1',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'scopeOfWorkDocument',
    label: 'Scope of work document (copy)',
    type: 'copy',
    description:
    'Free freelance scope of work template 2026: Sectioned scope-of-work draft: deliverables, timeline, revisions, exclusions, payment. Fast, private -.',
  },
];

export const content: ToolContent = {
  title: 'Freelance Scope of Work Template',
  description:
    'Write a freelance scope of work template that prevents scope creep: list deliverables, revisions, exclusions, and payment terms. Free.',
  howTo: [
    'Enter the "Project title" and "Client name" exactly as they should appear.',
    'List each "Deliverable" on its own line — be specific about quantities and formats.',
    'Set the "Timeline" and the number of "Included revision rounds".',
    'Fill in "Out of scope" items; leaving it blank inserts a warning about scope creep.',
    'Add "Payment terms" and any "Assumptions", then copy the finished document.',
  ],
  methodology:
    'The tool assembles a fixed 7-section template (project, deliverables, timeline, revisions, out of scope, payment terms, assumptions) and inserts only your own words — nothing is written by AI. Deliverables, exclusions, and assumptions accept one item per line; an empty exclusions list produces an explicit warning note instead of a silent blank, because undefined exclusions are the main cause of scope creep.',
  examples: [
    {
      title: 'Content pack for a product launch',
      inputs: {
        projectTitle: 'Launch campaign content pack',
        clientName: 'GlowCo LLC',
        deliverables: '3 Instagram Reels\n5 product photos',
        timeline: '4 weeks from kickoff call',
        revisionLimit: 2,
        outOfScope: 'Paid ad management\nWebsite redesign',
        paymentTerms: '50% upfront, 50% on delivery',
        assumptions: 'Client provides product samples by week 1',
      },
      note: 'A complete draft with numbered deliverables and explicit exclusions.',
    },
    {
      title: 'Logo design with no exclusions listed',
      inputs: {
        projectTitle: 'Brand logo design',
        clientName: 'Northline Agency',
        deliverables: 'Primary logo\n2 logo variations',
        timeline: '2 weeks from deposit',
        revisionLimit: 3,
        outOfScope: '',
        paymentTerms: '100% upfront',
        assumptions: '',
      },
      note: 'Empty exclusions trigger the scope-creep warning inside the document.',
    },
  ],
  faqs: [
    {
      question: 'What is the best freelance scope of work template?',
      answer:
        'The best freelance scope of work template lists every deliverable, the timeline, revision limits, explicit exclusions, payment terms, and assumptions. This generator produces all seven sections from your inputs so nothing important is left vague.',
    },
    {
      question: 'Is there a free freelance scope of work template?',
      answer:
        'Yes — this scope of work generator is completely free with no signup. Enter your project details and copy the sectioned draft for every client project.',
    },
    {
      question: 'How to use freelance scope of work?',
      answer:
        'List each deliverable, set the timeline and revision rounds, write down what is out of scope, add payment terms and assumptions, then copy the draft and have the client approve it before work starts.',
    },
    {
      question: 'How does a freelance scope of work template work?',
      answer:
        'It turns your project details into a structured document with numbered sections — deliverables, timeline, revisions, exclusions, payment, and assumptions. The tool only formats what you provide; nothing is generated by AI, and it is not legal advice.',
    },
    {
      question: 'What is a freelance scope of work template?',
      answer:
        'A freelance scope of work template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Can I customize the generated freelance scope of work template?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
    {
      question: 'How do I create freelance scope of work template?',
      answer: 'Describe what you need in the input fields, then click generate. You can regenerate as many times as you like and copy the version that fits best.',
    },
  ],
  assumptions: [
    'This is a draft template assembled from your inputs, not legal advice — have both parties review the final version.',
    'An empty exclusions list is flagged with a warning, not treated as "everything is included".',
    'The tool cannot enforce a signed agreement; client approval happens outside the tool.',
  ],
  jsonLd: [],
};
