import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'hook',
    label: 'Opening hook (first line viewers hear)',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. Why do 90% of creators quit in 30 days?',
    validation: { max: 500 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'score', label: 'Hook score (0–100)', type: 'number' },
  { id: 'grade', label: 'Grade', type: 'text' },
  { id: 'patternsFound', label: 'Hook patterns detected', type: 'text' },
  { id: 'factorBreakdown', label: 'Score breakdown', type: 'list' },
  { id: 'tips', label: 'How to improve', type: 'list' },
  { id: 'heuristicNote', label: 'Honesty note', type: 'text' },
];

const DESCRIPTION =
  'Grade your opening hook with this free TikTok hook analyzer — a transparent 0–100 rubric scores brevity, hook patterns, and opener strength. No signup, try it now.';

export const content: ToolContent = {
  title: 'TikTok Hook Analyzer',
  description: DESCRIPTION,
  howTo: [
    'Paste the exact first line viewers hear in your video.',
    'Run the analysis to get a 0–100 score and a grade from Excellent to Weak.',
    'Check which hook patterns were detected: question, pattern-interrupt, or curiosity gap.',
    'Apply the tips — then re-run to watch the score improve.',
  ],
  methodology:
    'A fixed, published rubric scores observable best practices out of 100: hook length — 12 words or fewer fits the first ~3 seconds (25 pts); question hook — opens with a question (15 pts); pattern interrupt — contradiction words like stop/don\'t/never (15 pts); curiosity gap — phrases like secret/you won\'t believe (15 pts); no weak opener — doesn\'t start with filler like "hey guys" (20 pts); specificity — contains numbers or concrete claims (10 pts). Grades: Excellent 80+, Good 60+, Needs work 40+, Weak below 40. Matching is case-insensitive. TikTok publishes no official hook weighting, so this is a heuristic measure of best practices, not a prediction of views or retention.',
  examples: [
    {
      title: 'Strong hook',
      inputs: { hook: 'Why do 90% of creators quit in 30 days?' },
      note: 'Scores 80+ (Excellent): 9 words, question pattern, specific number.',
    },
    {
      title: 'Weak hook',
      inputs: { hook: 'Hey guys so basically today I wanted to talk about my morning routine' },
      note: 'Scores below 60: weak filler opener, too long, no hook pattern.',
    },
  ],
  faqs: [
    {
      question: 'What is a good TikTok hook?',
      answer:
        'A good hook lands in the first 3 seconds: 12 words or fewer, opening with a question, a contradiction, or a curiosity gap — and no filler like "hey guys". This free analyzer grades yours against exactly that checklist.',
    },
    {
      question: 'Is this TikTok hook analyzer free?',
      answer:
        'Yes — completely free with no signup. It scores your hook against a fixed heuristic rubric and shows exactly how to improve it.',
    },
    {
      question: 'How long should a TikTok hook be?',
      answer:
        '12 words or fewer. Viewers decide in about 3 seconds whether to keep watching — that is roughly 12 spoken words.',
    },
    {
      question: 'Does a high score guarantee more views?',
      answer:
        'No. The score measures observable best practices, not views — TikTok publishes no hook weighting. Use it to remove obvious weaknesses, then test hooks with real 3-second retention data.',
    },
    {
      question: 'How does the tiktok hook analyzer work?',
      answer:
        'Enter your details using the inputs above and the tiktok hook analyzer calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok hook analyzer free to use?',
      answer:
        'Yes - this tiktok hook analyzer is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok hook analyzer?',
      answer:
        'A tiktok hook analyzer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The score is a heuristic — TikTok publishes no official hook weighting, so it measures observable best practices, not views or retention.',
    'Hook patterns use English word lists — results are less meaningful for non-English hooks.',
    'The tool never contacts TikTok; it cannot see your video\'s actual performance.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'TikTok Hook Analyzer 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/tiktok/tiktok-hook-analyzer/',
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
          name: 'TikTok Tools',
          item: 'https://husnainblogger.com/tools/tiktok/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'TikTok Hook Analyzer',
          item: 'https://husnainblogger.com/tools/tiktok/tiktok-hook-analyzer/',
        },
      ],
    },
  ],
};
