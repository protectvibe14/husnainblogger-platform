import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Blog niche',
    type: 'select',
    required: true,
    options: [
      'Personal Finance',
      'Health & Fitness',
      'Food & Recipes',
      'Travel',
      'Technology',
      'Parenting & Family',
      'Fashion & Beauty',
      'Home & DIY',
      'Pets',
      'Business & Marketing',
      'Education & Learning',
      'Lifestyle',
      'Sports & Outdoors',
      'Gaming',
      'Other',
    ],
  },
  {
    id: 'monthlySearchVolume',
    label: 'Niche monthly search volume',
    type: 'number',
    required: true,
    placeholder: 'e.g. 100000',
    validation: { min: 1 },
  },
  {
    id: 'competitionLevel',
    label: 'Competition level',
    type: 'select',
    required: true,
    options: ['low', 'medium', 'high'],
  },
  {
    id: 'monetAds',
    label: 'Monetization: display ads',
    type: 'boolean',
    required: false,
  },
  {
    id: 'monetAffiliate',
    label: 'Monetization: affiliate marketing',
    type: 'boolean',
    required: false,
  },
  {
    id: 'monetProducts',
    label: 'Monetization: digital products / courses',
    type: 'boolean',
    required: false,
  },
  {
    id: 'monetSponsored',
    label: 'Monetization: sponsored content',
    type: 'boolean',
    required: false,
  },
  {
    id: 'avgRpm',
    label: 'Average RPM (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 20',
    validation: { min: 0.01, unit: 'USD' },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'profitabilityScore', label: 'Profitability score (heuristic, 0–100)', type: 'number' },
  { id: 'estimatedMonthlyPotential', label: 'Estimated monthly traffic value', type: 'currency' },
  { id: 'methodBreakdown', label: 'Per-method breakdown', type: 'list' },
  { id: 'disclaimer', label: 'Honesty disclaimer', type: 'text' },
];

const DESCRIPTION =
  'Use this free blog niche profitability calculator — enter search volume, competition, monetization methods, and RPM for a 0–100 heuristic score.';

export const content: ToolContent = {
  title: 'Blog Niche Profitability Calculator',
  description: DESCRIPTION,
  howTo: [
    'Pick your blog niche from the list.',
    'Enter the niche\'s monthly search volume and choose the competition level (low, medium, or high) based on your own research.',
    'Tick the monetization methods you plan to use: display ads, affiliate marketing, digital products, and/or sponsored content.',
    'Enter your average RPM in USD (your own figure — it is fully editable).',
    'Run the calculation to get a 0–100 heuristic score, a traffic-value estimate, and a per-method breakdown.',
  ],
  methodology:
    'The score is a published heuristic rubric with four equally weighted factors (0.25 each): traffic = log10(monthly search volume)/7 (clamped 0–1, so 10M+ searches = 1.0), competition = 1 minus the level value (low 0, medium 0.5, high 1), monetization = selected methods ÷ 4, and RPM = avg RPM ÷ $50 (clamped 0–1). Score = round(25 × (traffic + competition + monetization + RPM)), clamped 0–100. The monthly figure is a traffic-value estimate: search volume × 5% capture heuristic × RPM ÷ 1000, split evenly across the selected methods. This is a comparative heuristic, not a researched metric or a profit prediction.',
  examples: [
    {
      title: 'High-traffic tech niche',
      inputs: { niche: 'Technology', monthlySearchVolume: 10000000, competitionLevel: 'low', monetAds: true, monetAffiliate: true, monetProducts: true, monetSponsored: true, avgRpm: 50 },
      note: 'Perfect factor values give a heuristic score of 100 with a $25,000/mo traffic-value estimate split across the four methods.',
    },
    {
      title: 'Competitive small niche',
      inputs: { niche: 'Pets', monthlySearchVolume: 100, competitionLevel: 'high', monetAds: true, avgRpm: 5 },
      note: 'Low volume, high competition, one method, and a $5 RPM give a heuristic score of 16 — useful for comparing niches side by side.',
    },
  ],
  faqs: [
    {
      question: 'What is the best blog niche profitability calculator?',
      answer:
        'The best calculator publishes its scoring rubric instead of hiding it, because niche scores are heuristics, not measurements. This free tool shows the full rubric in its methodology section — and you should treat any niche score as a rough comparison guide, not a profit guarantee.',
    },
    {
      question: 'Is there a free blog niche profitability calculator?',
      answer:
        'Yes — this calculator is completely free with no signup. Enter your search volume, competition level, monetization methods, and RPM to get an instant 0–100 heuristic score and a traffic-value estimate.',
    },
    {
      question: 'How to calculate blog niche profitability?',
      answer:
        'Combine search volume (traffic opportunity), competition (difficulty), your monetization methods, and average RPM into one score. This tool weights all four equally in a published rubric and estimates traffic value as volume × 5% capture × RPM ÷ 1000 — remember the result is a heuristic, not a prediction.',
    },
    {
      question: 'How does the blog niche profitability calculator work?',
      answer:
        'Enter your details using the inputs above and the blog niche profitability calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the blog niche profitability calculator free to use?',
      answer:
        'Yes - this blog niche profitability calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a blog niche profitability calculator?',
      answer:
        'A blog niche profitability calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the blog niche profitability calculator?',
      answer:
        'No account needed. Open the blog niche profitability calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'The score is a HEURISTIC for comparing niches — not a researched metric and not a profit prediction.',
    'Search volume, competition level, and RPM are user-entered judgments; the output is only as good as the inputs.',
    'The monthly figure uses a fixed 5% capture heuristic and splits evenly across selected methods — illustrative, not real per-channel data.',
    'The full scoring rubric is published in the methodology section above and in the tool\'s logic source.',
  ],
  jsonLd: [],
};
