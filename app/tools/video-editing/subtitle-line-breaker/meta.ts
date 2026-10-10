import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'subtitleText',
    label: 'Subtitle text (one cue)',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. Hello, world! This is a test of the subtitle line breaking logic',
  },
  {
    id: 'maxCharsPerLine',
    label: 'Max characters per line',
    type: 'number',
    required: false,
    placeholder: '42',
  },
  {
    id: 'maxLines',
    label: 'Max lines',
    type: 'number',
    required: false,
    placeholder: '2',
  },
  {
    id: 'breakPreference',
    label: 'Break preference',
    type: 'select',
    required: false,
    options: ['punctuation', 'balanced'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'brokenLines', label: 'Broken subtitle lines', type: 'list' },
  { id: 'charsPerLine', label: 'Characters per line', type: 'list' },
  { id: 'warnings', label: 'Warnings', type: 'list' },
];

export const content: ToolContent = {
  title: 'Subtitle Line Breaker',
  description:
    'Break subtitle lines the right way: paste a subtitle cue, set max characters per line and max lines, and get clean, readable breaks instantly.',
  howTo: [
    'Paste one subtitle cue into the subtitle text box.',
    'Set max characters per line (10-60, default 42) and max lines (1-3, default 2).',
    'Choose a break preference: punctuation (break after punctuation first) or balanced (even line lengths).',
    'Run the breaker to get the broken lines, characters per line, and any warnings.',
    'If it warns that the cue needs more lines than your max, split it into two cues.',
  ],
  methodology:
    'Pure greedy/dynamic-programming line-breaking, never AI: punctuation mode walks left to right taking the rightmost break within the limit that follows punctuation, else the rightmost break before a word from a fixed 29-entry conjunction/preposition bank, else the rightmost fitting word; balanced mode uses dynamic programming minimizing squared raggedness with small bonuses for punctuation and conjunction breaks and a per-line penalty against over-splitting. Overlong single words are hard-broken with a warning, CJK-majority text drops to 16 chars/line per Netflix CJK guidance, and text already within limits returns unchanged.',
  examples: [
    {
      title: 'Punctuation-first break',
      inputs: { subtitleText: 'Hello, world! This is a test of the subtitle line breaking logic', maxCharsPerLine: 20, maxLines: 3, breakPreference: 'punctuation' },
      note: 'First line breaks cleanly after "Hello, world!" — every line stays within 20 characters.',
    },
    {
      title: 'Balanced two-liner',
      inputs: { subtitleText: 'aaa bbb ccc ddd eee fff', maxCharsPerLine: 12, maxLines: 3, breakPreference: 'balanced' },
      note: 'Returns two even lines of 11 characters instead of ragged splits.',
    },
  ],
  faqs: [
    {
      question: 'What is the best subtitle line breaker?',
      answer:
        'The best breaker respects language, not just character counts. This free tool breaks after punctuation first (Netflix-style guidance), otherwise before conjunctions and prepositions from a fixed 29-word bank, and offers a balanced mode that evens line lengths with dynamic programming — with warnings for overlong words, CJK text, and cues that exceed your line limit.',
    },
    {
      question: 'Is there a free subtitle line breaker?',
      answer:
        'Yes — this subtitle line breaker is completely free with no signup. Paste a cue, set max characters (10-60) and max lines (1-3), pick punctuation or balanced mode, and get broken lines with per-line character counts instantly.',
    },
    {
      question: 'How to use subtitle line breaker?',
      answer:
        'Paste one subtitle cue, set your max characters per line and max lines, and choose punctuation mode (breaks after . , ; : ! ? first) or balanced mode (evens lengths). The tool returns the lines, their character counts, and warnings — for example when a single word is too long or the cue needs splitting.',
    },
    {
      question: 'How does a subtitle line breaker work?',
      answer:
        'It uses fixed algorithms, not AI: punctuation mode greedily takes the best linguistic break point within your character limit, while balanced mode runs dynamic programming to minimize raggedness. CJK text automatically uses 16 chars/line per Netflix CJK guidance, and single words longer than the limit are hard-broken with a warning.',
    },
    {
      question: 'What is a subtitle line breaker?',
      answer:
        'A subtitle line breaker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'How do I use this subtitle line breaker tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
    {
      question: 'Is this subtitle line breaker tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
  ],
  assumptions: [
    'Algorithmic breaking only — it cannot judge readability or meaning the way a human subtitler can.',
    'The 29-word conjunction/preposition bank is fixed English; other languages get word-boundary breaks only.',
    'CJK detection switches to 16 chars/line automatically, overriding your setting with a warning.',
    'Cues needing more lines than your max are returned in full with a warning to split them — the tool never drops words.',
    'Same text and settings always produce the same breaks.',
  ],
  jsonLd: [],
};
