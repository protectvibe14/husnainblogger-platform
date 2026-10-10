import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const categoryOptions = [
  'All categories (60 phrases)',
  'Photorealism artifacts',
  'Anatomy',
  'Text & typography',
  'Cartoon style',
  'Lighting & exposure',
  'Composition',
];

const useCaseOptions = [
  'No preset — use the category list',
  'Photorealistic images',
  'Portraits',
  'Anime / illustration',
  'Product shots',
  'Landscapes',
  'Everything (all 60)',
];

export const inputs: ToolInput[] = [
  {
    id: 'categoryId',
    label: 'Category',
    type: 'select',
    required: false,
    options: categoryOptions,
  },
  {
    id: 'useCaseId',
    label: 'Use-case preset',
    type: 'select',
    required: false,
    options: useCaseOptions,
  },
  {
    id: 'customPhrases',
    label: 'Your own phrases (comma-separated, optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. dark mood, film poster style',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'items',
    label: 'Library phrases',
    type: 'list',
    description:
    'Free negative prompt list 2026: The curated negative-prompt phrases for your category filter. free.',
  },
  {
    id: 'combinedPrompt',
    label: 'Combined negative prompt',
    type: 'copy',
    description:
    'Base openers + library phrases + your custom phrases, ready to paste.',
  },
  {
    id: 'useCaseRecommended',
    label: 'Use-case recommendations',
    type: 'list',
    description:
    'The phrase set recommended for the selected use-case preset.',
  },
];

export const content: ToolContent = {
  title: 'Negative Prompt List',
  description:
    'Browse the free negative prompt library — curated negative-prompt phrases for every category, ready to copy. Find yours now!',
  howTo: [
    'Pick a category to browse its 10 curated negative-prompt phrases.',
    'Optionally choose a use-case preset (portraits, product shots…) to get a recommended phrase set.',
    'Add your own comma-separated phrases to personalize the result.',
    'Copy the combined negative prompt and paste it into your image generator’s negative prompt field.',
    'Remove any phrase that conflicts with your intended style before generating.',
  ],
  methodology:
    'A fixed data bank of 60 hand-curated phrases in 6 categories (photorealism artifacts, anatomy, text & typography, cartoon style, lighting & exposure, composition — 10 each). Category filtering, use-case preset mapping and prompt combining are plain list/string operations. Base openers "worst quality, low quality, ugly" are prepended to every build. Runs entirely in your browser — no AI model, no generation, no server calls.',
  examples: [
    {
      title: 'Portrait session',
      inputs: { categoryId: 'Anatomy', useCaseId: 'Portraits', customPhrases: '' },
      note: 'Returns the 10 anatomy phrases plus the portraits preset (anatomy + lighting + composition) in the combined prompt.',
    },
    {
      title: 'Product shot',
      inputs: { categoryId: 'All categories (60 phrases)', useCaseId: 'Product shots', customPhrases: 'cluttered shelf' },
      note: 'All 60 phrases browsable; the combined prompt merges the product-shot preset with your custom "cluttered shelf" phrase.',
    },
  ],
  faqs: [
    {
      question: 'What is a negative prompt?',
      answer:
        'A negative prompt tells an image generator what to avoid — artifacts like extra fingers, watermarks or blurry output. You paste it into the negative-prompt field (supported by Stable Diffusion, Flux and most UIs); Midjourney users use the --no parameter instead.',
    },
    {
      question: 'Do negative prompts work on every image model?',
      answer:
        'Mostly on Stable Diffusion/SDXL and Flux interfaces that expose a negative-prompt field. Midjourney accepts them via --no, while DALL-E 3 has no negative-prompt input — there you phrase the avoidance positively in the main prompt.',
    },
    {
      question: 'Should I use all 60 phrases at once?',
      answer:
        'No — long negative lists can fight your intended style. Start from a use-case preset, then delete anything that overlaps with the look you actually want (for example, remove cartoon-style exclusions if you want a stylized render).',
    },
    {
      question: 'Are these phrases AI-generated?',
      answer:
        'No. They are a fixed, hand-curated word bank of common artifact descriptions. The tool only filters, maps and joins them — it never generates new phrases.',
    },
    {
      question: 'What is a negative prompt list?',
      answer:
        'A negative prompt list is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Phrases are generic English artifact descriptions; effectiveness varies by model and version.',
    'Use-case presets are fixed mappings — a starting point, not a guarantee for any specific generator.',
    'This is a reference list, not generation: always test a negative prompt on your own model.',
  ],
  jsonLd: [],
};
