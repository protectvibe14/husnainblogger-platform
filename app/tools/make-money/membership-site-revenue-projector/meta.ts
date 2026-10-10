import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'monthlyVisitors',
    label: 'Monthly visitors',
    type: 'number',
    required: true,
    placeholder: 'e.g. 10000',
    validation: { min: 1 },
  },
  {
    id: 'conversionRate',
    label: 'Visitor-to-member conversion rate (%)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 2',
    validation: { min: 0, max: 100 },
  },
  {
    id: 'monthlyPrice',
    label: 'Membership price per month (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 20',
    validation: { min: 0.01 },
  },
  {
    id: 'churnRate',
    label: 'Monthly churn rate (%)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 5',
    validation: { min: 0, max: 100 },
  },
  {
    id: 'months',
    label: 'Projection horizon (months)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 12',
    validation: { min: 1, max: 120 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'projectedMRR', label: 'Projected MRR at final month (projection)', type: 'currency' },
  { id: 'projectedMembers', label: 'Projected members at final month', type: 'number' },
  { id: 'annualProjection', label: 'Total projected revenue over horizon', type: 'currency' },
  { id: 'monthlyTable', label: 'Month-by-month projection', type: 'table' },
];

export const content: ToolContent = {
  title: 'Membership Site Revenue Calculator',
  description:
    'Project your community income with this free membership site revenue calculator — model signups, churn, and MRR month by month. Start projecting now.',
  howTo: [
    'Enter your monthly visitors \u2014 the traffic your membership offer actually receives.',
    'Enter your visitor-to-member conversion rate as a percent (start with 1\u20133% if you have no data).',
    'Enter your membership price per month in USD and your expected monthly churn rate as a percent.',
    'Choose a projection horizon in months (up to 120) and run the projection.',
    'Read the month-by-month table: churn compounds, so growth decelerates \u2014 treat the result as a scenario, not a forecast.',
  ],
  methodology:
    'Pure arithmetic on your inputs, run month by month: each month adds monthly visitors \u00d7 conversion rate as new members, shrinks last month\u2019s members by the churn rate (churn compounds, so the line decays instead of rising forever), and multiplies members by price for MRR. These are projections from your assumptions, not predictions \u2014 real memberships fluctuate with seasonality, promos, and pricing changes.',
  examples: [
    {
      title: '10k visitors, 2% convert, 5% churn',
      inputs: { monthlyVisitors: 10000, conversionRate: 2, monthlyPrice: 20, churnRate: 5, months: 12 },
      note: 'Ends month 12 with about 1,839 members and $36,771 MRR \u2014 growth visibly slows as churn compounds against a larger base.',
    },
    {
      title: 'High-churn scenario',
      inputs: { monthlyVisitors: 5000, conversionRate: 3, monthlyPrice: 15, churnRate: 15, months: 12 },
      note: 'Shows how 15% monthly churn flattens the curve: the community plateaus near 1,000 members instead of compounding.',
    },
  ],
  faqs: [
    {
      question: 'What is the best membership site revenue calculator?',
      answer:
        'The best membership site revenue calculator compounds churn month by month instead of drawing a flat line, so you see growth decelerate toward a ceiling. This free tool does that cohort math and shows every month in a table \u2014 remember the output is a projection of your assumptions, not a prediction.',
    },
    {
      question: 'Is there a free membership site revenue calculator?',
      answer:
        'Yes \u2014 this membership site revenue calculator is completely free with no signup. Enter visitors, conversion rate, price, churn, and horizon to get projected MRR, member counts, and a month-by-month table.',
    },
    {
      question: 'How to calculate membership site revenue?',
      answer:
        'Multiply monthly visitors by your conversion rate for new signups each month, reduce the existing member base by your churn rate (compounding monthly), and multiply total members by price for MRR. This tool runs that exact month-by-month calculation for you.',
    },
    {
      question: 'How does the membership site revenue calculator work?',
      answer:
        'Enter your details using the inputs above and the membership site revenue calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the membership site revenue calculator free to use?',
      answer:
        'Yes - this membership site revenue calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a membership site revenue calculator?',
      answer:
        'A membership site revenue calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the membership site revenue calculator?',
      answer:
        'No account needed. Open the membership site revenue calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Projections are scenario math on user-entered assumptions \u2014 conversion and churn are guesses, not forecasts; real results vary with seasonality, promos, and pricing changes.',
    'Churn compounds monthly: the projection shows cohort decay toward a ceiling, never a flat or ever-rising line.',
    'At 100% churn there are no retained members \u2014 each month\u2019s total is just that month\u2019s new signups.',
    'Horizon is capped at 120 months as a sanity guard; amounts are USD.',
  ],
  jsonLd: [
  ],
};
