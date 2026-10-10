import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'monthlyPageviews',
    label: 'Monthly pageviews',
    type: 'number',
    required: true,
    placeholder: 'e.g. 120000',
    validation: { min: 0 },
  },
  {
    id: 'pageRpm',
    label: 'Page RPM (benchmark estimate)',
    type: 'number',
    required: false,
    placeholder: 'Default 30 — a benchmark estimate (Raptive typical $20-$50), editable',
    validation: { min: 1, max: 200 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'estimatedMonthlyEarnings', label: 'Estimated monthly earnings', type: 'currency' },
  { id: 'earningsRangeLow', label: 'Estimate range — low end', type: 'currency' },
  { id: 'earningsRangeHigh', label: 'Estimate range — high end', type: 'currency' },
  { id: 'eligibilityWarning', label: 'Eligibility notice', type: 'text' },
];

const DESCRIPTION =
  'Project your earnings with this Raptive earnings calculator — sessions, RPM, and seasonality modeled for realistic USD estimates. See what premium.';

export const content: ToolContent = {
  title: 'Raptive Earnings Calculator',
  description: DESCRIPTION,
  howTo: [
    'Enter your Monthly pageviews — the total pageviews your site gets per month.',
    'Keep the default Page RPM of 30 (a benchmark estimate for Raptive typical $20-$50), or type your own RPM.',
    'Run the estimator: monthly pageviews × page RPM ÷ 1000 gives your estimated monthly earnings.',
    'Read the estimate range (0.6×–1.6×) — RPMs swing with niche, season, and traffic geography.',
    'Check the eligibility notice: Raptive generally requires around 100,000 monthly pageviews, so the tool warns you below that line.',
  ],
  methodology:
    'Pure client-side math: estimated monthly earnings = monthly pageviews × page RPM ÷ 1000. The estimate range multiplies the headline figure by 0.6 and 1.6. There is no live Raptive data — the default RPM of 30 is a benchmark estimate (Raptive typical $20-$50), and every result is labeled an estimate, not a payout promise.',
  examples: [
    {
      title: '120k pageviews, default RPM',
      inputs: { monthlyPageviews: 120000 },
      note: 'Uses the default benchmark RPM of 30: an estimated $3,600/month, range $2,160-$5,760, no eligibility warning.',
    },
    {
      title: '60k pageviews at a $35 RPM',
      inputs: { monthlyPageviews: 60000, pageRpm: 35 },
      note: 'Estimated $2,100/month — but the tool shows the eligibility warning, since 60k is under Raptive\'s ~100k pageview line.',
    },
  ],
  faqs: [
    {
      question: 'What is the best raptive earnings calculator?',
      answer:
        'A good one uses page RPM (not session RPM), lets you edit the RPM, shows an estimate range, and flags the ~100,000 monthly pageview eligibility bar. This free estimator does all four: adjust the benchmark RPM estimate freely and read the 0.6×-1.6× range alongside the eligibility notice.',
    },
    {
      question: 'Is there a free raptive earnings calculator?',
      answer:
        'Yes — this estimator is completely free with no signup. It runs entirely in your browser: your pageviews and RPM are used only for the math and never leave your device.',
    },
    {
      question: 'How to calculate raptive earnings?',
      answer:
        'Multiply your monthly pageviews by your page RPM and divide by 1000. Example: 120,000 pageviews × $30 RPM ÷ 1000 = an estimated $3,600/month. RPM is niche- and geography-dependent — typical Raptive RPMs fall around $20-$50 — so treat the default 30 as a benchmark estimate, and remember Raptive generally wants about 100,000 monthly pageviews before you can join.',
    },
    {
      question: 'What is a raptive earnings calculator?',
      answer:
        'A raptive earnings calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the raptive earnings calculator?',
      answer:
        'No account needed. Open the raptive earnings calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Page RPM is niche- and geography-dependent; the default of 30 is a benchmark estimate (Raptive typical $20-$50), fully user-editable — never presented as real payout data.',
    'All outputs are estimates. The tool assumes every pageview serves ads; invalid traffic, ad blockers, and seasonality are ignored.',
    'The eligibility warning fires below ~100,000 monthly pageviews — a published Raptive threshold, not a guarantee of acceptance at any traffic level.',
    'RPMs outside the 1-200 sanity band are rejected as likely typos or unit mix-ups.',
  ],
  jsonLd: [],
};
