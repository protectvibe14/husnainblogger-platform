import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/retainer-vs-hourly-comparator/';

export const inputs: ToolInput[] = [
  {
    id: 'hourlyRate',
    label: 'Hourly rate (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 100',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'estimatedHoursPerMonth',
    label: 'Estimated hours per month',
    type: 'number',
    required: true,
    placeholder: 'e.g. 40',
    validation: { min: 0 },
  },
  {
    id: 'retainerFee',
    label: 'Retainer fee per month (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 3000',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'retainerIncludedHours',
    label: 'Hours included in retainer',
    type: 'number',
    required: true,
    placeholder: 'e.g. 40',
    validation: { min: 0 },
  },
  {
    id: 'overageHourlyRate',
    label: 'Overage hourly rate (USD, optional)',
    type: 'number',
    required: false,
    placeholder: 'Defaults to your hourly rate',
    validation: { min: 0, unit: 'USD' },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'hourlyModelMonthlyCost',
    label: 'Hourly model monthly cost',
    type: 'currency',
    description:
    'Free retainer vs hourly calculator 2026: What the month costs billed hourly: hourlyRate x estimatedHoursPerMonth. Fast, private now.',
  },
  {
    id: 'retainerModelMonthlyCost',
    label: 'Retainer model monthly cost',
    type: 'currency',
    description:
    'Retainer fee plus overage for hours beyond the included hours.',
  },
  {
    id: 'breakEvenHours',
    label: 'Break-even hours',
    type: 'number',
    description:
    'Monthly hours at which both models cost the same (null when they never cross).',
  },
  {
    id: 'cheaperOption',
    label: 'Cheaper option',
    type: 'text',
    description:
    'hourly, retainer, or tie at your estimated hours.',
  },
  {
    id: 'savingsDifference',
    label: 'Monthly savings difference',
    type: 'currency',
    description:
    'Absolute dollar difference between the two models.',
  },
  {
    id: 'notes',
    label: 'Notes',
    type: 'list',
    description:
    'Defaults used and what the comparison does not cover.',
  },
];

export const content: ToolContent = {
  title: 'Retainer vs Hourly Calculator',
  description:
    'Compare retainer vs hourly pricing in seconds. Enter rates and hours to see which model costs less, the break-even point, and savings. Free now.',
  howTo: [
    'Enter your hourly rate and the estimated hours per month for the engagement.',
    'Enter the retainer fee and how many hours it includes.',
    'Optionally enter the overage hourly rate for hours beyond the retainer — it defaults to your hourly rate.',
    'Run the tool to see both monthly costs, the cheaper option, the savings difference, and the break-even hours.',
    'Use the break-even hours to sanity-check your estimate: below it one model wins, above it the other does.',
  ],
  methodology:
    'This tool compares two deterministic cost models: hourly model cost = hourlyRate x estimatedHoursPerMonth; retainer model cost = retainerFee + max(0, estimatedHoursPerMonth - retainerIncludedHours) x overageHourlyRate. The cheaper option is whichever costs less ("tie" within half a cent), and break-even hours is the smallest monthly hour count where both cost the same (null when the lines never cross). When the overage rate is blank it defaults to the hourly rate with a note. The recommendation is arithmetic, not business advice.',
  examples: [
    {
      title: 'Retainer wins at low hours',
      inputs: {
        hourlyRate: 100,
        estimatedHoursPerMonth: 20,
        retainerFee: 1500,
        retainerIncludedHours: 40,
        overageHourlyRate: 80,
      },
      note: 'Hourly $2,000 vs retainer $1,500 — retainer cheaper by $500, break-even at 15 hours.',
    },
    {
      title: 'Hourly wins at high hours',
      inputs: {
        hourlyRate: 100,
        estimatedHoursPerMonth: 200,
        retainerFee: 3000,
        retainerIncludedHours: 40,
        overageHourlyRate: 150,
      },
      note: 'Hourly $20,000 vs retainer $27,000 — hourly cheaper by $7,000, break-even at 30 hours.',
    },
    {
      title: 'Overage defaults to hourly rate',
      inputs: {
        hourlyRate: 75,
        estimatedHoursPerMonth: 50,
        retainerFee: 1200,
        retainerIncludedHours: 30,
      },
      note: 'Blank overage uses $75/hr: hourly $3,750 vs retainer $2,700 — retainer wins.',
    },
  ],
  faqs: [
    {
      question: 'What is the best retainer vs hourly calculator?',
      answer:
        'The best one does the full math: both monthly costs, which model is cheaper, the dollar difference, and the break-even hour count — plus honest handling of overage rates. This free calculator does all of that from your own rates, with no signup.',
    },
    {
      question: 'Is there a free retainer vs hourly calculator?',
      answer:
        'Yes — this retainer vs hourly calculator is completely free with no signup. Enter your hourly rate, estimated hours, retainer fee, and included hours to get both costs and the break-even point.',
    },
    {
      question: 'How to calculate retainer vs hourly?',
      answer:
        'Multiply your hourly rate by estimated monthly hours for the hourly cost. For the retainer, take the fee plus any overage: (hours beyond the included hours) x overage rate. Whichever is lower costs less; the break-even point is where they match. This tool runs all of it for you.',
    },
    {
      question: 'What is a retainer vs hourly calculator?',
      answer:
        'A retainer vs hourly calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the retainer vs hourly calculator?',
      answer:
        'No account needed. Open the retainer vs hourly calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'How do I calculate retainer vs hourly calculator?',
      answer: 'Enter your numbers in the fields above and the calculator does the math instantly. You can adjust any input to see how it affects the result in real time.',
    },
    {
      question: 'What is a good retainer vs hourly calculator?',
      answer: 'It depends on your industry, location, and experience level. Use the calculator to benchmark different scenarios, then compare against published averages for your niche.',
    },
  ],
  assumptions: [
    'The comparison is arithmetic only — it ignores scope creep, unpaid admin time, payment risk, and taxes, and is not pricing advice.',
    'A blank overage rate defaults to your hourly rate (surfaced in the notes).',
    'Break-even is null when the two cost lines never cross (e.g. one model is always cheaper).',
  ],
  jsonLd: [],
};
