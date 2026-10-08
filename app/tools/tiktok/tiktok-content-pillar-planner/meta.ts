import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-content-pillar-planner/';

const DESCRIPTION =
  'Plan your TikTok strategy with this free tiktok content pillars tool. Enter your niche and goal for 4 pillars with formats, frequency, and topics. Start now!';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. meal prep, real estate, fitness coaching',
    validation: { max: 80 },
  },
  {
    id: 'businessGoal',
    label: 'Business goal (optional)',
    type: 'select',
    required: false,
    options: ['grow-audience', 'get-leads', 'sell-products', 'build-authority'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'pillars',
    label: 'Content pillars',
    type: 'list',
    description: '4 pillars with formats, weekly frequency, and example topics for your niche.',
  },
  {
    id: 'weeklySchedule',
    label: 'Weekly posting schedule',
    type: 'list',
    description: 'Mon–Sun plan spreading every pillar across the week.',
  },
  {
    id: 'planSummary',
    label: 'Plan summary',
    type: 'text',
    description: 'One-line recap of niche, goal, pillar count, and posts per week.',
  },
];

export const content: ToolContent = {
  title: 'TikTok Content Pillars 2026 – Free Tool | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Type your niche — every pillar, topic, and schedule line is written around it.',
    'Pick a business goal: grow audience, get leads, sell products, or build authority (leave it blank for audience growth).',
    'Run the tool to get your 4 content pillars with formats, posting frequency, and example topics.',
    'Follow the Mon–Sun schedule — each pillar is rotated across different days so posting stays balanced.',
    'Film one pillar per session and batch a full week in a single shooting day.',
  ],
  methodology:
    'The tool selects one of 4 fixed pillar sets by your business goal — 16 pillars total, each with a purpose, 2 formats from a fixed 10-format bank, a weekly frequency, and 3 example topics with your niche filled in. A fixed rotation spreads the posts across Mon–Sun. No AI, no analytics — a static strategy template you adapt as you learn what your audience likes.',
  examples: [
    {
      title: 'Lead-gen plan for meal prep',
      inputs: { niche: 'meal prep', businessGoal: 'get-leads' },
      note: 'Problem-spotlight and mini-transformation pillars aimed at DMs and signups.',
    },
    {
      title: 'Audience growth for fitness coaching',
      inputs: { niche: 'fitness coaching', businessGoal: 'grow-audience' },
      note: 'Education, entertainment, trend-riding, and community pillars — 8 posts/week.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok content pillars?',
      answer:
        'The best setup is 4 pillars covering education, entertainment, trends, and proof — weighted toward your goal (more demos if you sell, more problem-spotlights if you want leads). This free tool builds that exact 4-pillar plan for your niche and goal.',
    },
    {
      question: 'Is there a free tiktok content pillars?',
      answer:
        'Yes — this TikTok content pillar planner is completely free with no signup. Enter your niche and goal and you get 4 pillars with formats, posting frequency, example topics, and a full weekly schedule.',
    },
    {
      question: 'How to use tiktok content pillars?',
      answer:
        'Assign every video you post to one pillar so your content mix stays balanced. Film in batches — one pillar per session — and follow the Mon–Sun schedule the tool generates. After a month, double down on the pillar with the best watch time.',
    },
    {
      question: 'How does a tiktok content pillars work?',
      answer:
        'A pillar is a repeatable content theme (like "quick tips" or "before/afters") with its own formats and posting rhythm. This planner gives you 4 pillars tuned to your business goal, each with 3 starter topics, so you never stare at a blank content calendar.',
    },
    {
      question: 'How does the tiktok content pillars work?',
      answer:
        'Enter your details using the inputs above and the tiktok content pillars calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok content pillars free to use?',
      answer:
        'Yes - this tiktok content pillars is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok content pillars?',
      answer:
        'A tiktok content pillars is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Pillar sets are static strategy templates matched to your goal — they are starting points, not personalized analytics.',
    'Posting frequencies (8 posts/week total) assume you can batch-film; reduce evenly across pillars if you post less.',
    'The schedule rotation is fixed, not optimized for your audience\'s active hours — check TikTok analytics for that.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'TikTok Content Pillars 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
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
          name: 'TikTok Tools',
          item: 'https://husnainblogger.com/tools/tiktok/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'TikTok Content Pillar Planner',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
