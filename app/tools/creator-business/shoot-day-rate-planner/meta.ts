import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/shoot-day-rate-planner/';

export const inputs: ToolInput[] = [
  {
    id: 'annualIncomeTarget',
    label: 'Annual income target (USD)',
    type: 'number',
    required: true,
    placeholder: '120000',
    validation: { min: 0 },
  },
  {
    id: 'shootDaysPerYear',
    label: 'Shoot days per year',
    type: 'number',
    required: true,
    placeholder: '100',
    validation: { min: 1 },
  },
  {
    id: 'annualExpenses',
    label: 'Annual business expenses (USD)',
    type: 'number',
    required: false,
    placeholder: '20000',
    validation: { min: 0 },
  },
  {
    id: 'assistantCostsPerShoot',
    label: 'Assistant costs per shoot (USD)',
    type: 'number',
    required: false,
    placeholder: '150',
    validation: { min: 0 },
  },
  {
    id: 'gearRentalPerShoot',
    label: 'Gear rental per shoot (USD)',
    type: 'number',
    required: false,
    placeholder: '100',
    validation: { min: 0 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'recommendedShootDayRate',
    label: 'Recommended shoot day rate',
    type: 'currency',
    description: 'Free photography day rate calculator 2026: Your target day rate, from your own numbers (estimate, not market data). Fast, private, no signup - try it now!',
  },
  {
    id: 'perShootCostBreakdown',
    label: 'Per-shoot cost breakdown',
    type: 'table',
    description: 'How the day rate is built from the day-rate share plus per-shoot costs.',
  },
  {
    id: 'annualCapacityCheck',
    label: 'Annual capacity check',
    type: 'text',
    description: 'Whether your planned shoot days cover income target, expenses, and shoot costs.',
  },
];

export const content: ToolContent = {
  title: 'Photography Day Rate Calculator 2026 – Free | HusnainBlogger',
  description:
    'Photography day rate calculator: enter your income target, expenses, and per-shoot costs for a free instant estimate. No signup — try it now!',
  howTo: [
    'Enter your "Annual income target" — the take-home pay you want from photography this year.',
    'Enter your "Shoot days per year" — only the days you can actually book and bill.',
    'Add "Annual business expenses" (insurance, software, travel) and your per-shoot "Assistant costs" and "Gear rental".',
    'Run the tool to get your recommended shoot day rate plus a per-shoot cost breakdown.',
    'Read the "Annual capacity check" to confirm your planned shoot days cover everything.',
  ],
  methodology:
    'This tool divides your annual income target plus annual expenses by your shoot days per year to get a base day rate, then adds your per-shoot assistant and gear costs on top — a published arithmetic formula with no market-rate data involved. The result reflects only the numbers you enter, so it is an estimate of what you need to charge, not what clients will pay.',
  examples: [
    {
      title: 'Solo portrait photographer',
      inputs: {
        annualIncomeTarget: 60000,
        shootDaysPerYear: 120,
        annualExpenses: 12000,
        assistantCostsPerShoot: 0,
        gearRentalPerShoot: 50,
      },
      note: 'No assistant; gear rental of $50 per shoot is added to the base day rate of $600.',
    },
    {
      title: 'Commercial shooter with crew',
      inputs: {
        annualIncomeTarget: 150000,
        shootDaysPerYear: 80,
        annualExpenses: 30000,
        assistantCostsPerShoot: 250,
        gearRentalPerShoot: 200,
      },
      note: 'Higher per-shoot costs push the recommended day rate above the $2,250 base.',
    },
    {
      title: 'Minimal inputs',
      inputs: { annualIncomeTarget: 80000, shootDaysPerYear: 100 },
      note: 'Expenses and per-shoot costs default to $0, so the rate is simply target ÷ shoot days.',
    },
  ],
  faqs: [
    {
      question: 'What is the best photography day rate calculator?',
      answer:
        'The best one uses your own numbers — income target, expenses, shoot days, and per-shoot costs — instead of guessing from market averages. This tool does exactly that: it computes the day rate you personally need to charge, free and without signup.',
    },
    {
      question: 'Is there a free photography day rate calculator?',
      answer:
        'Yes — this photography day rate calculator is completely free with no signup. Enter your targets and costs and you get a recommended day rate, a cost breakdown, and an annual capacity check instantly.',
    },
    {
      question: 'How to calculate photography day rate?',
      answer:
        'Add your annual income target and annual business expenses, divide by the number of shoot days you can realistically book per year, then add per-shoot costs like assistants and gear rental. The result is the day rate you need to charge to hit your target — this tool does the math for you.',
    },
    {
      question: 'How does the photography day rate calculator work?',
      answer:
        'Enter your details using the inputs above and the photography day rate calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the photography day rate calculator free to use?',
      answer:
        'Yes - this photography day rate calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a photography day rate calculator?',
      answer:
        'A photography day rate calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the photography day rate calculator?',
      answer:
        'No account needed. Open the photography day rate calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'ESTIMATE: the result is based entirely on your own inputs — it is not market data and does not say what clients in your area will pay.',
    'Per-shoot costs (assistant, gear rental) are assumed to be billed to the client on top of the base day rate.',
    'The annual capacity check assumes every planned shoot day gets booked and paid; unpaid days, cancellations, and taxes are not modeled.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Photography Day Rate Calculator 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free photography day rate calculator 2026: Your target day rate, from your own numbers (estimate, not market data). Fast, private, no signup - try it now!',
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
          name: 'Shoot Day-Rate Planner',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
