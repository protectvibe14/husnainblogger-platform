import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/profile-name-seo-optimizer/';

export const inputs: ToolInput[] = [
  {
    id: 'keywords',
    label: 'Keywords (one per line or comma-separated)',
    type: 'textarea',
    required: true,
    placeholder: 'fitness coach\nnutrition tips\nweight loss',
  },
  {
    id: 'name',
    label: 'Current name (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. Alex Rivera',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'optimizedNames',
    label: 'Optimized names',
    type: 'list',
    description:
    'Free instagram name seo optimizer 2026: Name suggestions, every one capped at 30 characters. free.',
  },
  {
    id: 'keywordCoverage',
    label: 'Keyword coverage',
    type: 'percent',
    description:
    'Share of your keywords present in the recommended name.',
  },
  {
    id: 'charBudgetBar',
    label: 'Character budget',
    type: 'text',
    description:
    'Visual 30-character budget bar for the recommended name.',
  },
  {
    id: 'note',
    label: 'Budget note',
    type: 'text',
    description:
    'Which keywords were dropped to fit the budget, if any.',
  },
];

export const content: ToolContent = {
  title: 'Instagram Name SEO Optimizer',
  description:
    'Fit more keywords into your profile with this Instagram name SEO optimizer — 30-character names with keyword coverage scored for better discovery.',
  howTo: [
    'Paste your "Keywords" — one per line or comma-separated, most important first.',
    'Optionally add your "Current name" to get name-plus-keyword combinations.',
    'Run the tool to get optimized name suggestions, all hard-capped at 30 characters.',
    'Check "Keyword coverage" to see how many of your keywords the recommended name keeps.',
    'Read the "Budget note" if keywords were dropped, then pick the name that reads best.',
  ],
  methodology:
    'Your keywords are split, deduplicated, and priority-ranked in the order you type them. The engine tries three separators (" | ", " · ", ", ") over keyword subsets, keeps only combinations that fit a strict 30-character budget, and drops the lowest-priority keywords first when the full set does not fit. Keyword coverage is the share of your keywords present in the recommended name, and the budget bar shows exactly how many of the 30 characters it uses. No AI, no live Instagram data.',
  examples: [
    {
      title: 'Fitness coach keywords',
      inputs: { keywords: 'fitness coach, nutrition, weight loss' },
      note: 'Short keywords that all fit: the recommended name keeps 100% coverage.',
    },
    {
      title: 'Too many keywords',
      inputs: { keywords: 'fitness coaching, weight loss, meal plans, online training, hiit workouts' },
      note: 'The set does not fit, so lowest-priority keywords are dropped and reported.',
    },
    {
      title: 'Name plus keywords',
      inputs: { keywords: 'skincare, esthetician', name: 'Maya' },
      note: 'Combines the current name with the top keywords inside the 30-character budget.',
    },
  ],
  faqs: [
    {
      question: 'what is the best instagram name seo optimizer?',
      answer:
        'The best instagram name seo optimizer respects the 30-character budget, ranks your keywords by priority, and shows exactly which keywords each suggestion keeps. This free tool does that — with a keyword-coverage score and a visual budget bar for every run.',
    },
    {
      question: 'is there a free instagram name seo optimizer?',
      answer:
        'Yes — this Instagram name SEO optimizer is completely free with no signup. Paste your keywords, optionally add your current name, and get optimized suggestions capped at 30 characters instantly.',
    },
    {
      question: 'how to optimize instagram name seo?',
      answer:
        'List your keywords in priority order and fit the most important ones into the name field, using separators like | or · to stay readable. Keep the total at 30 characters or fewer — this tool builds and ranks those combinations for you.',
    },
    {
      question: 'how does an instagram name seo optimizer work?',
      answer:
        'It takes your keywords in priority order, tries separators and keyword subsets, and keeps only combinations that fit a 30-character budget. When the full set does not fit, it drops the lowest-priority keywords first and tells you which ones were cut.',
    },
    {
      question: 'How does the instagram name seo optimizer work?',
      answer:
        'Enter your details using the inputs above and the instagram name seo optimizer calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the instagram name seo optimizer free to use?',
      answer:
        'Yes - this instagram name seo optimizer is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an instagram name seo optimizer?',
      answer:
        'An instagram name seo optimizer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Uses a conservative 30-character budget (per the tool\'s rule set) so every suggestion fits even the tightest display — list your keywords most-important-first.',
    'This is a string rule engine, not live data: it cannot read your Instagram profile or know what actually ranks in search.',
    'Keyword coverage measures your own input keywords only — it is not a ranking score and predicts nothing about discoverability.',
  ],
  jsonLd: [],
};
