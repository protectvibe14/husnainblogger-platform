import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/membership-tier-planner/';

function tierInputs(i: number): ToolInput[] {
  return [
    {
      id: `tier${i}Name`,
      label: `Tier ${i} name`,
      type: 'text',
      required: false,
      placeholder: `e.g. ${['Supporter', 'Insider', 'Pro', 'Champion', 'Legend', 'Founder'][i - 1]}`,
    },
    {
      id: `tier${i}Price`,
      label: `Tier ${i} price (USD/month)`,
      type: 'number',
      required: false,
      placeholder: 'e.g. 4.99',
      validation: { min: 0.01, unit: 'USD' },
    },
    {
      id: `tier${i}Members`,
      label: `Tier ${i} estimated members`,
      type: 'number',
      required: false,
      placeholder: 'Your best guess, e.g. 100',
      validation: { min: 0 },
    },
  ];
}

export const inputs: ToolInput[] = [
  {
    id: 'tierCount',
    label: 'Number of tiers (1-6)',
    type: 'number',
    required: true,
    placeholder: 'YouTube allows up to 6 membership levels',
    validation: { min: 1, max: 6 },
  },
  ...tierInputs(1),
  ...tierInputs(2),
  ...tierInputs(3),
  ...tierInputs(4),
  ...tierInputs(5),
  ...tierInputs(6),
];

export const outputs: ToolOutput[] = [
  {
    id: 'tiers',
    label: 'Tier revenue breakdown',
    type: 'table',
    description:
    'Free youtube membership tiers ideas 2026: Per tier: name, price, estimated members and estimated creator payout per month. Fast, private.',
  },
  {
    id: 'perkChecklist',
    label: 'Perk checklist per tier',
    type: 'list',
    description:
    'Suggested perks for each tier from a fixed 12-perk bank, by price.',
  },
  {
    id: 'totalRevenue',
    label: 'Total estimated monthly payout',
    type: 'currency',
    description:
    'Sum of per-tier estimates at the 70% creator share.',
  },
];

export const content: ToolContent = {
  title: 'YouTube Membership Tiers Ideas',
  description:
    'Plan YouTube membership tiers free: set up to 6 levels with prices and member guesses to estimate monthly payouts at the 70% share. Plan tiers now.',
  howTo: [
    'Enter the Number of Tiers from 1 to 6 (the YouTube membership limit).',
    'For each tier, type a Tier Name, a Price in USD per month, and your Estimated Members.',
    'Click Calculate to see per-tier payouts and the total monthly estimate.',
    'Review the Perk Checklist: suggested perks for each tier based on its price.',
    'Adjust prices and member guesses to compare scenarios — member counts are your estimates.',
  ],
  methodology:
    'This is a pricing worksheet, not a prediction: it multiplies your own member guesses by your prices and YouTube\'s 70% creator revenue share (platform policy; YouTube keeps ~30%), rounded to cents. Perk suggestions come from a fixed bank of 12 perks with minimum-price thresholds — a tier suggests every perk priced at or below it. No AI, no traffic data; the same inputs always give the same numbers.',
  examples: [
    {
      title: 'Two tiers: Supporter and VIP',
      inputs: {
        tierCount: 2,
        tier1Name: 'Supporter',
        tier1Price: 4.99,
        tier1Members: 100,
        tier2Name: 'VIP',
        tier2Price: 14.99,
        tier2Members: 20,
      },
      note: 'Estimates $349.30 + $209.86 = $559.16/month at the 70% creator share, with perk suggestions per tier.',
    },
    {
      title: 'Single entry tier',
      inputs: { tierCount: 1, tier1Name: 'Insider', tier1Price: 2.99, tier1Members: 250 },
      note: 'Estimates $523.25/month and suggests the entry-level perks that fit a $2.99 tier.',
    },
  ],
  faqs: [
    {
      question: 'What is the best youtube membership tiers ideas?',
      answer:
        'There is no verified "best" setup — it depends on your audience and content. This free planner helps you compare: set up to 6 tiers with prices and member guesses, and it estimates monthly payouts at YouTube\'s 70% creator share plus suggests perks per tier from a fixed 12-perk bank.',
    },
    {
      question: 'Is there a free youtube membership tiers ideas?',
      answer:
        'Yes — this planner is completely free with no signup. Enter 1 to 6 tiers with names, USD prices and estimated member counts to get a per-tier revenue table, perk checklist and total monthly estimate.',
    },
    {
      question: 'How to use youtube membership tiers?',
      answer:
        'In YouTube Studio, eligible channels can turn on channel memberships and create up to 6 priced levels with perks like badges and emoji. Use this planner first to model prices and member guesses, then create the actual levels in YouTube Studio — this tool does not connect to your channel.',
    },
    {
      question: 'How does a youtube membership tiers ideas work?',
      answer:
        'This worksheet multiplies your estimated members by your tier price and YouTube\'s 70% creator revenue share for each tier, then totals them. Perk suggestions are drawn from a fixed 12-perk bank by price threshold. All member counts are your guesses — the tool cannot predict actual signups.',
    },
    {
      question: 'How does the youtube membership tiers ideas work?',
      answer:
        'Enter your details using the inputs above and the youtube membership tiers ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube membership tiers ideas free to use?',
      answer:
        'Yes - this youtube membership tiers ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube membership tiers ideas?',
      answer:
        'A youtube membership tiers ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Revenue is an estimate only: member counts are your guesses, and the tool cannot predict actual signups.',
    'Uses YouTube\'s 70% creator revenue share for channel memberships (platform policy); fees, taxes and currency conversion are not modeled.',
    'YouTube allows up to 6 membership levels — the planner enforces this verified limit.',
    'Perk suggestions come from a fixed 12-perk bank by price threshold — suggestions only, not a guarantee members will value them.',
  ],
  jsonLd: [
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Membership Tier Planner',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
