import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/thumbnail-text-shortener/';

const DESCRIPTION =
  'Shorten text for thumbnails with rule-based shortening — paste a long title and get punchy up to 5-word variants plus mobile-size guidance. Try it free now.';

export const inputs: ToolInput[] = [
  {
    id: 'text',
    label: 'Long text or video title',
    type: 'textarea',
    required: true,
    placeholder: 'Paste your video title or thumbnail text — e.g. "How to build a simple website for your business in 2025"',
    validation: { max: 5000 },
  },
  {
    id: 'casing',
    label: 'Casing',
    type: 'select',
    required: false,
    options: [
      'original',
      'title',
      'upper',
    ],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'shortened', label: 'Shortened text', type: 'text' },
  { id: 'variants', label: 'Casing variants', type: 'list' },
  { id: 'wordCount', label: 'Word count', type: 'number' },
  { id: 'guidance', label: 'Mobile-size guidance', type: 'text' },
  { id: 'wasAlreadyShort', label: 'Already short?', type: 'text' },
  { id: 'banks', label: 'Rule bank sizes', type: 'text' },
];

export const content: ToolContent = {
  title: 'Shorten Text for Thumbnails 2026 – Free | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Paste your long video title or thumbnail text into the text box (up to 5,000 characters).',
    'Choose a casing option: keep your original, Title Case, or full UPPERCASE.',
    'Run the tool — stopwords are stripped and the highest-impact words are kept, capped at 5 words.',
    'Pick your favorite from the three casing variants and apply it to your thumbnail design.',
    'Re-check legibility on an actual phone before publishing — the tool reports mobile-size guidance with every result.',
  ],
  methodology:
    'This is deterministic rule-based shortening, not AI copywriting. The engine splits your text into words, removes 64 fixed stopwords ("the", "of", "how", ...), scores the rest (numbers +3, 40 fixed emotion/hook words like "secret" or "never" +2, capitalized words +1), and keeps the top 5 in original order. If 5 or fewer words remain, the text is returned as-is. Casing variants are mechanical text transformations.',
  examples: [
    {
      title: 'Long tutorial title',
      inputs: { text: 'How to build a simple website for your business in 2025', casing: 'original' },
      note: 'Stopwords are stripped and the highest-impact words are kept — numbers and hook words win when trimming to 5 words.',
    },
    {
      title: 'Already short',
      inputs: { text: 'I built a cabin', casing: 'upper' },
      note: 'Short input is returned unchanged apart from the chosen casing — no trimming needed.',
    },
    {
      title: 'Uppercase punch',
      inputs: { text: 'The 7 biggest mistakes new photographers make', casing: 'upper' },
      note: 'Numbers score highest, so "7" is guaranteed a slot in the shortened result.',
    },
  ],
  faqs: [
    {
      question: 'what is the best shorten text for thumbnails?',
      answer:
        'The best thumbnail text is 5 words or fewer, readable at phone size, with one strong hook word or number. This free tool applies fixed shortening rules — stripping filler words and keeping numbers and impact words first — so any long title becomes thumbnail-sized in one step.',
    },
    {
      question: 'is there a free shorten text for thumbnails?',
      answer:
        'Yes — this tool is completely free with no signup. Paste any title or text and get rule-based shortened variants with casing options and mobile-size guidance.',
    },
    {
      question: 'how to use shorten text for thumbnails?',
      answer:
        'Paste your long title into the tool, pick a casing style, and run it. You get a shortened version capped at 5 words plus three casing variants — apply your favorite to the thumbnail and verify it is readable on a phone.',
    },
    {
      question: 'how does a shorten text for thumbnails work?',
      answer:
        'This tool uses deterministic rules, not AI: it removes 64 fixed stopwords, scores the remaining words (numbers and 40 fixed hook words score highest), and keeps the top 5 in original order. Text that is already 5 words or fewer is returned as-is.',
    },
    {
      question: 'How does the shorten text for thumbnails work?',
      answer:
        'Enter your details using the inputs above and the shorten text for thumbnails calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the shorten text for thumbnails free to use?',
      answer:
        'Yes - this shorten text for thumbnails is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a shorten text for thumbnails?',
      answer:
        'A shorten text for thumbnails is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Shortening is rule-based, not AI copywriting — word-choice quality is the user\'s judgment and no performance is promised.',
    'The 5-word cap and mobile-size guidance are fixed readability rules of thumb, not measured legibility data from any device.',
    'Proper nouns and brand names score only +1 for capitalization; the tool does not understand meaning or context.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Shorten Text for Thumbnails 2026 – Free | HusnainBlogger',
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
        { '@type': 'ListItem', position: 4, name: 'Thumbnail Text Shortener', item: TOOL_URL },
      ],
    },
  ],
};
