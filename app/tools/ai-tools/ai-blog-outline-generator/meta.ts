import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { getProviderInfo } from '../../../src/lib/ai/providers.ts';
import { getProviders } from './logic.ts';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Blog topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. beginner\'s guide to indoor plants',
  },
  {
    id: 'depth',
    label: 'Outline depth',
    type: 'select',
    required: true,
    options: ['basic', 'detailed', 'comprehensive'],
  },
  {
    id: 'audience',
    label: 'Target audience (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. busy parents, first-time founders',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'outline',
    label: 'Blog outline',
    type: 'text',
    description:
    'Free ai blog outline generator 2026: The generated result, ready to copy. free.',
  },
];

export const content: ToolContent = {
  title: 'AI Blog Outline Generator',
  description:
    'Create a structured blog outline — H2 sections, sub-points, and FAQs — at any depth with your own free Gemini, Groq, or OpenRouter key., nothing uploaded.',
  howTo: [
    'Describe your blog topic.',
    'Pick the outline depth and optionally your target audience.',
    'Pick a provider, paste your free API key, and click Generate Outline.',
    'Copy the outline and expand each section with your research.',
  ],
  methodology:
    'This tool calls the provider YOU choose with YOUR key. Your topic is sent by your own browser directly to that provider\'s API — the key travels in the Authorization header (Groq/OpenRouter) or the ?key= parameter (Gemini) and is never sent to our servers. The site is static, so there is no backend that could see it. The model builds a hierarchical outline (H2/H3) at the depth you picked, optionally angled to your audience, without inventing statistics or quotes.',
  examples: [
    {
      title: 'Beginner guide',
      inputs: { topic: 'email marketing for small businesses', depth: 'detailed', audience: 'small business owners' },
      note: 'Returns a detailed outline with sub-points angled to small business owners.',
    },
    {
      title: 'Comprehensive pillar',
      inputs: { topic: 'home workout routines', depth: 'comprehensive', audience: '' },
      note: 'Returns a 12+ section pillar-post outline with FAQs.',
    },
  ],
  faqs: [
    {
      question: 'Is the AI blog outline generator free?',
      answer:
        'Yes. The site charges nothing. You bring a free-tier key from Gemini (AI Studio), Groq, or OpenRouter, and usage counts against that provider\'s free quota on your own account.',
    },
    {
      question: 'What is the difference between the depths?',
      answer:
        'Basic gives 5–7 sections, detailed gives 8–12 with sub-points, comprehensive gives 12+ sections plus FAQs and a conclusion.',
    },
    {
      question: 'Where does my topic and API key go?',
      answer:
        'Only to the provider you choose. Your topic and key are sent by your browser directly to the provider\'s API; the key is stored in localStorage. This site is static — there is no server that could receive, log, or store either.',
    },
    {
      question: 'Can I publish the outline as-is?',
      answer:
        'No — it is a structure, not a finished post. Research each section, verify facts, and write it in your voice.',
    },
    {
      question: 'Does it store or train on my topic?',
      answer:
        'Not on our side — we have no backend to store it with. What the provider does with API content is governed by that provider\'s own policy.',
    },
    {
      question: 'How does the ai blog outline generator work?',
      answer:
        'Enter your details using the inputs above and the ai blog outline generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai blog outline generator free to use?',
      answer:
        'Yes - this ai blog outline generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'The outline is a starting structure — research and verify facts as you write each section.',
    'Any statistics in your post must come from real sources, not the outline.',
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
