import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/pinterest-seasonal-content-planner/';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. home decor, keto recipes',
    validation: { max: 80 },
  },
  {
    id: 'month',
    label: 'Month (1-12)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 11 for November',
    validation: { min: 1, max: 12 },
  },
  {
    id: 'quarter',
    label: 'Quarter',
    type: 'select',
    required: false,
    options: ['Q1', 'Q2', 'Q3', 'Q4'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'seasonalAngles',
    label: 'Seasonal content angles',
    type: 'table',
    description:
    'Free pinterest seasonal content 2026: Events for your period with planning lead time, a content angle for your niche, and. Fast, private.',
  },
  {
    id: 'planningNote',
    label: 'Planning note',
    type: 'text',
    description:
    'Which events need 4+ weeks of lead time, plus dataset provenance and honesty notes.',
  },
  {
    id: 'eventCount',
    label: 'Events found',
    type: 'number',
    description:
    'How many seasonal events matched your period.',
  },
  {
    id: 'periodUsed',
    label: 'Period',
    type: 'text',
    description:
    'The months your plan was built for.',
  },
];

export const content: ToolContent = {
  title: 'Pinterest Seasonal Content Ideas',
  description:
    'Post seasonal content early enough to rank: enter your niche and a month or quarter for posting lead times plus keyword seeds for every event.',
  howTo: [
    'Type your "Your niche", e.g. "home decor" or "keto recipes".',
    'Enter a "Month (1-12)" like 11 for November, or pick a "Quarter" like Q4. You can combine both; at least one is required.',
    'Run the tool to get a table of seasonal events with planning lead times, a content angle written for your niche, and keyword seeds.',
    'Read the "Planning note" — it flags every event needing 4+ weeks of lead time so you start early, since Pinterest users plan ahead.',
    'Note: if your niche looks evergreen (e.g. B2B SaaS), you get timeless angles instead, with an honest note that seasonal hooks are weak for it.',
  ],
  methodology:
    'The tool matches your period against an in-repo dataset of 24 US-seasonal events (reviewed 2026-09-30, reviewed quarterly), each carrying a recommended planning lead time in weeks. Content angles and keyword seeds are hand-written templates filled with your niche — no AI, no live trend data, and no market data are used. Events with 4+ weeks of lead time are flagged because Pinterest users plan seasonal content weeks ahead. Niches matching evergreen hints (B2B, SaaS, consulting, etc.) receive curated evergreen angles instead of forced seasonal tie-ins.',
  examples: [
    {
      title: 'Home decor for November',
      inputs: { niche: 'home decor', month: 11 },
      note: 'Returns Thanksgiving, Black Friday, and Christmas angles with 6-10 week lead times flagged.',
    },
    {
      title: 'Recipes for Q4',
      inputs: { niche: 'recipes', quarter: 'Q4' },
      note: 'Returns all October-December events including Halloween and Thanksgiving.',
    },
    {
      title: 'Evergreen B2B niche',
      inputs: { niche: 'B2B SaaS marketing', month: 11 },
      note: 'Returns timeless evergreen angles with a note that seasonal hooks are weak for this niche.',
    },
  ],
  faqs: [
    {
      question: 'What is the best pinterest seasonal content?',
      answer:
        'The best pinterest seasonal content is planned 4-10 weeks before the event, because Pinterest users search for seasonal ideas far earlier than on other platforms. This free planner pairs your niche with each event in your period, gives you a content angle and keyword seeds, and flags every event that needs an early start.',
    },
    {
      question: 'Is there a free pinterest seasonal content?',
      answer:
        'Yes — this pinterest seasonal content planner is completely free with no signup. Enter your niche plus a month or quarter and get event angles with lead times and keyword seeds, as many times as you like.',
    },
    {
      question: 'How to use pinterest seasonal content?',
      answer:
        'Enter your niche and the month or quarter you are planning for, then run the tool. Start with the events the planning note flags as needing 4+ weeks of lead time, build pins around the given content angles, and use the keyword seeds in your titles and descriptions.',
    },
    {
      question: 'Is this based on live Pinterest trend data?',
      answer:
        'No — and it does not claim to be. The planner uses a fixed in-repo dataset of 24 seasonal events (reviewed 2026-09-30) plus hand-written angle templates filled with your niche. For live trend signals, check Pinterest Trends directly; this tool gives you the planning structure, not the data.',
    },
    {
      question: 'How does the pinterest seasonal content work?',
      answer:
        'Enter your details using the inputs above and the pinterest seasonal content calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the pinterest seasonal content free to use?',
      answer:
        'Yes - this pinterest seasonal content is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a pinterest seasonal content?',
      answer:
        'A pinterest seasonal content is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Seasonal events come from a fixed 24-event US-centric dataset (reviewed 2026-09-30) — it does not track live trends and may miss regional or emerging events.',
    'Content angles and keyword seeds are hand-written templates, not AI writing and not market research.',
    'Evergreen niches get timeless angles with an honest note instead of forced seasonal tie-ins.',
  ],
  jsonLd: [
  ],
};
