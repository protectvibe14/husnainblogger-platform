import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/subscriber-goal-countdown/';

const DESCRIPTION =
  'Watch your channel grow with this YouTube subscriber goal tracker — set a target milestone and count down every new subscriber. Celebrate milestones as.';

export const inputs: ToolInput[] = [
  {
    id: 'currentSubs',
    label: 'Current subscribers',
    type: 'number',
    required: true,
    placeholder: 'e.g. 850',
    validation: { min: 0 },
  },
  {
    id: 'targetSubs',
    label: 'Target subscribers',
    type: 'number',
    required: true,
    placeholder: 'e.g. 1000',
    validation: { min: 1 },
  },
  {
    id: 'growthRate',
    label: 'Average new subscribers per day',
    type: 'number',
    required: true,
    placeholder: 'e.g. 5',
    validation: { min: 0.01 },
  },
  {
    id: 'today',
    label: 'Start date (usually today)',
    type: 'date',
    required: true,
  },
  {
    id: 'scenario',
    label: 'Growth scenario',
    type: 'select',
    required: false,
    options: ['conservative', 'expected', 'optimistic'],
  },
  {
    id: 'chosenDate',
    label: 'Want it by a specific date? (optional)',
    type: 'date',
    required: false,
  },
];

export const outputs: ToolOutput[] = [
  { id: 'daysToTarget', label: 'Estimated days to target', type: 'number' },
  { id: 'estTargetDate', label: 'Estimated target date', type: 'text' },
  { id: 'progressPercent', label: 'Progress to goal', type: 'percent' },
  { id: 'requiredDailyRate', label: 'Required daily rate for chosen date', type: 'number' },
  { id: 'summary', label: 'Plain-English projection', type: 'text' },
  { id: 'guidance', label: 'What the projection means', type: 'list' },
];

export const content: ToolContent = {
  title: 'Youtube Subscriber Goal Tracker',
  description: DESCRIPTION,
  howTo: [
    'Enter your current subscriber count and your target (the target must be higher).',
    'Enter your average new subscribers per day — use your real recent average, not a wish.',
    'Set the start date (usually today) and pick a growth scenario: conservative, expected, or optimistic.',
    'Optionally set a date you want to hit the goal by, and the tool computes the daily rate that date requires.',
    'Read the projection — days to target, estimated target date, and progress — remembering it is an estimate, not a promise.',
  ],
  methodology:
    'Linear projection: days to target = ceil((target − current) ÷ daily rate), using fixed what-if scenario multipliers on your own rate (conservative 0.7×, expected 1.0×, optimistic 1.3×). Dates use UTC date-only math. The linear model is labeled an estimate throughout because real growth is not linear — the tool cannot read your live subscriber count (no API), so counts are entered manually.',
  examples: [
    {
      title: 'Road to 1,000 subscribers',
      inputs: { currentSubs: 850, targetSubs: 1000, growthRate: 5, today: '2026-10-01', scenario: 'expected' },
      note: 'About 30 days at 5 new subscribers per day — around October 31, 2026.',
    },
    {
      title: 'Hit 10k by year end',
      inputs: { currentSubs: 7200, targetSubs: 10000, growthRate: 25, today: '2026-10-01', chosenDate: '2026-12-31' },
      note: 'Shows the daily rate the chosen date requires, next to the straight projection.',
    },
  ],
  faqs: [
    {
      question: 'what is the best youtube subscriber goal tracker?',
      answer:
        'The best one turns your real daily growth rate into an estimated date, shows conservative/optimistic what-ifs, and tells you the daily rate a deadline requires. This free tool does exactly that — enter current subs, target, and your average daily growth to get the projection.',
    },
    {
      question: 'is there a free youtube subscriber goal tracker?',
      answer:
        'Yes — this tool is completely free with no signup. Enter your current and target subscriber counts plus your average daily growth, and get estimated days to target, a target date, progress percentage, and the daily rate any chosen deadline requires.',
    },
    {
      question: 'how to track youtube subscriber goal?',
      answer:
        'Take your current count, your target, and your real average daily growth, then divide the gap by the rate: that is your estimated days to the goal. This tool does that math with scenario bands (conservative/expected/optimistic) — just remember growth is rarely linear, so treat the date as a projection, not a promise.',
    },
    {
      question: 'how does a youtube subscriber goal tracker work?',
      answer:
        'It projects your goal linearly: (target − current) ÷ daily growth rate = estimated days, then adds those days to today for a target date. This tool adds scenario multipliers and a reverse calculation (daily rate needed by a chosen date). It cannot read your live count — you enter the numbers manually.',
    },
    {
      question: 'How does the youtube subscriber goal tracker work?',
      answer:
        'Enter your details using the inputs above and the youtube subscriber goal tracker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube subscriber goal tracker free to use?',
      answer:
        'Yes - this youtube subscriber goal tracker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube subscriber goal tracker?',
      answer:
        'A youtube subscriber goal tracker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Linear model is an estimate: real growth is rarely linear, so the date is a projection, not a promise.',
    'Subscriber counts are entered manually — the tool cannot read live YouTube counts (no API).',
    'Scenario factors (0.7×/1.0×/1.3×) are fixed what-ifs on your own rate, not predictions.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Youtube Subscriber Goal Tracker 2026 – Free | HusnainBlogger',
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
        { '@type': 'ListItem', position: 3, name: 'YouTube Tools', item: 'https://husnainblogger.com/tools/youtube/' },
        { '@type': 'ListItem', position: 4, name: 'Subscriber Goal Countdown', item: TOOL_URL },
      ],
    },
  ],
};
