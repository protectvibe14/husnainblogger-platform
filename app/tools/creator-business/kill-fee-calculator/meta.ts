import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL =
  'https://husnainblogger.com/tools/creator-business/kill-fee-calculator/';

export const inputs: ToolInput[] = [
  {
    id: 'contractValue',
    label: 'Contract value',
    type: 'number',
    required: true,
    placeholder: '2000',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'projectStage',
    label: 'Project stage when cancelled',
    type: 'select',
    required: true,
    options: ['not-started', 'in-progress', 'near-complete'],
  },
  {
    id: 'killPctNotStarted',
    label: 'Kill fee % if not started (from your contract)',
    type: 'number',
    required: false,
    placeholder: '25',
    validation: { min: 0, max: 100, unit: '%' },
  },
  {
    id: 'killPctInProgress',
    label: 'Kill fee % if in progress (from your contract)',
    type: 'number',
    required: false,
    placeholder: '50',
    validation: { min: 0, max: 100, unit: '%' },
  },
  {
    id: 'killPctNearComplete',
    label: 'Kill fee % if near complete (from your contract)',
    type: 'number',
    required: false,
    placeholder: '100',
    validation: { min: 0, max: 100, unit: '%' },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'killFeeAmount',
    label: 'Kill fee owed',
    type: 'currency',
    description: 'Free kill fee calculator freelance 2026: Amount the client owes based on your contract percentage. Get instant results. No signup - try it free now!',
  },
  {
    id: 'killFeePctApplied',
    label: 'Percentage applied',
    type: 'percent',
    description: 'The stage percentage used in the calculation (echoed back).',
  },
  {
    id: 'clientRefund',
    label: 'Refund if prepaid in full',
    type: 'currency',
    description:
      'Contract value minus kill fee — meaningful only if the client already paid in full.',
  },
];

export const content: ToolContent = {
  title: 'Kill Fee Calculator Freelance',
  description:
    'Calculate your freelance kill fee from your own contract terms. Enter the project value and stage, apply your percentage, and see the fee plus refund. Free!',
  howTo: [
    'Enter the total "Contract value" of the cancelled project.',
    'Select the "Project stage when cancelled" (not started, in progress, or near complete).',
    'Type the kill fee percentage written in your own contract for that stage — the tool never invents a standard rate.',
    'Read the "Kill fee owed" amount and, if the client prepaid, the refund due.',
  ],
  methodology:
    'The tool applies one formula: kill fee = contract value × (your stage percentage ÷ 100). The percentage is always the one you enter from your own contract terms — nothing is suggested or filled in by the tool. Refund = contract value − kill fee, which is only correct when the client prepaid the full contract value.',
  examples: [
    {
      title: 'Cancelled before work started',
      inputs: {
        contractValue: 2000,
        projectStage: 'not-started',
        killPctNotStarted: 25,
      },
      note: 'A $2,000 project cancelled before starting with a 25% kill clause yields a $500 kill fee and a $1,500 refund.',
    },
    {
      title: 'Half-finished project cancelled',
      inputs: {
        contractValue: 1500,
        projectStage: 'in-progress',
        killPctInProgress: 40,
      },
      note: '40% of $1,500 is a $600 kill fee, leaving a $900 refund on a prepaid contract.',
    },
    {
      title: 'Near-complete project cancelled',
      inputs: {
        contractValue: 800,
        projectStage: 'near-complete',
        killPctNearComplete: 100,
      },
      note: 'A 100% kill fee on a nearly finished $800 project means the full fee is owed and nothing is refunded.',
    },
  ],
  faqs: [
    {
      question: 'What is the best kill fee calculator freelance?',
      answer:
        'The best kill fee calculator for freelancers uses the percentages from your own contract instead of guessing an industry standard. This one does exactly that: you enter your stage-based percentages, and it computes the kill fee and any refund.',
    },
    {
      question: 'Is there a free kill fee calculator freelance?',
      answer:
        'Yes — this kill fee calculator is completely free with no signup. Enter your contract value, project stage, and your own kill fee percentage, and the tool calculates the fee and refund instantly.',
    },
    {
      question: 'How to calculate kill fee calculator freelance?',
      answer:
        'Multiply the contract value by your kill fee percentage for the project stage, divided by 100. For example, a $2,000 contract cancelled before work with a 25% kill clause gives $2,000 × 0.25 = $500. If the client prepaid, subtract the fee from the contract value to find the refund.',
    },
    {
      question: 'How does the kill fee calculator freelance work?',
      answer:
        'Enter your details using the inputs above and the kill fee calculator freelance calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the kill fee calculator freelance free to use?',
      answer:
        'Yes - this kill fee calculator freelance is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a kill fee calculator freelance?',
      answer:
        'A kill fee calculator freelance is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the kill fee calculator freelance?',
      answer:
        'No account needed. Open the kill fee calculator freelance, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Kill fee percentages are entirely yours — the tool suggests no standard rate, and any "industry standard" claim would be invented.',
    'The refund output assumes the client prepaid the full contract value; adjust manually for partial payments or deposits.',
    'This is a math tool, not legal advice — enforceability of a kill fee depends on your contract and jurisdiction.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Kill Fee Calculator Freelance 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free kill fee calculator freelance 2026: Amount the client owes based on your contract percentage. Get instant results. No signup - try it free now!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Creator Business',
          item: 'https://husnainblogger.com/tools/creator-business/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Kill Fee Calculator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
