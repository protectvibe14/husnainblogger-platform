import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'hashtags',
    label: 'Your hashtags',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. #travelphotography #sunsetlovers #wanderlust #beachlife',
    validation: { max: 2000 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'score', label: 'Strength score (0–100)', type: 'number' },
  { id: 'grade', label: 'Grade', type: 'text' },
  { id: 'perTagVerdicts', label: 'Per-tag verdicts', type: 'list' },
  { id: 'mixSummary', label: 'Broad / niche mix summary', type: 'text' },
  { id: 'heuristicNote', label: 'Honesty note', type: 'text' },
];

const DESCRIPTION =
  'Free hashtag strength checker 2026: get instant results in your browser. Instant, private, and mobile-friendly. No signup - try it free!';

export const content: ToolContent = {
  title: 'Hashtag Strength Checker',
  description: DESCRIPTION,
  howTo: [
    'Paste your hashtag set into the box — separate tags with spaces, commas, or line breaks.',
    'Run the check to get a 0–100 strength score and a grade from Strong to Weak.',
    'Read the per-tag verdicts: keep STRONG tags, pair OK broad tags with niche ones, rewrite WEAK ones, and delete RISKY pod-bait tags.',
    'Aim for 5–15 tags with a mix of broad (short) and niche (longer) tags.',
    'Re-run after editing until risky patterns and duplicates are gone.',
  ],
  methodology:
    'A fixed, published rubric scores observable best practices out of 100: tag count — 5–15 tags is the sweet spot (25 pts); tag length — share of tags with 3–24 characters (15 pts); banned-risk patterns — engagement-pod bait like #likeforlike or #followforfollow costs 8 pts each (25 pts); broad/niche mix — a length-based heuristic where short tags (≤6 chars) count as broad and longer tags as niche, with full marks for having at least 2 of each (20 pts); no duplicates — case-insensitive (15 pts). Grades: Strong 80+, Good 60+, Needs work 40+, Weak below 40. The risky-pattern list is a curated heuristic compiled from public creator guides — Instagram\'s real restricted list is unpublished. Instagram publishes no hashtag ranking formula, so this is a heuristic measure of best practices, not a prediction of reach.',
  examples: [
    {
      title: 'Strong hashtag set',
      inputs: {
        hashtags: '#travelphotography #sunsetlovers #wanderlust #beachlife #mountainviews #citylights #foodiegram #naturelover',
      },
      note: 'Scores 80+ (Strong): 8 tags in the sweet spot, good lengths, broad/niche mix, no risky patterns or duplicates.',
    },
    {
      title: 'Risky pod-bait set',
      inputs: { hashtags: '#travel #likeforlike #followforfollow #sunset #l4l' },
      note: 'Scores low: 3 risky engagement-bait tags are flagged and penalized.',
    },
  ],
  faqs: [
    {
      question: 'How do I check if my hashtags are good?',
      answer:
        'Paste your hashtag set into the checker above. It scores tag count (5–15 is ideal), tag length, risky pod-bait patterns, your broad/niche mix, and duplicates — then gives per-tag verdicts so you know exactly what to fix.',
    },
    {
      question: 'How many hashtags should I use on Instagram?',
      answer:
        'Instagram allows up to 30, but creator best-practice guides cluster around 5–15 focused tags. This checker gives full count marks for 5–15 tags and partial credit just outside that range.',
    },
    {
      question: 'Which hashtags are banned on Instagram?',
      answer:
        'Instagram does not publish its restricted list. This tool flags widely reported engagement-bait patterns (#likeforlike, #followforfollow, #l4l and similar) as risky — a heuristic pre-screen, not a live Instagram check. The only reliable test is searching the tag inside the Instagram app.',
    },
    {
      question: 'How does the hashtag strength checker work?',
      answer:
        'Enter your details using the inputs above and the hashtag strength checker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the hashtag strength checker free to use?',
      answer:
        'Yes - this hashtag strength checker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a hashtag strength checker?',
      answer:
        'A hashtag strength checker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the hashtag strength checker?',
      answer:
        'No account needed. Open the hashtag strength checker, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'The score is a heuristic — Instagram publishes no hashtag ranking formula, so it measures observable best practices, not reach or engagement.',
    'The risky-pattern list is curated from public creator guides; a tag NOT flagged is NOT proven safe.',
    'Broad vs niche is a length-based heuristic (short tags tend to be more competitive) — it does not measure actual search volume or competition.',
    'Hashtag extraction is unicode-aware: # followed by letters (any script), numbers, and underscores.',
    'The tool never contacts Instagram; it cannot see your post\'s actual performance.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Hashtag Strength Checker 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/instagram/hashtag-strength-checker/',
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
          name: 'Instagram Tools',
          item: 'https://husnainblogger.com/tools/instagram/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Hashtag Strength Checker',
          item: 'https://husnainblogger.com/tools/instagram/hashtag-strength-checker/',
        },
      ],
    },
  ],
};
