import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/milestone-payment-planner/';

export const inputs: ToolInput[] = [
  {
    id: 'contractValue',
    label: 'Contract value (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 2500',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'milestones',
    label: 'Milestones (one per line)',
    type: 'textarea',
    required: true,
    placeholder: 'Kickoff | 30 | On signing\nMidpoint | 40 | Draft approved\nLaunch | 30 | Go live',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'contractValue',
    label: 'Contract value',
    type: 'currency',
    description:
    'Free freelance milestone payment schedule 2026: The contract total being split. free.',
  },
  {
    id: 'milestoneSchedule',
    label: 'Milestone schedule',
    type: 'table',
    description:
    'Each milestone with its percentage and dollar amount.',
  },
  {
    id: 'sumCheck',
    label: 'Percentage sum check',
    type: 'number',
    description:
    'Total of your milestone percentages (must equal 100).',
  },
  {
    id: 'paymentTimeline',
    label: 'Payment timeline',
    type: 'text',
    description:
    'Human-readable one-line-per-milestone timeline with amounts and due conditions.',
  },
  {
    id: 'warning',
    label: 'Payment protection warning',
    type: 'text',
    description:
    'Informational flag when a single 100% milestone leaves no upfront protection.',
  },
];

export const content: ToolContent = {
  title: 'Freelance Milestone Payment Schedule',
  description:
    'Plan a freelance milestone payment schedule in seconds. Split any contract into milestones, verify the 100% total, get a timeline. Free now.',
  howTo: [
    'Enter the total contract value in USD.',
    'List your milestones one per line as "Name | percentage | due condition" — for example, "Kickoff | 30 | On signing".',
    'Make sure your percentages add up to exactly 100%.',
    'Run the tool to get the dollar amount per milestone and a payment timeline.',
    'Read the warning if you used a single 100% milestone — it flags the missing upfront protection.',
  ],
  methodology:
    'This tool does pure percentage-split math: amount = contractValue x (percentage / 100) for each milestone you define. Your percentages must sum to 100 (validated; small float formatting like 33.33 + 33.33 + 33.34 passes). Each amount rounds to the nearest cent, and leftover rounding cents go to the final milestone so the schedule totals exactly the contract value. Percentages are entirely your choice — the tool recommends none and gives no legal or financial advice.',
  examples: [
    {
      title: 'Classic 50/50 split',
      inputs: {
        contractValue: 1000,
        milestones: 'Kickoff | 50 | On signing\nDelivery | 50 | On delivery',
      },
      note: 'Two $500 milestones with a clean 100% sum check.',
    },
    {
      title: 'Three-stage project',
      inputs: {
        contractValue: 2500,
        milestones: 'Start | 30 | On signing\nMidpoint | 40 | Draft approved\nLaunch | 30 | Go live',
      },
      note: 'Amounts $750, $1,000, $750 with a readable payment timeline.',
    },
    {
      title: 'Percentages that do not add to 100',
      inputs: {
        contractValue: 1000,
        milestones: 'Kickoff | 30\nDelivery | 30',
      },
      note: 'Returns a validation error naming the current total (60%) instead of a schedule.',
    },
  ],
  faqs: [
    {
      question: 'What is the best freelance milestone payment schedule?',
      answer:
        'The best schedule splits the contract into clear percentages tied to due conditions, sums to exactly 100%, and includes an upfront deposit. This free planner computes the dollar amounts, verifies the 100% total, and flags a single 100% milestone as unprotected.',
    },
    {
      question: 'Is there a free freelance milestone payment schedule?',
      answer:
        'Yes — this freelance milestone payment planner is completely free with no signup. Enter your contract value and milestones to get amounts, a timeline, and the sum check.',
    },
    {
      question: 'How to use freelance milestone payment schedule?',
      answer:
        'Enter your contract value, then list milestones one per line as "Name | percentage | due condition" with percentages totaling 100. Run the tool to get each milestone amount and a payment timeline you can paste into your contract.',
    },
    {
      question: 'What is a freelance milestone payment schedule?',
      answer:
        'A freelance milestone payment schedule is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the freelance milestone payment schedule?',
      answer:
        'No account needed. Open the freelance milestone payment schedule, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Percentages are user-defined — the tool does pure split math and gives no legal or financial advice.',
    'Rounding remainder cents are assigned to the final milestone so the schedule totals exactly the contract value.',
    'Percentages must sum to 100 (tolerance 0.01 for float formatting); anything else is a validation error.',
  ],
  jsonLd: [],
};
