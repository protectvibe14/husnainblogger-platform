import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'patrons',
    label: 'Number of paying patrons',
    type: 'number',
    required: true,
    placeholder: 'e.g. 120',
    validation: { min: 1 },
  },
  {
    id: 'avgPledge',
    label: 'Average pledge per patron (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 5',
    validation: { min: 0.01 },
  },
  {
    id: 'planType',
    label: 'Patreon plan',
    type: 'select',
    required: true,
    options: [
      'Standard 10% (new pages)',
      'Legacy Lite 5%',
      'Legacy Pro 8%',
      'Legacy Premium 12%',
    ],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'grossEarnings', label: 'Gross monthly earnings', type: 'currency' },
  { id: 'platformFee', label: 'Patreon platform fee (estimate)', type: 'currency' },
  { id: 'processingFees', label: 'Payment-processing fees (estimate)', type: 'currency' },
  { id: 'estimatedNetMonthly', label: 'Estimated net monthly earnings', type: 'currency' },
];

export const content: ToolContent = {
  title: 'Patreon Earnings Calculator 2026 – Free | HusnainBlogger',
  description:
    'Estimate your monthly Patreon income with this free patreon earnings calculator — subtract plan and processing fees to reveal your net payout. Try it now.',
  howTo: [
    'Enter your number of paying patrons — the patrons actually charged this month, not followers.',
    'Enter your average pledge per patron in USD.',
    'Choose your plan: Standard 10% for new pages, or your legacy tier (Lite 5%, Pro 8%, Premium 12%).',
    'Run the calculation to see gross earnings, the platform fee, per-pledge processing fees, and your estimated net monthly.',
    'Try different pledge or patron numbers to model growth, then verify Patreon\u2019s current fee schedule before making decisions.',
  ],
  methodology:
    'Pure arithmetic on your inputs: gross = patrons \u00d7 average pledge; platform fee = gross \u00d7 your plan\u2019s rate (10% standard, or 5% / 8% / 12% legacy); processing fees = the per-pledge rate (2.9% + $0.30 over $3, 5% + $0.10 at or under $3) applied to every patron. Patreon\u2019s fee schedule changes over time, so every result is an estimate \u2014 verify the current fees on Patreon before relying on the numbers.',
  examples: [
    {
      title: 'New creator on the standard plan',
      inputs: { patrons: 120, avgPledge: 5, planType: 'Standard 10% (new pages)' },
      note: 'Gross $600, minus a $60 platform fee and $53.40 in processing, leaves an estimated $486.60 net per month.',
    },
    {
      title: 'Established page on Legacy Pro',
      inputs: { patrons: 850, avgPledge: 3, planType: 'Legacy Pro 8%' },
      note: 'Gross $2,550, minus a $204 platform fee and $212.50 in processing, leaves an estimated $2,133.50 net per month.',
    },
  ],
  faqs: [
    {
      question: 'What is the best patreon earnings calculator?',
      answer:
        'The best patreon earnings calculator subtracts both the platform fee for your plan and per-pledge payment-processing fees, instead of just multiplying patrons by pledge amount. This free tool does that math and labels every figure as an estimate \u2014 remember to verify Patreon\u2019s current fee schedule, since fees change.',
    },
    {
      question: 'Is there a free patreon earnings calculator?',
      answer:
        'Yes \u2014 this patreon earnings calculator is completely free with no signup. Enter your patron count, average pledge, and plan to see estimated gross earnings, fees, and net monthly income.',
    },
    {
      question: 'How to calculate patreon earnings?',
      answer:
        'Multiply paying patrons by your average pledge, subtract your plan\u2019s platform fee (10% on new pages; 5%\u201312% on legacy tiers), then subtract payment-processing fees (2.9% + $0.30 per pledge over $3; 5% + $0.10 at or under $3). This tool runs that exact calculation for you.',
    },
    {
      question: 'How does the patreon earnings calculator work?',
      answer:
        'Enter your details using the inputs above and the patreon earnings calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the patreon earnings calculator free to use?',
      answer:
        'Yes - this patreon earnings calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a patreon earnings calculator?',
      answer:
        'A patreon earnings calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the patreon earnings calculator?',
      answer:
        'No account needed. Open the patreon earnings calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Fee rates reflect the schedule captured in the spec (sourceDate 2026-10-01); Patreon can change them \u2014 verify the current fee schedule on Patreon\u2019s pricing page before relying on the numbers.',
    'Processing fees are charged per pledge; applying your average pledge to all patrons is an approximation (exact when pledges are equal).',
    'New pages pay a flat 10%; legacy tiers are preserved only for older pages \u2014 the tool trusts the plan you select.',
    'Results are estimates in USD; taxes, currency conversion, and payout fees are not included.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Patreon Earnings Calculator 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/patreon-earnings-estimator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Estimate your monthly Patreon income with this free patreon earnings calculator — subtract plan and processing fees to reveal your net payout. Try it now.',
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
          name: 'Patreon Earnings Estimator',
          item: 'https://husnainblogger.com/tools/make-money/patreon-earnings-estimator/',
        },
      ],
    },
  ],
};
