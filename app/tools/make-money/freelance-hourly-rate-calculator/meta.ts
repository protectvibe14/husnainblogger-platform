import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'annualIncomeTarget',
    label: 'Annual income target (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 60000',
    validation: { min: 0.01, max: 1000000000000, unit: 'USD' },
  },
  {
    id: 'billableHoursPerYear',
    label: 'Billable hours per year',
    type: 'number',
    required: true,
    placeholder: 'e.g. 1000',
    validation: { min: 0.01, max: 8760, unit: 'hours' },
  },
  {
    id: 'businessExpenses',
    label: 'Annual business expenses (USD, optional)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 5000',
    validation: { min: 0, max: 1000000000000, unit: 'USD' },
  },
  {
    id: 'taxRate',
    label: 'Effective tax rate % (optional)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 25',
    validation: { min: 0, max: 100, unit: 'percent' },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'requiredHourlyRate', label: 'Required hourly rate', type: 'currency' },
  { id: 'rateWithTaxBuffer', label: 'Rate with tax buffer', type: 'currency' },
  { id: 'note', label: 'Methodology note', type: 'text' },
];

const DESCRIPTION =
  'Free freelance hourly rate calculator 2026: work backwards from your income target, expenses, and billable hours to find the rate you must charge. No signup.';

export const content: ToolContent = {
  title: 'Freelance Hourly Rate Calculator 2027',
  description: DESCRIPTION,
  howTo: [
    'Enter your annual income target — the take-home pay you want for the year.',
    'Enter your realistic billable hours per year — hours you can actually bill clients, not total hours worked (most freelancers bill far fewer than 2,080).',
    'Optionally add annual business expenses (software, hardware, insurance) so they are funded by your rate.',
    'Optionally add your effective tax rate to get a rate with a tax buffer built in.',
    'Run the calculation to see the hourly rate you must charge — and the higher rate that pre-funds your tax bill.',
  ],
  methodology:
    'This is pure backwards arithmetic on your own inputs with no AI and no market data: required hourly rate = (annual income target + business expenses) ÷ billable hours per year. The rate with tax buffer = required rate ÷ (1 − tax rate), which pre-funds your tax bill so the target income remains after tax. It is not tax advice — your effective rate depends on your jurisdiction and deductions.',
  examples: [
    {
      title: '$60k target, 1,000 billable hours',
      inputs: { annualIncomeTarget: 60000, billableHoursPerYear: 1000 },
      note: 'Required rate $60.00/hour before expenses and tax.',
    },
    {
      title: 'With expenses and tax buffer',
      inputs: { annualIncomeTarget: 60000, billableHoursPerYear: 1000, businessExpenses: 5000, taxRate: 25 },
      note: 'Required rate $65.00/hour; with a 25% tax buffer $86.67/hour.',
    },
  ],
  faqs: [
    {
      question: 'What is the best freelance hourly rate calculator?',
      answer:
        'The best one works backwards from your own numbers instead of quoting a market average: it adds your expenses to your income target, divides by realistic billable hours, and optionally pre-funds tax — which is exactly how this free calculator is built.',
    },
    {
      question: 'Is there a free freelance hourly rate calculator?',
      answer:
        'Yes — this freelance hourly rate calculator is completely free with no signup. Enter your income target and billable hours to find the rate you must charge.',
    },
    {
      question: 'How do you calculate a freelance hourly rate?',
      answer:
        'Add your annual income target to your yearly business expenses, then divide by your realistic billable hours per year. A $60,000 target plus $5,000 in expenses over 1,000 billable hours equals $65.00/hour — this calculator runs that exact backwards arithmetic on your own numbers.',
    },
    {
      question: 'How many billable hours should I use per year?',
      answer:
        'Use hours you can realistically bill clients — not 2,080 (40 hours × 52 weeks), since most freelancers bill far fewer. Overestimating your billable hours produces an underpriced rate that won\'t fund your income target; 1,000 is a common starting point.',
    },
    {
      question: 'Should I include taxes in my freelance hourly rate?',
      answer:
        'You can — entering an effective tax rate gives you a second, higher rate with a tax buffer built in: required rate ÷ (1 − tax rate). At a 25% rate, $65/hour becomes $86.67/hour, so your target income survives after tax. This is a simple calculation, not tax advice.',
    },
    {
      question: 'Should business expenses be included in my hourly rate?',
      answer:
        'Yes — your rate has to fund software, hardware, insurance, and other overheads, not just your income. Adding $5,000 in expenses to a $60,000 target over 1,000 billable hours raises the required rate from $60.00 to $65.00/hour, so your clients are funding the tools you work with.',
    },
    {
      question: 'How do I convert my hourly rate into a project quote?',
      answer:
        'Estimate how many hours the project will take and multiply by your hourly rate — a 10-hour project at $65/hour quotes at $650. Working backwards from your required rate keeps project pricing consistent with your income target instead of guessing a flat number.',
    },
  ],
  assumptions: [
    'Pure arithmetic on user-supplied inputs — no external market data is used and no "typical rate" is implied.',
    'Billable hours must be realistic billable time, not 40h × 52 weeks; overestimating hours produces an underpriced rate.',
    'The tax buffer uses a simple effective-rate division and is not tax advice — consult a tax professional for your jurisdiction.',
    'All amounts are USD; results are estimates based on your own inputs.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Freelance Hourly Rate Calculator 2026 | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/freelance-hourly-rate-calculator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: DESCRIPTION,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Make-Money & Affiliate Tools',
          item: 'https://husnainblogger.com/tools/make-money/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Freelance Hourly Rate Calculator',
          item: 'https://husnainblogger.com/tools/make-money/freelance-hourly-rate-calculator/',
        },
      ],
    },
  ],
};
