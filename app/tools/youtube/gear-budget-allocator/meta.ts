import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'totalBudget',
    label: 'Total gear budget (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 1000',
    validation: { min: 1 },
  },
  {
    id: 'profile',
    label: 'Budget profile',
    type: 'select',
    required: true,
    options: ['starter', 'growth', 'pro', 'custom'],
  },
  {
    id: 'customPercents',
    label: 'Custom percentages (camera, audio, lighting, editing, accessories)',
    type: 'text',
    required: false,
    placeholder: 'e.g. 40,20,20,10,10 — must add up to 100',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'allocations', label: 'Per-category allocations', type: 'list' },
  { id: 'shoppingOrder', label: 'Priority-ranked shopping order', type: 'list' },
  { id: 'summary', label: 'Summary', type: 'text' },
  { id: 'honestyNote', label: 'Honesty note', type: 'text' },
];

const DESCRIPTION =
  'Plan your setup smart with this YouTube starter kit planner — allocate your budget across camera, audio, lighting, and editing tools wisely.';

export const content: ToolContent = {
  title: 'YouTube Starter Kit Planner',
  description: DESCRIPTION,
  howTo: [
    'Enter your total gear budget in USD (must be greater than 0).',
    'Pick a profile: starter, growth, pro — or choose custom and type your own five percentages.',
    'For a custom split, enter exactly five numbers in order: camera, audio, lighting, editing, accessories — they must add up to 100.',
    'Run the calculator to see whole-dollar amounts per category that sum to exactly your budget.',
    'Buy in the priority order shown: audio first, accessories last — upgrade what improves quality fastest.',
  ],
  methodology:
    'Your budget is split by fixed percentage presets (starter: 30/30/15/15/10; growth: 35/25/15/15/10; pro: 40/20/20/10/10 across camera, audio, lighting, editing, accessories) or by your own custom percentages, which must sum to 100. Amounts are rounded to whole dollars with largest-remainder rounding so they always total exactly your budget. The shopping order is a fixed priority ranking: audio, lighting, camera, editing, accessories. This is arithmetic only — no product recommendations, brand names, or prices are given.',
  examples: [
    {
      title: 'Starter budget of $1,000',
      inputs: { totalBudget: 1000, profile: 'starter' },
      note: 'Camera $300, audio $300, lighting $150, editing $150, accessories $100 — buy the mic before the camera.',
    },
    {
      title: 'Custom split on $500',
      inputs: { totalBudget: 500, profile: 'custom', customPercents: '40,20,20,10,10' },
      note: 'Your percentages are applied exactly; leftover dollars go to the largest fractional shares.',
    },
  ],
  faqs: [
    {
      question: 'What is the best YouTube starter kit planner?',
      answer:
        'The best YouTube starter kit planner turns one budget number into a realistic shopping plan: per-category dollar amounts plus the order to buy in. This free tool does exactly that with starter, growth, and pro presets or your own custom percentages — no signup.',
    },
    {
      question: 'Is there a free YouTube starter kit planner?',
      answer:
        'Yes — this planner is completely free with no signup. It splits your budget across camera, audio, lighting, editing, and accessories with whole-dollar math, and ranks your shopping order by priority.',
    },
    {
      question: 'How to plan YouTube starter?',
      answer:
        'Enter your total budget, pick a preset profile (or custom percentages), and run the calculator. Then follow the priority shopping order: audio first, then lighting, camera, editing, and accessories last.',
    },
    {
      question: 'How does a YouTube starter kit planner work?',
      answer:
        'It multiplies your budget by fixed category percentages (or your custom five, which must total 100), rounds to whole dollars with largest-remainder rounding so the total matches exactly, and outputs a priority-ranked shopping order. It recommends categories only — never specific products or prices.',
    },
    {
      question: 'How does the youtube starter kit planner work?',
      answer:
        'Enter your details using the inputs above and the youtube starter kit planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube starter kit planner free to use?',
      answer:
        'Yes - this youtube starter kit planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube starter kit planner?',
      answer:
        'A youtube starter kit planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Preset splits (starter 30/30/15/15/10, etc.) are opinionated defaults, not market data.',
    'The priority order (audio first) is a judgment call — your situation may differ.',
    'No product recommendations, brand names, or prices are given; research specific gear yourself.',
    'Amounts are whole dollars; budgets are rounded to the nearest dollar before splitting.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'YouTube Starter Kit Planner 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/youtube/gear-budget-allocator/',
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
          name: 'YouTube Tools',
          item: 'https://husnainblogger.com/tools/youtube/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Gear Budget Allocator',
          item: 'https://husnainblogger.com/tools/youtube/gear-budget-allocator/',
        },
      ],
    },
  ],
};
