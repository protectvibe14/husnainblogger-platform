import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'packageTier',
    label: 'Package tier',
    type: 'select',
    required: true,
    options: ['basic', 'standard', 'premium'],
  },
  {
    id: 'accountsManaged',
    label: 'Accounts managed',
    type: 'number',
    required: true,
    placeholder: 'e.g. 2',
    validation: { min: 1 },
  },
  {
    id: 'postsPerWeek',
    label: 'Posts per week (across all accounts)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 12',
    validation: { min: 1 },
  },
  {
    id: 'serviceCommunity',
    label: 'Include community management (replies, DMs, comments)',
    type: 'boolean',
    required: false,
  },
  {
    id: 'serviceAds',
    label: 'Include paid ads management',
    type: 'boolean',
    required: false,
  },
  {
    id: 'serviceReporting',
    label: 'Include monthly reporting & analytics',
    type: 'boolean',
    required: false,
  },
];

export const outputs: ToolOutput[] = [
  { id: 'monthlyRetainerLow', label: 'Suggested monthly retainer — low (estimate)', type: 'currency' },
  { id: 'monthlyRetainerHigh', label: 'Suggested monthly retainer — high (estimate)', type: 'currency' },
  { id: 'pricingBreakdown', label: 'How the range was built (estimate)', type: 'text' },
];

const DESCRIPTION =
  'Free social media manager pricing calculator 2026: estimate your monthly retainer from package tier, accounts and posting workload. No signup — try it now.';

export const content: ToolContent = {
  title: 'Social Media Manager Pricing 2026 Guide | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Pick a package tier: Basic (posting + light engagement), Standard (content + engagement), or Premium (full management + strategy).',
    'Enter how many accounts you manage — each extra account adds a labeled 25% workload weight.',
    'Enter total posts per week across all accounts — posts above 8 per week add a labeled 5% weight each.',
    'Toggle the extra services you include: community management, paid ads management, and monthly reporting.',
    'Run the calculator to see the estimated monthly retainer range and the full breakdown of how it was built.',
  ],
  methodology:
    'The tool looks up two fixed tables in code: a base monthly retainer band per tier (Basic $500–$1,200, Standard $1,200–$2,500, Premium $2,500–$4,000) and service add-on factors (community ×1.2, ads ×1.25, reporting ×1.1 — 3 rows). A fixed workload rule adds +25% per extra account and +5% per weekly post above 8. The band is multiplied by both factors and rounded to the nearest $50. There is no AI and no live market lookup — every figure is a survey/market estimate.',
  examples: [
    {
      title: 'Basic package, 1 account, 8 posts/week',
      inputs: { packageTier: 'basic', accountsManaged: 1, postsPerWeek: 8 },
      note: 'Returns $500–$1,200/mo — the full base band with no adjustments.',
    },
    {
      title: 'Standard package, 2 accounts, 12 posts, community management',
      inputs: { packageTier: 'standard', accountsManaged: 2, postsPerWeek: 12, serviceCommunity: true },
      note: 'Returns $2,100–$4,350/mo (1.45 workload × 1.2 service factor).',
    },
  ],
  faqs: [
    {
      question: 'What is the best social media manager pricing strategy?',
      answer:
        'The best pricing ties the retainer to workload (accounts + posts) and service mix — not a single flat number. This free calculator uses fixed tier bands ($500–$4,000/mo) with labeled workload and service adjustments, all presented as estimates.',
    },
    {
      question: 'Is there a free social media manager pricing calculator?',
      answer:
        'Yes — this social media manager pricing calculator is completely free with no signup. Choose a package tier, enter your accounts and weekly posts, and toggle extra services to get an estimated monthly retainer range.',
    },
    {
      question: 'How do I price my social media management services?',
      answer:
        'Pick the package tier that matches your service, count your accounts and weekly posts, and add the services you include. The calculator combines a fixed tier band with labeled workload (+25% per extra account, +5% per post above 8) and service factors, then rounds to the nearest $50.',
    },
    {
      question: 'How much should I charge as a social media manager per month?',
      answer:
        'It depends on tier and workload: this tool brackets basic packages at $500–$1,200/mo, standard at $1,200–$2,500/mo, and premium at $2,500–$4,000/mo, then adjusts for accounts, post volume, and add-on services. Use the range as a starting point and confirm it against your niche and client size.',
    },
    {
      question: 'Should I charge per post or a monthly retainer?',
      answer:
        'Most managers charge a monthly retainer for ongoing work because it covers strategy and engagement, not just posts. This calculator is retainer-based: it starts from a tier band and scales with your accounts, weekly posts, and extra services, so per-post effort is folded into the monthly figure.',
    },
    {
      question: 'How does the calculator adjust pricing for extra accounts?',
      answer:
        'Each account beyond the first adds a labeled 25% workload weight, and each weekly post above 8 adds 5%. Service add-ons multiply the band too: community management ×1.2, paid ads ×1.25, and monthly reporting ×1.1 — every adjustment is shown in the pricing breakdown.',
    },
    {
      question: 'What should I include in a social media management package?',
      answer:
        'Typically a package combines posting with engagement, community management (replies, DMs, comments), paid ads management, and monthly reporting. This tool models exactly those options: pick Basic, Standard, or Premium, then toggle the three add-ons to see how each one moves your retainer range.',
    },
  ],
  assumptions: [
    'Tier bands (Basic $500–$1,200, Standard $1,200–$2,500, Premium $2,500–$4,000/mo), workload weights, and service factors (×1.2 / ×1.25 / ×1.1) are survey/market estimates — NOT official rates and NOT current verified market data.',
    'The $500–$4,000 benchmark is a deliberately wide survey band; real retainers vary by niche, content volume, and client size.',
    'Ad spend budgets and content production costs (shoots, editors) are not included.',
    'All amounts are USD per month.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Social Media Manager Pricing 2026 Guide | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/social-media-manager-pricing-calculator/',
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
          name: 'Social Media Manager Pricing Calculator',
          item: 'https://husnainblogger.com/tools/make-money/social-media-manager-pricing-calculator/',
        },
      ],
    },
  ],
};
