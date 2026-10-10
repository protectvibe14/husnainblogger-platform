import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/walk-away-rate-calculator/';

export const inputs: ToolInput[] = [
  {
    id: 'monthlyBusinessCosts',
    label: 'Monthly business costs (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 4000',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'billableHoursPerMonth',
    label: 'Billable hours per month',
    type: 'number',
    required: true,
    placeholder: 'e.g. 80',
    validation: { min: 0 },
  },
  {
    id: 'bufferPct',
    label: 'Buffer percentage (%)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 25',
    validation: { min: 0, max: 100 },
  },
  {
    id: 'currentRate',
    label: 'Current hourly rate (USD, optional)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 70',
    validation: { min: 0, unit: 'USD' },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'floorRate',
    label: 'Cost-covering floor rate',
    type: 'currency',
    description:
    'Free minimum project fee calculator 2026: monthlyBusinessCosts / billableHoursPerMonth — the rate that just covers costs. Fast, private now.',
  },
  {
    id: 'walkAwayRate',
    label: 'Walk-away rate',
    type: 'currency',
    description:
    'Floor rate plus your buffer margin — the rate below which you walk away.',
  },
  {
    id: 'gapVsCurrentRate',
    label: 'Gap vs current rate',
    type: 'currency',
    description:
    'walkAwayRate minus your current rate (null when not provided).',
  },
  {
    id: 'notes',
    label: 'Notes',
    type: 'list',
    description:
    'Flags for survival-rate buffers, incomplete costs, and honest limitations.',
  },
];

export const content: ToolContent = {
  title: 'Minimum Project Fee Calculator',
  description:
    'Find your minimum project fee in seconds. Enter monthly costs and billable hours to get your cost floor and walk-away rate with buffer. Free now.',
  howTo: [
    'Enter your total monthly business costs: rent, tools, insurance, taxes, subscriptions.',
    'Enter how many hours per month you can actually bill (after admin and marketing time).',
    'Choose your buffer percentage — the margin you want above your cost floor.',
    'Optionally enter your current hourly rate to see the gap to your walk-away rate.',
    'Run the tool to get your floor rate, walk-away rate, and the raise (or headroom) versus your current rate.',
  ],
  methodology:
    'This tool runs one formula on your own numbers: floorRate = monthlyBusinessCosts / billableHoursPerMonth, and walkAwayRate = floorRate x (1 + bufferPct / 100). The buffer percentage is your own business assumption — the tool recommends no value. Billable hours must be above zero; a 0% buffer makes the walk-away rate equal the floor (flagged as a survival rate); $0 costs produce a $0 floor (flagged as likely incomplete). Money rounds to the nearest cent. Math only — this says nothing about what the market will pay.',
  examples: [
    {
      title: '$4,000 costs, 80 billable hours, 25% buffer',
      inputs: {
        monthlyBusinessCosts: 4000,
        billableHoursPerMonth: 80,
        bufferPct: 25,
        currentRate: 70,
      },
      note: 'Floor $50/hr, walk-away $62.50/hr — $7.50/hr of headroom above the current rate.',
    },
    {
      title: 'No current rate to compare',
      inputs: {
        monthlyBusinessCosts: 5000,
        billableHoursPerMonth: 125,
        bufferPct: 10,
      },
      note: 'Floor $40/hr, walk-away $44/hr, gap left empty.',
    },
    {
      title: 'Zero buffer flagged as survival rate',
      inputs: {
        monthlyBusinessCosts: 2400,
        billableHoursPerMonth: 120,
        bufferPct: 0,
      },
      note: 'Walk-away equals the $20/hr floor, flagged as a survival rate with no margin.',
    },
  ],
  faqs: [
    {
      question: 'What is the best minimum project fee calculator?',
      answer:
        'The best one starts from your real costs: monthly business costs divided by billable hours gives your cost floor, then your own buffer percentage sets the walk-away rate. This free calculator does exactly that and compares the result to your current rate, with no signup.',
    },
    {
      question: 'Is there a free minimum project fee calculator?',
      answer:
        'Yes — this minimum project fee calculator is completely free with no signup. Enter your monthly costs, billable hours, and buffer to get your floor rate and walk-away rate.',
    },
    {
      question: 'How to calculate minimum project fee?',
      answer:
        'Divide your monthly business costs by your billable hours per month for your cost-covering floor rate, then multiply by (1 + your buffer percentage / 100) for your walk-away rate. This tool runs the math and flags survival-rate buffers and incomplete costs.',
    },
    {
      question: 'What is a minimum project fee calculator?',
      answer:
        'A minimum project fee calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the minimum project fee calculator?',
      answer:
        'No account needed. Open the minimum project fee calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'What is a good minimum project fee calculator?',
      answer: 'It depends on your industry, location, and experience level. Use the calculator to benchmark different scenarios, then compare against published averages for your niche.',
    },
    {
      question: 'How do I calculate minimum project fee calculator?',
      answer: 'Enter your numbers in the fields above and the calculator does the math instantly. You can adjust any input to see how it affects the result in real time.',
    },
  ],
  assumptions: [
    'Math only: this covers YOUR costs plus YOUR chosen buffer — it says nothing about what clients will pay.',
    'The buffer percentage is your own business assumption; the tool recommends no value.',
    'Unpaid time (admin, marketing, holidays) is only covered if you excluded it from billable hours.',
  ],
  jsonLd: [],
};
