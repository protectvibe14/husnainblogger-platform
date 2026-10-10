import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { getProviderInfo } from '../../../src/lib/ai/providers.ts';
import { getProviders } from './logic.ts';

export const inputs: ToolInput[] = [
  {
    id: 'name',
    label: 'Your name (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. Jane Doe',
  },
  {
    id: 'role',
    label: 'Role you are applying for',
    type: 'text',
    required: true,
    placeholder: 'e.g. Product Designer',
  },
  {
    id: 'company',
    label: 'Company',
    type: 'text',
    required: true,
    placeholder: 'e.g. Acme Corp',
  },
  {
    id: 'achievements',
    label: '2–3 achievements (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'e.g. Redesigned onboarding, lifting activation 18%',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'letter',
    label: 'Cover letter',
    type: 'text',
    description:
    'Free ai cover letter generator 2026: A 3-paragraph cover letter draft built only from what you provided. Get instant results. free now.',
  },
];


export const content: ToolContent = {
  title: 'AI Cover Letter Generator',
  description:
    'Generate a tailored 3-paragraph cover letter with your own free Gemini, Groq, or OpenRouter key. No invented facts — review before sending.',
  howTo: [
    'Enter the role and company you are applying for.',
    'Add your name and 2–3 real achievements (optional but recommended).',
    'Pick a provider, paste your free API key, and click Generate.',
    'Review, personalize, and proofread the letter before sending it.',
  ],
  methodology:
    'This tool calls the provider YOU choose with YOUR key. Your details are sent by your own browser directly to that provider\'s API — the key travels in the Authorization header (Groq/OpenRouter) or the ?key= parameter (Gemini) and is never sent to our servers. The site is static, so there is no backend that could see it. The model writes a 3-paragraph letter (enthusiasm, achievements tied to the role, closing call to action) using only the facts you provided; it never invents employers, titles, or achievements.',
  examples: [
    {
      title: 'Designer application',
      inputs: { role: 'Product Designer', company: 'Acme Corp', achievements: 'Redesigned onboarding, lifting activation 18%.' },
      note: 'Produces a 3-paragraph letter tying the onboarding redesign to the Product Designer role.',
    },
    {
      title: 'Minimal input',
      inputs: { role: 'Support Specialist', company: 'Beta Inc' },
      note: 'Produces a solid generic letter with a [Your Name] placeholder — add achievements for a stronger result.',
    },
  ],
  faqs: [
    {
      question: 'Is the AI cover letter generator free?',
      answer:
        'Yes. The site charges nothing. You bring a free-tier key from Gemini (AI Studio), Groq, or OpenRouter, and usage counts against that provider\'s free quota on your own account.',
    },
    {
      question: 'Will it make up experience I do not have?',
      answer:
        'No. The generator is instructed to use only the facts you provide and never invent employers, titles, or achievements. A letter built on thin input will read thin — add your real achievements.',
    },
    {
      question: 'Where does my API key go?',
      answer:
        'Only to the provider you choose. It is stored in your browser\'s localStorage and sent directly to the provider\'s API. This site is static — there is no server that could receive or log your key.',
    },
    {
      question: 'Should I send the letter exactly as generated?',
      answer:
        'No — treat it as a strong first draft. Personalize the opening, check the tone against the company, and proofread. Recruiters spot untouched AI letters.',
    },
    {
      question: 'How long is the generated cover letter?',
      answer:
        'Three concise paragraphs: your enthusiasm for the role, 2–3 achievements tied to it, and a closing call to action. Short enough to be read, specific enough to matter.',
    },
    {
      question: 'How does the ai cover letter generator work?',
      answer:
        'Enter your details using the inputs above and the ai cover letter generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai cover letter generator free to use?',
      answer:
        'Yes - this ai cover letter generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'The letter only uses what you provide — thin input produces a thin letter.',
    'AI output can be generic; personalize and proofread before attaching it to a real application.',
    'No employment claims are invented, but phrasing should still be checked against your real history.',
  ],
  jsonLd: [
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Cover Letter Generator',
          item: 'https://husnainblogger.com/tools/ai-tools/cover-letter-generator/',
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
