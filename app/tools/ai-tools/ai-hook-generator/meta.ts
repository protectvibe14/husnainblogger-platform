import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { getProviderInfo } from '../../../src/lib/ai/providers.ts';
import { getProviders } from './logic.ts';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Video or post topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. how I saved $10k in a year',
  },
  {
    id: 'platform',
    label: 'Platform',
    type: 'select',
    required: true,
    options: ['youtube', 'tiktok', 'instagram', 'twitter-x', 'linkedin'],
  },
  {
    id: 'count',
    label: 'How many hooks',
    type: 'select',
    required: true,
    options: ['5', '10', '15'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'hooks',
    label: 'Hooks',
    type: 'text',
    description:
    'Free ai hook generator 2026: The generated result, ready to copy. free.',
  },
];

export const content: ToolContent = {
  title: 'AI Hook Generator',
  description:
    'Generate scroll-stopping opening hooks for YouTube, TikTok, Instagram, X, or LinkedIn with your own free Gemini, Groq, or OpenRouter key., nothing.',
  howTo: [
    'Describe your video or post topic.',
    'Pick the platform and how many hooks you want (5, 10, or 15).',
    'Pick a provider, paste your free API key, and click Generate Hooks.',
    'Copy your favorites and test them against your content.',
  ],
  methodology:
    'This tool calls the provider YOU choose with YOUR key. Your topic is sent by your own browser directly to that provider\'s API — the key travels in the Authorization header (Groq/OpenRouter) or the ?key= parameter (Gemini) and is never sent to our servers. The site is static, so there is no backend that could see it. The model writes exactly the number of one-line hooks you picked, tuned to the platform, without inventing statistics or quotes.',
  examples: [
    {
      title: 'YouTube hooks',
      inputs: { topic: 'budget meal prep for beginners', platform: 'youtube', count: '10' },
      note: 'Returns 10 numbered one-line hooks tuned for YouTube.',
    },
    {
      title: 'TikTok hooks',
      inputs: { topic: 'study techniques that actually work', platform: 'tiktok', count: '5' },
      note: 'Returns 5 punchy hooks tuned for TikTok\'s fast scroll.',
    },
  ],
  faqs: [
    {
      question: 'Is the AI hook generator free?',
      answer:
        'Yes. The site charges nothing. You bring a free-tier key from Gemini (AI Studio), Groq, or OpenRouter, and usage counts against that provider\'s free quota on your own account.',
    },
    {
      question: 'How many hooks can I generate at once?',
      answer:
        '5, 10, or 15 per run. Run it again with a tweaked topic for more variety.',
    },
    {
      question: 'Where does my topic and API key go?',
      answer:
        'Only to the provider you choose. Your topic and key are sent by your browser directly to the provider\'s API; the key is stored in localStorage. This site is static — there is no server that could receive, log, or store either.',
    },
    {
      question: 'Will these hooks actually get clicks?',
      answer:
        'Hooks help, but the content must deliver on the promise — misleading clickbait hurts watch time and trust. Test several and keep what your analytics reward.',
    },
    {
      question: 'Does it store or train on my topic?',
      answer:
        'Not on our side — we have no backend to store it with. What the provider does with API content is governed by that provider\'s own policy.',
    },
      {
      question: 'What makes a good ai hook generator?',
      answer: 'Clarity, specificity, and relevance to your audience. Avoid generic phrases — the more specific your input, the better the output.',
    },
    {
      question: 'Can I customize the generated ai hook generator?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
  ],
  assumptions: [
    'Hooks are opening lines, not full scripts — pair them with content that delivers on the promise.',
    'Do not publish bold claims you cannot back up.',
    'Avoid pasting sensitive material; provider-side handling follows the provider\'s policy.',
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
