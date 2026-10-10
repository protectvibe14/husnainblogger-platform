import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'prospectContext',
    label: 'Prospect context',
    type: 'text',
    required: true,
    placeholder: 'e.g. just opened a second office in Austin',
  },
  {
    id: 'industry',
    label: 'Prospect industry',
    type: 'text',
    required: true,
    placeholder: 'e.g. dental clinics',
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['friendly', 'professional', 'playful', 'direct'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'openers', label: 'Cold email openers', type: 'table' },
];

const DESCRIPTION =
  'Open cold emails with lines that earn replies: add real prospect context and your industry, then pick from 6 openers in 4 tones - friendly to direct.';

export const content: ToolContent = {
  title: 'Cold Email Opener Generator',
  description: DESCRIPTION,
  howTo: [
    'Describe the prospect’s context — a real, verifiable fact like a new office or recent post.',
    'Enter the prospect’s industry so the language matches their world.',
    'Pick a tone: friendly, professional, playful, or direct.',
    'Generate to get 6 first-line openers from the fixed 24-pattern library.',
    'Replace every {{slot}} with real, verified prospect information before sending.',
  ],
  methodology:
    'Openers are assembled deterministically from a fixed library of 24 hand-written patterns (4 tones × 6 patterns) with your context and industry inserted into the slots. No AI, no network: the same inputs always produce the same 6 openers. This tool generates first lines only — never full sequences — and every pattern flags a personalization slot (e.g. {{company}}) you must fill with real, verified information.',
  examples: [
    {
      title: 'Friendly opener for a dental clinic',
      inputs: { prospectContext: 'just opened a second office in Austin', industry: 'dental clinics', tone: 'friendly' },
      note: 'Six warm first lines that lead with the prospect’s real news.',
    },
    {
      title: 'Direct opener for a SaaS founder',
      inputs: { prospectContext: 'hiring their first sales rep', industry: 'SaaS', tone: 'direct' },
      note: 'Six no-fluff first lines that state the reason for contact immediately.',
    },
  ],
  faqs: [
    {
      question: 'What is the best cold email opener generator?',
      answer:
        'The best one forces real personalization instead of generic lines. This free generator produces 6 openers in friendly, professional, playful, or direct tones, each with a {{slot}} you replace with verified prospect details.',
    },
    {
      question: 'Is there a free cold email opener generator?',
      answer:
        'Yes — this generator is completely free with no signup. Enter prospect context, industry, and tone to get 6 first-line openers instantly.',
    },
    {
      question: 'How to generate cold email opener?',
      answer:
        'Start with one real, verifiable fact about the prospect, add their industry, and pick a tone. The tool gives you 6 first-line options — replace every {{slot}} with the actual detail, then write the rest of the email yourself.',
    },
    {
      question: 'How does a cold email opener generator work?',
      answer:
        'It does not use AI. It inserts your prospect context and industry into a fixed library of 24 hand-written opener patterns and returns 6 options in your chosen tone, flagging each personalization slot to fill in.',
    },
    {
      question: 'How does the cold email opener generator work?',
      answer:
        'Enter your details using the inputs above and the cold email opener generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the cold email opener generator free to use?',
      answer:
        'Yes - this cold email opener generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a cold email opener generator?',
      answer:
        'A cold email opener generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Openers only — the tool never writes full emails, sequences, or follow-ups.',
    'Lines come from a fixed 24-pattern template library, not AI-generated copy; it cannot verify any prospect fact.',
    'CAN-SPAM/GDPR caution: the tool cannot verify consent or legal basis to contact someone — you are responsible for complying with applicable email laws, including opt-out handling.',
  ],
  jsonLd: [],
};
