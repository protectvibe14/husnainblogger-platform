import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'keyword',
    label: 'Target keyword or phrase',
    type: 'text',
    required: true,
    placeholder: 'e.g. sourdough bread recipe',
  },
  {
    id: 'title',
    label: 'Video title',
    type: 'text',
    required: true,
    placeholder: 'e.g. Sourdough Bread Recipe for Beginners',
  },
  {
    id: 'wordBoundary',
    label: 'Match whole words only',
    type: 'boolean',
    required: false,
  },
];

export const outputs: ToolOutput[] = [
  { id: 'match', label: 'Match', type: 'text' },
  { id: 'position', label: 'Position (front/middle/end)', type: 'text' },
  { id: 'matchDetails', label: 'Match details', type: 'text' },
  { id: 'recommendation', label: 'Front-loading recommendation', type: 'text' },
];

const DESCRIPTION =
  'Check keyword placement with this free YouTube keyword in title checker — match verdict, position, and front-loading tips. No signup, try it now.';

export const content: ToolContent = {
  title: 'YouTube Keyword in Title Checker 2027',
  description: DESCRIPTION,
  howTo: [
    'Type your target keyword or phrase into the keyword field.',
    'Paste the full video title into the title field.',
    'Turn on "Match whole words only" if you want to avoid partial matches (e.g. "cat" in "concatenate").',
    'Run the check — you get a yes/no match, the keyword position (front, middle, or end), and a recommendation.',
    'If the keyword is missing or buried at the end, rewrite the title so it appears near the start.',
  ],
  methodology:
    'A deterministic string check: the title and keyword are lowercased and compared with a substring search, or — in word-boundary mode — both are tokenized with a Unicode word segmenter and the keyword\'s token sequence must appear consecutively. Position is front when the match starts at character 1, end when it runs to the last character, and middle otherwise. No ranking data or SEO prediction is involved.',
  examples: [
    {
      title: 'Front-loaded keyword',
      inputs: { keyword: 'sourdough', title: 'Sourdough Bread Masterclass' },
      note: 'Match: Yes, position: front — the recommendation confirms good placement.',
    },
    {
      title: 'Buried keyword',
      inputs: { keyword: 'beginners', title: 'Cake decorating for beginners' },
      note: 'Match: Yes, position: end — the recommendation suggests moving it toward the start.',
    },
  ],
  faqs: [
    {
      question: 'What is the best YouTube keyword in title checker?',
      answer:
        'The most reliable check is a direct string comparison — which is exactly what this free tool does. It reports whether your exact keyword appears in the title, where it sits (front, middle, or end), and whether you should front-load it. No signup or data leaves your browser.',
    },
    {
      question: 'Is there a free YouTube keyword in title checker?',
      answer:
        'Yes — this checker is completely free with no signup. It runs entirely in your browser using a deterministic match, so it never costs you anything or sends your titles anywhere.',
    },
    {
      question: 'How to check YouTube keyword in title?',
      answer:
        'Enter your target keyword and your full video title above, then run the check. You get a yes/no verdict, the keyword\'s position in the title, and a front-loading recommendation. Rewrite and re-check until the keyword sits near the start.',
    },
    {
      question: 'How does a YouTube keyword in title checker work?',
      answer:
        'This one lowercases both the keyword and the title and searches for the keyword as a substring — or, in whole-word mode, as a consecutive token sequence using Unicode word segmentation. Position is classified as front, middle, or end, and a fixed recommendation follows. It is pure string math, not an SEO ranking prediction.',
    },
    {
      question: 'How does the youtube keyword in title checker work?',
      answer:
        'Enter your details using the inputs above and the youtube keyword in title checker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube keyword in title checker free to use?',
      answer:
        'Yes - this youtube keyword in title checker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube keyword in title checker?',
      answer:
        'A youtube keyword in title checker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Case folding uses JavaScript toLowerCase — locale-specific rules (e.g. Turkish dotted-I) are not handled.',
    'Substring mode can match inside other words; enable whole-word mode to avoid that.',
    'The tool checks keyword presence only; it says nothing about search volume, competition, or ranking.',
    'Front-loading advice is a widely used best practice, not a guarantee of better performance.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'YouTube Keyword in Title Checker 2026 | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/youtube/keyword-in-title-checker/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: DESCRIPTION,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'YouTube Tools',
          item: 'https://husnainblogger.com/tools/youtube/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Keyword-in-Title Checker',
          item: 'https://husnainblogger.com/tools/youtube/keyword-in-title-checker/',
        },
      ],
    },
  ],
};
