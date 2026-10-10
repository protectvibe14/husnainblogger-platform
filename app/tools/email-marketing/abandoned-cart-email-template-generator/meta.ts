import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'storeName',
    label: 'Store name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Northwind Goods',
    validation: { max: 100 },
  },
  {
    id: 'productName',
    label: 'Product name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Trail Backpack 40L',
    validation: { max: 100 },
  },
  {
    id: 'discountOffer',
    label: 'Discount offer (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. 10% off with code COMEBACK10 (used in email 3)',
    validation: { max: 100 },
  },
  {
    id: 'emailNumber',
    label: 'Which email',
    type: 'select',
    required: true,
    options: ['1', '2', '3'],
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: false,
    options: ['friendly', 'warm', 'professional', 'playful'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'subjectOptions', label: 'Subject line options', type: 'list' },
  { id: 'bodyTemplate', label: 'Email body template', type: 'text' },
  { id: 'placeholderList', label: 'Placeholder reference', type: 'list' },
  { id: 'notices', label: 'Notes', type: 'text' },
];

export const content: ToolContent = {
  title: 'Abandoned Cart Email Template',
  description:
    'Recover lost sales with a 3-email cart sequence: choose reminder, value, or incentive, add your store details, and get subject lines plus body copy.',
  howTo: [
    'Enter your store name and the product left in the cart.',
    'Choose which email to build: 1 (reminder), 2 (value), or 3 (incentive).',
    'Optionally describe a discount offer for email 3.',
    'Pick a tone: friendly, warm, professional, or playful.',
    'Copy the template, replace the {{placeholders}} with your ESP merge tags and real links, then paste into your email tool.',
  ],
  methodology:
    'This tool returns one of 3 fixed cart-recovery templates (reminder → value/objection handling → incentive + urgency) with 4 subject options each — 12 subjects total. The body keeps {{placeholders}} (firstName, storeName, productName, cartUrl, discountCode) intact for your email platform’s merge tags; only the sign-off is personalized. Template selection is deterministic per email number. It runs no AI model.',
  examples: [
    {
      title: 'Outdoor gear store',
      inputs: {
        storeName: 'Northwind Goods',
        productName: 'Trail Backpack 40L',
        discountOffer: '10% off with code COMEBACK10',
        emailNumber: '3',
        tone: 'friendly',
      },
      note: 'The final incentive email for an abandoned backpack.',
    },
    {
      title: 'Skincare shop',
      inputs: {
        storeName: 'Glow Lab',
        productName: 'Vitamin C Serum',
        discountOffer: '',
        emailNumber: '1',
        tone: 'warm',
      },
      note: 'The first gentle reminder email, no discount involved.',
    },
  ],
  faqs: [
    {
      question: 'What is the best abandoned cart email template?',
      answer:
        'The best cart-recovery series sends three emails: a quick reminder, a value-focused follow-up that answers objections, and a final nudge with an incentive and urgency. This free generator gives you exactly those three templates with placeholders for your store’s merge tags.',
    },
    {
      question: 'Is there a free abandoned cart email template?',
      answer:
        'Yes — this generator is completely free with no signup. It provides fixed cart-recovery templates with {{placeholders}} for your email platform, not AI-written copy, so add your real links and codes before sending.',
    },
    {
      question: 'How to use abandoned cart email?',
      answer:
        'Build all three emails (reminder, value, incentive), replace every {{placeholder}} with your ESP’s merge tags and real cart links, and schedule them at roughly 1 hour, 24 hours, and 48–72 hours after abandonment in your email platform.',
    },
    {
      question: 'How does an abandoned cart email template work?',
      answer:
        'You pick which of the 3 series emails to build, enter your store and product, and the tool returns a fixed template with placeholders intact plus 4 subject options and a placeholder reference list. You fill in the placeholders with your platform’s merge tags — the tool sends nothing itself.',
    },
    {
      question: 'What is an abandoned cart email template?',
      answer:
        'An abandoned cart email template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Can I customize the generated abandoned cart email template?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
    {
      question: 'What makes a good abandoned cart email template?',
      answer: 'Clarity, specificity, and relevance to your audience. Avoid generic phrases — the more specific your input, the better the output.',
    },
  ],
  assumptions: [
    'Templates are fixed — not AI-written — and keep {{placeholders}} for your ESP merge tags; nothing is sent by this tool.',
    'The 1h / 24h / 48–72h send timing is a common cart-recovery cadence, not a guarantee of best timing for your store.',
    'This tool does not connect to your store or know which carts were abandoned.',
    'It cannot predict recovery rates or deliverability.',
  ],
  jsonLd: [],
};
