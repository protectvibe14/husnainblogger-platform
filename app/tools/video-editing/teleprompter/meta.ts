import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'scriptText',
    label: 'Your script text',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. Welcome back to the channel. Today we are fixing...',
  },
  {
    id: 'wordsPerMinute',
    label: 'Reading speed (words per minute)',
    type: 'number',
    required: false,
    placeholder: '140',
  },
  {
    id: 'fontSize',
    label: 'Teleprompter font size (px)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 32',
  },
  {
    id: 'mirrorMode',
    label: 'Mirror mode (for beamsplitter rigs)',
    type: 'boolean',
    required: false,
  },
];

export const outputs: ToolOutput[] = [
  { id: 'scrollDurationSec', label: 'Scroll duration (seconds)', type: 'number' },
  { id: 'estimatedReadTimeSec', label: 'Estimated read time (seconds)', type: 'number' },
  { id: 'wordCount', label: 'Word count', type: 'number' },
  { id: 'scrollPlan', label: 'Scroll plan (px/sec + notes)', type: 'text' },
];

export const content: ToolContent = {
  title: 'Online Teleprompter',
  description:
    'Use this free online teleprompter to time your script: set words-per-minute and font size, get read time plus a px/sec scroll plan. Start free.',
  howTo: [
    'Paste your full script into the script text box (up to 20,000 characters).',
    'Set your reading speed in words per minute (default 140; clamped to 40-300).',
    'Enter your teleprompter font size in px (12-120).',
    'Turn on mirror mode if you read through a beamsplitter rig.',
    'Run it to get word count, estimated read time, total scroll duration, and a px/sec scroll plan with calibration notes.',
  ],
  methodology:
    'Pure timing math, never AI: estimated read time = word count / words-per-minute x 60 (CJK scripts switch to characters-per-minute mode at wpm x 5, since they have no word spaces); scroll duration adds a 3-second lead-in buffer; the px/sec scroll rate assumes an 800px viewport, 0.55x average glyph width, and 1.5x line height — all documented estimates. Speeds outside 40-300 wpm are clamped with a warning. The scrolling viewport itself is UI; this tool only supplies the timing plan, so do a live read-through to calibrate before recording.',
  examples: [
    {
      title: '140-word intro at default pace',
      inputs: { scriptText: 'Welcome back to the channel...', wordsPerMinute: 140, fontSize: 32, mirrorMode: false },
      note: 'A 140-word script reads in about 60 seconds with a 63-second scroll plan.',
    },
    {
      title: 'Fast reader, large font',
      inputs: { scriptText: 'Welcome back to the channel...', wordsPerMinute: 180, fontSize: 48, mirrorMode: false },
      note: 'Higher wpm shortens the duration; a larger font raises the px/sec scroll rate.',
    },
  ],
  faqs: [
    {
      question: 'What is the best online teleprompter?',
      answer:
        'The best one matches your real pace. This free online teleprompter computes read time from your word count and words-per-minute, then gives you a concrete px/sec scroll plan for your font size — but you should still do one live read-through to calibrate, since no calculator can measure your actual delivery speed.',
    },
    {
      question: 'Is there a free online teleprompter?',
      answer:
        'Yes — this teleprompter timing tool is completely free with no signup. Paste up to 20,000 characters, set your pace and font size, and get word count, read time, scroll duration, and a px/sec scroll plan instantly.',
    },
    {
      question: 'How to use online teleprompter?',
      answer:
        'Paste your script, set words per minute (140 is the default; the tool clamps to 40-300), enter the font size you read at (12-120 px), and enable mirror mode if you use a beamsplitter. The scroll plan tells you the px/sec rate and total duration, plus notes like CJK mode or long-script warnings.',
    },
    {
      question: 'How does an online teleprompter work?',
      answer:
        'The timing layer is simple math: read time = words / wpm x 60, scroll duration adds a 3s lead-in, and the px/sec rate is derived from your font size with documented viewport assumptions. CJK scripts use characters-per-minute instead of words-per-minute. The actual scrolling display is separate UI — this tool supplies the timing plan behind it.',
    },
    {
      question: 'How does the online teleprompter work?',
      answer:
        'Enter your details using the inputs above and the online teleprompter calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the online teleprompter free to use?',
      answer:
        'Yes - this online teleprompter is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an online teleprompter?',
      answer:
        'An online teleprompter is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'All timings are estimates from fixed formulas — a live read-through is required to calibrate your real pace.',
    'CJK reading speed (wpm x 5 chars/min) is a rough heuristic, not a measured rate.',
    'The px/sec scroll rate assumes an 800px viewport, 0.55x average glyph width, and 1.5x line height.',
    'Reading speeds outside 40-300 wpm are clamped to that range with a warning.',
    'Scripts over 10 minutes get a suggestion to split into sections; scripts over 20,000 characters are rejected.',
  ],
  jsonLd: [
  ],
};
