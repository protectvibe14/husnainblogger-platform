import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'trafficLevel',
    label: 'Your monthly traffic',
    type: 'select',
    required: true,
    options: [
      'Under 10,000 / month',
      '10,000 - 50,000 / month',
      '50,000 - 250,000 / month',
      'Over 250,000 / month',
    ],
  },
  {
    id: 'revenueStreams',
    label: 'Revenue streams (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. Display ads, Digital products (leave blank for all)',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'monetizationTable',
    label: 'Your monetization mix table',
    type: 'table',
    description:
    'Free blog monetization planner 2026: Illustrative monthly estimate ranges for each revenue stream at your traffic level -. Fast, private.',
  },
  {
    id: 'estimateNote',
    label: 'About these estimates',
    type: 'text',
    description:
    'Plain-language disclaimer that the ranges are planning estimates, not real revenue data.',
  },
];

export const content: ToolContent = {
  title: 'Blog Monetization Planner',
  description:
    'Plan your blog income mix: pick your traffic level and compare illustrative monthly ranges for ads, affiliates, products, and more. Free - start.',
  howTo: [
    'Pick your current monthly traffic from the Your monthly traffic dropdown.',
    'Optionally, list the revenue streams you care about in the Revenue streams field (leave it blank to see all six).',
    'Click run to see your monetization mix table with illustrative monthly ranges.',
    'Read the estimate disclaimer under the table before making any plans.',
    'Compare streams side by side, then pick one or two to focus on first.',
  ],
  methodology:
    'This tool looks up your traffic band in a fixed table of six revenue streams and shows a broad illustrative monthly range for each - a static lookup, not a prediction. Every value is labeled as an estimate, and the disclaimer states plainly that these are not real revenue figures.',
  examples: [
    {
      title: 'New blog under 10K visitors',
      inputs: { trafficLevel: 'Under 10,000 / month' },
      note: 'Sees all six streams with modest illustrative ranges, plus guidance on which to try first.',
    },
    {
      title: 'Growing blog comparing two streams',
      inputs: {
        trafficLevel: '10,000 - 50,000 / month',
        revenueStreams: 'Affiliate marketing, Digital products',
      },
      note: 'Gets a focused 2-row comparison table with illustrative ranges.',
    },
  ],
  faqs: [
    {
      question: 'What is the best blog monetization planner?',
      answer:
        'The best one shows your options side by side: display ads, affiliate marketing, sponsored posts, digital products, services, and email - with honest ranges for your traffic level so you can pick what to focus on first.',
    },
    {
      question: 'Is there a free blog monetization planner?',
      answer:
        'Yes - this Blog Monetization Planner is completely free with no signup. Pick your traffic level to compare illustrative monthly ranges across six revenue streams.',
    },
    {
      question: 'How do you plan blog monetization?',
      answer:
        'List the revenue streams that fit your niche, estimate what each could bring at your traffic level, then start with the one or two with the best effort-to-return ratio. This tool gives you that starting comparison.',
    },
    {
      question: 'Are the income ranges in this planner real data?',
      answer:
        'No - they are broad illustrative estimates from a fixed planning table, clearly labeled as estimates on every row. Real income depends on your niche, pricing, audience, and execution; use the table to plan, not to predict.',
    },
    {
      question: 'How does the blog monetization planner work?',
      answer:
        'Enter your details using the inputs above and the blog monetization planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the blog monetization planner free to use?',
      answer:
        'Yes - this blog monetization planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a blog monetization planner?',
      answer:
        'A blog monetization planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'All monthly figures are broad illustrative estimates from a fixed table - not real revenue data and not financial advice.',
    'Ranges do not account for your niche, country, pricing, or conversion rates, which all change real results.',
  ],
  jsonLd: [
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Blog Monetization Planner',
          item: 'https://husnainblogger.com/tools/ai-workflows/blog-monetization-planner/',
        },
      ],
    },
  ],
};
