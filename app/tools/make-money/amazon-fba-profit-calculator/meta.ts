import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'salePrice',
    label: 'Item sale price',
    type: 'number',
    required: true,
    placeholder: 'e.g. 29.99',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'referralRate',
    label: 'Referral fee % (estimate — 15 default; electronics 8)',
    type: 'number',
    required: false,
    placeholder: '15 — set it for your category',
    validation: { min: 0, max: 100, unit: '%' },
  },
  {
    id: 'fulfillmentFee',
    label: 'FBA fulfillment fee (look up your size/weight tier in Amazon\'s fee table)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 5.15 — you enter it, v1 does not guess it',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'productCost',
    label: 'Landed product cost per unit',
    type: 'number',
    required: false,
    placeholder: 'e.g. 9.50 — product + freight per unit',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'unitsPerMonth',
    label: 'Expected units sold per month',
    type: 'number',
    required: false,
    placeholder: 'e.g. 100 — monthly profit scales with this',
    validation: { min: 0 },
  },
  {
    id: 'storageCost',
    label: 'Monthly FBA storage cost (optional, monthly figure)',
    type: 'number',
    required: false,
    placeholder: '0 — folded into the per-unit total as a v1 approximation',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'fuelSurchargeRate',
    label: 'Fuel surcharge % of fulfillment fee (estimate — 3.5 default)',
    type: 'number',
    required: false,
    placeholder: '3.5 — edit if Amazon changes it',
    validation: { min: 0, max: 100, unit: '%' },
  },
  {
    id: 'otherFeesPerUnit',
    label: 'Other per-unit fees (optional: inbound placement, low-inventory, plan fee)',
    type: 'number',
    required: false,
    placeholder: '0',
    validation: { min: 0, unit: 'USD' },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'referralFee', label: 'Referral fee (estimate)', type: 'currency' },
  { id: 'fuelSurcharge', label: 'Fuel surcharge (estimate)', type: 'currency' },
  { id: 'totalAmazonFees', label: 'Total Amazon fees (estimate)', type: 'currency' },
  { id: 'netProfitPerUnit', label: 'Net profit per unit (estimate)', type: 'currency' },
  { id: 'monthlyProfit', label: 'Estimated monthly profit', type: 'currency' },
  { id: 'margin', label: 'Profit margin (estimate)', type: 'percent' },
  {
    id: 'roi',
    label: 'Return on investment (estimate)',
    type: 'percent',
    description: 'Not shown when product cost is $0.',
  },
];

const DESCRIPTION =
  'Free amazon fba profit calculator 2026: Not shown when product cost is $0. Instant, private, and mobile-friendly. No signup - try it free!';

export const content: ToolContent = {
  title: 'Amazon FBA Profit Calculator 2026 – Free | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Enter your item sale price and your landed product cost per unit.',
    'Look up your size/weight tier in Amazon\'s official FBA fee table and type the fulfillment fee in — v1 does not guess the rate card.',
    'Set the referral fee % for your category (15% default; electronics/computers are 8%) and your expected monthly units.',
    'Optionally add monthly storage cost and any other per-unit fees (inbound placement, low-inventory, seller-plan fee).',
    'Run the calculator to see referral fee, fulfillment and surcharge fees, net profit per unit, monthly profit, margin, and ROI — all labeled estimates.',
  ],
  methodology:
    'Referral fee = sale price × referral rate (15% default). Fuel surcharge = fulfillment fee × fuel rate (3.5% default). Total Amazon fees = referral + fulfillment + fuel surcharge + storage + other per-unit fees. Net profit per unit = sale price − total Amazon fees − product cost; monthly profit = per-unit profit × monthly units; margin = profit ÷ sale price; ROI = profit ÷ product cost. The fulfillment fee is user-entered because Amazon\'s size/weight rate card is too granular for v1 — nothing about the fee schedule is hardcoded as fact. All fee inputs are editable estimates; verify Amazon\'s current fees before deciding.',
  examples: [
    {
      title: '$30 gadget, 100 units/month',
      inputs: { salePrice: 30, fulfillmentFee: 5, productCost: 10, unitsPerMonth: 100 },
      note: 'Referral $4.50, fuel surcharge $0.18, total Amazon fees $9.68 — net profit $10.32/unit, $1,032/month, 34.4% margin, 103.2% ROI (estimates).',
    },
    {
      title: 'Electronics at 8% referral',
      inputs: { salePrice: 100, referralRate: 8, fulfillmentFee: 6, productCost: 40, unitsPerMonth: 10 },
      note: 'Net profit $45.79/unit, $457.90/month, 45.8% margin, 114.5% ROI (estimates).',
    },
  ],
  faqs: [
    {
      question: 'What is the best amazon fba profit calculator?',
      answer:
        'A good FBA calculator separates the referral fee, fulfillment fee, and surcharges instead of hiding them in one number — and never hardcodes Amazon\'s whole size/weight rate card as fact. This free calculator does that, with every fee editable and labeled an estimate.',
    },
    {
      question: 'Is there a free amazon fba profit calculator?',
      answer:
        'Yes — this Amazon FBA profit calculator is completely free with no signup. Enter your price, product cost, and fulfillment fee to estimate per-unit profit, monthly profit, margin, and ROI.',
    },
    {
      question: 'How to calculate amazon fba profit?',
      answer:
        'Take your sale price and subtract the referral fee (your category\'s rate), the FBA fulfillment fee for your size/weight tier, the fuel surcharge, storage, any other per-unit fees, and your landed product cost. Multiply the per-unit profit by your monthly units for monthly profit.',
    },
    {
      question: 'Why do I have to enter the fulfillment fee myself?',
      answer:
        'Amazon\'s fulfillment fee depends on a detailed size-and-weight tier table that changes — hardcoding it would mean silently wrong numbers. You look up your tier once in Amazon\'s official fee table and type it in; the calculator is honest about what it does not know.',
    },
    {
      question: 'How does the amazon fba profit calculator work?',
      answer:
        'Enter your details using the inputs above and the amazon fba profit calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the amazon fba profit calculator free to use?',
      answer:
        'Yes - this amazon fba profit calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an amazon fba profit calculator?',
      answer:
        'An amazon fba profit calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'All fee figures are user-editable ESTIMATES — Amazon changes fees and they vary by category, size tier, and region. Verify in Amazon\'s official fee schedule.',
    'Referral default 15% (electronics/computers 8%; other categories differ) — set it for your category.',
    'Fulfillment fee is user-entered: v1 does not hardcode Amazon\'s size/weight rate card.',
    'Fuel surcharge default 3.5% of the fulfillment fee — user-editable estimate.',
    'Storage cost is a MONTHLY figure folded into the per-unit total as a v1 approximation — for precise unit economics, divide monthly storage by your units and use "other fees per unit" instead.',
    'Seller-plan fee (Professional $39.99/mo vs Individual $0.99/item) is not included — add it to other per-unit fees if you want it counted.',
    'Not modeled: inbound placement fees, low-inventory-level fees, returns/refunds, advertising (PPC), or taxes.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Amazon FBA Profit Calculator 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/amazon-fba-profit-calculator/',
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
          name: 'Amazon FBA Profit Calculator',
          item: 'https://husnainblogger.com/tools/make-money/amazon-fba-profit-calculator/',
        },
      ],
    },
  ],
};
