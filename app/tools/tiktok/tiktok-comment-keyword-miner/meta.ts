import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-comment-keyword-miner/';

export const inputs: ToolInput[] = [
  {
    id: 'pastedComments',
    label: 'Comments (one per line)',
    type: 'textarea',
    required: true,
    placeholder: 'Paste TikTok comments here, one per line — copy them from the TikTok app',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'topWords',
    label: 'Word-frequency table',
    type: 'table',
    description:
    'Free tiktok comment analysis 2026: Top 15 words with counts and share of all meaningful words. free.',
  },
  {
    id: 'topPhrases',
    label: 'Top phrases',
    type: 'list',
    description:
    'Repeated two- and three-word phrases (minimum 2 occurrences).',
  },
  {
    id: 'ideaSeeds',
    label: 'Content-idea seeds',
    type: 'list',
    description:
    'Video ideas built from your most frequent terms.',
  },
  {
    id: 'summary',
    label: 'Analysis summary',
    type: 'text',
    description:
    'Comment count, top term, top emojis, and confidence notes.',
  },
];

export const content: ToolContent = {
  title: 'TikTok Comment Analysis',
  description:
    'Run free tiktok comment analysis: paste your comments and get word-frequency tables, top phrases, and content-idea seeds from real terms. Analyze now.',
  howTo: [
    'Copy comments from the TikTok app and paste them into "Comments (one per line)" — one comment per line.',
    'Run the tool to get the word-frequency table, top phrases, and content-idea seeds.',
    'Read the "Word-frequency table" for what your audience keeps saying — counts and share % included.',
    'Check "Top phrases" for repeated two- and three-word questions and requests.',
    'Pick a "Content-idea seed" and film it — each seed is built from one of your most frequent terms.',
  ],
  methodology:
    'Each line is stripped of URLs and @handles, then tokenized (Unicode letters/numbers, minimum 3 characters) with 72 fixed stopwords removed; emojis are counted separately as sentiment tokens. Words are ranked by frequency (alphabetical tiebreak), phrases need at least 2 occurrences, and idea seeds plug the top 5 words into 5 fixed templates. Fewer than 5 comments triggers a low-confidence warning. No AI, no TikTok API — it cannot scrape comments; it only analyzes what you paste.',
  examples: [
    {
      title: 'Recipe video comments',
      inputs: {
        pastedComments: 'this recipe is amazing\nwhere did you get the recipe book?\nrecipe please!!\ncan you share the full recipe video?',
      },
      note: '"recipe" tops the table, and every idea seed is built around it.',
    },
    {
      title: 'Small sample with emojis',
      inputs: { pastedComments: 'the plating is gorgeous 🔥🔥\n🔥🔥🔥 best plating ever' },
      note: 'Runs with a low-confidence warning; top emojis are reported as sentiment tokens.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok comment analysis?',
      answer:
        'The best analysis counts what your audience actually repeats: word frequencies, recurring phrases, and the emojis they use. This free tool does exactly that from comments you paste — no signup, with counts and share percentages for every term.',
    },
    {
      question: 'Is there a free tiktok comment analysis?',
      answer:
        'Yes — this TikTok comment keyword miner is completely free with no signup. Paste your comments (one per line) and get a word-frequency table, top phrases, and content-idea seeds derived from your real terms.',
    },
    {
      question: 'How to use tiktok comment analysis?',
      answer:
        'Copy comments from the TikTok app, paste them one per line, and run the tool. Use the top words to spot what your audience wants more of, the top phrases to find their exact questions, and the idea seeds as your next video topics.',
    },
    {
      question: 'How does a tiktok comment analysis work?',
      answer:
        'It strips URLs and @handles from each pasted line, tokenizes the text, removes 72 fixed stopwords, and ranks words and phrases by frequency. It cannot scrape TikTok directly — you paste the comments in — and samples under 5 comments get a low-confidence warning.',
    },
    {
      question: 'How does the tiktok comment analysis work?',
      answer:
        'Enter your details using the inputs above and the tiktok comment analysis calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok comment analysis free to use?',
      answer:
        'Yes - this tiktok comment analysis is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok comment analysis?',
      answer:
        'A tiktok comment analysis is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Paste-only: the tool cannot read your TikTok comments directly and never accesses your account.',
    'Fewer than 5 comments is a low-confidence sample — trends are hints, not proof.',
    'The 72-word stopword list is fixed; niche slang may be filtered or kept depending on the list.',
    'Idea seeds are fixed templates filled with frequent terms — suggestions, not guaranteed video ideas.',
  ],
  jsonLd: [
  ],
};
