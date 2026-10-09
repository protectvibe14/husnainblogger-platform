import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'subscriberCount',
    label: 'Subscriber count',
    type: 'number',
    required: true,
    placeholder: 'e.g. 50000',
    validation: { min: 1 },
  },
  {
    id: 'avgViews',
    label: 'Average views per video',
    type: 'number',
    required: true,
    placeholder: 'e.g. 25000',
    validation: { min: 1 },
  },
  {
    id: 'integrationType',
    label: 'Deal type',
    type: 'select',
    required: true,
    options: ['dedicated', 'integration'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'rateLow', label: 'Suggested rate — low (USD)', type: 'currency' },
  { id: 'rateHigh', label: 'Suggested rate — high (USD)', type: 'currency' },
  { id: 'currency', label: 'Currency', type: 'text' },
  { id: 'tier', label: 'Creator tier used', type: 'text' },
  { id: 'tierDrivenBy', label: 'Tier driven by', type: 'text' },
  { id: 'note', label: 'Estimate note', type: 'text' },
];

const DESCRIPTION =
  'Calculate youtube sponsorship rates free — get an honest estimated rate range from your subscribers, views, and deal type. Start pricing your brand deals.';

export const content: ToolContent = {
  title: 'YouTube Sponsorship Rates',
  description: DESCRIPTION,
  howTo: [
    'Enter your channel subscriber count in the subscriberCount field.',
    'Enter your average views per video in the avgViews field — if your views outpace your subscribers, the tool prices you on the higher of the two.',
    'Choose dedicated for a full sponsored video, or integration for a sponsored segment inside a normal video (priced at a labeled 0.3–0.5 estimate of the band).',
    'Run the tool and read the suggested low–high range in USD.',
    'Read the estimate note: ranges are 2026 compiled benchmark estimates, not guarantees — negotiate using your niche, engagement, and audience geography.',
  ],
  methodology:
    'The tool reads a five-tier benchmark band (nano $20–$200 scaling to mega $50k–$300k+) compiled from 2026 industry surveys, picks the higher tier of your subscriber count or average views, then multiplies by 1.0 for a dedicated video or 0.3–0.5 for an integration. All bands and the integration multiplier are labeled estimates — the tool never claims advertiser-verified data.',
  examples: [
    {
      title: 'Nano channel, dedicated video',
      inputs: { subscriberCount: 5000, avgViews: 3000, integrationType: 'dedicated' },
      note: 'Nano tier → estimated $20–$200 per dedicated video.',
    },
    {
      title: 'Micro channel, sponsored integration',
      inputs: { subscriberCount: 50000, avgViews: 40000, integrationType: 'integration' },
      note: 'Micro band × 0.3–0.5 → estimated $60–$500 per integration.',
    },
    {
      title: 'Views bigger than subs',
      inputs: { subscriberCount: 5000, avgViews: 500000, integrationType: 'dedicated' },
      note: 'Views drive the tier → estimated $1,000–$10,000 (mid tier).',
    },
  ],
  faqs: [
    {
      question: 'What is the best youtube sponsorship rates?',
      answer:
        'There is no single best rate — fair pricing depends on your tier, niche, and engagement. This free calculator estimates a low–high range from 2026 compiled benchmark bands (nano $20–$200 up to mega $50k–$300k+), so you can compare offers against a realistic estimate.',
    },
    {
      question: 'Is there a free youtube sponsorship rates?',
      answer:
        'Yes — this tool is completely free with no signup. It estimates your rate range from your subscriber count, average views, and whether the deal is a dedicated video or a sponsored integration.',
    },
    {
      question: 'How to use youtube sponsorship rates?',
      answer:
        'Enter your subscriber count and average views, pick dedicated or integration, and read the suggested range. Use it as a negotiation starting point: strong engagement or a premium niche lets you price toward the top of the range, not the bottom.',
    },
    {
      question: 'How does the youtube sponsorship rates work?',
      answer:
        'Enter your details using the inputs above and the youtube sponsorship rates calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube sponsorship rates free to use?',
      answer:
        'Yes - this youtube sponsorship rates is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube sponsorship rates?',
      answer:
        'A youtube sponsorship rates is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the youtube sponsorship rates?',
      answer:
        'No account needed. Open the youtube sponsorship rates, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Rate bands are 2026 compiled survey ESTIMATES, not verified advertiser data and not platform-published rates.',
    'The integration multiplier (0.3–0.5 of the band) is a labeled estimate.',
    'Intermediate tiers are log-interpolated estimates between nano ($20–$200) and mega ($50k–$300k+).',
    'Actual rates vary by niche, engagement, audience geography, deliverables, and negotiation — this is guidance, not a guarantee.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'YouTube Sponsorship Rates 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/youtube-sponsorship-rate-calculator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: DESCRIPTION,
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
          name: 'YouTube Sponsorship Rate Calculator',
          item: 'https://husnainblogger.com/tools/make-money/youtube-sponsorship-rate-calculator/',
        },
      ],
    },
  ],
};
