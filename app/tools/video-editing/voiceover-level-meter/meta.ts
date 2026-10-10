import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'samples',
    label: 'Audio samples (comma-separated, -1 to 1)',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. 0.0, 0.12, -0.34, 0.56, -0.21 ... (at least 8 values)',
  },
  {
    id: 'targetDb',
    label: 'Target level in dBFS (default -12)',
    type: 'number',
    required: false,
    placeholder: '-12',
    validation: { min: -30, max: -3 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'peakDb', label: 'Peak level (dBFS)', type: 'number' },
  { id: 'rmsDb', label: 'RMS loudness (dBFS)', type: 'number' },
  { id: 'loudnessVerdict', label: 'Loudness verdict', type: 'text' },
  { id: 'gainAdjustmentDb', label: 'Suggested gain change (dB)', type: 'number' },
  { id: 'clippingDetected', label: 'Clipping detected', type: 'text' },
];

export const content: ToolContent = {
  title: 'Mic Level Tester',
  description:
    'Test your mic levels before you hit record: paste audio samples for peak and RMS loudness in dBFS, plus clipping warnings. Try it now!',
  howTo: [
    'Paste audio sample values (normalized -1 to 1, comma-separated, at least 8) into the samples box.',
    'Set your target level in dBFS — -12 is the default for voiceover work.',
    'Run the test to get peak and RMS loudness, a loudness verdict, and a suggested gain change.',
    'Check the clipping flag: any sample at 0 dBFS means the take clipped and must be re-recorded.',
    'Apply the gain adjustment in your editor and re-test until the verdict reads "On target".',
  ],
  methodology:
    'Pure dB math on one batch of samples (no AI, no live metering): peakDb = 20*log10(max|x|); rmsDb = 20*log10(sqrt(mean(x^2))); gainAdjustmentDb = targetDb - rmsDb (positive = turn up); clippingDetected = any |x| >= 1.0 (a sample at 0 dBFS). Verdict: RMS within ±3 dB of target = On target, below = Too quiet, above = Too loud; a peak above -1 dBFS adds a near-clipping note. All-silence input reports -120 dB with an explicit silence message. Getting the samples needs the Web Audio API (file decode or microphone) in the app — this page measures a pasted batch only, it is not a real-time meter.',
  examples: [
    {
      title: 'Quiet voiceover take',
      inputs: { samples: '0.01, -0.02, 0.015, -0.01, 0.02, -0.015, 0.012, -0.018', targetDb: -12 },
      note: 'RMS far under target — verdict "Too quiet" with a positive gain suggestion.',
    },
    {
      title: 'Clipped take',
      inputs: { samples: '0.2, -0.3, 1.0, 0.1, -0.2, 0.3, -0.1, 0.25', targetDb: -12 },
      note: 'A sample at exactly 0 dBFS — clipping flag set to Yes with a re-record warning.',
    },
  ],
  faqs: [
    {
      question: 'What is the best mic level tester?',
      answer:
        'The best mic level tester shows real measurements, not a vibe: peak and RMS in dBFS, a clipping flag, and a concrete gain suggestion against a target level. This free tester runs the pure dB math on your audio samples and tells you exactly how many dB to turn up or down.',
    },
    {
      question: 'Is there a free mic level tester?',
      answer:
        'Yes — this mic level tester is completely free with no signup. Paste at least 8 normalized audio sample values (-1 to 1) and set your target dBFS (default -12) to get peak/RMS loudness, clipping detection, and gain advice instantly.',
    },
    {
      question: 'How to test mic level?',
      answer:
        'Record a test take at your normal speaking volume, read the sample values from your editor or capture them via the Web Audio API, then paste them here with a target level (-12 dBFS is standard for voiceover). The tester reports peak and RMS loudness, flags clipping at 0 dBFS, and tells you the exact gain change needed.',
    },
    {
      question: 'How does a mic level tester work?',
      answer:
        'It measures, it does not listen: peakDb = 20*log10(loudest sample), rmsDb = 20*log10(root-mean-square), and clipping = any sample at 0 dBFS. The result is compared to your target level (±3 dB tolerance). This page measures one pasted batch of samples — it is not a live meter, so capture the samples from your recording first.',
    },
    {
      question: 'What is a mic level tester?',
      answer:
        'A mic level tester is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'This is a batch measurement tool, not a live/real-time meter — capturing audio needs the Web Audio API (file decode or microphone) in the app shell.',
    'Samples must be normalized floats in the -1..1 range; unnormalized or non-numeric input is rejected.',
    'The ±3 dB "On target" tolerance and the -12 dBFS default are voiceover conventions, not measurements.',
    'A single pasted batch cannot represent a whole recording — test several sections for a real verdict.',
    'Results are deterministic: the same sample batch always produces the same measurements.',
  ],
  jsonLd: [],
};
