import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'salePrice',
    label: 'Item sale price',
    type: 'number',
    required: true,
    placeholder: 'e.g. 100.00',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'shippingCharged',
    label: 'Shipping charged to the buyer',
    type: 'number',
    required: false,
    placeholder: 'e.g. 10.00 — leave 0 if none',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'category',
    label: 'eBay category (sets the default fee rate)',
    type: 'select',
    required: false,
    options: ['most-categories', 'books-dvds-music', 'guitars-bass-guitars'],
  },
  {
    id: 'finalValueRate',
    label: 'Final value fee % (estimate — overrides the category default)',
    type: 'number',
    required: false,
    placeholder: 'Most categories default 13.6 — edit to match eBay today',
    validation: { min: 0, max: 100, unit: '%' },
  },
  {
    id: 'internationalBuyer',
    label: 'Buyer is outside the US (adds the international surcharge estimate)',
    type: 'boolean',
    required: false,
  },
  {
    id: 'listingsBeyondFree',
    label: 'Listings beyond your 250 free monthly listings',
    type: 'number',
    required: false,
    placeholder: '0 — charged at $0.35 each',
    validation: { min: 0 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'finalValueFee', label: 'Final value fee (estimate)', type: 'currency' },
  { id: 'perOrderFee', label: 'Per-order fee', type: 'currency' },
  { id: 'insertionFee', label: 'Insertion fees', type: 'currency' },
  { id: 'totalFees', label: 'Total eBay fees (estimate)', type: 'currency' },
  { id: 'netPayout', label: 'Net payout (estimate)', type: 'currency' },
];

const DESCRIPTION =
  'Price listings smartly with this eBay fee calculator — final value fees and shipping weighed so your profit in USD stays crystal clear. List knowing.';

export const content: ToolContent = {
  title: 'eBay Fee Calculator',
  description: DESCRIPTION,
  howTo: [
    'Enter your item sale price and the shipping amount you charged the buyer.',
    'Pick your eBay category — it sets the default final value fee rate (Most categories: 13.6% estimate).',
    'If you know eBay\'s current rate for your category, type it into "Final value fee %" to override the estimate.',
    'Tick the international buyer box if the buyer is outside the US, and enter any listings beyond your 250 free monthly listings.',
    'Run the calculator to see the final value fee, per-order fee, insertion fees, total fees, and your estimated net payout.',
  ],
  methodology:
    'Total sale = sale price + shipping charged. Final value fee = rate% on the first $7,500 plus a reduced 2.35% on the portion above $7,500, plus a 1.65% international surcharge estimate when flagged. Per-order fee = $0.30 when the total is $10 or less, $0.40 above. Insertion fees = $0.35 per listing beyond 250 free monthly listings. All fee figures are user-editable ESTIMATES: published sources disagree on the most-categories rate (13.6% vs 13.25%), so the default 13.6% is labeled an estimate and you should verify eBay\'s current schedule before pricing.',
  examples: [
    {
      title: '$100 item with $10 shipping',
      inputs: { salePrice: 100, shippingCharged: 10, category: 'most-categories' },
      note: 'Final value fee $14.96 (13.6% of $110), per-order fee $0.40 — total fees $15.36, net payout $94.64 (estimate).',
    },
    {
      title: 'High-value sale over the tier',
      inputs: { salePrice: 8000, shippingCharged: 0, category: 'most-categories' },
      note: 'Reduced 2.35% applies to the $500 above $7,500 — final value fee $1,031.75, net payout $6,967.85 (estimate).',
    },
  ],
  faqs: [
    {
      question: 'What is the best ebay fee calculator?',
      answer:
        'A good eBay fee calculator breaks down the final value fee, per-order fee, and insertion fees separately and lets you adjust the rates. This free calculator does that — and because sources disagree on the most-categories rate (13.6% vs 13.25%), every rate is editable and labeled an estimate.',
    },
    {
      question: 'Is there a free ebay fee calculator?',
      answer:
        'Yes — this eBay fee calculator is completely free with no signup. Enter your sale price, shipping, and category to get an estimated fee breakdown and net payout.',
    },
    {
      question: 'How to calculate ebay fee?',
      answer:
        'Add your sale price and shipping charged, then multiply by your category\'s final value fee rate (a reduced 2.35% applies above $7,500), add the $0.30/$0.40 per-order fee and any insertion fees beyond 250 free listings, and subtract the total from the sale amount for your payout.',
    },
    {
      question: 'Why do eBay fee calculators disagree on the final value fee rate?',
      answer:
        'Published sources show different most-categories rates — 13.6% and 13.25% have both been seen since July 2026 — so different calculators pick different figures. This tool defaults to 13.6% but labels it an estimate and lets you type the current rate yourself; always verify in eBay\'s official fee schedule.',
    },
    {
      question: 'How does the ebay fee calculator work?',
      answer:
        'Enter your details using the inputs above and the ebay fee calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ebay fee calculator free to use?',
      answer:
        'Yes - this ebay fee calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an ebay fee calculator?',
      answer:
        'An ebay fee calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The 13.6% most-categories default is an ESTIMATE under review (sources show 13.6% vs 13.25%) — verify current rates on eBay before pricing decisions.',
    'Category overrides (15.3% books/DVDs/music, 6.7% guitars) are simplified estimates, not eBay\'s full category rate card.',
    'Reduced 2.35% rate applies to the portion of the total sale amount above $7,500 per item.',
    'Insertion fees assume 250 free listings per month at $0.35 each beyond that.',
    'Not modeled: store-tier discounts, managed-payments terms, promoted-listing ad fees, sales tax, or shipping you actually pay.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'eBay Fee Calculator 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/ebay-fee-calculator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: DESCRIPTION,
      isAccessibleForFree: true,
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
          name: 'eBay Fee Calculator',
          item: 'https://husnainblogger.com/tools/make-money/ebay-fee-calculator/',
        },
      ],
    },
  ],
};
