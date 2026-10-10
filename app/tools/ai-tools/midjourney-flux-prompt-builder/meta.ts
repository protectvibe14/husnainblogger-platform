import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'subject',
    label: 'Subject',
    type: 'text',
    required: true,
    placeholder: 'e.g. a lighthouse on a rocky cliff at dusk',
  },
  {
    id: 'style',
    label: 'Style',
    type: 'select',
    required: true,
    options: [
      'photorealistic',
      'cinematic',
      'anime',
      '3d-render',
      'oil-painting',
      'watercolor',
      'cyberpunk',
      'vintage-photo',
    ],
  },
  {
    id: 'aspect',
    label: 'Aspect ratio',
    type: 'select',
    required: true,
    options: ['1:1', '16:9', '9:16', '4:3', '3:2'],
  },
  {
    id: 'detailLevel',
    label: 'Detail level',
    type: 'select',
    required: true,
    options: ['simple', 'balanced', 'highly-detailed'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'midjourneyPrompt',
    label: 'Midjourney prompt',
    type: 'copy',
    description:
    'Free midjourney prompt builder 2026: Assembled Midjourney prompt with --ar and --v flags, ready to paste. Get instant results. free now.',
  },
  {
    id: 'fluxPrompt',
    label: 'Flux prompt',
    type: 'copy',
    description:
    'Plain-language Flux variant without parameter flags, ready to paste.',
  },
  {
    id: 'midjourneyParams',
    label: 'Midjourney parameters',
    type: 'text',
    description:
    'The parameter flags used in the Midjourney prompt.',
  },
];

export const content: ToolContent = {
  title: 'Midjourney & Flux Prompt Builder',
  description:
    'Build copy-ready Midjourney and Flux image prompts from fixed style templates: 8 styles, 3 detail levels, 5 aspect ratios. Free prompt builder — paste.',
  howTo: [
    'Type your image subject (2-200 characters) into the Subject field.',
    'Pick a style from photorealistic, cinematic, anime, 3D render, oil painting, watercolor, cyberpunk or vintage photo.',
    'Choose an aspect ratio and a detail level, then click Build prompts.',
    'Copy the Midjourney prompt (with --ar and --v flags) or the plain-language Flux variant.',
    'Paste into your image tool of choice and adjust wording to taste.',
  ],
  methodology:
    'This tool assembles prompts from fixed template banks: 8 hand-written style descriptors, 3 detail modifiers, 5 aspect ratios and 6 lighting phrases (picked deterministically from your subject). It runs entirely in your browser — it does not generate images, does not call Midjourney or Flux, and no AI model is involved.',
  examples: [
    {
      title: 'Travel blogger',
      inputs: { subject: 'a lighthouse on a rocky cliff at dusk', style: 'cinematic', aspect: '16:9', detailLevel: 'balanced' },
      note: 'Builds a Midjourney prompt with --ar 16:9 --v 6 plus a plain-language Flux variant describing the cinematic look.',
    },
    {
      title: 'Sticker maker',
      inputs: { subject: 'cute fox drinking coffee', style: 'anime', aspect: '1:1', detailLevel: 'simple' },
      note: 'Builds a square anime prompt with a simple composition modifier for sticker-style art.',
    },
  ],
  faqs: [
    {
      question: 'Is this an AI image generator?',
      answer:
        'No — it generates prompt text, not images. It combines your subject with fixed style templates, and you paste the result into Midjourney, Flux or any other image tool. No AI model runs here.',
    },
    {
      question: 'What Midjourney parameters does it add?',
      answer:
        'It appends a fixed --ar flag for your chosen aspect ratio and --v 6. Midjourney changes its flags over time, so check their official docs for the current syntax before running.',
    },
    {
      question: 'Why is the Flux prompt plain language?',
      answer:
        'Flux works best with natural-language descriptions rather than Midjourney-style parameters, so the Flux variant drops the --ar/--v flags and describes the style, lighting and ratio in sentences.',
    },
    {
      question: 'Can I reuse these prompts commercially?',
      answer:
        'The prompt text is yours to use freely. Images you generate from it follow the terms of the image tool you run them on — check Midjourney or Flux licensing for commercial use.',
    },
    {
      question: 'How is the lighting phrase chosen?',
      answer:
        'It is picked deterministically from a fixed bank of 6 lighting phrases based on your subject text, so the same subject always produces the same lighting line.',
    },
  ],
  assumptions: [
    'Outputs are template-assembled text, not AI output — review and edit the wording before using it for important work.',
    'Midjourney parameter syntax can change; the --v 6 flag reflects the template as written, not a live lookup.',
  ],
  jsonLd: [],
};
