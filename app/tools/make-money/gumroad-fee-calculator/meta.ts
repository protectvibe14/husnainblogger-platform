import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'salePrice',
    label: 'Sale price per unit (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 29',
    validation: { min: 0.01, unit: 'USD' },
  },
  {
    id: 'saleChannel',
    label: 'Sale channel',
    type: 'select',
    required: true,
    options: ['direct', 'discover'],
  },
  {
    id: 'quantity',
    label: 'Quantity sold',
    type: 'number',
    required: false,
    placeholder: 'Defaults to 1',
    validation: { min: 1 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'gumroadFee', label: 'Gumroad platform fee', type: 'currency' },
  { id: 'processingFee', label: 'Card processing fee', type: 'currency' },
  { id: 'totalFees', label: 'Total fees', type: 'currency' },
  { id: 'netPayout', label: 'Net payout', type: 'currency' },
];

export const content: ToolContent = {
  title: 'Gumroad Fee Calculator',
  description:
    'Free gumroad fee calculator 2026: calculate Gumroad fees on direct and Discover sales: enter your sale price and quantity. Fast, private.',
  howTo: [
    'Enter your sale price per unit in USD.',
    'Choose the sale channel: direct (your own link/audience) or Discover (Gumroad\u2019s marketplace).',
    'Enter how many units you sold — it defaults to 1.',
    'Review the platform fee, the card processing fee (direct sales only), total fees, and your net payout.',
  ],
  methodology:
    'Direct sales: 10% + $0.50 platform fee per unit, with card processing (2.9% + $0.30) stacked on top; Discover sales: 30% flat per unit with processing already included — never added twice. It is plain arithmetic — no AI. All rates are documented estimates because Gumroad\u2019s fee structure has changed historically.',
  examples: [
    {
      title: '$30 direct sale, 2 units',
      inputs: { salePrice: 30, saleChannel: 'direct', quantity: 2 },
      note: 'Platform fee $7.00, processing $2.34, total fees $9.34 — net payout $50.66.',
    },
    {
      title: '$30 Discover sale, 2 units',
      inputs: { salePrice: 30, saleChannel: 'discover', quantity: 2 },
      note: 'Flat 30% = $18.00 in fees with no extra processing line — net payout $42.00.',
    },
    {
      title: '$15 Discover sale, single unit',
      inputs: { salePrice: 15, saleChannel: 'discover', quantity: 1 },
      note: 'Fee $4.50, net payout $10.50.',
    },
  ],
  faqs: [
    {
      question: 'What is the best gumroad fee calculator?',
      answer:
        'The best one asks which channel the sale came through, because direct and Discover sales use completely different fee stacks. This free calculator separates the platform fee from card processing and never double-counts processing on Discover.',
    },
    {
      question: 'Is there a free gumroad fee calculator?',
      answer:
        'Yes — this calculator is completely free with no signup. Enter your sale price, channel, and quantity to see platform fees, processing fees, and your net payout instantly.',
    },
    {
      question: 'How to calculate gumroad fee?',
      answer:
        'On a direct sale, take 10% + $0.50 per unit, then add card processing (2.9% + $0.30) on top. On a Discover sale, take a flat 30% per unit — processing is already included, so don\u2019t add it again. Multiply per-unit fees by your quantity for the totals.',
    },
    {
      question: 'How does the gumroad fee calculator work?',
      answer:
        'Enter your details using the inputs above and the gumroad fee calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the gumroad fee calculator free to use?',
      answer:
        'Yes - this gumroad fee calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a gumroad fee calculator?',
      answer:
        'A gumroad fee calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the gumroad fee calculator?',
      answer:
        'No account needed. Open the gumroad fee calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'All rates are documented estimates — Gumroad\u2019s fee structure has changed historically, so verify current rates on Gumroad\u2019s official pricing page before pricing decisions.',
    'Discover\u2019s 30% flat rate includes processing; the calculator never stacks 2.9% + $0.30 on Discover.',
    'Gumroad is the merchant of record (sales tax handled by Gumroad); there is no monthly fee modeled here.',
    'Results are estimates for planning, not accounting or financial advice.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Gumroad Fee Calculator 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/gumroad-fee-calculator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free gumroad fee calculator 2026: calculate Gumroad fees on direct and Discover sales: enter your sale price and quantity. Fast, private.',
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
          name: 'Gumroad Fee Calculator',
          item: 'https://husnainblogger.com/tools/make-money/gumroad-fee-calculator/',
        },
      ],
    },
  ],
};
