import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'brand',
    label: 'Brand name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Morning Brew Daily',
  },
  {
    id: 'alternatives',
    label: 'Alternatives to offer (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. a weekly digest instead of daily emails',
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['friendly', 'professional', 'playful', 'sincere'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'headlineOptions', label: 'Headline options', type: 'list' },
  { id: 'bodyDraft', label: 'Body draft', type: 'copy' },
  { id: 'preferenceOptions', label: 'Keep-in-touch preference options', type: 'list' },
];

const DESCRIPTION =
  'Lose fewer subscribers at the exit door: build a graceful unsubscribe page with smart alternatives like a weekly digest, in a tone that fits your brand.';

export const content: ToolContent = {
  title: 'Unsubscribe Page Copy Generator',
  description: DESCRIPTION,
  howTo: [
    'Type your brand name in the brand field.',
    'Optionally describe alternatives to offer (e.g. “a weekly digest instead of daily emails”).',
    'Pick a tone: friendly, professional, playful, or sincere.',
    'Generate to get 4 headline options, a full body draft with a CAN-SPAM reminder, and 8 keep-in-touch preference options.',
    'Choose the headline that fits your brand voice and paste the copy onto your unsubscribe page.',
  ],
  methodology:
    'Copy is assembled deterministically from a fixed template bank of 16 hand-written headlines (4 tones × 4), 4 body templates, and 8 fixed preference-option lines, with your brand and alternatives inserted into the slots. No AI and no network: the same inputs always produce the same copy. Every body draft carries a CAN-SPAM reminder that opt-outs must be honored within 10 business days; the copy is deliberately guilt-free.',
  examples: [
    {
      title: 'Friendly unsubscribe page for a daily newsletter',
      inputs: { brand: 'Morning Brew Daily', alternatives: 'a weekly digest', tone: 'friendly' },
      note: 'Warm, respectful copy with a lower-frequency alternative.',
    },
    {
      title: 'Professional unsubscribe page for a SaaS product',
      inputs: { brand: 'Acme CRM', alternatives: 'product updates only', tone: 'professional' },
      note: 'Formal confirmation copy with a CAN-SPAM reminder.',
    },
  ],
  faqs: [
    {
      question: 'What is the best unsubscribe page copy generator?',
      answer:
        'The best one produces respectful, guilt-free copy with alternatives to full unsubscribe. This free generator gives 4 headline options, a complete body draft, and 8 keep-in-touch preference options in friendly, professional, playful, or sincere tones.',
    },
    {
      question: 'Is there a free unsubscribe page copy generator?',
      answer:
        'Yes — this unsubscribe page copy generator is completely free with no signup. Enter your brand name and tone to get headlines, body copy, and preference options instantly.',
    },
    {
      question: 'How to generate unsubscribe?',
      answer:
        'Enter your brand name, optionally describe lower-frequency alternatives, and pick a tone. The tool generates headline options and a body draft that confirms the opt-out and reminds you to honor it within 10 business days.',
    },
    {
      question: 'How does an unsubscribe page copy generator work?',
      answer:
        'It combines your brand name and tone with a fixed template bank: 16 headlines, 4 body templates, and 8 preference options. No AI is involved, so the output is consistent and never guilt-trips your reader.',
    },
    {
      question: 'How does the unsubscribe page copy generator work?',
      answer:
        'Enter your details using the inputs above and the unsubscribe page copy generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the unsubscribe page copy generator free to use?',
      answer:
        'Yes - this unsubscribe page copy generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an unsubscribe page copy generator?',
      answer:
        'An unsubscribe page copy generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Copy comes from a fixed template bank — not AI-generated, so wording variety is limited to 16 headlines.',
    'The CAN-SPAM reminder is general information, not legal advice; check with counsel for your jurisdiction.',
    'Inputs longer than 200 characters are trimmed with a visible notice.',
  ],
  jsonLd: [],
};
