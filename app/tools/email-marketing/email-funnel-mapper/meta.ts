import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'funnelGoal',
    label: 'Funnel goal',
    type: 'select',
    required: true,
    options: ['welcome', 'nurture', 'sales', 'winback'],
  },
  {
    id: 'stageCount',
    label: 'Number of stages (3–7)',
    type: 'number',
    required: true,
    validation: { min: 3, max: 7 },
  },
  {
    id: 'emailsPerStage',
    label: 'Emails per stage (1–5)',
    type: 'number',
    required: true,
    validation: { min: 1, max: 5 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'funnelMap', label: 'Funnel map', type: 'table' },
  { id: 'summaryText', label: 'Funnel summary', type: 'text' },
];

const DESCRIPTION =
  'Map your email funnel before you write a word: choose welcome, nurture, sales, or winback, set your stages, and plan every email in the sequence.';

export const content: ToolContent = {
  title: 'Email Funnel Planner',
  description: DESCRIPTION,
  howTo: [
    'Choose a funnel goal: welcome, nurture, sales, or winback.',
    'Enter the number of stages (3–7).',
    'Enter how many emails each stage should contain (1–5).',
    'Generate to get a stage-by-stage map with stage names, triggers, email purposes, and suggested send-day offsets.',
    'Copy the summary into your email tool and adjust the day offsets to your audience cadence.',
  ],
  methodology:
    'The funnel map is built deterministically from fixed data: each of the 4 goals has a fixed 7-stage map of stage names, triggers, and goals, plus a fixed bank of 7 email purposes. The tool takes the first N stages and cycles through the purpose bank. Day offsets use a fixed scheduling formula — stage i starts on day (i × 4), emails within a stage are 2 days apart. These offsets are suggestions, not proven-optimal timing: cadence depends on your audience and list health. No AI and no network; the same inputs always produce the same map.',
  examples: [
    {
      title: '4-stage welcome funnel',
      inputs: { funnelGoal: 'welcome', stageCount: 4, emailsPerStage: 2 },
      note: '8 emails over an estimated 14 days, from welcome to soft offer.',
    },
    {
      title: '5-stage sales funnel',
      inputs: { funnelGoal: 'sales', stageCount: 5, emailsPerStage: 1 },
      note: '5 emails from problem agitation through urgency.',
    },
  ],
  faqs: [
    {
      question: 'What is the best email funnel planner?',
      answer:
        'The best one gives you stages, triggers, and email purposes — not just a blank canvas. This free planner builds a complete stage-by-stage map with suggested send-day offsets for welcome, nurture, sales, or winback goals.',
    },
    {
      question: 'Is there a free email funnel planner?',
      answer:
        'Yes — this email funnel planner is completely free with no signup. Choose a goal and stage count to get your full funnel map instantly.',
    },
    {
      question: 'How to plan email funnel?',
      answer:
        'Pick a goal (welcome, nurture, sales, or winback), set the number of stages and emails per stage. The planner outputs each stage’s trigger, goal, and email purposes with suggested day offsets — then adjust the timing to your audience.',
    },
    {
      question: 'How does the email funnel planner work?',
      answer:
        'Enter your details using the inputs above and the email funnel planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the email funnel planner free to use?',
      answer:
        'Yes - this email funnel planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an email funnel planner?',
      answer:
        'An email funnel planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the email funnel planner?',
      answer:
        'No account needed. Open the email funnel planner, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Day offsets are scheduling suggestions (estimates), not proven-optimal send times.',
    'Stage maps are fixed templates — they do not analyze your list or past performance.',
    'Visual rendering of the funnel is the app component’s job; this tool defines the data model only.',
  ],
  jsonLd: [],
};
