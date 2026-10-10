import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/video-editing/clip-segment-planner/';

export const inputs: ToolInput[] = [
  {
    id: 'sourceDurationSec',
    label: 'Source video length (seconds)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 600',
    validation: { min: 1 },
  },
  {
    id: 'targetClipSec',
    label: 'Target clip length (seconds)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 30',
    validation: { min: 1 },
  },
  {
    id: 'strategy',
    label: 'Segment strategy',
    type: 'select',
    required: true,
    options: ['highlights', 'even', 'custom'],
  },
  {
    id: 'customRanges',
    label: 'Custom ranges (custom strategy)',
    type: 'textarea',
    required: false,
    placeholder: '0:45 - 1:15\n2:00 - 2:30',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'segments',
    label: 'Clip segments',
    type: 'list',
    description:
    'Free long video to shorts planner 2026: Start and end timecodes with a label for each planned clip. Get instant results. free now.',
  },
  {
    id: 'coveragePct',
    label: 'Coverage (%)',
    type: 'percent',
    description:
    'Share of the source video covered by the planned segments.',
  },
  {
    id: 'warnings',
    label: 'Warnings',
    type: 'list',
    description:
    'Warnings about overlapping custom ranges and template-position highlights.',
  },
];

export const content: ToolContent = {
  title: 'Long Video To Shorts Planner',
  description:
    'Turn long videos into Shorts that land: enter source and target clip lengths, pick highlights, even spacing, or custom ranges, and get exact timecodes.',
  howTo: [
    'Enter your source video length and target clip length in seconds (target must be shorter).',
    'Pick a strategy: highlights (template positions), even (evenly spaced), or custom (your own ranges).',
    'For custom, add ranges one per line like "0:45 - 1:15" or paste a JSON array.',
    'Run the tool to get clip timecodes, coverage percent, and any warnings.',
    'Verify each timecode in your footage before cutting — highlights are template positions, not found moments.',
  ],
  methodology:
    'The tool does pure interval arithmetic. Highlights skips the first 8% (typical intro) and spaces up to 10 windows of the target length across the rest; even spaces up to 10 windows across the whole video; custom parses and validates your ranges, merging overlaps with a warning. Coverage = total clip seconds / source seconds x 100. The tool never watches your video — highlights positions are fixed templates, not detected moments.',
  examples: [
    {
      title: '10-minute podcast into 30s shorts',
      inputs: { sourceDurationSec: 600, targetClipSec: 30, strategy: 'highlights' },
      note: '10 template-position candidates, ~50% coverage.',
    },
    {
      title: 'Custom logged moments',
      inputs: {
        sourceDurationSec: 600,
        targetClipSec: 30,
        strategy: 'custom',
        customRanges: '0:45 - 1:15\n3:20 - 3:50',
      },
      note: 'Exactly your two ranges, 10% coverage.',
    },
  ],
  faqs: [
    {
      question: 'What is the best long video to shorts planner?',
      answer:
        'The best plan pairs real highlight moments with even coverage of the video — fixed template positions help you start, but verifying each timecode in your footage is what makes clips work. This free tool gives you both: template strategies and a custom lane for your own logged moments.',
    },
    {
      question: 'Is there a free long video to shorts planner?',
      answer:
        'Yes — this long video to shorts planner is completely free with no signup. Enter the source length and target clip length, pick a strategy, and get clip timecodes plus coverage percent instantly.',
    },
    {
      question: 'How to plan long video to shorts?',
      answer:
        'Decide your clip length, then either space clips evenly across the video, pick candidate positions skipping the intro, or mark your own highlight timestamps. Verify each candidate by watching it, then cut and reframe to vertical.',
    },
    {
      question: 'How does a long video to shorts planner work?',
      answer:
        'You give it the source length, the target clip length, and a strategy. It computes exact start/end timecodes with fixed interval math — highlights uses template positions (it does not watch your video), even spreads clips across the timeline, and custom validates your own ranges.',
    },
    {
      question: 'How does the long video to shorts planner work?',
      answer:
        'Enter your details using the inputs above and the long video to shorts planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the long video to shorts planner free to use?',
      answer:
        'Yes - this long video to shorts planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a long video to shorts planner?',
      answer:
        'A long video to shorts planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Highlights positions are fixed template positions, not detected highlights — the tool cannot watch your video. Verify each candidate in your footage.',
    'Clips are spaced to a maximum of 10 per plan to keep the output usable; very long sources should be planned in chunks.',
    'Coverage percent counts time covered, not quality — two overlapping moments merged into one count once.',
  ],
  jsonLd: [
  ],
};
