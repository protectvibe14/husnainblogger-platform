import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'salePrice',
    label: 'Sale price (per item)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 25.00',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'itemCost',
    label: 'Item cost / COGS (what you paid to make or buy it)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 8.00 — leave 0 if none',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'shippingCharged',
    label: 'Shipping charged to the buyer',
    type: 'number',
    required: false,
    placeholder: 'e.g. 5.00 — leave 0 for free shipping',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'shippingLabelCost',
    label: 'Your actual shipping label cost',
    type: 'number',
    required: false,
    placeholder: 'e.g. 4.20 — what you really pay to ship',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'sellerCountry',
    label: 'Seller country (sets the processing-fee schedule)',
    type: 'select',
    required: false,
    options: ['US', 'UK', 'DE', 'FR', 'CA', 'AU'],
  },
  {
    id: 'transactionFeeRate',
    label: 'Transaction fee % (estimate — Etsy default 6.5)',
    type: 'number',
    required: false,
    placeholder: '6.5 — edit if Etsy changes it',
    validation: { min: 0, max: 100, unit: '%' },
  },
  {
    id: 'listingFee',
    label: 'Listing fee per item (estimate — Etsy default 0.20)',
    type: 'number',
    required: false,
    placeholder: '0.20 — edit if Etsy changes it',
    validation: { min: 0 },
  },
  {
    id: 'processingRate',
    label: 'Payment processing rate % (estimate — default from your country)',
    type: 'number',
    required: false,
    placeholder: 'US default 3 — edit if Etsy changes it',
    validation: { min: 0, max: 100, unit: '%' },
  },
  {
    id: 'processingFixed',
    label: 'Payment processing flat fee (estimate — default from your country)',
    type: 'number',
    required: false,
    placeholder: 'US default 0.25 — edit if Etsy changes it',
    validation: { min: 0 },
  },
  {
    id: 'offsiteAdsAttributed',
    label: 'This sale came from an Etsy Offsite Ad',
    type: 'boolean',
    required: false,
  },
  {
    id: 'offsiteAdsRate',
    label: 'Offsite Ads fee % (estimate — 15 under $10k/yr, 12 at/above)',
    type: 'number',
    required: false,
    placeholder: '15 — edit to 12 if you sell $10k+/yr',
    validation: { min: 0, max: 100, unit: '%' },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'totalFees', label: 'Total Etsy fees', type: 'currency' },
  { id: 'totalCosts', label: 'Total costs (fees + item cost + label)', type: 'currency' },
  { id: 'netProfit', label: 'Net profit per sale', type: 'currency' },
  { id: 'profitMargin', label: 'Profit margin', type: 'percent' },
  {
    id: 'warning',
    label: 'Profit warning',
    type: 'text',
    description:
    'Shown only when costs exceed the sale price.',
  keywords: ['etsy profit calculator 2025', 'etsy profit calculator 2026', 'etsy profit calculator canada', 'etsy profit calculator digital products', 'etsy profit calculator excel'],
  },
];

const DESCRIPTION =
  'Free etsy profit calculator 2026: see exactly what Etsy takes and your net profit per sale. Enter your sale price and costs for the full breakdown. No signup.';

