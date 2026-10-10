import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/follower-milestone-tracker/';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'label',
    label: 'Milestone name',
    type: 'text',
    required: true,
    placeholder: 'e.g. First 10K, 25K celebration',
  },
  {
    id: 'targetFollowers',
    label: 'Target followers',
    type: 'text',
    required: true,
    placeholder: 'e.g. 10000',
  },
  {
    id: 'currentFollowers',
    label: 'Current followers (enter manually)',
    type: 'text',
    required: true,
    placeholder: 'e.g. 6500 — your own count, typed by hand',
  },
  {
    id: 'targetDate',
    label: 'Target date (optional)',
    type: 'text',
    required: false,
    placeholder: 'YYYY-MM-DD, e.g. 2026-12-31',
  },
];

export const trackerMode: 'log' = 'log';

export const outputs: ToolOutput[] = [
  {
    id: 'lines',
    label: 'Milestone progress',
    type: 'list',
    description:
    'Free instagram follower goal tracker 2026: One progress line per milestone: current/target, percent, remaining, and status. Fast, private.',
  },
  {
    id: 'overallPercent',
    label: 'Overall progress',
    type: 'percent',
    description:
    'Combined progress across all milestones, weighted by target.',
  },
  {
    id: 'totalRemaining',
    label: 'Total followers to go',
    type: 'number',
    description:
    'Followers still needed across all milestones.',
  },
  {
    id: 'verdict',
    label: 'Progress verdict',
    type: 'text',
    description:
    'A plain-English summary of where you stand.',
  },
  {
    id: 'notice',
    label: 'Manual-entry notice',
    type: 'copy',
    description:
    'States that follower counts are entered manually and never read live.',
  },
];

export const content: ToolContent = {
  title: 'Instagram Follower Goal Tracker',
  description:
    'Track your Instagram follower goals with this free manual milestone tracker. Add targets, log your counts by hand, and see progress instantly.',
  howTo: [
    'Add one item per milestone and name it in "Milestone name" (e.g. First 10K).',
    'Enter your "Target followers" and your "Current followers" — typed by hand; this tool cannot read your live Instagram count.',
    'Optionally add a "Target date" in YYYY-MM-DD format.',
    'Run the tool to see per-milestone progress lines, overall percent, and followers remaining.',
    'Use copy/download to keep your records — entries persist for this browser session only.',
  ],
  methodology:
    'This is a manual-entry log, not a live tracker: you type each milestone target and your current follower count yourself, and the tool computes percent complete (current ÷ target, capped at 100%), followers remaining, and a status verdict from simple arithmetic. It has no Instagram API access and never reads live follower counts; percentages are descriptions of your entered numbers, not growth predictions.',
  faqs: [
    {
      question: 'What is the best instagram follower goal tracker?',
      answer:
        'The best Instagram follower goal tracker is one you will actually update: set clear milestone targets, log your current count regularly, and review percent complete and remaining. This free tool does exactly that as a manual-entry log — it cannot read your live Instagram follower count, so you type your numbers by hand.',
    },
    {
      question: 'Is there a free instagram follower goal tracker?',
      answer:
        'Yes — this follower milestone tracker is completely free with no signup. Add as many milestone entries as you like and track percent complete, remaining followers, and status for each.',
    },
    {
      question: 'How to track instagram follower goal?',
      answer:
        'Add a milestone entry with a name, your target follower count, and your current count (typed manually), plus an optional target date. Run the tool to see your percent complete and how many followers remain per milestone.',
    },
    {
      question: 'How does an instagram follower goal tracker work?',
      answer:
        'You enter milestone targets and your current follower counts manually — the tool has no API access and cannot read live Instagram numbers. It then calculates percent complete and remaining followers with simple arithmetic and shows a progress verdict per milestone.',
    },
    {
      question: 'What is an instagram follower goal tracker?',
      answer:
        'An instagram follower goal tracker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Manual entry only: this tool cannot read live Instagram follower counts — every number is typed by you.',
    'Entries persist for this browser session only; use copy/download to keep your records.',
    'Percentages describe the numbers you entered; they are not growth predictions or guarantees.',
  ],
  jsonLd: [],
};
