import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'bpm',
    label: 'Track BPM',
    type: 'number',
    required: true,
    placeholder: 'e.g. 120',
    validation: { min: 30, max: 300, unit: 'bpm' },
  },
  {
    id: 'trackDurationSec',
    label: 'Track duration (seconds)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 180',
    validation: { min: 0.1, max: 3600, unit: 's' },
  },
  {
    id: 'introOffsetSec',
    label: 'Intro offset (seconds, optional)',
    type: 'number',
    required: false,
    placeholder: '0',
    validation: { min: 0, unit: 's' },
  },
  {
    id: 'cutEveryNBeats',
    label: 'Cut every N beats (optional)',
    type: 'number',
    required: false,
    placeholder: '4',
    validation: { min: 1 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'beatIntervalMs', label: 'Beat interval (ms)', type: 'number' },
  { id: 'cutPointsMs', label: 'Cut points (ms)', type: 'list' },
  { id: 'totalBeats', label: 'Total beats', type: 'number' },
  { id: 'timelineMarkers', label: 'Timeline markers', type: 'table' },
];

export const content: ToolContent = {
  title: 'BPM to Beat Interval',
  description:
    'Cut on the beat every single time: enter any track\.'s BPM and total duration for exact beat intervals in milliseconds plus the total beat count.',
  howTo: [
    'Enter the track BPM (30-300) — tap it out or read it from your music app.',
    'Enter the track duration in seconds.',
    'Optionally set an intro offset in seconds if the beats start late, and how often to cut (every N beats, default 4).',
    'Run the planner to get the beat interval in ms, the total beat count, and cut points.',
    'Copy the timeline markers into your editor — each marker shows its time and beat number.',
  ],
  methodology:
    'Pure timing math: beatIntervalMs = 60000 / BPM. Beats are arithmetic markers starting at the intro offset — they are not detected from audio, so tempo drift, swing, or live-timing wobble in the real track are not reflected. Cut points land every Nth beat starting from beat 0 (the first beat after the intro offset). Above 200 BPM the planner warns that cuts this frequent can feel frantic.',
  examples: [
    {
      title: '120 BPM track, cut every 4 beats',
      inputs: { bpm: 120, trackDurationSec: 60, introOffsetSec: 0, cutEveryNBeats: 4 },
      note: '500 ms beat interval, 121 beats, 31 cut points at 0 ms, 2000 ms, 4000 ms, and so on.',
    },
    {
      title: 'Song with a 2-second intro',
      inputs: { bpm: 128, trackDurationSec: 180, introOffsetSec: 2, cutEveryNBeats: 8 },
      note: 'Markers start at 2000 ms so cuts land on the real first beat, not the intro.',
    },
  ],
  faqs: [
    {
      question: 'What is the best bpm to beat interval?',
      answer:
        'The best one gives you usable edit markers, not just the interval. This free planner converts BPM to the exact beat interval in ms, counts total beats, and generates cut points every N beats as copy-ready timeline markers with beat numbers.',
    },
    {
      question: 'Is there a free bpm to beat interval?',
      answer:
        'Yes — this planner is free with no signup. Enter BPM and track duration to get the beat interval, total beats, and cut points instantly.',
    },
    {
      question: 'How to use bpm to beat interval?',
      answer:
        'Divide 60000 by the BPM to get the ms between beats, then mark cuts every 2, 4, or 8 beats in your editor. This planner does the arithmetic for the whole track, including an intro offset, and lists every marker with its time and beat number.',
    },
    {
      question: 'How does a bpm to beat interval work?',
      answer:
        'It is pure arithmetic: 60000 / BPM gives the milliseconds per beat, and markers are placed at regular multiples from your intro offset. These are calculated markers, not detected beats — the tool does not analyze audio, so it assumes a constant tempo.',
    },
    {
      question: 'How does the bpm to beat interval work?',
      answer:
        'Enter your details using the inputs above and the bpm to beat interval calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the bpm to beat interval free to use?',
      answer:
        'Yes - this bpm to beat interval is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a bpm to beat interval?',
      answer:
        'A bpm to beat interval is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Markers are arithmetic, not detected beats — no audio is analyzed.',
    'Assumes a constant tempo; tempo drift, swing, or live timing will make markers drift from the real beats.',
    'Cut points include beat 0 (the first beat after the intro offset) as cut 1.',
    'Track duration is capped at 3600 seconds to keep the marker list usable.',
    'Same inputs always produce the same markers — the math is fully deterministic.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'BPM to Beat Interval 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/video-editing/bpm-beat-match-planner/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Cut on the beat every single time: enter any track\.'s BPM and total duration for exact beat intervals in milliseconds plus the total beat count.',
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
          name: 'BPM Beat-Match Planner',
          item: 'https://husnainblogger.com/tools/video-editing/bpm-beat-match-planner/',
        },
      ],
    },
  ],
};
