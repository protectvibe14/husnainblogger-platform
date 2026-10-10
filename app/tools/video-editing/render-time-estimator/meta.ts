import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

// tool-289 — Render Time Estimator. Calculator with isEstimate=true: outputs a
// ROUGH ESTIMATE range (never a point estimate) plus the labeled assumptions.
// Baseline encode rates are documented estimates, not measurements.

export const inputs: ToolInput[] = [
  {
    id: 'durationSec',
    label: 'Video duration (seconds)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 600',
    validation: { min: 1 },
  },
  {
    id: 'fps',
    label: 'Frame rate',
    type: 'number',
    required: true,
    placeholder: 'e.g. 30',
    validation: { min: 1 },
  },
  {
    id: 'resolution',
    label: 'Resolution',
    type: 'select',
    required: true,
    options: ['720p', '1080p', '4k'],
  },
  {
    id: 'effectLoad',
    label: 'Effects load',
    type: 'select',
    required: true,
    options: ['light', 'medium', 'heavy'],
  },
  {
    id: 'deviceTier',
    label: 'Device tier',
    type: 'select',
    required: true,
    options: ['low', 'mid', 'high'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'estimatedMinSec', label: 'Estimated minimum render time (ROUGH ESTIMATE, seconds)', type: 'number' },
  { id: 'estimatedMaxSec', label: 'Estimated maximum render time (ROUGH ESTIMATE, seconds)', type: 'number' },
  { id: 'assumptions', label: 'Assumptions behind the estimate', type: 'list' },
];

const DESCRIPTION =
  'Know your export time before you wait around: enter your video duration, resolution, effects, and device tier for a realistic time estimate.';

export const content: ToolContent = {
  title: 'Video Render Time Estimator',
  description: DESCRIPTION,
  howTo: [
    'Enter your video duration in seconds and its frame rate (e.g. 30).',
    'Select the export resolution: 720p, 1080p, or 4k.',
    'Select the effects load: light (cuts and titles), medium (transitions, color work), or heavy (stabilization, noise reduction, many layers).',
    'Select your device tier honestly: low (old laptop), mid (typical modern machine), or high (recent high-end desktop).',
    'Run the tool to get a ROUGH ESTIMATE range — never a guaranteed time.',
    'Read the assumptions list: it explains exactly what the estimate does and does not account for.',
  ],
  methodology:
    'The tool uses a documented baseline (F-RENDER-01): a mid-tier device is estimated to encode 1080p30 with light effects at ~6x realtime, then the rate is scaled by resolution (720p ~0.44x, 4k ~4x the cost of 1080p), effects load (medium 1.6x, heavy 2.8x), frame rate, and device tier. The result is rendered as a range (70%–150% of the estimate; 50%–220% for the extreme 4k + heavy + low-tier case). Every rate in the baseline is an estimate, not a measurement — actual speed depends on your encoder, codec, background load, and thermals.',
  examples: [
    {
      title: '10-min 1080p tutorial, mid device',
      inputs: { durationSec: 600, fps: 30, resolution: '1080p', effectLoad: 'medium', deviceTier: 'mid' },
      note: 'Rough range 112–240 seconds — treat the high end as the safe planning number.',
    },
    {
      title: '5-min 4k cinematic, high device',
      inputs: { durationSec: 300, fps: 24, resolution: '4k', effectLoad: 'heavy', deviceTier: 'high' },
      note: 'Heavy 4k effects cost roughly 11x the encode time of light 1080p — plan accordingly.',
    },
    {
      title: 'Worst case: 4k heavy on old laptop',
      inputs: { durationSec: 300, fps: 30, resolution: '4k', effectLoad: 'heavy', deviceTier: 'low' },
      note: 'Returns a very wide range plus a strong caveat — consider 1080p or proxy editing.',
    },
  ],
  faqs: [
    {
      question: 'What is the best video render time estimator?',
      answer:
        'An honest one: it gives you a range, not a fake exact time, and tells you its assumptions. This free tool estimates a range from your duration, resolution, effects load, and device tier — every baseline rate is documented as an estimate, and the 4k + heavy + low-device worst case carries an explicit caveat.',
    },
    {
      question: 'Is there a free video render time estimator?',
      answer:
        'Yes — this video render time estimator is free and runs entirely in your browser with no signup. Enter duration, frame rate, resolution, effects load, and device tier to get a rough minimum–maximum range with its assumptions spelled out.',
    },
    {
      question: 'How to estimate video render time?',
      answer:
        'Start from your video\'s duration, then scale by what makes renders slow: 4k costs roughly 4x the encode time of 1080p, heavy effects multiply it further, and a low-tier device multiplies it again. This tool applies those documented scaling factors and returns a planning range — always budget toward the high end.',
    },
    {
      question: 'What is a video render time estimator?',
      answer:
        'A video render time estimator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the video render time estimator?',
      answer:
        'No account needed. Open the video render time estimator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'Is this video render time estimator tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
    {
      question: 'How do I use this video render time estimator tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
  ],
  assumptions: [
    'ROUGH ESTIMATE by design: real render speed depends on your encoder (hardware vs software), codec, effects, background apps, and thermals — no formula can know your machine.',
    'Baseline rates are estimates, not measurements: mid-tier 1080p30 light effects at ~6x realtime; 720p 0.44x, 4k 4x the 1080p cost; medium 1.6x, heavy 2.8x; device tiers low 0.45x, high 1.9x.',
    'Output is always a range, never a point estimate; the extreme 4k + heavy + low-tier case returns an extra-wide range with a strong caveat.',
  ],
  jsonLd: [],
};
