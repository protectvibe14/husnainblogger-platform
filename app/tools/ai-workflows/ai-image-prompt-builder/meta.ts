import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent, BuilderField } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [
  { id: 'lines', label: 'Assembled image prompts', type: 'list' },
];

export const itemFields: BuilderField[] = [
  { id: 'subject', label: 'Image subject', type: 'text', required: true, placeholder: 'e.g. a cozy coffee shop in autumn' },
  {
    id: 'artStyle',
    label: 'Art style',
    type: 'text',
    placeholder: 'photorealistic | cinematic | anime | digital painting | … (default: photorealistic)',
  },
  {
    id: 'aspectRatio',
    label: 'Aspect ratio',
    type: 'text',
    placeholder: '1:1 | 16:9 | 9:16 | 4:3 | 3:2 (default: 16:9)',
  },
  {
    id: 'lighting',
    label: 'Lighting',
    type: 'text',
    placeholder: 'e.g. golden hour (default: soft daylight)',
  },
  {
    id: 'cameraAngle',
    label: 'Camera angle',
    type: 'text',
    placeholder: 'e.g. close-up, aerial (default: eye level)',
  },
  {
    id: 'negativeTerms',
    label: 'Negative terms (optional)',
    type: 'text',
    placeholder: 'e.g. blurry, watermark, text',
  },
];

export const content: ToolContent = {
  title: 'AI Image Prompt Generator',
  description:
    'Free ai image prompt generator 2026: build better AI image prompts: pick a subject, art style, aspect ratio, lighting, and. Fast, private.',
  howTo: [
    'Describe your image subject in the required subject field.',
    'Type an art style (photorealistic, anime, cinematic, …) — unknown styles fall back to photorealistic.',
    'Pick an aspect ratio from 1:1, 16:9, 9:16, 4:3, or 3:2.',
    'Add lighting, a camera angle, and optional negative terms to exclude.',
    'Copy the assembled prompt and paste it into your own image generator.',
  ],
  methodology:
    'This tool assembles your choices into a fixed prompt format using preset phrase banks (12 art styles, 5 aspect ratios, 8 lighting presets, 8 camera angles). It generates no image and runs no AI — the output is a text prompt you paste into your own image-generation tool.',
  faqs: [
    {
      question: 'What is the best AI image prompt generator?',
      answer:
        'The best prompts name the subject precisely, then add style, lighting, camera angle, and aspect ratio. This free builder assembles exactly that structure from your choices — what comes out of the image generator still depends on the model you use.',
    },
    {
      question: 'Is there a free AI image prompt generator?',
      answer:
        'Yes — this builder is completely free with no signup. You paste the assembled prompt into any image generator you already use.',
    },
    {
      question: 'How to generate AI image prompt ideas?',
      answer:
        'Start with a concrete subject, then experiment: this builder lets you combine 12 art styles, 8 lighting presets, and 8 camera angles, so you can build dozens of prompt variations in minutes.',
    },
    {
      question: 'How does an AI image prompt generator work?',
      answer:
        'It combines your subject with style, lighting, camera angle, and aspect ratio into one well-structured prompt string. This site generates no images itself — you copy the prompt into your own image-generation tool.',
    },
    {
      question: 'How does the ai image prompt generator work?',
      answer:
        'Enter your details using the inputs above and the ai image prompt generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai image prompt generator free to use?',
      answer:
        'Yes - this ai image prompt generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an ai image prompt generator?',
      answer:
        'An ai image prompt generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Output is a text prompt only — this tool generates no images.',
    'The tool runs no AI model; you need your own image generator.',
    'Art style must match a preset (or falls back to photorealistic); aspect ratio must be one of 5 presets.',
    'Results depend on the image model you paste the prompt into — prompt quality is not a guarantee of image quality.',
  ],
  jsonLd: [
  ],
};
