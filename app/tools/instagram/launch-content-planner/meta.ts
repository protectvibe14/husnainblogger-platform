import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/launch-content-planner/';

export const inputs: ToolInput[] = [
  {
    id: 'launchDate',
    label: 'Launch date',
    type: 'date',
    required: true,
    placeholder: 'YYYY-MM-DD',
  },
  {
    id: 'offer',
    label: 'Offer you are launching',
    type: 'text',
    required: true,
    placeholder: 'e.g. Glow Serum',
    validation: { max: 100 },
  },
  {
    id: 'teaseDays',
    label: 'Tease days before launch (0–30)',
    type: 'number',
    required: false,
    placeholder: '7',
    validation: { min: 0, max: 30 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'timeline',
    label: 'Launch timeline',
    type: 'table',
    description:
    'Free instagram product launch plan 2026: Day-by-day grid: date, day label (T-7 … Launch day … T+3), phase, and the task for that. Fast, private -.',
  },
  {
    id: 'checklistExport',
    label: 'Checklist export',
    type: 'copy',
    description:
    'Plain-text checklist of every task, grouped by phase — copy it into your notes app.',
  },
];

export const content: ToolContent = {
  title: 'Instagram Product Launch Plan',
  description:
    'Plan your launch with this free instagram product launch plan tool. Enter your launch date and offer for a day-by-day launch timeline. Start now.',
  howTo: [
    'Enter your launch date — it must be in the future.',
    'Describe the offer you are launching (up to 100 characters).',
    'Set how many tease days you want before launch (0–30, default 7).',
    'Run the tool to get your timeline table: tease phase, 5 launch-day tasks, and 3 post-launch days.',
    'Copy the checklist export into your notes app and tick tasks off as you post.',
  ],
  methodology:
    'The planner does pure date math: each day is an integer offset from your launch date (UTC calendar days), so T-7 is exactly 7 days before launch. Tasks come from a fixed bank of 23 hand-written tasks — 12 tease tasks cycled by day offset, 5 fixed launch-day tasks, and 6 post-launch tasks cycled by day offset — with your offer name filled in. No content is written for you beyond the task list.',
  examples: [
    {
      title: 'Skincare launch, 7 tease days',
      inputs: { launchDate: '2026-12-01', offer: 'Glow Serum', teaseDays: 7 },
      note: 'Full 15-task timeline: 7 tease days, launch day, 3 post-launch days.',
    },
    {
      title: 'Course launch, no tease phase',
      inputs: { launchDate: '2026-11-15', offer: 'Reels Mastery Course', teaseDays: 0 },
      note: 'Skips straight to launch day plus the 3 post-launch days.',
    },
    {
      title: 'App launch, 14 tease days',
      inputs: { launchDate: '2027-01-10', offer: 'FitDaily App', teaseDays: 14 },
      note: 'Longer runway: 14 tease days cycling the 12-task bank.',
    },
  ],
  faqs: [
    {
      question: 'What is the best instagram product launch plan?',
      answer:
        'The best plan covers three phases: teasing (behind-the-scenes, polls, sneak peeks), launch day (announcement reel, story series, pinned post, DMs), and post-launch follow-up (Q&A, objections, final call). This free tool builds that exact timeline from your launch date.',
    },
    {
      question: 'Is there a free instagram product launch plan?',
      answer:
        'Yes — this launch content planner is completely free with no signup. You get the full day-by-day timeline with up to 30 tease days, 5 launch-day tasks, and 3 post-launch days, plus a copyable checklist.',
    },
    {
      question: 'How to use instagram product launch?',
      answer:
        'Enter a future launch date and your offer, pick how many tease days you want, then work through the timeline day by day. Tease tasks build curiosity before launch, launch-day tasks cover the announcement, and post-launch tasks handle questions and the final push.',
    },
    {
      question: 'What is an instagram product launch plan?',
      answer:
        'An instagram product launch plan is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the instagram product launch plan?',
      answer:
        'No account needed. Open the instagram product launch plan, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Dates use UTC calendar days; the plan does not account for time zones or posting times.',
    'Tasks are fixed planning prompts — the tool does not write your captions, film your reels, or guarantee any launch results.',
  ],
  jsonLd: [],
};
