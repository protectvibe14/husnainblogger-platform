import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { getProviderInfo } from '../../../src/lib/ai/providers.ts';
import { getProviders } from './logic.ts';

export const inputs: ToolInput[] = [
  {
    id: 'goal',
    label: 'Optimization goal',
    type: 'select',
    required: true,
    options: ['clearer', 'more-detailed', 'shorter'],
  },
  {
    id: 'prompt',
    label: 'Prompt to optimize',
    type: 'textarea',
    required: true,
    placeholder: 'Paste the prompt you want to improve (at least 20 characters)',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'optimized',
    label: 'Optimized prompt',
    type: 'text',
    description:
    'Free ai prompt optimizer 2026: The rewritten prompt, ready to paste into your AI tool. free.',
  },
];

export const content: ToolContent = {
  title: 'AI Prompt Optimizer',
  description:
    'Get better AI output with this AI prompt optimizer — rewrites vague prompts into clear, specific instructions that models follow well. Get better.',
  howTo: [
    'Pick an optimization goal: clearer, more detailed, or shorter.',
    'Paste the prompt (at least 20 characters, up to 8,000).',
    'Pick a provider, paste your free API key, and click Optimize prompt.',
    'Copy the rewritten prompt — check it fits your intent before using it.',
  ],
  methodology: 'This tool calls the provider YOU choose with YOUR key. Your prompt is sent by your own browser directly to that provider\'s API — the key travels in the Authorization header (Groq/OpenRouter) or the ?key= parameter (Gemini) and is never sent to our servers. The site is static, so there is no backend that could see it. The model rewrites your prompt for clarity, detail, or brevity without answering it.',
  examples: [
    {
      title: 'Vague prompt',
      inputs: { goal: 'clearer', prompt: 'Sample input text for the example...' },
      note: 'Returns a clearer rewrite of the rough prompt.',
    },
  ],
  faqs: [
    {
      question: 'Is the AI prompt optimizer free?',
      answer:
        'Yes. The site charges nothing. You bring a free-tier key from Gemini (AI Studio), Groq, or OpenRouter, and usage counts against that provider\'s free quota on your own account.',
    },
    {
      question: 'What does it change about my prompt?',
      answer:
        'Depending on your goal, it makes the prompt clearer, adds useful context and constraints, or shortens it — always keeping your original intent. It never answers the prompt itself.',
    },
    {
      question: 'Where does my prompt and API key go?',
      answer:
        'Only to the provider you choose. Both are sent by your browser directly to the provider\'s API; the key is stored in localStorage. This site is static — there is no server that could receive, log, or store either.',
    },
    {
      question: 'Will the optimized prompt always work better?',
      answer:
        'Not guaranteed — it is a rewrite, not a proven improvement. Test the rewritten prompt on your task and keep whichever version performs better.',
    },
    {
      question: 'What is an ai prompt optimizer?',
      answer:
        'An ai prompt optimizer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'How do I use this ai prompt optimizer tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
    {
      question: 'Is this ai prompt optimizer tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
  ],
  assumptions: [
    'Input is capped at 8,000 characters; longer prompts are rejected, not truncated.',
    'The optimizer rewrites your prompt — it does not run it or guarantee better answers.',
    'Avoid pasting sensitive or confidential prompts; provider-side handling follows the provider’s policy.',
  ],
  jsonLd: [],
};

export const aiConfig: AiToolConfig = {
  lane: 'B',
  headline: 'Uses YOUR free Gemini/Groq/OpenRouter key \u2014 nothing runs until you paste one.',
  providers: getProviders(),
  disclosures: [
    ...getProviders().map((pid) => {
      const info = getProviderInfo(pid);
      return info ? info.name + ': ' + info.freeTier + ' ' + info.costNote : pid;
    }),
    'Your key never leaves your browser except to the provider you choose \u2014 it is stored in localStorage and sent only in the Authorization header (Groq/OpenRouter) or the ?key= query parameter (Gemini).',
  ],
};
