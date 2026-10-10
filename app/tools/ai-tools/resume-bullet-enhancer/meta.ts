import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { getProviderInfo } from '../../../src/lib/ai/providers.ts';
import { getProviders } from './logic.ts';

export const inputs: ToolInput[] = [
  {
    id: 'bullet',
    label: 'Your raw bullet',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. Responsible for managing a team and improving page speed',
  },
  {
    id: 'role',
    label: 'Target role (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. Frontend Developer',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'enhanced',
    label: 'Enhanced bullet',
    type: 'text',
    description:
    'Free resume bullet point enhancer 2026: The rewritten bullet: strong action verb, quantified result when you provided numbers. Fast, private - try.',
  },
];


export const content: ToolContent = {
  title: 'Resume Bullet Enhancer',
  description:
    'Enhance resume bullets free with AI — stronger action verbs and quantified results from your numbers. Upgrade yours now!',
  howTo: [
    'Paste your raw resume bullet into the box (one bullet per generation).',
    'Optionally add the target role so the wording matches the job.',
    'Pick a provider and paste your free API key, then click Generate.',
    'Copy the enhanced bullet and review it before adding it to your resume.',
  ],
  methodology:
    'This tool calls the provider YOU choose with YOUR key. Your bullet is sent by your own browser directly to that provider\'s API — the key travels in the Authorization header (Groq/OpenRouter) or the ?key= parameter (Gemini) and is never sent to our servers. The site is static, so there is no backend that could see it. The model rewrites your bullet to start with a strong action verb and keeps it under 25 words; it only uses numbers you provided and never invents metrics.',
  examples: [
    {
      title: 'Vague responsibility',
      inputs: { bullet: 'Responsible for managing a team and improving page speed' },
      note: 'Rewrites to an action-led bullet like "Led a 5-person team; cut page load time by 40%." — using only numbers you supply.',
    },
    {
      title: 'With a target role',
      inputs: { bullet: 'Helped with customer support tickets', role: 'Customer Success Manager' },
      note: 'Rewrites with customer-success wording, e.g. "Resolved 120+ support tickets weekly with a 96% satisfaction rating."',
    },
  ],
  faqs: [
    {
      question: 'Will the enhancer make up numbers for my resume?',
      answer:
        'No — the prompt explicitly forbids inventing metrics, percentages, or achievements. It can only quantify what you give it, so add your real numbers to the raw bullet for the strongest result.',
    },
    {
      question: 'Is the resume bullet enhancer free?',
      answer:
        'Yes. The site charges nothing. You bring a free-tier key from Gemini (AI Studio), Groq, or OpenRouter, and usage counts against that provider\'s free quota on your own account.',
    },
    {
      question: 'Where does my API key go?',
      answer:
        'Only to the provider you choose. It is stored in your browser\'s localStorage and sent directly to the provider\'s API. This site is static — there is no server that could receive or log your key.',
    },
    {
      question: 'How long should a resume bullet be?',
      answer:
        'Recruiters scan fast: one to two lines works best. This tool keeps every enhanced bullet under 25 words, starting with a strong action verb.',
    },
    {
      question: 'Can I enhance my whole resume at once?',
      answer:
        'Not in one click — the tool enhances one bullet per generation so each gets full attention. Run it once per bullet; it takes seconds each.',
    },
      {
      question: 'How do I use this resume bullet enhancer tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
    {
      question: 'Is this resume bullet enhancer tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
  ],
  assumptions: [
    'The enhancer never invents numbers — vague input produces a vague (if better-worded) bullet.',
    'One bullet per generation; the tool does not restructure or format your whole resume.',
    'AI output can be generic — review every bullet before putting it on a real resume.',
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
