import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'experienceLevel',
    label: 'Your experience level',
    type: 'select',
    required: true,
    options: ['entry', 'mid', 'senior'],
  },
  {
    id: 'deliverable',
    label: 'Deliverable type',
    type: 'select',
    required: true,
    options: ['logo', 'brand', 'social', 'print'],
  },
  {
    id: 'projectHours',
    label: 'Estimated project hours',
    type: 'number',
    required: true,
    placeholder: 'e.g. 12',
    validation: { min: 0 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'hourlyRateLow', label: 'Suggested hourly rate — low (estimate)', type: 'currency' },
  { id: 'hourlyRateHigh', label: 'Suggested hourly rate — high (estimate)', type: 'currency' },
  { id: 'projectTotalLow', label: 'Estimated project total — low', type: 'currency' },
  { id: 'projectTotalHigh', label: 'Estimated project total — high', type: 'currency' },
  { id: 'deliverableNote', label: 'Deliverable adjustment (estimate)', type: 'text' },
];

const DESCRIPTION =
  'Find fair freelance graphic design rates with this free graphic designer rates calculator. Choose your level and deliverable for an estimated hourly range.';

export const content: ToolContent = {
  title: 'Graphic Designer Rates Calculator 2027',
  description: DESCRIPTION,
  howTo: [
    'Choose your experience level: Entry (under ~2 years), Mid (2–5 years), or Senior (5+ years / art direction).',
    'Pick the deliverable type: logo, brand identity system, social media creatives, or print/collateral.',
    'Enter your estimated project hours, including concepts, revisions, and file prep.',
    'Run the calculator to see the estimated hourly range and project total — the deliverable type applies a labeled complexity factor.',
    'Use the range as a starting point and adjust for your portfolio strength, client size, and local market.',
  ],
  methodology:
    'The tool looks up two fixed tables in code: a base hourly band per experience level (Entry $30–$50, Mid $60–$95, Senior $110–$150) and a deliverable complexity factor (logo ×1.0, brand ×1.25, social ×0.85, print ×1.1 — 4 rows). The band is multiplied by the factor, then by your hours. There is no AI and no live market lookup. Every figure is a survey/market estimate, not an official or current rate.',
  examples: [
    {
      title: 'Mid-level designer, brand identity, 20 hours',
      inputs: { experienceLevel: 'mid', deliverable: 'brand', projectHours: 20 },
      note: 'Returns $75–$118.75/hr (mid band ×1.25) and a $1,500–$2,375 project total.',
    },
    {
      title: 'Entry-level designer, social creatives, 6 hours',
      inputs: { experienceLevel: 'entry', deliverable: 'social', projectHours: 6 },
      note: 'Returns $25.50–$42.50/hr (entry band ×0.85) and a $153–$255 project total.',
    },
  ],
  faqs: [
    {
      question: 'What is the best graphic designer rates calculator?',
      answer:
        'The best one shows a range and tells you where the numbers come from. This free calculator uses fixed benchmark bands per level ($30–$150/hr across levels) with a labeled deliverable complexity factor — always presented as survey estimates, never official rates.',
    },
    {
      question: 'Is there a free graphic designer rates calculator?',
      answer:
        'Yes — this calculator is completely free with no signup. Choose your experience level, deliverable type (logo, brand, social, or print), and hours to get an estimated rate range and project total.',
    },
    {
      question: 'How to calculate graphic designer rates?',
      answer:
        'Take your hourly rate (or a benchmark band for your level), adjust for the deliverable — a full brand identity costs more per hour than one-off social creatives — and multiply by your estimated hours. This tool applies those adjustments with labeled estimate factors so you can quote with confidence.',
    },
    {
      question: 'How does the graphic designer rates calculator work?',
      answer:
        'Enter your details using the inputs above and the graphic designer rates calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the graphic designer rates calculator free to use?',
      answer:
        'Yes - this graphic designer rates calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a graphic designer rates calculator?',
      answer:
        'A graphic designer rates calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the graphic designer rates calculator?',
      answer:
        'No account needed. Open the graphic designer rates calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Base bands (Entry $30–$50, Mid $60–$95, Senior $110–$150 per hour) and deliverable factors (logo ×1.0, brand ×1.25, social ×0.85, print ×1.1) are survey/market estimates — NOT official union or guild rates and NOT current verified market data.',
    'Results are starting-point estimates. Real rates vary by portfolio strength, client size, niche, and region.',
    'Usage rights, rush fees, and stock assets are not included — price those separately.',
    'All amounts are USD.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Graphic Designer Rates Calculator 2026 | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/graphic-designer-rate-calculator/',
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
          name: 'Graphic Designer Rate Calculator',
          item: 'https://husnainblogger.com/tools/make-money/graphic-designer-rate-calculator/',
        },
      ],
    },
  ],
};
