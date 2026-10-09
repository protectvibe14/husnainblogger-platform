import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'amount',
    label: 'Charge amount (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 100',
    validation: { min: 0.01, unit: 'USD' },
  },
  {
    id: 'paymentMethod',
    label: 'Payment method',
    type: 'select',
    required: true,
    options: ['online', 'in_person', 'ach'],
  },
  {
    id: 'internationalCard',
    label: 'International (non-US) card',
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
  { id: 'fee', label: 'Stripe fee', type: 'currency' },
  { id: 'netReceived', label: 'You receive', type: 'currency' },
  { id: 'effectiveRate', label: 'Effective fee rate', type: 'percent' },
  { id: 'reverseAmountToNet', label: 'Charge this to net the amount', type: 'currency' },
];

export const content: ToolContent = {
  title: 'Stripe Fee Calculator',
  description:
    'Free Stripe fee calculator for 2027: calculate processing fees for online, in-person & ACH payments. See exact fees, net amount & gross-up charge.',
  keywords: ['free stripe fee calculator', 'stripe fee calculator 2025', 'stripe fee calculator 2026', 'stripe fee calculator australia', 'stripe fee calculator canada'],
  howTo: [
    'Enter the charge amount in USD.',
    'Choose the payment method: online card, in-person card, or ACH bank debit — each has its own rate.',
    'Turn on "International card" for non-US cards (adds an estimated 1.5% to the rate).',
    'Turn on "Currency conversion" if Stripe converts currency (adds an estimated 1%, stacked).',
    'Review the fee, what you receive, the effective rate, and the gross-up amount to charge if you want to net the full amount.',
  ],
  methodology:
    'Fee = amount × rate + fixed fee for the chosen method — online 2.9% + $0.30, in-person 2.7% + $0.05, ACH 0.8% capped at $5 per charge; international cards add 1.5% and currency conversion adds 1%, both stacked. It is plain arithmetic — no AI. All rates are user-editable estimates because Stripe changes its pricing.',
  examples: [
    {
      title: '$100 online card payment',
      inputs: { amount: 100, paymentMethod: 'online' },
      note: 'Fee $3.20, you receive $96.80 — charge $103.30 to net the full $100.',
    },
    {
      title: '$100 in-person card payment',
      inputs: { amount: 100, paymentMethod: 'in_person' },
      note: 'Fee $2.75 with the lower $0.05 fixed fee — cheaper than online.',
    },
    {
      title: '$10,000 ACH transfer',
      inputs: { amount: 10000, paymentMethod: 'ach' },
      note: 'Fee capped at $5.00, you receive $9,995.00 — a 0.05% effective rate.',
    },
  ],
  faqs: [
    {
      question: 'What is stripe charge on my credit card?',
      answer: 'This is a common question about what is stripe charge on my credit card. Use the tool above to get your answer instantly - it is free and requires no signup.',
    },
    {
      question: 'How much does stripe charge for online payments?',
      answer: 'This is a common question about how much does stripe charge for online payments. Use the tool above to get your answer instantly - it is free and requires no signup.',
    },
    {
      question: 'Does stripe charge for payouts?',
      answer: 'This is a common question about does stripe charge for payouts. Use the tool above to get your answer instantly - it is free and requires no signup.',
    },
    {
      question: 'What is the best stripe fee calculator?',
      answer:
        'The best one asks which payment method you use, because online, in-person, and ACH each have a different Stripe schedule — and ACH\u2019s $5 cap changes the math on large charges. This free calculator handles all three plus international and currency-conversion stacking.',
    },
    {
      question: 'Is there a free stripe fee calculator?',
      answer:
        'Yes — this calculator is completely free with no signup. Enter the charge amount and payment method to see the fee, what you receive, and what to charge to net the full amount.',
    },
    {
      question: 'How to calculate stripe fee?',
      answer:
        'Multiply the amount by your method\u2019s rate and add its fixed fee: online is 2.9% + $0.30, in-person is 2.7% + $0.05, and ACH is 0.8% capped at $5. Add 1.5% for international cards and 1% for currency conversion, both stacked on the rate.',
    },
    {
      question: 'What is the Stripe fee for international payments in 2027?',
      answer:
        'For international (non-US) cards, Stripe adds approximately 1.5% on top of the standard rate. So an online payment becomes 4.4% + $0.30. If currency conversion is also involved, add another 1%. Use the "International card" and "Currency conversion" toggles above for the exact calculation.',
    },
    {
      question: 'How much does Stripe charge for a $100 payment?',
      answer:
        'For a $100 online card payment, Stripe charges $3.20 (2.9% + $0.30), so you receive $96.80. For in-person it\u2019s $2.75, and for ACH bank debit just $0.80. To net the full $100 on an online payment, charge $103.30.',
    },
    {
      question: 'Does Stripe charge a fee for UK payments?',
      answer:
        'Yes, Stripe UK has its own pricing (typically 1.5% + 20p for UK cards). This calculator uses US standard rates as the default. For UK-specific calculations, adjust the rate in the methodology or check Stripe\u2019s UK pricing page for current figures.',
    },
    {
      question: 'What is the Stripe ACH fee cap?',
      answer:
        'Stripe\u2019s ACH direct debit fee is 0.8% per transaction, capped at $5. This means for any ACH charge over $625, you pay exactly $5. This calculator automatically applies the cap.',
    },
  ],
  assumptions: [
    'All rates and fixed fees are documented estimates — Stripe changes its pricing, so verify current rates on Stripe\u2019s official pricing page before business decisions.',
    'US standard schedule; volume or negotiated rates are out of scope.',
    'ACH\u2019s $5 cap applies to the final stacked fee; the reverse "charge this" amount uses piecewise math so the cap is respected.',
    'Results are estimates for planning, not accounting or financial advice.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Stripe Fee Calculator 2026 – Fees Guide | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/stripe-fee-calculator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free Stripe fee calculator for 2027: calculate processing fees for online, in-person & ACH payments. See exact fees, net amount & gross-up charge.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Make-Money & Affiliate Tools',
          item: 'https://husnainblogger.com/tools/make-money/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Stripe Fee Calculator',
          item: 'https://husnainblogger.com/tools/make-money/stripe-fee-calculator/',
        },
      ],
    },
  ],
};
