import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/client-profitability-tracker/';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'name',
    label: 'Client name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Acme Corp',
  },
  {
    id: 'revenue',
    label: 'Revenue from client (USD)',
    type: 'text',
    required: true,
    placeholder: 'e.g. 5000',
  },
  {
    id: 'hoursWorked',
    label: 'Hours worked',
    type: 'text',
    required: true,
    placeholder: 'e.g. 40',
  },
  {
    id: 'hourlyCostRate',
    label: 'Your hourly cost rate (USD)',
    type: 'text',
    required: true,
    placeholder: 'e.g. 60',
  },
  {
    id: 'directExpenses',
    label: 'Direct expenses (USD)',
    type: 'text',
    required: true,
    placeholder: 'e.g. 200',
  },
];

export const trackerMode: 'log' = 'log';

export const outputs: ToolOutput[] = [
  {
    id: 'profitPerClient',
    label: 'Profit per client',
    type: 'table',
    description:
    'Free freelance client profitability tracker 2026: Revenue, total cost, and profit for each client, ranked by profit. Fast, private now.',
  },
  {
    id: 'marginPctPerClient',
    label: 'Margin % per client',
    type: 'list',
    description:
    'Profit margin per client; negative margins are flagged, never hidden.',
  },
  {
    id: 'clientRanking',
    label: 'Client ranking',
    type: 'list',
    description:
    'Clients ordered from most to least profitable.',
  },
  {
    id: 'exportableCSV',
    label: 'Exportable CSV',
    type: 'download',
    description:
    'Downloadable CSV of every client record and result — this is how you keep your data.',
  },
];

export const content: ToolContent = {
  title: 'Freelance Client Profitability Tracker',
  description:
    'Rank clients by true profit with this freelance client profitability tracker: enter revenue, hours, cost rate and expenses for profit and margins. Free.',
  howTo: [
    'Add one entry per client: a unique client name, revenue earned, hours worked, your hourly cost rate, and direct expenses — all in USD.',
    'Use your real cost rate (what an hour of your time actually costs you), not your billing rate.',
    'Run the tool to get profit and margin per client, a most-to-least-profitable ranking, and a downloadable CSV.',
    'Download the CSV to keep your records — entries are session-based and are not saved in your browser.',
    'Re-run with updated numbers each month to spot clients drifting into negative margin.',
  ],
  methodology:
    'Formula J-CLIENT-PROFIT: total cost = hours worked × hourly cost rate + direct expenses; profit = revenue − total cost; margin % = profit / revenue × 100 (shown as n/a when revenue is 0). Clients are ranked by profit descending; negative margins are flagged as losing money, never hidden. Entries are session-based — this page stores nothing in your browser; the CSV export is the only way to keep your data. All money values are rounded to 2 decimals, margins to 1.',
  faqs: [
    {
      question: 'What is the best freelance client profitability tracker?',
      answer:
        'The best tracker separates profitable clients from time-sinks using your real numbers. This free tool takes each client’s revenue, your hours, your hourly cost rate, and direct expenses, then computes profit and margin per client with a most-to-least-profitable ranking.',
    },
    {
      question: 'Is there a free freelance client profitability tracker?',
      answer:
        'Yes — this profitability tracker is completely free with no signup. Add as many clients as you like and get profit, margins, a ranking, and a downloadable CSV for each run.',
    },
    {
      question: 'How to track freelance client profitability?',
      answer:
        'For each client, record what they paid you, how many hours you spent, what each hour costs you, and any direct expenses. This tool turns those four numbers into profit and margin per client — then download the CSV, because entries are session-based and are not saved in your browser.',
    },
    {
      question: 'How does the freelance client profitability tracker work?',
      answer:
        'Enter your details using the inputs above and the freelance client profitability tracker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the freelance client profitability tracker free to use?',
      answer:
        'Yes - this freelance client profitability tracker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a freelance client profitability tracker?',
      answer:
        'A freelance client profitability tracker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the freelance client profitability tracker?',
      answer:
        'No account needed. Open the freelance client profitability tracker, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Entries are session-based: this tool does NOT save data in your browser or anywhere else. Download the CSV export to keep your records — closing or refreshing the page loses your entries.',
    'Your hourly cost rate should reflect your true cost per hour (tools, taxes, unpaid admin time), not your billing rate — using your billing rate understates cost.',
    'Margin is shown as n/a when a client’s revenue is 0; negative margins are flagged as losing money rather than hidden.',
    'Results are estimates from your entered numbers, not accounting advice.',
  ],
  jsonLd: [
  ],
};
