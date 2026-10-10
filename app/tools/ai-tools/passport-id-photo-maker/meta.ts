/**
 * meta.ts — Passport/ID Photo Maker (tool-514), Lane A.
 *
 * SEO + content contract for the AiToolTemplate. Never imports client.ts.
 * This tool formats dimensions only — it does not claim any country's
 * current acceptance rules.
 */
import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { PHOTO_SIZES } from './logic.ts';

export const inputs: ToolInput[] = [
  {
    id: 'file',
    label: 'Portrait photo',
    type: 'file',
    required: true,
    accept: 'image/jpeg,image/png,image/webp',
    mediaKind: 'image',
    maxFileMB: 20,
    placeholder: 'Drop a front-facing portrait or click to browse (JPG, PNG, WEBP — up to 20 MB)',
  },
  {
    id: 'size',
    label: 'Photo size',
    type: 'select',
    required: true,
    options: PHOTO_SIZES.map((s) => s.id),
    placeholder: 'US 2×2 in (600×600) · UK/Schengen 35×45 mm (413×531) · India 51×51 mm (602×602)',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'idPhoto',
    label: 'ID photo',
    type: 'download',
    description:
    'Free passport photo maker online 2026: Your portrait on a pure-white background at the chosen official size, as a JPG download. Fast, private - try.',
  },
];

export const content: ToolContent = {
  title: 'Passport Photo Maker',
  description:
    'Make passport photos free in your browser — AI cutout on pure white at US, UK/Schengen or India sizes., no uploads; runs 100% on your device.',
  howTo: [
    'Drop a front-facing portrait with a plain background (JPG, PNG or WEBP up to 20 MB), or click to browse.',
    'Pick a size: US 2×2 in, UK/Schengen 35×45 mm, or India 51×51 mm.',
    'Click Make ID photo — the AI model loads once, then cuts you out on your device.',
    'Check the preview: you are centered on a pure-white background at the official pixel size.',
    'Download the JPG. Always verify your country\u2019s current photo rules before submitting.',
  ],
  methodology:
    'This tool runs the BRIA RMBG-1.4 background-removal model (briaai/RMBG-1.4) entirely in your browser via transformers.js. The predicted foreground mask is composited at full resolution over a pure-white canvas at the chosen official dimensions (@300 dpi: US 600×600, UK/Schengen 413×531, India 602×602), scaled to fit with an 8% margin. No photo is ever uploaded — everything is computed locally. The model downloads once (~44 MB) and is cached for offline use. Dimensions only: the tool does not evaluate or guarantee compliance with any country\u2019s photo rules.',
  examples: [
    {
      title: 'US passport photo',
      inputs: { size: 'us' },
      note: 'Upload a front-facing photo — get a 600×600 px white-background US-size image.',
    },
    {
      title: 'UK visa photo',
      inputs: { size: 'uk' },
      note: 'Upload a portrait — get a 413×531 px UK/Schengen-size image.',
    },
  ],
  faqs: [
    {
      question: 'Is this passport photo maker really free?',
      answer:
        'Yes — the AI cutout model runs on your own device, so there is nothing to charge. No account, no credits, no watermarks.',
    },
    {
      question: 'Will the photo be accepted for my passport or visa?',
      answer:
        'This tool only formats the size and background. Official rules (head size, expression, glasses, recency, print quality) change and vary by country — always check your country\u2019s official requirements before submitting.',
    },
    {
      question: 'What sizes are supported?',
      answer:
        'US 2×2 in (600×600 px), UK/Schengen 35×45 mm (413×531 px) and India 51×51 mm (602×602 px), all at 300 dpi on pure white.',
    },
    {
      question: 'Are my photos uploaded anywhere?',
      answer:
        'No. Cutout and compositing happen entirely in your browser; your photo never leaves your device. The only download is the AI model itself, from Hugging Face.',
    },
    {
      question: 'What photo should I upload for the best result?',
      answer:
        'A front-facing portrait with even lighting, a plain contrasting background, and your face clearly visible — the AI cutout is most accurate when the subject stands out from the background.',
    },
    {
      question: 'How does the passport photo maker online work?',
      answer:
        'Enter your details using the inputs above and the passport photo maker online calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the passport photo maker online free to use?',
      answer:
        'Yes - this passport photo maker online is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'Dimensions only — acceptance depends on your country\u2019s current rules, which this tool does not evaluate.',
    'The AI cutout is an estimate; check hair and edges before official use.',
    'Output is a white-background JPG; no retouching or compliance checks are performed.',
  ],
  jsonLd: [
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Passport/ID Photo Maker',
          item: 'https://husnainblogger.com/tools/ai-tools/passport-id-photo-maker/',
        },
      ],
    },
  ],
};

export const aiConfig: AiToolConfig = {
  lane: 'A',
  headline: 'ID-ready portrait photos: AI cutout on pure white at official sizes, on your device.',
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
    'Check your country\u2019s official photo requirements — rules change; this tool formats dimensions only and does not guarantee acceptance.',
    'Check BRIA\u2019s license for commercial use — RMBG-1.4 is source-available for non-commercial use; commercial use needs a BRIA agreement.',
    'The model downloads once (~44 MB) and is cached in your browser; after that, everything runs 100% on your device.',
    'Your photo never leaves your browser — no uploads, no servers.',
  ],
};
