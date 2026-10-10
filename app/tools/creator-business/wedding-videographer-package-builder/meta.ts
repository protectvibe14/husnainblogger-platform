import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/wedding-videographer-package-builder/';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'tierName',
    label: 'Tier name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Essential',
  },
  {
    id: 'hoursOfCoverage',
    label: 'Hours of coverage',
    type: 'text',
    required: true,
    placeholder: 'e.g. 6',
  },
  {
    id: 'shooters',
    label: 'Shooters (default 1)',
    type: 'text',
    required: false,
    placeholder: 'e.g. 2',
  },
  {
    id: 'deliverables',
    label: 'Deliverables (comma-separated)',
    type: 'text',
    required: true,
    placeholder: 'e.g. highlight film, teaser, raw footage',
  },
  {
    id: 'basePrice',
    label: 'Base price (your own figure)',
    type: 'text',
    required: true,
    placeholder: 'e.g. 1200',
  },
  {
    id: 'addOnPrices',
    label: 'Add-on prices (comma-separated, optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. 200, 150',
  },
  {
    id: 'bundleDiscountPct',
    label: 'Bundle discount % (optional, default 0)',
    type: 'text',
    required: false,
    placeholder: 'e.g. 10',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'packageTiers',
    label: 'Package tiers (table)',
    type: 'table',
    description:
    'Free wedding videography pricing packages 2026: Side-by-side tier comparison: hours, shooters, deliverables, full price, package price. Fast, private, no.',
  },
  {
    id: 'packageSummary',
    label: 'Package summary document (copy)',
    type: 'copy',
    description:
    'Formatted text summary of every tier, ready to copy into a proposal or price sheet.',
  },
];

export const content: ToolContent = {
  title: 'Wedding Videography Pricing Packages',
  description:
    'Build wedding videography pricing packages in minutes. Enter your per-tier prices, hours, shooters, and deliverables for a comparison table. Try it.',
  howTo: [
    'Add one row per package tier (e.g. Essential, Premium, Luxury).',
    'For each tier, enter the tier name, hours of coverage, number of shooters, and deliverables (comma-separated).',
    'Enter your base price plus any add-on prices (comma-separated) — every figure is your own; the tool never suggests prices.',
    'Optionally set a bundle discount % per tier (defaults to 0).',
    'Run the tool to get a side-by-side tier table and a copy-ready package summary document.',
  ],
  methodology:
    'Formula J-PACKAGE-TIER, applied per tier from your own inputs: fullPrice = basePrice + sum of add-on prices; tierPrice = fullPrice x (1 - bundleDiscountPct / 100); bundleSavings = fullPrice - tierPrice. Hours must be greater than 0, at least one deliverable is required, and all prices must be finite numbers >= 0. The tool structures and compares your pricing — it never invents, researches, or recommends prices. Money values round to the nearest cent.',
  faqs: [
    {
      question: 'What is the best wedding videography pricing packages?',
      answer:
        'The best packages are clear tiered options (typically 2–3) that spell out hours, shooters, deliverables, and one honest price each. This free builder structures your own pricing into exactly that: a comparison table plus a copy-ready summary document — but the prices themselves must always be yours.',
    },
    {
      question: 'Is there a free wedding videography pricing packages?',
      answer:
        'Yes — this wedding videographer package builder is completely free with no signup. Add your tiers with hours, shooters, deliverables, and your own prices, and get a structured comparison table and summary document.',
    },
    {
      question: 'How to use wedding videography pricing packages?',
      answer:
        'Add one row per tier with its name, hours of coverage, shooters, and deliverables. Enter your base price and any add-on prices per tier, set an optional bundle discount %, then run the tool. Copy the summary document into your proposal or price sheet, and adjust any tier that does not convert.',
    },
    {
      question: 'How does the wedding videography pricing packages work?',
      answer:
        'Enter your details using the inputs above and the wedding videography pricing packages calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the wedding videography pricing packages free to use?',
      answer:
        'Yes - this wedding videography pricing packages is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a wedding videography pricing packages?',
      answer:
        'A wedding videography pricing packages is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the wedding videography pricing packages?',
      answer:
        'No account needed. Open the wedding videography pricing packages, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'All prices are entered by you — the tool does not research market rates and its output is not pricing advice.',
    'Bundle savings are arithmetic only (full price minus discounted price); they say nothing about your costs or profit margin.',
    'Amounts are shown without a currency symbol — figures refer to whatever currency you price in.',
  ],
  jsonLd: [],
};
