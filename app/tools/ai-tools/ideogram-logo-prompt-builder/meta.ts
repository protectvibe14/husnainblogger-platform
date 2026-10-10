import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'brandName',
    label: 'Brand name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Bean & Brew',
  },
  {
    id: 'industry',
    label: 'Industry',
    type: 'text',
    required: true,
    placeholder: 'e.g. coffee shop',
  },
  {
    id: 'style',
    label: 'Style',
    type: 'select',
    required: true,
    options: ['minimalist', 'mascot', 'vintage', 'geometric', 'wordmark'],
  },
  {
    id: 'colors',
    label: 'Colors',
    type: 'text',
    required: true,
    placeholder: 'e.g. brown and cream',
  },
  {
    id: 'tagline',
    label: 'Tagline (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. slow mornings',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'logoPrompt',
    label: 'Logo prompt',
    type: 'copy',
    description:
    'Free ideogram logo prompt 2026: Copy-ready Ideogram prompt for the main logo. free.',
  },
  {
    id: 'negativePrompt',
    label: 'Negative prompt',
    type: 'copy',
    description:
    'Fixed negative-prompt line to steer away from photo-style artifacts.',
  },
  {
    id: 'variations',
    label: 'Style variations',
    type: 'list',
    description:
    '3 variation prompts: icon-only, monochrome, horizontal lockup.',
  },
  {
    id: 'note',
    label: 'Usage note',
    type: 'text',
    description:
    'Where to paste the prompts and what to expect from text rendering.',
  },
];

export const content: ToolContent = {
  title: 'Ideogram Logo Prompt Builder',
  description:
    'Build an Ideogram-ready logo prompt from fixed templates: 5 styles, brand colors, optional tagline, plus 3 style variations and a negative prompt. Free.',
  howTo: [
    'Type your brand name, industry and colors (2-100 characters each).',
    'Pick a style: minimalist, mascot, vintage, geometric or wordmark.',
    'Add a tagline if you want it in the logo (optional).',
    'Click Build prompt to generate the main prompt, negative prompt and 3 variations.',
    'Paste into Ideogram and regenerate until the text spelling is exactly right.',
  ],
  methodology:
    'This tool fills a fixed logo-prompt template with your brand name, industry, one of 5 hand-written style descriptors, colors and optional tagline, then derives 3 fixed variations (icon-only, monochrome, horizontal lockup) and appends one fixed negative-prompt line. It runs entirely in your browser — it does not generate logos and no AI model is involved.',
  examples: [
    {
      title: 'Coffee shop',
      inputs: { brandName: 'Bean & Brew', industry: 'coffee shop', style: 'vintage', colors: 'brown and cream', tagline: 'slow mornings' },
      note: 'Builds a vintage badge prompt with the tagline plus icon-only, monochrome and lockup variations.',
    },
    {
      title: 'SaaS startup',
      inputs: { brandName: 'Northloop', industry: 'project management software', style: 'minimalist', colors: 'blue and white', tagline: '' },
      note: 'Builds a minimalist flat-vector prompt with no tagline line.',
    },
  ],
  faqs: [
    {
      question: 'Does this tool design my logo?',
      answer:
        'No. It writes prompt text that you paste into Ideogram (or another image tool). The actual logo design is generated there, not here.',
    },
    {
      question: 'Why does the note warn about text rendering?',
      answer:
        'Image generators often misspell words in logos. Ideogram is among the better ones at text, but you should still regenerate and zoom in on the spelling before using a result.',
    },
    {
      question: 'What are the 3 variations for?',
      answer:
        'They give you usable logo forms from one idea: an icon-only version (app icons, favicons), a monochrome version (single-color printing) and a horizontal lockup (headers, banners).',
    },
    {
      question: 'Is this affiliated with Ideogram?',
      answer:
        'No. This is an independent prompt-writing helper. Ideogram is a separate product with its own terms and pricing.',
    },
    {
      question: 'Is the builder free?',
      answer:
        'Yes — completely free, no signup. It runs in your browser using fixed templates.',
    },
      {
      question: 'Can I save or export my ideogram logo prompt builder?',
      answer: 'Yes, copy the result or use your browser\'s print-to-PDF. Everything stays on your device — nothing is uploaded or stored.',
    },
    {
      question: 'How do I build ideogram logo prompt builder?',
      answer: 'Fill in the fields with your details and the builder assembles everything into a polished result. Edit any section until it feels right.',
    },
  ],
  assumptions: [
    'Prompts are template-assembled text — adjust the wording for your brand voice before generating.',
    'Text-in-image rendering varies by tool; verify spelling in every generated logo before using it.',
  ],
  jsonLd: [],
};
