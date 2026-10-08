import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'monthlySessions',
    label: 'Monthly sessions',
    type: 'number',
    required: true,
    placeholder: 'e.g. 50000',
    validation: { min: 0 },
  },
  {
    id: 'sessionRpm',
    label: 'Session RPM (benchmark estimate)',
    type: 'number',
    required: false,
    placeholder: `Default 25 — a benchmark estimate (Mediavine typical $15-$40), editable`,
    validation: { min: 1, max: 200 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'estimatedMonthlyEarnings', label: 'Estimated monthly earnings', type: 'currency' },
  { id: 'earningsRangeLow', label: 'Estimate range — low end', type: 'currency' },
  { id: 'earningsRangeHigh', label: 'Estimate range — high end', type: 'currency' },
];

const DESCRIPTION =
  'Free mediavine earnings calculator 2026: get instant results in your browser. Instant, private, and mobile-friendly. No signup - try it free!';

export const content: ToolContent = {
  title: 'Mediavine Earnings Calculator 2026 – Free | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Enter your Monthly sessions — the monetizable sessions your site gets per month.',
    'Keep the default Session RPM of 25 (a benchmark estimate for Mediavine typical $15-$40), or type your own RPM if you know it.',
    'Run the calculator: monthly sessions × RPM ÷ 1000 gives your estimated monthly earnings.',
    'Read the estimate range (0.6×–1.6× of the headline number) — RPMs vary a lot by niche, season, and geography.',
    'Re-run with a lower and a higher RPM to sanity-check a conservative vs optimistic scenario.',
  ],
  methodology:
    'Pure client-side math: estimated monthly earnings = monthly sessions × session RPM ÷ 1000. The estimate range multiplies the headline figure by 0.6 and 1.6. There is no live Mediavine data — the default RPM of 25 is a benchmark estimate (Mediavine typical $15-$40), and every result is labeled an estimate, not a payout promise.',
  examples: [
    {
      title: '50k sessions, default RPM',
      inputs: { monthlySessions: 50000 },
      note: 'Uses the default benchmark RPM of 25: an estimated $1,250/month, range $750-$2,000.',
    },
    {
      title: '150k sessions at a $32 RPM',
      inputs: { monthlySessions: 150000, sessionRpm: 32 },
      note: 'Estimated $4,800/month, range $2,880-$7,680 — RPMs this high depend heavily on niche and US traffic share.',
    },
  ],
  faqs: [
    {
      question: 'What is the best mediavine earnings calculator?',
      answer:
        'A good one uses session RPM (not page RPM), lets you edit the RPM, and shows an estimate range instead of one flattering number. This free calculator does all three: enter your monthly sessions, adjust the benchmark RPM estimate, and read the 0.6×-1.6× range.',
    },
    {
      question: 'Is there a free mediavine earnings calculator?',
      answer:
        'Yes — this calculator is completely free with no signup. It runs entirely in your browser: your sessions and RPM are used only for the math and never leave your device.',
    },
    {
      question: 'How to calculate mediavine earnings?',
      answer:
        'Multiply your monthly sessions by your session RPM and divide by 1000. Example: 50,000 sessions × $25 RPM ÷ 1000 = an estimated $1,250/month. The RPM is publisher-dependent — typical Mediavine RPMs fall around $15-$40 — so treat the default 25 as a benchmark estimate and test your own number.',
    },
    {
      question: 'How does the mediavine earnings calculator work?',
      answer:
        'Enter your details using the inputs above and the mediavine earnings calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the mediavine earnings calculator free to use?',
      answer:
        'Yes - this mediavine earnings calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a mediavine earnings calculator?',
      answer:
        'A mediavine earnings calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the mediavine earnings calculator?',
      answer:
        'No account needed. Open the mediavine earnings calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Session RPM is publisher- and niche-dependent; the default of 25 is a benchmark estimate (Mediavine typical $15-$40), fully user-editable — never presented as real payout data.',
    'All outputs are estimates. The tool assumes every session serves ads; invalid traffic, ad blockers, seasonality, and geography are ignored.',
    'RPMs outside the 1-200 sanity band are rejected as likely typos or unit mix-ups.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Mediavine Earnings Calculator 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/mediavine-earnings-calculator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: DESCRIPTION,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Make-Money & Affiliate Tools',
          item: 'https://husnainblogger.com/tools/make-money/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Mediavine Earnings Calculator',
          item: 'https://husnainblogger.com/tools/make-money/mediavine-earnings-calculator/',
        },
      ],
    },
  ],
};
