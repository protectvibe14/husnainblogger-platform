import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/email-marketing/newsletter-cpm-calculator/';

export const inputs: ToolInput[] = [
  {
    id: 'subscribers',
    label: 'Subscriber count',
    type: 'number',
    required: true,
    placeholder: 'e.g. 10000',
    validation: { min: 0 },
  },
  {
    id: 'openRatePct',
    label: 'Open rate (%)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 40',
    validation: { min: 0, max: 100 },
  },
  {
    id: 'cpm',
    label: 'CPM (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 25',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'issuesPerMonth',
    label: 'Issues per month',
    type: 'number',
    required: false,
    placeholder: '4',
    validation: { min: 1, max: 31 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'impressionsPerIssue',
    label: 'Impressions per issue',
    type: 'number',
    description: 'Free newsletter cpm calculator 2026: Subscribers × open rate, rounded to a whole number. Instant, private, and mobile-friendly. No signup - try it free!',
  },
  {
    id: 'revenuePerIssue',
    label: 'Revenue per issue',
    type: 'currency',
    description: 'Impressions ÷ 1000 × CPM.',
  },
  {
    id: 'revenuePerMonth',
    label: 'Revenue per month',
    type: 'currency',
    description: 'Revenue per issue × issues per month.',
  },
  {
    id: 'revenuePerSubscriberPerMonth',
    label: 'Revenue per subscriber / month',
    type: 'currency',
    description: 'Monthly revenue ÷ subscribers (0 when subscribers is 0).',
  },
];

export const content: ToolContent = {
  title: 'Newsletter CPM Calculator 2026 – Free Tool | HusnainBlogger',
  description:
    'Estimate newsletter ad revenue — enter subscribers, open rate, and CPM to see per-issue and monthly revenue. Pure math on your numbers. Calculate now!',
  howTo: [
    'Enter your subscriber count.',
    'Enter your average open rate as a percentage (0–100).',
    'Enter the CPM you charge (or are considering) in USD.',
    'Set issues per month — it defaults to 4 for a weekly newsletter.',
    'Run the tool to see impressions and revenue per issue, per month, and per subscriber.',
  ],
  methodology:
    'impressionsPerIssue = subscribers × openRatePct ÷ 100. revenuePerIssue = impressionsPerIssue ÷ 1000 × CPM. revenuePerMonth = revenuePerIssue × issuesPerMonth. revenuePerSubscriberPerMonth = revenuePerMonth ÷ subscribers (0 when subscribers is 0). Currency values are rounded to two decimals and impressions to whole numbers. This is pure arithmetic on the assumptions you supply — the tool has no market data and makes no claim about what CPM you can charge.',
  examples: [
    {
      title: 'Weekly newsletter, 10k subs',
      inputs: { subscribers: 10000, openRatePct: 40, cpm: 25, issuesPerMonth: 4 },
      note: '4,000 impressions per issue → $100 per issue → $400 per month.',
    },
    {
      title: 'Small list, monthly',
      inputs: { subscribers: 1200, openRatePct: 55, cpm: 30, issuesPerMonth: 1 },
      note: '660 impressions per issue → $19.80 for the month.',
    },
  ],
  faqs: [
    {
      question: 'What is the best newsletter cpm calculator?',
      answer:
        'The best newsletter CPM calculator is transparent about its formula and uses only your own assumptions. This calculator shows exactly how it computes revenue — subscribers × open rate × CPM — so you can trust and adjust every number.',
    },
    {
      question: 'Is there a free newsletter cpm calculator?',
      answer:
        'Yes — this newsletter CPM calculator is free with no signup. Run as many scenarios as you like by changing subscribers, open rate, CPM, or issues per month.',
    },
    {
      question: 'How to calculate newsletter cpm?',
      answer:
        'Multiply subscribers by your open rate to get impressions per issue, divide by 1,000, then multiply by your CPM. This calculator does that plus monthly and per-subscriber views — and publishes the full formula in its methodology section.',
    },
    {
      question: 'What CPM should I charge for my newsletter?',
      answer:
        'This calculator cannot tell you what CPM to charge — it only does arithmetic on the CPM you enter. Research what comparable newsletters in your niche charge, enter your own numbers, and adjust with real sponsor feedback.',
    },
    {
      question: 'How does the newsletter cpm calculator work?',
      answer:
        'Enter your details using the inputs above and the newsletter cpm calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the newsletter cpm calculator free to use?',
      answer:
        'Yes - this newsletter cpm calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a newsletter cpm calculator?',
      answer:
        'A newsletter cpm calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'This is pure arithmetic on your own assumptions — it is not market data and cannot tell you what CPM you can charge.',
    'No CPM or open-rate defaults are provided; every number is entered by you.',
    'Currency values are rounded to two decimals; impressions are rounded to whole numbers.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Newsletter CPM Calculator 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free newsletter cpm calculator 2026: Subscribers × open rate, rounded to a whole number. Instant, private, and mobile-friendly. No signup - try it free!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Email Marketing Tools',
          item: 'https://husnainblogger.com/tools/email-marketing/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Newsletter CPM Calculator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
