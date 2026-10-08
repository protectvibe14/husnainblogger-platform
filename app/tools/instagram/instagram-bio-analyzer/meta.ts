import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'bio',
    label: 'Instagram bio',
    type: 'textarea',
    required: true,
    placeholder: 'Paste your Instagram bio, line breaks included',
    validation: { max: 500 },
  },
  {
    id: 'keyword',
    label: 'Niche keyword (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. fitness coach',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'score', label: 'Bio score (0–100)', type: 'number' },
  { id: 'grade', label: 'Grade', type: 'text' },
  { id: 'factorBreakdown', label: 'Score breakdown', type: 'list' },
  { id: 'tips', label: 'How to improve', type: 'list' },
  { id: 'bioStats', label: 'Bio stats', type: 'text' },
  { id: 'heuristicNote', label: 'Honesty note', type: 'text' },
];

const DESCRIPTION =
  'Free instagram bio analyzer 2026: A fixed, published rubric scores observable best practices out of 100: length discipline — within Instagram\\. Fast, private,!';

export const content: ToolContent = {
  title: 'Instagram Bio Analyzer 2026 – Free Tool | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Paste your Instagram bio exactly as it appears — keep the line breaks.',
    'Optionally add your niche keyword to check topic clarity.',
    'Run the analysis to get a 0–100 score and a grade from Excellent to Weak.',
    'Read the factor breakdown to see exactly where points were earned or lost.',
    'Apply the tips — then re-run to watch the score improve.',
  ],
  methodology:
    'A fixed, published rubric scores observable best practices out of 100: length discipline — within Instagram\'s 150-character limit (20 pts); call to action — a clear CTA pattern present (20 pts); emoji usage — 1–5 emojis as visual structure (15 pts); line breaks — 3+ short lines, one idea per line (15 pts); keyword clarity — your niche keyword present (20 pts); link signal — points visitors to your link (10 pts). Grades: Excellent 80+, Good 60+, Needs work 40+, Weak below 40. Matching is case-insensitive. Instagram publishes no official bio weighting, so this is a heuristic measure of best practices, not a prediction of follower growth.',
  examples: [
    {
      title: 'Strong bio',
      inputs: {
        bio: 'Helping creators grow 🌱\n10k students taught 📚\nDM me ‘START’ 👇',
        keyword: 'creators',
      },
      note: 'Scores 70+ (Good/Excellent): clear topic, CTA, emojis, 3-line structure, link signal.',
    },
    {
      title: 'Weak bio',
      inputs: { bio: 'just a person', keyword: '' },
      note: 'Scores below 40 (Weak): single line, no CTA, no keyword, no structure.',
    },
  ],
  faqs: [
    {
      question: 'What makes a good Instagram bio?',
      answer:
        'A good bio states who you help and how (with your niche keyword), shows proof, and ends with one clear call to action — spread over 3+ short lines with a few emojis as visual structure. This free analyzer grades yours against exactly that checklist.',
    },
    {
      question: 'Is this Instagram bio analyzer free?',
      answer:
        'Yes — completely free with no signup. It scores your bio against a fixed heuristic rubric and shows exactly how to improve it.',
    },
    {
      question: 'How long can an Instagram bio be?',
      answer:
        '150 characters. Anything longer gets cut off — the analyzer gives zero length points over 150 and tells you exactly how much to trim.',
    },
    {
      question: 'Does a high score guarantee more followers?',
      answer:
        'No. The score measures observable best practices, not follower growth — Instagram publishes no bio weighting. Use it to remove obvious weaknesses, then test with real profile visits.',
    },
    {
      question: 'How does the instagram bio analyzer work?',
      answer:
        'Enter your details using the inputs above and the instagram bio analyzer calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the instagram bio analyzer free to use?',
      answer:
        'Yes - this instagram bio analyzer is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an instagram bio analyzer?',
      answer:
        'An instagram bio analyzer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The score is a heuristic — Instagram publishes no official bio weighting, so it measures observable best practices, not follower growth.',
    'CTA and link patterns are English — results are less meaningful for non-English bios.',
    'Emoji detection uses Unicode pictographic ranges; some composite emojis count as one.',
    'The tool never contacts Instagram; it cannot see your profile\'s actual performance.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Instagram Bio Analyzer 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/instagram/instagram-bio-analyzer/',
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
          name: 'Instagram Bio Analyzer',
          item: 'https://husnainblogger.com/tools/instagram/instagram-bio-analyzer/',
        },
      ],
    },
  ],
};
