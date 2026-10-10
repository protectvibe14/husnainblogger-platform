import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent, BuilderField } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [
  { id: 'svg', label: 'Cover SVG', type: 'download' },
  { id: 'svgCode', label: 'SVG code', type: 'copy' },
];

export const itemFields: BuilderField[] = [
  {
    id: 'label',
    label: 'Cover label',
    type: 'text',
    required: true,
    placeholder: 'e.g. Tips (max 60 chars; leave empty for icon-only)',
  },
  {
    id: 'background',
    label: 'Background color',
    type: 'text',
    required: true,
    placeholder: '#FF6B6B — or a gradient: #FF6B6B|#4ECDC4',
  },
  {
    id: 'icon',
    label: 'Icon (emoji or letter, optional)',
    type: 'text',
    placeholder: 'e.g. ✈️ or T',
  },
];

const DESCRIPTION =
  'Design a polished profile with this Instagram highlight cover maker — matching covers that make your story highlights look professional. Download.';

export const content: ToolContent = {
  title: 'Instagram Highlight Cover Maker',
  description: DESCRIPTION,
  howTo: [
    'Add a row for each highlight cover you want to make.',
    'Type a label (up to 60 characters) or leave it empty for an icon-only cover.',
    'Set a background: a hex color like #FF6B6B, or a gradient like #FF6B6B|#4ECDC4.',
    'Optionally add an emoji or letter as the icon.',
    'Download the SVG or copy the code, then upload it as your highlight cover in Instagram.',
  ],
  methodology:
    'This tool draws no canvas and uploads nothing: it builds a 1080x1080 SVG cover string (full-bleed circle background, centered icon and/or label) directly from your inputs using fixed layout rules. Labels longer than a few words get a smaller font automatically. Your text is XML-escaped before it goes into the SVG.',
  faqs: [
    {
      question: 'What is the best instagram highlight cover maker?',
      answer:
        'A good maker gives you a clean, on-brand 1080x1080 cover in seconds. This free tool builds SVG covers from your label, background color or gradient, and icon — download or copy the result and upload it in Instagram.',
    },
    {
      question: 'Is there a free instagram highlight cover maker?',
      answer:
        'Yes — this tool is completely free with no signup. Add rows for each cover, download the SVGs, and set them as your highlight covers in the Instagram app.',
    },
    {
      question: 'How to make instagram highlight cover?',
      answer:
        'Type a label, pick a background color or gradient, and optionally add an emoji icon. Download the generated SVG, then in Instagram open the highlight, tap Edit Highlight, and upload the SVG as the cover image.',
    },
    {
      question: 'How does an instagram highlight cover maker work?',
      answer:
        'It assembles a 1080x1080 SVG file from your choices: background fill or gradient, centered icon, and label text. Everything happens in your browser — no uploads, no accounts.',
    },
    {
      question: 'What is an instagram highlight cover maker?',
      answer:
        'An instagram highlight cover maker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'How do I use this instagram highlight cover maker tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
    {
      question: 'Is this instagram highlight cover maker tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
  ],
  assumptions: [
    'Output is an SVG string built in your browser — no image rendering, uploads, or servers involved.',
    'Labels are capped at 60 characters; font size shrinks automatically for longer labels.',
    'Backgrounds accept hex colors only (#RGB or #RRGGBB), or two hex colors joined with | for a gradient.',
    'Instagram crops highlight covers to a circle — keep text and icons centered.',
  ],
  jsonLd: [],
};
