import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL =
  'https://husnainblogger.com/tools/creator-business/rate-negotiation-email-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'clientName',
    label: 'Client name',
    type: 'text',
    required: true,
    placeholder: 'Daniel',
  },
  {
    id: 'yourName',
    label: 'Your name (signature)',
    type: 'text',
    required: true,
    placeholder: 'Ayesha Khan',
  },
  {
    id: 'currentOffer',
    label: 'Client’s current offer',
    type: 'number',
    required: true,
    placeholder: '800',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'counterOffer',
    label: 'Your counter offer',
    type: 'number',
    required: true,
    placeholder: '1000',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['firm', 'friendly', 'walk-away'],
  },
  {
    id: 'valuePoints',
    label: 'Your value points (one per line)',
    type: 'textarea',
    required: false,
    placeholder: '5 years of campaign experience\n24-hour turnaround on revisions',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'negotiationEmailDraft',
    label: 'Email draft (copy)',
    type: 'copy',
    description:
    'Free rate negotiation email template 2026: Subject line plus email body in your chosen tone — edit before sending. Fast, private now.',
  },
];

export const content: ToolContent = {
  title: 'Rate Negotiation Email Template',
  description:
    'Draft a rate negotiation email that wins better pay: enter the offer, your counter, and your value points, then pick a tone. Copy, edit, and send. Try.',
  howTo: [
    'Enter the "Client name" and "Your name" for the greeting and signature.',
    'Type the client’s "Current offer" and "Your counter offer" (numbers only).',
    'Pick a "Tone": firm, friendly, or walk-away.',
    'Add "Your value points" — one per line — to justify the rate.',
    'Copy the "Email draft", edit it in your voice, then send it yourself.',
  ],
  methodology:
    'The tool assembles one of 3 fixed tone templates (firm, friendly, walk-away) and inserts only your own details — nothing is written by AI. Amounts are formatted as USD with a fixed formatter. If your counter is below the client’s offer, the draft is still generated but flagged as a concession so you notice before sending.',
  examples: [
    {
      title: 'Firm counter above the offer',
      inputs: {
        clientName: 'Daniel',
        yourName: 'Ayesha Khan',
        currentOffer: 800,
        counterOffer: 1000,
        tone: 'firm',
        valuePoints: '5 years of campaign experience\n24-hour turnaround on revisions',
      },
      note: 'A confident counter at $1,000 with two value bullets.',
    },
    {
      title: 'Friendly ask to meet in the middle',
      inputs: {
        clientName: 'Priya',
        yourName: 'Ayesha Khan',
        currentOffer: 500,
        counterOffer: 650,
        tone: 'friendly',
        valuePoints: 'Delivered 40+ similar campaigns',
      },
      note: 'A warm tone that opens the door to negotiating structure, not just price.',
    },
    {
      title: 'Walk-away with a concession flag',
      inputs: {
        clientName: 'Daniel',
        yourName: 'Ayesha Khan',
        currentOffer: 1000,
        counterOffer: 700,
        tone: 'firm',
        valuePoints: '',
      },
      note: 'Counter below the offer: still generated, but flagged as a concession.',
    },
  ],
  faqs: [
    {
      question: 'What is the best rate negotiation email template?',
      answer:
        'The best rate negotiation email states your counter clearly, backs it with value points, and matches your tone — firm, friendly, or walk-away. This generator produces all three versions from your details so you can pick the one that fits the relationship.',
    },
    {
      question: 'Is there a free rate negotiation email template?',
      answer:
        'Yes — this rate negotiation email generator is completely free with no signup. Enter the offer, your counter, and your value points, choose a tone, and copy the draft.',
    },
    {
      question: 'How to use rate negotiation email?',
      answer:
        'Fill in both offers, add your value points, and pick a tone. Copy the generated draft, edit it in your own voice, and send it yourself — the tool only drafts, it never sends email.',
    },
    {
      question: 'How does the rate negotiation email template work?',
      answer:
        'Enter your details using the inputs above and the rate negotiation email template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the rate negotiation email template free to use?',
      answer:
        'Yes - this rate negotiation email template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a rate negotiation email template?',
      answer:
        'A rate negotiation email template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the rate negotiation email template?',
      answer:
        'No account needed. Open the rate negotiation email template, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'The output is a draft only — always edit it in your own voice before sending.',
    'The tool never sends email; sending happens outside the tool.',
    'Amounts are formatted as USD with no currency conversion; adjust the currency manually for other regions.',
  ],
  jsonLd: [],
};
