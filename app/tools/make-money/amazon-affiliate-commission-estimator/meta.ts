import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'category',
    label: 'Product category',
    type: 'select',
    required: true,
    options: [
      'Games (20%)',
      'Luxury Beauty (10%)',
      'Music & Handmade (5%)',
      'Books, Kitchen & Automotive (4.5%)',
      'Devices & Fashion (4%)',
      'All Other Categories (4%)',
      'Home (3%)',
      'PC Components (2.5%)',
      'TVs & Digital Video Games (2%)',
      'Grocery & Health/Personal Care (1%)',
    ],
  },
  {
    id: 'monthlySales',
    label: 'Referred monthly sales',
    type: 'number',
    required: true,
    placeholder: 'e.g. 100',
    validation: { min: 0.000001, unit: 'sales' },
  },
  {
    id: 'avgOrderValue',
    label: 'Average order value (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 50',
    validation: { min: 0.01, unit: 'USD' },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'commissionRate', label: 'Commission rate', type: 'percent' },
  { id: 'estimatedCommission', label: 'Estimated monthly commission', type: 'currency' },
  { id: 'disclaimer', label: 'Honesty disclaimer', type: 'text' },
];

const DESCRIPTION =
  'Forecast affiliate income with this Amazon affiliate commission calculator — category rates applied to expected sales, with clear USD estimates.';

export const content: ToolContent = {
  title: 'Amazon Affiliate Commission Calculator',
  description: DESCRIPTION,
  howTo: [
    'Pick the product category from the list — each one carries its US Associates rate (Games 20%, Grocery 1%, and so on).',
    'Enter your referred monthly sales — the number of Amazon orders your links are expected to generate.',
    'Enter your average order value in USD.',
    'Run the calculation: monthly sales × average order value × category rate gives your estimated commission.',
    'Read the disclaimer under the result — then verify the CURRENT rate for your category on Amazon before making decisions.',
  ],
  methodology:
    'The tool multiplies your referred monthly sales by your average order value and then by the category rate from a bundled static copy of the US Amazon Associates rate card (spec source date 2026-10-01). It is pure arithmetic over that rate card — there is no live lookup of Amazon data, and the result rounds half-up to two decimals.',
  examples: [
    {
      title: 'Gaming gear blog',
      inputs: { category: 'Games (20%)', monthlySales: 100, avgOrderValue: 50 },
      note: '100 referred sales at a $50 average order value at the 20% Games rate = $1,000 estimated commission.',
    },
    {
      title: 'Grocery deal site',
      inputs: { category: 'Grocery & Health/Personal Care (1%)', monthlySales: 1000, avgOrderValue: 10 },
      note: '1,000 referred sales at a $10 average order value at the 1% Grocery rate = $100 estimated commission.',
    },
  ],
  faqs: [
    {
      question: 'What is amazon affiliate commission?',
      answer: 'This is a common question about what is amazon affiliate commission. Use the tool above to get your answer instantly - it is free and requires no signup.',
    },
    {
      question: 'What is the best amazon affiliate commission calculator?',
      answer:
        'The best calculator is one that states exactly which rate card it uses, because rates differ by category and marketplace. This free tool multiplies your sales by the bundled US Amazon Associates rate card — always verify the current rate for your category on Amazon itself before relying on the result.',
    },
    {
      question: 'Is there a free amazon affiliate commission calculator?',
      answer:
        'Yes — this calculator is completely free with no signup. Enter your category, monthly sales, and average order value to get an instant estimate based on the bundled US Associates rate card.',
    },
    {
      question: 'How to calculate amazon affiliate commission?',
      answer:
        'Multiply your referred monthly sales by your average order value, then multiply by the commission rate for the product category. For example, 100 sales × $50 × the 20% Games rate = $1,000. Amazon changes rates periodically, so verify the current rate for your category on Amazon.',
    },
    {
      question: 'What is the Amazon Associates commission rate in 2026?',
      answer:
        'Rates vary by category in this tool\'s bundled US rate card: Games 20%, Luxury Beauty 10%, Music & Handmade 5%, Books, Kitchen & Automotive 4.5%, Devices & Fashion 4%, All Other Categories 4%, Home 3%, PC Components 2.5%, TVs & Digital Video Games 2%, and Grocery & Health/Personal Care 1%. The card is a static copy dated 2026-10-01 — always verify the current rate on Amazon before deciding.',
    },
    {
      question: 'Which Amazon product categories pay the highest commission?',
      answer:
        'Games pays the highest at 20%, followed by Luxury Beauty at 10% and Music & Handmade at 5%. Grocery & Health/Personal Care pays the lowest at 1%. Pick your exact category in the tool — close guesses can swing the estimate a lot.',
    },
    {
      question: 'Does this calculator work for Amazon UK or other marketplaces?',
      answer:
        'No — it uses a bundled copy of the US Amazon Associates rate card only. Other marketplaces like the UK, Germany, and India publish their own rate tables, so results here do not apply outside the US.',
    },
    {
      question: 'Are returns and cancellations included in the estimate?',
      answer:
        'No. The tool multiplies referred sales × average order value × category rate for a gross estimate — returns, cancellations, and any fees are not modeled, so treat the number as a ceiling, not a payout guarantee.',
    },
  ],
  assumptions: [
    'Uses a static copy of the US Amazon Associates rate card only (spec source date 2026-10-01) — NOT live data; Amazon changes rates periodically.',
    'Other Amazon marketplaces (UK, DE, IN, …) use different rates and are not covered by this tool.',
    'The category list should be verified by the user at use time; verify the current rate on Amazon before making decisions.',
    'Returns, cancellations, and fees are not modeled — the output is a gross commission estimate, not a payout guarantee.',
  ],
  jsonLd: [],
};
