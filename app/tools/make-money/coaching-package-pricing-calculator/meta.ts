import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'sessionsPerPackage',
    label: 'Sessions per package',
    type: 'number',
    required: true,
    placeholder: 'e.g. 8',
    validation: { min: 1 },
  },
  {
    id: 'sessionLengthMin',
    label: 'Session length (minutes)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 60',
    validation: { min: 1, unit: 'minutes' },
  },
  {
    id: 'hourlyValue',
    label: 'Your hourly value (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 150',
    validation: { min: 0.01, unit: 'USD' },
  },
  {
    id: 'programWeeks',
    label: 'Program duration (weeks)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 8',
    validation: { min: 1, unit: 'weeks' },
  },
  {
    id: 'supportHours',
    label: 'Between-session support hours',
    type: 'number',
    required: false,
    placeholder: 'e.g. 4 — enter 0 if none',
    validation: { min: 0, unit: 'hours' },
  },
  {
    id: 'packageDiscount',
    label: 'Package discount vs 1:1 rate (%)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 10 — your choice, not a market norm',
    validation: { min: 0, max: 100, unit: '%' },
  },
  {
    id: 'supportRate',
    label: 'Support valued at % of hourly rate',
    type: 'number',
    required: false,
    placeholder: 'e.g. 50',
    validation: { min: 0, max: 100, unit: '%' },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'packagePrice', label: 'Package price', type: 'currency' },
  { id: 'pricePerSession', label: 'Price per session', type: 'currency' },
  { id: 'priceRangeLow', label: 'Sensitivity range — low', type: 'currency' },
  { id: 'priceRangeHigh', label: 'Sensitivity range — high', type: 'currency' },
  { id: 'effectiveHourly', label: 'Effective hourly rate', type: 'currency' },
  { id: 'honestyLabel', label: 'Honesty label', type: 'text' },
];

const DESCRIPTION =
  'Price your coaching package from your hourly rate, sessions, support hours, and discount with this free coaching package pricing tool. Get your numbers now.';

export const content: ToolContent = {
  title: 'Coaching Package Pricing',
  description: DESCRIPTION,
  howTo: [
    'Enter how many 1:1 sessions the package includes and how long each session runs in minutes.',
    'Enter your hourly value in USD — what one hour of your coaching is worth to you.',
    'Enter the program duration in weeks and any between-session support hours you include.',
    'Set your package discount vs your 1:1 rate (your choice — not a researched norm) and what % of your rate support is worth.',
    'Use the package price, per-session price, and ±20% sensitivity range as your own-numbers starting point — not a market price.',
  ],
  methodology:
    'Cost-plus-margin math on your own rates: coaching hours = sessions × minutes ÷ 60; package price = (coaching hours × hourly value + support hours × hourly value × support %) × (1 − discount). Per-session price divides by sessions; effective hourly divides by all hours. A ±20% sensitivity range shows how much the price moves with your inputs. Nothing here is market data — the discount and support valuation are user-set, and the result is never presented as a single correct price.',
  examples: [
    {
      title: '8 weekly sessions at $150/hr',
      inputs: { sessionsPerPackage: 8, sessionLengthMin: 60, hourlyValue: 150, programWeeks: 8, supportHours: 4, packageDiscount: 10, supportRate: 50 },
      note: '$1,350 package, $168.75 per session, $112.50 effective hourly, $1,080–$1,620 sensitivity range.',
    },
    {
      title: 'Simple 4-session package, no extras',
      inputs: { sessionsPerPackage: 4, sessionLengthMin: 60, hourlyValue: 100, programWeeks: 4 },
      note: '$400 package at $100 per session — defaults: no support, no discount, support valued at 50%.',
    },
  ],
  faqs: [
    {
      question: 'What is the best coaching package pricing?',
      answer:
        'The best pricing starts from your own numbers: this free calculator builds the package price from your hourly value, sessions, support hours, and a discount you choose yourself. It deliberately avoids inventing "market rates" — no calculator knows your positioning, so treat the result as a starting point, not a correct price.',
    },
    {
      question: 'Is there a free coaching package pricing calculator?',
      answer:
        'Yes — this coaching package pricing tool is completely free with no signup. Enter your sessions, session length, hourly value, program weeks, support hours, and discount to get your package price, per-session price, and effective hourly rate.',
    },
    {
      question: 'How to use coaching package pricing?',
      answer:
        'Enter your sessions per package, session length, hourly value, program weeks, support hours, and the discount you want to offer versus your 1:1 rate. The calculator returns the total package price, the effective per-session price, your effective hourly rate, and a ±20% sensitivity range.',
    },
    {
      question: 'Should I discount my coaching package versus my 1:1 rate?',
      answer:
        'That is your business decision, not a researched norm — this calculator treats the package discount as a user-set input (0–100%) and shows how it changes your price. Many coaches discount 5–20% for commitment, but the right number depends on your positioning and demand.',
    },
    {
      question: 'How does the coaching package pricing work?',
      answer:
        'Enter your details using the inputs above and the coaching package pricing calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the coaching package pricing free to use?',
      answer:
        'Yes - this coaching package pricing is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a coaching package pricing?',
      answer:
        'A coaching package pricing is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Pure math on YOUR rates — no external or market data; nothing here is a researched price.',
    'Package discount vs the 1:1 rate is user-set, not a market benchmark.',
    'Support hours are valued at a user-set fraction of the coaching hourly value (default 50%).',
    'The ±20% range is a sensitivity illustration around your inputs, not a market band — never a single "correct price".',
    'Money rounds half-up to 2 decimals. Not financial or business advice.',
  ],
  jsonLd: [
  ],
};
