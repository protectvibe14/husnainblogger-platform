import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/email-marketing/case-study-request-email-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'clientName',
    label: 'Client name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Sarah',
  },
  {
    id: 'resultMetric',
    label: 'Result metric',
    type: 'text',
    required: true,
    placeholder: 'e.g. doubled email signups in 60 days',
  },
  {
    id: 'format',
    label: 'Case study format',
    type: 'select',
    required: true,
    options: ['written', 'video', 'quote'],
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['formal', 'friendly', 'casual'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'subjectOptions',
    label: 'Subject line options',
    type: 'list',
    description:
    'Free case study request email 2026: 5 subject-line options assembled from fixed templates with the client name and result. Fast, private.',
  },
  {
    id: 'bodyDraft',
    label: 'Request email draft',
    type: 'copy',
    description:
    'Full request draft: greeting, metric callout, format-specific ask, ease line, closer, and sign-off.',
  },
];

export const content: ToolContent = {
  title: 'Case Study Request Email',
  description:
    'Write a case study request email that gets a yes. Add your client, result metric, format, and tone to get 5 subject lines plus a ready draft. Free.',
  howTo: [
    'Enter the client name and the specific result metric you want to feature.',
    'Choose the case study format: written, video, or a short quote.',
    'Pick the tone that fits your relationship: formal, friendly, or casual.',
    'Run the tool to get 5 subject-line options and a full request draft.',
    'Copy the draft, replace [Your Name], and send it from your own email.',
  ],
  methodology:
    'The generator assembles your email from fixed template banks (10 subject patterns, 6 openers, 12 format-specific ask paragraphs, 5 metric lines, 5 ease lines, 6 closers, 4 sign-offs) filled with your own inputs — no AI, no guessing. Variant selection is a deterministic hash of your inputs, so the same inputs always produce the same draft.',
  examples: [
    {
      title: 'Written case study, friendly tone',
      inputs: {
        clientName: 'Sarah',
        resultMetric: 'doubled email signups in 60 days',
        format: 'written',
        tone: 'friendly',
      },
      note: 'Classic 20–30 minute interview ask with an approval-first promise.',
    },
    {
      title: 'Video case study, casual tone',
      inputs: {
        clientName: 'Marcus',
        resultMetric: 'cut support tickets by 40%',
        format: 'video',
        tone: 'casual',
      },
      note: 'Relaxed 15-minute recorded call framing with no-prep reassurance.',
    },
  ],
  faqs: [
    {
      question: 'What is the best case study request email?',
      answer:
        'The best case study request email names the specific result, makes one clear ask (written interview, video call, or a quote), keeps the client effort tiny, and promises approval before anything is published. This free generator builds that structure from fixed templates with your client name, metric, format, and tone.',
    },
    {
      question: 'Is there a free case study request email?',
      answer:
        'Yes — this case study request email generator is completely free with no signup. You get 5 subject lines and a full request draft for written, video, or quote-style case studies that you can copy and send.',
    },
    {
      question: 'How to use case study request email?',
      answer:
        'Enter the client name and the result metric, choose written, video, or quote format, and pick a tone. Run the tool, choose a subject line, copy the draft, replace [Your Name], and send it personally — always get the client’s written approval before publishing.',
    },
    {
      question: 'What is a case study request email?',
      answer:
        'A case study request email is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the case study request email?',
      answer:
        'No account needed. Open the case study request email, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Drafts are assembled from fixed template banks (10 subject patterns, 6 openers, 12 ask paragraphs, 5 metric lines, 5 ease lines, 6 closers, 4 sign-offs) — no AI copywriting is involved.',
    'Always send case study requests yourself and only to real clients — the tool cannot verify your relationship with the recipient.',
    'Very long inputs are truncated with a visible notice in the draft.',
  ],
  jsonLd: [],
};
