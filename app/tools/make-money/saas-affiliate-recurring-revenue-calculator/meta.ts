import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'referralsPerMonth',
    label: 'New referrals per month',
    type: 'number',
    required: true,
    placeholder: 'e.g. 10',
    validation: { min: 1 },
  },
  {
    id: 'avgPlanPrice',
    label: 'Average plan price (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 49',
    validation: { min: 0.01, unit: 'USD' },
  },
  {
    id: 'commissionRate',
    label: 'Commission rate (percent)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 20',
    validation: { min: 0, max: 100, unit: '%' },
  },
  {
    id: 'recurringMonths',
    label: 'Recurring duration — months (your program cap)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 12',
    validation: { min: 1, max: 240 },
  },
  {
    id: 'churnRate',
    label: 'Monthly churn rate (percent)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 5',
    validation: { min: 0, max: 100, unit: '%' },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'monthlyRecurringCommission', label: 'Monthly recurring commission', type: 'currency' },
  { id: 'totalCommission', label: 'Total commission (recurring window)', type: 'currency' },
  { id: 'projectedAnnual', label: 'Projected annual commission', type: 'currency' },
  { id: 'disclaimer', label: 'Honesty disclaimer', type: 'text' },
];

const DESCRIPTION =
  'Project earnings with this free SaaS affiliate calculator — model referrals, plan price, commission rate, and churn into monthly recurring revenue estimates.';

export const content: ToolContent = {
  title: 'SaaS Affiliate Calculator 2026 – Free | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Enter your new referrals per month — a whole number greater than 0.',
    'Enter the average plan price in USD and your commission rate as a percent (check your actual program terms; 15–30% is a typical 2026 range, not a guarantee).',
    'Enter the recurring duration in months — the cap your program pays recurring commissions for.',
    'Enter the monthly churn rate as a percent (0–100) so older cohorts decay realistically.',
    'Run the calculation to see the stacked monthly commission, the total over the recurring window, and the projected annual figure.',
  ],
  methodology:
    'The tool models a cohort stream: each month adds a new cohort worth referrals × plan price × commission rate, and every cohort decays by (1 − churn)^t each month until the program\'s recurring-month cap. It sums the stacked months over a horizon of max(12, recurring months). All inputs are user-supplied — there is no program-specific data and no live lookup.',
  examples: [
    {
      title: 'Mid-tier SaaS program',
      inputs: { referralsPerMonth: 10, avgPlanPrice: 100, commissionRate: 20, recurringMonths: 12, churnRate: 5 },
      note: 'With zero churn the math stacks linearly; with 5% monthly churn each older cohort contributes a little less every month.',
    },
    {
      title: 'Low-churn annual program',
      inputs: { referralsPerMonth: 5, avgPlanPrice: 49, commissionRate: 30, recurringMonths: 24, churnRate: 2 },
      note: 'A longer recurring cap and lower churn keep older cohorts paying longer, raising the stacked monthly figure.',
    },
  ],
  faqs: [
    {
      question: 'What is the best saas affiliate calculator?',
      answer:
        'The best calculator is one that models churn and a recurring cap instead of simple multiplication, because real SaaS revenue compounds monthly. This free tool builds a monthly cohort stream from your own inputs — just remember the output is only as accurate as the rate, churn, and volume you enter.',
    },
    {
      question: 'Is there a free saas affiliate calculator?',
      answer:
        'Yes — this calculator is completely free with no signup. Enter your referrals, plan price, commission rate, recurring duration, and churn to get monthly, total, and annual projections instantly.',
    },
    {
      question: 'How to calculate saas affiliate?',
      answer:
        'Take your monthly referrals × average plan price × commission rate to get one cohort\'s first-month commission, then stack a new cohort each month while shrinking older ones by your churn rate. This tool does the full month-by-month math for you.',
    },
    {
      question: 'How does a saas affiliate calculator work?',
      answer:
        'This calculator runs a cohort model: each month\'s new referrals form a cohort that pays plan price × commission rate, decaying by (1 − churn) per month until your program\'s recurring cap. It sums the active cohorts month by month over the projection horizon.',
    },
    {
      question: 'How does the saas affiliate calculator work?',
      answer:
        'Enter your details using the inputs above and the saas affiliate calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the saas affiliate calculator free to use?',
      answer:
        'Yes - this saas affiliate calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a saas affiliate calculator?',
      answer:
        'A saas affiliate calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Every value — rate, churn, referrals, plan price, duration — is user-entered; the tool holds no program-specific data.',
    '15–30% software affiliate rates are a typical 2026 range (classification-level estimate), not a promise — per-program terms vary widely and the rate is user-editable.',
    'Assumes constant referrals and smooth monthly churn: no seasonality, refunds, upgrades, downgrades, or plan changes.',
    'The program\'s recurring cap is user-entered; some programs pay one-time only or cap recurring months.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'SaaS Affiliate Calculator 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/saas-affiliate-recurring-revenue-calculator/',
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
          name: 'Make Money Tools',
          item: 'https://husnainblogger.com/tools/make-money/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'SaaS Affiliate Recurring Revenue Calculator',
          item: 'https://husnainblogger.com/tools/make-money/saas-affiliate-recurring-revenue-calculator/',
        },
      ],
    },
  ],
};
