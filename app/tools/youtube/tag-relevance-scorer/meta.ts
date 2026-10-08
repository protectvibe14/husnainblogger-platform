import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'title',
    label: 'Video title',
    type: 'text',
    required: true,
    placeholder: 'e.g. How to Bake Sourdough Bread at Home',
  },
  {
    id: 'tags',
    label: 'Tag list (comma or line separated)',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. sourdough bread recipe, bake sourdough at home, sourdough',
    validation: { max: 2000 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'score', label: 'Relevance score (0–100)', type: 'number' },
  { id: 'grade', label: 'Grade', type: 'text' },
  { id: 'perTagVerdicts', label: 'Per-tag verdicts', type: 'list' },
  { id: 'budgetUsage', label: 'Budget usage vs 500-char limit', type: 'text' },
  { id: 'missingKeywords', label: 'Title keywords missing from tags', type: 'list' },
  { id: 'heuristicNote', label: 'Honesty note', type: 'text' },
];

const DESCRIPTION =
  'Grade your tags with this free YouTube tag checker — a transparent 0–100 rubric scores keyword coverage, specificity, and budget. No signup, try it now.';

export const content: ToolContent = {
  title: 'YouTube Tag Checker 2026 – Free Tool | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Paste your exact video title into the title field.',
    'Paste your tag list into the tags box — separate tags with commas or line breaks (max 500 characters total).',
    'Run the check to get a 0–100 relevance score and a grade from Strong to Weak.',
    'Read the per-tag verdicts: keep STRONG tags, improve OK ones, rewrite WEAK ones, and delete WASTED duplicates.',
    'Check the budget line — if you are near the 500-character limit, drop wasted tags before adding new ones.',
  ],
  methodology:
    'A fixed, published rubric scores observable best practices out of 100: keyword coverage — share of title keywords appearing in any tag (40 pts); exact-title tag present (15 pts); multi-word specificity — at least 2 tags of 2–4 words (15 pts); long-tail presence — at least one 4+ word tag (10 pts); budget discipline — total tag-field characters within 400/500 (10 pts); no waste — no duplicates or single-character tags (10 pts). Grades: Strong 80+, Good 60+, Needs work 40+, Weak below 40. Matching is case-insensitive substring matching after lowercasing and trimming — no stemming, no semantic similarity. YouTube publishes no official tag weighting, so this is a heuristic measure of best practices, not a prediction of ranking.',
  examples: [
    {
      title: 'Strong tag set',
      inputs: {
        title: 'How to Bake Sourdough Bread at Home',
        tags: 'how to bake sourdough bread at home, sourdough bread recipe, bake sourdough at home for beginners, sourdough, bread baking',
      },
      note: 'Scores 80+ (Strong): full keyword coverage, exact-title tag, multi-word and long-tail tags present.',
    },
    {
      title: 'Weak generic tags',
      inputs: { title: 'Sourdough Bread Masterclass', tags: 'video, youtube, food, vlog' },
      note: 'Scores below 40 (Weak): no title keywords covered; every tag gets a weak verdict.',
    },
  ],
  faqs: [
    {
      question: 'What is the best YouTube tag checker?',
      answer:
        'The best YouTube tag checker grades your tags against transparent best practices: title-keyword coverage, specific multi-word phrases, and staying within the 500-character limit. This free tool does exactly that with a published 0–100 rubric — no signup, everything runs in your browser.',
    },
    {
      question: 'Is there a free YouTube tag checker?',
      answer:
        'Yes — this tag checker is completely free with no signup. It scores your tags against a fixed heuristic rubric and shows per-tag verdicts so you know exactly what to fix.',
    },
    {
      question: 'How to check YouTube tag?',
      answer:
        'Paste your video title and your tag list (comma or line separated) into the fields above, then run the check. You get a 0–100 score, a grade, per-tag verdicts (strong, ok, weak, wasted), and your character usage against YouTube\'s 500-character limit.',
    },
    {
      question: 'How does the youtube tag checker work?',
      answer:
        'Enter your details using the inputs above and the youtube tag checker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube tag checker free to use?',
      answer:
        'Yes - this youtube tag checker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube tag checker?',
      answer:
        'A youtube tag checker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the youtube tag checker?',
      answer:
        'No account needed. Open the youtube tag checker, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'The score is a heuristic — YouTube publishes no official tag weighting, so it measures observable best practices, not ranking impact.',
    'Matching is case-insensitive substring matching; there is no stemming or semantic understanding (e.g. "bake" will not match "baking" as the same concept is only matched by shared substrings).',
    'Keyword extraction uses an English stopword list — results are less meaningful for non-English titles.',
    'Tags identical to title words are marked redundant (strong verdict) but are not penalized heavily — YouTube allows the 500-char field to include them.',
    'The tool never contacts YouTube; it cannot see your video\'s actual performance.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'YouTube Tag Checker 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/youtube/tag-relevance-scorer/',
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
          name: 'YouTube Tools',
          item: 'https://husnainblogger.com/tools/youtube/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Tag Relevance Scorer',
          item: 'https://husnainblogger.com/tools/youtube/tag-relevance-scorer/',
        },
      ],
    },
  ],
};
