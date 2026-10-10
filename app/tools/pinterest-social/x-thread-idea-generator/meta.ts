import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/x-thread-idea-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Thread topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. freelance copywriting',
    validation: { max: 140 },
  },
  {
    id: 'tweetCount',
    label: 'Number of tweets',
    type: 'number',
    required: false,
    placeholder: '7',
    validation: { min: 2, max: 25 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'thread',
    label: 'Thread outline',
    type: 'list',
    description:
    'Free twitter thread ideas 2026: Your thread: tweet 1 is a standalone hook, the middle tweets are points, the last tweet. Fast, private now.',
  },
  {
    id: 'note',
    label: 'Notes',
    type: 'text',
    description:
    'How the outline was built and any adjustments (e.g. count capped or reduced).',
  },
];

export const content: ToolContent = {
  title: 'Twitter Thread Ideas',
  description:
    'Outline threads worth reading to the end: enter any topic for a strong hook, supporting points, and CTA structured within the character budget.',
  howTo: [
    'Type your thread topic into the "Thread topic" field (keep it under 140 characters).',
    'Set "Number of tweets" between 2 and 25 (leave it blank for the default of 7).',
    'Run the tool to get your thread outline: a hook, supporting points, and a closing CTA.',
    'Copy each tweet, rewrite in your own voice where needed, and post them as a thread on X.',
    'If the topic was short or the count high, check the "Notes" — the tool may have adjusted the length.',
  ],
  methodology:
    'This tool assembles your thread from a fixed bank of 30 hand-written templates (10 hooks, 12 points, 8 CTAs) with your topic inserted — no AI is involved. The template for each position is picked deterministically from your inputs. Every tweet is checked against a conservative 280 weighted-character budget (URLs count 23, non-ASCII characters count 2); over-budget text is trimmed at a word boundary and reported.',
  examples: [
    {
      title: 'Beginner guide thread',
      inputs: { topic: 'freelance copywriting', tweetCount: 7 },
      note: 'Returns a 7-tweet outline: standalone hook, 5 points, and a CTA — all within the character budget.',
    },
    {
      title: 'Short punchy thread',
      inputs: { topic: 'morning routines', tweetCount: 4 },
      note: 'Returns a 4-tweet outline with the same hook → points → CTA structure.',
    },
  ],
  faqs: [
    {
      question: 'What is the best twitter thread ideas?',
      answer:
        'The best twitter thread ideas give you a structure, not just a topic: a standalone hook that earns the click, supporting points that deliver value, and a final tweet with a call to action. This free generator builds exactly that outline from a fixed bank of 30 hand-written templates — no AI, no filler.',
    },
    {
      question: 'Is there a free twitter thread ideas?',
      answer:
        'Yes — this twitter thread ideas generator is completely free with no signup. Enter a topic and a tweet count (2–25) and get a full hook-to-CTA thread outline, as many times as you like.',
    },
    {
      question: 'How to use twitter thread?',
      answer:
        'Enter your topic and tweet count, run the tool, then copy each generated tweet in order and post them as a reply chain on X — tweet 1 is the hook, the middle tweets are the points, and the last tweet carries your call to action. Rewrite lines in your own voice before posting for best results.',
    },
    {
      question: 'How long should a twitter thread be?',
      answer:
        'Most effective threads are 5–10 tweets: long enough to deliver real value, short enough that readers finish. This tool defaults to 7 and caps at 25 with a note, since very long threads rarely get finished — and it reduces the count automatically if your topic is too thin to fill it.',
    },
    {
      question: 'How does the twitter thread ideas work?',
      answer:
        'Enter your details using the inputs above and the twitter thread ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the twitter thread ideas free to use?',
      answer:
        'Yes - this twitter thread ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a twitter thread ideas?',
      answer:
        'A twitter thread ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Threads are assembled from a fixed bank of 30 hand-written templates (10 hooks, 12 points, 8 CTAs) — the tool outlines; it does not write with AI.',
    'The 280 weighted-character budget is a conservative approximation (URLs count 23, non-ASCII characters count 2) — always check the character counter in X before posting.',
    'A tweet count above 25 is capped at 25 with a note, and a very short topic may reduce a long thread to 8 tweets — both are documented in the output notes.',
  ],
  jsonLd: [
  ],
};
