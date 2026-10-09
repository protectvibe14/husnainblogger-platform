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
    description: 'Free old photo restorer 2026: Your photo with the selected enhancement filters applied, as a PNG download. Fast, private, no signup - try it now!',
  },
  {
    id: 'honestyNote',
    label: 'About this result',
    type: 'text',
    description: 'What classic filters can and cannot fix.',
  },
];

export const content: ToolContent = {
  title: 'Old Photo Restorer: Free Online',
  description:
    'Clean up old scanned photos free: auto-contrast, fade correction and dust reduction with classic filters. No AI claims — runs in your browser.',
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
      question: 'How does the old photo restorer work?',
      answer:
        'Enter your details using the inputs above and the old photo restorer calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the old photo restorer free to use?',
      answer:
        'Yes - this old photo restorer is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an old photo restorer?',
      answer:
        'An old photo restorer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Basic enhancement filters only — not AI restoration; cannot rebuild missing or torn areas.',
    'Photos are processed at up to 1200px on the long edge to keep the page responsive.',
    '2x upscale enlarges the image — it does not add genuine detail.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Old Photo Restorer: Free Online 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/old-photo-restorer/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free old photo restorer 2026: Your photo with the selected enhancement filters applied, as a PNG download. Fast, private, no signup - try it now!',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'AI Tools',
          item: 'https://husnainblogger.com/tools/ai-tools/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Old Photo Restorer',
          item: 'https://husnainblogger.com/tools/ai-tools/old-photo-restorer/',
        },
      ],
    },
  ],
};
