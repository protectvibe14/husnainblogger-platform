import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'contractAmount',
    label: 'Contract amount (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 500',
    validation: { min: 0.01, max: 1000000000, unit: 'USD' },
  },
  {
    id: 'serviceFeeRate',
    label: 'Service fee rate (%) — user-adjustable estimate',
    type: 'number',
    required: false,
    placeholder: '10 (default estimate; 0–15%)',
    validation: { min: 0, max: 15, unit: 'percent' },
  },
  {
    id: 'connectsUsed',
    label: 'Connects used to win the work (optional)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 16',
    validation: { min: 0, max: 100000, unit: 'count' },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'serviceFee', label: 'Service fee', type: 'currency' },
  { id: 'netPayout', label: 'Net payout', type: 'currency' },
  { id: 'connectsCost', label: 'Connects cost (pre-sale)', type: 'currency' },
  { id: 'note', label: 'Estimate note', type: 'text' },
];

const DESCRIPTION =
  'Calculate your Upwork take-home pay with this free upwork fee calculator — set the contract amount and fee rate to see your net payout instantly. Try it free.';

export const content: ToolContent = {
  title: 'Upwork Fee Calculator',
  description: DESCRIPTION,
  howTo: [
    'Enter your contract amount in USD — the full earnings figure before fees.',
    'Check the service fee rate: it defaults to 10% (an estimate) and can be adjusted anywhere from 0–15% to match your contract type.',
    'Optionally enter how many Connects you spent to win the work — this shows as a separate pre-sale cost line.',
    'Run the calculation to see the service fee, your net payout, and the Connects cost side by side.',
    'Adjust the rate if your contract falls in a different fee tier — Upwork fees change, so verify the current schedule.',
  ],
  methodology:
    'This is pure arithmetic with no AI and no live data: service fee = contract amount × service fee rate, and net payout = contract amount − service fee. The Connects cost line = Connects used × $0.15 (the typical per-Connect price) and is shown separately because bidding happens before you earn anything. The fee rate is never hardcoded — it is your input, defaulting to a 10% labeled estimate.',
  examples: [
    {
      title: '$500 contract at 10%',
      inputs: { contractAmount: 500, serviceFeeRate: 10 },
      note: 'Service fee $50.00, net payout $450.00.',
    },
    {
      title: '$1,200 contract with Connects',
      inputs: { contractAmount: 1200, serviceFeeRate: 10, connectsUsed: 16 },
      note: 'Service fee $120.00, net payout $1,080.00, Connects cost $2.40 shown as a separate pre-sale line.',
    },
    {
      title: 'Bring-your-own-client rate',
      inputs: { contractAmount: 800, serviceFeeRate: 0 },
      note: 'A 0% rate leaves the full $800.00 payout — rates are fully user-adjustable.',
    },
  ],
  faqs: [
    {
      question: 'What is the best upwork fee calculator?',
      answer:
        'The best one is the one that does not hardcode a single fee: Upwork charges 0–15% depending on the contract type, so a calculator that lets you adjust the rate (like this one, defaulting to a 10% estimate) gives a more honest answer than one with a fixed percentage.',
    },
    {
      question: 'Is there a free upwork fee calculator?',
      answer:
        'Yes — this upwork fee calculator is completely free with no signup. Enter your contract amount, set the fee rate that matches your contract, and get your net payout instantly.',
    },
    {
      question: 'How to calculate upwork fee?',
      answer:
        'Multiply your contract amount by your service fee rate (0–15% depending on the contract type), then subtract the fee from the contract amount to get your net payout. Do not forget the pre-sale bidding cost: each Connect you spent costs about $0.15.',
    },
    {
      question: 'How does the upwork fee calculator work?',
      answer:
        'Enter your details using the inputs above and the upwork fee calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the upwork fee calculator free to use?',
      answer:
        'Yes - this upwork fee calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an upwork fee calculator?',
      answer:
        'An upwork fee calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the upwork fee calculator?',
      answer:
        'No account needed. Open the upwork fee calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'The 10% default service fee rate is a labeled ESTIMATE — Upwork\'s fee is variable per contract (0–15%) and can change; always verify the current schedule.',
    'The rate is user-adjustable and never hardcoded; the result is only as accurate as the rate you enter.',
    'Connects cost (~$0.15/Connect) is a pre-sale bidding cost shown as a separate line — it is NOT subtracted from the payout.',
    'All amounts are USD; no currency conversion is performed.',
    'Results are estimates, not exact fee invoices.',
  ],
  jsonLd: [
  ],
};
