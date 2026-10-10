import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'levelValues',
    label: 'Level values in dB (comma-separated)',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. -58, -55, -12, -8, -60, ... — one dB value per 10 ms window',
  },
  {
    id: 'thresholdDb',
    label: 'Silence threshold dB (optional)',
    type: 'number',
    required: false,
    placeholder: '-40',
    validation: { min: -80, max: -10, unit: 'dB' },
  },
  {
    id: 'minGapMs',
    label: 'Minimum gap ms (optional)',
    type: 'number',
    required: false,
    placeholder: '400',
    validation: { min: 100, max: 5000, unit: 'ms' },
  },
  {
    id: 'windowMs',
    label: 'Milliseconds per value (optional)',
    type: 'number',
    required: false,
    placeholder: '10',
    validation: { min: 0.1, max: 1000, unit: 'ms' },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'gaps', label: 'Silence gaps', type: 'table' },
  { id: 'suggestedCutPointsMs', label: 'Suggested cut points (ms)', type: 'list' },
  { id: 'totalSilenceSec', label: 'Total silence (seconds)', type: 'number' },
];

export const content: ToolContent = {
  title: 'Find Silence in Audio',
  description:
    'Find dead air in voiceovers fast: paste dB level values to map every silence gap with precise start times and durations, ready for tighter edits.',
  howTo: [
    'Paste your level values as comma-separated dB numbers — one value per analysis window (10 ms each by default), at least 8 values.',
    'Optionally set the silence threshold in dB (default -40; range -80 to -10) — anything below it counts as silent.',
    'Optionally set the minimum gap length in ms (default 400) so tiny pauses are ignored.',
    'Run the finder to get every silence gap with start/end times, cut points at gap midpoints, and total silence in seconds.',
    'If no gaps are listed, raise the threshold (e.g. -40 to -35 dB) and re-run.',
  ],
  methodology:
    'Pure logic on the dB series you paste — no AI, no audio file decoding. Any window below the threshold (default -40 dB) counts as silent; consecutive silent windows form a gap, kept only if it lasts at least minGapMs (default 400 ms). Suggested cut points are gap midpoints rounded to whole ms; total silence is the sum of kept gaps in seconds. A value exactly at the threshold is not silent (strictly below). If nothing is found, the result is honestly empty — raise the threshold and re-run.',
  examples: [
    {
      title: 'Voiceover with a long pause',
      inputs: {
        levelValues: '-8, -8, -60, -60, -60, -60, -60, -60, -8, -8',
        thresholdDb: -40,
        minGapMs: 400,
        windowMs: 100,
      },
      note: 'The 600 ms silent run becomes one gap (200-800 ms) with a suggested cut point at 500 ms.',
    },
    {
      title: 'Noisy room tone',
      inputs: {
        levelValues: '-32, -30, -33, -31, -29, -34, -30, -32',
        thresholdDb: -40,
        minGapMs: 100,
        windowMs: 10,
      },
      note: 'No gaps found at -40 dB — raise the threshold toward -30 dB to catch quiet room tone.',
    },
  ],
  faqs: [
    {
      question: 'What is the best find silence in audio?',
      answer:
        'The best one is transparent about its method. This free finder works on your dB level series: any window below your threshold counts as silent, gaps must last your minimum length, and you get start/end times, midpoint cut points, and total silence — no signup.',
    },
    {
      question: 'Is there a free find silence in audio?',
      answer:
        'Yes — this finder is free with no signup. Paste at least 8 comma-separated dB values and get every silence gap with times and cut points instantly.',
    },
    {
      question: 'How to use find silence in audio?',
      answer:
        'Paste one dB value per short window of your recording (e.g. every 10 ms), set the silence threshold (default -40 dB) and the minimum gap length (default 400 ms), then run it. Each returned gap shows start and end times with a suggested cut point at its midpoint.',
    },
    {
      question: 'How does a find silence in audio work?',
      answer:
        'This one works on numbers, not audio files: it scans your dB series for consecutive windows below the threshold, keeps runs that last at least your minimum gap length, and reports their times. Real audio decoding from an uploaded file is the app shell’s job — the logic here is pure math on the values you paste.',
    },
    {
      question: 'What is a find silence in audio?',
      answer:
        'A find silence in audio is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'How do I find find silence in audio?',
      answer: 'Enter your criteria above and the finder surfaces the most relevant options. Refine your inputs for more targeted results.',
    },
    {
      question: 'What makes a good find silence in audio?',
      answer: 'Relevance to your specific needs, not just popularity. The finder helps you filter by what actually matters for your situation.',
    },
  ],
  assumptions: [
    'Accepts numeric dB series only — it does NOT read audio files; file decoding is the app shell’s job.',
    'Expects dB-scale values (negative numbers); values exactly at the threshold are not silent.',
    'Noisy room tone may need the threshold raised (e.g. -40 to -30 dB) to register as silence.',
    'An empty result honestly means no gaps at the current settings — not an error.',
    'Same values always produce the same gaps — the algorithm is fully deterministic.',
  ],
  jsonLd: [],
};
