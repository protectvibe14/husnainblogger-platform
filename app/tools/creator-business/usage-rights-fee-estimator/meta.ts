import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/usage-rights-fee-estimator/';

export const inputs: ToolInput[] = [
  {
    id: 'baseCreativeFee',
    label: 'Base creative fee (USD)',
    type: 'number',
    required: true,
    placeholder: '500',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'durationMonths',
    label: 'Usage duration (months)',
    type: 'number',
    required: true,
    placeholder: '12',
    validation: { min: 0 },
  },
  {
    id: 'durationMultiplier',
    label: 'Duration multiplier (YOUR assumption)',
    type: 'number',
    required: true,
    placeholder: '2',
    validation: { min: 0 },
  },
  {
    id: 'territoryMultiplier',
    label: 'Territory multiplier (YOUR assumption)',
    type: 'number',
    required: true,
    placeholder: '1.5',
    validation: { min: 0 },
  },
  {
    id: 'mediaChannelMultiplier',
    label: 'Media channel multiplier (YOUR assumption)',
    type: 'number',
    required: true,
    placeholder: '2',
    validation: { min: 0 },
  },
  {
    id: 'exclusivityAddOnPct',
    label: 'Exclusivity add-on, % of base (YOUR assumption)',
    type: 'number',
    required: false,
    placeholder: '20',
    validation: { min: 0, max: 100 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'estimatedUsageFee',
    label: 'Estimated usage fee',
    type: 'currency',
    description: 'Free usage rights calculator photography 2026: Base fee × your duration, territory, and channel multipliers. Fast, private, no signup - try it now!',
  },
  {
    id: 'totalWithBase',
    label: 'Total with base + exclusivity',
    type: 'currency',
    description: 'Base fee + usage fee + exclusivity add-on.',
  },
  {
    id: 'factorBreakdown',
    label: 'Factor breakdown',
    type: 'list',
    description: 'Line-by-line explanation of the factors applied.',
  },
  {
    id: 'note',
    label: 'Note',
    type: 'text',
    description: 'Warns when a multiplier is 0 (usually a data-entry mistake).',
  },
];

export const content: ToolContent = {
  title: 'Usage Rights Calculator Photography 2027',
  description:
    'Estimate photo usage-rights fees from your base fee and your own duration, territory, and channel multipliers. No rate tables — free forever. Try it now!',
  howTo: [
    'Enter your base creative fee — what you charge to produce the work.',
    'Enter the usage duration in months for context in the breakdown.',
    'Enter YOUR multipliers for duration, territory, and media channel (no standard values exist — these are your pricing assumptions).',
    'Optionally add an exclusivity add-on as a percent of the base fee.',
    'Run the estimator to get the estimated usage fee, the total, and a line-by-line factor breakdown.',
  ],
  methodology:
    'usageFee = baseCreativeFee × durationMultiplier × territoryMultiplier × mediaChannelMultiplier; exclusivityAddOn = baseCreativeFee × (exclusivityAddOnPct ÷ 100); totalWithBase = baseCreativeFee + usageFee + exclusivityAddOn. Money rounds to the nearest cent. No licensing-rate tables are used — every multiplier is a user input, and every result is labeled an ESTIMATE.',
  examples: [
    {
      title: 'Full buyout estimate',
      inputs: {
        baseCreativeFee: 500,
        durationMonths: 12,
        durationMultiplier: 2,
        territoryMultiplier: 1.5,
        mediaChannelMultiplier: 2,
        exclusivityAddOnPct: 20,
      },
      note: 'Combined factor ×6 → usage fee $3,000.00; exclusivity $100.00; total $3,600.00.',
    },
    {
      title: 'Organic social only, no exclusivity',
      inputs: {
        baseCreativeFee: 1000,
        durationMonths: 6,
        durationMultiplier: 1.25,
        territoryMultiplier: 1,
        mediaChannelMultiplier: 1,
        exclusivityAddOnPct: 0,
      },
      note: 'Usage fee $1,250.00; total with base $2,250.00.',
    },
    {
      title: 'Zero multiplier flagged',
      inputs: {
        baseCreativeFee: 500,
        durationMonths: 12,
        durationMultiplier: 0,
        territoryMultiplier: 1.5,
        mediaChannelMultiplier: 2,
        exclusivityAddOnPct: 0,
      },
      note: 'A 0 multiplier yields a $0 fee and a warning — usually a data-entry mistake.',
    },
  ],
  faqs: [
    {
      question: 'What is the best usage rights calculator photography?',
      answer:
        'The best usage rights calculator for photography makes your assumptions visible instead of hiding standard rates that do not exist. This one computes base × your own duration, territory, and channel multipliers, shows the factor breakdown line by line, and labels the result an estimate.',
    },
    {
      question: 'Is there a free usage rights calculator photography?',
      answer:
        'Yes — this usage rights calculator for photography is completely free with no signup. Enter your base creative fee and your own multipliers to get an estimated usage fee and total instantly.',
    },
    {
      question: 'How to calculate usage rights calculator photography?',
      answer:
        'Multiply your base creative fee by the factors you choose for duration, territory, and media channel, then add any exclusivity add-on. For example, a $500 fee with a combined ×6 factor gives a $3,000 usage fee. This tool runs that exact math from your inputs.',
    },
    {
      question: 'How does the usage rights calculator photography work?',
      answer:
        'Enter your details using the inputs above and the usage rights calculator photography calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the usage rights calculator photography free to use?',
      answer:
        'Yes - this usage rights calculator photography is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an usage rights calculator photography?',
      answer:
        'An usage rights calculator photography is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the usage rights calculator photography?',
      answer:
        'No account needed. Open the usage rights calculator photography, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'No factual licensing-rate tables — every multiplier is your own pricing assumption.',
    'No industry-standard multipliers exist; never treat a prefilled multiplier as "typical".',
    'A 0 multiplier yields a $0 fee and is flagged as a likely data-entry mistake.',
    'ESTIMATE: a negotiation starting point, not a quote and not market advice.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Usage Rights Calculator Photography 2026 | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free usage rights calculator photography 2026: Base fee × your duration, territory, and channel multipliers. Fast, private, no signup - try it now!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Creator Business',
          item: 'https://husnainblogger.com/tools/creator-business/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Usage Rights Fee Estimator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
