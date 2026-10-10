import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/platform-fee-comparer/';

export const inputs: ToolInput[] = [
  {
    id: 'salePrice',
    label: 'Sale price',
    type: 'number',
    required: true,
    placeholder: 'e.g. 29.99',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'platforms',
    label: 'Platforms and their fees (one per line)',
    type: 'textarea',
    required: true,
    placeholder: 'e.g.\nGumroad, 10, 0.30\nKo-fi, 5, 0\n(one per line: platform name, fee %, fixed fee)',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'netPayoutPerPlatform',
    label: 'Net payout per platform',
    type: 'table',
    description:
    'Free gumroad vs etsy fees 2026: Platforms ranked by net payout, highest first. free.',
  },
  {
    id: 'bestNetPayout',
    label: 'Best net payout',
    type: 'text',
    description:
    'The platform with the highest net payout, or a tie note.',
  },
  {
    id: 'feeBreakdownPerPlatform',
    label: 'Fee breakdown per platform',
    type: 'list',
    description:
    'How each platform’s fees were computed from your entered fees.',
  },
];

export const content: ToolContent = {
  title: 'Gumroad Vs Etsy Fees Calculator',
  description:
    'Compare gumroad vs etsy fees on any sale price: enter each platform\u2019s fee % and fixed fee to see ranked net payouts. No fee data stored \u2014 try.',
  howTo: [
    'Enter your sale price in USD (e.g. 29.99).',
    'Add one platform per line in the platforms box: name, fee %, fixed fee — e.g. "Gumroad, 10, 0.30".',
    'Look up each platform’s current fees in its own pricing docs and type them in; this tool stores no fee schedules.',
    'Run the tool to see every platform ranked by net payout, the highest-payout platform, and a per-platform fee breakdown.',
    'Re-run whenever a platform changes its fees — old entries go stale fast.',
  ],
  methodology:
    'Formula J-PLATFORM-FEE: fee amount = sale price × (fee % / 100) + fixed fee; net payout = sale price − fee amount (floored at $0). Platforms are ranked by net payout descending; equal top payouts are reported as a tie. Every fee value is entered by you — the tool contains no platform fee data and performs no AI inference. Money values are rounded to 2 decimals.',
  examples: [
    {
      title: '$29.99 ebook on three platforms',
      inputs: { salePrice: 29.99, platforms: 'Gumroad, 10, 0.30\nKo-fi, 5, 0\nEtsy, 6.5, 0.20' },
      note: 'Ko-fi wins at $28.49 net (based on the entered fees); the breakdown shows exactly how each fee was computed.',
    },
    {
      title: '$100 course, two platforms tied',
      inputs: { salePrice: 100, platforms: 'Platform A, 10, 0\nPlatform B, 5, 5' },
      note: 'Both net $90.00, so the result reports a tie instead of picking a false winner.',
    },
  ],
  faqs: [
    {
      question: 'What is the best gumroad vs etsy fees?',
      answer:
        'It depends on your price point, because each platform mixes a percentage fee with a fixed fee differently. This free comparer ranks platforms by net payout on YOUR sale price using the fees you enter from each platform’s current pricing docs.',
    },
    {
      question: 'Is there a free gumroad vs etsy fees?',
      answer:
        'Yes — this fee comparer is completely free with no signup. Enter a sale price and each platform’s fee % and fixed fee to see ranked net payouts instantly.',
    },
    {
      question: 'How to use gumroad vs etsy fees?',
      answer:
        'Enter your sale price, then add one line per platform in the format "name, fee %, fixed fee" (e.g. "Gumroad, 10, 0.30"). Run the tool to get a ranked payout table, the best-payout platform, and a per-platform breakdown.',
    },
    {
      question: 'How does a gumroad vs etsy fees work?',
      answer:
        'The tool computes fee amount = price × (fee % / 100) + fixed fee, then net payout = price − fees, for each platform you listed. It stores no platform fee schedules: every fee number must be entered by you, so verify them against the platform’s official pricing before deciding.',
    },
    {
      question: 'What is a gumroad vs etsy fees?',
      answer:
        'A gumroad vs etsy fees is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Is this gumroad vs etsy fees calculator calculator accurate?',
      answer: 'Yes, it uses standard formulas and up-to-date rates. However, treat the result as an estimate for planning — actual figures may vary based on your specific situation.',
    },
    {
      question: 'What is a good gumroad vs etsy fees calculator?',
      answer: 'It depends on your industry, location, and experience level. Use the calculator to benchmark different scenarios, then compare against published averages for your niche.',
    },
  ],
  assumptions: [
    'All fees are entered by you — the tool contains no platform fee schedules. Verify every fee % and fixed fee against the platform’s official pricing docs.',
    'Platform fees change over time; results go stale if you reuse old fee numbers.',
    'Net payout is floored at $0 — fees can never produce a negative payout here.',
    'This is an estimate for comparison only, not financial or tax advice.',
  ],
  jsonLd: [],
};
