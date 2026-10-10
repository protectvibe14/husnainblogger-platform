import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/late-payment-fee-calculator/';

export const inputs: ToolInput[] = [
  {
    id: 'invoiceAmount',
    label: 'Invoice amount (USD)',
    type: 'number',
    required: true,
    placeholder: '1000',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'feeMode',
    label: 'Fee model',
    type: 'select',
    required: true,
    options: ['percent-per-day', 'flat-plus-daily'],
  },
  {
    id: 'lateFeeRatePct',
    label: 'Late fee rate per day (%) — YOUR rate',
    type: 'number',
    required: false,
    placeholder: '1',
    validation: { min: 0, max: 100 },
  },
  {
    id: 'flatFee',
    label: 'Flat late fee (USD)',
    type: 'number',
    required: false,
    placeholder: '25',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'dailyFee',
    label: 'Daily late fee on top of flat (USD)',
    type: 'number',
    required: false,
    placeholder: '5',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'daysLate',
    label: 'Days past due',
    type: 'number',
    required: true,
    placeholder: '30',
    validation: { min: 0 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'lateFeeAmount',
    label: 'Late fee',
    type: 'currency',
    description:
    'Free freelance late payment fee calculator 2026: Fee owed on top of the invoice principal. free.',
  },
  {
    id: 'totalAmountDue',
    label: 'Total amount due',
    type: 'currency',
    description:
    'Invoice amount plus the late fee.',
  },
  {
    id: 'effectiveAnnualizedNote',
    label: 'Annualized equivalent (informational)',
    type: 'text',
    description:
    'Simple daily-rate × 365 equivalent — informational only, not a legal standard.',
  },
  {
    id: 'warning',
    label: 'Warning',
    type: 'text',
    description:
    'Flags cases like a fee larger than the invoice itself.',
  },
];

export const content: ToolContent = {
  title: 'Freelance Late Payment Fee Calculator',
  description:
    'Calculate late fees on overdue invoices — percent-per-day or flat-plus-daily, your rate, your terms. Free Run the numbers and get paid fairly today.',
  howTo: [
    'Enter the invoice amount — the principal that is overdue.',
    'Pick the fee model: percent-per-day (a daily % of the invoice) or flat-plus-daily (a one-time flat fee plus a daily amount).',
    'For percent-per-day, enter YOUR late fee rate per day (no default is assumed); for flat-plus-daily, enter the flat fee and optional daily fee.',
    'Enter how many days past due the invoice is (0 = no fee).',
    'Run the calculator and read the late fee, total due, and the informational annualized note.',
  ],
  methodology:
    'Percent-per-day: lateFee = invoiceAmount × (lateFeeRatePct ÷ 100) × daysLate. Flat-plus-daily: lateFee = flatFee + (dailyFee × daysLate). Total due = invoiceAmount + lateFee; money rounds to the nearest cent. The annualized note is the simple daily rate × 365 (no compounding), labeled informational only — the rate itself is always a user assumption, and enforceability of late fees varies by jurisdiction.',
  examples: [
    {
      title: '1% per day, 30 days late',
      inputs: {
        invoiceAmount: 1000,
        feeMode: 'percent-per-day',
        lateFeeRatePct: 1,
        daysLate: 30,
      },
      note: '1000 × 1% × 30 = $300.00 fee; $1,300.00 total due.',
    },
    {
      title: 'Flat $25 plus $5/day',
      inputs: {
        invoiceAmount: 500,
        feeMode: 'flat-plus-daily',
        flatFee: 25,
        dailyFee: 5,
        daysLate: 10,
      },
      note: '25 + (5 × 10) = $75.00 fee; $575.00 total due.',
    },
    {
      title: 'Fee bigger than the invoice',
      inputs: {
        invoiceAmount: 200,
        feeMode: 'percent-per-day',
        lateFeeRatePct: 5,
        daysLate: 30,
      },
      note: 'Fee = $300.00 on a $200 invoice — flagged with a warning so you can double-check your rate.',
    },
  ],
  faqs: [
    {
      question: 'What is the best freelance late payment fee calculator?',
      answer:
        'The best freelance late payment fee calculator lets you apply YOUR OWN late-fee terms instead of assuming a standard rate. This one supports two models — percent-per-day and flat-plus-daily — and shows the fee, the total due, and an informational annualized equivalent.',
    },
    {
      question: 'Is there a free freelance late payment fee calculator?',
      answer:
        'Yes — this freelance late payment fee calculator is completely free with no signup. Enter the invoice amount, your fee terms, and the days past due to see the late fee instantly.',
    },
    {
      question: 'How to calculate freelance late payment fee?',
      answer:
        'Multiply the invoice amount by your daily late rate and the days past due, or add a flat fee to a daily fee times the days late. This tool runs both formulas, rounds to the cent, and warns you when the fee exceeds the invoice principal.',
    },
    {
      question: 'What is a freelance late payment fee calculator?',
      answer:
        'A freelance late payment fee calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the freelance late payment fee calculator?',
      answer:
        'No account needed. Open the freelance late payment fee calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'How do I calculate freelance late payment fee calculator?',
      answer: 'Enter your numbers in the fields above and the calculator does the math instantly. You can adjust any input to see how it affects the result in real time.',
    },
    {
      question: 'What is a good freelance late payment fee calculator?',
      answer: 'It depends on your industry, location, and experience level. Use the calculator to benchmark different scenarios, then compare against published averages for your niche.',
    },
  ],
  assumptions: [
    'Math only — the late-fee rate is your assumption; no default rate is presented as legally standard.',
    'Enforceability of late fees varies by jurisdiction — this is informational, not legal advice.',
    'The annualized note uses simple (non-compounding) arithmetic and is informational only.',
    'Check that your contract actually permits the fee you intend to charge.',
  ],
  jsonLd: [],
};
