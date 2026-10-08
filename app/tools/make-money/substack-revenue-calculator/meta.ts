import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'paidSubscribers',
    label: 'Number of paid subscribers',
    type: 'number',
    required: true,
    placeholder: 'e.g. 500',
    validation: { min: 1 },
  },
  {
    id: 'monthlyPrice',
    label: 'Subscription price per month (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 8',
    validation: { min: 0.01 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'grossRevenue', label: 'Gross monthly revenue', type: 'currency' },
  { id: 'substackFee', label: 'Substack platform fee, 10% (estimate)', type: 'currency' },
  { id: 'stripeFees', label: 'Stripe processing fees (estimate)', type: 'currency' },
  { id: 'netRevenue', label: 'Estimated net monthly revenue', type: 'currency' },
];

export const content: ToolContent = {
  title: 'Substack Revenue Calculator 2026 – Free | HusnainBlogger',
  description:
    'Calculate your newsletter earnings with this free substack revenue calculator — see gross revenue, the 10% platform fee, and Stripe fees. Try it free.',
  howTo: [
    'Enter your number of paid subscribers (free subscribers do not count toward revenue).',
    'Enter your subscription price per month in USD.',
    'Run the calculation to see gross revenue, the 10% Substack platform fee, per-transaction Stripe fees, and your estimated net revenue.',
    'Try a higher or lower price to see how the fixed $0.30 Stripe fee changes your take-home at each tier.',
    'Remember fees change over time \u2014 verify Substack\u2019s current fee schedule before making pricing decisions.',
  ],
  methodology:
    'Pure arithmetic on your inputs: gross = paid subscribers \u00d7 monthly price; Substack fee = 10% of gross; Stripe fees = one 2.9% + $0.30 charge per subscriber per month, stacked on top (not compounded). Substack\u2019s fee schedule changes over time, so every result is an estimate \u2014 verify the current fees on Substack before relying on the numbers. Annual-billing discounts and taxes are out of scope.',
  examples: [
    {
      title: 'Growing newsletter',
      inputs: { paidSubscribers: 500, monthlyPrice: 10 },
      note: 'Gross $5,000, minus a $500 Substack fee and $295 in Stripe fees, leaves an estimated $4,205 net per month.',
    },
    {
      title: 'Low-price publication',
      inputs: { paidSubscribers: 100, monthlyPrice: 5 },
      note: 'Gross $500, minus a $50 Substack fee and $44.50 in Stripe fees, leaves an estimated $405.50 net per month.',
    },
  ],
  faqs: [
    {
      question: 'What is the best substack revenue calculator?',
      answer:
        'The best substack revenue calculator deducts both Substack\u2019s 10% platform fee and the per-transaction Stripe fee (2.9% + $0.30), since the fixed Stripe charge eats a bigger share at low prices. This free tool does that stacked math and labels every figure as an estimate.',
    },
    {
      question: 'Is there a free substack revenue calculator?',
      answer:
        'Yes \u2014 this substack revenue calculator is completely free with no signup. Enter your paid subscriber count and monthly price to see estimated gross, fees, and net monthly revenue.',
    },
    {
      question: 'How to calculate substack revenue?',
      answer:
        'Multiply paid subscribers by your monthly price, subtract 10% for Substack\u2019s platform fee, then subtract Stripe\u2019s 2.9% + $0.30 per subscriber. This tool runs that exact stacked calculation for you.',
    },
    {
      question: 'How does the substack revenue calculator work?',
      answer:
        'Enter your details using the inputs above and the substack revenue calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the substack revenue calculator free to use?',
      answer:
        'Yes - this substack revenue calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a substack revenue calculator?',
      answer:
        'A substack revenue calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the substack revenue calculator?',
      answer:
        'No account needed. Open the substack revenue calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Fee rates reflect the schedule captured in the spec (sourceDate 2026-10-01): 10% Substack platform fee plus Stripe ~2.9% + $0.30 per transaction \u2014 verify the current fee schedule on Substack\u2019s pricing page before relying on the numbers.',
    'Annual-billing discounts and taxes are out of scope.',
    'Results are estimates in USD; no currency conversion is performed.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Substack Revenue Calculator 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/substack-revenue-calculator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Calculate your newsletter earnings with this free substack revenue calculator — see gross revenue, the 10% platform fee, and Stripe fees. Try it free.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Make Money Tools',
          item: 'https://husnainblogger.com/tools/make-money/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Substack Revenue Calculator',
          item: 'https://husnainblogger.com/tools/make-money/substack-revenue-calculator/',
        },
      ],
    },
  ],
};
