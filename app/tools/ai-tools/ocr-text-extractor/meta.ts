import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { getModelConfig, getDisclosures, HEADLINE } from './logic.ts';

const model = getModelConfig();

export const aiConfig: AiToolConfig = {
  lane: 'A',
  headline: HEADLINE,
  models: [model],
  disclosures: getDisclosures(),
};

export const inputs: ToolInput[] = [
  {
    id: 'image',
    label: 'Image with printed text',
    type: 'file',
    required: true,
    accept: 'image/*',
    mediaKind: 'image',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'extractedText',
    label: 'Extracted text',
    type: 'copy',
    description: 'Free online ocr text extractor 2026: The printed text recognized from your image, ready to copy. Get instant results. No signup - try it free now!',
  },
  {
    id: 'honestyNote',
    label: 'About this result',
    type: 'text',
    description: 'What this OCR model can and cannot do.',
  },
];

export const content: ToolContent = {
  title: 'OCR Text Extractor: Free Online',
  description:
    'Extract printed text from any image with a free on-device OCR model. No uploads and no API key — your image never leaves your browser, ever.',
  howTo: [
    'Upload an image containing printed text (PNG, JPG — under 25 MB).',
    'Wait for the on-device model to download (~120 MB, once) and scan the image.',
    'Read the extracted text in the result box.',
    'Copy it to your clipboard or download it as a .txt file.',
    'For best results, crop dense documents to a few lines at a time.',
  ],
  methodology:
    'Runs the Xenova/trocr-small-printed image-to-text model (Apache-2.0, ~120 MB) directly in your browser via Transformers.js — a Vision Transformer encoder plus a text decoder trained on printed lines. Your image is resized by the model’s processor, decoded into text tokens on your device, and nothing is ever uploaded. The interface is explicit: this is a printed-text, line-level model, so handwriting and complex layouts are out of scope.',
  examples: [
    {
      title: 'Screenshot of a quote',
      inputs: { image: '(an uploaded screenshot of printed text)' },
      note: 'Returns the readable lines as plain text you can copy into a document.',
    },
    {
      title: 'Photo of a sign',
      inputs: { image: '(an uploaded photo of a printed shop sign)' },
      note: 'Extracts the sign’s words; stylized lettering may come back imperfect.',
    },
  ],
  faqs: [
    {
      question: 'Is my image uploaded anywhere?',
      answer:
        'No. The OCR model downloads once to your browser and runs entirely on your device. Your image never leaves your computer or phone.',
    },
    {
      question: 'Does it read handwriting?',
      answer:
        'No — this checkpoint is trained on printed text only. Handwriting will return garbled or empty results, and the tool tells you that up front.',
    },
    {
      question: 'Why is the first run slow?',
      answer:
        'The browser downloads ~120 MB of model weights the first time. After that the model is cached and later runs start much faster, even offline.',
    },
    {
      question: 'How accurate is the extracted text?',
      answer:
        'Good on clean, well-lit printed lines. Small, blurry, skewed or stylized text degrades results — always proofread the output before using it.',
    },
    {
      question: 'How does the online ocr text extractor work?',
      answer:
        'Enter your details using the inputs above and the online ocr text extractor calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the online ocr text extractor free to use?',
      answer:
        'Yes - this online ocr text extractor is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an online ocr text extractor?',
      answer:
        'An online ocr text extractor is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Printed-text OCR only — handwriting, complex tables and multi-column layouts give poor results.',
    'Line-level model: dense pages work best cropped to a few lines at a time.',
    'Output is best-effort transcription, not a certified copy — proofread before reuse.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'OCR Text Extractor: Free Online 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/ocr-text-extractor/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free online ocr text extractor 2026: The printed text recognized from your image, ready to copy. Get instant results. No signup - try it free now!',
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
          name: 'OCR Text Extractor',
          item: 'https://husnainblogger.com/tools/ai-tools/ocr-text-extractor/',
        },
      ],
    },
  ],
};
