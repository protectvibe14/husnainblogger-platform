import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'emailListSize',
    label: 'Email list size',
    type: 'number',
    required: true,
    placeholder: 'e.g. 5000',
    validation: { min: 1 },
  },
  {
    id: 'openRate',
    label: 'Email open rate (%)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 30',
    validation: { min: 0, max: 100, unit: '%' },
  },
  {
    id: 'salesConversionRate',
    label: 'Open-to-sale conversion rate (%)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 2 — your own number, no benchmark provided',
    validation: { min: 0, max: 100, unit: '%' },
  },
  {
    id: 'coursePrice',
    label: 'Course price (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 99',
    validation: { min: 0.01, unit: 'USD' },
  },
  {
    id: 'refundRate',
    label: 'Refund rate (%)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 5',
    validation: { min: 0, max: 100, unit: '%' },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'projectedBuyers', label: 'Projected buyers', type: 'number' },
  { id: 'grossRevenue', label: 'Gross revenue', type: 'currency' },
  { id: 'netRevenue', label: 'Net revenue (after refunds)', type: 'currency' },
  { id: 'funnelSteps', label: 'Funnel breakdown', type: 'table' },
  { id: 'projectionLabel', label: 'Projection disclaimer', type: 'text' },
];

const DESCRIPTION =
  'Estimate your course launch revenue from list size, open rate, and conversion with this free course launch calculator. Scenario math — plan your launch now.';

export const content: ToolContent = {
  title: 'Course Launch Calculator',
  description: DESCRIPTION,
  howTo: [
    'Enter your email list size (whole number of subscribers you will email).',
    'Enter your expected email open rate as a percent — use your own past launches, not a benchmark.',
    'Enter your open-to-sale conversion rate as a percent — again, your own number; the tool provides no "typical" rate.',
    'Enter your course price in USD and your expected refund rate as a percent.',
    'Read the funnel table (list → opens → buyers → gross → net) as a scenario projection, not a prediction.',
  ],
  methodology:
    'Pure arithmetic on your inputs: projected buyers = list size × open rate ÷ 100 × conversion rate ÷ 100 (rounded to an integer); gross revenue = buyers × course price; net revenue = gross × (1 − refund rate ÷ 100). Money rounds half-up to 2 decimals. The tool invents no benchmarks — every conversion number is user-entered — and results are labeled scenario projections, never predictions or guarantees.',
  examples: [
    {
      title: '5,000-subscriber launch at $99',
      inputs: { emailListSize: 5000, openRate: 30, salesConversionRate: 2, coursePrice: 99, refundRate: 5 },
      note: 'Projects 30 buyers, $2,970 gross, $2,821.50 net with the full funnel table.',
    },
    {
      title: 'Small warm list, higher conversion',
      inputs: { emailListSize: 1200, openRate: 45, salesConversionRate: 4, coursePrice: 249, refundRate: 3 },
      note: 'A smaller list with better conversion can beat a big cold list — compare scenarios.',
    },
  ],
  faqs: [
    {
      question: 'What is the best course launch calculator?',
      answer:
        'The best one is transparent about its inputs: this free course launch calculator runs pure funnel math on YOUR list size, open rate, conversion, and refund numbers — it never invents "typical" launch benchmarks. That honesty makes the projection something you can actually trust and adjust.',
    },
    {
      question: 'Is there a free course launch calculator?',
      answer:
        'Yes — this course launch calculator is completely free with no signup. Enter your list size, open rate, conversion rate, price, and refund rate to see projected buyers, gross, and net revenue instantly.',
    },
    {
      question: 'How to calculate course launch revenue?',
      answer:
        'Multiply your list by your open rate to get opens, multiply opens by your conversion rate to get buyers, multiply buyers by price for gross, then subtract refunds for net. This planner does that math for you and shows each funnel stage in a table.',
    },
    {
      question: 'What conversion rate should I enter in a course launch calculator?',
      answer:
        'Your own historical number — we deliberately provide no "typical" benchmark because launches vary enormously. If you have never launched, run several scenarios (pessimistic, realistic, optimistic) and treat each as a projection, not a prediction.',
    },
    {
      question: 'How does the course launch calculator work?',
      answer:
        'Enter your details using the inputs above and the course launch calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the course launch calculator free to use?',
      answer:
        'Yes - this course launch calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a course launch calculator?',
      answer:
        'A course launch calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Conversion benchmarks are user-entered — the tool must not invent "typical" launch conversion rates.',
    'Open rate applies before conversion (funnel: list → opened → bought).',
    'Results are scenario projections on your inputs, not predictions or revenue guarantees.',
    'Buyers round to an integer; money rounds half-up to 2 decimals.',
    'Not financial advice.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Course Launch Calculator 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/course-launch-revenue-planner/',
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
          name: 'Course Launch Revenue Planner',
          item: 'https://husnainblogger.com/tools/make-money/course-launch-revenue-planner/',
        },
      ],
    },
  ],
};
