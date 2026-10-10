import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { getProviderInfo } from '../../../src/lib/ai/providers.ts';
import { getProviders } from './logic.ts';

export const inputs: ToolInput[] = [
  {
    id: 'message',
    label: 'Your message',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. Explain compound interest in simple terms',
  },
  {
    id: 'provider',
    label: 'Provider',
    type: 'select',
    required: true,
    options: ['gemini', 'groq', 'openrouter', 'llm7'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'reply',
    label: 'AI reply',
    type: 'text',
    description:
    'Free free ai chatbot with api key 2026: The assistant answer returned by the provider you chose. Get instant results. free now.',
  },
];


export const content: ToolContent = {
  title: 'Free AI Chatbot (BYOK)',
  description:
    'Chat with AI using your own free Gemini, Groq, or OpenRouter key — or try the keyless demo lane. Your key stays in your browser., no cost to us.',
  howTo: [
    'Pick a provider below (Gemini, Groq, OpenRouter) and paste your free API key — or choose the keyless llm7.io demo lane.',
    'Type your message in the box and click Generate.',
    'Read the assistant reply; use Copy to grab it for your notes.',
    'Every message is answered on its own — this is a single-turn demo chat with no conversation memory.',
  ],
  methodology:
    'This tool calls the provider YOU choose with YOUR key. Your message is sent by your own browser directly to that provider\'s API (Gemini, Groq, OpenRouter, or llm7.io) — the key travels in the Authorization header or the ?key= query parameter and is never sent to our servers. The site is static, so there is no backend that could see it. The model answers with its own knowledge; nothing on this page browses the web.',
  examples: [
    {
      title: 'Quick explainer',
      inputs: { message: 'Explain compound interest in simple terms' },
      note: 'Returns a short plain-language explanation of compound interest.',
    },
    {
      title: 'Writing help',
      inputs: { message: 'Give me 5 subject lines for a newsletter about budgeting' },
      note: 'Returns five newsletter subject-line ideas about budgeting.',
    },
  ],
  faqs: [
    {
      question: 'Is this AI chatbot really free?',
      answer:
        'Yes for you — the site charges nothing and runs no servers. You bring a free-tier key from Gemini (AI Studio), Groq, or OpenRouter, and usage counts against that provider\'s free quota on your own account. The keyless llm7.io demo lane needs no key at all but is community-run with no uptime guarantee.',
    },
    {
      question: 'Where does my API key go?',
      answer:
        'Nowhere except the provider you choose. It is stored only in your browser\'s localStorage and sent directly to the provider\'s API in the Authorization header (Groq/OpenRouter) or the ?key= parameter (Gemini). This site is static — there is no server that could receive or log it.',
    },
    {
      question: 'Does the chatbot remember my earlier messages?',
      answer:
        'No. This is a single-turn demo: each message is answered independently with no conversation memory. If you need follow-ups, include the context in your new message.',
    },
    {
      question: 'Which provider should I pick?',
      answer:
        'Gemini (AI Studio) has the most generous free tier with no credit card. Groq is very fast with per-minute caps. OpenRouter routes to many models through one key. If you just want to try without any key, use the llm7.io demo lane — it is slower and rate-limited.',
    },
    {
      question: 'Can the AI browse the web or see real-time data?',
      answer:
        'No. The assistant answers from its training knowledge only. Treat answers as a starting point and verify anything important — especially prices, dates, and facts that change.',
    },
    {
      question: 'How does the free ai chatbot with api key work?',
      answer:
        'Enter your details using the inputs above and the free ai chatbot with api key calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the free ai chatbot with api key free to use?',
      answer:
        'Yes - this free ai chatbot with api key is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'The assistant has no web access and no memory of previous messages; answers reflect the model\'s training, not live information.',
    'AI output can be wrong or outdated — verify anything important before acting on it.',
    'The keyless llm7.io lane is a community-run demo with no SLA; it may be slow, rate-limited, or unavailable.',
  ],
  jsonLd: [],
};

export const aiConfig: AiToolConfig = {
  lane: 'B',
  headline:
    'Uses YOUR free Gemini/Groq/OpenRouter key — or the keyless llm7.io demo lane. Nothing runs until you choose.',
  providers: getProviders(),
  disclosures: [
    ...getProviders().map((pid) => {
      const info = getProviderInfo(pid);
      return info ? info.name + ': ' + info.freeTier + ' ' + info.costNote : pid;
    }),
    'Your key never leaves your browser except to the provider you choose — it is stored in localStorage and sent only in the Authorization header (Groq/OpenRouter) or the ?key= query parameter (Gemini).',
  ],
};
