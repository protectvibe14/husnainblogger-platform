import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/freelance-writing-rate-calculator/';

export const inputs: ToolInput[] = [
  {
    id: 'hourlyRate',
    label: 'Your hourly rate',
    type: 'number',
    required: true,
    placeholder: '50',
    validation: { min: 0 },
  },
  {
    id: 'wordsPerHour',
    label: 'Words you write per hour',
    type: 'number',
    required: true,
    placeholder: '500',
    validation: { min: 0 },
  },
  {
    id: 'projectWords',
    label: 'Project word count (optional)',
    type: 'number',
    required: false,
    placeholder: '2000',
    validation: { min: 0 },
  },
  {
    id: 'currency',
    label: 'Currency (optional)',
    type: 'text',
    required: false,
    placeholder: 'USD',
    validation: { pattern: '^[A-Za-z]{3}$' },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'perWordRate',
    label: 'Your per-word rate',
    type: 'number',
    description: 'Free freelance writing rates 2026: Your hourly rate ÷ your words per hour, in your currency. Instant, private, and mobile-friendly. No signup - try it free!',
  },
  {
    id: 'per1000Words',
    label: 'Your per-1,000-word rate',
    type: 'number',
    description: 'Per-word rate × 1,000, in your currency.',
  },
  {
    id: 'perProjectQuote',
    label: 'Your project quote',
    type: 'number',
    description: 'Per-word rate × your project word count. 0 when no word count is entered.',
  },
  {
    id: 'breakdown',
    label: 'Rate breakdown',
    type: 'list',
    description: 'Step-by-step breakdown of the calculation and any warnings.',
  },
];

export const content: ToolContent = {
  title: 'Freelance Writing Rates 2026 – Free Tool | HusnainBlogger',
  description:
    'Calculate your freelance writing rates from your own hourly rate and writing speed. Get per-word, per-1,000-word, and project quotes — no signup. Try it now!',
  howTo: [
    'Enter your target hourly rate in "Your hourly rate".',
    'Enter how many finished words you typically write per hour in "Words you write per hour".',
    'Optionally add a "Project word count" to get a full project quote, and a 3-letter "Currency" code (defaults to USD).',
    'Run the tool to see your per-word rate, per-1,000-word rate, and project quote.',
    'Read the "Rate breakdown" for the exact math behind your numbers.',
  ],
  methodology:
    'Per-word rate = your hourly rate ÷ your words per hour. Per-1,000-word rate = per-word rate × 1,000. Project quote = per-word rate × your project word count. The currency code is only a label — no conversion or market data is involved. Every number comes from inputs you provide; nothing is researched or estimated for you.',
  examples: [
    {
      title: 'Steady blogger',
      inputs: { hourlyRate: 50, wordsPerHour: 500, projectWords: 2000, currency: 'USD' },
      note: '$50/hour at 500 words/hour gives a $0.10 per-word rate and a $200 quote for a 2,000-word article.',
    },
    {
      title: 'Fast writer, no project size yet',
      inputs: { hourlyRate: 75, wordsPerHour: 900, currency: 'EUR' },
      note: 'Shows per-word and per-1,000-word rates in EUR; the project quote stays 0 until a word count is added.',
    },
    {
      title: 'Slow careful writer',
      inputs: { hourlyRate: 40, wordsPerHour: 250, projectWords: 1000 },
      note: 'A slower pace raises the per-word rate — the math reflects your speed honestly.',
    },
  ],
  faqs: [
    {
      question: 'What is the best freelance writing rates?',
      answer:
        'There is no single best rate — it depends on your target income, niche, experience, and writing speed. This calculator does not look up market rates; it converts your own hourly rate and speed into per-word and project quotes, so the result reflects your goals, not anyone else\'s.',
    },
    {
      question: 'Is there a free freelance writing rates?',
      answer:
        'Yes — this freelance writing rate calculator is completely free with no signup. Enter your numbers as many times as you like and recalculate whenever your rate or speed changes.',
    },
    {
      question: 'How to use freelance writing rates?',
      answer:
        'Enter your hourly rate and how many words you write per hour, then optionally add a project word count and a 3-letter currency code. The tool shows your per-word rate, per-1,000-word rate, and a project quote, plus a breakdown of the exact math.',
    },
    {
      question: 'How does the freelance writing rates work?',
      answer:
        'Enter your details using the inputs above and the freelance writing rates calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the freelance writing rates free to use?',
      answer:
        'Yes - this freelance writing rates is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a freelance writing rates?',
      answer:
        'A freelance writing rates is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the freelance writing rates?',
      answer:
        'No account needed. Open the freelance writing rates, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'All rates are computed from the numbers you enter — they are your rates, not market rates, and the tool does not know what other writers charge.',
    'Results are estimates from a simple division formula, not guarantees of what a client will pay.',
    'The currency field is only a label; no exchange-rate conversion is performed.',
    'This is a pricing math tool, not financial advice.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Freelance Writing Rates 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free freelance writing rates 2026: Your hourly rate ÷ your words per hour, in your currency. Instant, private, and mobile-friendly. No signup - try it free!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Blogging & SEO Tools',
          item: 'https://husnainblogger.com/tools/blogging-seo/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Freelance Writing Rate Calculator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
