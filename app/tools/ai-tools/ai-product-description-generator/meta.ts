import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { getProviderInfo } from '../../../src/lib/ai/providers.ts';
import { getProviders } from './logic.ts';

export const inputs: ToolInput[] = [
  {
    id: 'product',
    label: 'Product name',
    type: 'text',
    required: true,
    placeholder: 'e.g. bamboo cutting board set',
  },
  {
    id: 'features',
    label: 'Key features (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'e.g. 3 sizes, juice groove, food-safe oil finish',
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['persuasive', 'professional', 'playful', 'luxury'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'description',
    label: 'Product description',
    type: 'text',
    description:
    'Free ai product description generator 2026: The generated result, ready to copy. free.',
  },
];

export const content: ToolContent = {
  title: 'AI Product Description Generator',
  description:
    'Write compelling ecommerce product descriptions in any tone — under 150 words, benefit-led — with your own free Gemini, Groq, or OpenRouter key.,.',
  howTo: [
    'Enter your product name and key features.',
    'Pick a tone (persuasive, professional, playful, or luxury).',
    'Pick a provider, paste your free API key, and click Generate Description.',
    'Copy it and check every claim against your real product.',
  ],
  methodology:
    'This tool calls the provider YOU choose with YOUR key. Your product details are sent by your own browser directly to that provider\'s API — the key travels in the Authorization header (Groq/OpenRouter) or the ?key= parameter (Gemini) and is never sent to our servers. The site is static, so there is no backend that could see it. The model writes a benefit-led description under 150 words in your chosen tone, using only the features you provided — it is instructed never to invent specifications, materials, certifications, or reviews.',
  examples: [
    {
      title: 'Kitchen product',
      inputs: { product: 'bamboo cutting board set', features: '3 sizes, juice groove, food-safe oil finish', tone: 'persuasive' },
      note: 'Returns a benefit-led description under 150 words using only the given features.',
    },
    {
      title: 'Luxury tone',
      inputs: { product: 'hand-poured soy candle', features: '40-hour burn, cedar and amber scent', tone: 'luxury' },
      note: 'Returns a luxury-toned description of the candle.',
    },
  ],
  faqs: [
    {
      question: 'Is the AI product description generator free?',
      answer:
        'Yes. The site charges nothing. You bring a free-tier key from Gemini (AI Studio), Groq, or OpenRouter, and usage counts against that provider\'s free quota on your own account.',
    },
    {
      question: 'Will it invent features for my product?',
      answer:
        'No — it is instructed to use only the features you provide. Still, check every claim against your real product before publishing.',
    },
    {
      question: 'Where does my product info and API key go?',
      answer:
        'Only to the provider you choose. Your details and key are sent by your browser directly to the provider\'s API; the key is stored in localStorage. This site is static — there is no server that could receive, log, or store either.',
    },
    {
      question: 'How long is the description?',
      answer:
        'Under 150 words — long enough to sell, short enough for product pages. Edit to match your store\'s voice.',
    },
    {
      question: 'Does it store or train on my product info?',
      answer:
        'Not on our side — we have no backend to store it with. What the provider does with API content is governed by that provider\'s own policy; avoid pasting unreleased product details you consider confidential.',
    },
  ],
  assumptions: [
    'Only the features you provide are described — the model never invents specs, materials, or reviews.',
    'Check every claim against your real product before publishing; invented claims are deceptive.',
    'Avoid pasting unreleased product details you consider confidential.',
  ],
  jsonLd: [],
};

export const aiConfig: AiToolConfig = {
  lane: 'B',
  headline: 'Uses YOUR free Gemini/Groq/OpenRouter key — nothing runs until you paste one.',
  providers: getProviders(),
  disclosures: [
    ...getProviders().map((pid) => {
      const info = getProviderInfo(pid);
      return info ? info.name + ': ' + info.freeTier + ' ' + info.costNote : pid;
    }),
    'Your key never leaves your browser except to the provider you choose — it is stored in localStorage and sent only in the Authorization header (Groq/OpenRouter) or the ?key= query parameter (Gemini).',
  ],
};
