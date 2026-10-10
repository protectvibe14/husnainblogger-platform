import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'prompt',
    label: 'Image prompt',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. a cozy bookshop interior at dusk, warm lamplight, watercolor style',
  },
  {
    id: 'aspect',
    label: 'Aspect ratio',
    type: 'select',
    required: false,
    options: ['square', 'landscape', 'portrait', 'wide'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'image',
    label: 'Generated image',
    type: 'download',
    description:
    'Free ai image generator 2026: AI-generated image from your prompt, shown on the page with a download button. Fast, private now.',
  },
  {
    id: 'provider',
    label: 'Provider used',
    type: 'text',
    description:
    'Which of your connected providers generated the image (OpenRouter, Hugging Face or fal.ai).',
  },
];

export const content: ToolContent = {
  title: 'Ai Image Generator',
  description:
    'Generate AI images from your prompt free — shown on the page with a download button, fast and private. Create yours now!',
  howTo: [
    'Save your API key in the key vault above — OpenRouter, Hugging Face Inference, or fal.ai (your key stays in this browser only).',
    'Describe the image you want in the prompt box. Concrete details (subject, lighting, style) give better results.',
    'Pick an aspect ratio: square for social posts, landscape for banners, portrait for pins.',
    'Press Generate. Hugging Face answers in seconds; fal.ai queues the job and this page polls until the image is ready.',
    'Preview the result, then Download it or open it full size. The file name includes the date so it is easy to file.',
    'Not happy with it? Refine the prompt with more specific detail and generate again — every run bills your own provider account.',
  ],
  methodology:
    'Your browser calls YOUR key at the provider you pick: OpenRouter (google/gemini-2.5-flash-image, modalities image+text), Hugging Face Inference (FLUX.1-schnell, returns image bytes converted locally), or fal.ai (FLUX.1 schnell via the queue API: submit → poll status → fetch result). HusnainBlogger has no backend — keys never leave your browser, and generation only works after you save a key.',
  examples: [
    {
      title: 'Blog hero image',
      inputs: { prompt: 'minimal flat illustration of a desk with a laptop and coffee, warm morning light', aspect: 'landscape' },
      note: 'Produces a wide banner-style illustration you can drop straight into a blog post.',
    },
    {
      title: 'Social post art',
      inputs: { prompt: 'cute robot reading a book under a tree, soft watercolor, pastel colors', aspect: 'square' },
      note: 'Produces a square illustration sized for Instagram and Facebook feeds.',
    },
  ],
  faqs: [
    {
      question: 'Is my API key safe?',
      answer:
        'Yes. Your key is stored only in your browser\'s localStorage and is sent directly to the provider you choose (OpenRouter, Hugging Face or fal.ai). HusnainBlogger is a static site with no backend — we cannot see, log, or store your key.',
    },
    {
      question: 'Is this AI image generator free?',
      answer:
        'The tool itself is free, but image generation bills YOUR provider account. OpenRouter charges roughly $0.05–$0.10 per image; Hugging Face includes a small monthly inference credit; fal.ai FLUX schnell costs a fraction of a cent per megapixel. Check each provider\'s pricing before generating in volume.',
    },
    {
      question: 'Which provider should I pick?',
      answer:
        'OpenRouter is the most reliable from a browser (it documents direct browser calls). Hugging Face is cheapest on the free allowance but models can cold-start with a 503. fal.ai is pay-as-you-go and officially recommends a server proxy, so your browser may block it — the tool will tell you if that happens.',
    },
    {
      question: 'Why did fal.ai fail with a network error?',
      answer:
        'fal.ai officially recommends calling through your own server proxy, so some browsers block the direct call (CORS). If you see a network error, switch to OpenRouter or Hugging Face, or run the same request from your own computer with the same key.',
    },
    {
      question: 'Who owns the images I generate?',
      answer:
        'Ownership is set by the provider whose key you use, not by this tool. Check OpenRouter\'s, Hugging Face\'s or fal.ai\'s terms for the model you pick before using images commercially.',
    },
      {
      question: 'How do I create ai image generator?',
      answer: 'Describe what you need in the input fields, then click generate. You can regenerate as many times as you like and copy the version that fits best.',
    },
    {
      question: 'Can I customize the generated ai image generator?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
  ],
  assumptions: [
    'No key = no generation. The tool is fully wired, but every provider call needs your own API key saved first.',
    'Output quality depends on the model and your prompt — the tool does not enhance or upscale results.',
    'fal.ai browser calls are not officially supported by fal.ai; CORS blocking is a known possibility, not a bug in this tool.',
  ],
  jsonLd: [],
};

export const aiConfig: AiToolConfig = {
  lane: 'D',
  headline: 'Text-to-image generation with YOUR API key — no signup, no backend, nothing to hack.',
  providers: ['openrouter', 'hf-inference', 'falai'],
  disclosures: [
    'Bring-your-own-key: every generation bills YOUR provider account. No key = no generation.',
    'OpenRouter image calls cost roughly $0.05–$0.10 per image (google/gemini-2.5-flash-image).',
    'Hugging Face uses your inference credits; FLUX.1-schnell can cold-start — wait and retry on 503.',
    'fal.ai officially recommends a server proxy; direct browser calls may be blocked by CORS. fal.ai model endpoint: fal-ai/flux/schnell (verified 2026-10-01).',
  ],
  noKeyHeadline: 'Save an API key to unlock image generation',
  noKeyBody:
    'This tool is fully built — the only missing piece is your key. Get a free key from OpenRouter, Hugging Face, or fal.ai (links above), paste it into the key vault, and press Save. Then press Generate and it works immediately — nothing else to configure.',
};
