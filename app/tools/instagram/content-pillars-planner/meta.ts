import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/content-pillars-planner/';

export const inputs: ToolInput[] = [
  {
    id: 'pillars',
    label: 'Your content pillars',
    type: 'textarea',
    required: true,
    placeholder: 'e.g.\nTutorials\nBehind the scenes\nClient results',
    validation: { min: 3, max: 400 },
  },
  {
    id: 'weeklySlots',
    label: 'Posts per week',
    type: 'number',
    required: true,
    placeholder: 'e.g. 7',
    validation: { min: 1, max: 21 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'allocation',
    label: 'Pillar allocation',
    type: 'list',
    description:
    'Free instagram content pillars examples 2026: Each pillar with its percentage of the week and exact posts-per-week slots. Fast, private now.',
  },
  {
    id: 'balanceWarning',
    label: 'Balance check',
    type: 'text',
    description:
    'Warns if a pillar gets no weekly slot or one pillar dominates the schedule.',
  },
];

export const content: ToolContent = {
  title: 'Instagram Content Pillars Examples',
  description:
    'Plan balanced Instagram content pillars for free: enter 3–5 pillars and your weekly post count to get exact percentages and slots per pillar. Start now.',
  howTo: [
    'List 3–5 content pillars in the Pillars field — one per line, or separated by commas.',
    'Enter how many posts you publish per week (1–21) in the Posts Per Week field.',
    'Click Generate to split your week across the pillars with fixed weight presets.',
    'Read each pillar’s percentage and exact posts-per-week slots from the allocation list.',
    'Check the balance warning — add weekly posts or merge pillars if one gets no slot.',
    'Re-run whenever your schedule changes; the split always recalculates from scratch.',
  ],
  methodology:
    'The planner splits your week with fixed weight presets by pillar count — [40,35,25], [35,30,20,15], or [30,25,20,15,10] — treating your first-listed pillar as the primary one, then rounds to whole posts with largest-remainder math so slots always add up exactly to your weekly total. No AI, no randomness, no performance data — it is fixed-rule arithmetic.',
  examples: [
    {
      title: 'Creator with 3 pillars, 7 posts/week',
      inputs: { pillars: 'Tutorials\nBehind the scenes\nClient results', weeklySlots: 7 },
      note: 'Tutorials gets 40% (3 posts), Behind the scenes 35% (2 posts), Client results 25% (2 posts).',
    },
    {
      title: 'Brand with 5 pillars, 10 posts/week',
      inputs: { pillars: 'Tips, Stories, Reviews, Memes, Lives', weeklySlots: 10 },
      note: 'Splits 30/25/20/15/10 across the five pillars with a balanced-schedule confirmation.',
    },
  ],
  faqs: [
    {
      question: 'What is the best instagram content pillars examples?',
      answer:
        'There is no verified “best” — good pillars are simply 3–5 repeatable themes that fit your niche and audience. This free planner does not judge your pillars; it allocates your weekly posts across them with fixed starter weights so every pillar gets a fair, visible share.',
    },
    {
      question: 'Is there a free instagram content pillars examples?',
      answer:
        'Yes — this planner is completely free with no signup. Enter 3–5 pillars and your weekly post count, and it returns each pillar’s percentage and exact posts-per-week slots, plus a warning if any pillar would get no weekly slot.',
    },
    {
      question: 'How to use instagram content pillars examples?',
      answer:
        'Type your 3–5 pillars (one per line or comma-separated) and your weekly post count, then click Generate. The tool shows each pillar’s share and slot count, and flags imbalance — for example a pillar getting zero weekly posts — so you can adjust your schedule or merge pillars.',
    },
    {
      question: 'How does the instagram content pillars examples work?',
      answer:
        'Enter your details using the inputs above and the instagram content pillars examples calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the instagram content pillars examples free to use?',
      answer:
        'Yes - this instagram content pillars examples is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an instagram content pillars examples?',
      answer:
        'An instagram content pillars examples is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the instagram content pillars examples?',
      answer:
        'No account needed. Open the instagram content pillars examples, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Allocation uses fixed starter weight presets — a common convention, not measured data about your audience.',
    'The first pillar you list is treated as your primary pillar and always gets the largest share.',
    'The planner has no performance data and cannot tell you which pillar your followers actually prefer — check your Insights for that.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Instagram Content Pillars Examples 2026 | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free instagram content pillars examples 2026: Each pillar with its percentage of the week and exact posts-per-week slots. Fast, private now.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Instagram Tools',
          item: 'https://husnainblogger.com/tools/instagram/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Instagram Content Pillars Planner',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
