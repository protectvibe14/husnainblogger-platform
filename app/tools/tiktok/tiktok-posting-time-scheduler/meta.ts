import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'timezone',
    label: 'Your timezone (IANA)',
    type: 'text',
    required: true,
    placeholder: 'e.g. America/New_York, Europe/London, Asia/Karachi',
    validation: { pattern: '^[A-Za-z][A-Za-z0-9_\\-+]*(/[A-Za-z][A-Za-z0-9_\\-+]*)+$' },
  },
  {
    id: 'niche',
    label: 'Your TikTok niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. fitness, cooking, study tips',
    validation: { max: 48 },
  },
  {
    id: 'postsPerWeek',
    label: 'Posts per week',
    type: 'number',
    required: true,
    placeholder: '1 to 21',
    validation: { min: 1, max: 21 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'schedule', label: 'Weekly posting schedule', type: 'table' },
  { id: 'planSummary', label: 'Plan summary', type: 'text' },
  { id: 'tips', label: 'Scheduling tips', type: 'list' },
];

export const content: ToolContent = {
  title: 'Best Time to Post on Tiktok Planner 2027',
  description:
    'Free best time to post on tiktok planner 2026: Plan the best time to post on TikTok with this free planner: enter timezone, niche, and. Fast, private, no!',
  howTo: [
    'Enter your timezone as an IANA name (e.g. America/New_York) so windows show in your local time.',
    'Enter your niche and how many posts per week you can realistically publish (1–21).',
    'Generate to get a day-by-day schedule: weekday, local time window, and why that window is suggested.',
    'Treat every window as a general estimate — confirm with TikTok Analytics (Followers → follower activity) after 2–4 weeks.',
    'Post manually or with TikTok’s built-in scheduler at the planned times; this tool does not post for you.',
  ],
  methodology:
    'The tool spreads your weekly post count across Monday–Sunday with a weekday offset derived deterministically from your niche, assigning one of 5 fixed general-guidance time slots (morning, lunch, evening, evening peak, late morning) per slot in round-robin order. No AI is used, and the tool cannot read your TikTok account or followers, so every window is labeled a general estimate.',
  examples: [
    {
      title: 'Fitness creator, 5 posts/week',
      inputs: { timezone: 'America/New_York', niche: 'fitness', postsPerWeek: 5 },
      note: 'Gets a 5-row weekly schedule in Eastern time with general-estimate windows and scheduling tips.',
    },
    {
      title: 'Cooking creator, daily posting',
      inputs: { timezone: 'Europe/London', niche: 'easy recipes', postsPerWeek: 7 },
      note: 'Gets a 7-day schedule, one slot per day, in London time.',
    },
  ],
  faqs: [
    {
      question: 'What is the best TikTok posting time planner?',
      answer:
        'The best planner spreads your posts across the week in your own timezone and labels every window honestly. This one generates a day-by-day plan from 5 fixed general-guidance slots (morning, lunch, evening, evening peak, late morning) — free, in your browser.',
    },
    {
      question: 'Is there a free TikTok posting time planner?',
      answer:
        'Yes — this planner is free with no signup. Enter your IANA timezone, niche, and posts per week (1–21) and you get a weekly schedule table plus tips.',
    },
    {
      question: 'How do I plan the best time to post on TikTok?',
      answer:
        'Use the schedule as a starting point, post at those windows for 2–4 weeks, then replace the estimates with your real data from TikTok Analytics (Followers → follower activity). This tool never claims to know your audience — it cannot read your account.',
    },
    {
      question: 'How does the best time to post on tiktok planner work?',
      answer:
        'Enter your details using the inputs above and the best time to post on tiktok planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the best time to post on tiktok planner free to use?',
      answer:
        'Yes - this best time to post on tiktok planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a best time to post on tiktok planner?',
      answer:
        'A best time to post on tiktok planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the best time to post on tiktok planner?',
      answer:
        'No account needed. Open the best time to post on tiktok planner, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Time windows are general-research estimates, not your audience’s real activity; only TikTok Analytics shows that.',
    'This is a plan generator, not a scheduler: it cannot post, queue, or automate TikTok uploads.',
    'Timezone validation checks the IANA name format (Region/City), not a live timezone database.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Best Time to Post on Tiktok Planner 2026 | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/tiktok/tiktok-posting-time-scheduler/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free best time to post on tiktok planner 2026: Plan the best time to post on TikTok with this free planner: enter timezone, niche, and. Fast, private, no!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        { '@type': 'ListItem', position: 3, name: 'TikTok Tools', item: 'https://husnainblogger.com/tools/tiktok/' },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'TikTok Posting Time Scheduler',
          item: 'https://husnainblogger.com/tools/tiktok/tiktok-posting-time-scheduler/',
        },
      ],
    },
  ],
};
