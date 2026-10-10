import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/scope-creep-fee-calculator/';

export const inputs: ToolInput[] = [
  {
    id: 'originalFee',
    label: 'Original project fee (USD)',
    type: 'number',
    required: true,
    placeholder: '3000',
    validation: { min: 0 },
  },
  {
    id: 'mode',
    label: 'Pricing mode',
    type: 'select',
    required: true,
    options: ['hourly', 'pct-of-fee'],
  },
  {
    id: 'additionalHours',
    label: 'Additional hours (hourly mode)',
    type: 'number',
    required: false,
    placeholder: '5',
    validation: { min: 0 },
  },
  {
    id: 'hourlyRate',
    label: 'Your hourly rate (USD, hourly mode)',
    type: 'number',
    required: false,
    placeholder: '100',
    validation: { min: 0 },
  },
  {
    id: 'creepPct',
    label: 'Scope creep percentage (%, percentage mode)',
    type: 'number',
    required: false,
    placeholder: '15',
    validation: { min: 0, max: 100 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'scopeCreepFee',
    label: 'Scope creep fee',
    type: 'currency',
    description:
    'Free scope creep fee calculator 2026: The extra fee for out-of-scope work, from your own rate or percentage (estimate). Fast, private now.',
  },
  {
    id: 'revisedProjectTotal',
    label: 'Revised project total',
    type: 'currency',
    description:
    'Original fee plus the scope creep fee.',
  },
  {
    id: 'creepAsPctOfOriginal',
    label: 'Creep as % of original fee',
    type: 'percent',
    description:
    'How big the scope creep is relative to the original project fee.',
  },
];

export const content: ToolContent = {
  title: 'Scope Creep Fee Calculator',
  description:
    'Scope creep fee calculator: price extra hours at your hourly rate or a percentage of the original fee, and see the revised project total free.',
  howTo: [
    'Enter the "Original project fee" you agreed with the client.',
    'Pick a "Pricing mode": hourly (extra hours × your hourly rate) or percentage (% of the original fee).',
    'In hourly mode, enter "Additional hours" and "Your hourly rate" — in percentage mode, enter the "Scope creep percentage".',
    'Run the tool to get the scope creep fee, the revised project total, and creep as a % of the original fee.',
    'Share the revised total with your client before doing the extra work — scope fees only work when agreed upfront.',
  ],
  methodology:
    'Hourly mode: scope creep fee = additional hours × your hourly rate. Percentage mode: scope creep fee = original fee × (your percentage ÷ 100). Revised total = original fee + scope creep fee; the creep percentage of the original is a simple ratio. Your rate and percentage are always your own inputs — the tool never suggests one — so every result is an estimate.',
  examples: [
    {
      title: 'Five extra hours at $100/hr',
      inputs: { originalFee: 3000, mode: 'hourly', additionalHours: 5, hourlyRate: 100 },
      note: '$500 scope creep fee; $3,500 revised total (16.67% of the original).',
    },
    {
      title: '15% of the original fee',
      inputs: { originalFee: 3000, mode: 'pct-of-fee', creepPct: 15 },
      note: '$450 scope creep fee; $3,450 revised total.',
    },
    {
      title: 'Zero extra hours',
      inputs: { originalFee: 2000, mode: 'hourly', additionalHours: 0, hourlyRate: 120 },
      note: 'No extra work logged means a $0 scope creep fee and the original $2,000 total.',
    },
  ],
  faqs: [
    {
      question: 'What is the best scope creep fee calculator?',
      answer:
        'The best one charges scope creep the way you actually price it — by the hour or as a percentage of the project. This calculator offers both modes, uses only your own rates, and shows the revised project total instantly, free with no signup.',
    },
    {
      question: 'Is there a free scope creep fee calculator?',
      answer:
        'Yes — this scope creep fee calculator is completely free with no signup. Enter your original fee, pick hourly or percentage mode, and get the scope creep fee and revised total instantly.',
    },
    {
      question: 'How to calculate scope creep fee?',
      answer:
        'Multiply the extra hours by your hourly rate, or take your chosen percentage of the original project fee — then add it to the original fee for the revised total. This tool does both calculations for you from your own numbers.',
    },
    {
      question: 'How does the scope creep fee calculator work?',
      answer:
        'Enter your details using the inputs above and the scope creep fee calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the scope creep fee calculator free to use?',
      answer:
        'Yes - this scope creep fee calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a scope creep fee calculator?',
      answer:
        'A scope creep fee calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the scope creep fee calculator?',
      answer:
        'No account needed. Open the scope creep fee calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'ESTIMATE: every result is computed from YOUR hourly rate or percentage — this tool contains no standard rates and does not recommend what to charge.',
    'Inputs from the mode you did not select are ignored; only the active mode affects the result.',
    'The calculation does not model taxes, payment terms, or contract penalties — only the fee math.',
  ],
  jsonLd: [
  ],
};
