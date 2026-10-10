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
    label: 'Image to describe',
    type: 'file',
    required: true,
    accept: 'image/*',
    mediaKind: 'image',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'caption',
    label: 'Caption',
    type: 'copy',
    description:
    'Free ai image caption generator 2026: The full caption generated for your image. free.',
  },
  {
    id: 'altText',
    label: 'Alt text (≤125 chars)',
    type: 'copy',
    description:
    'SEO-friendly alt text trimmed to 125 characters.',
  },
  {
    id: 'honestyNote',
    label: 'About this result',
    type: 'text',
    description:
    'What this captioning model can and cannot do.',
  },
];

export const content: ToolContent = {
  title: 'AI Image Caption Generator',
  description:
    'Generate image captions and SEO-friendly alt text with a free on-device model. No uploads, no API key — your images never leave your browser, ever.',
  howTo: [
    'Upload an image (PNG, JPG — under 25 MB).',
    'Wait for the on-device model to download (~350 MB, once) and describe it.',
    'Read the generated caption.',
    'Copy the SEO-friendly alt text (trimmed to 125 characters) for your <img> tag.',
    'Always review the wording — model captions can miss details.',
  ],
  methodology:
    'Runs the Xenova/vit-gpt2-image-captioning image-to-text model (Apache-2.0, ~350 MB) directly in your browser via Transformers.js: a Vision Transformer encodes the image and a GPT-2 decoder writes a plain-English caption. The caption is then trimmed to 125 characters at a word boundary for the alt-text field, following SEO best practice. Nothing is uploaded; the page is explicit that captions are generic model guesses to be reviewed, not ground truth.',
  examples: [
    {
      title: 'Blog hero image',
      inputs: { image: '(an uploaded photo of a laptop on a desk)' },
      note: 'Returns a caption like "a laptop computer sitting on top of a wooden desk" plus a ≤125-char alt text.',
    },
    {
      title: 'Product photo',
      inputs: { image: '(an uploaded photo of sneakers)' },
      note: 'Generates a short description you can paste into the product page’s alt attribute.',
    },
  ],
  faqs: [
    {
      question: 'Is my image uploaded anywhere?',
      answer:
        'No. The captioning model downloads once to your browser and runs entirely on your device. Your image never leaves your computer or phone.',
    },
    {
      question: 'How good are the captions?',
      answer:
        'Useful but generic: the model describes the main subject and setting in plain words. It can miss small details, misidentify objects and ignore text in the image — always review and edit before publishing.',
    },
    {
      question: 'Why is the alt text limited to 125 characters?',
      answer:
        'Screen readers and search engines handle short alt text best; 125 characters is the widely cited practical limit. The tool trims at a word boundary so nothing reads cut off mid-word.',
    },
    {
      question: 'Why is the first run slow?',
      answer:
        'The browser downloads ~350 MB of model weights the first time. After that the model is cached and later runs start much faster, even offline.',
    },
    {
      question: 'What is an ai image caption generator?',
      answer:
        'An ai image caption generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'How do I create ai image caption generator?',
      answer: 'Describe what you need in the input fields, then click generate. You can regenerate as many times as you like and copy the version that fits best.',
    },
    {
      question: 'Can I customize the generated ai image caption generator?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
  ],
  assumptions: [
    'Captions are generic model guesses — review and edit before publishing.',
    'Alt text is trimmed to 125 characters per SEO best practice.',
    'Works on everyday photos; fine-grained or domain-specific imagery (medical, technical diagrams) is out of scope.',
  ],
  jsonLd: [],
};
