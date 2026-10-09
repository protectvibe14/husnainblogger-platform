import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'salePrice',
    label: 'Item sale price',
    type: 'number',
    required: true,
    placeholder: 'e.g. 35.00',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'shippingDiscount',
    label: 'Shipping discount you offer the buyer (you fund it)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 4.99 — leave 0 if none',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'flatFeeUnder15',
    label: 'Flat fee for sales under $15 (estimate — Poshmark default 2.95)',
    type: 'number',
    required: false,
    placeholder: '2.95 — edit if Poshmark changes it',
    validation: { min: 0 },
  },
  {
    id: 'percentFeeAtOrOver15',
    label: 'Commission % for sales at/above $15 (estimate — Poshmark default 20)',
    type: 'number',
    required: false,
    placeholder: '20 — edit if Poshmark changes it',
    validation: { min: 0, max: 100, unit: '%' },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'poshmarkFee', label: "Poshmark's cut (estimate)", type: 'currency' },
  { id: 'netPayout', label: 'Your net payout (estimate)', type: 'currency' },
];

const DESCRIPTION =
  'Keep more of each sale with this Poshmark fee calculator — flat and percentage fees calculated for accurate USD profit per order. Price bundles for max.';

export const content: ToolContent = {
  title: 'Poshmark Fee Calculator',
  description: DESCRIPTION,
  howTo: [
    'Enter your item sale price.',
    'If you offer the buyer a shipping discount that you fund, enter it — it reduces your payout dollar-for-dollar.',
    'Review the editable commission defaults (20% at/above $15, $2.95 flat below) and adjust them if Poshmark changes its fees.',
    'Run the calculator to see Poshmark\'s cut and your estimated net payout.',
  ],
  methodology:
    'Poshmark fee = sale price × commission% when the sale price is exactly $15 or more; otherwise the flat fee applies. Net payout = sale price − Poshmark fee − your shipping discount. The 20% / $2.95 figures are user-editable ESTIMATES, not official current rates — Poshmark can change its commission at any time. Payment processing is included in the commission, so no separate processing fee is added. Note the flat fee on sales under $15 can exceed 20% of the sale price.',
  examples: [
    {
      title: '$35 dress',
      inputs: { salePrice: 35 },
      note: "Poshmark's cut $7.00 (20%); net payout $28.00 (estimate).",
    },
    {
      title: '$10 accessory with shipping discount',
      inputs: { salePrice: 10, shippingDiscount: 4.99 },
      note: "Flat $2.95 fee applies under $15; minus the $4.99 discount, net payout $2.06 (estimate).",
    },
  ],
  faqs: [
    {
      question: 'How much does poshmark charge?',
      answer: 'This is a common question about how much does poshmark charge. Use the tool above to get your answer instantly - it is free and requires no signup.',
    },
    {
      question: 'How much does poshmark take in fees?',
      answer: 'This is a common question about how much does poshmark take in fees. Use the tool above to get your answer instantly - it is free and requires no signup.',
    },
    {
      question: 'How much is the poshmark fee?',
      answer: 'This is a common question about how much is the poshmark fee. Use the tool above to get your answer instantly - it is free and requires no signup.',
    },
    {
      question: 'Does poshmark charge a fee?',
      answer: 'This is a common question about does poshmark charge a fee. Use the tool above to get your answer instantly - it is free and requires no signup.',
    },
    {
      question: 'What is the best poshmark fee calculator?',
      answer:
        'A good Poshmark fee calculator handles both tiers — the flat $2.95 fee under $15 and 20% at/above — and subtracts any shipping discount you fund. This free calculator does exactly that, with editable commission values labeled as estimates.',
    },
    {
      question: 'Is there a free poshmark fee calculator?',
      answer:
        'Yes — this Poshmark fee calculator is completely free with no signup. Enter your sale price to get Poshmark\'s cut and your estimated net payout.',
    },
    {
      question: 'How to calculate poshmark fee?',
      answer:
        'For sales of exactly $15 or more, multiply the sale price by 20%; for sales under $15, subtract the $2.95 flat fee. Then subtract any shipping discount you offer the buyer to get your net payout.',
    },
    {
      question: 'Does Poshmark charge extra payment processing fees?',
      answer:
        'No — payment processing is included in Poshmark\'s commission, so this calculator adds no separate processing fee. The one figure Poshmark takes is the 20% commission (or the $2.95 flat fee under $15), before any shipping discount you fund.',
    },
    {
      question: 'How much does Poshmark take on a $50 sale?',
      answer:
        '$10.00 — sales of $15 or more carry the 20% commission, so a $50 sale leaves a $40.00 payout before any shipping discount you fund. Payment processing is already included in that 20%; the calculator adds no separate processing fee.',
    },
    {
      question: 'When does Poshmark charge 20% instead of the flat fee?',
      answer:
        'The 20% commission applies to sales of exactly $15 and above; anything below $15 gets the $2.95 flat fee instead. Be careful with low-priced items — on a $10 sale, that flat $2.95 fee works out to 29.5% of the price.',
    },
    {
      question: 'How does a shipping discount affect my Poshmark payout?',
      answer:
        'A seller-funded shipping discount comes straight out of your payout, dollar for dollar. A $10 sale with a $4.99 shipping discount leaves just $2.06 after the $2.95 flat fee — this calculator subtracts the discount automatically when you enter it.',
    },
  ],
  assumptions: [
    'Commission figures are user-editable ESTIMATES (defaults 20% / $2.95) — Poshmark can change its commission at any time; verify current terms on Poshmark.',
    'The percent tier applies at exactly $15 and above; below $15 the flat fee applies and can exceed 20% of the sale price.',
    'Payment processing is included in the commission — no separate processing fee is added.',
    'A seller-funded shipping discount reduces the payout dollar-for-dollar; a discount larger than the payout shows as negative.',
    'All amounts are in USD.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Poshmark Fee Calculator 2026 – Seller Fees | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/poshmark-fee-calculator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: DESCRIPTION,
      isAccessibleForFree: true,
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
          name: 'Poshmark Fee Calculator',
          item: 'https://husnainblogger.com/tools/make-money/poshmark-fee-calculator/',
        },
      ],
    },
  ],
};
