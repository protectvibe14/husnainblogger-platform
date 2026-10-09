import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/digital-product-idea-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. fitness coaching for moms',
    validation: { min: 2, max: 80 },
  },
  {
    id: 'skills',
    label: 'Your skills',
    type: 'text',
    required: true,
    placeholder: 'e.g. video editing, recipe writing',
    validation: { min: 2, max: 120 },
  },
  {
    id: 'count',
    label: 'Number of ideas',
    type: 'number',
    required: false,
    placeholder: '5',
    validation: { min: 1, max: 10 },
  },
  {
    id: 'priceHint',
    label: 'Your price hint (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. $19',
    validation: { min: 1, max: 20 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'ideas',
    label: 'Product ideas',
    type: 'list',
    description:
    'Free digital products to sell as influencer 2026: Each idea with its title, format, your price hint, and a validation step. Fast, private.',
  },
];

export const content: ToolContent = {
  title: 'Digital Products to Sell As Influencer',
  description:
    'Generate digital product ideas for free: enter your niche and skills to get curated, ready-to-validate ideas with your own price hints. Start now.',
  howTo: [
    'Type your Niche (2–80 characters) — the audience you create for.',
    'Type your Skills (2–120 characters) — what you can actually build with.',
    'Optionally set the Number of Ideas (1–10, default 5) and Your Price Hint (e.g. $19).',
    'Click Generate to assemble ideas from fixed product-format and title templates.',
    'Read each idea’s format, your price hint, and its validation step — run the validation step before building.',
  ],
  methodology:
    'Ideas are assembled from fixed banks — 14 product formats, 10 title templates, 8 validation steps — cycling in order (idea i uses format[i % 14], template[i % 10], step[i % 8]) filled with your niche and first-listed skill. The optional price hint is your own input echoed back, never market pricing. No AI, no randomness, no market data.',
  examples: [
    {
      title: 'Fitness coach ideas',
      inputs: { niche: 'fitness coaching', skills: 'video editing', count: 3 },
      note: 'Returns 3 ideas like “fitness coaching Notion template pack for beginners”, each with a validation step.',
    },
    {
      title: 'Ideas with a price hint',
      inputs: { niche: 'baking', skills: 'photography', count: 2, priceHint: '$29' },
      note: 'Both ideas repeat your $29 hint labeled as yours — not as market data.',
    },
  ],
  faqs: [
    {
      question: 'What is the best digital products to sell as influencer?',
      answer:
        'There is no verified “best” — the right product depends on your niche, skills and audience. This free generator assembles starting-point ideas from fixed templates (ebooks, template packs, mini courses and 11 more formats), each with a concrete validation step so you can test demand before building.',
    },
    {
      question: 'Is there a free digital products to sell as influencer?',
      answer:
        'Yes — this tool is completely free with no signup. Enter your niche and skills, choose 1–10 ideas, and it returns curated idea titles with formats, your own optional price hint, and a validation step for each.',
    },
    {
      question: 'How to use digital products to sell as influencer?',
      answer:
        'Type your niche and skills, optionally add how many ideas you want and your own price hint, then click Generate. Pick the idea that excites you, run its validation step (e.g. pre-sell to 10 people) to prove demand, and only then build it.',
    },
    {
      question: 'How does the digital products to sell as influencer work?',
      answer:
        'Enter your details using the inputs above and the digital products to sell as influencer calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the digital products to sell as influencer free to use?',
      answer:
        'Yes - this digital products to sell as influencer is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a digital products to sell as influencer?',
      answer:
        'A digital products to sell as influencer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the digital products to sell as influencer?',
      answer:
        'No account needed. Open the digital products to sell as influencer, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Ideas are assembled from fixed template banks (14 formats, 10 title templates, 8 validation steps) — starting points, not researched market opportunities.',
    'Price hints are your own input repeated back, never market pricing — the tool has no pricing data.',
    'An idea is only as good as its validation: run the listed validation step before building.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Digital Products to Sell As Influencer 2026 | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free digital products to sell as influencer 2026: Each idea with its title, format, your price hint, and a validation step. Fast, private.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Instagram Tools',
          item: 'https://husnainblogger.com/tools/instagram/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Digital Product Idea Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
