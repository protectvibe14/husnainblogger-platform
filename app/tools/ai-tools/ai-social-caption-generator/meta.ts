import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { getProviderInfo } from '../../../src/lib/ai/providers.ts';
import { getProviders } from './logic.ts';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Post topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. launching my new fitness coaching program',
  },
  {
    id: 'platform',
    label: 'Platform',
    type: 'select',
    required: true,
    options: ['instagram', 'tiktok', 'twitter-x', 'linkedin', 'facebook'],
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['casual', 'professional', 'funny', 'inspirational'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'captions',
    label: 'Captions',
    type: 'text',
    description:
    'Free ai social media caption generator 2026: The generated result, ready to copy. free.',
  },
];

export const content: ToolContent = {
  title: 'AI Social Caption Generator',
  description:
    'Write engaging captions for Instagram, TikTok, X, LinkedIn, or Facebook in any tone with your own free Gemini, Groq, or OpenRouter key., nothing uploaded.',
  howTo: [
    'Describe your post topic.',
    'Pick the platform and tone.',
    'Pick a provider, paste your free API key, and click Generate Captions.',
    'Copy your favorite and personalize it before posting.',
  ],
  methodology:
    'This tool calls the provider YOU choose with YOUR key. Your topic is sent by your own browser directly to that provider\'s API — the key travels in the Authorization header (Groq/OpenRouter) or the ?key= parameter (Gemini) and is never sent to our servers. The site is static, so there is no backend that could see it. The model writes 3 captions matched to the platform\'s conventions and your chosen tone, without inventing facts.',
  examples: [
    {
      title: 'Instagram launch',
      inputs: { topic: 'new handmade candle collection', platform: 'instagram', tone: 'casual' },
      note: 'Returns 3 casual Instagram captions with hashtags and a call to action.',
    },
    {
      title: 'LinkedIn professional',
      inputs: { topic: 'lessons from 5 years freelancing', platform: 'linkedin', tone: 'professional' },
      note: 'Returns 3 professional LinkedIn captions.',
    },
  ],
  faqs: [
    {
      question: 'Is the AI social caption generator free?',
      answer:
        'Yes. The site charges nothing. You bring a free-tier key from Gemini (AI Studio), Groq, or OpenRouter, and usage counts against that provider\'s free quota on your own account.',
    },
    {
      question: 'How many captions do I get per run?',
      answer:
        'Three. Change the tone or rephrase the topic and run again for more options.',
    },
    {
      question: 'Where does my topic and API key go?',
      answer:
        'Only to the provider you choose. Your topic and key are sent by your browser directly to the provider\'s API; the key is stored in localStorage. This site is static — there is no server that could receive, log, or store either.',
    },
    {
      question: 'Should I post the caption exactly as generated?',
      answer:
        'Personalize it first — add your voice, check the hashtags are active in your niche, and verify any specific claims.',
    },
    {
      question: 'Does it store or train on my topic?',
      answer:
        'Not on our side — we have no backend to store it with. What the provider does with API content is governed by that provider\'s own policy.',
    },
    {
      question: 'How does the ai social media caption generator work?',
      answer:
        'Enter your details using the inputs above and the ai social media caption generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai social media caption generator free to use?',
      answer:
        'Yes - this ai social media caption generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'You get 3 captions per run; rephrase the topic or change the tone for more.',
    'Hashtag suggestions are generic — check which tags are active in your niche.',
    'Avoid pasting sensitive material; provider-side handling follows the provider\'s policy.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'AI Social Caption Generator 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/ai-social-caption-generator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free ai social media caption generator 2026: The generated result, ready to copy. free.',
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
          name: 'AI Social Caption Generator',
          item: 'https://husnainblogger.com/tools/ai-tools/ai-social-caption-generator/',
        },
      ],
    },
  ],
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
