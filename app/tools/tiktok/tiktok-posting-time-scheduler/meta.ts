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
  title: 'TikTok Posting Time Planner',
  description:
    'Find the best time to post on TikTok with this TikTok posting time planner — enter your timezone and niche for tailored slots. Try it now!',
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
      question: 'What are the 5 posting windows based on?',
      answer:
        'They are fixed general-guidance slots — morning, late morning, lunch, evening, and evening peak — spread across the week in your IANA timezone for 1 to 21 posts per week. They are not measured from your account and not personalized to your niche; think of them as sensible starting windows to test, then replace with your real data from TikTok Analytics (Followers, then follower activity) after 2–4 weeks.',
    },
    {
      question: 'Is posting more often always better?',
      answer:
        'No — consistency beats volume. The tool accepts 1 to 21 posts per week and spreads them sensibly, but three strong posts a week on a steady rhythm will outperform seven rushed ones. Pick a number you can sustain, post at the scheduled windows for a few weeks, then adjust based on your Analytics, not on the schedule.',
    },
    {
      question: 'Why does it ask for my IANA timezone?',
      answer:
        'So every window shows in your local clock time. TikTok audiences scroll on their own routines, and generic advice like \'post at 7pm\' is meaningless without knowing whose 7pm. Enter your timezone once (for example America/Chicago) and the whole week table is built around it.',
    },
    {
      question: 'Does the scheduler post to TikTok for me?',
      answer:
        'No — it builds a day-by-day posting schedule table, and you do the actual posting in TikTok (or your scheduler of choice). It never asks for a TikTok login, connects to nothing, and sends no data anywhere; everything runs in your browser.',
    },
  ],
  assumptions: [
    'Time windows are general-research estimates, not your audience’s real activity; only TikTok Analytics shows that.',
    'This is a plan generator, not a scheduler: it cannot post, queue, or automate TikTok uploads.',
    'Timezone validation checks the IANA name format (Region/City), not a live timezone database.',
  ],
  jsonLd: [],
};
