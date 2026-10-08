import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'itemPrice',
    label: 'Item price (per unit)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 25',
    validation: { min: 0 },
  },
  {
    id: 'quantity',
    label: 'Quantity',
    type: 'number',
    required: false,
    placeholder: 'Default 1',
    validation: { min: 1 },
  },
  {
    id: 'shippingCharged',
    label: 'Shipping charged to buyer',
    type: 'number',
    required: false,
    placeholder: 'Default 0',
    validation: { min: 0 },
  },
  {
    id: 'sellerCountry',
    label: 'Seller country',
    type: 'select',
    required: false,
    options: ['US', 'UK', 'DE', 'FR', 'CA', 'AU'],
  },
  {
    id: 'offsiteAdsAttributed',
    label: 'Sale attributed to an Offsite Ad',
    type: 'boolean',
    required: false,
  },
  {
    id: 'offsiteAdsTier',
    label: 'Offsite Ads tier',
    type: 'select',
    required: false,
    options: ['Under $10k/yr sales — 15% rate', '$10k+/yr sales — 12% rate'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'grossRevenue', label: 'Gross sale amount', type: 'currency' },
  { id: 'listingFee', label: 'Listing fee', type: 'currency' },
  { id: 'transactionFee', label: 'Transaction fee (6.5%)', type: 'currency' },
  { id: 'processingFee', label: 'Payment-processing fee', type: 'currency' },
  { id: 'offsiteAdsFee', label: 'Offsite Ads fee (if attributed)', type: 'currency' },
  { id: 'totalFees', label: 'Total fees', type: 'currency' },
  { id: 'netPayout', label: 'Net payout (estimate)', type: 'currency' },
];

const DESCRIPTION =
  'Free Etsy fee calculator 2026: calculate Etsy selling fees, transaction fees & payment processing by country. See your exact profit & net payout instantly.';

export const content: ToolContent = {
  title: 'Etsy Fee Calculator 2026 – Seller Fees | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Enter your Item price per unit and Quantity — the calculator multiplies them for the sale subtotal.',
    'Add the Shipping charged to buyer (if any); Etsy takes its transaction fee on item price + shipping.',
    'Pick your Seller country — payment-processing fees differ (US 3% + $0.25, UK 4% + £0.20, DE/FR 4% + €0.30, CA/AU 3% + $0.25).',
    'Tick "Sale attributed to an Offsite Ad" only if this order came from an offsite ad, and choose your Offsite Ads tier (15% under $10k/yr sales, 12% at/above, capped at $100).',
    'Read the breakdown: each fee line is rounded to the cent and summed, and Net payout shows what the sale leaves you — an estimate, not an exact fee.',
  ],
  methodology:
    'Pure client-side math using Etsy\'s published fee schedule (last verified 2026-10-01): gross = item price × quantity + shipping charged; listing fee = $0.20 × quantity; transaction fee = 6.5% of gross; payment-processing fee = gross × country rate + country fixed fee; offsite ads fee = min(gross × tier rate, $100) only when the sale is ad-attributed. Each fee line is rounded to the nearest cent (half-up) before summing; net payout = gross − total fees. The regulatory operating fee (0.05%-1.97%, region-specific) and the +2.5% regulated-category surcharge are EXCLUDED from this v1 calculation — real fees may be higher. All results are estimates.',
  examples: [
    {
      title: 'US sale: $25 item, $5 shipping',
      inputs: { itemPrice: 25, quantity: 1, shippingCharged: 5, sellerCountry: 'US' },
      note: 'Gross $30.00 — listing $0.20, transaction $1.95, processing $1.15, total fees $3.30, net payout $26.70 (estimate).',
    },
    {
      title: 'UK sale with offsite ad attributed',
      inputs: {
        itemPrice: 100,
        sellerCountry: 'UK',
        offsiteAdsAttributed: true,
        offsiteAdsTier: 'Under $10k/yr sales — 15% rate',
      },
      note: 'Adds the 15% offsite fee ($15.00) on top of the UK 4% + £0.20 processing — shows why ad-attributed sales keep less.',
    },
  ],
  faqs: [
    {
      question: 'What is the best etsy fee calculator?',
      answer:
        'One that shows every fee line separately, supports your seller country (processing fees differ by country), and discloses what it leaves out. This free calculator breaks down listing, transaction, payment-processing, and offsite-ads fees — and states clearly that the regulatory operating fee is excluded from the v1 math.',
    },
    {
      question: 'Is there a free etsy fee calculator?',
      answer:
        'Yes — this calculator is completely free with no signup. It runs entirely in your browser: your price and country are used only for the math and never leave your device.',
    },
    {
      question: 'How to calculate etsy fee?',
      answer:
        'Start with gross = item price × quantity + shipping charged. Subtract: $0.20 listing fee per item, 6.5% transaction fee on the gross, and the payment-processing fee for your country (e.g. US: 3% + $0.25), plus an offsite-ads fee only if the sale was ad-attributed. Note this v1 excludes Etsy\'s regulatory operating fee (0.05%-1.97%, region-specific), so treat the result as an estimate.',
    },
    {
      question: 'How much does Etsy take from a sale in 2026?',
      answer:
        'Etsy takes a $0.20 listing fee per item, 6.5% transaction fee on the total (item + shipping), plus a payment-processing fee that varies by country (US: 3% + $0.25). On a $30 sale, expect roughly $3.30 in total fees before any offsite-ads charges.',
    },
    {
      question: 'What are Etsy fees for UK sellers?',
      answer:
        'UK sellers pay the same $0.20 listing fee and 6.5% transaction fee, but the payment-processing fee is 4% + £0.20 (higher than the US 3% + $0.25). Select "UK" as your seller country above for the exact breakdown in GBP.',
    },
    {
      question: 'Does Etsy charge fees on shipping?',
      answer:
        'Yes — Etsy\'s 6.5% transaction fee applies to the item price PLUS the shipping amount you charge the buyer. This is why entering your shipping cost above matters for an accurate calculation.',
    },
    {
      question: 'What is the Etsy offsite ads fee?',
      answer:
        'If a sale is attributed to an Etsy Offsite Ad, Etsy charges an additional 15% (or 12% if your shop makes $10k+/year), capped at $100 per order. Tick the "Offsite Ad" option above to include it in your calculation.',
    },
  ],
  assumptions: [
    'Fee rates are documented defaults from Etsy\'s published schedule (listing $0.20, transaction 6.5%, processing per country, offsite ads 15%/12% capped at $100), last verified 2026-10-01 — the calculator performs arithmetic on these defaults, not a live fee lookup.',
    'All amounts are in the seller-country currency (USD, GBP, EUR, CAD, or AUD); no FX conversion is performed.',
    'The regulatory operating fee (0.05%-1.97%, region-specific) and the +2.5% regulated-category surcharge are EXCLUDED — your real fees may be higher.',
    'Net payout excludes product cost and shipping label cost; Etsy can change fees at any time — confirm current fees on Etsy\'s official fee page before pricing decisions.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Etsy Fee Calculator 2026 – Seller Fees | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/etsy-fee-calculator/',
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
          name: 'Etsy Fee Calculator',
          item: 'https://husnainblogger.com/tools/make-money/etsy-fee-calculator/',
        },
      ],
    },
  ],
};
