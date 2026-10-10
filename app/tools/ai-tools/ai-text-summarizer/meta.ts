import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { getProviderInfo } from '../../../src/lib/ai/providers.ts';
import { getProviders } from './logic.ts';

export const inputs: ToolInput[] = [
  {
    id: 'length',
    label: 'Summary length',
    type: 'select',
    required: true,
    options: ['one-line', 'three-bullets', 'short-paragraph'],
  },
  {
    id: 'text',
    label: 'Text to summarize',
    type: 'textarea',
    required: true,
    placeholder: 'Paste an article, report, or long text (up to 8,000 characters)',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'summary',
    label: 'Summary',
    type: 'text',
    description:
    'Free ai text summarizer 2026: The summary in the length you picked: one line, 3 bullets, or a short paragraph. Fast, private now.',
  },
];


export const content: ToolContent = {
  title: 'AI Text Summarizer',
  description:
    'Summarize long articles with this AI text summarizer — one line, 3 bullets, or a short paragraph using your own free Gemini key. Try it now!',
  howTo: [
    'Pick a summary length: one line, 3 bullets, or a short paragraph.',
    'Paste the text (at least 50 characters, up to 8,000).',
    'Pick a provider, paste your free API key, and click Generate.',
    'Copy the summary — and skim the original before quoting it.',
  ],
  methodology:
    'This tool calls the provider YOU choose with YOUR key. Your text is sent by your own browser directly to that provider\'s API — the key travels in the Authorization header (Groq/OpenRouter) or the ?key= parameter (Gemini) and is never sent to our servers. The site is static, so there is no backend that could see it. The model condenses your text into the shape you picked, preserving key facts and adding nothing that was not in the text.',
  examples: [
    {
      title: 'News article',
      inputs: { length: 'three-bullets', text: 'A long news article about interest rate changes...' },
      note: 'Returns exactly 3 bullet points capturing the article’s key facts.',
    },
    {
      title: 'Long report',
      inputs: { length: 'one-line', text: 'A lengthy quarterly report with revenue figures...' },
      note: 'Returns a single-sentence summary of the report’s main point.',
    },
  ],
  faqs: [
    {
      question: 'Is the AI text summarizer free?',
      answer:
        'Yes. The site charges nothing. You bring a free-tier key from Gemini (AI Studio), Groq, or OpenRouter, and usage counts against that provider\'s free quota on your own account.',
    },
    {
      question: 'How long can the text be?',
      answer:
        'Up to 8,000 characters. Longer text is rejected with a clear message rather than silently cut, so you always know exactly what was summarized.',
    },
    {
      question: 'Where does my text and API key go?',
      answer:
        'Only to the provider you choose. Your text and key are sent by your browser directly to the provider\'s API; the key is stored in localStorage. This site is static — there is no server that could receive, log, or store either.',
    },
    {
      question: 'Can I trust the summary for quotes or decisions?',
      answer:
        'Summaries preserve key facts but can miss nuance, and AI can phrase guesses confidently. Always skim the original before quoting or deciding.',
    },
    {
      question: 'Does it store or train on my text?',
      answer:
        'Not on our side — we have no backend to store it with. What the provider does with API content is governed by that provider\'s own policy; avoid pasting sensitive or confidential text.',
    },
      {
      question: 'Is this ai text summarizer tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
    {
      question: 'How do I use this ai text summarizer tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
  ],
  assumptions: [
    'Input is capped at 8,000 characters; longer text is rejected, not truncated.',
    'Summaries preserve key facts but may miss nuance — check the original before quoting.',
    'Avoid pasting sensitive or confidential text; provider-side handling follows the provider’s policy.',
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
