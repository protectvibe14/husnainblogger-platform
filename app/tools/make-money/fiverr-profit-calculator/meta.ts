import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'orderValue',
    label: 'Order value (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 100',
    validation: { min: 0.01, max: 1000000000, unit: 'USD' },
  },
  {
    id: 'tipsValue',
    label: 'Tips received (optional)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 10',
    validation: { min: 0, max: 1000000000, unit: 'USD' },
  },
  {
    id: 'deliveryCost',
    label: 'Delivery cost — outsourcing/tools (optional)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 15',
    validation: { min: 0, max: 1000000000, unit: 'USD' },
  },
  {
    id: 'hoursWorked',
    label: 'Hours worked (optional — enables effective hourly)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 3',
    validation: { min: 0.01, max: 100000, unit: 'hours' },
  },
  {
    id: 'serviceFeeRate',
    label: 'Service fee rate (%) — default 20, user-adjustable',
    type: 'number',
    required: false,
    placeholder: '20 (default estimate; 0–100%)',
    validation: { min: 0, max: 100, unit: 'percent' },
  },
  {
    id: 'revisionRounds',
    label: 'Revision rounds (optional, informational)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 2',
    validation: { min: 0, max: 1000, unit: 'count' },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'fiverrFee', label: 'Fiverr fee', type: 'currency' },
  { id: 'netEarnings', label: 'Net earnings', type: 'currency' },
  { id: 'effectiveHourly', label: 'Effective hourly rate', type: 'currency' },
  { id: 'note', label: 'Estimate note', type: 'text' },
];

const DESCRIPTION =
  'See what you keep from each order with this free fiverr profit calculator — enter order value, tips, and costs for the 20% fee and net earnings. Try it free.';

export const content: ToolContent = {
  title: 'Fiverr Profit Calculator',
  description: DESCRIPTION,
  howTo: [
    'Enter your order value in USD — the gig price before any fees.',
    'Add any tips you received — Fiverr charges its commission on tips too.',
    'Enter your delivery cost (outsourcing, stock assets, tools) to see true profit.',
    'Optionally enter hours worked to get your effective hourly rate for the order.',
    'The service fee rate defaults to 20% (Fiverr\'s documented seller commission) and stays user-adjustable.',
    'Run the calculation to see the Fiverr fee, your net earnings, and the optional effective hourly.',
  ],
  methodology:
    'This is pure arithmetic with no AI and no live data. The Fiverr fee = service fee rate × (order value + tips); net earnings = order value + tips − Fiverr fee − delivery cost; effective hourly = net earnings ÷ hours worked. The buyer service fee (~5.5%) is excluded because it is paid by the buyer and does not reduce the seller payout. The default 20% rate is Fiverr\'s documented flat seller commission, kept user-editable and labeled as an estimate.',
  examples: [
    {
      title: '$100 order, no extras',
      inputs: { orderValue: 100 },
      note: 'Fiverr fee $20.00, net earnings $80.00.',
    },
    {
      title: '$100 order with tips and costs',
      inputs: { orderValue: 100, tipsValue: 20, deliveryCost: 15, hoursWorked: 3 },
      note: 'Fee applies to $120.00 (order + tips) = $24.00; net $81.00; effective hourly $27.00.',
    },
  ],
  faqs: [
    {
      question: 'What is the best fiverr profit calculator?',
      answer:
        'The best one separates the 20% seller commission from your own costs: it should apply the fee to tips as well (Fiverr does) and let you subtract delivery costs, which is exactly what this free calculator does.',
    },
    {
      question: 'Is there a free fiverr profit calculator?',
      answer:
        'Yes — this fiverr profit calculator is completely free with no signup. Enter your order value, tips, and costs to see your net earnings instantly.',
    },
    {
      question: 'How to calculate fiverr profit?',
      answer:
        'Add your order value and any tips, subtract Fiverr\'s 20% commission on that total, then subtract your delivery costs (outsourcing, tools). Divide what remains by your hours worked for the effective hourly rate.',
    },
    {
      question: 'How does the fiverr profit calculator work?',
      answer:
        'Enter your details using the inputs above and the fiverr profit calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the fiverr profit calculator free to use?',
      answer:
        'Yes - this fiverr profit calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a fiverr profit calculator?',
      answer:
        'A fiverr profit calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the fiverr profit calculator?',
      answer:
        'No account needed. Open the fiverr profit calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Fiverr charges sellers a flat 20% commission on ALL earnings including tips (default rate; kept user-adjustable and labeled as an estimate).',
    'The buyer service fee (~5.5%) is buyer-paid and excluded from the seller math.',
    'Withdrawal fees (PayPal / bank / Revenue Card) vary by country and method and are not modeled — subtract your own withdrawal fee from net earnings.',
    'Revision rounds are informational only and do not change the fee math.',
    'All amounts are USD; results are estimates — verify against Fiverr\'s current terms.',
  ],
  jsonLd: [],
};
