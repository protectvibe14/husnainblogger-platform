import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/seasonal-keyword-planner/';

export const inputs: ToolInput[] = [
  {
    id: 'seedKeyword',
    label: 'Seed keyword',
    type: 'text',
    required: true,
    placeholder: 'e.g. protein powder',
  },
  {
    id: 'year',
    label: 'Year (optional)',
    type: 'number',
    required: false,
    placeholder: 'Defaults to the current year',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'seasonalPlan',
    label: 'Seasonal content plan',
    type: 'table',
    description:
    'Free seasonal keyword planner 2026: Month-by-month events with content angles and publish-by dates. Get instant results. free now.',
  },
  {
    id: 'eventBankVersion',
    label: 'Event bank version',
    type: 'text',
    description:
    'Version and effective date of the editorial event list used.',
  },
];

export const content: ToolContent = {
  title: 'Seasonal Keyword Planner',
  description:
    'Map a year of content ideas with this free seasonal keyword planner. Turn one seed keyword into month-by-month angles with publish-by dates. Plan now.',
  howTo: [
    'Type your seed keyword (your niche or product) into the "Seed keyword" box.',
    'Optionally set the year — leave it blank to plan the current year.',
    'Run the tool to see a 12-month plan of seasonal events matched to your seed.',
    'Check the "Niche match" column: "Yes" rows fit your niche, "Generic" rows are broad seasonal angles.',
    'Use the "Publish by" dates to schedule posts ahead of each event, then verify demand in Google Trends.',
  ],
  methodology:
    'This planner uses a fixed editorial bank of 36 seasonal events (3 human-written angle templates each, version v1.0.0 effective 2026-10-01). An event counts as a niche match when one of its topic tags appears in your seed keyword; generic events are always included. Publish-by dates are the first day of the event month minus the event\'s lead time. No AI writes anything and no live search-trend data is shown — always verify real seasonal demand in Google Trends, because the bank is northern-hemisphere biased and cannot know your niche\'s true seasonality.',
  examples: [
    {
      title: 'Fitness niche',
      inputs: { seedKeyword: 'home fitness workouts' },
      note: 'Fitness-tagged events (New Year, marathon season) marked as niche matches.',
    },
    {
      title: 'Recipe blog',
      inputs: { seedKeyword: 'sourdough bread' },
      note: 'Holiday baking, Thanksgiving, and Easter angles with publish-by dates.',
    },
    {
      title: 'Specific year',
      inputs: { seedKeyword: 'yoga mats', year: 2027 },
      note: 'Plan for next year instead of the current one.',
    },
  ],
  faqs: [
    {
      question: 'What is the best seasonal keyword planner?',
      answer:
        'The best seasonal planner turns one seed keyword into a year-long calendar of timely angles with publish-by deadlines. This tool does that for free using an editorial bank of 36 seasonal events — just verify real demand in Google Trends before you write.',
    },
    {
      question: 'Is there a free seasonal keyword planner?',
      answer:
        'Yes — this tool is completely free with no signup. Enter a seed keyword and you get a 12-month seasonal plan with content angles and publish-by dates for the current year (or the year you choose).',
    },
    {
      question: 'How to plan seasonal keyword?',
      answer:
        'Start from your seed keyword, list the year\'s seasonal events your audience cares about (holidays, sales, seasons), then work backwards: publish 3-6 weeks before each event so the post can rank in time. This tool computes those publish-by dates for you.',
    },
    {
      question: 'How does a seasonal keyword planner work?',
      answer:
        'You enter a seed keyword and the tool matches it against a fixed bank of 36 seasonal events. Niche-relevant events are marked "Yes" in the niche-match column; generic ones are marked "Generic". Each row includes three ready-to-use content angles and a publish-by date.',
    },
    {
      question: 'How does the seasonal keyword planner work?',
      answer:
        'Enter your details using the inputs above and the seasonal keyword planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the seasonal keyword planner free to use?',
      answer:
        'Yes - this seasonal keyword planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a seasonal keyword planner?',
      answer:
        'A seasonal keyword planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Editorial bank (v1.0.0, effective 2026-10-01): 36 events with fixed human-written angle templates. No live trend data — verify seasonality in Google Trends.',
    'Northern-hemisphere bias: event timing (e.g. summer travel in June, back to school in August) will not fit southern-hemisphere audiences without adjustment.',
    'Niche matching is simple keyword overlap, not semantic understanding — unusual niches may get only generic events.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Seasonal Keyword Planner 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free seasonal keyword planner 2026: Month-by-month events with content angles and publish-by dates. Get instant results. free now.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Blogging SEO & Content',
          item: 'https://husnainblogger.com/tools/blogging-seo/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Seasonal Keyword Planner',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
