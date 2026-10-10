import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'monthlySessions',
    label: 'Monthly sessions',
    type: 'number',
    required: false,
    placeholder: 'e.g. 100000',
    validation: { min: 0 },
  },
  {
    id: 'rpm',
    label: 'Ad RPM (USD)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 25',
    validation: { min: 0 },
  },
  {
    id: 'affiliateRevenue',
    label: 'Affiliate revenue (USD/month)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 800',
    validation: { min: 0 },
  },
  {
    id: 'productRevenue',
    label: 'Product revenue (USD/month)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 300',
    validation: { min: 0 },
  },
  {
    id: 'sponsoredRevenue',
    label: 'Sponsored revenue (USD/month)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 400',
    validation: { min: 0 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'totalMonthlyIncome', label: 'Total monthly income (estimate)', type: 'currency' },
  { id: 'annualProjection', label: 'Annual projection (estimate)', type: 'currency' },
  { id: 'incomeBreakdown', label: 'Income mix by stream', type: 'table' },
  { id: 'guidance', label: 'Planner guidance', type: 'text' },
];

const DESCRIPTION =
  'Turn traffic into revenue with this blog income calculator — model RPM, affiliates, and digital products against your monthly sessions. Tie traffic.';

export const content: ToolContent = {
  title: 'Blog Income Calculator',
  description: DESCRIPTION,
  howTo: [
    'Enter your Monthly sessions and Ad RPM — the tool computes display-ad income as sessions × RPM ÷ 1000.',
    'Add your Affiliate revenue, Product revenue, and Sponsored revenue per month — enter real numbers, not guesses, when you have them.',
    'Leave any stream blank if it does not apply; blank fields count as $0.',
    'Read the income mix table: each stream\'s monthly amount and its share of total income.',
    'Check the annual projection and the guidance note naming your biggest stream — then re-run with higher traffic to model growth scenarios.',
  ],
  methodology:
    'Pure client-side arithmetic on your inputs: ad income = monthly sessions × RPM ÷ 1000; total monthly income = ad income + affiliate + product + sponsored revenue; the annual projection is a straight ×12 of the monthly total; each stream\'s share = stream ÷ total × 100. The tool does arithmetic, not forecasting — revenue figures other than ad income are entered by you, never predicted, and all results are labeled estimates.',
  examples: [
    {
      title: '100k sessions + three side streams',
      inputs: {
        monthlySessions: 100000,
        rpm: 25,
        affiliateRevenue: 800,
        productRevenue: 300,
        sponsoredRevenue: 400,
      },
      note: 'Ad income $2,500 + $800 + $300 + $400 = $4,000/month total, $48,000/year projected; display ads are 62.5% of the mix.',
    },
    {
      title: 'Affiliate-first blog, no ad traffic yet',
      inputs: { affiliateRevenue: 1200, sponsoredRevenue: 500 },
      note: 'Total $1,700/month with affiliate revenue as the biggest stream — ads contribute $0 until sessions are entered.',
    },
  ],
  faqs: [
    {
      question: 'What is the best blog income calculator?',
      answer:
        'One that covers more than ads — affiliate, product, and sponsored income matter as much as RPM math. This free planner combines display-ad income (sessions × RPM ÷ 1000) with your entered affiliate, product, and sponsored revenue, then shows the income mix and a straight ×12 annual projection.',
    },
    {
      question: 'Is there a free blog income calculator?',
      answer:
        'Yes — this planner is completely free with no signup. It runs entirely in your browser: your traffic and revenue numbers are used only for the math and never leave your device.',
    },
    {
      question: 'How does the blog income calculator work?',
      answer:
        'Enter your details using the inputs above and the blog income calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the blog income calculator free to use?',
      answer:
        'Yes - this blog income calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a blog income calculator?',
      answer:
        'A blog income calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the blog income calculator?',
      answer:
        'No account needed. Open the blog income calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
    {
      question: 'How accurate is the blog income calculator?',
      answer:
        'The blog income calculator uses transparent arithmetic on the values you enter - what you see is exactly what the math produces. Always double-check critical numbers against official sources, as rates and rules can change.',
    },
  ],
  assumptions: [
    'All revenue figures except ad income are user-entered; the tool performs arithmetic, not forecasting, and every result is labeled an estimate.',
    'The annual projection is a straight ×12 of the monthly total — it does not model traffic growth, seasonality, or rate changes.',
    'Ad income assumes every session serves ads; invalid traffic and ad blockers are ignored.',
  ],
  jsonLd: [],
};
