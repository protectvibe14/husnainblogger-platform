import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'downloadsPerEpisode',
    label: 'Downloads per episode',
    type: 'number',
    required: true,
    placeholder: 'e.g. 10000',
    validation: { min: 1 },
  },
  {
    id: 'adFormat',
    label: 'Ad format',
    type: 'select',
    required: true,
    options: ['pre_roll_30', 'mid_roll_60', 'post_roll'],
  },
  {
    id: 'episodesPerMonth',
    label: 'Episodes per month',
    type: 'number',
    required: true,
    placeholder: 'e.g. 4',
    validation: { min: 1 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'ratePerEpisodeLow', label: 'Rate per episode — low (USD)', type: 'currency' },
  { id: 'ratePerEpisodeHigh', label: 'Rate per episode — high (USD)', type: 'currency' },
  { id: 'monthlyValueLow', label: 'Monthly value — low (USD)', type: 'currency' },
  { id: 'monthlyValueHigh', label: 'Monthly value — high (USD)', type: 'currency' },
  { id: 'currency', label: 'Currency', type: 'text' },
  { id: 'flatFeeGuidance', label: 'Flat-fee guidance used', type: 'text' },
  { id: 'note', label: 'Estimate note', type: 'text' },
];

const DESCRIPTION =
  'Calculate podcast sponsorship rates free — estimate per-episode and monthly ad revenue from downloads, ad format, and episode count. Start pricing your show.';

export const content: ToolContent = {
  title: 'Podcast Sponsorship Rates',
  description: DESCRIPTION,
  howTo: [
    'Enter your average downloads per episode in the downloadsPerEpisode field.',
    'Choose your ad format: pre_roll_30 (30s pre-roll), mid_roll_60 (60s mid-roll), or post_roll — each uses its own labeled 2026 CPM estimate band.',
    'Enter how many episodes you publish per month (whole number) in episodesPerMonth.',
    'Run the tool and read the per-episode range plus the monthly value in USD.',
    'If your show is under 1,000 downloads per episode, the tool switches to flat-fee guidance ($300–$500/episode, labeled estimate) because CPM math breaks down at small audiences.',
  ],
  methodology:
    'The tool multiplies downloads per episode ÷ 1,000 by a host-read CPM band (30s spots $18–$22, 60s spots $24–$26 — 2026 estimates), then multiplies the per-episode rate by episodes per month. Under 1,000 downloads per episode it returns flat-fee guidance of $300–$500 per episode instead. All CPM values and the flat-fee fallback are labeled estimates, never presented as platform-published rates.',
  examples: [
    {
      title: 'Mid-roll show, 10k downloads',
      inputs: { downloadsPerEpisode: 10000, adFormat: 'mid_roll_60', episodesPerMonth: 4 },
      note: '$240–$260 per episode → $960–$1,040 monthly value (estimated).',
    },
    {
      title: 'Small show, pre-roll',
      inputs: { downloadsPerEpisode: 500, adFormat: 'pre_roll_30', episodesPerMonth: 4 },
      note: 'Flat-fee guidance: $300–$500 per episode (estimated).',
    },
    {
      title: 'Weekly post-roll show',
      inputs: { downloadsPerEpisode: 2000, adFormat: 'post_roll', episodesPerMonth: 4 },
      note: '$36–$44 per episode → $144–$176 monthly value (estimated).',
    },
  ],
  faqs: [
    {
      question: 'What is the best podcast sponsorship rates?',
      answer:
        'There is no single best rate — it depends on your download count, ad placement, and audience. This free calculator estimates your range from 2026 CPM benchmarks (host-read 30s: $18–$22; 60s: $24–$26) so you can quote sponsors a realistic, defensible number.',
    },
    {
      question: 'Is there a free podcast sponsorship rates?',
      answer:
        'Yes — this tool is completely free with no signup. Enter downloads per episode, pick an ad format, add episodes per month, and get an estimated per-episode and monthly rate range instantly.',
    },
    {
      question: 'How to use podcast sponsorship rates?',
      answer:
        'Enter your downloads per episode and ad format, then read the estimated range. Quote sponsors the middle or top of the range for premium mid-roll slots, and remember under 1,000 downloads per episode the tool recommends flat-fee pricing of $300–$500 per episode instead of CPM math.',
    },
    {
      question: 'How does the podcast sponsorship rates work?',
      answer:
        'Enter your details using the inputs above and the podcast sponsorship rates calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the podcast sponsorship rates free to use?',
      answer:
        'Yes - this podcast sponsorship rates is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a podcast sponsorship rates?',
      answer:
        'A podcast sponsorship rates is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the podcast sponsorship rates?',
      answer:
        'No account needed. Open the podcast sponsorship rates, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'CPM benchmarks are 2026 ESTIMATES (host-read 30s $18–$22, 60s $24–$26), not platform-published or guaranteed rates.',
    'Flat-fee guidance ($300–$500/episode) for shows under 1,000 downloads is an estimate — small-show pricing is negotiated, not formulaic.',
    'Downloads are assumed to be real per-episode downloads; the tool cannot verify download authenticity or fraud.',
    'Actual rates vary by niche, audience demographics, episode length, and negotiation.',
  ],
  jsonLd: [
  ],
};
