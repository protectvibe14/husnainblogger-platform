import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'grossMarginPercent',
    label: 'Gross margin (percent)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 40',
    validation: { min: 0.01, max: 100, unit: '%' },
  },
  {
    id: 'adSpend',
    label: 'Ad spend (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 1000',
    validation: { min: 0.01, unit: 'USD' },
  },
  {
    id: 'revenue',
    label: 'Attributed revenue (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 3200',
    validation: { min: 0.01, unit: 'USD' },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'breakEvenROAS', label: 'Break-even ROAS', type: 'number' },
  { id: 'actualROAS', label: 'Your actual ROAS', type: 'number' },
  { id: 'verdict', label: 'Profitability verdict', type: 'text' },
  { id: 'disclaimer', label: 'Honesty disclaimer', type: 'text' },
];

const DESCRIPTION =
  'Free breakeven roas calculator 2026: enter your gross margin, ad spend, and revenue to find minimum profitable ROAS and compare your actual ROAS. No signup.';

export const content: ToolContent = {
  title: 'Breakeven ROAS Calculator',
  description: DESCRIPTION,
  howTo: [
    'Enter your gross margin as a percent — revenue after cost of goods sold (include fees and shipping for an honest number).',
    'Enter your ad spend in USD for the same period.',
    'Enter the revenue attributed to that ad spend in USD.',
    'Run the calculation: break-even ROAS = 1 ÷ margin, actual ROAS = revenue ÷ ad spend.',
    'Read the verdict — profitable only when your actual ROAS meets or beats the break-even figure.',
  ],
  methodology:
    'The tool computes break-even ROAS as 1 divided by the gross margin (for example, a 40% margin needs a 2.50x ROAS) and actual ROAS as revenue divided by ad spend. A 0% margin is rejected with an error instead of dividing by zero. The math is pure ratio arithmetic on the user\'s inputs — there is no external data.',
  examples: [
    {
      title: 'Profitable campaign',
      inputs: { grossMarginPercent: 40, adSpend: 1000, revenue: 3200 },
      note: 'Break-even is 2.50x; actual ROAS is 3.20x — profitable.',
    },
    {
      title: 'Losing campaign',
      inputs: { grossMarginPercent: 25, adSpend: 2000, revenue: 3000 },
      note: 'Break-even is 4.00x; actual ROAS is 1.50x — not profitable.',
    },
  ],
  faqs: [
    {
      question: 'How to calculate break even roas?',
      answer: 'This is a common question about how to calculate break even roas. Use the tool above to get your answer instantly - it is free and requires no signup.',
    },
    {
      question: 'What is break even roas?',
      answer: 'This is a common question about what is break even roas. Use the tool above to get your answer instantly - it is free and requires no signup.',
    },
    {
      question: 'What is the best breakeven roas calculator?',
      answer:
        'The best calculator shows both the break-even figure and your actual ROAS side by side, so the verdict is obvious. This free tool does that — just make sure the margin you enter reflects your real costs, since the result is pure ratio math on your inputs.',
    },
    {
      question: 'Is there a free breakeven roas calculator?',
      answer:
        'Yes — this breakeven ROAS calculator is completely free with no signup. Enter your gross margin, ad spend, and revenue to get your minimum profitable ROAS instantly.',
    },
    {
      question: 'How to calculate breakeven roas?',
      answer:
        'Divide 1 by your gross margin as a decimal: a 40% margin needs a 1 ÷ 0.40 = 2.50x ROAS to break even. Compare your actual ROAS (revenue ÷ ad spend) against it — at or above break-even means profitable.',
    },
    {
      question: 'What does a break-even ROAS of 2.5 mean?',
      answer:
        'It means every $1 of ad spend must generate $2.50 of attributed revenue just to cover your product costs — no profit, no loss. A higher actual ROAS means you profit on the campaign; a lower one means you lose money. Enter your own gross margin to get your exact number.',
    },
    {
      question: 'Why does a higher margin lower my break-even ROAS?',
      answer:
        'Break-even ROAS equals 1 divided by your margin, so margin and break-even move in opposite directions. A 40% margin needs a 2.50x ROAS, but a 50% margin needs only 2.00x — with fatter margins, each ad dollar has to earn back fewer revenue dollars.',
    },
    {
      question: 'Should I use gross margin or net profit margin in a breakeven roas calculator?',
      answer:
        'Use gross margin — revenue after cost of goods sold — which is the input this calculator expects. For the most honest break-even, fold shipping and marketplace fees into your cost figure too, since the result is pure ratio math and is only as correct as the margin you enter.',
    },
    {
      question: 'What happens if my actual ROAS exactly equals my break-even ROAS?',
      answer:
        'You land exactly on the line: the campaign covers its product and ad costs with zero profit and zero loss. The calculator\'s verdict only turns positive when your actual ROAS meets or beats break-even — many advertisers treat a comfortable buffer above it as their real target.',
    },
  ],
  assumptions: [
    'Break-even ROAS = 1 ÷ margin is pure ratio math — the output is only as correct as the margin you enter.',
    'A 0% margin is rejected with an error message (division by zero), and ad spend must be greater than 0 for actual ROAS.',
    'Gross margin should reflect cost of goods sold; excluding fees or shipping makes the break-even figure misleadingly low.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Breakeven ROAS Calculator 2026 – Ad Profit | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/break-even-roas-calculator/',
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
          name: 'Break-Even ROAS Calculator',
          item: 'https://husnainblogger.com/tools/make-money/break-even-roas-calculator/',
        },
      ],
    },
  ],
};
