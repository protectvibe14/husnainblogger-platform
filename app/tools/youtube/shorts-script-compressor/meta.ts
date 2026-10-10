import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/shorts-script-compressor/';

const DESCRIPTION =
  'Trim a youtube shorts script template draft to fit your target seconds — paste your script and get a word-budget cut with a kept/dropped list. Try it free.';

export const inputs: ToolInput[] = [
  {
    id: 'scriptText',
    label: 'Long-form script or outline',
    type: 'textarea',
    required: true,
    placeholder: 'Paste your full script or outline here…',
  },
  {
    id: 'targetSeconds',
    label: 'Target length (seconds)',
    type: 'number',
    required: false,
    placeholder: '45',
    validation: { min: 5, max: 180 },
  },
  {
    id: 'wpm',
    label: 'Speaking pace (words per minute)',
    type: 'number',
    required: false,
    placeholder: '150',
    validation: { min: 80, max: 220 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'compressedScript', label: 'Compressed script', type: 'copy' },
  { id: 'wordCount', label: 'Word count', type: 'number' },
  { id: 'estimatedSeconds', label: 'Estimated seconds', type: 'number' },
  { id: 'cutList', label: 'Kept / dropped sentences', type: 'list' },
  { id: 'note', label: 'Fit note', type: 'text' },
];

export const content: ToolContent = {
  title: 'Youtube Shorts Script Template',
  description: DESCRIPTION,
  howTo: [
    'Paste your long-form script or outline into the script box.',
    'Set the target length in seconds (5–180; defaults to 45).',
    'Optionally set your speaking pace in words per minute (80–220; defaults to 150).',
    'Run the compressor: the first sentence is kept as the hook, and the remaining sentences are ranked by topic-keyword frequency until the word budget is full.',
    'Read the kept/dropped list to see why each sentence survived, then speak-test the result and trim any line that feels rushed.',
  ],
  methodology:
    'Rule-based extraction, not AI and not semantic summarization. The text is split into sentences; the 12 most frequent non-stopword words become the topic keywords; each sentence is scored by keyword hits. The first sentence is always kept as the hook, then sentences are added by score (highest first) while the running total plus the fixed "Follow for more." CTA stays within floor(targetSeconds / 60 × wpm) words. The cut list shows every sentence with its keep/drop reason, and the note states the method honestly. If your script already fits the budget, it is returned unchanged with a note.',
  examples: [
    {
      title: '45-second lighting tip',
      inputs: {
        scriptText:
          'Most beginners waste money on camera gear. The truth is that lighting matters more than your camera. Good lighting makes a cheap camera look expensive. Start with a window and a cheap LED panel for lighting.',
        targetSeconds: 45,
        wpm: 150,
      },
      note: 'Fits the 112-word budget, so it is returned unchanged with a fit note.',
    },
    {
      title: 'Short script stays untouched',
      inputs: {
        scriptText: 'Drink more water every single day.',
        targetSeconds: 45,
        wpm: 150,
      },
      note: 'Already under budget — returned as-is with a note.',
    },
  ],
  faqs: [
    {
      question: 'What is the best youtube shorts script template?',
      answer:
        'A good template has three fixed parts: a hook in the first line, one idea per sentence in the middle, and a short call to action. This tool enforces that shape on your draft — it keeps your opening line as the hook, ranks the rest by keyword density, and appends "Follow for more." so the result fits your target seconds.',
    },
    {
      question: 'Is there a free youtube shorts script template?',
      answer:
        'Yes — this compressor is completely free with no signup. Paste your script, set your target seconds and speaking pace, and you get a word-budget cut plus a kept/dropped sentence list you can refine.',
    },
    {
      question: 'How to use youtube shorts?',
      answer:
        'Film vertically, keep it under 60 seconds, open with the payoff or a bold claim, and end with a call to action. Before filming, compress your script to the word budget for your target length: at 150 words per minute, a 45-second Short holds about 112 spoken words.',
    },
    {
      question: 'How does a youtube shorts script template work?',
      answer:
        'You paste a draft and set target seconds and words per minute. The tool computes a word budget, keeps your first sentence as the hook, then fills the budget with your most keyword-dense sentences and appends a fixed CTA. Every keep/drop decision is shown in the cut list with its reason — keyword counting, not AI summarization.',
    },
    {
      question: 'How does the youtube shorts script template work?',
      answer:
        'Enter your details using the inputs above and the youtube shorts script template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube shorts script template free to use?',
      answer:
        'Yes - this youtube shorts script template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube shorts script template?',
      answer:
        'A youtube shorts script template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Rule-based extraction only: sentences are ranked by keyword frequency, so a beautifully written line can be dropped if it repeats few topic words — use the cut list, not blind trust.',
    'The 150 WPM default is an estimate; fast talkers fit more words per second, slow talkers fewer — adjust the pace input to your delivery.',
    'Estimated seconds assume a steady speaking pace with no pauses, b-roll beats, or on-screen text pauses.',
    'Topic keywords are the 12 most frequent content words in your text; in a very short or repetitive draft they may be uninformative.',
  ],
  jsonLd: [],
};
