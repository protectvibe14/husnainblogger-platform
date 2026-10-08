import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'courseHours',
    label: 'Total course content hours',
    type: 'number',
    required: true,
    placeholder: 'e.g. 8',
    validation: { min: 0.1 },
  },
  {
    id: 'nicheValue',
    label: 'Niche value tier',
    type: 'select',
    required: true,
    options: ['low', 'medium', 'high'],
  },
  {
    id: 'studentOutcome',
    label: 'Primary student outcome',
    type: 'select',
    required: true,
    options: ['skill', 'career', 'business'],
  },
  {
    id: 'platformFeeRate',
    label: 'Platform fee rate (%)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 5 — enter 0 if none',
    validation: { min: 0, max: 99.99, unit: '%' },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'priceLow', label: 'Suggested price — low end', type: 'currency' },
  { id: 'priceHigh', label: 'Suggested price — high end', type: 'currency' },
  { id: 'bandDetail', label: 'Heuristic band used', type: 'text' },
  { id: 'estimateLabel', label: 'Honesty label', type: 'text' },
];

const DESCRIPTION =
  'Free online course pricing calculator 2026: bracket the right price for your course from hours, niche value and platform fees. No signup — try it now.';

export const content: ToolContent = {
  title: 'Online Course Pricing Calculator 2026 | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Enter your total course content hours (finished video/audio content, not production time).',
    'Pick your niche value tier: low (mass-market hobbies), medium (professional skills), or high (high-ticket outcomes).',
    'Pick the primary student outcome: a new skill, a career change, or a business result.',
    'Enter your platform fee rate as a percent (Udemy, Teachable, etc.) — or 0 if you sell direct.',
    'Read the low/high range as a brainstorming bracket, not a researched price — adjust with your own judgment.',
  ],
  methodology:
    'The tool multiplies a wide per-hour heuristic band (set by your niche tier and student outcome) by a sub-linear hours factor (hours^0.85, so very long courses scale down per hour), then grosses the result up for the platform fee: price ÷ (1 − fee). Results round to the nearest $10. The bands are invented heuristics for bracketing only — they are not researched market data and the tool never presents a single "correct" price.',
  examples: [
    {
      title: '8-hour career course, medium niche, 5% fee',
      inputs: { courseHours: 8, nicheValue: 'medium', studentOutcome: 'career', platformFeeRate: 5 },
      note: 'Returns a $250–$620 heuristic range with the band detail shown.',
    },
    {
      title: 'Short skill course, low niche, no fee',
      inputs: { courseHours: 3, nicheValue: 'low', studentOutcome: 'skill', platformFeeRate: 0 },
      note: 'A shorter, mass-market course brackets much lower — compare bands before pricing.',
    },
  ],
  faqs: [
    {
      question: 'How to calculate cost per test?',
      answer: 'This is a common question about how to calculate cost per test. Use the tool above to get your answer instantly - it is free and requires no signup.',
    },
    {
      question: 'What is the best online course pricing calculator?',
      answer:
        'The best one is honest about being a starting point: this free calculator brackets a wide low/high range from your hours, niche tier, and platform fee, and labels the result a market heuristic — because no calculator knows your audience. Use the range to brainstorm, then validate with real buyers.',
    },
    {
      question: 'Is there a free online course pricing calculator?',
      answer:
        'Yes — this online course pricing calculator is completely free with no signup. Enter your course hours, niche value tier, student outcome, and platform fee rate to get a wide heuristic price range instantly.',
    },
    {
      question: 'How to calculate online course pricing?',
      answer:
        'A common method: take a per-hour band for your niche and outcome, multiply by your content hours (with a volume discount for long courses), then gross up for platform fees. This calculator does exactly that math and returns a wide range — always sanity-check against what comparable courses charge and what your students can pay.',
    },
    {
      question: 'How accurate is an online course price range estimate?',
      answer:
        'Treat it as a rough bracket, not a researched price. The bands are market heuristics with deliberately wide ranges, and pricing ultimately depends on your audience, brand, and proof of results — your judgment is required.',
    },
    {
      question: 'How much should I charge for an online course?',
      answer:
        'There is no single right price — it depends on content hours, niche value, and the student outcome. As a rough bracket from this tool, an 8-hour career-outcome course in a medium-value niche lands around $250–$620, while short skill courses in mass-market niches bracket much lower. Always validate against what your audience will actually pay.',
    },
    {
      question: 'Does this calculator account for Udemy or Teachable fees?',
      answer:
        'Yes. Enter your platform fee rate as a percent (enter 0 if you sell direct) and the tool grosses the price up — price ÷ (1 − fee) — so you net the target amount after the platform takes its cut. Fees of 100% or more are rejected.',
    },
    {
      question: 'Should a longer course always cost more?',
      answer:
        'Not proportionally. This calculator scales hours sub-linearly (hours^0.85), so very long courses get a lower effective per-hour rate — a volume-discount heuristic. Student outcome matters more than length: business and career outcomes bracket higher than pure skill courses.',
    },
  ],
  assumptions: [
    'Price bands are market HEURISTICS with wide ranges — not researched pricing; the UI must not present them as data-backed. Your judgment is required.',
    'Hours scale sub-linearly (hours^0.85): very long courses get a lower effective per-hour rate (volume-discount heuristic).',
    'The platform fee is grossed up, so you net the band price after the platform takes its cut; fees of 100% or more are rejected.',
    'Results round to the nearest $10 — wide bands do not justify dollar precision.',
    'Not financial or business advice.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Online Course Pricing Calculator 2026 | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/online-course-pricing-calculator/',
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
          name: 'Online Course Pricing Calculator',
          item: 'https://husnainblogger.com/tools/make-money/online-course-pricing-calculator/',
        },
      ],
    },
  ],
};
