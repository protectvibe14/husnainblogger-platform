import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/exclusivity-fee-calculator/';

export const inputs: ToolInput[] = [
  {
    id: 'baseDealFee',
    label: 'Base deal fee (USD)',
    type: 'number',
    required: true,
    placeholder: '5000',
    validation: { min: 0 },
  },
  {
    id: 'exclusivityPct',
    label: 'Exclusivity percentage (your own rate, %)',
    type: 'number',
    required: true,
    placeholder: '20',
    validation: { min: 0, max: 100 },
  },
  {
    id: 'exclusivityMonths',
    label: 'Exclusivity period (months)',
    type: 'number',
    required: true,
    placeholder: '6',
    validation: { min: 0 },
  },
  {
    id: 'flatFeeMode',
    label: 'Flat exclusivity fee instead (USD, optional)',
    type: 'number',
    required: false,
    placeholder: '2500',
    validation: { min: 0 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'exclusivityFee',
    label: 'Exclusivity fee',
    type: 'currency',
    description:
    'Free influencer exclusivity fee 2026: The fee for the exclusivity clause, from your own percentage or flat fee (estimate). Fast, private.',
  },
  {
    id: 'totalDealValue',
    label: 'Total deal value',
    type: 'currency',
    description:
    'Base deal fee plus the exclusivity fee.',
  },
  {
    id: 'monthlyEquivalent',
    label: 'Monthly equivalent',
    type: 'currency',
    description:
    'Exclusivity fee spread across the exclusivity period, per month.',
  },
];

export const content: ToolContent = {
  title: 'Influencer Exclusivity Fee',
  description:
    'Calculate an influencer exclusivity fee from your base deal fee and your own percentage or flat fee. Get the deal total and monthly equivalent free.',
  howTo: [
    'Enter your "Base deal fee" — the amount already agreed for the sponsored content.',
    'Enter your "Exclusivity percentage" — the rate YOU charge for exclusivity (there is no standard rate in this tool).',
    'Enter the "Exclusivity period" in months — or use the optional flat fee field to set one fixed exclusivity fee instead.',
    'Run the tool to get the exclusivity fee, the total deal value, and the monthly equivalent.',
    'Adjust your percentage or flat fee until the total reflects what the exclusivity is worth to you.',
  ],
  methodology:
    'Exclusivity fee = base deal fee × (your exclusivity percentage ÷ 100), or your flat fee when you enter one. Total deal value = base deal fee + exclusivity fee, and monthly equivalent = exclusivity fee ÷ months. The percentage is always your own assumption — the tool never suggests a rate — so every result is an estimate based on your inputs.',
  examples: [
    {
      title: '20% for 6 months',
      inputs: { baseDealFee: 5000, exclusivityPct: 20, exclusivityMonths: 6 },
      note: 'A $1,000 exclusivity fee on a $5,000 deal; $6,000 total, about $166.67 per month.',
    },
    {
      title: 'Flat fee instead of a percentage',
      inputs: { baseDealFee: 5000, exclusivityMonths: 12, flatFeeMode: 12000 },
      note: 'A $12,000 flat exclusivity fee gives a $17,000 total deal with a $1,000 monthly equivalent.',
    },
    {
      title: 'No exclusivity period',
      inputs: { baseDealFee: 2000, exclusivityPct: 25, exclusivityMonths: 0 },
      note: 'With 0 months, the monthly equivalent equals the full $500 fee.',
    },
  ],
  faqs: [
    {
      question: 'What is the best influencer exclusivity fee?',
      answer:
        'There is no single best fee — it depends on what the exclusivity costs you in lost deals. This calculator does not invent a rate: you enter your own percentage or flat fee, and it computes the exclusivity fee, total deal value, and monthly equivalent from it.',
    },
    {
      question: 'Is there a free influencer exclusivity fee?',
      answer:
        'Yes — this influencer exclusivity fee calculator is completely free with no signup. Enter your base deal fee, your own percentage or flat fee, and the exclusivity period to get instant estimates.',
    },
    {
      question: 'How to use influencer exclusivity fee?',
      answer:
        'Decide what percentage of your base deal fee (or what flat amount) the exclusivity clause is worth to you, enter it with the exclusivity period, and use the resulting fee in your brand-deal contract. The monthly equivalent helps you compare offers of different lengths.',
    },
    {
      question: 'What is an influencer exclusivity fee?',
      answer:
        'An influencer exclusivity fee is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the influencer exclusivity fee?',
      answer:
        'No account needed. Open the influencer exclusivity fee, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'ESTIMATE: every result is computed from YOUR percentage or flat fee — this tool contains no industry-rate data and does not recommend what to charge.',
    'The monthly equivalent is a simple division of the fee by the exclusivity months; it does not account for negotiation, taxes, or payment terms.',
    'With a 0-month exclusivity period, the monthly equivalent equals the full fee (there is nothing to spread it across).',
  ],
  jsonLd: [],
};
