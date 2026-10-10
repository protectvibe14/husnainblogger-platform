import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'salePrice',
    label: 'Sale price (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 24.99',
    validation: { min: 0.01, unit: 'USD' },
  },
  {
    id: 'baseProductCost',
    label: 'Base product cost (USD)',
    type: 'number',
    required: true,
    placeholder: 'Your provider base + print cost, e.g. 12.50',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'platformFeeRate',
    label: 'Platform fee rate (%) — estimate',
    type: 'number',
    required: false,
    placeholder: 'Estimate default 5% — replace with your marketplace rate',
    validation: { min: 0, max: 100, unit: '%' },
  },
  {
    id: 'shippingCost',
    label: 'Shipping cost you cover (USD)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 4.99 (optional)',
    validation: { min: 0, unit: 'USD' },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'platformFee', label: 'Platform fee', type: 'currency' },
  { id: 'netProfit', label: 'Net profit per sale', type: 'currency' },
  { id: 'margin', label: 'Profit margin', type: 'percent' },
];

export const content: ToolContent = {
  title: 'Print on Demand Profit Calculator',
  description:
    'Free print on demand profit calculator 2026: calculate print-on-demand profit per sale: enter your sale price, base product cost. Fast, private -.',
  howTo: [
    'Enter your sale price — the retail price the customer pays, in USD.',
    'Enter your base product cost — what your POD provider charges you (base + print), always your own number.',
    'Set the platform fee rate as a percent. The 5% default is only an estimate placeholder — replace it with your marketplace\u2019s actual fee rate.',
    'Add the shipping cost you cover per order (leave it at 0 if the buyer pays shipping).',
    'Run the calculation to see the platform fee, your net profit per sale, and your margin percent.',
  ],
  methodology:
    'Net profit = sale price − platform fee − base product cost − shipping cost, where platform fee = sale price × fee rate and margin = profit ÷ sale price × 100. It is plain arithmetic — no AI, and no print-provider prices are embedded; the fee-rate default is a labeled estimate placeholder, not any real marketplace\u2019s rate.',
  examples: [
    {
      title: 'T-shirt: $25 sale, $9.50 base cost',
      inputs: { salePrice: 25, baseProductCost: 9.5, platformFeeRate: 5, shippingCost: 4.5 },
      note: 'Platform fee $1.25, net profit $9.75 per shirt, 39% margin.',
    },
    {
      title: 'Hoodie: $49.99 sale, $24 base cost',
      inputs: { salePrice: 49.99, baseProductCost: 24, platformFeeRate: 6, shippingCost: 0 },
      note: 'Platform fee $3.00, net profit $22.99, 46% margin — shipping passed to the buyer.',
    },
    {
      title: 'Thin-margin mug listing',
      inputs: { salePrice: 16.95, baseProductCost: 11.2, platformFeeRate: 8, shippingCost: 3.99 },
      note: 'Net profit $0.40, 2.4% margin — flags a listing that needs a price increase.',
    },
  ],
  faqs: [
    {
      question: 'What is the best print on demand profit calculator?',
      answer:
        'The best one lets you enter your own provider costs instead of guessing them for you. This free calculator uses only numbers you provide — sale price, your provider\u2019s base cost, your marketplace\u2019s fee rate, and shipping — and shows fee, profit, and margin with the formula spelled out.',
    },
    {
      question: 'Is there a free print on demand profit calculator?',
      answer:
        'Yes — this calculator is completely free with no signup. Enter your sale price, base product cost, platform fee rate, and shipping to see your per-sale profit and margin instantly.',
    },
    {
      question: 'How to calculate print on demand profit?',
      answer:
        'Subtract everything you pay from the sale price: your provider\u2019s base + print cost, the marketplace\u2019s fee on the sale, and any shipping you cover. Divide the result by the sale price and multiply by 100 for the margin percent.',
    },
    {
      question: 'How does a print on demand profit calculator work?',
      answer:
        'It applies simple arithmetic to your inputs: platform fee = sale price × fee rate, then profit = sale price − platform fee − base cost − shipping. It never invents provider prices — Printful, Printify, and others change pricing, so your own numbers are the only honest inputs.',
    },
    {
      question: 'What is a print on demand profit calculator?',
      answer:
        'A print on demand profit calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'No print-provider prices are embedded — the base product cost is always your own number from your provider\u2019s pricing.',
    'The 5% platform fee rate default is an estimate placeholder, not any real marketplace\u2019s rate — replace it with the rate your marketplace actually charges.',
    'Results are estimates for planning, not accounting or tax advice; marketplaces can change fee schedules at any time.',
    'Ad spend, returns, taxes, and design costs are not included — add them to your base cost if you want them reflected.',
  ],
  jsonLd: [],
};
