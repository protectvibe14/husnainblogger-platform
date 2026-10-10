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
  {
    id: 'audience',
    label: 'Audience',
    type: 'select',
    required: false,
    options: ['adult', 'children'],
  },
  {
    id: 'script',
    label: 'Script',
    type: 'select',
    required: false,
    options: ['latin', 'cjk'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'perCue', label: 'Characters-per-second per cue', type: 'table' },
  { id: 'overallVerdict', label: 'Overall pass or fail', type: 'text' },
  { id: 'worstCues', label: 'Fastest (worst) cues', type: 'list' },
];

export const content: ToolContent = {
  title: 'Characters Per Second Checker',
  description:
    'Check caption reading speed in characters per second: paste your SRT or WebVTT subtitles to flag every cue that is too fast for your audience.',
  howTo: [
    'Paste your subtitle text (SRT or WebVTT) into the input box.',
    'Pick your audience (adult or children) and script (Latin or CJK).',
    'Run the check — every cue gets a CPS score (characters ÷ seconds).',
    'Read the overall verdict: pass means every cue is at or under the limit.',
    'Fix the cues listed in "worst cues" by shortening the text or lengthening the timing.',
  ],
  methodology:
    'Pure CPS arithmetic, never AI: CPS = characters ÷ seconds per cue, counting every character including spaces and punctuation (Netflix counting rule; multi-line cues are joined with a single space). Limits are published standards: Latin adult 20 CPS and Latin children 17 CPS (Netflix Timed Text Style Guide); CJK 9 CPS — the Latin 20 CPS limit is never applied to CJK text. Exactly at the limit passes with an "at limit" note. No official CPS standard exists for social short-form platforms, so none is offered.',
  examples: [
    {
      title: 'Comfortable reading speed',
      inputs: { subtitleText: '1\n00:00:01,000 --> 00:00:04,000\nHello world, take your time\n', audience: 'adult', script: 'latin' },
      note: 'Passes: the cue reads well under 20 CPS.',
    },
    {
      title: 'Too fast for kids',
      inputs: { subtitleText: '1\n00:00:01,000 --> 00:00:02,000\nThe quick brown fox jumps over\n', audience: 'children', script: 'latin' },
      note: 'Fails: 29 CPS exceeds the 17 CPS children limit.',
    },
  ],
  faqs: [
    {
      question: 'What is the best characters per second checker?',
      answer:
        'The best one uses the real broadcast limits and counts the way broadcasters do. This free checker applies the Netflix 20 CPS adult and 17 CPS children limits (plus 9 CPS for CJK), counts spaces and punctuation like Netflix does, and shows a per-cue verdict plus the worst offenders.',
    },
    {
      question: 'Is there a free characters per second checker?',
      answer:
        'Yes — this checker is completely free with no signup. Paste SRT or WebVTT text, choose your audience and script, and get CPS scores for every cue instantly.',
    },
    {
      question: 'How to check characters per second?',
      answer:
        'Paste your subtitles, set the audience (adult or children) and script (Latin or CJK). The checker divides each cue\'s character count — including spaces and punctuation — by its on-screen seconds and compares the result to the published limit for your settings.',
    },
    {
      question: 'How does a characters per second checker work?',
      answer:
        'It is pure math, not AI: for each cue it counts characters (spaces and punctuation included, per the Netflix counting rule), divides by the cue duration in seconds, and compares the result to a fixed limit — 20 CPS for Latin adults, 17 for children, 9 for CJK. Cues exactly at the limit pass with a note.',
    },
    {
      question: 'How does the characters per second checker work?',
      answer:
        'Enter your details using the inputs above and the characters per second checker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the characters per second checker free to use?',
      answer:
        'Yes - this characters per second checker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a characters per second checker?',
      answer:
        'A characters per second checker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Limits are broadcast standards (Netflix Timed Text Style Guide), not platform rules for TikTok, Reels, or Shorts — no official CPS standard exists for short-form.',
    'BBC 160-180 wpm guidance (~14-16 CPS) is context only; it is not used as a pass/fail limit.',
    'Character count uses UTF-16 code units, so some emoji and CJK characters may count as two units each.',
    'A passing CPS does not guarantee the caption is in sync with the audio — timing still needs its own check.',
  ],
  jsonLd: [
  ],
};
