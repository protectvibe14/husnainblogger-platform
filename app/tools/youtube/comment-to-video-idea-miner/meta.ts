import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'commentsText',
    label: 'Pasted comments',
    type: 'textarea',
    required: true,
    placeholder: 'Paste viewer comments here — one per line works best. Questions and "can you make a video about..." requests become idea cards.',
    validation: { max: 20000 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'ideas', label: 'Video idea cards', type: 'list' },
  { id: 'ideaCount', label: 'Ideas found', type: 'number' },
  { id: 'summary', label: 'Summary', type: 'text' },
];

const DESCRIPTION =
  'Turn comments into video ideas with this free tool — paste audience comments to mine questions and requests into sourced idea cards. Mine your comments now!';

export const content: ToolContent = {
  title: 'Turn Comments Into Video Ideas',
  description: DESCRIPTION,
  howTo: [
    'Copy comments from your videos (questions, requests, and suggestions) and paste them into the text box — one comment per line works best.',
    'Run the tool. It scans for question marks, "can you make a video"-style requests, and "how do I" hints.',
    'Read the idea cards: each card rephrases the comment as a video idea and quotes its source comment.',
    'Duplicate comments are merged so each idea appears once, with the first source kept.',
    'Pick the strongest cards and script them — the source quotes tell you exactly what the audience asked for.',
  ],
  methodology:
    'Rule-based pattern extraction over your pasted text only: sentences ending in "?" (3–200 chars) become questions, sentences matching request patterns ("can you make", "tutorial on", "part 2") become requests, and "how do I"-style sentences without question marks become howto candidates. Identical sentences dedupe case-insensitively; output caps at 25 ideas in paste order. No YouTube API, no automated scraping, no sentiment analysis — it never sees anything you do not paste.',
  examples: [
    {
      title: 'Sourdough comments',
      inputs: { commentsText: 'Can you make a video about sourdough discard recipes?\nHow do I keep my starter alive in winter?\nLove this video!' },
      note: 'Two idea cards mined: one request and one question; the praise comment is skipped.',
    },
    {
      title: 'Repeat requests',
      inputs: { commentsText: 'part 2 please\npart 2 please\nWHAT ABOUT MEAL PREP?' },
      note: 'The duplicate "part 2" request is merged into a single card; the caps question becomes its own card.',
    },
  ],
  faqs: [
    {
      question: 'what is the best turn comments into video ideas?',
      answer:
        'Your own audience is the best source: questions and requests in your comments are pre-validated video topics. This free tool pastes them through rule-based pattern matching to turn questions, "can you make a video about..." requests, and "how do I" hints into idea cards, each quoting its source comment.',
    },
    {
      question: 'is there a free turn comments into video ideas?',
      answer:
        'Yes — this comment miner is completely free with no signup. Paste up to 20,000 characters of comments and get up to 25 idea cards with source quotes. It works on pasted text only and never scrapes YouTube automatically.',
    },
    {
      question: 'how to use turn comments into video?',
      answer:
        'Paste your viewer comments into the tool above and run it. Each detected question or request becomes an idea card with its source quote — pick the strongest, check that the question is worth a full video, and script it. Reply to the original comment when the video goes live to drive early views.',
    },
    {
      question: 'how does a turn comments into video ideas work?',
      answer:
        'This one is honest pattern extraction, not AI: it splits your pasted text into sentences and flags question marks, request phrases like "can you make a video about", and "how do I" hints. Matches are rephrased as video-idea cards with their source comment quoted. Duplicates merge; plain praise is skipped. It cannot fetch comments itself — you must paste them.',
    },
    {
      question: 'How does the turn comments into video ideas work?',
      answer:
        'Enter your details using the inputs above and the turn comments into video ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the turn comments into video ideas free to use?',
      answer:
        'Yes - this turn comments into video ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a turn comments into video ideas?',
      answer:
        'A turn comments into video ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Paste-only by design: the tool never scrapes YouTube or calls any API (automated comment scraping violates YouTube\'s ToS).',
    'Pattern extraction, not AI: questions are found by "?" and request phrases, so sarcasm, slang, or typos may be missed or misclassified.',
    'Sentences longer than 200 characters are skipped as rants; output caps at 25 ideas per run.',
    'Only English-language patterns are detected; comments in other languages are likely skipped.',
  ],
  jsonLd: [],
};
