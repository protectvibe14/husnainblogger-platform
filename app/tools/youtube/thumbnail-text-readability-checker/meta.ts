import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/thumbnail-text-readability-checker/';

const DESCRIPTION =
  'Make text pop at any size with this thumbnail text readability checker — contrast, font size, and word-count checks tuned for small screens.';

export const inputs: ToolInput[] = [
  {
    id: 'text',
    label: 'Thumbnail text',
    type: 'text',
    required: true,
    placeholder: 'e.g. I QUIT MY JOB',
  },
  {
    id: 'textColor',
    label: 'Text color (hex)',
    type: 'text',
    required: true,
    placeholder: '#FFFFFF',
  },
  {
    id: 'backgroundColor',
    label: 'Background color (hex)',
    type: 'text',
    required: true,
    placeholder: '#000000',
  },
  {
    id: 'textSize',
    label: 'Text size class',
    type: 'select',
    required: false,
    options: ['small', 'medium', 'large'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'contrastRatio', label: 'Contrast ratio', type: 'number' },
  { id: 'wcagVerdict', label: 'WCAG verdict', type: 'text' },
  { id: 'wordVerdict', label: 'Word-count verdict', type: 'text' },
  { id: 'mobileVerdict', label: 'Mobile legibility verdict', type: 'text' },
];

export const content: ToolContent = {
  title: 'Thumbnail Text Readability Checker',
  description: DESCRIPTION,
  howTo: [
    'Type the exact text on your thumbnail into the "Thumbnail text" box.',
    'Enter the text color and background color as hex values (e.g. #FFFFFF on #000000).',
    'Pick the text size class that matches your thumbnail: small, medium, or large.',
    'Run the tool to get the exact WCAG contrast ratio, a pass/fail verdict, and word-count guidance (3 ideal, 5 max).',
    'Read the mobile legibility verdict — a labeled heuristic, not a device test — and adjust colors or trim words if it flags issues.',
  ],
  methodology:
    'Exact WCAG 2.x math, no AI: relative luminance is computed from the sRGB values of the two hex colors you enter, and the contrast ratio is (L1 + 0.05) / (L2 + 0.05), rounded to 2 decimals. The ratio is banded as AAA (7:1+), AA pass (4.5:1+), AA large-text only (3:1–4.5), or fail (below 3:1). Word count is checked against the 3-ideal / 5-max thumbnail guideline. The mobile verdict is a labeled heuristic combining contrast below 4.5:1, more than 5 words, and character length beyond the size-class threshold (small 20, medium 30, large 45 graphemes).',
  examples: [
    {
      title: 'High-contrast classic',
      inputs: { text: 'I QUIT MY JOB', textColor: '#FFFFFF', backgroundColor: '#000000', textSize: 'large' },
      note: 'Contrast ratio 21:1 — WCAG AAA, likely readable on mobile.',
    },
    {
      title: 'Low-contrast fail',
      inputs: { text: 'new video', textColor: '#999999', backgroundColor: '#FFFFFF', textSize: 'medium' },
      note: 'Contrast ratio ~2.85:1 — fails WCAG; pick colors further apart.',
    },
    {
      title: 'Wordy thumbnail',
      inputs: { text: 'everything you need to know about cameras in 2026', textColor: '#FFFF00', backgroundColor: '#0000FF', textSize: 'small' },
      note: 'Contrast passes, but 9 words triggers the too-wordy verdict and the mobile heuristic.',
    },
  ],
  faqs: [
    {
      question: 'How to make the best thumbnail for youtube?',
      answer: 'This is a common question about how to make the best thumbnail for youtube. Use the tool above to get your answer instantly - it is free and requires no signup.',
    },
    {
      question: 'what is the best thumbnail text readability checker?',
      answer:
        'The best checker does exact contrast math (not a guess): the WCAG contrast ratio between your text and background colors, plus word-count guidance and a mobile legibility estimate. This free tool computes the real ratio and bands it against WCAG AA/AAA thresholds.',
    },
    {
      question: 'is there a free thumbnail text readability checker?',
      answer:
        'Yes — this tool is free with no signup. Enter your thumbnail text and two hex colors, pick a size class, and get the exact contrast ratio, WCAG verdict, word-count verdict, and a mobile legibility heuristic, all computed in your browser.',
    },
    {
      question: 'how to check thumbnail text readability?',
      answer:
        'Enter your exact thumbnail text and the hex colors of the text and background, then read the contrast ratio: 4.5:1 or higher passes WCAG AA, 3:1–4.5 works only for large bold text, and below 3:1 is hard to read. Keep the text to 3–5 words so it stays legible on phone screens.',
    },
    {
      question: 'how does a thumbnail text readability checker work?',
      answer:
        'It computes the WCAG contrast ratio — (L1 + 0.05) / (L2 + 0.05) from the relative luminance of your two colors — and bands the result against WCAG thresholds. This tool adds word-count guidance (3 ideal, 5 max) and a labeled mobile heuristic. It analyzes the colors you enter, not an uploaded image: gradients, photos, outlines, and shadows are not modeled.',
    },
    {
      question: 'How does the thumbnail text readability checker work?',
      answer:
        'Enter your details using the inputs above and the thumbnail text readability checker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the thumbnail text readability checker free to use?',
      answer:
        'Yes - this thumbnail text readability checker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a thumbnail text readability checker?',
      answer:
        'A thumbnail text readability checker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'This tool does exact math on the flat colors you enter — it cannot analyze an uploaded thumbnail image\'s pixels; a canvas-based pixel-sampling variant is out of scope.',
    'Gradients, photos, text outlines, and drop shadows are not modeled — verdicts assume flat text on a flat background.',
    'The mobile legibility verdict is a labeled heuristic (contrast + word count + length), not a test on a real device.',
    'Hex colors must be 3 or 6 hex digits with an optional #; named colors like "red" are rejected.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Thumbnail Text Readability Checker 2026 | HusnainBlogger',
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
        { '@type': 'ListItem', position: 4, name: 'Thumbnail Text Readability Checker', item: TOOL_URL },
      ],
    },
  ],
};
