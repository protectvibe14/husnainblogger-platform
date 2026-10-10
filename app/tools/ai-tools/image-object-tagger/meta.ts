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
    label: 'Photo to tag',
    type: 'file',
    required: true,
    accept: 'image/*',
    mediaKind: 'image',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'tags',
    label: 'Object tags',
    type: 'list',
    description:
    'Free image object tagger 2026: Top 8 predicted object labels with confidence scores. free.',
  },
  {
    id: 'honestyNote',
    label: 'About this result',
    type: 'text',
    description:
    'What this classifier can and cannot do.',
  },
];

export const content: ToolContent = {
  title: 'Image Object Tagger: Free Online',
  description:
    'Tag objects in any photo with a free on-device image classifier. Top-8 labels with confidence bars — no uploads and no API key needed, ever.',
  howTo: [
    'Upload a photo (PNG, JPG — under 25 MB).',
    'Wait for the on-device model to download (~70 MB, once) and analyze it.',
    'Review the top-8 predicted labels with confidence bars.',
    'Use the tags for organizing photos or drafting alt text.',
    'Remember: scores are model confidence, not certainty.',
  ],
  methodology:
    'Runs the Xenova/vit-base-patch16-224 image-classification model (Apache-2.0, ~70 MB) directly in your browser via Transformers.js: a Vision Transformer trained on ImageNet-1k assigns your photo probabilities across 1,000 everyday object classes, and the top 8 are shown with their scores. Nothing is uploaded; the page is explicit that labels are the nearest generic class and the top label can be wrong.',
  examples: [
    {
      title: 'Pet photo',
      inputs: { image: '(an uploaded photo of a cat)' },
      note: 'Returns labels like "tabby" / "tiger cat" with confidence scores.',
    },
    {
      title: 'Street scene',
      inputs: { image: '(an uploaded photo of a street)' },
      note: 'Returns the most prominent recognized objects — cars, buildings, signs — as ranked tags.',
    },
  ],
  faqs: [
    {
      question: 'Is my photo uploaded anywhere?',
      answer:
        'No. The classifier downloads once to your browser and runs entirely on your device. Your photo never leaves your computer or phone.',
    },
    {
      question: 'What objects can it recognize?',
      answer:
        '1,000 everyday ImageNet classes — common animals, vehicles, foods, household items and scenes. Rare, niche or very small objects get the nearest generic label instead.',
    },
    {
      question: 'How accurate are the tags?',
      answer:
        'Good on clear photos of common objects; weaker on unusual subjects, cluttered scenes and tiny details. Treat the scores as the model’s confidence, not ground truth.',
    },
    {
      question: 'Why is the first run slow?',
      answer:
        'The browser downloads ~70 MB of model weights the first time. After that the model is cached and later runs start much faster, even offline.',
    },
    {
      question: 'How does the image object tagger work?',
      answer:
        'Enter your details using the inputs above and the image object tagger calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the image object tagger free to use?',
      answer:
        'Yes - this image object tagger is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an image object tagger?',
      answer:
        'An image object tagger is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Labels come from 1,000 everyday ImageNet classes — unusual objects get the nearest generic label.',
    'Scores are model confidence, not certainty — the top label can be wrong.',
    'Single dominant-subject photos work best; crowded scenes dilute the ranking.',
  ],
  jsonLd: [
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Image Object Tagger',
          item: 'https://husnainblogger.com/tools/ai-tools/image-object-tagger/',
        },
      ],
    },
  ],
};
