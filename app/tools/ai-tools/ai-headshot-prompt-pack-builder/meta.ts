import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'profession',
    label: 'Profession',
    type: 'text',
    required: true,
    placeholder: 'e.g. software engineer',
  },
  {
    id: 'style',
    label: 'Style',
    type: 'select',
    required: true,
    options: ['corporate', 'creative', 'studio', 'outdoor'],
  },
  {
    id: 'background',
    label: 'Background',
    type: 'text',
    required: true,
    placeholder: 'e.g. soft gray office background',
  },
  {
    id: 'attire',
    label: 'Attire',
    type: 'text',
    required: true,
    placeholder: 'e.g. a navy blazer',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'prompts',
    label: 'Headshot prompt pack',
    type: 'list',
    description: 'Free ai headshot prompt 2026: 5 copy-ready headshot prompts with different poses and settings. Instant, private, and mobile-friendly. No signup - try it free!',
  },
  {
    id: 'negativePrompt',
    label: 'Negative prompt',
    type: 'copy',
    description: 'One fixed negative-prompt line to pair with any prompt in the pack.',
  },
];

export const content: ToolContent = {
  title: 'AI Headshot Prompt Pack Builder 2026 – Free | HusnainBlogger',
  description:
    'Build a pack of 5 copy-ready headshot prompts from fixed templates: 4 styles, 5 poses, plus a negative-prompt line. Free text to paste into any image tool.',
  howTo: [
    'Type your profession, background and attire (2-150 characters each).',
    'Pick a style: corporate, creative, studio or outdoor.',
    'Click Build pack to generate the 5 prompts.',
    'Copy the prompts into your image generator of choice, one per generation.',
    'Add the negative-prompt line to each generation to steer away from common artifacts.',
  ],
  methodology:
    'This tool combines your inputs with fixed template banks: 4 hand-written style descriptors and 5 fixed pose templates (head-and-shoulders, three-quarter turn, candid laugh, seated, close-up), each rendered as a photorealistic 85mm prompt string, plus one fixed negative-prompt line. It runs entirely in your browser — it does not generate images and no AI model is involved.',
  examples: [
    {
      title: 'LinkedIn photo',
      inputs: { profession: 'software engineer', style: 'corporate', background: 'soft gray office background', attire: 'a navy blazer' },
      note: 'Builds 5 corporate prompts in different poses, all wearing the navy blazer against the gray background.',
    },
    {
      title: 'Creative portfolio',
      inputs: { profession: 'graphic designer', style: 'creative', background: 'colorful studio with plants', attire: 'a black turtleneck' },
      note: 'Builds 5 editorial-style prompts with the same designer, background and outfit across poses.',
    },
  ],
  faqs: [
    {
      question: 'Does this tool generate headshot photos?',
      answer:
        'No. It writes prompt text — five pose variations plus a negative-prompt line — that you paste into an image generator. Nothing here renders photos.',
    },
    {
      question: 'Why 5 prompts instead of one?',
      answer:
        'Different poses give you options to pick from: head-and-shoulders, three-quarter turn, candid laugh, seated and close-up. Generating a few variations is the normal workflow for headshots.',
    },
    {
      question: 'What is the negative prompt for?',
      answer:
        'It lists things to avoid — distorted faces, bad anatomy, watermarks, harsh shadows. Most image tools accept a negative prompt alongside the main prompt to reduce these artifacts.',
    },
    {
      question: 'Will the prompts look like me?',
      answer:
        'No — these are generic prompts describing a profession, not your face. For a likeness you need an image tool that supports reference photos or face-consistent generation.',
    },
    {
      question: 'Is the builder free?',
      answer:
        'Yes — completely free, no signup. It runs in your browser using fixed templates.',
    },
    {
      question: 'How does the ai headshot prompt work?',
      answer:
        'Enter your details using the inputs above and the ai headshot prompt calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai headshot prompt free to use?',
      answer:
        'Yes - this ai headshot prompt is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'Prompts are template-assembled text — review the wording and adjust details (age, ethnicity, accessories) for your needs.',
    'Output quality depends on the image generator you paste into; prompt syntax support varies by tool.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'AI Headshot Prompt Pack Builder 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/ai-headshot-prompt-pack-builder/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free ai headshot prompt 2026: 5 copy-ready headshot prompts with different poses and settings. Instant, private, and mobile-friendly. No signup - try it free!',
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
          name: 'AI Headshot Prompt Pack Builder',
          item: 'https://husnainblogger.com/tools/ai-tools/ai-headshot-prompt-pack-builder/',
        },
      ],
    },
  ],
};
