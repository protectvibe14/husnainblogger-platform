import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'photo',
    label: 'Your photo',
    type: 'file',
    required: true,
    accept: 'image/*',
    mediaKind: 'image',
    maxFileMB: 10,
  },
  {
    id: 'style',
    label: 'Cartoon style',
    type: 'select',
    required: false,
    options: ['3d animated', 'anime', 'comic-book'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'cartoon',
    label: 'Cartoonized image',
    type: 'download',
    description:
    'Free photo to cartoon 2026: Cartoon-style version of your photo (OpenRouter) or a cartoon illustration (HF/fal.ai). Fast, private now.',
  },
];

export const content: ToolContent = {
  title: 'Photo to Cartoon',
  description:
    'Turn photos into cartoons free with AI — get a cartoon-style version of your own photo in seconds. Cartoonize yours now!',
  howTo: [
    'Save your API key in the key vault above — OpenRouter, Hugging Face Inference, or fal.ai.',
    'Upload the photo you want cartoonized. Bright, clear photos with a visible subject work best.',
    'Pick a style: 3d animated, anime, or comic-book.',
    'Press Generate. Only the OpenRouter route restyles YOUR photo; Hugging Face and fal.ai draw a cartoon illustration from text instead.',
    'Preview the result and download it. Your photo is sent only to the provider you picked — never to us.',
  ],
  methodology:
    'Your browser calls YOUR key at the provider you pick. OpenRouter sends google/gemini-2.5-flash-image your photo (as an image_url data URL) plus a cartoon-restyling prompt (modalities image+text). Hugging Face (FLUX.1-schnell) and fal.ai (fal-ai/flux/schnell via the queue API: submit → poll → fetch result) generate a cartoon illustration from a text prompt only. HusnainBlogger has no backend — keys never leave your browser.',
  examples: [
    {
      title: 'Anime profile picture',
      inputs: { style: 'anime' },
      note: 'Upload a selfie and get an anime-style version for your social profiles.',
    },
    {
      title: 'Comic-book poster',
      inputs: { style: 'comic-book' },
      note: 'Bold ink outlines and halftone shading turn a photo into graphic-novel art.',
    },
  ],
  faqs: [
    {
      question: 'Is my API key safe?',
      answer:
        'Yes. Your key is stored only in your browser\'s localStorage and is sent directly to the provider you choose. HusnainBlogger is a static site with no backend — we cannot see, log, or store your key.',
    },
    {
      question: 'Will the cartoon look like my photo?',
      answer:
        'Only with the OpenRouter route, which restyles your actual uploaded photo while keeping its composition. Hugging Face and fal.ai generate a cartoon illustration from a text description — it will not be your photo in cartoon form. The tool tells you this before you generate.',
    },
    {
      question: 'Where does my photo go?',
      answer:
        'Nowhere except the provider you pick, as part of the generation request. It is never uploaded to HusnainBlogger (there is no server to upload to) and never stored by us.',
    },
    {
      question: 'How much does it cost?',
      answer:
        'Generation bills YOUR provider account: OpenRouter image calls cost roughly $0.05–$0.10 each, Hugging Face uses your inference credits, and fal.ai bills per megapixel. Check provider pricing before generating in volume.',
    },
    {
      question: 'Is this affiliated with any animation studio?',
      answer:
        'No. Style names like "3d animated" are descriptive words only. This tool is not affiliated with, endorsed by, or connected to any animation studio.',
    },
      {
      question: 'Is this photo to cartoon tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
    {
      question: 'How do I use this photo to cartoon tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
  ],
  assumptions: [
    'No key = no generation. Every provider call needs your own API key saved first.',
    'Only the OpenRouter route cartoonizes your uploaded photo — set expectations accordingly for the other routes.',
    'fal.ai browser calls are not officially supported by fal.ai; CORS blocking is a known possibility, not a bug in this tool.',
  ],
  jsonLd: [],
};

export const aiConfig: AiToolConfig = {
  lane: 'D',
  headline: 'Photo-to-cartoon with YOUR API key — your photo restyled on OpenRouter, illustrations on HF/fal.ai.',
  providers: ['openrouter', 'hf-inference', 'falai'],
  disclosures: [
    'Bring-your-own-key: every generation bills YOUR provider account. No key = no generation.',
    'Honesty: only OpenRouter cartoonizes YOUR uploaded photo. Hugging Face and fal.ai draw a cartoon illustration from text.',
    'Your photo is sent only to the provider you pick. This site has no backend and cannot see it.',
    'fal.ai officially recommends a server proxy; direct browser calls may be blocked by CORS.',
    'Style names are descriptive words only — not affiliated with any animation studio.',
  ],
  noKeyHeadline: 'Save an API key to unlock the cartoonizer',
  noKeyBody:
    'This tool is fully built — the only missing piece is your key. Get a free key from OpenRouter, Hugging Face, or fal.ai (links above), paste it into the key vault, and press Save. Then upload your photo, press Generate, and it works immediately. For a cartoon of YOUR photo (not a generic illustration), pick OpenRouter.',
};
