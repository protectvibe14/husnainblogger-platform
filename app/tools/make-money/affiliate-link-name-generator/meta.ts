import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'productName',
    label: 'Product name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Bluehost WordPress Hosting',
    validation: { max: 100 },
  },
  {
    id: 'count',
    label: 'How many names',
    type: 'number',
    required: false,
    placeholder: 'e.g. 10',
    validation: { min: 1, max: 50 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'slugs', label: 'Generated link names', type: 'list' },
];

const DESCRIPTION =
  'Use this affiliate link name generator free — turn any product name into up to 50 slug-safe, copy-ready link names for cloaking tools. Try it now!';

export const content: ToolContent = {
  title: 'Affiliate Link Name Generator',
  description: DESCRIPTION,
  howTo: [
    'Type the “Product name” exactly as the offer is known (e.g. Bluehost WordPress Hosting) — it becomes the base of every link name.',
    'Set “How many names” from 1 to 50, or leave it blank for the default 10.',
    'Submit to get your list: the base slug first, then fixed-suffix variants like -deal and -offer, then numbered ones if you asked for more than 25.',
    'Copy any name and paste it into your link-cloaking plugin (such as Pretty Links) as the pretty URL slug.',
  ],
  methodology:
    'The generator slugifies your product name with fixed rules — lowercase, every run of non-alphanumeric characters becomes one hyphen, trimmed and capped at 40 characters — then builds variants in a fixed order: the base slug, 24 fixed suffixes (-deal, -offer, -review, and 21 more), then numbered fallbacks (name-2, name-3, …). Duplicates are removed within the batch, every name uses only lowercase letters, digits, and hyphens, and the same input always returns the same list. No AI and no network calls.',
  examples: [
    {
      title: 'Web hosting product, 5 names',
      inputs: { productName: 'Bluehost WordPress Hosting', count: 5 },
      note: 'Returns bluehost-wordpress-hosting plus the -deal, -deals, -offer, and -offers variants.',
    },
    {
      title: 'Short product, default count',
      inputs: { productName: 'Grammarly' },
      note: 'Returns 10 names: grammarly, then 9 fixed-suffix variants starting with grammarly-deal.',
    },
  ],
  faqs: [
    {
      question: 'What is the best affiliate link name generator?',
      answer:
        'The best one gives you short, memorable, slug-safe names instantly. This generator turns your product name into a clean base slug and builds up to 50 variants from a fixed suffix list — deterministic, free, and ready to paste into any cloaking plugin.',
    },
    {
      question: 'Is there a free affiliate link name generator?',
      answer:
        'Yes — this generator is completely free with no signup. It runs entirely in your browser: your product name is only used to build the slugs and never leaves your device.',
    },
    {
      question: 'How to generate affiliate link name ideas?',
      answer:
        'Start from the product name as a base slug, then add intent suffixes like -deal, -review, -bonus, or -guide, or a number for versioning. Enter the product name here and the tool applies those patterns for you, up to 50 names per batch.',
    },
    {
      question: 'How does an affiliate link name generator work?',
      answer:
        'It slugifies your product name with fixed text rules (lowercase, hyphens instead of spaces and symbols, 40-character cap), then appends a fixed list of 24 suffixes and numbered fallbacks. Same input, same output every time — no AI involved.',
    },
    {
      question: 'How does the affiliate link name generator work?',
      answer:
        'Enter your details using the inputs above and the affiliate link name generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the affiliate link name generator free to use?',
      answer:
        'Yes - this affiliate link name generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an affiliate link name generator?',
      answer:
        'An affiliate link name generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Slugs use only lowercase letters, digits, and hyphens — the tool does not check whether a name is available or already in use.',
    'Generated names are suggestions only; they do not cloak anything until you add them to your own link-cloaking plugin.',
    'Names come from a fixed suffix list plus numbered fallbacks, not from any analysis of the product.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Affiliate Link Name Generator 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/affiliate-link-name-generator/',
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
          name: 'Affiliate Link Name Generator',
          item: 'https://husnainblogger.com/tools/make-money/affiliate-link-name-generator/',
        },
      ],
    },
  ],
};
