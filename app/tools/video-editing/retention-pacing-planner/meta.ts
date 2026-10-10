import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'totalDurationSec',
    label: 'Total duration (seconds)',
    type: 'number',
    required: true,
    placeholder: '120',
    validation: { min: 5, max: 3600 },
  },
  {
    id: 'niche',
    label: 'Niche (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. productivity',
  },
  {
    id: 'pattern',
    label: 'Retention pattern',
    type: 'select',
    required: true,
    options: ['hook-loop', 'story-arc', 'listicle'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'segments', label: 'Pacing segments', type: 'table' },
  { id: 'patternChangeCount', label: 'Pattern changes', type: 'number' },
  { id: 'pacingScore', label: 'Pacing score (0-100, heuristic)', type: 'number' },
  { id: 'guidanceNotes', label: 'Guidance notes', type: 'list' },
];

export const content: ToolContent = {
  title: 'Video Pacing Planner',
  description:
    'Use this video pacing planner to hold attention: enter duration, niche, and pattern for timed segments, pattern-change count, heuristic score. Free to use.',
  howTo: [
    'Enter the total video duration in seconds (5-3600).',
    'Optionally add your niche so segment purposes read in your context.',
    'Pick a retention pattern: hook-loop, story-arc, or listicle.',
    'Generate to get timed segments with start/end times, purposes, and beat types.',
    'Check the pattern-change count and the heuristic pacing score, then edit to the plan.',
  ],
  methodology:
    'Heuristic planning only, never a prediction: each pattern is a hand-written template of time fractions (e.g. hook-loop = hook, open loop, payoff, re-hook, payoff, CTA) converted to exact milliseconds that always tile the full duration. The 0-100 pacing score is a fixed rule — base 55, bonuses for a fast hook, enough pattern changes, a closing CTA, and tight segments — and is labeled guidance, not a predicted retention percentage.',
  examples: [
    {
      title: '2-minute productivity video, hook-loop',
      inputs: { totalDurationSec: 120, niche: 'productivity', pattern: 'hook-loop' },
      note: '6 segments tiling 120,000 ms exactly; 5 pattern changes with a heuristic score.',
    },
    {
      title: '10-minute listicle',
      inputs: { totalDurationSec: 600, niche: 'personal finance', pattern: 'listicle' },
      note: 'Listicle items scale with duration (3-8 items) between the hook, recap, and CTA.',
    },
    {
      title: '10-second short',
      inputs: { totalDurationSec: 10, niche: 'fitness', pattern: 'listicle' },
      note: 'Under 15 seconds the compact 3-segment micro-pattern is used, with a note explaining why.',
    },
  ],
  faqs: [
    {
      question: 'What is the best video pacing planner?',
      answer:
        'The best one maps attention patterns onto your exact runtime. This free planner converts a hook-loop, story-arc, or listicle template into timed segments for your duration, counts the pattern changes, and scores the pacing with a transparent heuristic — while labeling the score as guidance, never a retention prediction.',
    },
    {
      question: 'Is there a free video pacing planner?',
      answer:
        'Yes — this planner is completely free with no signup. Enter your duration, niche, and pattern to get timed segments, a pattern-change count, and a heuristic pacing score instantly.',
    },
    {
      question: 'How to plan video pacing?',
      answer:
        'Pick a retention pattern, then assign each beat a time window: hook in the first seconds, change the pattern every 20-40 seconds, and end with a CTA. The planner does the time math for you — segments always tile your exact duration — so you can edit to the plan.',
    },
    {
      question: 'How does a video pacing planner work?',
      answer:
        'It is heuristic math, not AI and not a prediction engine: hand-written pattern templates (fractions of total time) are converted to exact start/end milliseconds, pattern changes are counted, and a fixed rule produces a 0-100 guidance score. Videos under 15 seconds get a compact 3-segment micro-pattern.',
    },
    {
      question: 'How does the video pacing planner work?',
      answer:
        'Enter your details using the inputs above and the video pacing planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the video pacing planner free to use?',
      answer:
        'Yes - this video pacing planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a video pacing planner?',
      answer:
        'A video pacing planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The pacing score is a rule-based heuristic (0-100) — it is guidance, never a predicted retention percentage.',
    'Patterns are fixed hand-written templates inspired by common retention advice, not data from your channel.',
    'Listicle item counts scale with duration (3-8 items); durations under 15 seconds use the micro-pattern.',
    'Segment boundaries are rounded to whole milliseconds and always tile the full duration exactly.',
  ],
  jsonLd: [
  ],
};
