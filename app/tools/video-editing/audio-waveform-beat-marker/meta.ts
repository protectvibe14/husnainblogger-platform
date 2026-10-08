import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'amplitudeValues',
    label: 'Amplitude values (comma-separated)',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. 0.02, 0.05, 0.9, 0.4, 0.85, ... — one value per 10 ms window (0-1)',
  },
  {
    id: 'sensitivity',
    label: 'Sensitivity',
    type: 'select',
    required: false,
    options: ['low', 'med', 'high'],
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
  { id: 'peaks', label: 'Detected peaks', type: 'table' },
  { id: 'suggestedCutPointsMs', label: 'Suggested cut points (ms)', type: 'list' },
  { id: 'waveformSummary', label: 'Waveform summary', type: 'text' },
];

export const content: ToolContent = {
  title: 'Audio Waveform Visualizer 2026 – Free Tool | HusnainBlogger',
  description:
    'Free audio waveform visualizer 2026: find beat candidates in audio clips: paste amplitude values to get peak markers,. Fast, private, no signup - try it now!',
  howTo: [
    'Paste your amplitude values as comma-separated numbers — one value per analysis window (10 ms each by default), at least 32 values.',
    'Pick a sensitivity: low finds only the biggest hits, med is balanced, high catches subtler peaks.',
    'Optionally set the milliseconds each value represents if your series uses a different window.',
    'Run the marker to get the peak table (time + strength), suggested cut points in ms, and a summary.',
    'Confirm each marker by ear — these are energy-peak candidates, not true tempo beats.',
  ],
  methodology:
    'Pure peak-picking math on the value series you provide — no AI, no audio file decoding. Values are normalized to their maximum, then local maxima at or above mean + k·std are kept, with k = 1.5 (low), 1.0 (med), or 0.6 (high). A 100 ms refractory gap keeps only the strongest peak in each window. Real onset detection would need the Web Audio API to decode an uploaded file — that is the app shell’s job; this logic layer only does the math on the numbers. Markers are energy-peak candidates, not true tempo beats.',
  examples: [
    {
      title: 'Four-on-the-floor kick pattern',
      inputs: {
        amplitudeValues:
          '0.1, 0.1, 0.1, 0.1, 0.1, 0.9, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.9, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.9, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.9, 0.1, 0.1, 0.1, 0.1',
        sensitivity: 'med',
        windowMs: 10,
      },
      note: 'Four peaks are marked at 50, 150, 250, and 350 ms with full strength.',
    },
    {
      title: 'High sensitivity on a soft section',
      inputs: {
        amplitudeValues:
          '0.2, 0.2, 0.2, 0.2, 0.2, 0.38, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.38, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.38, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.38, 0.2, 0.2, 0.2, 0.2',
        sensitivity: 'high',
        windowMs: 10,
      },
      note: 'High sensitivity catches the subtler 0.38 peaks that low sensitivity would ignore.',
    },
  ],
  faqs: [
    {
      question: 'What is the best audio waveform visualizer?',
      answer:
        'The best one shows its method. This free tool runs transparent peak-picking math on your amplitude values — local maxima above a sensitivity-based threshold — and returns peak times, strengths, and suggested cut points, with no signup.',
    },
    {
      question: 'Is there a free audio waveform visualizer?',
      answer:
        'Yes — this marker is free with no signup. Paste at least 32 comma-separated amplitude values and get peak markers, cut points, and a waveform summary instantly.',
    },
    {
      question: 'How to visualize audio waveform?',
      answer:
        'You need the amplitude of the audio over time. Export or measure one value per short window (e.g. every 10 ms), paste the comma-separated series here, and the tool marks the energy peaks you can cut to.',
    },
    {
      question: 'How does an audio waveform visualizer work?',
      answer:
        'This one works on numbers, not audio files: it normalizes your amplitude series, keeps local maxima above mean + k·std (k depends on your low/med/high sensitivity), enforces a 100 ms gap between peaks, and lists each peak’s time and strength. Real waveform rendering from an uploaded file is the app shell’s job — the logic here is pure math on the values you paste.',
    },
    {
      question: 'How does the audio waveform visualizer work?',
      answer:
        'Enter your details using the inputs above and the audio waveform visualizer calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the audio waveform visualizer free to use?',
      answer:
        'Yes - this audio waveform visualizer is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an audio waveform visualizer?',
      answer:
        'An audio waveform visualizer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Accepts numeric amplitude series only — it does NOT read audio files; file decoding is the app shell’s job.',
    'Needs at least 32 values and caps at 200,000 values per run.',
    'Negative values are clamped to 0 (amplitudes cannot be negative).',
    'Peaks are energy candidates, not true tempo beats — variable tempo, swing, and fills are not modeled.',
    'Same values always produce the same peaks — the algorithm is fully deterministic.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Audio Waveform Visualizer 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/video-editing/audio-waveform-beat-marker/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free audio waveform visualizer 2026: find beat candidates in audio clips: paste amplitude values to get peak markers,. Fast, private, no signup - try it now!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Video Editing Tools',
          item: 'https://husnainblogger.com/tools/video-editing/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Audio Waveform Beat Marker',
          item: 'https://husnainblogger.com/tools/video-editing/audio-waveform-beat-marker/',
        },
      ],
    },
  ],
};
