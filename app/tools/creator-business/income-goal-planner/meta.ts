import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/income-goal-planner/';
const DESCRIPTION =
  'Freelance income goal planner: enter your income target, expenses, and average client value to get monthly and weekly targets. Free — try it now!';

export const inputs: ToolInput[] = [
  {
    id: 'annualIncomeGoal',
    label: 'Annual income goal (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 60000',
    validation: { min: 0 },
  },
  {
    id: 'annualExpenses',
    label: 'Annual business expenses (USD)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 12000 (optional)',
    validation: { min: 0 },
  },
  {
    id: 'avgClientValue',
    label: 'Average client value per month (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 1500',
    validation: { min: 0 },
  },
  {
    id: 'workWeeksPerYear',
    label: 'Working weeks per year',
    type: 'number',
    required: false,
    placeholder: '1–52 (default: 48)',
    validation: { min: 1, max: 52 },
  },
  {
    id: 'currentIncomeAnnual',
    label: 'Current annual income (USD)',
    type: 'number',
    required: false,
    placeholder: 'optional — to see your gap',
    validation: { min: 0 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'requiredMonthlyRevenue', label: 'Required monthly revenue', type: 'currency' },
  { id: 'clientsNeededPerMonth', label: 'Clients needed per month', type: 'number' },
  { id: 'weeklyTarget', label: 'Weekly revenue target', type: 'currency' },
  {
    id: 'gapVsCurrent',
    label: 'Gap vs current income',
    type: 'text',
    description: 'Yearly and monthly gap to your goal, or a prompt to enter your current income.',
  },
];

export const content: ToolContent = {
  title: 'Freelance Income Goal Planner',
  description: DESCRIPTION,
  howTo: [
    'Enter your annual income goal and your average client value per month (both required).',
    'Add your annual business expenses (optional — they are added on top of your goal).',
    'Set your working weeks per year, or leave it at the default 48.',
    'Optionally enter your current annual income to see the gap you need to close.',
    'Run the tool to get your required monthly revenue, clients needed per month, and weekly target.',
  ],
  methodology:
    'This tool runs division and multiplication on your own numbers only: (annual goal + annual expenses) ÷ 12 = required monthly revenue; monthly revenue ÷ average client value = clients needed per month; gross target ÷ working weeks = weekly target. Results are plan math from your targets — not market data and not an earnings promise.',
  examples: [
    {
      title: 'Freelancer targeting $60k',
      inputs: { annualIncomeGoal: 60000, annualExpenses: 12000, avgClientValue: 1500, workWeeksPerYear: 48 },
      note: 'Gross target $72,000 → $6,000/month, 4 clients/month at $1,500 each, $1,500/week.',
    },
    {
      title: 'Designer with a current income',
      inputs: { annualIncomeGoal: 90000, annualExpenses: 6000, avgClientValue: 3000, currentIncomeAnnual: 72000 },
      note: 'Gross target $96,000 → $8,000/month, ~2.7 clients/month, plus a $24,000 yearly gap to close.',
    },
  ],
  faqs: [
    {
      question: 'What is the best freelance income goal planner?',
      answer:
        'The best planner breaks a yearly goal into monthly revenue and client counts using your own numbers. This free planner does exactly that arithmetic — the targets come from you, not from market data, so any goal is only as realistic as the inputs behind it.',
    },
    {
      question: 'Is there a free freelance income goal planner?',
      answer:
        'Yes — this planner is completely free with no signup. Everything is calculated in your browser from the numbers you type; nothing is stored or sent anywhere.',
    },
    {
      question: 'How to plan freelance income goal?',
      answer:
        'Start with a gross annual target (your goal plus business expenses), divide by 12 for monthly revenue, then divide by your average client value to get clients needed per month. This tool runs that exact math and adds a weekly target based on your working weeks per year.',
    },
    {
      question: 'How does a freelance income goal planner work?',
      answer:
        'It divides and multiplies your inputs: (annual goal + annual expenses) ÷ 12 = monthly revenue target; monthly revenue ÷ average client value = clients per month; total ÷ working weeks = weekly target. The outputs are plan math, not an earnings promise.',
    },
    {
      question: 'How does the freelance income goal planner work?',
      answer:
        'Enter your details using the inputs above and the freelance income goal planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the freelance income goal planner free to use?',
      answer:
        'Yes - this freelance income goal planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a freelance income goal planner?',
      answer:
        'A freelance income goal planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'All outputs are arithmetic on your own targets — not market data and not an earnings promise.',
    'Working weeks default to 48 (about 4 weeks off) if you skip that field.',
    'Taxes, platform fees, and unpaid time are not modeled — treat the target as pre-tax gross unless your numbers say otherwise.',
    'Average client value is your average per client per month; results scale linearly with it.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Freelance Income Goal Planner 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
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
          name: 'Creator Business Tools',
          item: 'https://husnainblogger.com/tools/creator-business/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Income Goal Planner',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
