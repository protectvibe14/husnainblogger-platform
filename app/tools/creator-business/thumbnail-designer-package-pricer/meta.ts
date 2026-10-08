import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/thumbnail-designer-package-pricer/';

export const inputs: ToolInput[] = [
  {
    id: 'thumbnailsPerMonth',
    label: 'Thumbnails per month',
    type: 'number',
    required: true,
    placeholder: '20',
    validation: { min: 1 },
  },
  {
    id: 'pricePerThumbnail',
    label: 'Your price per thumbnail (USD)',
    type: 'number',
    required: true,
    placeholder: '25',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'revisionsIncluded',
    label: 'Revisions included per thumbnail',
    type: 'number',
    required: true,
    placeholder: '2',
    validation: { min: 0 },
  },
  {
    id: 'bundleDiscountPct',
    label: 'Bundle discount (%)',
    type: 'number',
    required: true,
    placeholder: '10',
    validation: { min: 0, max: 100, unit: '%' },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'monthlyPackagePrice',
    label: 'Monthly package price (estimate)',
    type: 'currency',
    description: 'Your monthly package price after the bundle discount.',
  },
  {
    id: 'perThumbnailEffective',
    label: 'Effective per-thumbnail price',
    type: 'currency',
    description: 'What each thumbnail effectively costs inside the package.',
  },
  {
    id: 'tierOptions',
    label: '10 / 20 / 30 pack options',
    type: 'table',
    description: 'Pack prices with a-la-carte comparison and savings.',
  },
  {
    id: 'revisionsIncluded',
    label: 'Revisions included (package feature)',
    type: 'number',
    description: 'Recorded as a package feature — it does not change the price.',
  },
];

const DESCRIPTION =
  'Free thumbnail designer pricing 2026: Your monthly package price after the bundle discount. Instant, private, and mobile-friendly. No signup - try it free!';

export const content: ToolContent = {
  title: 'Thumbnail Designer Pricing 2026 – Free Tool | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Enter how many thumbnails you deliver per month and your own per-thumbnail price in USD.',
    'Enter how many revisions each thumbnail includes and the bundle discount percent you offer.',
    'Run the tool to get the monthly package price and the effective per-thumbnail price.',
    'Compare the 10, 20, and 30 pack options with their a-la-carte savings.',
    'Use the tier table to present package options to clients.',
  ],
  methodology:
    'The monthly package price is your thumbnails-per-month × your price-per-thumbnail, reduced by your bundle discount percent; the effective per-thumbnail price is that total divided by the monthly volume. The 10/20/30 pack options apply the same discount to each pack size and subtract the pack price from the a-la-carte price for the savings. All rates are user-provided — no market prices are used.',
  examples: [
    {
      title: '20 thumbnails a month at $25, 10% bundle discount',
      inputs: {
        thumbnailsPerMonth: 20,
        pricePerThumbnail: 25,
        revisionsIncluded: 2,
        bundleDiscountPct: 10,
      },
      note: 'Monthly package 450 USD; effective rate 22.50 USD per thumbnail.',
    },
    {
      title: 'No discount, simple retainer',
      inputs: {
        thumbnailsPerMonth: 12,
        pricePerThumbnail: 40,
        revisionsIncluded: 1,
        bundleDiscountPct: 0,
      },
      note: 'Monthly package 480 USD at the full per-thumbnail rate.',
    },
  ],
  faqs: [
    {
      question: 'What is the best thumbnail designer pricing?',
      answer:
        'The best pricing is built from your own numbers — your per-thumbnail rate, your monthly volume, and the discount you choose to offer. This tool prices exactly that and shows 10/20/30 pack tiers, free.',
    },
    {
      question: 'Is there a free thumbnail designer pricing?',
      answer:
        'Yes — this thumbnail designer pricing calculator is completely free with no signup. Re-run it for any volume, rate, or discount scenario.',
    },
    {
      question: 'How to use thumbnail designer pricing?',
      answer:
        'Enter your monthly thumbnail volume and your per-thumbnail price, add revisions and your bundle discount percent, then run the tool. You get a monthly package price, the effective per-thumbnail rate, and ready-to-present pack tiers.',
    },
    {
      question: 'How does the thumbnail designer pricing work?',
      answer:
        'Enter your details using the inputs above and the thumbnail designer pricing calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the thumbnail designer pricing free to use?',
      answer:
        'Yes - this thumbnail designer pricing is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a thumbnail designer pricing?',
      answer:
        'A thumbnail designer pricing is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the thumbnail designer pricing?',
      answer:
        'No account needed. Open the thumbnail designer pricing, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'The per-thumbnail rate and bundle discount are yours — the tool knows no market prices.',
    'Revisions included is recorded as a package feature; it does not change the price.',
    'Pack tiers are arithmetic examples from your own rate, not prescribed product tiers.',
    'Results are ESTIMATES for your planning, not a promise of what clients will pay.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Thumbnail Designer Pricing 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
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
          name: 'Creator Business Tools',
          item: 'https://husnainblogger.com/tools/creator-business/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Thumbnail Designer Package Pricer',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
