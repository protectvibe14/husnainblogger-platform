import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'selfie',
    label: 'Your photo',
    type: 'file',
    required: true,
    accept: 'image/*',
    mediaKind: 'image',
    maxFileMB: 10,
  },
  {
    id: 'style',
    label: 'Headshot style',
    type: 'select',
    required: false,
    options: ['corporate', 'creative', 'studio'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'headshot',
    label: 'Generated headshot',
    type: 'download',
    description:
    'Free ai headshot generator 2026: AI-polished professional headshot with a download button. free.',
  },
  {
    id: 'provider',
    label: 'Provider used',
    type: 'text',
    description:
    'Which of your connected providers generated the headshot.',
  },
];

export const content: ToolContent = {
  title: 'Ai Headshot Generator',
  description:
    'Turn a selfie into a professional AI headshot with your own API key. OpenRouter edits your photo; Hugging Face and fal.ai generate from text.',
  howTo: [
    'Save your API key in the key vault above — OpenRouter, Hugging Face Inference, or fal.ai.',
    'Upload a clear, front-facing selfie. Good lighting and a plain background give the best edits.',
    'Pick a style: corporate (LinkedIn-ready), creative (editorial), or studio (dramatic).',
    'Press Generate. Only the OpenRouter route edits YOUR photo; Hugging Face and fal.ai generate a headshot from text instead.',
    'Preview the result and download it. Your selfie is sent only to the provider you picked — never to us.',
  ],
  methodology:
    'Your browser calls YOUR key at the provider you pick. OpenRouter sends google/gemini-2.5-flash-image your selfie (as an image_url data URL) plus a likeness-preserving prompt (modalities image+text). Hugging Face (FLUX.1-schnell) and fal.ai (fal-ai/flux/schnell via the queue API) generate a headshot from a text prompt only — they do not preserve your face. HusnainBlogger has no backend — keys never leave your browser.',
  examples: [
    {
      title: 'LinkedIn profile photo',
      inputs: { style: 'corporate' },
      note: 'Upload a selfie and get a business-ready headshot with a neutral studio backdrop.',
    },
    {
      title: 'Creative portfolio shot',
      inputs: { style: 'creative' },
      note: 'A warmer, editorial-style portrait for creator profiles and about pages.',
    },
  ],
  faqs: [
    {
      question: 'Is my API key safe?',
      answer:
        'Yes. Your key is stored only in your browser\'s localStorage and is sent directly to the provider you choose. HusnainBlogger is a static site with no backend — we cannot see, log, or store your key.',
    },
    {
      question: 'Will the headshot look like me?',
      answer:
        'Only with the OpenRouter route, which edits your actual selfie while keeping your identity. Hugging Face and fal.ai generate a headshot from a text description — the result will be a professional-looking stranger, not you. The tool labels this clearly before you generate.',
    },
    {
      question: 'Where does my selfie go?',
      answer:
        'Nowhere except the provider you pick, as part of the generation request. It is never uploaded to HusnainBlogger (there is no server to upload to) and never stored by us.',
    },
    {
      question: 'How much does it cost?',
      answer:
        'Generation bills YOUR provider account: OpenRouter image calls cost roughly $0.05–$0.10 each, Hugging Face uses your inference credits, and fal.ai bills per megapixel. Check provider pricing before generating in volume.',
    },
    {
      question: 'Can I use someone else\'s photo?',
      answer:
        'No — upload only your own photo, or a photo you have explicit permission to edit. Never generate headshots of other people without consent.',
    },
  ],
  assumptions: [
    'No key = no generation. Every provider call needs your own API key saved first.',
    'Likeness preservation is only available on the OpenRouter route — set expectations accordingly.',
    'fal.ai browser calls are not officially supported by fal.ai; CORS blocking is a known possibility, not a bug in this tool.',
  ],
  jsonLd: [],
};

export const aiConfig: AiToolConfig = {
  lane: 'D',
  headline: 'Professional AI headshots with YOUR API key — photo editing on OpenRouter, text-to-image on HF/fal.ai.',
  providers: ['openrouter', 'hf-inference', 'falai'],
  disclosures: [
    'Bring-your-own-key: every generation bills YOUR provider account. No key = no generation.',
    'Likeness honesty: only OpenRouter edits YOUR selfie. Hugging Face and fal.ai generate from text — they will not look like you.',
    'Your photo is sent only to the provider you pick. This site has no backend and cannot see it.',
    'fal.ai officially recommends a server proxy; direct browser calls may be blocked by CORS.',
  ],
  noKeyHeadline: 'Save an API key to unlock headshot generation',
  noKeyBody:
    'This tool is fully built — the only missing piece is your key. Get a free key from OpenRouter, Hugging Face, or fal.ai (links above), paste it into the key vault, and press Save. Then upload your selfie, press Generate, and it works immediately. For a headshot that looks like you, pick OpenRouter.',
};
