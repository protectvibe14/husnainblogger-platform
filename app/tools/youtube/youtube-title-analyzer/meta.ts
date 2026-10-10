import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'title',
    label: 'Video title',
    type: 'text',
    required: true,
    placeholder: 'e.g. 7 Proven YouTube Title Hacks That Tripled My Views',
  },
  {
    id: 'keyword',
    label: 'Target keyword (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. youtube title hacks',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'score', label: 'Title score (0–100)', type: 'number' },
  { id: 'grade', label: 'Grade', type: 'text' },
  { id: 'factorBreakdown', label: 'Score breakdown', type: 'list' },
  { id: 'tips', label: 'How to improve', type: 'list' },
  { id: 'charCount', label: 'Length', type: 'text' },
  { id: 'heuristicNote', label: 'Honesty note', type: 'text' },
];

const DESCRIPTION =
  'Score every title before publishing with this YouTube title analyzer — length, keyword use, emotion, and CTR factors in one report. Fix weak spots.';

export const content: ToolContent = {
  title: 'YouTube Title Analyzer',
  description: DESCRIPTION,
  howTo: [
    'Paste your exact video title into the title field.',
    'Optionally add your target keyword to check its placement.',
    'Run the analysis to get a 0–100 score and a grade from Excellent to Weak.',
    'Read the factor breakdown to see exactly where points were earned or lost.',
    'Apply the tips — then re-run to watch the score improve.',
  ],
  methodology:
    'A fixed, published rubric scores observable best practices out of 100: length sweet spot — 40–60 characters keeps the full title visible (25 pts); power words — emotional/action words from a built-in list (20 pts); number hook — contains a digit (15 pts); curiosity hook — how/why/what/secret patterns (15 pts); keyword placement — target keyword at the start (15 pts); clean formatting — no ALL-CAPS words or repeated !!! (10 pts). Grades: Excellent 80+, Good 60+, Needs work 40+, Weak below 40. Matching is case-insensitive substring matching — no stemming, no semantic similarity. YouTube publishes no official title weighting, so this is a heuristic measure of best practices, not a prediction of CTR or ranking.',
  examples: [
    {
      title: 'Strong title',
      inputs: {
        title: '7 Proven YouTube Title Hacks That Tripled My Views',
        keyword: 'youtube title',
      },
      note: 'Scores 80+ (Excellent): ideal length, power words, number and curiosity hooks, keyword at the start.',
    },
    {
      title: 'Weak title',
      inputs: { title: 'My vlog', keyword: '' },
      note: 'Scores below 40 (Weak): too short, no hooks, no power words.',
    },
  ],
  faqs: [
    {
      question: 'What is a good YouTube title score?',
      answer:
        '80 or above (Excellent) means the title follows observable best practices: 40–60 characters, power words, a number or curiosity hook, the keyword near the front, and clean formatting. 60–79 (Good) is publishable with minor tweaks.',
    },
    {
      question: 'Is this YouTube title analyzer free?',
      answer:
        'Yes — completely free with no signup. It scores your title against a fixed heuristic rubric and shows exactly how to improve it.',
    },
    {
      question: 'Does a high score guarantee more clicks?',
      answer:
        'No. The score measures observable best practices, not CTR — YouTube publishes no title weighting. Use it to remove obvious weaknesses, then test titles against each other with real analytics.',
    },
    {
      question: 'What is the ideal YouTube title length?',
      answer:
        '40–60 characters. Titles longer than 60 get cut off in search results and suggested videos, hiding your key words.',
    },
    {
      question: 'How does the youtube title analyzer work?',
      answer:
        'Enter your details using the inputs above and the youtube title analyzer calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube title analyzer free to use?',
      answer:
        'Yes - this youtube title analyzer is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube title analyzer?',
      answer:
        'A youtube title analyzer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The score is a heuristic — YouTube publishes no official title weighting, so it measures observable best practices, not ranking or CTR impact.',
    'Matching is case-insensitive substring matching; there is no stemming or semantic understanding.',
    'Power-word and stopword lists are English — results are less meaningful for non-English titles.',
    'The tool never contacts YouTube; it cannot see your video\'s actual performance.',
  ],
  jsonLd: [
  ],
};
