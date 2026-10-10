import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'subtitleText',
    label: 'Your subtitle text (SRT or VTT)',
    type: 'textarea',
    required: true,
    placeholder: 'e.g.\n1\n00:00:01,000 --> 00:00:04,000\nHello world\n',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'issues', label: 'Timing issues found', type: 'table' },
  { id: 'summary', label: 'Error and warning counts', type: 'table' },
  { id: 'passFail', label: 'Pass or fail verdict', type: 'text' },
];

export const content: ToolContent = {
  title: 'Subtitle Timing Checker',
  description:
    'Catch subtitle timing errors before you publish: paste SRT or VTT to detect overlaps, zero-duration cues, and awkward gaps - all in one check.',
  howTo: [
    'Paste your subtitle text (SRT or WebVTT) into the input box.',
    'Run the check — every cue is validated against the timing rule set.',
    'Review each issue: cue number, rule, severity (error or warning), and message.',
    'Fix errors first (overlaps, zero-duration cues, empty text) — they fail the file.',
    'Address warnings (flash-risk duration, short gaps, overlong cues), then re-check.',
  ],
  methodology:
    'Pure rule engine over your cue list, never AI and never an audio sync analysis: gap under 83ms triggers a minimum-gap warning (Netflix 2-frame rule at 24 fps); duration under 833ms triggers a flash-risk warning; duration over 7000ms triggers an excessive-duration warning; overlapping cues, zero-duration cues, and empty text are errors. Pass means zero errors; warnings never fail the file. Single-cue inputs skip gap checks because there is nothing to compare against.',
  examples: [
    {
      title: 'Clean two-cue SRT',
      inputs: { subtitleText: '1\n00:00:01,000 --> 00:00:04,000\nHello world\n\n2\n00:00:05,000 --> 00:00:08,000\nSecond cue here\n' },
      note: 'Passes with zero errors and zero warnings.',
    },
    {
      title: 'Overlapping cues',
      inputs: { subtitleText: '1\n00:00:01,000 --> 00:00:04,000\nFirst\n\n2\n00:00:03,000 --> 00:00:05,000\nSecond\n' },
      note: 'Fails: cue 2 overlaps cue 1, reported as an overlap error.',
    },
  ],
  faqs: [
    {
      question: 'What is the best subtitle timing checker?',
      answer:
        'The best one publishes its rules. This free checker tests every cue against the Netflix timing rules — 83ms minimum gap, 833ms minimum duration, 7-second maximum duration — and reports overlaps, zero-duration cues, and empty text as errors with exact cue numbers.',
    },
    {
      question: 'Is there a free subtitle timing checker?',
      answer:
        'Yes — this checker is completely free with no signup. Paste SRT or WebVTT text to get a pass/fail verdict, per-cue issues, and error/warning counts instantly.',
    },
    {
      question: 'How to check subtitle timing?',
      answer:
        'Paste your SRT or VTT into the checker. It flags overlapping cues, cues that end before they start, cues too short to read (under 833ms), cues on screen too long (over 7s), and gaps between cues under 83ms — then tells you the file passes or fails.',
    },
    {
      question: 'How does a subtitle timing checker work?',
      answer:
        'It applies fixed timing rules to each cue, not AI: it compares each cue start and end against the previous cue, measures gaps and durations in milliseconds, and sorts violations into errors (overlaps, zero duration, empty text) and warnings (flash risk, short gaps, overlong cues). It never analyzes your audio, so it cannot verify actual sync.',
    },
    {
      question: 'How does the subtitle timing checker work?',
      answer:
        'Enter your details using the inputs above and the subtitle timing checker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the subtitle timing checker free to use?',
      answer:
        'Yes - this subtitle timing checker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a subtitle timing checker?',
      answer:
        'A subtitle timing checker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Thresholds come from the Netflix Timed Text Style Guide (83ms gap, 833ms minimum, 7s maximum) — a broadcast standard, not a social-platform rule.',
    'The checker compares cue timings only; it never listens to audio and cannot confirm captions are in sync with speech.',
    'No official timing standard exists for social short-form platforms — only the published broadcast rules are applied.',
    'Unparseable timing lines cause the block to be skipped and reported as an error on the whole run.',
  ],
  jsonLd: [],
};
