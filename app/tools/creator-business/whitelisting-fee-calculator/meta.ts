import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/whitelisting-fee-calculator/';

export const inputs: ToolInput[] = [
  {
    id: 'baseContentFee',
    label: 'Base content fee (USD)',
    type: 'number',
    required: true,
    placeholder: '800',
    validation: { min: 0 },
  },
  {
    id: 'whitelistPctPerMonth',
    label: 'Whitelisting rate per month (your own %, of content fee)',
    type: 'number',
    required: true,
    placeholder: '50',
    validation: { min: 0, max: 100 },
  },
  {
    id: 'whitelistMonths',
    label: 'Whitelisting period (months)',
    type: 'number',
    required: true,
    placeholder: '3',
    validation: { min: 0 },
  },
  {
    id: 'flatMonthlyMode',
    label: 'Flat monthly fee instead (USD, optional)',
    type: 'number',
    required: false,
    placeholder: '500',
    validation: { min: 0 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'whitelistingFeeTotal',
    label: 'Total whitelisting fee',
    type: 'currency',
    description:
    'Free ugc whitelisting rates 2026: Monthly whitelisting fee × months (estimate, from your own rate). Get instant results. free now.',
  },
  {
    id: 'monthlyFee',
    label: 'Monthly whitelisting fee',
    type: 'currency',
    description:
    'Your percentage of the content fee per month, or your flat monthly fee.',
  },
  {
    id: 'totalDealValue',
    label: 'Total deal value',
    type: 'currency',
    description:
    'Base content fee plus the total whitelisting fee.',
  },
];

export const content: ToolContent = {
  title: 'UGC Whitelisting Rates',
  description:
    'Calculate UGC whitelisting rates from your content fee and your own monthly rate or flat fee. Get the whitelisting total and deal value free.',
  howTo: [
    'Enter your "Base content fee" — what you charge for creating the content itself.',
    'Enter your "Whitelisting rate per month" — the percentage of the content fee YOU charge per month of paid usage (no standard rate is assumed).',
    'Enter the "Whitelisting period" in months — or use the optional flat fee field to set one fixed monthly fee instead.',
    'Run the tool to get the monthly fee, the total whitelisting fee, and the total deal value.',
    'Adjust your rate or period until the total reflects what the usage rights are worth to you.',
  ],
  methodology:
    'Monthly fee = base content fee × (your monthly rate ÷ 100), or your flat monthly fee when you enter one. Total whitelisting fee = monthly fee × months; total deal value = content fee + whitelisting total. The rate is always your own assumption — the tool never suggests or invents one — so every result is an estimate based on your inputs.',
  examples: [
    {
      title: '50% per month for 3 months',
      inputs: { baseContentFee: 800, whitelistPctPerMonth: 50, whitelistMonths: 3 },
      note: '$400/month × 3 = $1,200 whitelisting total; $2,000 total deal value.',
    },
    {
      title: 'Flat monthly fee',
      inputs: { baseContentFee: 800, whitelistMonths: 6, flatMonthlyMode: 300 },
      note: '$300/month × 6 = $1,800 whitelisting total; $2,600 total deal value.',
    },
    {
      title: 'Single month of usage',
      inputs: { baseContentFee: 1200, whitelistPctPerMonth: 100, whitelistMonths: 1 },
      note: 'One month at 100% = $1,200 whitelisting fee; $2,400 total deal value.',
    },
  ],
  faqs: [
    {
      question: 'What is the best ugc whitelisting rates?',
      answer:
        'There is no single best rate — it depends on how much the paid-usage rights are worth to you. This calculator never invents a rate: you enter your own monthly percentage or flat fee, and it computes the whitelisting total and deal value from it.',
    },
    {
      question: 'Is there a free ugc whitelisting rates?',
      answer:
        'Yes — this UGC whitelisting rates calculator is completely free with no signup. Enter your content fee, your own monthly rate or flat fee, and the usage period to get instant estimates.',
    },
    {
      question: 'How to use ugc whitelisting rates?',
      answer:
        'Decide what percentage of your content fee (or what flat amount) each month of whitelisting is worth to you, enter it with the usage period, and use the resulting total in your UGC contract. The monthly fee helps you compare usage offers of different lengths.',
    },
    {
      question: 'How does the ugc whitelisting rates work?',
      answer:
        'Enter your details using the inputs above and the ugc whitelisting rates calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ugc whitelisting rates free to use?',
      answer:
        'Yes - this ugc whitelisting rates is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an ugc whitelisting rates?',
      answer:
        'An ugc whitelisting rates is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the ugc whitelisting rates?',
      answer:
        'No account needed. Open the ugc whitelisting rates, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'ESTIMATE: every result is computed from YOUR rate or flat fee — this tool contains no industry-rate data and does not recommend what to charge.',
    'Whitelisting terms (platforms, ad accounts, renewals) are not modeled — only the math on your rate and period.',
    'The monthly equivalent is a simple multiplication; taxes, payment terms, and negotiation are not included.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'UGC Whitelisting Rates 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free ugc whitelisting rates 2026: Monthly whitelisting fee × months (estimate, from your own rate). Get instant results. free now.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Creator Business Tools',
          item: 'https://husnainblogger.com/tools/creator-business/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Whitelisting Fee Calculator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
