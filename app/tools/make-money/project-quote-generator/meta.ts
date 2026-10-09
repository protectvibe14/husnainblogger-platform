import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'estimatedHours',
    label: 'Estimated hours',
    type: 'number',
    required: true,
    placeholder: 'e.g. 20',
    validation: { min: 0.01, max: 1000000000, unit: 'hours' },
  },
  {
    id: 'hourlyRate',
    label: 'Hourly rate (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 50',
    validation: { min: 0.01, max: 1000000000, unit: 'USD' },
  },
  {
    id: 'materialCosts',
    label: 'Material / pass-through costs (optional)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 150',
    validation: { min: 0, max: 1000000000, unit: 'USD' },
  },
  {
    id: 'marginPercent',
    label: 'Profit margin % (optional)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 20',
    validation: { min: 0, max: 10000, unit: 'percent' },
  },
  {
    id: 'rushMultiplier',
    label: 'Rush multiplier (optional, default 1)',
    type: 'number',
    required: false,
    placeholder: '1 (e.g. 1.5 for a rush fee)',
    validation: { min: 1, max: 1000000000 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'subtotal', label: 'Subtotal', type: 'currency' },
  { id: 'quoteTotal', label: 'Quote total', type: 'currency' },
  { id: 'lineItems', label: 'Quote line items', type: 'list' },
  { id: 'warning', label: 'Sanity warning', type: 'text' },
];

const DESCRIPTION =
  'Price projects with confidence using this free freelance project quote calculator — enter hours, rate, costs, and margin for an itemized quote. Try it now.';

export const content: ToolContent = {
  title: 'Freelance Project Quote Calculator',
  description: DESCRIPTION,
  howTo: [
    'Enter your estimated hours for the project and your hourly rate in USD.',
    'Add any material or pass-through costs (stock, licenses, subcontractors) — they are quoted at cost.',
    'Set your profit margin percent to price above your raw cost.',
    'Add a rush multiplier (e.g. 1.5) only when the client agrees to a rush fee — leave it at 1 for normal timelines.',
    'Run the calculation to get the subtotal, the quote total, and a line-item quote document you can paste into your proposal.',
    'Heed the sanity warning if the rush multiplier looks unusually high before sending the quote.',
  ],
  methodology:
    'This is pure cost-plus-margin arithmetic with no AI: subtotal = estimated hours × hourly rate + material costs, and quote total = subtotal × (1 + margin %) × rush multiplier. The quote document is simply a formatted view of these computed numbers — one line per component. Rush multipliers above 5 trigger a sanity warning rather than an error, because the quote still computes correctly.',
  examples: [
    {
      title: '20-hour project with margin',
      inputs: { estimatedHours: 20, hourlyRate: 50, materialCosts: 150, marginPercent: 20 },
      note: 'Subtotal $1,150.00; margin $230.00; quote total $1,380.00.',
    },
    {
      title: 'Rush project',
      inputs: { estimatedHours: 10, hourlyRate: 75, rushMultiplier: 1.5 },
      note: 'Subtotal $750.00; rush fee $375.00; quote total $1,125.00.',
    },
  ],
  faqs: [
    {
      question: 'What is the best freelance project quote calculator?',
      answer:
        'The best one shows its work: a line-item breakdown of labor, materials, margin, and any rush fee — not just a final number. This free calculator outputs exactly that itemized quote document so you can defend the price to clients.',
    },
    {
      question: 'Is there a free freelance project quote calculator?',
      answer:
        'Yes — this freelance project quote calculator is completely free with no signup. Enter your hours, rate, and costs to generate an itemized quote instantly.',
    },
    {
      question: 'How to calculate freelance project quote?',
      answer:
        'Multiply your estimated hours by your hourly rate, add material and pass-through costs for a subtotal, add your profit margin percentage, then multiply by a rush multiplier only if the client agreed to a rush fee. The result is your quote total.',
    },
    {
      question: 'How does the freelance project quote calculator work?',
      answer:
        'Enter your details using the inputs above and the freelance project quote calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the freelance project quote calculator free to use?',
      answer:
        'Yes - this freelance project quote calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a freelance project quote calculator?',
      answer:
        'A freelance project quote calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the freelance project quote calculator?',
      answer:
        'No account needed. Open the freelance project quote calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Core is pricing math — the quote document is a formatted view of computed numbers, verified as calculator-first.',
    'The quote is an estimate based on YOUR hour/rate estimates; underestimate your hours and the quote underprices the work.',
    'Materials are quoted at cost — add your own markup into the margin percent if you mark materials up.',
    'Rush multipliers above 5 trigger a sanity warning (the quote still computes).',
    'All amounts are USD; no market data or competitor pricing is used.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Freelance Project Quote Calculator 2026 | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/project-quote-generator/',
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
          name: 'Freelance Project Quote Calculator',
          item: 'https://husnainblogger.com/tools/make-money/project-quote-generator/',
        },
      ],
    },
  ],
};
