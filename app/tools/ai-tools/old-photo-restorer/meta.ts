import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { getDisclosures, HEADLINE } from './logic.ts';

export const aiConfig: AiToolConfig = {
  lane: 'A',
  headline: HEADLINE,
  models: [],
  disclosures: getDisclosures(),
};

export const inputs: ToolInput[] = [
  {
    id: 'photo',
    label: 'Scanned photo',
    type: 'file',
    required: true,
    accept: 'image/*',
    mediaKind: 'image',
  },
  {
    id: 'autoContrast',
    label: 'Auto-contrast',
    type: 'boolean',
    required: false,
  },
  {
    id: 'fadeCorrection',
    label: 'Fade correction',
    type: 'boolean',
    required: false,
  },
  {
    id: 'dustReduction',
    label: 'Dust & scratch reduction',
    type: 'boolean',
    required: false,
  },
  {
    id: 'upscale2x',
    label: '2x upscale',
    type: 'boolean',
    required: false,
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'restoredPhoto',
    label: 'Enhanced photo',
    type: 'download',
    description:
    'Free old photo restorer 2026: Your photo with the selected enhancement filters applied, as a PNG download. Fast, private now.',
  },
  {
    id: 'honestyNote',
    label: 'About this result',
    type: 'text',
    description:
    'What classic filters can and cannot fix.',
  },
];

export const content: ToolContent = {
  title: 'Old Photo Restorer: Free Online',
  description:
    'Restore old photos free with AI — pick enhancement filters and download the restored photo as a PNG, free. Restore yours now!',
  howTo: [
    'Upload a scanned old photo (JPG or PNG, under 25 MB).',
    'Toggle the filters: auto-contrast, fade correction, dust reduction, 2x upscale.',
    'Compare the before/after preview side by side.',
    'Download the enhanced photo as a PNG.',
    'For torn or missing areas, use a professional restoration service — filters cannot rebuild them.',
  ],
  methodology:
    'No AI model — four classic, fully disclosed image-processing filters run on your device via the Canvas API: auto-contrast stretches each channel’s 1st–99th percentile histogram to the full 0–255 range; fade correction applies gray-world white balance to neutralize age yellowing; dust reduction runs a 3×3 median filter that erases single-pixel specks; the optional 2× upscale uses bilinear interpolation. Nothing is uploaded; the output is an honest enhancement, not a reconstruction.',
  examples: [
    {
      title: 'Faded 1970s print',
      inputs: { photo: '(an uploaded yellowed scan)', fadeCorrection: true, autoContrast: true },
      note: 'Yellow cast neutralized and contrast restored; faces stay exactly as scanned.',
    },
    {
      title: 'Dusty negative scan',
      inputs: { photo: '(an uploaded dusty scan)', dustReduction: true, upscale2x: true },
      note: 'Specks softened and the image doubled in size for printing.',
    },
  ],
  faqs: [
    {
      question: 'Does this use AI to restore photos?',
      answer:
        'No — and the tool says so plainly. It applies classic enhancement filters (contrast stretch, white balance, median filter, upscale). It cannot reconstruct torn areas, missing faces or heavy blur the way professional restoration can.',
    },
    {
      question: 'Is my photo uploaded anywhere?',
      answer:
        'No. All processing happens in your browser with the Canvas API. Your photo never leaves your device.',
    },
    {
      question: 'What does each filter do?',
      answer:
        'Auto-contrast spreads the tonal range for punchier images; fade correction removes the yellow/gray cast of aged prints; dust reduction smooths specks and scratches; 2x upscale doubles the dimensions with bilinear interpolation (it enlarges, it does not add detail).',
    },
    {
      question: 'Can it fix tears or missing pieces?',
      answer:
        'No. Filters enhance what is there — they cannot invent missing content. Tears, stains over faces and severe blur need a professional restoration service.',
    },
    {
      question: 'What is an old photo restorer?',
      answer:
        'An old photo restorer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'How do I use this old photo restorer: tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
    {
      question: 'Is this old photo restorer: tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
  ],
  assumptions: [
    'Basic enhancement filters only — not AI restoration; cannot rebuild missing or torn areas.',
    'Photos are processed at up to 1200px on the long edge to keep the page responsive.',
    '2x upscale enlarges the image — it does not add genuine detail.',
  ],
  jsonLd: [],
};
