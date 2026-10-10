/**
 * meta.ts — AI Image Upscaler (tool-509), Lane A.
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
    accept: 'image/jpeg,image/png,image/webp',
    mediaKind: 'image',
    maxFileMB: 20,
    placeholder: 'Drop an image or click to browse (JPG, PNG, WEBP — up to 20 MB, 1024 px per side)',
  },
  {
    id: 'scale',
    label: 'Upscale factor',
    type: 'select',
    required: true,
    options: ['2x', '4x'],
    placeholder: 'Each factor uses its own model (~52–53 MB, one-time download)',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'upscaledPng',
    label: 'Upscaled PNG',
    type: 'download',
    description:
    'Free ai image upscaler 2026: Your image at 2x or 4x resolution, as a PNG download. free.',
  },
];

export const content: ToolContent = {
  title: 'AI Image Upscaler (2x/4x, Free)',
  description:
    'Upscale images free with AI — boost your photo to 2x or 4x resolution, download it as a PNG in seconds. Upscale yours now!',
  howTo: [
    'Drop an image (JPG, PNG or WEBP up to 20 MB) onto the upload area, or click to browse.',
    'Pick 2x or 4x — each factor loads its own super-resolution model (about 52–53 MB, downloaded once).',
    'Click Upscale image and wait — large images can take a few minutes on CPU-only devices.',
    'Compare the before/after preview, then download the upscaled PNG.',
    'Upscale more images — after the first load, the model is cached and each run is faster.',
  ],
  methodology:
    'This tool runs Swin2SR (SwinV2 Transformer for super-resolution) entirely in your browser via transformers.js: Xenova/swin2SR-classical-sr-x2-64 for 2x and Xenova/swin2SR-classical-sr-x4-64 for 4x (fp32 ONNX weights). Images larger than 1024 px per side are downscaled to 1024 first so on-device inference finishes in reasonable time. The model reconstructs a higher-resolution image from the input — no pixels are invented from the internet; everything is computed locally and the result is exported as PNG.',
  examples: [
    {
      title: 'Old photo, 4x',
      inputs: { scale: '4x' },
      note: 'Upload a small old photo — 4x brings out detail for printing or zooming.',
    },
    {
      title: 'Web graphic, 2x',
      inputs: { scale: '2x' },
      note: 'Upload a low-res graphic — 2x sharpens it for retina displays without a huge file.',
    },
  ],
  faqs: [
    {
      question: 'Is this AI image upscaler really free?',
      answer:
        'Yes — the super-resolution model runs on your own device through your browser, so there is no server cost and nothing to charge you for. No account, no credits, no watermarks.',
    },
    {
      question: 'What is the difference between 2x and 4x?',
      answer:
        '2x doubles each side (4x the pixels), 4x quadruples each side (16x the pixels). 4x reveals more detail but takes longer and produces a larger file. Each factor uses its own dedicated model.',
    },
    {
      question: 'Why are images limited to 1024 px per side?',
      answer:
        'Neural upscaling is heavy: a 1024 px image becomes 4096 px at 4x, which is already slow on CPU-only devices. The cap keeps runs finishing in reasonable time on typical laptops and phones.',
    },
    {
      question: 'Does it work offline?',
      answer:
        'After the first visit, yes. Each model (~52–53 MB) is cached by your browser, so later upscales work with no internet connection.',
    },
    {
      question: 'Will upscaling fix a very blurry photo?',
      answer:
        'It improves detail and sharpness on photos, but it cannot recover information that is not there — heavy blur, noise or compression artifacts stay partly visible, and text may look softened.',
    },
      {
      question: 'How do I use this ai image upscaler (2x/4x,) tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
    {
      question: 'Is this ai image upscaler (2x/4x,) tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
  ],
  assumptions: [
    'Best for photos; text, logos and fine line-art may look softened rather than sharper.',
    'Inputs are capped at 1024 px per side — larger images are downscaled before upscaling.',
    'The output is a best-effort AI reconstruction, not a true high-resolution original.',
  ],
  jsonLd: [],
};

export const aiConfig: AiToolConfig = {
  lane: 'A',
  headline: 'AI super-resolution in your browser — 2x or 4x upscaling with no uploads and no signup.',
  models: [
    {
      id: 'Xenova/swin2SR-classical-sr-x2-64',
      task: 'image-to-image',
      dtype: 'fp32',
      sizeMb: 52,
      license: 'Apache-2.0 (Swin2SR via Xenova ONNX conversion)',
      notes: 'Native 2x classical super-resolution.',
    },
    {
      id: 'Xenova/swin2SR-classical-sr-x4-64',
      task: 'image-to-image',
      dtype: 'fp32',
      sizeMb: 53,
      license: 'Apache-2.0 (Swin2SR via Xenova ONNX conversion)',
      notes: 'Native 4x classical super-resolution.',
    },
  ],
  disclosures: [
    'Each model downloads once (~52–53 MB) and is cached in your browser; after that, upscaling runs 100% on your device.',
    'Inputs are limited to 1024 px per side — larger images are downscaled first so the browser can finish in reasonable time.',
    'AI upscaling works best on photos; text and fine line-art may look softened rather than sharper.',
    'Your image never leaves your browser — no uploads, no servers.',
  ],
};
