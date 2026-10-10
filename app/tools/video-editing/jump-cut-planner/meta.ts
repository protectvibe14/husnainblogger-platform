import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/video-editing/jump-cut-planner/';

export const inputs: ToolInput[] = [
  {
    id: 'transcriptWithTimestamps',
    label: 'Transcript with timestamps (JSON)',
    type: 'textarea',
    required: true,
    placeholder: '[{"text":"hello","startMs":0,"endMs":900},{"text":"um uh","startMs":1000,"endMs":1600}]',
  },
  {
    id: 'aggressiveness',
    label: 'Aggressiveness',
    type: 'select',
    required: true,
    options: ['light', 'medium', 'tight'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'keepSegments',
    label: 'Keep segments',
    type: 'list',
    description:
    'Free jump cut planner 2026: Timeline ranges to keep, with start and end in milliseconds. free.',
  },
  {
    id: 'cutSegments',
    label: 'Cut segments',
    type: 'list',
    description:
    'What to cut, with a reason for each cut (filler words or pause).',
  },
  {
    id: 'newDurationSec',
    label: 'New duration (seconds)',
    type: 'number',
    description:
    'Estimated video length after all cuts are applied.',
  },
  {
    id: 'cutCount',
    label: 'Number of cuts',
    type: 'number',
    description:
    'Total cuts in the plan.',
  },
  {
    id: 'warnings',
    label: 'Warnings',
    type: 'list',
    description:
    'Warns when the plan would remove more than 60% of the footage.',
  },
];

export const content: ToolContent = {
  title: 'Jump Cut Planner',
  description:
    'Plan jump cuts from a timestamped transcript: pick aggressiveness to get keep/cut ranges, a new duration estimate, and safety warnings. Start planning now.',
  howTo: [
    'Paste your transcript as JSON: each segment needs text, startMs, and endMs in ascending order.',
    'Pick aggressiveness: light, medium, or tight — tighter cuts more filler and shorter pauses.',
    'Run the tool to get keep segments, cut segments with reasons, and the new duration.',
    'Check the warnings — if over 60% of the footage would be cut, the plan flags it.',
    'Apply the ranges in CapCut: split at each cut range, delete the cut ranges, and ripple-close the gaps.',
  ],
  methodology:
    'The tool performs pure timestamp arithmetic. A segment is cut whole only if its text is entirely filler words (light: um/uh/hmm; medium adds like/well/basically; tight adds phrases like "you know" and repeated words). Gaps between segments longer than the aggressiveness threshold (light 2000ms, medium 1200ms, tight 700ms) are cut down to a keep margin. New duration = total minus cuts. Filler detection is text-pattern matching only — the tool never hears audio, so always verify cuts by listening.',
  examples: [
    {
      title: 'Talking-head cleanup, medium',
      inputs: {
        transcriptWithTimestamps: '[{"text":"hello everyone","startMs":0,"endMs":900},{"text":"um uh","startMs":1000,"endMs":1600},{"text":"today we cook rice","startMs":1800,"endMs":3200}]',
        aggressiveness: 'medium',
      },
      note: 'Cuts the filler segment; keeps the speech.',
    },
    {
      title: 'Tight podcast trim',
      inputs: {
        transcriptWithTimestamps: '[{"text":"this this is the point","startMs":0,"endMs":900},{"text":"okay so next","startMs":1000,"endMs":1800}]',
        aggressiveness: 'tight',
      },
      note: 'Flags the repeated word and the filler-heavy segment.',
    },
  ],
  faqs: [
    {
      question: 'What is the best jump cut planner?',
      answer:
        'The best jump cut plan removes only true dead air and filler while keeping natural pacing — that means cutting whole filler segments and long pauses, not chopping mid-word. This free tool does exactly that from a timestamped transcript with three aggressiveness levels.',
    },
    {
      question: 'Is there a free jump cut planner?',
      answer:
        'Yes — this jump cut planner is completely free with no signup. Paste your transcript as JSON, pick light, medium, or tight, and get keep/cut ranges plus a new-duration estimate instantly.',
    },
    {
      question: 'How to plan jump cut?',
      answer:
        'Get a timestamped transcript of your footage, mark segments that are pure filler and pauses longer than about 2 seconds, then cut those ranges and close the gaps. This tool does the marking for you and warns if the plan would cut over 60% of your footage.',
    },
    {
      question: 'How does a jump cut planner work?',
      answer:
        'You give it a transcript with start and end times per segment. It cuts segments that are entirely filler words (text-pattern matching, not audio analysis) and trims pauses beyond an aggressiveness threshold, then returns keep and cut ranges plus the new estimated duration.',
    },
    {
      question: 'How does the jump cut planner work?',
      answer:
        'Enter your details using the inputs above and the jump cut planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the jump cut planner free to use?',
      answer:
        'Yes - this jump cut planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a jump cut planner?',
      answer:
        'A jump cut planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Filler detection is text-pattern matching only — the tool cannot hear audio, so a segment labeled filler must be verified by listening before cutting.',
    'The tool trusts your timestamps; wrong segment times produce a wrong plan. Export an accurate transcript first.',
    'A plan cutting over 60% of footage is flagged, not applied — the tool never edits anything, it only produces the plan.',
  ],
  jsonLd: [
  ],
};
