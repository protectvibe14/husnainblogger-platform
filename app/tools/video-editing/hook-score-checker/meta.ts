import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'hookText',
    label: 'Your hook (first line of the video)',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. How I gained 10,000 subscribers in 30 days',
  },
  {
    id: 'niche',
    label: 'Niche (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. youtube',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'score', label: 'Hook score (0-100, checklist)', type: 'number' },
  { id: 'band', label: 'Score band', type: 'text' },
  { id: 'breakdown', label: 'Criterion breakdown', type: 'table' },
  { id: 'improvements', label: 'Suggested improvements', type: 'list' },
];

export const content: ToolContent = {
  title: 'Video Hook Checker',
  description:
    'Score your video hook before you film it: paste your opening line for a 0-100 checklist score, a full criterion breakdown, and practical fix suggestions.',
  howTo: [
    'Paste your hook — the first line viewers hear (3-280 characters).',
    'Optionally add your niche so suggestions read in your context.',
    'Run the check to get a 0-100 checklist score with a criterion-by-criterion breakdown.',
    'Work through the suggested improvements, weakest criterion first.',
    'Re-check the revised hook and compare scores.',
  ],
  methodology:
    'Rule-based rubric scoring, never a virality prediction (no AI, no watch-time data): Length 25 pts (7-10 words ideal, ~3s of speech at ~150 wpm); Specificity 20 pts (digit/$/% = 20, unit word = 12); Question opener 15 pts; Curiosity gap 15 pts (16-word bank); Vague-opener penalty -20 (8 transparent phrases like "hey guys"); ALL-CAPS penalty -5. Max 75. Bands: 60+ strong, 40-59 good, 20-39 needs work, under 20 weak. Non-English hooks skip the pattern banks with a note and score on length and formatting only.',
  examples: [
    {
      title: 'Strong hook',
      inputs: { hookText: 'How I gained 10,000 subscribers in 30 days', niche: 'youtube' },
      note: 'Scores 60+ (strong): ideal length, concrete numbers, no filler opener.',
    },
    {
      title: 'Weak hook',
      inputs: { hookText: 'hey guys welcome back to my channel', niche: '' },
      note: 'Scores low: the vague-opener penalty (-20) plus missing specificity and curiosity signals.',
    },
  ],
  faqs: [
    {
      question: 'What is the best video hook checker?',
      answer:
        'The best one shows its work. This free checker scores your opening line against a published transparent rubric — length, specificity, question opener, curiosity gap, plus penalties for vague openers and ALL CAPS — and returns a 0-100 checklist score with a per-criterion breakdown and fix suggestions.',
    },
    {
      question: 'Is there a free video hook checker?',
      answer:
        'Yes — this checker is completely free with no signup. Paste your hook (3-280 characters) to get the 0-100 checklist score, breakdown, and improvements instantly.',
    },
    {
      question: 'How to check video hook?',
      answer:
        'Paste the exact first line viewers hear. The checker counts words (7-10 is ideal for ~3 seconds of speech), looks for numbers and curiosity-gap words, checks for a question opener, and penalizes filler openers like "hey guys" — then lists what to fix, weakest first.',
    },
    {
      question: 'How does a video hook checker work?',
      answer:
        'It applies fixed rules, not AI: six weighted criteria score your text 0-75 and map to bands (60+ strong, 40-59 good, 20-39 needs work, under 20 weak). The score is a checklist result — it cannot predict views or virality. Non-English hooks are scored on length and formatting only, with a clear note.',
    },
    {
      question: 'How does the video hook checker work?',
      answer:
        'Enter your details using the inputs above and the video hook checker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the video hook checker free to use?',
      answer:
        'Yes - this video hook checker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a video hook checker?',
      answer:
        'A video hook checker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The score is a rule-based checklist (max 75), not a virality or view-count prediction.',
    'The ~150 words-per-minute speech rate behind the length criterion is a heuristic estimate.',
    'Curiosity-gap and unit word banks are fixed English lists (16-17 entries each, published in the rubric).',
    'Non-English hooks skip the pattern banks with a note — only length and formatting are scored (max 30).',
    'Same hook text always produces the same score — the rubric is fully deterministic.',
  ],
  jsonLd: [
  ],
};
