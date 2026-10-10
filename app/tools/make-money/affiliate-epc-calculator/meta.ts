import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'totalClicks',
    label: 'Total clicks',
    type: 'number',
    required: true,
    placeholder: 'e.g. 1000',
    validation: { min: 1 },
  },
  {
    id: 'totalConversions',
    label: 'Total conversions',
    type: 'number',
    required: true,
    placeholder: 'e.g. 25',
    validation: { min: 0 },
  },
  {
    id: 'totalCommission',
    label: 'Total commission earned (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 300',
    validation: { min: 0, unit: 'USD' },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'epc', label: 'EPC (earnings per 100 clicks)', type: 'currency' },
  { id: 'conversionRate', label: 'Conversion rate', type: 'percent' },
  { id: 'earningsPerConversion', label: 'Earnings per conversion', type: 'currency' },
  { id: 'note', label: 'Honesty note', type: 'text' },
];

const DESCRIPTION =
  'Run the free EPC calculator affiliate marketers use — enter clicks, conversions, and commission to get earnings per 100 clicks, then sanity-check your inputs.';

export const content: ToolContent = {
  title: 'EPC Calculator Affiliate',
  description: DESCRIPTION,
  howTo: [
    'Enter your total clicks from your affiliate dashboard or tracking link.',
    'Enter your total conversions (sales or leads) — 0 or more.',
    'Enter your total commission earned in USD for the same period.',
    'Run the calculation: EPC = commission ÷ clicks × 100, plus your conversion rate and earnings per conversion.',
    'Read the honesty note — bot or duplicate clicks in your tracking flow straight into these ratios.',
  ],
  methodology:
    'The tool applies the industry EPC convention: total commission divided by total clicks, multiplied by 100 (earnings per 100 clicks). Conversion rate is conversions ÷ clicks × 100, and earnings per conversion is commission ÷ conversions. With zero conversions the tool reports EPC $0 rather than dividing by zero.',
  examples: [
    {
      title: 'Review blog campaign',
      inputs: { totalClicks: 1000, totalConversions: 25, totalCommission: 300 },
      note: 'EPC = $30 per 100 clicks, conversion rate 2.5%, earnings per conversion $12.',
    },
    {
      title: 'New campaign, no sales yet',
      inputs: { totalClicks: 500, totalConversions: 0, totalCommission: 0 },
      note: 'Zero conversions yields EPC $0, conversion rate 0%, and earnings-per-conversion $0 by the spec-defined edge.',
    },
  ],
  faqs: [
    {
      question: 'What is the best epc calculator affiliate?',
      answer:
        'The best EPC calculator uses the standard convention — commission ÷ clicks × 100 — and states it plainly. This free tool does exactly that, and also shows your conversion rate and earnings per conversion from the same inputs.',
    },
    {
      question: 'Is there a free epc calculator affiliate?',
      answer:
        'Yes — this EPC calculator is completely free with no signup. Enter your clicks, conversions, and commission to get earnings per 100 clicks instantly.',
    },
    {
      question: 'How to calculate epc calculator affiliate?',
      answer:
        'Divide your total commission by your total clicks, then multiply by 100. For example, $300 commission from 1,000 clicks = $30 EPC. This tool runs that formula plus your conversion rate and earnings per conversion automatically.',
    },
    {
      question: 'What is an epc calculator affiliate?',
      answer:
        'An epc calculator affiliate is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the epc calculator affiliate?',
      answer:
        'No account needed. Open the epc calculator affiliate, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'How do I calculate epc calculator affiliate?',
      answer: 'Enter your numbers in the fields above and the calculator does the math instantly. You can adjust any input to see how it affects the result in real time.',
    },
    {
      question: 'What is a good epc calculator affiliate?',
      answer: 'It depends on your industry, location, and experience level. Use the calculator to benchmark different scenarios, then compare against published averages for your niche.',
    },
  ],
  assumptions: [
    'EPC follows the industry convention of earnings per 100 clicks — it is not earnings per single click.',
    'Zero conversions yields EPC $0 and skips the earnings-per-conversion division (spec-defined edge).',
    'All three inputs are user-entered; the output is only as correct as the inputs — bot, duplicate, or misattributed clicks distort the ratios.',
  ],
  jsonLd: [],
};
