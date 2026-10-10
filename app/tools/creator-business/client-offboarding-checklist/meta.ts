import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const SLUG = 'client-offboarding-checklist';
const CANONICAL = `https://husnainblogger.com/tools/creator-business/${SLUG}/`;
const NAME = 'Client Offboarding Checklist';
const DESCRIPTION =
  'Generate a free client offboarding checklist for your project type — files, credentials, invoices, testimonials, and archiving in one list. Build yours now.';

export const inputs: ToolInput[] = [
  {
    id: 'projectType',
    label: 'Project type',
    type: 'select',
    required: true,
    options: ['design', 'writing', 'video', 'development', 'coaching'],
  },
  {
    id: 'deliverablesHandover',
    label: 'Deliverables handover complete',
    type: 'boolean',
    required: false,
  },
  {
    id: 'finalInvoiceSent',
    label: 'Final invoice sent',
    type: 'boolean',
    required: false,
  },
];

export const outputs: ToolOutput[] = [
  { id: 'offboardingChecklist', label: 'Your offboarding checklist', type: 'list' },
];

export const content: ToolContent = {
  title: 'Client Offboarding Checklist',
  description: DESCRIPTION,
  howTo: [
    'Select your project type: design, writing, video, development, or coaching.',
    'Toggle "Deliverables handover complete" on if the client already received everything.',
    'Toggle "Final invoice sent" on if the invoice already went out.',
    'Click generate to get your tailored offboarding checklist.',
    'Work through each item — files, access, payment, testimonial, archive — and tick them off.',
  ],
  methodology:
    'This tool is a rule-based checklist assembler, not AI. It combines 14 fixed base items across 5 sections (final files, credentials, invoice, testimonials, archive) with 3 extras per project type and 2 toggle-driven items, so the same inputs always produce the same checklist.',
  examples: [
    {
      title: 'Client Offboarding Checklist',
      inputs: { projectType: 'design', deliverablesHandover: false, finalInvoiceSent: false },
      note: 'Full 19-item checklist including handover and invoice reminders.',
    },
    {
      title: 'Video project, wrapped up',
      inputs: { projectType: 'video', deliverablesHandover: true, finalInvoiceSent: true },
      note: 'Checklist swaps in receipt confirmation and payment verification items.',
    },
  ],
  faqs: [
    {
      question: 'What is the best client offboarding checklist?',
      answer:
        'The best one is tailored to your project type and covers five areas: final files, credentials and access, final invoice and payment, testimonials and referrals, and archiving. This free tool builds exactly that from your project type and two toggles.',
    },
    {
      question: 'Is there a free client offboarding checklist?',
      answer:
        'Yes — this tool is completely free. Pick your project type, set the two toggles, and you get a full offboarding checklist instantly, no sign-up needed.',
    },
    {
      question: 'How to use client offboarding?',
      answer:
        'Run the tool, then work through each checklist item in order — deliver files, revoke access, confirm payment, ask for a testimonial — and tick items off as you complete them.',
    },
    {
      question: 'How does a client offboarding checklist work?',
      answer:
        "It assembles a fixed set of end-of-project tasks and adapts a few items to your answers: for example, it only reminds you to send the final invoice if you haven't sent it yet.",
    },
    {
      question: 'How does the client offboarding checklist work?',
      answer:
        'Enter your details using the inputs above and the client offboarding checklist calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the client offboarding checklist free to use?',
      answer:
        'Yes - this client offboarding checklist is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a client offboarding checklist?',
      answer:
        'A client offboarding checklist is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The checklist is general operational guidance, not legal, financial, or tax advice.',
    'Checklist content comes from fixed item banks — it does not adapt to your contract terms or local laws.',
    'Always follow the terms of your own client contract first.',
  ],
  jsonLd: [],
};
