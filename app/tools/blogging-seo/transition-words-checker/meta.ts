import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/transition-words-checker/';

export const inputs: ToolInput[] = [
  {
    id: 'content',
    label: 'Content to check',
    type: 'textarea',
    required: true,
    placeholder: 'Paste your article or blog post here…',
    validation: { max: 200000 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'transitionCount',
    label: 'Transition words found',
    type: 'number',
    description:
    'Free transition words checker 2026: Total occurrences of transition words/phrases from the fixed 111-phrase English bank. Fast, private now.',
  },
  {
    id: 'density',
    label: 'Density (per 100 words)',
    type: 'number',
    description:
    'Transition words per 100 words of content, rounded to 2 decimals.',
  },
  {
    id: 'matchedWords',
    label: 'Matched words',
    type: 'table',
    description:
    'Each matched transition phrase with its occurrence count (top 50).',
  },
  {
    id: 'verdict',
    label: 'Verdict',
    type: 'text',
    description:
    'Editorial verdict: Low (<1), Moderate (1–3), or Good (>3) transition density.',
  },
];

export const content: ToolContent = {
  title: 'Transition Words Checker',
  description:
    'Check transition word usage with this free transition words checker. Count 111 English phrases, see density per 100 words, and get a verdict.',
  howTo: [
    'Paste your article or blog post into the content box (English text works best).',
    'Run the tool to count transition words against the fixed 111-phrase bank.',
    'Check the density: transitions per 100 words, plus the verdict.',
    'Open the matched-words table to see exactly which phrases you already use.',
    'If the verdict is Low, weave in a few more transitions (however, for example, as a result) and re-run.',
  ],
  methodology:
    'The tool matches content case-insensitively against a fixed bank of 111 English transition words and phrases using word boundaries, longest-phrase-first (so "first of all" counts once, not as "first"). Density is transition occurrences per 100 words. The verdict bands are our own editorial guidance, not a Yoast/Google rule: Low under 1.0, Moderate 1.0–3.0, Good over 3.0. No AI is involved — every match comes from the published bank.',
  examples: [
    {
      title: 'Well-connected paragraph',
      inputs: {
        content:
          'However, this is a test. For example, it works well. In addition, it is fast and reliable.',
      },
      note: 'Three transitions in a short paragraph — expect a Good verdict.',
    },
    {
      title: 'Choppy draft',
      inputs: {
        content:
          'The cat sat on the mat. The dog ran in the yard. The sun was bright. We ate lunch at noon.',
      },
      note: 'No transitions at all — expect a Low verdict with an empty matched table.',
    },
  ],
  faqs: [
    {
      question: 'What is the best transition words checker?',
      answer:
        'The best one is transparent about what it counts: this free tool matches your text against a fixed, published bank of 111 English transition phrases, shows every match with counts, and states its verdict bands openly instead of hiding them.',
    },
    {
      question: 'Is there a free transition words checker?',
      answer:
        'Yes — this transition words checker is completely free with no signup. Paste up to 200,000 characters and get the count, density, matched-words table, and verdict instantly.',
    },
    {
      question: 'How to check transition words?',
      answer:
        'Paste your content into the tool and read the density (transitions per 100 words) and verdict. Under 1.0 is Low — add connectors like however, for example, or as a result between ideas. The matched table shows which phrases you already lean on.',
    },
    {
      question: 'How does a transition words checker work?',
      answer:
        'It scans your text for a fixed list of transition words and phrases — 111 here, matched case-insensitively with word boundaries, longest phrases first — then divides occurrences by word count for a per-100-words density and applies editorial verdict bands. No AI, no guessing.',
    },
    {
      question: 'What is a transition words checker?',
      answer:
        'A transition words checker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The 111-phrase bank is English-only: non-English content will score Low regardless of its actual flow.',
    'Verdict bands (Low <1, Moderate 1–3, Good >3) are our own editorial guidance, not a Yoast or Google rule.',
    'Common words in the bank (also, when, after, still) count as transitions, so conversational writing can score higher than formal writing.',
  ],
  jsonLd: [],
};
