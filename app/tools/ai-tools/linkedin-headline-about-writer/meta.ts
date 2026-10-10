import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { getProviderInfo } from '../../../src/lib/ai/providers.ts';
import { getProviders } from './logic.ts';

export const inputs: ToolInput[] = [
  {
    id: 'role',
    label: 'Current or target role',
    type: 'text',
    required: true,
    placeholder: 'e.g. Data Analyst',
  },
  {
    id: 'skills',
    label: 'Skills (comma-separated)',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. SQL, Python, Tableau, stakeholder reporting',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'headlines',
    label: 'Headline options',
    type: 'list',
    description:
    'Free linkedin headline generator 2026: Three distinct headline options, each within LinkedIn’s 220-character limit. Fast, private now.',
  },
  {
    id: 'about',
    label: 'About section draft',
    type: 'text',
    description:
    'A first-person About draft within LinkedIn’s 2,600-character limit.',
  },
];


export const content: ToolContent = {
  title: 'LinkedIn Headline Writer',
  description:
    'Get 3 recruiter-ready headline options plus an About draft with your own free Gemini, Groq, or OpenRouter key. Stays within LinkedIn limits.',
  howTo: [
    'Enter your current or target role.',
    'List your key skills, comma-separated.',
    'Pick a provider, paste your free API key, and click Generate.',
    'Copy the headlines and About draft, personalize them, then paste into LinkedIn.',
  ],
  methodology:
    'This tool calls the provider YOU choose with YOUR key. Your role and skills are sent by your own browser directly to that provider\'s API — the key travels in the Authorization header (Groq/OpenRouter) or the ?key= parameter (Gemini) and is never sent to our servers. The site is static, so there is no backend that could see it. The model writes three keyword-rich headline options (each 220 characters or fewer) and a first-person About draft (2,600 characters or fewer) using only what you provided; it never invents job titles, companies, or metrics.',
  examples: [
    {
      title: 'Data analyst',
      inputs: { role: 'Data Analyst', skills: 'SQL, Python, Tableau, stakeholder reporting' },
      note: 'Returns 3 headline options plus an About draft weaving in SQL, Python, and Tableau.',
    },
    {
      title: 'Career switcher',
      inputs: { role: 'Aspiring UX Designer', skills: 'Figma, user research, wireframing' },
      note: 'Returns headlines positioned for the target role with transferable-skill wording.',
    },
  ],
  faqs: [
    {
      question: 'Is the LinkedIn headline writer free?',
      answer:
        'Yes. The site charges nothing. You bring a free-tier key from Gemini (AI Studio), Groq, or OpenRouter, and usage counts against that provider\'s free quota on your own account.',
    },
    {
      question: 'Will it invent jobs or metrics I do not have?',
      answer:
        'No. The writer is instructed to use only the role and skills you provide and never invent job titles, companies, or metrics. The draft will read thin if your input is thin — add real skills.',
    },
    {
      question: 'Where does my API key go?',
      answer:
        'Only to the provider you choose. It is stored in your browser\'s localStorage and sent directly to the provider\'s API. This site is static — there is no server that could receive or log your key.',
    },
    {
      question: 'What are LinkedIn’s character limits?',
      answer:
        'Headlines allow up to 220 characters and About sections up to 2,600 characters. This tool writes both drafts to stay within those limits, but double-check after personalizing.',
    },
    {
      question: 'Should I publish the About draft as-is?',
      answer:
        'No — personalize it first. Add your real roles, one concrete win, and your voice. Recruiters recognize copy-pasted AI profiles.',
    },
      {
      question: 'How do I use this linkedin headline writer tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
    {
      question: 'Is this linkedin headline writer tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
  ],
  assumptions: [
    'Drafts stay within LinkedIn’s 220-character headline and 2,600-character About limits as generated.',
    'Only the role and skills you provide are used — no employers, titles, or metrics are invented.',
    'Personalize before publishing; untouched AI profiles are easy to spot.',
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
