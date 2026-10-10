import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { getProviderInfo } from '../../../src/lib/ai/providers.ts';
import { getProviders } from './logic.ts';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Video topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. 5 budget travel hacks for students',
  },
  {
    id: 'platform',
    label: 'Platform',
    type: 'select',
    required: true,
    options: ['youtube', 'tiktok', 'instagram-reels', 'youtube-shorts'],
  },
  {
    id: 'duration',
    label: 'Video length',
    type: 'select',
    required: true,
    options: ['under-60s', '2-5-min', '10-plus-min'],
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['casual', 'professional', 'energetic', 'educational'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'script',
    label: 'Video script',
    type: 'text',
    description:
    'Free ai video script generator 2026: The generated result, ready to copy. free.',
  },
];

export const content: ToolContent = {
  title: 'AI Video Script Generator',
  description:
    'Generate a complete video script — hook, beats, and call to action — for YouTube, TikTok, or Reels with your own free Gemini, Groq, or OpenRouter key.,.',
  howTo: [
    'Describe your video topic in a few words.',
    'Pick the platform, video length, and tone.',
    'Pick a provider, paste your free API key, and click Generate Script.',
    'Copy the script and adapt it to your voice before recording.',
  ],
  methodology:
    'This tool calls the provider YOU choose with YOUR key. Your topic is sent by your own browser directly to that provider\'s API — the key travels in the Authorization header (Groq/OpenRouter) or the ?key= parameter (Gemini) and is never sent to our servers. The site is static, so there is no backend that could see it. The model writes a structured script (hook, beats, call to action) in the tone and length you picked, without inventing statistics or quotes.',
  examples: [
    {
      title: 'YouTube explainer',
      inputs: { topic: 'how credit scores work', platform: 'youtube', duration: '2-5-min', tone: 'educational' },
      note: 'Returns a structured script with a hook, explainers beats, and a call to action.',
    },
    {
      title: 'TikTok quick tip',
      inputs: { topic: 'morning routine for productivity', platform: 'tiktok', duration: 'under-60s', tone: 'energetic' },
      note: 'Returns a punchy under-60-second script with fast beats.',
    },
  ],
  faqs: [
    {
      question: 'Is the AI video script generator free?',
      answer:
        'Yes. The site charges nothing. You bring a free-tier key from Gemini (AI Studio), Groq, or OpenRouter, and usage counts against that provider\'s free quota on your own account.',
    },
    {
      question: 'How long can the generated script be?',
      answer:
        'Up to the model\'s token limit — roughly a few minutes of spoken script. Very long scripts may be cut off; if that happens, generate in two parts.',
    },
    {
      question: 'Where does my topic and API key go?',
      answer:
        'Only to the provider you choose. Your topic and key are sent by your browser directly to the provider\'s API; the key is stored in localStorage. This site is static — there is no server that could receive, log, or store either.',
    },
    {
      question: 'Can I use the script as-is for my video?',
      answer:
        'It is a first draft. Fact-check any claims, adapt it to your voice, and make sure it fits your video\'s pacing before recording.',
    },
    {
      question: 'Does it store or train on my topic?',
      answer:
        'Not on our side — we have no backend to store it with. What the provider does with API content is governed by that provider\'s own policy; avoid pasting sensitive material.',
    },
    {
      question: 'How does the ai video script generator work?',
      answer:
        'Enter your details using the inputs above and the ai video script generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai video script generator free to use?',
      answer:
        'Yes - this ai video script generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'The script is a first draft — fact-check claims and adapt it to your voice before recording.',
    'The model is instructed not to invent statistics or quotes; verify anything specific you publish.',
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
