import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const NETWORK_INPUTS: ToolInput[] = [
  {
    id: 'adsenseRpm',
    label: 'Google AdSense RPM (estimate)',
    type: 'number',
    required: false,
    placeholder: 'Default 5 — benchmark estimate, editable',
    validation: { min: 0.5, max: 200 },
  },
  {
    id: 'ezoicRpm',
    label: 'Ezoic RPM (estimate)',
    type: 'number',
    required: false,
    placeholder: 'Default 12 — benchmark estimate, editable',
    validation: { min: 0.5, max: 200 },
  },
  {
    id: 'journeyRpm',
    label: 'Mediavine Journey RPM (estimate)',
    type: 'number',
    required: false,
    placeholder: 'Default 18 — benchmark estimate, editable',
    validation: { min: 0.5, max: 200 },
  },
  {
    id: 'mediavineRpm',
    label: 'Mediavine RPM (estimate)',
    type: 'number',
    required: false,
    placeholder: 'Default 25 — benchmark estimate, editable',
    validation: { min: 0.5, max: 200 },
  },
  {
    id: 'raptiveRpm',
    label: 'Raptive RPM (estimate)',
    type: 'number',
    required: false,
    placeholder: 'Default 30 — benchmark estimate, editable',
    validation: { min: 0.5, max: 200 },
  },
];

export const inputs: ToolInput[] = [
  {
    id: 'monthlySessions',
    label: 'Monthly sessions',
    type: 'number',
    required: true,
    placeholder: 'e.g. 60000',
    validation: { min: 0 },
  },
  {
    id: 'trafficShareUS',
    label: 'Share of traffic from the US (%)',
    type: 'number',
    required: false,
    placeholder: 'Default 100',
    validation: { min: 0, max: 100 },
  },
  {
    id: 'niche',
    label: 'Blog niche',
    type: 'select',
    required: false,
    options: [
      'Food & Recipes',
      'Personal Finance',
      'Tech',
      'Health & Wellness',
      'Travel',
      'Lifestyle',
      'Parenting',
      'Sports',
      'DIY & Crafts',
      'Pets',
    ],
  },
  ...NETWORK_INPUTS,
];

export const outputs: ToolOutput[] = [
  { id: 'comparisonRows', label: 'Per-network comparison', type: 'table' },
  { id: 'trafficNote', label: 'Traffic geography note', type: 'text' },
];

const DESCRIPTION =
  'Compare ad networks with this AdSense vs Mediavine vs Raptive calculator — see which network pays more at your traffic level in USD. Switch only when.';

export const content: ToolContent = {
  title: 'Adsense vs Mediavine vs Raptive Calculator',
  description: DESCRIPTION,
  howTo: [
    'Enter your Monthly sessions — the same traffic number is applied to all five networks.',
    'Set your Share of traffic from the US: non-US-heavy traffic scales every RPM down with a simplified benchmark adjustment.',
    'Pick your Blog niche — finance and tech get a higher benchmark multiplier, pets and DIY a lower one.',
    'Keep or edit each network\'s RPM: the defaults are benchmark estimates (e.g. Mediavine 25, Raptive 30), fully editable.',
    'Read the comparison table: estimated monthly earnings per network, ranked best to worst, with the traffic requirement and whether your traffic meets it.',
  ],
  methodology:
    'Pure client-side table math. Each network row computes adjusted RPM = editable network RPM × geo factor (0.4 + 0.6 × US share) × niche multiplier (0.9-1.5 benchmark estimate), then estimated monthly earnings = sessions × adjusted RPM ÷ 1000. Rows are sorted by earnings. There is no live network data anywhere: every RPM is a benchmark estimate, traffic minimums are typical published requirements from a static table, and every figure is labeled an estimate.',
  examples: [
    {
      title: '60k sessions, 100% US, food blog',
      inputs: { monthlySessions: 60000, trafficShareUS: 100, niche: 'Food & Recipes' },
      note: 'Raptive tops the table around $1,800/month; AdSense sits near $300 — all estimates, ranked best to worst.',
    },
    {
      title: 'Same traffic, mostly non-US',
      inputs: { monthlySessions: 60000, trafficShareUS: 20, niche: 'Food & Recipes' },
      note: 'Every RPM is scaled down by the geo adjustment — the tool adds a lower-RPM note explaining the drop.',
    },
  ],
  faqs: [
    {
      question: 'What is the best adsense vs mediavine vs raptive calculator?',
      answer:
        'One that adjusts for YOUR traffic mix and niche instead of quoting one fixed RPM, and that never presents estimates as live payouts. This free tool lets you edit every network\'s benchmark RPM, sets a US-traffic share and niche multiplier, and ranks the five networks by estimated monthly earnings.',
    },
    {
      question: 'Is there a free adsense vs mediavine vs raptive calculator?',
      answer:
        'Yes — this comparison tool is completely free with no signup. It runs entirely in your browser: your traffic numbers are used only for the math and never leave your device.',
    },
    {
      question: 'How to calculate adsense vs mediavine vs raptive?',
      answer:
        'For each network: monthly sessions × that network\'s RPM ÷ 1000. Because real RPMs differ by niche and geography, this tool adjusts each network\'s benchmark RPM by your US-traffic share and niche before comparing, then sorts the rows by estimated earnings.',
    },
    {
      question: 'How does an adsense vs mediavine vs raptive calculator work?',
      answer:
        'This one takes your sessions, applies your editable benchmark RPM per network, scales each RPM down for non-US traffic and up or down by niche, computes estimated monthly earnings per network, and ranks the five rows. Network minimums (e.g. ~50k sessions for Mediavine, ~100k pageviews for Raptive) come from a static table and are checked against your sessions in the eligibility column.',
    },
    {
      question: 'How does the adsense vs mediavine vs raptive calculator work?',
      answer:
        'Enter your details using the inputs above and the adsense vs mediavine vs raptive calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the adsense vs mediavine vs raptive calculator free to use?',
      answer:
        'Yes - this adsense vs mediavine vs raptive calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an adsense vs mediavine vs raptive calculator?',
      answer:
        'An adsense vs mediavine vs raptive calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'ALL network RPMs are benchmark estimates from a static table (AdSense 5, Ezoic 12, Mediavine Journey 18, Mediavine 25, Raptive 30), fully user-editable — never presented as real network payout data.',
    'Geo and niche multipliers are simplified benchmark adjustments, not verified market rates.',
    'Traffic minimums are typical published requirements, not fetched live and not guaranteed current; eligibility is labeled an estimate.',
    'The comparison ignores each network\'s ad formats, fill rates, and site-speed impact — earnings alone do not make a network "best".',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Adsense vs Mediavine vs Raptive Calculator | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/ad-revenue-network-comparison-tool/',
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
          name: 'Make-Money & Affiliate Tools',
          item: 'https://husnainblogger.com/tools/make-money/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Ad Revenue Network Comparison Tool',
          item: 'https://husnainblogger.com/tools/make-money/ad-revenue-network-comparison-tool/',
        },
      ],
    },
  ],
};
