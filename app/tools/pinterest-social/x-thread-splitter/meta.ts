import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/x-thread-splitter/';

export const inputs: ToolInput[] = [
  {
    id: 'longText',
    label: 'Text to split',
    type: 'textarea',
    required: true,
    placeholder: 'Paste your long text, article, or draft here…',
    validation: { max: 20000 },
  },
  {
    id: 'numberingStyle',
    label: 'Numbering style',
    type: 'select',
    required: false,
    options: ['1/N', '(1/N)', 'none'],
  },
  {
    id: 'reserveChars',
    label: 'Characters reserved for numbering',
    type: 'number',
    required: false,
    placeholder: '8',
    validation: { min: 0, max: 40 },
  },
  {
    id: 'maxChars',
    label: 'Max characters per post',
    type: 'number',
    required: false,
    placeholder: '280',
    validation: { min: 50, max: 280 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'tweets',
    label: 'Split posts',
    type: 'list',
    description:
    'Free split text into tweets 2026: Your text split into posts on sentence/word boundaries — never mid-word. Each post fits. Fast, private.',
  },
  {
    id: 'summary',
    label: 'Summary',
    type: 'text',
    description:
    'How many posts were produced and which counting rules were applied.',
  },
];

export const content: ToolContent = {
  title: 'Split Text Into Tweets',
  description:
    'Split long text into tweet-ready posts: paste up to 20,000 characters and get numbered posts with markers, broken cleanly on sentence and word boundaries.',
  howTo: [
    'Paste your long text into the "Text to split" field (up to 20,000 characters).',
    'Pick a "Numbering style": 1/N (e.g. 1/3), (1/N), or none — the marker\u2019s characters are reserved before splitting.',
    'Adjust "Characters reserved for numbering" (default 8) or "Max characters per post" (default 280) if needed.',
    'Run the tool and copy each numbered post in order — every one fits the budget, split on word boundaries.',
    'Paste the posts on X as a reply chain to publish your thread.',
  ],
  methodology:
    'This tool greedily packs your text into posts of at most the per-post limit, breaking first on sentence boundaries and then on word boundaries — never mid-word. The numbering marker\u2019s length is reserved before splitting, then every post is re-validated after the marker is added. It uses a conservative weighted count (URLs count 23, non-ASCII characters count 2); long unbreakable tokens such as URLs are kept whole. No AI or generation is involved — it is pure deterministic splitting.',
  examples: [
    {
      title: 'Split a blog paragraph',
      inputs: { longText: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! The five boxing wizards jump quickly.', numberingStyle: '1/N', reserveChars: 8, maxChars: 280 },
      note: 'Returns numbered posts, each within 280 weighted characters with the marker included.',
    },
    {
      title: 'Split without numbering',
      inputs: { longText: 'First sentence here. Second sentence here. Third sentence here, made a bit longer so it keeps going.', numberingStyle: 'none', maxChars: 140 },
      note: 'Returns unnumbered posts of at most 140 weighted characters each.',
    },
  ],
  faqs: [
    {
      question: 'What is the best split text into tweets?',
      answer:
        'The best way to split text into tweets keeps whole thoughts together: break on sentence boundaries first, then on word boundaries — never mid-word — while reserving room for the 1/N numbering marker. This free splitter does exactly that, and re-validates every post after numbering so nothing overflows.',
    },
    {
      question: 'Is there a free split text into tweets?',
      answer:
        'Yes — this thread splitter is completely free with no signup. Paste up to 20,000 characters, choose a numbering style, and get numbered posts within the 280-character budget, as many times as you like.',
    },
    {
      question: 'How to use split text into tweets?',
      answer:
        'Paste your long text, pick a numbering style (1/N, (1/N), or none), and run the tool. Copy the resulting posts in order and publish them on X as a reply chain — each post already fits the character budget with its marker included.',
    },
    {
      question: 'How does a split text into tweets work?',
      answer:
        'It packs your text into chunks of at most 280 weighted characters (URLs count 23, non-ASCII characters count 2), splitting on sentence and then word boundaries. The numbering marker\u2019s characters are reserved before splitting and verified after, so a post like "… 3/12" never silently exceeds the limit.',
    },
    {
      question: 'What is a split text into tweets?',
      answer:
        'A split text into tweets is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Is this split text into tweets tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
    {
      question: 'How do I use this split text into tweets tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
  ],
  assumptions: [
    'Splitting is purely rule-based and deterministic — no AI or content generation is involved.',
    'The weighted count is a conservative approximation (URLs count 23, non-ASCII characters count 2); the 280 budget is the documented default, not a live check of X\u2019s current rules.',
    'A single unbreakable token longer than the budget (extremely rare; URLs are kept whole at 23) is hard-split rather than dropped — the summary tells you if this happened.',
  ],
  jsonLd: [],
};
