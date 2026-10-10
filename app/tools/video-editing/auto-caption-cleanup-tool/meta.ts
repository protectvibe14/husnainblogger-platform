import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'rawCaptionText',
    label: 'Caption text (plain, SRT, or VTT)',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. um hello world , this is uh a test\n\n(or paste full SRT / VTT)',
  },
  {
    id: 'fixCaps',
    label: 'Fix capitalization',
    type: 'boolean',
    required: false,
  },
  {
    id: 'fixPunct',
    label: 'Fix punctuation',
    type: 'boolean',
    required: false,
  },
  {
    id: 'removeFillers',
    label: 'Remove filler words (um, uh, ...)',
    type: 'boolean',
    required: false,
  },
  {
    id: 'maxCharsPerLine',
    label: 'Max characters per line',
    type: 'number',
    required: false,
    placeholder: '42',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'cleanedText', label: 'Cleaned captions', type: 'copy' },
  { id: 'changes', label: 'Change log', type: 'table' },
  { id: 'fillerCountRemoved', label: 'Filler words removed', type: 'number' },
];

export const content: ToolContent = {
  title: 'Clean Up Auto Captions',
  description:
    'Fix messy auto captions fast: strip filler words, fix caps and punctuation, and re-wrap lines from text, SRT, or VTT - with a full change log.',
  howTo: [
    'Paste your raw caption text — plain text, SRT, or VTT all work (timestamps and cue tags are stripped automatically).',
    'Toggle the fixes you want: fix capitalization, fix punctuation, and remove filler words like um and uh.',
    'Set max characters per line (10-80, default 42) to re-wrap long caption lines.',
    'Run the cleanup to get the cleaned text, a line-by-line change log, and the filler-word removal count.',
    'Review the change log before publishing — sentence-casing lowercases proper nouns, so restore names where needed.',
  ],
  methodology:
    'Pure regex and string rules, never AI: SRT/VTT cues are parsed down to text lines; a fixed 13-word filler bank (um, uh, umm, uhh, uhm, hmm, hm, erm, er, ah, mmm, mm, ahem) is removed as standalone tokens only; all-lowercase lines get sentence-casing while ALL-CAPS shouting lines are preserved intentionally; punctuation spacing is normalized, repeats collapsed, and a terminal period added to the final line; long lines are greedily word-wrapped at your max (overlong words hard-break with a logged entry). Non-Latin-majority lines are left untouched, and the change log is capped at 200 entries.',
  examples: [
    {
      title: 'Messy auto-captions',
      inputs: { rawCaptionText: 'um hello world , this is uh a test', fixCaps: true, fixPunct: true, removeFillers: true, maxCharsPerLine: 42 },
      note: 'Returns "Hello world, this is a test." with 2 fillers removed and every fix logged.',
    },
    {
      title: 'SRT paste',
      inputs: { rawCaptionText: '1\n00:00:01,000 --> 00:00:03,000\nhello um world', fixCaps: true, fixPunct: true, removeFillers: true, maxCharsPerLine: 42 },
      note: 'Strips the index and timestamp, removes "um", and sentence-cases the cue.',
    },
  ],
  faqs: [
    {
      question: 'What is the best clean up auto captions?',
      answer:
        'The best cleanup shows every edit it makes. This free tool strips filler words (um, uh, and 11 more) as standalone tokens, sentence-cases all-lowercase lines, normalizes punctuation spacing, re-wraps long lines at your chosen width, and logs each change with before/after — so you can audit everything before publishing.',
    },
    {
      question: 'Is there a free clean up auto captions?',
      answer:
        'Yes — this caption cleanup tool is completely free with no signup. Paste plain text, SRT, or VTT to get cleaned captions, a full change log, and the filler-word removal count instantly.',
    },
    {
      question: 'How to use clean up auto?',
      answer:
        'Paste your caption text (SRT/VTT timestamps are stripped automatically), toggle fix capitalization, fix punctuation, and remove fillers, then set max characters per line (10-80). Run it to get the cleaned text plus a change log — check the log for proper nouns, since sentence-casing lowercases them.',
    },
    {
      question: 'How does a clean up auto captions work?',
      answer:
        'It applies fixed string rules, not AI: filler removal from a 13-word bank, sentence-casing, punctuation normalization, and greedy word-wrapping with hard-breaks for overlong words. ALL-CAPS lines are preserved as intentional shouting, and non-Latin lines are left untouched. Every transformation is logged with before and after.',
    },
    {
      question: 'How does the clean up auto captions work?',
      answer:
        'Enter your details using the inputs above and the clean up auto captions calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the clean up auto captions free to use?',
      answer:
        'Yes - this clean up auto captions is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a clean up auto captions?',
      answer:
        'A clean up auto captions is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Rule-based cleanup only — it cannot understand context, sarcasm, or domain terms; always review the change log.',
    'Sentence-casing lowercases proper nouns (names, brands) — restore them after cleanup.',
    'Filler removal targets standalone tokens only; fillers inside other words or in parentheses are kept.',
    'Non-Latin-majority lines are left completely untouched by every rule.',
    'The change log is capped at 200 entries; transformations still apply beyond the cap.',
  ],
  jsonLd: [],
};
