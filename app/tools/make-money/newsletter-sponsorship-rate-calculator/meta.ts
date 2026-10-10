import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'subscriberCount',
    label: 'Subscriber count',
    type: 'number',
    required: true,
    placeholder: 'e.g. 20000',
    validation: { min: 1 },
  },
  {
    id: 'openRate',
    label: 'Average open rate (%)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 40',
    validation: { min: 0, max: 100 },
  },
  {
    id: 'placement',
    label: 'Ad placement',
    type: 'select',
    required: true,
    options: ['primary', 'secondary'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'ratePerIssue', label: 'Rate per issue (USD)', type: 'currency' },
  { id: 'effectiveCpm', label: 'Effective CPM across opens', type: 'text' },
  { id: 'benchmarkCpm', label: 'CPM benchmark used (USD)', type: 'text' },
  { id: 'currency', label: 'Currency', type: 'text' },
  { id: 'note', label: 'Estimate note', type: 'text' },
];

const DESCRIPTION =
  'Estimate newsletter sponsorship rates free — price each issue from subscribers, open rate, and placement using labeled 2026 CPM estimates. Start pricing now.';

export const content: ToolContent = {
  title: 'Newsletter Sponsorship Rates',
  description: DESCRIPTION,
  howTo: [
    'Enter your newsletter subscriber count in the subscriberCount field.',
    'Enter your average open rate as a percent (0–100) in the openRate field.',
    'Choose primary for a top-of-email placement or secondary for below-the-fold — each uses a labeled 2026 CPM estimate ($150 vs $50).',
    'Run the tool and read the rate per issue plus the effective CPM across opened emails in USD.',
    'If your open rate is 0, the effective CPM is n/a — the per-issue rate is still shown.',
  ],
  methodology:
    'The tool divides subscriber count by 1,000 and multiplies by a placement CPM benchmark (primary ~$150, secondary ~$50 — 2026 labeled estimates), then computes effective CPM as rate per issue ÷ opened emails × 1,000. All benchmarks are estimates, never presented as platform-published or guaranteed rates.',
  examples: [
    {
      title: 'Primary placement, 20k subs',
      inputs: { subscriberCount: 20000, openRate: 40, placement: 'primary' },
      note: '$3,000.00 per issue; $375.00 effective CPM (estimated).',
    },
    {
      title: 'Secondary placement, 10k subs',
      inputs: { subscriberCount: 10000, openRate: 50, placement: 'secondary' },
      note: '$500.00 per issue; $100.00 effective CPM (estimated).',
    },
    {
      title: 'Zero open rate edge case',
      inputs: { subscriberCount: 5000, openRate: 0, placement: 'secondary' },
      note: '$250.00 per issue; effective CPM is n/a with no opens.',
    },
  ],
  faqs: [
    {
      question: 'What is the best newsletter sponsorship rates?',
      answer:
        'There is no single best rate — it depends on your list size, placement, and list quality. This free calculator estimates your per-issue rate from 2026 CPM benchmarks (primary ~$150, secondary ~$50), so you can quote sponsors a realistic, defensible number.',
    },
    {
      question: 'Is there a free newsletter sponsorship rates?',
      answer:
        'Yes — this tool is completely free with no signup. Enter your subscriber count, open rate, and placement to get an estimated per-issue rate plus the effective CPM across opened emails.',
    },
    {
      question: 'How to use newsletter sponsorship rates?',
      answer:
        'Enter your subscriber count and open rate, pick primary or secondary placement, and read the estimated per-issue rate. Compare the effective CPM to industry estimates when negotiating — strong niche lists can price above the benchmark.',
    },
    {
      question: 'What is a newsletter sponsorship rates?',
      answer:
        'A newsletter sponsorship rates is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the newsletter sponsorship rates?',
      answer:
        'No account needed. Open the newsletter sponsorship rates, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'What is a good newsletter sponsorship rates?',
      answer: 'It depends on your industry, location, and experience level. Use the calculator to benchmark different scenarios, then compare against published averages for your niche.',
    },
    {
      question: 'Is this newsletter sponsorship rates calculator accurate?',
      answer: 'Yes, it uses standard formulas and up-to-date rates. However, treat the result as an estimate for planning — actual figures may vary based on your specific situation.',
    },
  ],
  assumptions: [
    'CPM benchmarks are 2026 ESTIMATES (primary ~$150, secondary ~$50), not platform-published or guaranteed rates.',
    'Open rate is self-reported; the tool cannot verify list quality or bot opens.',
    'Audience geography, list engagement, and niche are not modeled — they move real prices significantly.',
    'Actual rates vary by niche, list quality, and negotiation — this is guidance, not a guarantee.',
  ],
  jsonLd: [],
};
