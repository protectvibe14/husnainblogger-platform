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
    placeholder: 'e.g. I tried waking up at 5am for 30 days',
  },
  {
    id: 'style',
    label: 'Title style',
    type: 'select',
    required: true,
    options: ['curiosity-gap', 'how-to', 'listicle', 'bold-claim', 'question'],
  },
  {
    id: 'count',
    label: 'How many titles',
    type: 'select',
    required: true,
    options: ['5', '10'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'titles',
    label: 'Titles',
    type: 'text',
    description:
    'Free ai thumbnail title generator 2026: The generated result, ready to copy. free.',
  },
];

export const content: ToolContent = {
  title: 'AI Thumbnail Title Generator',
  description:
    'Generate clickable YouTube titles in 5 proven styles — curiosity gap, how-to, listicle, bold claim, or question — with your own free Gemini, Groq, or.',
  howTo: [
    'Describe your video topic.',
    'Pick a title style and how many titles you want (5 or 10).',
    'Pick a provider, paste your free API key, and click Generate Titles.',
    'Copy your favorites and A/B test them.',
  ],
  methodology:
    'This tool calls the provider YOU choose with YOUR key. Your topic is sent by your own browser directly to that provider\'s API — the key travels in the Authorization header (Groq/OpenRouter) or the ?key= parameter (Gemini) and is never sent to our servers. The site is static, so there is no backend that could see it. The model writes exactly the number of titles you picked in the style you chose, each under 60 characters, without inventing statistics or quotes.',
  examples: [
    {
      title: 'Curiosity gap',
      inputs: { topic: 'sourdough bread for beginners', style: 'curiosity-gap', count: '10' },
      note: 'Returns 10 curiosity-driven titles under 60 characters.',
    },
    {
      title: 'How-to',
      inputs: { topic: 'fix a slow laptop', style: 'how-to', count: '5' },
      note: 'Returns 5 how-to titles under 60 characters.',
    },
  ],
  faqs: [
    {
      question: 'Is the AI thumbnail title generator free?',
      answer:
        'Yes. The site charges nothing. You bring a free-tier key from Gemini (AI Studio), Groq, or OpenRouter, and usage counts against that provider\'s free quota on your own account.',
    },
    {
      question: 'Why are titles kept under 60 characters?',
      answer:
        'YouTube cuts longer titles off in search results, which kills click-through. Every title here stays within the visible limit.',
    },
    {
      question: 'Where does my topic and API key go?',
      answer:
        'Only to the provider you choose. Your topic and key are sent by your browser directly to the provider\'s API; the key is stored in localStorage. This site is static — there is no server that could receive, log, or store either.',
    },
    {
      question: 'Will these titles actually get clicks?',
      answer:
        'Style helps, but the title must match the video — misleading titles hurt watch time. A/B test several and keep what your analytics reward.',
    },
    {
      question: 'Does it store or train on my topic?',
      answer:
        'Not on our side — we have no backend to store it with. What the provider does with API content is governed by that provider\'s own policy.',
    },
    {
      question: 'How does the ai thumbnail title generator work?',
      answer:
        'Enter your details using the inputs above and the ai thumbnail title generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai thumbnail title generator free to use?',
      answer:
        'Yes - this ai thumbnail title generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'Every title stays under 60 characters so it is not cut off in search results.',
    'Titles must match the actual video — misleading titles hurt watch time and trust.',
    'Avoid pasting sensitive material; provider-side handling follows the provider\'s policy.',
  ],
  jsonLd: [
        {
          '@type': 'ListItem',
          position: 4,
          name: 'AI Thumbnail Title Generator',
          item: 'https://husnainblogger.com/tools/ai-tools/ai-thumbnail-title-generator/',
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
