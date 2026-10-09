/**
 * meta.ts — AI Background Remover (tool-508), Lane A.
 *
 * SEO + content contract for the AiToolTemplate. Never imports client.ts.
 */
import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'file',
    label: 'Image file',
    type: 'file',
    required: true,
    accept: 'image/jpeg,image/png,image/webp,image/gif',
    mediaKind: 'image',
    maxFileMB: 20,
    placeholder: 'Drop an image or click to browse (JPG, PNG, WEBP, GIF — up to 20 MB)',
  },
  {
    id: 'quality',
    label: 'Quality',
    type: 'select',
    required: true,
    options: ['balanced', 'best'],
    placeholder: 'Balanced = ~44 MB download · Best = ~176 MB download',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'transparentPng',
    label: 'Transparent PNG',
    type: 'download',
    description: 'Free ai background remover 2026: Your image with the background removed, as a transparent PNG. Instant, private, and mobile-friendly. No signup - try it free!',
  },
];

export const content: ToolContent = {
  title: 'Ai Background Remover',
  description:
    'Remove image backgrounds free with AI in your browser — transparent PNG download, no signup, no uploads. The model runs 100% on your device.',
  howTo: [
    'Drop an image (JPG, PNG, WEBP or GIF up to 20 MB) onto the upload area, or click to browse.',
    'Choose Balanced for a fast ~44 MB model download, or Best for maximum edge quality (~176 MB).',
    'Click Remove background — the AI model loads once, then processes your image on your device.',
    'Compare the before/after preview, then download the transparent PNG.',
    'Repeat for more images — after the first load, each removal takes seconds.',
  ],
  methodology:
    'This tool runs the BRIA RMBG-1.4 background-removal model (briaai/RMBG-1.4) entirely in your browser using transformers.js with WebGPU/WASM. The model predicts a foreground mask, which is applied as the alpha channel of your original image at full resolution — the result is composited on a canvas and exported as PNG. No image is ever uploaded; processing is 100% local. The model downloads once (~44 MB balanced, ~176 MB best) and is cached for offline use.',
  examples: [
    {
      title: 'Product photo',
      inputs: { quality: 'balanced' },
      note: 'Upload a product shot — the background is removed so you can place it on any backdrop.',
    },
    {
      title: 'Portrait cutout',
      inputs: { quality: 'best' },
      note: 'Upload a portrait with Best quality for cleaner edges around hair.',
    },
  ],
  faqs: [
    {
      question: 'Is this background remover really free?',
      answer:
        'Yes. The AI model runs on your own device, so there is no server cost to pass on to you — no account, no credits, no watermarks.',
    },
    {
      question: 'Are my images uploaded anywhere?',
      answer:
        'No. Your image is processed entirely in your browser and never leaves your device. The only download is the AI model itself, from Hugging Face.',
    },
    {
      question: 'Which is better: Balanced or Best quality?',
      answer:
        'Both use the same RMBG-1.4 model. Balanced downloads ~44 MB and is noticeably faster; Best downloads ~176 MB and keeps slightly cleaner edges on tricky subjects like hair and fur. For most photos, Balanced is plenty.',
    },
    {
      question: 'Can I use the results commercially?',
      answer:
        'That depends on the model license: RMBG-1.4 is source-available for non-commercial use, and commercial use requires an agreement with BRIA. Check BRIA\'s license before using cutouts in client or ad work.',
    },
    {
      question: 'What image types and sizes are supported?',
      answer:
        'JPG, PNG, WEBP and GIF (first frame) up to 20 MB and 4096 px per side. Larger images should be resized first — the model analyzes at 1024 px internally.',
    },
    {
      question: 'How does the ai background remover work?',
      answer:
        'Enter your details using the inputs above and the ai background remover calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai background remover free to use?',
      answer:
        'Yes - this ai background remover is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'Edges are AI-estimated — fine hair, fur, glass and motion blur may need manual touch-ups.',
    'The output is a PNG with transparency; it does not add shadows, reflections or new backgrounds.',
    'Animated GIFs are processed as a single still frame.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Ai Background Remover 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/ai-background-remover/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free ai background remover 2026: Your image with the background removed, as a transparent PNG. Instant, private, and mobile-friendly. No signup - try it free!',
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
          name: 'AI Background Remover',
          item: 'https://husnainblogger.com/tools/ai-tools/ai-background-remover/',
        },
      ],
    },
  ],
};

export const aiConfig: AiToolConfig = {
  lane: 'A',
  headline: 'Remove any image background with AI — transparent PNG in seconds, entirely on your device.',
  models: [
    {
      id: 'briaai/RMBG-1.4',
      task: 'image-segmentation',
      dtype: 'q8',
      sizeMb: 44,
      license: 'BRIA — source-available, non-commercial',
      notes: 'Balanced mode: ~44 MB one-time download.',
    },
    {
      id: 'briaai/RMBG-1.4',
      task: 'image-segmentation',
      dtype: 'fp32',
      sizeMb: 176,
      license: 'BRIA — source-available, non-commercial',
      notes: 'Best-quality mode: ~176 MB one-time download.',
    },
  ],
  disclosures: [
    'Check BRIA\u2019s license for commercial use — RMBG-1.4 is source-available for non-commercial use; commercial use needs a BRIA agreement.',
    'The model downloads once (~44 MB balanced / ~176 MB best quality) and is cached in your browser; after that, removal runs 100% on your device.',
    'Your image never leaves your browser — no uploads, no servers.',
    'Segmentation is AI-estimated: fine hair, fur and glass edges may need manual touch-ups.',
  ],
};
