import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/reels-cover-maker/';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'title',
    label: 'Cover title',
    type: 'text',
    required: true,
    placeholder: 'e.g. 5 Budget Dinners (60 characters max)',
  },
  {
    id: 'background',
    label: 'Background',
    type: 'text',
    required: true,
    placeholder: 'e.g. #0A0A0A, sunset, or an https:// image URL',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'covers',
    label: 'Cover specs',
    type: 'list',
    description:
    'Free instagram reels cover maker 2026: One validated cover spec per item: title, resolved background, and 1080x1920 canvas. Fast, private.',
  },
  {
    id: 'safeZoneGuide',
    label: 'Safe-zone guide',
    type: 'list',
    description:
    'The 1080x1920 safe-zone facts the preview uses — keep titles inside the central band.',
  },
  {
    id: 'count',
    label: 'Covers built',
    type: 'number',
    description:
    'How many cover specs were built.',
  },
];

export const content: ToolContent = {
  title: 'Instagram Reels Cover Maker',
  description:
    'Design scroll-stopping covers with this Instagram reels cover maker — 1080x1920 specs, safe-zone guides, and validated cover plans included.',
  howTo: [
    'Add one item per cover and type the "Cover title" (60 characters max — longer titles are rejected).',
    'Set the "Background" as a hex color like #0A0A0A, a named gradient (sunset, ocean, neon, mono, pastel), or an https:// image URL.',
    'Run the tool to validate every cover and get its full spec plus the safe-zone guide.',
    'Use the Builder preview to render each spec on a real 1080x1920 canvas and download it as a PNG.',
    'Check the safe-zone guide before publishing — keep the title inside the central band so Instagram crops do not cut it.',
  ],
  methodology:
    'This tool validates each cover item and computes a complete, deterministic cover spec: the title (enforced at 60 characters), the background resolved to a hex color, one of 5 named gradients, or a validated http(s) upload URL, the fixed 1080x1920 canvas, and a 6-point safe-zone checklist. The Builder template then renders these specs on a real canvas in your browser and handles the PNG download — everything runs 100% client-side, and the logic module itself paints nothing.',
  faqs: [
    {
      question: 'what is the best instagram reels cover maker?',
      answer:
        'The best instagram reels cover maker validates your title length, resolves your background choice, and keeps your text inside Instagram\'s safe zone at the exact 1080x1920 size. This free tool does all three — then renders the cover on a canvas you can download as a PNG.',
    },
    {
      question: 'is there a free instagram reels cover maker?',
      answer:
        'Yes — this Instagram Reels cover maker is completely free with no signup. Build as many 1080x1920 cover specs as you like, preview each one with the safe-zone overlay, and download the PNG straight from your browser.',
    },
    {
      question: 'how to make instagram reels cover?',
      answer:
        'Add a cover title of 60 characters or fewer, pick a background (hex color, one of the 5 named gradients, or an uploaded image), and keep the title inside the central safe zone of the 1080x1920 canvas. Download the PNG and set it as your Reel\'s cover in Instagram.',
    },
    {
      question: 'how does an instagram reels cover maker work?',
      answer:
        'You enter a title and background per cover. The tool validates the title length, resolves the background to a color, gradient, or image URL, and produces a 1080x1920 cover spec with a safe-zone guide. The Builder preview then paints that spec onto a canvas you download as a PNG.',
    },
    {
      question: 'What is an instagram reels cover maker?',
      answer:
        'An instagram reels cover maker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'How do I use this instagram reels cover maker tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
    {
      question: 'Is this instagram reels cover maker tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
  ],
  assumptions: [
    'The logic module validates and computes specs only — the actual canvas rendering and PNG download happen in the Builder template in your browser, 100% client-side.',
    'Upload image size and type cannot be verified by the logic module; the Builder UI checks the file before it is submitted (keep uploads under 10MB and at least 1080x1920 px).',
    'Safe-zone cropping values are general guidance — Instagram adjusts crop areas over time, so always preview before publishing.',
  ],
  jsonLd: [],
};
