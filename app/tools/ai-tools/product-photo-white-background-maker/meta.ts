/**
 * meta.ts — Product Photo White Background Maker (tool-513), Lane A.
 *
 * SEO + content contract for the AiToolTemplate. Never imports client.ts.
 */
import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'file',
    label: 'Product photo',
    type: 'file',
    required: true,
    accept: 'image/jpeg,image/png,image/webp,image/gif',
    mediaKind: 'image',
    maxFileMB: 20,
    placeholder: 'Drop a product photo or click to browse (JPG, PNG, WEBP, GIF — up to 20 MB)',
  },
  {
    id: 'format',
    label: 'Output format',
    type: 'select',
    required: true,
    options: ['jpg', 'png'],
    placeholder: 'JPG = smaller file · PNG = lossless',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'productPhoto',
    label: 'White-background photo',
    type: 'download',
    description:
    'Free product photo white background 2026: Your product on a pure-white 2000×2000 px square, as a JPG or PNG download. Fast, private now.',
  },
];

export const content: ToolContent = {
  title: 'Product Photo White Background',
  description:
    'Put product photos on a white background free — pure-white 2000×2000 px square, JPG or PNG download, free. Make yours now!',
  howTo: [
    'Drop a product photo (JPG, PNG, WEBP or GIF up to 20 MB) onto the upload area, or click to browse.',
    'Pick JPG for a small file or PNG for lossless quality.',
    'Click Make white background — the AI model loads once, then cuts out your product on your device.',
    'Check the preview: your product is centered on a pure-white 2000×2000 px square.',
    'Download the result and reuse the tool for your whole catalog — the model stays cached.',
  ],
  methodology:
    'This tool runs the BRIA RMBG-1.4 background-removal model (briaai/RMBG-1.4) entirely in your browser via transformers.js. The predicted foreground mask is composited at full resolution over a pure-white (#ffffff) 2000×2000 px canvas, with the product scaled to fit inside a 5% margin. JPG output uses quality 0.92; PNG is lossless. No photo is ever uploaded — everything is computed locally. The model downloads once (~44 MB) and is cached for offline use.',
  examples: [
    {
      title: 'Shoes for a marketplace',
      inputs: { format: 'jpg' },
      note: 'Upload a shoe photo — get a clean white-background listing image.',
    },
    {
      title: 'Cosmetics, lossless',
      inputs: { format: 'png' },
      note: 'Upload a cosmetics bottle — PNG keeps labels crisp for your store.',
    },
  ],
  faqs: [
    {
      question: 'Is this product photo tool really free?',
      answer:
        'Yes — the AI background-removal model runs on your own device, so there is no server cost and nothing to charge. No account, no credits, no watermarks.',
    },
    {
      question: 'Are my product photos uploaded anywhere?',
      answer:
        'No. Cutout and compositing happen entirely in your browser; your photos never leave your device. The only download is the AI model itself, from Hugging Face.',
    },
    {
      question: 'What size is the output?',
      answer:
        'Always a 2000×2000 px square on pure white — a standard marketplace listing size. Your product is scaled to fit with a 5% margin on each side.',
    },
    {
      question: 'JPG or PNG — which should I choose?',
      answer:
        'JPG is smaller and loads faster on listings; PNG is lossless and keeps text on packaging crisper. Both have identical backgrounds and cutouts.',
    },
    {
      question: 'Can I use the results on Amazon or my store?',
      answer:
        'The output format matches typical marketplace photo rules, but check the model license: RMBG-1.4 is source-available for non-commercial use, and commercial use needs an agreement with BRIA. Marketplace photo rules also change — verify current requirements.',
    },
      {
      question: 'How do I use this product photo white background tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
    {
      question: 'Is this product photo white background tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
  ],
  assumptions: [
    'The AI cutout is an estimate — check edges (hair, glass, transparent packaging) before publishing.',
    'Output is always 2000×2000 px white; no shadows, reflections or styling are added.',
    'One product per photo works best — group shots may confuse the mask.',
  ],
  jsonLd: [],
};

export const aiConfig: AiToolConfig = {
  lane: 'A',
  headline: 'Marketplace-ready product photos: AI cutout on pure white, entirely on your device.',
  models: [
    {
      id: 'briaai/RMBG-1.4',
      task: 'image-segmentation',
      dtype: 'q8',
      sizeMb: 44,
      license: 'BRIA — source-available, non-commercial',
      notes: 'Balanced weights: ~44 MB one-time download, cached for offline use.',
    },
  ],
  disclosures: [
    'Check BRIA\u2019s license for commercial use — RMBG-1.4 is source-available for non-commercial use; commercial use needs a BRIA agreement.',
    'The model downloads once (~44 MB) and is cached in your browser; after that, everything runs 100% on your device.',
    'Your photo never leaves your browser — no uploads, no servers.',
    'Output is a fixed 2000×2000 px white-background square — the AI mask is an estimate, so check edges before publishing.',
  ],
};
