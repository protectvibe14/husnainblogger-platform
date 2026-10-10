import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/thumbnail-clickability-scorecard/';

const DESCRIPTION =
  'Score your thumbnail with this free youtube thumbnail checklist: answer 8 rubric items for a 0–100 clickability score with fixes. Try it free now!';

export const inputs: ToolInput[] = [
  {
    id: 'text-readable',
    label: 'Thumbnail text is short and readable (4 words or fewer, large bold font)',
    type: 'select',
    required: true,
    options: ['yes', 'partially', 'no'],
  },
  {
    id: 'high-contrast',
    label: 'High contrast colors (subject pops against the background)',
    type: 'select',
    required: true,
    options: ['yes', 'partially', 'no'],
  },
  {
    id: 'face-or-emotion',
    label: 'Face or strong focal subject (close-up face with a clear emotion)',
    type: 'select',
    required: true,
    options: ['yes', 'partially', 'no'],
  },
  {
    id: 'curiosity-gap',
    label: 'Curiosity gap (teases a question the video answers)',
    type: 'select',
    required: true,
    options: ['yes', 'partially', 'no'],
  },
  {
    id: 'no-clutter',
    label: 'No clutter (one idea, no competing elements)',
    type: 'select',
    required: true,
    options: ['yes', 'partially', 'no'],
  },
  {
    id: 'matches-title',
    label: 'Matches the video title (thumbnail and title promise the same thing)',
    type: 'select',
    required: true,
    options: ['yes', 'partially', 'no'],
  },
  {
    id: 'mobile-legible',
    label: 'Legible on a phone (readable at small size in one second)',
    type: 'select',
    required: true,
    options: ['yes', 'partially', 'no'],
  },
  {
    id: 'brand-consistent',
    label: 'Consistent branding (your palette, fonts, and layout)',
    type: 'select',
    required: true,
    options: ['yes', 'partially', 'no'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'score', label: 'Clickability score (0–100)', type: 'number' },
  { id: 'band', label: 'Score band', type: 'text' },
  { id: 'itemResults', label: 'Per-item pass / partial / fail', type: 'list' },
  { id: 'suggestions', label: 'Improvement suggestions', type: 'list' },
  { id: 'honestyNote', label: 'What this score is (and is not)', type: 'text' },
];

export const content: ToolContent = {
  title: 'Youtube Thumbnail Checklist',
  description: DESCRIPTION,
  howTo: [
    'Open your thumbnail design and answer each of the 8 checklist items honestly: "yes", "partially", or "no".',
    'Leave any item blank only if you truly cannot judge it — blank answers default to neutral ("partially", half credit).',
    'Run the scorecard to get your 0–100 score, the per-item PASS / PARTIAL / FAIL breakdown, and one fix per weak item.',
    'Apply the fixes to your thumbnail, then re-score it to confirm the improvements landed.',
    'Remember the label on your result: this is a self-assessed heuristic, not a prediction of your actual click-through rate.',
  ],
  methodology:
    'A fixed, published 8-item rubric with weights summing to 100 (text readability 15, contrast 15, face or focal subject 15, title match 15, curiosity gap 10, no clutter 10, mobile legibility 10, brand consistency 10). Answers score full weight for "yes", half for "partially", zero for "no"; the total is rounded to an integer and banded as Strong (80+), Good (60–79), Needs work (40–59), or Weak (0–39). No AI is involved — the score is arithmetic over your own answers, and it cannot predict actual CTR.',
  examples: [
    {
      title: 'Near-perfect thumbnail',
      inputs: {
        'text-readable': 'yes',
        'high-contrast': 'yes',
        'face-or-emotion': 'yes',
        'curiosity-gap': 'yes',
        'no-clutter': 'partially',
        'matches-title': 'yes',
        'mobile-legible': 'yes',
        'brand-consistent': 'partially',
      },
      note: 'Scores 90 (Strong, self-assessed) with two suggestions: declutter and tighten branding.',
    },
    {
      title: 'Cluttered thumbnail needing work',
      inputs: {
        'text-readable': 'no',
        'high-contrast': 'partially',
        'face-or-emotion': 'no',
        'curiosity-gap': 'yes',
        'no-clutter': 'no',
        'matches-title': 'partially',
        'mobile-legible': 'no',
        'brand-consistent': 'no',
      },
      note: 'Scores 25 (Weak, self-assessed) with 7 targeted fixes, starting with cutting thumbnail text to 4 words.',
    },
  ],
  faqs: [
    {
      question: 'what is the best youtube thumbnail checklist?',
      answer:
        'The best checklist covers the traits shared by high-performing thumbnails: short readable text, high contrast, a face or strong focal subject, a curiosity gap, no clutter, a title match, mobile legibility, and consistent branding. This free scorecard turns exactly those 8 items into a weighted 0–100 self-assessment.',
    },
    {
      question: 'is there a free youtube thumbnail checklist?',
      answer:
        'Yes — this thumbnail scorecard is completely free with no signup. Answer the 8 rubric items and get a 0–100 score, per-item results, and improvement suggestions. It is a self-assessed heuristic, not a CTR prediction.',
    },
    {
      question: 'how to use youtube thumbnail?',
      answer:
        'Honestly self-grade your thumbnail against the 8 checklist items: keep text to 4 words or fewer, use high contrast, show a clear emotion, tease a question your video answers, remove clutter, match your title, check phone legibility, and keep your branding consistent. Then run this scorecard to quantify the result.',
    },
    {
      question: 'how does a youtube thumbnail checklist work?',
      answer:
        'You answer each of the 8 rubric items with "yes", "partially", or "no"; each answer earns full, half, or zero of its weight, and the total becomes your 0–100 score. No AI is involved — it is fixed arithmetic over your own answers, and it cannot predict how viewers will actually respond.',
    },
    {
      question: 'What is a youtube thumbnail checklist?',
      answer:
        'A youtube thumbnail checklist is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Self-assessed: the score reflects YOUR answers, so be honest — generous answers inflate the score without improving the thumbnail.',
    'Heuristic only: the rubric weights are fixed editorial judgment, not a model trained on CTR data; it cannot predict actual click-through rate.',
    'Blank answers default to neutral ("partially", half credit) rather than blocking the score.',
    'What works varies by niche and audience — use the score as a design checklist, not a guarantee.',
  ],
  jsonLd: [],
};
