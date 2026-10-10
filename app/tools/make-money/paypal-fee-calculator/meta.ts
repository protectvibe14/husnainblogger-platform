import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'amount',
    label: 'Payment amount (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 100',
    validation: { min: 0.01, unit: 'USD' },
  },
  {
    id: 'paymentRoute',
    label: 'Payment route',
    type: 'select',
    required: true,
    options: ['direct_gs', 'checkout', 'card'],
  },
  {
    id: 'international',
    label: 'International (cross-border) payment',
    type: 'boolean',
    required: false,
  },
  {
    id: 'currencyConversion',
    label: 'Currency conversion involved',
    type: 'boolean',
    required: false,
  },
];

export const outputs: ToolOutput[] = [
  { id: 'fee', label: 'PayPal fee', type: 'currency' },
  { id: 'netReceived', label: 'You receive', type: 'currency' },
  { id: 'effectiveRate', label: 'Effective fee rate', type: 'percent' },
  { id: 'reverseAmountToNet', label: 'Charge this to net the amount', type: 'currency' },
];

export const content: ToolContent = {
  title: 'PayPal Fee Calculator',
  description:
    'Free paypal fee calculator 2026: calculate PayPal fees before you send or receive money: enter the amount and payment. Fast, private now.',
  howTo: [
    'Enter the payment amount in USD.',
    'Choose the payment route: direct Goods & Services, PayPal checkout, or card — each has its own fee schedule.',
    'Turn on "International" if the payment crosses borders (adds an estimated 1.5% to the rate).',
    'Turn on "Currency conversion" if FX is involved — the 3–4% spread is a documented note, not part of the fee math.',
    'Review the fee, what you receive, the effective rate, and the reverse amount to charge if you want to net the full amount.',
  ],
  methodology:
    'Fee = amount × rate + fixed fee, with the rate/fixed pair set by the selected route — direct Goods & Services is 2.99% with no fixed fee, checkout is 3.49% + $0.49, card is 2.99% + $0.49; international adds 1.5%. It is plain arithmetic — no AI. All rates are user-editable estimates because PayPal changes its schedules.',
  examples: [
    {
      title: '$100 direct Goods & Services payment',
      inputs: { amount: 100, paymentRoute: 'direct_gs' },
      note: 'Fee $2.99, you receive $97.01 — charge $103.08 to net the full $100.',
    },
    {
      title: '$100 PayPal checkout payment',
      inputs: { amount: 100, paymentRoute: 'checkout' },
      note: 'Fee $3.98 with the $0.49 fixed fee, you receive $96.02.',
    },
    {
      title: '$200 international card payment',
      inputs: { amount: 200, paymentRoute: 'card', international: true },
      note: 'Fee $9.47 with the 1.5% cross-border addition, you receive $190.53.',
    },
  ],
  faqs: [
    {
      question: 'What is the best paypal fee calculator?',
      answer:
        'The best one asks which PayPal route you use, because Goods & Services, checkout, and card processing each have a different schedule. This free calculator makes the route explicit and shows the fee, net received, and the reverse "charge this" amount.',
    },
    {
      question: 'Is there a free paypal fee calculator?',
      answer:
        'Yes — this calculator is completely free with no signup. Enter the amount and payment route to see the fee, what you receive, and what to charge to net the full amount.',
    },
    {
      question: 'How to calculate paypal fee?',
      answer:
        'Multiply the amount by your route\u2019s rate and add its fixed fee: direct Goods & Services is 2.99% with no fixed fee, checkout is 3.49% + $0.49, and card is 2.99% + $0.49. Add 1.5% for international payments, and treat currency conversion\u2019s 3–4% spread as a separate cost.',
    },
    {
      question: 'What is a paypal fee calculator?',
      answer:
        'A paypal fee calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the paypal fee calculator?',
      answer:
        'No account needed. Open the paypal fee calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'All rates and fixed fees are documented estimates — PayPal changes its fee schedules, so verify current rates on PayPal\u2019s official fee page before pricing decisions.',
    'US domestic schedule; the international flag adds an estimated 1.5% to the rate.',
    'The 3–4% currency-conversion spread is shown as a note only and is never folded into the fee math.',
    'Micropayment and merchant-volume schedules are out of scope; results are estimates for planning, not financial advice.',
  ],
  jsonLd: [],
};
