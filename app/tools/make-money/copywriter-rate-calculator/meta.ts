import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'experienceLevel',
    label: 'Experience level',
    type: 'select',
    required: true,
    options: ['beginner', 'intermediate', 'expert', 'specialist'],
  },
  {
    id: 'deliverable',
    label: 'Deliverable',
    type: 'select',
    required: true,
    options: ['per_word', 'per_hour', 'blog_post', 'sales_page'],
  },
  {
    id: 'wordCount',
    label: 'Word count (required for per-word; optional otherwise)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 1500',
    validation: { min: 1, max: 1000000000, unit: 'words' },
  },
  {
    id: 'nichePremium',
    label: 'Niche premium % (optional, e.g. finance)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 50',
    validation: { min: 0, max: 1000, unit: 'percent' },
  },
  {
    id: 'customRateLow',
    label: 'Custom rate low, USD (optional — overrides benchmarks)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 0.20',
    validation: { min: 0.01, max: 1000000000, unit: 'USD' },
  },
  {
    id: 'customRateHigh',
    label: 'Custom rate high, USD (optional — overrides benchmarks)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 0.40',
    validation: { min: 0.01, max: 1000000000, unit: 'USD' },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'rateRangeLow', label: 'Suggested range — low', type: 'currency' },
  { id: 'rateRangeHigh', label: 'Suggested range — high', type: 'currency' },
  { id: 'perWordRate', label: 'Per-word rate (estimate)', type: 'currency' },
  { id: 'note', label: 'Estimate note', type: 'text' },
];

const DESCRIPTION =
  'Charge what you\'re worth with this copywriter rates calculator — per-word, per-hour, and per-project pricing compared side by side. Benchmark against.';

export const content: ToolContent = {
  title: 'Copywriter Rates Calculator',
  description: DESCRIPTION,
  howTo: [
    'Select your experience level — beginner, intermediate, expert, or specialist.',
    'Select the deliverable: per_word, per_hour, blog_post, or sales_page.',
    'Enter the word count when pricing per word (required there); for flat deliverables it is optional and produces a per-word equivalent.',
    'Optionally add a niche premium percent — specialized niches like finance or medical commonly command higher rates.',
    'Optionally enter your own custom low/high rates to override the benchmark band with rates you trust.',
    'Run the calculation to get a suggested rate range — every figure is a labeled survey estimate, not an official rate.',
  ],
  methodology:
    'This is fixed-benchmark lookup with no AI and no live market data: the tool looks up a low/high band from a fixed table keyed by experience level × deliverable (per-word bands run $0.10–$2.00+ by level), then applies the niche premium as range × (1 + premium %). For flat deliverables, the per-word rate is derived as range-low ÷ word count. Every benchmark figure is a classification-level survey estimate — rates vary by market, portfolio, and negotiating power, so the bands are starting points, not official rates.',
  examples: [
    {
      title: 'Intermediate blogger, per word',
      inputs: { experienceLevel: 'intermediate', deliverable: 'per_word', wordCount: 1500 },
      note: 'Survey-estimate band $0.15–$0.30 per word before any niche premium.',
    },
    {
      title: 'Expert sales page with finance premium',
      inputs: { experienceLevel: 'expert', deliverable: 'sales_page', nichePremium: 50 },
      note: '$2,000–$7,500 band × 1.5 = $3,000.00–$11,250.00 estimate.',
    },
    {
      title: 'Your own custom rates',
      inputs: { experienceLevel: 'beginner', deliverable: 'per_word', wordCount: 800, customRateLow: 0.2, customRateHigh: 0.4 },
      note: 'Custom $0.20–$0.40 per word overrides the benchmark table.',
    },
  ],
  faqs: [
    {
      question: 'What is the best copywriter rates calculator?',
      answer:
        'The best one is honest about what its numbers are: this calculator labels every figure a survey estimate, lets you override the benchmarks with your own rates, and adjusts for niche premiums — rather than presenting one "correct" price.',
    },
    {
      question: 'Is there a free copywriter rates calculator?',
      answer:
        'Yes — this copywriter rates calculator is completely free with no signup. Select your experience level and deliverable to get an estimated rate range instantly.',
    },
    {
      question: 'How to calculate copywriter rates?',
      answer:
        'Start from a benchmark band for your experience level and deliverable (for example, per-word rates commonly run $0.10–$2.00+ by level), adjust upward for specialized niches, and for flat projects divide the project price by the word count to sanity-check the per-word equivalent.',
    },
    {
      question: 'How does the copywriter rates calculator work?',
      answer:
        'Enter your details using the inputs above and the copywriter rates calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the copywriter rates calculator free to use?',
      answer:
        'Yes - this copywriter rates calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a copywriter rates calculator?',
      answer:
        'A copywriter rates calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the copywriter rates calculator?',
      answer:
        'No account needed. Open the copywriter rates calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'ALL benchmark figures are survey estimates from classification-level research — NOT official rates, NOT verified market data. Never treat them as what you "should" charge.',
    'Rates vary widely by market, niche, portfolio, and negotiating power; these bands are starting points only.',
    'Per-word bands run $0.10–$2.00+ by level; the niche premium (e.g. +150% for finance) is user-entered and multiplies the band.',
    'Entering custom low/high rates overrides the benchmark band with your own trusted figures.',
    'All amounts are USD; no currency conversion is performed.',
  ],
  jsonLd: [],
};
