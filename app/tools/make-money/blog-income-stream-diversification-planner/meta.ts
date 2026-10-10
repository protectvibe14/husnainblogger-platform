import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'currentStreams',
    label: 'Current income streams',
    type: 'select',
    required: true,
    placeholder: 'Select your main stream…',
    options: [
      'Display ads',
      'Affiliate marketing',
      'Sponsored posts',
      'Digital products',
      'Memberships / subscriptions',
      'Services / freelancing',
      'Newsletter sponsorships',
      'Just starting (no streams yet)',
    ],
  },
  {
    id: 'monthlyRevenue',
    label: 'Monthly revenue (USD)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 2000',
    validation: { min: 0, unit: 'USD' },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'diversificationPlan', label: 'Diversification plan', type: 'table' },
  { id: 'strategyNote', label: 'Strategy note', type: 'text' },
];

const DESCRIPTION =
  'Build resilient revenue with this blog income diversification guide — spread earnings across ads, affiliates, and digital products. Build multiple.';

export const content: ToolContent = {
  title: 'Blog Income Diversification Guide',
  description: DESCRIPTION,
  howTo: [
    'In “Current income streams”, select the revenue stream your blog relies on most today — pick “Just starting” if you have none yet.',
    'Enter your “Monthly revenue” in USD if you know it; this powers the 10–30% diversification target band, labeled as an estimate.',
    'Submit to get your diversification plan: up to 4 recommended streams ranked by fit, each with effort, income potential, and timing.',
    'Read the strategy note for your concentration level and the suggested order to add the new streams.',
    'Work the plan top-down — add the first recommended stream this month before stacking the next one.',
  ],
  methodology:
    'The planner holds a fixed catalog of 7 income streams plus one “just starting” option, and a fixed pairing rule for each: which streams complement it best. Every recommended stream gets one vote per rule that names it for one of your current streams; ties break by fixed catalog order; the top 4 become the plan with fixed timing labels. Income potential is a qualitative effort-based band, never dollar figures, and any dollar target is 10–30% of the revenue you entered, labeled an estimate — the tool has no platform payout data and invents none.',
  examples: [
    {
      title: 'Ad-only blog at $2,000/month',
      inputs: { currentStreams: 'Display ads', monthlyRevenue: 2000 },
      note: 'Ranks affiliate marketing first (it pairs with ad-driven review traffic) and shows a $200–$600/month new-stream target band, labeled an estimate built from your own figure.',
    },
    {
      title: 'Brand new blog, no streams',
      inputs: { currentStreams: 'Just starting (no streams yet)' },
      note: 'Returns the starter sequence — display ads, affiliate marketing, sponsored posts, digital products — with no dollar targets until a revenue figure is entered.',
    },
  ],
  faqs: [
    {
      question: 'What is the best blog income diversification?',
      answer:
        'The best diversification adds streams that complement what you already earn — for example affiliate links on an ad-driven blog, or a digital product for an audience that already trusts your tutorials. This planner applies exactly that rule: it ranks new streams by how well they pair with your current ones, using a fixed, documented rule set.',
    },
    {
      question: 'Is there a free blog income diversification?',
      answer:
        'Yes — this planner is completely free with no signup. It runs entirely in your browser: the streams you select and the revenue figure you enter never leave your device.',
    },
    {
      question: 'How to use blog income diversification?',
      answer:
        'Select your current income stream, optionally enter your monthly revenue, and read the ranked plan table: which streams to add, in what order, with effort and timing for each. Then work the list top-down, adding one stream at a time.',
    },
    {
      question: 'How does a blog income diversification work?',
      answer:
        'You pick your current stream (and revenue, if you know it). The tool applies fixed pairing rules to score the remaining streams by fit, ranks the top four with effort, qualitative income potential, and timing, and writes a strategy note with your concentration level. No AI, no blog analysis — just documented rules.',
    },
    {
      question: 'What is a blog income diversification?',
      answer:
        'A blog income diversification is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Recommendations come from a fixed pairing rule set, not from an analysis of your niche, traffic, or content.',
    'Income potential ratings are qualitative effort-based labels; the tool has no platform payout data and invents none.',
    'Any dollar target is arithmetic on the monthly revenue you entered (a 10–30% band) and is labeled an estimate, never a prediction.',
  ],
  jsonLd: [],
};
