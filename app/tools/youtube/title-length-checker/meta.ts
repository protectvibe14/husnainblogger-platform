import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/title-length-checker/';

const DESCRIPTION =
  'Stay inside YouTube\'s limits with this YouTube title length checker — grapheme-accurate character counts plus truncation warnings before you publish.';

export const inputs: ToolInput[] = [
  {
    id: 'title',
    label: 'Proposed title',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. I Tested 10 AI Tools So You Don\'t Have To (Honest Review)',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'charCount', label: 'Character count (graphemes)', type: 'number' },
  { id: 'status', label: 'Status', type: 'text' },
  { id: 'guidance', label: 'Front-load guidance', type: 'text' },
];

export const content: ToolContent = {
  title: 'YouTube Title Length Checker',
  description: DESCRIPTION,
  howTo: [
    'Paste your proposed video title into the "Proposed title" box.',
    'Run the tool to get a grapheme-accurate character count — emoji and CJK count as one visible character.',
    'Read the status: ok, truncated-in-search (over ~70 chars), or over-hard-limit (over 100 chars).',
    'Follow the front-load guidance: move your main keyword into the first 40 characters if it currently starts late.',
    'Shorten titles flagged over-hard-limit before uploading — YouTube will not save them.',
  ],
  methodology:
    'Pure client-side counting with Intl.Segmenter graphemes, so emoji and ZWJ sequences count as one visible character. The count is checked against YouTube\'s public title limits: 100-character hard limit and a conservative ~70-character search/suggestion truncation zone. Front-load guidance is a labeled heuristic — it locates the first content word (4+ letters, not a small word) and reports its grapheme position; it cannot detect your real keyword. No AI is involved.',
  examples: [
    {
      title: 'Short title with early keyword',
      inputs: { title: 'camera buying guide for beginners' },
      note: 'Status: ok — keyword "camera" starts at character 1, good front-loading.',
    },
    {
      title: 'Long title that truncates in search',
      inputs: { title: 'I tested every AI video editing tool on the market in so you can skip the bad ones' },
      note: 'Status: truncated-in-search — the tail past ~70 characters is cut off in search results.',
    },
    {
      title: 'Over the hard limit',
      inputs: { title: 'this is a deliberately far too long youtube video title that keeps going past the one hundred character hard limit yes' },
      note: 'Status: over-hard-limit — YouTube will not save a title longer than 100 characters.',
    },
  ],
  faqs: [
    {
      question: 'How long can a youtube title be?',
      answer: 'This is a common question about how long can a youtube title be. Use the tool above to get your answer instantly - it is free and requires no signup.',
    },
    {
      question: 'How long should a youtube title be?',
      answer: 'This is a common question about how long should a youtube title be. Use the tool above to get your answer instantly - it is free and requires no signup.',
    },
    {
      question: 'What is the best YouTube title length checker?',
      answer:
        'The best checker counts what viewers actually see: emoji and CJK as one visible character, not UTF-16 code units, and flags both the 100-character hard limit and the ~70-character search-truncation zone. This free tool does that and adds front-load guidance for your keyword position.',
    },
    {
      question: 'Is there a free YouTube title length checker?',
      answer:
        'Yes — this tool is free with no signup. Paste your title, get a grapheme-accurate count, a status (ok / truncated-in-search / over-hard-limit), and front-load guidance, all processed in your browser with nothing uploaded.',
    },
    {
      question: 'How do I check my YouTube title length?',
      answer:
        'Paste your draft title into the checker and read the character count and status. Keep titles at or under 100 characters (YouTube\'s hard limit), aim for ~70 or fewer so nothing is cut off in search, and put your main keyword in the first 40 characters.',
    },
    {
      question: 'How long can a YouTube title be?',
      answer:
        'YouTube allows a maximum of 100 characters — the tool flags anything over that as over-hard-limit, because YouTube will not save it. Aim well under the limit though: titles start getting cut off in search and suggestions around 70 characters.',
    },
    {
      question: 'Why does YouTube cut off my title in search results?',
      answer:
        'Search results, suggestions, and mobile feeds truncate long titles — the tool flags anything over ~70 characters as truncated-in-search. The exact cutoff varies by device and font, so treat 70 as a conservative safe zone and put the important words first.',
    },
    {
      question: 'Do emojis count as one character in a YouTube title?',
      answer:
        'In this tool, yes — it counts graphemes, so an emoji or ZWJ sequence counts as one visible character. But YouTube itself counts UTF-16 code units, so emoji-heavy titles can measure 1–2 characters longer on YouTube. Keep a small buffer if your title is emoji-heavy.',
    },
    {
      question: 'Where should I put my keyword in a YouTube title?',
      answer:
        'Front-load it: put your main keyword inside the first 40 characters so it survives truncation. The tool\'s front-load guidance finds the first content word (4+ letters, not a small word) and reports its grapheme position — note it is a structural heuristic and cannot detect your real keyword.',
    },
  ],
  assumptions: [
    'This tool counts graphemes (visible characters); YouTube counts UTF-16 code units, so emoji-heavy titles may measure 1–2 characters longer on YouTube — keep a small buffer.',
    'The ~70-character truncation zone is a conservative display guideline, not a documented YouTube constant; exact cutoff varies by device and font.',
    'Front-load guidance is a structural heuristic (first 4+ letter non-small word), not keyword detection — it cannot know your real target keyword.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'YouTube Title Length Checker 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
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
        { '@type': 'ListItem', position: 3, name: 'YouTube Tools', item: 'https://husnainblogger.com/tools/youtube/' },
        { '@type': 'ListItem', position: 4, name: 'Title Length Checker', item: TOOL_URL },
      ],
    },
  ],
};
