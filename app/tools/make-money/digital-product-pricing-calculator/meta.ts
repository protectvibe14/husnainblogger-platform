import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'productionCost',
    label: 'Production cost per unit (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 5',
    validation: { min: 0 },
  },
  {
    id: 'desiredMargin',
    label: 'Desired profit margin (%)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 40',
    validation: { min: 0, max: 99.99 },
  },
  {
    id: 'platformFeeRate',
    label: 'Platform / marketplace fee rate (%)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 10 — enter your marketplace\u2019s fee',
    validation: { min: 0, max: 99.99 },
  },
  {
    id: 'unitsPerMonth',
    label: 'Expected units sold per month',
    type: 'number',
    required: true,
    placeholder: 'e.g. 100',
    validation: { min: 1 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'suggestedPrice', label: 'Suggested price', type: 'currency' },
  { id: 'profitPerUnit', label: 'Profit per unit (after fee)', type: 'currency' },
  { id: 'monthlyProfit', label: 'Estimated monthly profit', type: 'currency' },
];

export const content: ToolContent = {
  title: 'Digital Product Pricing Calculator',
  description:
    'Price your products for profit with this free digital product pricing calculator — factor in costs, margins, and platform fees. Try it free today.',
  howTo: [
    'Enter your production cost per unit in USD (0 if the product costs nothing to reproduce).',
    'Enter the profit margin you want as a percent \u2014 this is the share of take-home you keep after the fee.',
    'Enter your marketplace\u2019s platform fee rate as a percent (check the marketplace\u2019s current fee \u2014 fees change).',
    'Enter how many units you expect to sell per month, then run the calculation.',
    'Read the suggested price, profit per unit after the fee, and estimated monthly profit \u2014 then sanity-check the price against what buyers actually pay.',
  ],
  methodology:
    'Pure arithmetic on your inputs using the cost-plus method, solved \u2014 not naively added \u2014 for the platform fee: suggested price = production cost \u00f7 ((1 \u2212 fee rate) \u00d7 (1 \u2212 margin)), so the fee is backed out of your margin instead of stacked on top. Cost-plus is a pricing method, not a market price: it guarantees your target margin on paper, but competition and what buyers will actually pay decide what sells.',
  examples: [
    {
      title: 'Ebook with a 40% margin target',
      inputs: { productionCost: 5, desiredMargin: 40, platformFeeRate: 10, unitsPerMonth: 100 },
      note: 'Suggested price $9.26: after the 10% fee you keep $3.33 per unit, about $333.00 per month.',
    },
    {
      title: 'Template pack on a 20%-fee marketplace',
      inputs: { productionCost: 10, desiredMargin: 50, platformFeeRate: 20, unitsPerMonth: 50 },
      note: 'Suggested price $25.00: after the 20% fee you keep $10.00 per unit, about $500.00 per month.',
    },
  ],
  faqs: [
    {
      question: 'What is the best digital product pricing calculator?',
      answer:
        'The best digital product pricing calculator solves for the platform fee instead of just adding your margin to your cost \u2014 otherwise the fee silently eats your margin. This free tool does that solved cost-plus math. Remember: cost-plus is a method, not a market price; always check what buyers actually pay.',
    },
    {
      question: 'Is there a free digital product pricing calculator?',
      answer:
        'Yes \u2014 this digital product pricing calculator is completely free with no signup. Enter your cost, target margin, platform fee rate, and expected sales to get a suggested price, per-unit profit, and estimated monthly profit.',
    },
    {
      question: 'How does the digital product pricing calculator work?',
      answer:
        'Enter your details using the inputs above and the digital product pricing calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the digital product pricing calculator free to use?',
      answer:
        'Yes - this digital product pricing calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a digital product pricing calculator?',
      answer:
        'A digital product pricing calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the digital product pricing calculator?',
      answer:
        'No account needed. Open the digital product pricing calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
    {
      question: 'How accurate is the digital product pricing calculator?',
      answer:
        'The digital product pricing calculator uses transparent arithmetic on the values you enter - what you see is exactly what the math produces. Always double-check critical numbers against official sources, as rates and rules can change.',
    },
  ],
  assumptions: [
    'Cost-plus pricing is a method, not a market price \u2014 it guarantees your target margin arithmetically but does not guarantee customers will pay that price.',
    'The platform fee rate is user-entered; no external fee data is used \u2014 check your marketplace\u2019s current fee, since fees change.',
    'A 100% margin or 100% platform fee makes the price unsolvable and is rejected as invalid input.',
    'Results are estimates in USD; taxes and currency conversion are not included.',
  ],
  jsonLd: [
  ],
};
