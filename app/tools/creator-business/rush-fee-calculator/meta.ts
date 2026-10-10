import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/rush-fee-calculator/';

export const inputs: ToolInput[] = [
  {
    id: 'baseProjectPrice',
    label: 'Base project price (USD)',
    type: 'number',
    required: true,
    placeholder: '1000',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'rushPct',
    label: 'Rush surcharge as % of base (YOUR pricing policy)',
    type: 'number',
    required: true,
    placeholder: '25',
    validation: { min: 0, max: 200 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'rushFeeAmount',
    label: 'Rush surcharge',
    type: 'currency',
    description:
    'Free rush fee calculator 2026: Base price × your rush percentage. free.',
  },
  {
    id: 'rushTotal',
    label: 'Rush total',
    type: 'currency',
    description:
    'Base price plus the rush surcharge.',
  },
  {
    id: 'rushFeeAsPctOfBase',
    label: 'Rush fee as % of base',
    type: 'percent',
    description:
    'The rush percentage you entered, echoed back.',
  },
  {
    id: 'note',
    label: 'Note',
    type: 'text',
    description:
    'Caution when the rush percent exceeds 100% of the base.',
  },
];

export const content: ToolContent = {
  title: 'Rush Fee Calculator',
  description:
    'Price rush work with confidence — enter your base price and rush percentage to get the surcharge and new total instantly. Free.',
  howTo: [
    'Enter your base project price — what the work costs on a normal timeline.',
    'Enter your rush surcharge as a percent of the base (your own pricing policy, e.g. 25 for a 25% rush fee).',
    'Run the calculator to get the rush surcharge, the new total, and the percent confirmation.',
    'Read the caution note if you set a rush percent above 100% — it is allowed, but worth double-checking.',
  ],
  methodology:
    'rushFee = baseProjectPrice × (rushPct ÷ 100); rushTotal = baseProjectPrice + rushFee. Money values round to the nearest cent. The rush percentage is entirely your own pricing policy — the tool contains no market-standard rush percentage. Percentages above 200% are rejected as likely typos.',
  examples: [
    {
      title: 'Standard 25% rush',
      inputs: { baseProjectPrice: 1000, rushPct: 25 },
      note: 'Rush fee $250.00; rush total $1,250.00.',
    },
    {
      title: 'No rush, normal price',
      inputs: { baseProjectPrice: 1200, rushPct: 0 },
      note: '0% rush leaves the total equal to the base: $1,200.00.',
    },
    {
      title: 'Express doubling (150%)',
      inputs: { baseProjectPrice: 400, rushPct: 150 },
      note: 'Above 100% is computed with a caution note so typos get noticed.',
    },
  ],
  faqs: [
    {
      question: 'What is the best rush fee calculator?',
      answer:
        'The best rush fee calculator applies your own rush percentage to your base project price and shows the surcharge and new total clearly. This one does that in seconds — enter the base price and your rush percent, and it returns the fee, total, and percent confirmation.',
    },
    {
      question: 'Is there a free rush fee calculator?',
      answer:
        'Yes — this rush fee calculator is completely free with no signup. Enter your base project price and rush percentage to get the surcharge and new total instantly.',
    },
    {
      question: 'How to calculate rush fee?',
      answer:
        'Multiply your base project price by your rush percentage (as a decimal). A $1,000 project with a 25% rush policy costs an extra $250, for a $1,250 total. This tool runs that formula and flags percentages above 100% for a double-check.',
    },
    {
      question: 'What is a rush fee calculator?',
      answer:
        'A rush fee calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the rush fee calculator?',
      answer:
        'No account needed. Open the rush fee calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'How do I calculate rush fee calculator?',
      answer: 'Enter your numbers in the fields above and the calculator does the math instantly. You can adjust any input to see how it affects the result in real time.',
    },
    {
      question: 'Is this rush fee calculator calculator accurate?',
      answer: 'Yes, it uses standard formulas and up-to-date rates. However, treat the result as an estimate for planning — actual figures may vary based on your specific situation.',
    },
  ],
  assumptions: [
    'Math only — the rush percentage is your own pricing policy; no market-standard rush fee exists here.',
    'A rush percent of 0 returns the base price unchanged.',
    'Percentages above 200% are rejected as likely typos; 100–200% computes with a caution note.',
  ],
  jsonLd: [],
};
