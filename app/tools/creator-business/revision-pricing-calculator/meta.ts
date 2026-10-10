import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/revision-pricing-calculator/';

export const inputs: ToolInput[] = [
  {
    id: 'baseProjectFee',
    label: 'Base project fee (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 1000',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'includedRevisions',
    label: 'Revisions included',
    type: 'number',
    required: true,
    placeholder: 'e.g. 2',
    validation: { min: 0 },
  },
  {
    id: 'requestedRevisions',
    label: 'Revisions requested',
    type: 'number',
    required: true,
    placeholder: 'e.g. 5',
    validation: { min: 0 },
  },
  {
    id: 'pricingMode',
    label: 'Pricing mode',
    type: 'select',
    required: true,
    options: ['pct-of-fee', 'flat-per-revision'],
  },
  {
    id: 'revisionPct',
    label: 'Revision price (% of fee, pct mode)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 10',
    validation: { min: 0, max: 100 },
  },
  {
    id: 'flatPerRevision',
    label: 'Flat price per revision (USD, flat mode)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 75',
    validation: { min: 0, unit: 'USD' },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'extraRevisionCount',
    label: 'Extra revisions',
    type: 'number',
    description:
    'Free how to charge for extra revisions 2026: max(0, requestedRevisions - includedRevisions). free.',
  },
  {
    id: 'revisionFee',
    label: 'Extra revision fee',
    type: 'currency',
    description:
    'Total fee for the extra revisions under your pricing mode.',
  },
  {
    id: 'newProjectTotal',
    label: 'New project total',
    type: 'currency',
    description:
    'Base project fee plus the extra revision fee.',
  },
  {
    id: 'note',
    label: 'Pricing note',
    type: 'text',
    description:
    'Plain-English summary of the charge, including prompts for edge cases.',
  },
];

export const content: ToolContent = {
  title: 'How to Charge for Extra Revisions',
  description:
    'Price extra revisions fairly in seconds. Enter your fee, included rounds, and pricing mode to get the revision fee and new total. Free now.',
  howTo: [
    'Enter your base project fee and how many revision rounds it includes.',
    'Enter how many revision rounds the client actually requested.',
    'Choose your pricing mode: a percentage of the fee per extra revision, or a flat price per revision.',
    'Fill the rate for your chosen mode — revisionPct (0-100) or flatPerRevision in USD.',
    'Run the tool to get the extra revision count, the fee, and the new project total.',
  ],
  methodology:
    'This tool applies your own pricing policy, nothing else: extraRevisions = max(0, requestedRevisions - includedRevisions); in pct-of-fee mode the fee is baseProjectFee x (revisionPct / 100) x extraRevisions, and in flat mode it is flatPerRevision x extraRevisions; the new total is baseProjectFee + revisionFee. Revision counts must be whole numbers, revisionPct is 0-100, and everything rounds to the nearest cent. When requested revisions are within the included rounds the fee is $0; a 0% pct in pct mode is flagged with a double-check prompt. Rates are your pricing policy — the tool recommends none.',
  examples: [
    {
      title: 'Pct-of-fee: 3 extra rounds at 10%',
      inputs: {
        baseProjectFee: 1000,
        includedRevisions: 2,
        requestedRevisions: 5,
        pricingMode: 'pct-of-fee',
        revisionPct: 10,
      },
      note: '3 extra revisions x $100 = $300 fee, new total $1,300.',
    },
    {
      title: 'Flat mode: $75 per extra round',
      inputs: {
        baseProjectFee: 2000,
        includedRevisions: 1,
        requestedRevisions: 4,
        pricingMode: 'flat-per-revision',
        flatPerRevision: 75,
      },
      note: '3 extra revisions x $75 = $225 fee, new total $2,225.',
    },
    {
      title: 'Within included rounds: no fee',
      inputs: {
        baseProjectFee: 500,
        includedRevisions: 3,
        requestedRevisions: 2,
        pricingMode: 'pct-of-fee',
        revisionPct: 15,
      },
      note: '0 extra revisions, $0 fee, total stays $500.',
    },
  ],
  faqs: [
    {
      question: 'What is the best how to charge for extra revisions?',
      answer:
        'The best approach is a written policy applied consistently: a percentage of the project fee or a flat per-revision price, charged only beyond the included rounds. This free calculator computes the extra revision fee and the new project total from your policy, with no signup.',
    },
    {
      question: 'Is there a free how to charge for extra revisions?',
      answer:
        'Yes — this extra revision pricing calculator is completely free with no signup. Enter your project fee, included and requested rounds, and your pricing mode to get the fee and new total.',
    },
    {
      question: 'How to use how to charge for extra revisions?',
      answer:
        'Enter your base project fee, the rounds your fee includes, and the rounds requested. Pick pct-of-fee or flat-per-revision pricing, enter your rate, and run the tool — it returns the extra revision count, the fee, and the new project total.',
    },
    {
      question: 'How does a how to charge for extra revisions work?',
      answer:
        'It subtracts included rounds from requested rounds to find the extra revisions, then multiplies by your rate: either a percentage of the project fee or a flat price per revision. Requested rounds within the included count cost $0. The tool never sets your rate — that is your pricing policy.',
    },
    {
      question: 'How does the how to charge for extra revisions work?',
      answer:
        'Enter your details using the inputs above and the how to charge for extra revisions calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the how to charge for extra revisions free to use?',
      answer:
        'Yes - this how to charge for extra revisions is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a how to charge for extra revisions?',
      answer:
        'A how to charge for extra revisions is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Rates are your own pricing policy — the tool performs math only and recommends no rate.',
    'Revision counts must be whole numbers; revisionPct must be between 0 and 100.',
    'A 0% pct in pct-of-fee mode makes extra revisions free and is flagged with a double-check prompt.',
  ],
  jsonLd: [],
};
