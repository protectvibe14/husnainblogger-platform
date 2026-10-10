import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const SLUG = 'sponsorship-negotiation-script-generator';
const CANONICAL = `https://husnainblogger.com/tools/creator-business/${SLUG}/`;
const NAME = 'Sponsorship Negotiation Script Generator';
const DESCRIPTION =
  'Generate free sponsorship negotiation scripts — counter-offer, value-justification, and terms templates personalized with your brand and rate. Get yours now.';

export const inputs: ToolInput[] = [
  {
    id: 'brandName',
    label: 'Brand name',
    type: 'text',
    required: true,
    placeholder: 'e.g. GlowCo',
    validation: { max: 80 },
  },
  {
    id: 'askAmount',
    label: 'Your ask amount in USD (optional)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 1500',
    validation: { min: 0.01 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'negotiationScript', label: 'Negotiation scripts', type: 'copy' },
];

export const content: ToolContent = {
  title: 'Sponsorship Negotiation Script',
  description: DESCRIPTION,
  howTo: [
    "Enter the brand name you're negotiating with.",
    'Optionally enter your ask amount in USD.',
    'Click generate to get 3 script templates.',
    'Pick the script matching your situation: counter-offer, value justification, or terms.',
    'Personalize the bracketed parts with your real deliverables and numbers, then send.',
  ],
  methodology:
    'Three fixed script templates (counter-offer email, value-justification reply, usage-rights and payment-terms follow-up) are personalized with your brand name and ask amount. Amounts are formatted deterministically in USD; with no amount given, an honest [your rate] placeholder is kept instead of inventing one. These are template scripts for guidance only — not legal or financial advice.',
  examples: [
    {
      title: 'Counter-offer at $1,500',
      inputs: { brandName: 'GlowCo', askAmount: 1500 },
      note: 'All three scripts personalized with the brand and your rate.',
    },
    {
      title: 'No rate decided yet',
      inputs: { brandName: 'GlowCo' },
      note: 'Scripts keep an honest [your rate] placeholder — nothing is invented.',
    },
  ],
  faqs: [
    {
      question: 'What is the best sponsorship negotiation script?',
      answer:
        'The best script is short, specific, and anchored to deliverables — not just a number. This free tool gives you three: a counter-offer email, a value-justification reply, and a usage-rights and payment-terms follow-up.',
    },
    {
      question: 'Is there a free sponsorship negotiation script?',
      answer:
        'Yes — this script generator is free. Enter the brand name and your ask amount and get all three template scripts instantly, no sign-up required.',
    },
    {
      question: 'How to use sponsorship negotiation?',
      answer:
        'Pick the script matching your situation, personalize the bracketed parts with your real deliverables and numbers, and send it. Start from your ask, justify with value, and lock terms in writing.',
    },
    {
      question: 'What is a sponsorship negotiation script?',
      answer:
        'A sponsorship negotiation script is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the sponsorship negotiation script?',
      answer:
        'No account needed. Open the sponsorship negotiation script, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'What makes a good sponsorship negotiation script?',
      answer: 'Clarity, specificity, and relevance to your audience. Avoid generic phrases — the more specific your input, the better the output.',
    },
    {
      question: 'Can I customize the generated sponsorship negotiation script?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
  ],
  assumptions: [
    'These are template scripts for guidance only — not legal or financial advice.',
    'No rates are suggested or estimated; every amount comes from your own input.',
    'Negotiation outcomes depend on the brand, your audience, and the deal — no results are guaranteed.',
  ],
  jsonLd: [],
};
