import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/project-timeline-estimator/';

export const inputs: ToolInput[] = [
  {
    id: 'tasks',
    label: 'Tasks and hour estimates (one per line)',
    type: 'textarea',
    required: true,
    placeholder: 'e.g.\nScript writing, 4\nRough cut edit, 8\n(one per line: task name, hours)',
  },
  {
    id: 'workHoursPerDay',
    label: 'Work hours per day',
    type: 'number',
    required: true,
    placeholder: 'e.g. 6',
    validation: { min: 0 },
  },
  {
    id: 'startDate',
    label: 'Start date',
    type: 'date',
    required: true,
  },
  {
    id: 'bufferDays',
    label: 'Buffer days',
    type: 'number',
    required: false,
    placeholder: 'e.g. 2 — leave empty for 0',
    validation: { min: 0 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'totalHours',
    label: 'Total hours',
    type: 'number',
    description: 'Free video editing timeline estimator 2026: Sum of all task hour estimates, based on your estimates. Get instant results. No signup - try it free now!',
  },
  {
    id: 'estimatedWorkDays',
    label: 'Estimated work days',
    type: 'number',
    description: 'Work days needed (rounded up) plus your buffer days.',
  },
  {
    id: 'estimatedEndDate',
    label: 'Estimated end date',
    type: 'text',
    description: 'Calendar end date = start date + estimated work days. Based on your estimates.',
  },
  {
    id: 'taskBreakdown',
    label: 'Task breakdown',
    type: 'table',
    description: 'Each task with its hours and share of the total.',
  },
];

export const content: ToolContent = {
  title: 'Video Editing Timeline Estimator 2026 | HusnainBlogger',
  description:
    'Get a project end date with this video editing timeline estimator: enter tasks with hours, daily hours, and buffer days to get total hours and work days. Free!',
  howTo: [
    'List your tasks one per line as "task name, hours" — e.g. "Rough cut edit, 8". These are your own estimates.',
    'Enter how many focused work hours you do per day (e.g. 6).',
    'Pick your start date.',
    'Add buffer days for revisions and delays (e.g. 2), or leave it empty for 0 — a note will remind you no buffer was added.',
    'Run the tool to get total hours, estimated work days, a calendar end date, and the task breakdown.',
  ],
  methodology:
    'Formula J-PROJECT-TIMELINE: total hours = sum of your task hour estimates; estimated work days = ceil(total hours / work hours per day + buffer days); estimated end date = start date + estimated work days, counted in calendar days. Weekends and holidays are NOT skipped. Every number comes from your estimates — the tool performs no AI prediction and knows nothing about your project beyond what you type.',
  examples: [
    {
      title: 'Two-week edit project',
      inputs: {
        tasks: 'Script writing, 4\nRough cut edit, 8\nColor grade, 2',
        workHoursPerDay: 6,
        startDate: '2026-10-05',
        bufferDays: 2,
      },
      note: '14 total hours → ceil(14/6) + 2 = 5 work days, ending 2026-10-10.',
    },
    {
      title: 'Single-day turnaround, no buffer',
      inputs: { tasks: 'Edit, 8', workHoursPerDay: 8, startDate: '2026-10-05', bufferDays: 0 },
      note: '1 work day ending 2026-10-06, with a note that no buffer days were added.',
    },
  ],
  faqs: [
    {
      question: 'What is the best video editing timeline estimator?',
      answer:
        'The best estimator starts from your own task-level hour estimates, not averages. This free tool totals your per-task hours, converts them to work days at your real daily pace, adds your buffer days, and gives a calendar end date.',
    },
    {
      question: 'Is there a free video editing timeline estimator?',
      answer:
        'Yes — this timeline estimator is completely free with no signup. Enter your tasks, work hours per day, start date, and buffer days to get total hours, work days, and an end date.',
    },
    {
      question: 'How to estimate video editing timeline?',
      answer:
        'Break the project into tasks and guess the hours for each honestly (rough cut, revisions, color, sound). Divide total hours by your real work hours per day, round up, and add 1–2 buffer days. This tool does that math and turns it into a calendar end date.',
    },
    {
      question: 'How does the video editing timeline estimator work?',
      answer:
        'Enter your details using the inputs above and the video editing timeline estimator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the video editing timeline estimator free to use?',
      answer:
        'Yes - this video editing timeline estimator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a video editing timeline estimator?',
      answer:
        'A video editing timeline estimator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the video editing timeline estimator?',
      answer:
        'No account needed. Open the video editing timeline estimator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'All outputs are based on your estimates — the tool cannot verify whether your hour guesses are realistic. Underestimated tasks are the #1 cause of missed dates.',
    'Days are calendar days: weekends and holidays are NOT skipped.',
    'Partial work days are rounded up (a 7-hour task at 6 hours/day = 2 days).',
    'Leaving buffer days empty means 0 buffer days; the breakdown shows a note reminding you none was added.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Video Editing Timeline Estimator 2026 | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free video editing timeline estimator 2026: Sum of all task hour estimates, based on your estimates. Get instant results. No signup - try it free now!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Creator Business Tools',
          item: 'https://husnainblogger.com/tools/creator-business/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Project Timeline Estimator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
