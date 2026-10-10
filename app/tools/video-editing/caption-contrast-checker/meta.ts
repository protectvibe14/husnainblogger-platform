import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'textColor',
    label: 'Text color (hex)',
    type: 'text',
    required: true,
    placeholder: 'e.g. #FFFFFF',
  },
  {
    id: 'bgColor',
    label: 'Background color (hex) or "none"',
    type: 'text',
    required: true,
    placeholder: 'e.g. #000000 or none',
  },
  {
    id: 'strokeColor',
    label: 'Stroke color (hex, optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. #000000',
  },
  {
    id: 'fontSizePx',
    label: 'Font size (px)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 24',
    validation: { min: 1 },
  },
  {
    id: 'bold',
    label: 'Bold text',
    type: 'boolean',
    required: false,
  },
];

export const outputs: ToolOutput[] = [
  { id: 'contrastRatio', label: 'Contrast ratio', type: 'number' },
  { id: 'wcagVerdict', label: 'WCAG verdict', type: 'text' },
  { id: 'suggestions', label: 'Suggestions', type: 'list' },
];

const DESCRIPTION =
  'Check with this free subtitle contrast checker — enter text and background colors for a WCAG ratio, AA/AAA verdict, and fix tips. Test your colors now.';

export const content: ToolContent = {
  title: 'Subtitle Contrast Checker',
  description: DESCRIPTION,
  howTo: [
    'Enter your caption text color as a hex value, e.g. #FFFFFF.',
    'Enter the background color as hex, or type "none" if your captions sit directly on video with a transparent background.',
    'Optionally add a stroke color — the tool checks text-vs-stroke and stroke-vs-background separately.',
    'Enter the caption font size in pixels and tick "bold" if the text is bold.',
    'Read the contrast ratio, the WCAG verdict (fail, AA, or AAA), and the suggestions for fixing weak pairs.',
  ],
  methodology:
    'The tool computes the WCAG 2.x contrast ratio: relative luminance L = 0.2126R + 0.7152G + 0.0722B (sRGB-linearized), ratio = (Llighter + 0.05) / (Ldarker + 0.05). Text counts as "large" at 24px or more, or 19px+ when bold. The verdict bars are AA 4.5:1 (3:1 for large text) and AAA 7:1 (4.5:1 for large text). If the background is "none" (transparent over video), no ratio can be guaranteed — the tool reports the worse of the ratios against pure black and pure white frames as a worst-case advisory estimate. This checks color pairs you type; it does not sample video frames.',
  examples: [
    {
      title: 'Classic white on black',
      inputs: { textColor: '#FFFFFF', bgColor: '#000000', fontSizePx: 24, bold: false },
      note: 'Maximum 21:1 ratio — comfortably AAA for any text size.',
    },
    {
      title: 'Transparent captions with stroke',
      inputs: { textColor: '#FFFFFF', bgColor: 'none', strokeColor: '#000000', fontSizePx: 28, bold: true },
      note: 'Worst-case advisory ratio plus a separate stroke check, since the background is moving video.',
    },
  ],
  faqs: [
    {
      question: 'What is the best subtitle contrast checker?',
      answer:
        'The best checker uses the published WCAG contrast formula and handles the transparent-background case honestly. This free tool computes the exact WCAG 2.x ratio for your color pair and, for transparent captions, reports a worst-case advisory estimate instead of pretending it can guarantee readability over video.',
    },
    {
      question: 'Is there a free subtitle contrast checker?',
      answer:
        'Yes — this subtitle contrast checker is completely free with no signup. Enter your text color, background color (or "none" for transparent), and font size to get the ratio, the AA/AAA verdict, and fix suggestions.',
    },
    {
      question: 'How to check subtitle contrast?',
      answer:
        'Type your caption text color and background color as hex values, add the font size, and run the check. Aim for at least 4.5:1 (or 3:1 for large bold captions) — the tool tells you exactly where your pair lands and how to fix it.',
    },
    {
      question: 'How does a subtitle contrast checker work?',
      answer:
        'This one applies the WCAG relative-luminance formula to the two colors you enter and compares the result to the AA/AAA bars for your text size. It checks color pairs only — it cannot see your video, so for transparent backgrounds it reports a worst-case estimate against black and white frames and labels it advisory.',
    },
    {
      question: 'How does the subtitle contrast checker work?',
      answer:
        'Enter your details using the inputs above and the subtitle contrast checker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the subtitle contrast checker free to use?',
      answer:
        'Yes - this subtitle contrast checker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a subtitle contrast checker?',
      answer:
        'A subtitle contrast checker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Checks text/background color pairs you provide — it does NOT sample video frames and cannot measure your rendered captions.',
    'A "none" (transparent) background has no single contrast ratio; the reported number is a worst-case advisory estimate, not a guarantee.',
    'Ratios are WCAG 2.x math estimates on the colors typed; always preview captions on real footage.',
  ],
  jsonLd: [],
};
