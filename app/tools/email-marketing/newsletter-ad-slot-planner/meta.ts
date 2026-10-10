import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'issuesPerMonth',
    label: 'Issues per month',
    type: 'number',
    required: true,
    placeholder: 'e.g. 4',
    validation: { min: 1, max: 31 },
  },
  {
    id: 'slots',
    label: 'Ad slots (one per line)',
    type: 'textarea',
    required: true,
    placeholder: 'Top banner | 200 | 80\nSidebar ad | 100 | 50',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'grossMonthlyRevenue', label: 'Gross monthly revenue (estimate)', type: 'currency' },
  { id: 'netRevenueAtFill', label: 'Net revenue at your fill rates (estimate)', type: 'currency' },
  { id: 'utilizationPct', label: 'Utilization % (estimate)', type: 'percent' },
  { id: 'slotTable', label: 'Slot breakdown', type: 'table' },
  { id: 'notice', label: 'Notice', type: 'text' },
];

export const content: ToolContent = {
  title: 'Newsletter Ad Slot Planner',
  description:
    'Price your newsletter ads with confidence: enter issues per month, slot prices, and expected fill rates for gross and net revenue projections.',
  howTo: [
    'Enter how many newsletter issues you send per month.',
    'List your ad slots, one per line: "Name | price per issue | expected fill rate %" (fill rate is optional and defaults to 100).',
    'Run the planner to see gross monthly revenue, fill-adjusted net revenue, utilization, and a per-slot table.',
    'Adjust prices and fill rates to compare scenarios — all numbers come from your own inputs, never market benchmarks.',
  ],
  methodology:
    'Pure arithmetic on your inputs: gross monthly revenue = (sum of slot prices) x issues per month; net revenue at fill = (sum of price x fill rate) x issues per month; utilization = net / gross. Money rounds to 2 decimals, percentages to 2 decimals. The tool has no market data and invents no rates — every number traces to what you typed, and all results are labeled estimates.',
  examples: [
    {
      title: 'Weekly newsletter, 2 slots',
      inputs: { issuesPerMonth: 4, slots: 'Top banner | 200 | 80\nSidebar ad | 100 | 50' },
      note: 'Gross 1200/mo, net 840/mo at your fill rates, 70% utilization.',
    },
    {
      title: 'Biweekly newsletter, 1 slot',
      inputs: { issuesPerMonth: 2, slots: 'Sponsored section | 150 | 100' },
      note: 'Gross and net both 300/mo at full fill.',
    },
    {
      title: 'Fill rate left blank',
      inputs: { issuesPerMonth: 4, slots: 'Header ad | 300' },
      note: 'Fill rate assumed 100% and flagged in the notice.',
    },
  ],
  faqs: [
    {
      question: 'What is the best newsletter ad slot planner?',
      answer:
        'The best planner works from your own prices instead of invented market rates. This free tool computes gross monthly revenue, fill-adjusted net revenue, and utilization from the slot prices and expected fill rates you enter — so the estimates reflect your actual newsletter, not someone else\'s averages.',
    },
    {
      question: 'Is there a free newsletter ad slot planner?',
      answer:
        'Yes — this tool is completely free with no signup. Enter your issues per month and your ad slots (name, price, expected fill rate) to get revenue estimates and a slot breakdown, as many times as you like.',
    },
    {
      question: 'How to plan newsletter ad slot?',
      answer:
        'List each slot with its price per issue and your expected fill rate (what share of issues you realistically sell it in). The planner multiplies by your issues per month to show gross revenue, fill-adjusted net revenue, and utilization — then tweak prices and rates to compare scenarios.',
    },
    {
      question: 'How does a newsletter ad slot planner work?',
      answer:
        'This one does pure arithmetic on your inputs: it sums your slot prices for gross revenue, applies your expected fill rates for a fill-adjusted net figure, and divides net by gross for utilization. It contains no market-rate data and never presents benchmarks as facts — everything is labeled an estimate.',
    },
    {
      question: 'How does the newsletter ad slot planner work?',
      answer:
        'Enter your details using the inputs above and the newsletter ad slot planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the newsletter ad slot planner free to use?',
      answer:
        'Yes - this newsletter ad slot planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a newsletter ad slot planner?',
      answer:
        'A newsletter ad slot planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'All prices and fill rates come only from your input — the tool has no market-rate data and cannot tell you what to charge.',
    'Results are estimates, not guarantees; real revenue depends on actual sales and advertiser demand.',
    'A blank fill rate is assumed to be 100% and flagged in the notice — add your real rates for better estimates.',
    'Max 20 slots; prices are rounded to 2 decimals and percentages to 2 decimals.',
  ],
  jsonLd: [],
};
