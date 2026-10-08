import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'tier1Subs',
    label: 'Tier-1 subscribers',
    type: 'number',
    required: true,
    placeholder: 'e.g. 100',
    validation: { min: 0 },
  },
  {
    id: 'tier2Subs',
    label: 'Tier-2 subscribers',
    type: 'number',
    required: true,
    placeholder: 'e.g. 10',
    validation: { min: 0 },
  },
  {
    id: 'tier3Subs',
    label: 'Tier-3 subscribers',
    type: 'number',
    required: true,
    placeholder: 'e.g. 5',
    validation: { min: 0 },
  },
  {
    id: 'splitTier',
    label: 'Your revenue split',
    type: 'select',
    required: true,
    options: [
      'Base 50/50 split',
      'Plus Program 60/40 split',
      'Plus Program 70/30 split',
    ],
  },
  {
    id: 'bitsCheered',
    label: 'Bits cheered this month',
    type: 'number',
    required: true,
    placeholder: 'e.g. 1000',
    validation: { min: 0 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'subRevenue', label: 'Subscriber revenue (estimate)', type: 'currency' },
  { id: 'bitsRevenue', label: 'Bits revenue (estimate)', type: 'currency' },
  { id: 'totalMonthly', label: 'Estimated total monthly revenue', type: 'currency' },
];

export const content: ToolContent = {
  title: 'Twitch Subscriber Calculator 2026 – Revenue | HusnainBlogger',
  description:
    'Free twitch subscriber calculator 2026: enter subs by tier and your revenue split to estimate your monthly Twitch earnings. Adds bits at $0.01 each. No signup.',
  keywords: ['twitch sub calculator', 'twitch sub calculator partner', 'twitch sub count calculator', 'twitch sub earnings calculator', 'twitch subscriber income calculator'],
  howTo: [
    'Enter your subscriber counts for Tier 1 ($4.99), Tier 2 ($9.99), and Tier 3 ($24.99).',
    'Choose your revenue split: the base 50/50 split, or your confirmed Plus Program tier (60/40 or 70/30).',
    'Enter how many bits were cheered this month (each bit is worth $0.01 to you).',
    'Run the calculation to see subscriber revenue, bits revenue, and your estimated total monthly payout.',
    'Splits and tier pricing change over time \u2014 verify the current numbers on Twitch before relying on the estimate.',
  ],
  methodology:
    'Pure arithmetic on your inputs: each tier\u2019s subscriber count \u00d7 its tier price ($4.99 / $9.99 / $24.99), summed and multiplied by your selected split (50%, 60%, or 70%), plus bits cheered \u00d7 $0.01. Gift and Prime subs use the same split. Twitch\u2019s split and pricing change over time, so every result is an estimate \u2014 and regional pricing means effective revenue per Tier-1 sub is roughly $2.30, not exactly $2.50, at the base split.',
  examples: [
    {
      title: 'Mid-size streamer, base split',
      inputs: { tier1Subs: 100, tier2Subs: 10, tier3Subs: 5, splitTier: 'Base 50/50 split', bitsCheered: 1000 },
      note: 'Subscriber revenue $361.93 plus $10.00 from bits gives an estimated $371.93 for the month.',
    },
    {
      title: 'Plus Program partner',
      inputs: { tier1Subs: 400, tier2Subs: 30, tier3Subs: 12, splitTier: 'Plus Program 70/30 split', bitsCheered: 5000 },
      note: 'Higher split and higher tiers: about $1,816.91 from subs plus $50.00 from bits, an estimated $1,866.91 total.',
    },
  ],
  faqs: [
    {
      question: 'What is the best twitch subscriber calculator?',
      answer:
        'The best twitch subscriber calculator prices each tier separately ($4.99 / $9.99 / $24.99), applies your actual revenue split, and adds bits at $0.01 each. This free tool does that math and labels every figure as an estimate \u2014 verify Twitch\u2019s current split and pricing, since both change.',
    },
    {
      question: 'Is there a free twitch subscriber calculator?',
      answer:
        'Yes \u2014 this twitch subscriber calculator is completely free with no signup. Enter your subscriber counts by tier, your revenue split, and bits cheered to see your estimated monthly payout.',
    },
    {
      question: 'How to calculate twitch subscriber revenue?',
      answer:
        'Multiply your subscriber count in each tier by its price ($4.99 / $9.99 / $24.99), multiply the total by your revenue split (50%, 60%, or 70%), then add $0.01 per bit cheered. This tool runs that exact calculation for you.',
    },
    {
      question: 'How much does Twitch pay per subscriber?',
      answer:
        'Subscriptions sell for $4.99 (Tier 1), $9.99 (Tier 2), and $24.99 (Tier 3), and your share depends on your revenue split. On the base 50/50 split, a Tier-1 sub is worth about $2.50 to you before regional pricing (roughly $2.30 effective); the 60/40 and 70/30 Plus Program splits pay more per sub.',
    },
    {
      question: 'What is the Twitch Plus Program revenue split?',
      answer:
        'The Plus Program offers higher splits of 60/40 and 70/30 instead of the standard 50/50 — pick the tier you have confirmed in the calculator\'s revenue-split dropdown. Qualification thresholds are treated as user-confirmed, so double-check your current tier on Twitch before relying on the estimate.',
    },
    {
      question: 'How much are Twitch bits worth to a streamer?',
      answer:
        'Each bit cheered is worth $0.01 to the streamer — 1,000 bits equals $10.00. Enter your monthly bits total in the calculator and it adds the bits revenue to your subscriber revenue for the full estimated monthly payout.',
    },
    {
      question: 'Do gift subs and Prime subs pay the same as regular subscriptions?',
      answer:
        'Yes — in this calculator, gift and Prime subscriptions use the same revenue split as regular paid subs. Prime subs come from Amazon Prime memberships rather than direct purchase, but the streamer-side split math stays identical.',
    },
  ],
  assumptions: [
    'Tier prices ($4.99 / $9.99 / $24.99) and splits reflect the schedule captured in the spec (sourceDate 2026-10-01) \u2014 Twitch can change them; verify the current numbers on Twitch\u2019s creator pages.',
    'Regional pricing means effective revenue per Tier-1 sub is roughly $2.30, not exactly $2.50, at the base split \u2014 labeled as an estimate.',
    'Gift and Prime subs are treated with the same split; Plus Program tiers are user-confirmed (qualification thresholds are not checked).',
    'Results are estimates in USD; taxes and currency conversion are not included.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Twitch Subscriber Calculator 2026 – Revenue | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/twitch-subscriber-revenue-calculator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Free twitch subscriber calculator 2026: enter subs by tier and your revenue split to estimate your monthly Twitch earnings. Adds bits at $0.01 each. No signup.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Make Money Tools',
          item: 'https://husnainblogger.com/tools/make-money/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Twitch Subscriber Revenue Calculator',
          item: 'https://husnainblogger.com/tools/make-money/twitch-subscriber-revenue-calculator/',
        },
      ],
    },
  ],
};
