import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'srtText',
    label: 'Your SRT subtitle text',
    type: 'textarea',
    required: true,
    placeholder: 'e.g.\n1\n00:00:01,000 --> 00:00:04,000\nHello world\n',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'vtt', label: 'Converted WebVTT', type: 'copy' },
  { id: 'cueCount', label: 'Number of cues', type: 'number' },
  { id: 'errors', label: 'Conversion errors', type: 'list' },
  { id: 'warnings', label: 'Conversion warnings', type: 'list' },
];

export const content: ToolContent = {
  title: 'SRT to VTT Converter',
  description:
    'Convert SRT subtitles to WebVTT right in your browser: paste your SRT text and get clean, validated VTT output instantly - no uploads, no waiting.',
  howTo: [
    'Paste your .srt subtitle text into the input box (or drag in the file contents).',
    'Run the converter — blank-line separated blocks are parsed and validated.',
    'Review any errors (broken timing lines, bad durations) and warnings (dot decimals, renumbering, overlaps).',
    'Copy the WebVTT output, which always starts with the required WEBVTT header.',
    'Fix flagged cues in your source SRT and re-run until the output is clean.',
  ],
  methodology:
    'Pure client-side format parsing, never AI: blocks are split on blank lines and each block must have a sequence number, an HH:MM:SS,mmm --> HH:MM:SS,mmm timing line, and at least one text line. Timestamps convert to WebVTT HH:MM:SS.mmm (dot decimals); CRLF line endings are normalized; dot decimals and missing sequence numbers are accepted with warnings; cues with end time at or before start time are dropped as errors; overlapping cues are kept with warnings; all unicode text is preserved byte-identical.',
  examples: [
    {
      title: 'Clean two-cue SRT',
      inputs: { srtText: '1\n00:00:01,000 --> 00:00:04,000\nHello world\n\n2\n00:00:05,500 --> 00:00:07,000\nSecond cue\n' },
      note: 'Converts with zero errors or warnings; cueCount is 2.',
    },
    {
      title: 'SRT with quirks',
      inputs: { srtText: '1\n00:00:01.000 --> 00:00:04.000\nDot decimals\n\n5\n00:00:03,000 --> 00:00:05,000\nOverlap\n' },
      note: 'Dot decimals are accepted with a warning, non-sequential numbering is flagged, and the overlap is reported.',
    },
  ],
  faqs: [
    {
      question: 'What is the best srt to vtt converter?',
      answer:
        'The best one validates your file while it converts. This free converter parses every cue, flags errors (broken timing lines, end time before start time) and warnings (dot decimals, missing sequence numbers, overlapping cues), and outputs clean WebVTT with the required WEBVTT header — all in your browser.',
    },
    {
      question: 'Is there a free srt to vtt converter?',
      answer:
        'Yes — this converter is completely free with no signup. Paste your SRT text, get WebVTT output with a per-cue issue report, and copy or download the result instantly.',
    },
    {
      question: 'How to convert srt to vtt?',
      answer:
        'Paste your SRT text into the converter. It splits the file into blocks, converts each HH:MM:SS,mmm timestamp to WebVTT HH:MM:SS.mmm format, adds the WEBVTT header, and flags any cues it had to skip or repair.',
    },
    {
      question: 'How does a srt to vtt converter work?',
      answer:
        'It reads each subtitle block (sequence number, timing line, text lines), rewrites the timestamps from comma decimals to dot decimals, and prefixes the file with WEBVTT. This one additionally validates every cue and reports errors and warnings instead of silently dropping problems.',
    },
    {
      question: 'How does the srt to vtt converter work?',
      answer:
        'Enter your details using the inputs above and the srt to vtt converter calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the srt to vtt converter free to use?',
      answer:
        'Yes - this srt to vtt converter is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a srt to vtt converter?',
      answer:
        'A srt to vtt converter is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'SubRip has no formal spec; parsing follows the widely-observed convention (numeric sequence, HH:MM:SS,mmm --> HH:MM:SS,mmm timing line).',
    'Dot-decimal timestamps are accepted with a warning even though they are WebVTT style, not SRT convention.',
    'Cues with end time at or before start time are dropped as errors — the converter never invents replacement timings.',
    'Input is capped at 2,000,000 characters to protect the browser; unicode text is preserved byte-identical.',
  ],
  jsonLd: [],
};
