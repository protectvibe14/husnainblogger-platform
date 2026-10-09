import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/freelance-day-rate-calculator/';

export const inputs: ToolInput[] = [
  {
    id: 'annualIncomeTarget',
    label: 'Annual income target (USD)',
    type: 'number',
    required: true,
    placeholder: '60000',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'annualBusinessExpenses',
    label: 'Annual business expenses (USD)',
    type: 'number',
    required: true,
    placeholder: '6000',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'workingDaysPerYear',
    label: 'Working days per year',
    type: 'number',
    required: false,
    placeholder: '260',
    validation: { min: 1 },
  },
  {
    id: 'nonBillableDays',
    label: 'Non-billable days (vacation/admin/marketing)',
    type: 'number',
    required: false,
    placeholder: '20',
    validation: { min: 0 },
  },
  {
    id: 'hoursPerDay',
    label: 'Hours per billable day',
    type: 'number',
    required: false,
    placeholder: '8',
    validation: { min: 0.5 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'dayRate',
    label: 'Recommended day rate',
    type: 'currency',
    description: 'Free freelance day rate calculator 2026: Income target + expenses, divided by your billable days. Get instant results. No signup - try it free now!',
  },
  {
    id: 'halfDayRate',
    label: 'Half-day rate',
    type: 'currency',
    description: 'Day rate ÷ 2 (common convention — adjust to taste).',
  },
  {
    id: 'hourlyRate',
    label: 'Hourly equivalent',
    type: 'currency',
    description: 'Day rate divided by your hours per billable day.',
  },
  {
    id: 'billableDays',
    label: 'Billable days per year',
    type: 'number',
    description: 'Working days minus non-billable days.',
  },
  {
    id: 'assumptions',
    label: 'Assumptions & notes',
    type: 'list',
    description: 'Planning notes, e.g. when expenses were entered as 0.',
  },
];

export const content: ToolContent = {
  title: 'Freelance Day Rate Calculator',
  description:
    'Calculate your freelance day rate from your income target, expenses, and billable days — free, no signup. Get your recommended rate and hourly equivalent now!',
  howTo: [
    'Enter your annual income target — the take-home amount you want to earn.',
    'Add your annual business expenses (tools, insurance, software); enter 0 if you have none.',
    'Set working days per year (defaults to 260) and your non-billable days for vacation, admin, and marketing.',
    'Adjust hours per billable day (defaults to 8) to tune the hourly equivalent.',
    'Run the calculator and copy your recommended day rate, half-day rate, and hourly equivalent.',
  ],
  methodology:
    'billableDays = workingDaysPerYear − nonBillableDays; dayRate = (annualIncomeTarget + annualBusinessExpenses) ÷ billableDays; halfDayRate = dayRate ÷ 2; hourlyRate = dayRate ÷ hoursPerDay (default 8). Money values round to the nearest cent. Every input is yours — the tool contains no market pricing data, so the result is a planning estimate, not what clients will pay.',
  examples: [
    {
      title: 'Solo designer',
      inputs: {
        annualIncomeTarget: 60000,
        annualBusinessExpenses: 6000,
        workingDaysPerYear: 260,
        nonBillableDays: 40,
        hoursPerDay: 8,
      },
      note: '66000 ÷ 220 billable days = $300.00/day; half-day $150.00; hourly $37.50.',
    },
    {
      title: 'No-expense subcontractor',
      inputs: {
        annualIncomeTarget: 90000,
        annualBusinessExpenses: 0,
        workingDaysPerYear: 260,
        nonBillableDays: 30,
        hoursPerDay: 7,
      },
      note: 'Expenses of 0 are flagged — the rate covers the income target only.',
    },
    {
      title: 'Photographer, 4-day weeks',
      inputs: {
        annualIncomeTarget: 75000,
        annualBusinessExpenses: 12000,
        workingDaysPerYear: 208,
        nonBillableDays: 25,
        hoursPerDay: 10,
      },
      note: 'Custom working days and a 10-hour day change the hourly equivalent.',
    },
  ],
  faqs: [
    {
      question: 'What is the best freelance day rate calculator?',
      answer:
        'The best freelance day rate calculator uses your own numbers — income target, expenses, and real billable days — instead of guessing from market averages. This one does exactly that: enter your figures and it returns a day rate, half-day rate, and hourly equivalent you can quote with confidence.',
    },
    {
      question: 'Is there a free freelance day rate calculator?',
      answer:
        'Yes — this freelance day rate calculator is completely free with no signup. Enter your income target, expenses, working days, and non-billable days, and get your recommended day rate instantly.',
    },
    {
      question: 'How to calculate freelance day rate?',
      answer:
        'Add your annual income target to your annual business expenses, then divide by your billable days (working days minus vacation, admin, and marketing days). That gives your day rate. This tool runs that exact formula and also derives half-day and hourly equivalents.',
    },
    {
      question: 'How does the freelance day rate calculator work?',
      answer:
        'Enter your details using the inputs above and the freelance day rate calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the freelance day rate calculator free to use?',
      answer:
        'Yes - this freelance day rate calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a freelance day rate calculator?',
      answer:
        'A freelance day rate calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the freelance day rate calculator?',
      answer:
        'No account needed. Open the freelance day rate calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Based entirely on YOUR inputs — not market data, and no guarantee of what clients will pay.',
    'Half-day rate uses the common dayRate ÷ 2 convention; many freelancers charge 60% instead.',
    'Unpaid time is only covered if you excluded it from your billable days.',
    'ESTIMATE: a planning starting point, not a pricing guarantee.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Freelance Day Rate Calculator 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free freelance day rate calculator 2026: Income target + expenses, divided by your billable days. Get instant results. No signup - try it free now!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Creator Business',
          item: 'https://husnainblogger.com/tools/creator-business/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Freelance Day Rate Calculator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