export const content: ToolContent = {
  title: 'Etsy Profit Calculator',
  description: DESCRIPTION,
  howTo: [
    'Enter your sale price and the shipping amount you charged the buyer.',
    'Add your item cost (what you paid to make or source the item) and your actual shipping label cost.',
    'Pick your seller country — this sets the payment-processing fee schedule; all fee values are editable estimates you can adjust.',
    'Tick "This sale came from an Etsy Offsite Ad" only when that sale was ad-attributed (15% default, 12% for sellers at/above $10k yearly).',
    'Run the calculator to see total Etsy fees, total costs, net profit, and profit margin. A warning appears if costs exceed the sale price.',
  ],
  methodology:
    'Net profit = (sale price + shipping charged) − item cost − shipping label cost − Etsy fees. Fees = listing fee + transaction fee (default 6.5% of the gross) + payment processing (default by seller country, e.g. US 3% + $0.25) + optional Offsite Ads fee (default 15%, capped at $100). Each fee line is rounded to the nearest cent (half-up) before summing. The regulatory operating fee (0.05%–1.97%, region-specific) and the +2.5% regulated-category surcharge are deliberately excluded from v1, so real fees may be slightly higher. All fee defaults are editable estimates — Etsy can change its fees at any time.',
  examples: [
    {
      title: 'Handmade mug',
      inputs: { salePrice: 25, itemCost: 8, shippingCharged: 5, shippingLabelCost: 4.2, sellerCountry: 'US' },
      note: 'Total fees $3.30 (listing $0.20, transaction $1.95, processing $1.15); total costs $15.50; net profit $14.50; margin 48.3%.',
    },
    {
      title: 'UK sale with ad attribution',
      inputs: {
        salePrice: 40,
        itemCost: 10,
        shippingCharged: 0,
        shippingLabelCost: 0,
        sellerCountry: 'UK',
        offsiteAdsAttributed: true,
      },
      note: 'UK 4% + £0.20 processing applies; the 15% Offsite Ads fee is added because the sale was ad-attributed.',
    },
  ],
  faqs: [
    {
      question: 'What is the best etsy profit calculator?',
      answer:
        'A good Etsy profit calculator subtracts every fee line plus your real costs — item cost and shipping label — not just Etsy fees. This free calculator does that, and every fee rate is editable so you can match Etsy\'s current schedule.',
    },
    {
      question: 'Is there a free etsy profit calculator?',
      answer:
        'Yes — this Etsy profit calculator is completely free with no signup. Enter your sale price, costs, and shipping to get fees, net profit, and margin as estimates you can adjust.',
    },
    {
      question: 'How to calculate etsy profit?',
      answer:
        'Add your sale price and shipping charged, then subtract your item cost, shipping label cost, and Etsy fees (listing, transaction, payment processing, and any Offsite Ads fee). What remains is your net profit; divide it by the gross sale and multiply by 100 for your margin percentage.',
    },
    {
      question: 'Does this calculator include Etsy\'s regulatory operating fee?',
      answer:
        'No — v1 excludes the regulatory operating fee (0.05%–1.97%, region-specific) and the +2.5% regulated-category surcharge, and says so openly instead of pretending the fee set is complete. If either applies to you, add a small buffer to the estimated fees or increase the editable fee inputs.',
    },
    {
      question: 'How much does Etsy take from each sale?',
      answer:
        'Etsy takes up to four fees: a $0.20 listing fee, a 6.5% transaction fee on the gross (including shipping charged), payment processing (the US default is 3% + $0.25, and it varies by seller country), and — only when the sale came from an Offsite Ad — an ad fee of 15% by default (12% if you sell $10k+/yr), capped at $100. All of these are editable estimates in the calculator, so adjust them if Etsy changes its schedule.',
    },
    {
      question: 'Does this etsy profit calculator work for non-US sellers?',
      answer:
        'Yes — pick your seller country from US, UK, DE, FR, CA, or AU and the calculator applies that country\'s payment-processing fee schedule. Amounts stay in the seller-country currency (USD, GBP, EUR, CAD, AUD) with no FX conversion, so a UK sale uses 4% + £0.20 processing by default.',
    },
    {
      question: 'How do I calculate my profit margin on Etsy?',
      answer:
        'Subtract everything — item cost, shipping label cost, and all Etsy fees — from your sale price plus shipping charged, then divide that net profit by the gross sale amount and multiply by 100. A $25 sale with $5 shipping charged and $14.50 net profit gives a 48.3% margin; this calculator works it out automatically from your inputs.',
    },
  ],
  assumptions: [
    'All fee values are EDITABLE ESTIMATES based on Etsy\'s published fee schedule, last verified 2026-10-01 — not official current fees. Etsy can change fees at any time.',
    'Excludes the regulatory operating fee (0.05%–1.97%, region-specific) and the +2.5% regulated-category surcharge.',
    'Amounts are expressed in the seller-country currency (USD, GBP, EUR, CAD, AUD); no FX conversion is performed.',
    'Each fee line is rounded to the nearest cent (half-up) before summing.',
    'Packaging, labor, taxes, returns, and other overheads beyond item cost and the shipping label are not modeled.',
    'Negative profit is shown as-is with a warning — the tool does not hide losing prices.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Etsy Profit Calculator 2026 – Net Margins | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/etsy-profit-calculator/',
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
          name: 'Etsy Profit Calculator',
          item: 'https://husnainblogger.com/tools/make-money/etsy-profit-calculator/',
        },
      ],
    },
  ],
};
