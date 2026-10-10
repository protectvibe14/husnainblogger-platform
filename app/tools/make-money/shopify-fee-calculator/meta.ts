import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'orderValue',
    label: 'Average order value (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 50',
    validation: { min: 0.01, unit: 'USD' },
  },
  {
    id: 'ordersPerMonth',
    label: 'Orders per month',
    type: 'number',
    required: true,
    placeholder: 'e.g. 100',
    validation: { min: 0 },
  },
  {
    id: 'plan',
    label: 'Shopify plan',
    type: 'select',
    required: true,
    options: ['basic', 'grow', 'advanced', 'plus'],
  },
  {
    id: 'useShopifyPayments',
    label: 'I use Shopify Payments',
    type: 'boolean',
    required: false,
  },
  {
    id: 'gatewayRate',
    label: "Your gateway's own fee rate (%) — estimate",
    type: 'number',
    required: false,
    placeholder: 'Required if you use a third-party gateway, e.g. 2.9',
    validation: { min: 0, max: 100, unit: '%' },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'processingFees', label: 'Card processing fees', type: 'currency' },
  { id: 'gatewaySurcharge', label: 'Third-party gateway surcharge', type: 'currency' },
  { id: 'monthlySubscription', label: 'Monthly subscription', type: 'currency' },
  { id: 'totalMonthlyCost', label: 'Total monthly Shopify cost', type: 'currency' },
  { id: 'effectiveRate', label: 'Effective fee rate', type: 'percent' },
];

export const content: ToolContent = {
  title: 'Shopify Fee Calculator',
  description:
    'Free shopify fee calculator 2026: pick your plan and enter average order value and orders per month to see fees, subscription, and effective rate.',
  keywords: ['shopify fee calculator uk', 'shopify fee calculator us', 'shopify payment fee calculator', 'shopify price calculator app', 'shopify pricing calculator'],
  howTo: [
    'Enter your average order value in USD and how many orders you get per month.',
    'Choose your Shopify plan: basic, grow, advanced, or plus.',
    'Leave "I use Shopify Payments" on if you process cards through Shopify; turn it off if you use a third-party gateway.',
    'If you use a third-party gateway, enter that gateway\u2019s own fee rate as a percent — it stacks on top of Shopify\u2019s surcharge.',
    'Review card processing fees, gateway surcharge, subscription, total monthly cost, and your effective fee rate.',
  ],
  methodology:
    'Each plan maps to a fixed estimate table in code (subscription, online card rate, third-party gateway surcharge); monthly cost = subscription + orders × (order value × card rate + $0.30) + the stacked gateway surcharge, and effective rate = total ÷ gross revenue × 100. It is plain arithmetic — no AI. All plan numbers are documented estimates because Shopify changes plans and fees.',
  examples: [
    {
      title: 'Basic plan, 100 orders at $50',
      inputs: { orderValue: 50, ordersPerMonth: 100, plan: 'basic', useShopifyPayments: true },
      note: 'Processing $175, subscription $39, total $214/month — an effective 4.28% rate.',
    },
    {
      title: 'Grow plan with a third-party gateway',
      inputs: {
        orderValue: 50,
        ordersPerMonth: 100,
        plan: 'grow',
        useShopifyPayments: false,
        gatewayRate: 2.5,
      },
      note: 'Shopify surcharge plus your gateway\u2019s 2.5% stack to $175 in gateway fees; total $445/month.',
    },
    {
      title: 'New store, zero orders yet',
      inputs: { orderValue: 50, ordersPerMonth: 0, plan: 'basic', useShopifyPayments: true },
      note: 'Still shows the $39 subscription — you pay it even with no sales.',
    },
  ],
  faqs: [
    {
      question: 'What is the best shopify fee calculator?',
      answer:
        'The best one separates the subscription from per-order fees and handles third-party gateways. This free calculator shows processing fees, the stacked third-party gateway surcharge, the monthly subscription, and your effective rate across plans.',
    },
    {
      question: 'Is there a free shopify fee calculator?',
      answer:
        'Yes — this calculator is completely free with no signup. Pick your plan, enter your average order value and monthly orders, and see the full monthly cost breakdown instantly.',
    },
    {
      question: 'How to calculate shopify fee?',
      answer:
        'Add three parts: the monthly subscription, card processing (orders × (order value × card rate + $0.30)), and — if you skip Shopify Payments — Shopify\u2019s third-party gateway surcharge stacked on top of your gateway\u2019s own fee. Divide the total by your gross revenue for the effective rate.',
    },
    {
      question: 'What are Shopify\u2019s plan fees in 2026?',
      answer:
        'The calculator\u2019s estimate table uses: Basic $39/month with 2.9% + $0.30 per online order, Grow $105/month with 2.7% + $0.30, Advanced $399/month with 2.5% + $0.30, and Plus from $2,300/month at roughly 2.2% + $0.30. These are documented estimates, not official current rates — verify Shopify\u2019s pricing page before making decisions.',
    },
    {
      question: 'What happens if I don\u2019t use Shopify Payments?',
      answer:
        'Shopify adds a third-party gateway surcharge on every order — 2.0% on Basic, 1.0% on Grow, 0.6% on Advanced, and none on Plus — and it stacks on top of your gateway\u2019s own fee. Toggle Shopify Payments off in the calculator and enter your gateway\u2019s rate to see the stacked total.',
    },
    {
      question: 'Does this calculator include PayPal or wallet fees?',
      answer:
        'No — it models online card processing only. PayPal and digital-wallet transactions (roughly 3.49% + $0.49 per order across plans) are out of scope, so if you take a lot of PayPal payments your real costs will run higher than the estimate.',
    },
    {
      question: 'How is the effective fee rate calculated?',
      answer:
        'The calculator divides your total monthly Shopify cost (subscription + processing + any gateway surcharge) by your gross revenue and multiplies by 100. For example, 100 orders at $50 on the Basic plan cost $214/month total — a 4.28% effective rate that shows the real bite per revenue dollar.',
    },
  ],
  assumptions: [
    'All plan numbers (subscriptions, card rates, third-party surcharges) are estimates fixed in code — Shopify changes plans and fees, so verify current rates on Shopify\u2019s official pricing page before making decisions.',
    'Models online card processing only; PayPal and wallet transactions (~3.49% + $0.49) are out of scope.',
    'The third-party gateway output stacks Shopify\u2019s surcharge on top of your gateway\u2019s own fee rate, which you must enter yourself.',
    'Results are estimates for planning, not accounting or financial advice.',
  ],
  jsonLd: [
  ],
};
