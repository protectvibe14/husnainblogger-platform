import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { getProviderInfo } from '../../../src/lib/ai/providers.ts';
import { getProviders } from './logic.ts';

export const inputs: ToolInput[] = [
  {
    id: 'mode',
    label: 'What to write',
    type: 'select',
    required: true,
    options: ['cold-email', 'follow-up', 'blog-intro', 'blog-outline'],
  },
  {
    id: 'topic',
    label: 'Topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. freelance pricing for beginners',
  },
  {
    id: 'points',
    label: 'Key points (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'e.g. charge per project, not per hour',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'draft',
    label: 'Draft',
    type: 'text',
    description:
    'Free ai email writer free 2026: The generated email or blog draft for the mode you picked. free.',
  },
];


export const content: ToolContent = {
  title: 'AI Email & Blog Writer',
  description:
    'Draft cold emails, follow-ups, blog intros, and outlines with your own free Gemini, Groq, or OpenRouter key. Drafts only — edit before sending.',
  howTo: [
    'Choose what to write: cold email, follow-up, blog intro, or blog outline.',
    'Enter your topic and any key points you want covered.',
    'Pick a provider, paste your free API key, and click Generate.',
    'Copy the draft and rewrite it in your own voice before sending or publishing.',
  ],
  methodology:
    'This tool calls the provider YOU choose with YOUR key. Your topic and points are sent by your own browser directly to that provider\'s API — the key travels in the Authorization header (Groq/OpenRouter) or the ?key= parameter (Gemini) and is never sent to our servers. The site is static, so there is no backend that could see it. The model drafts in the structure of the mode you picked (subject line + short body for emails; hook + outline for blogs) and never invents facts about you.',
  examples: [
    {
      title: 'Cold email',
      inputs: { mode: 'cold-email', topic: 'bookkeeping for freelancers', points: 'saves 5 hours a week' },
      note: 'Drafts a subject line plus a sub-150-word email with one clear call to action.',
    },
    {
      title: 'Blog outline',
      inputs: { mode: 'blog-outline', topic: 'freelance pricing for beginners' },
      note: 'Drafts a working title, intro bullet, 4–6 H2 sections, and a conclusion with a call to action.',
    },
  ],
  faqs: [
    {
      question: 'Is the AI email and blog writer free?',
      answer:
        'Yes. The site charges nothing. You bring a free-tier key from Gemini (AI Studio), Groq, or OpenRouter, and usage counts against that provider\'s free quota on your own account.',
    },
    {
      question: 'Can I send the cold email exactly as written?',
      answer:
        'You should not. Treat every output as a first draft: personalize it, check the claims, and make sure cold outreach follows anti-spam rules (in the US, CAN-SPAM requires your identity and a real opt-out).',
    },
    {
      question: 'Where does my API key go?',
      answer:
        'Only to the provider you choose. It is stored in your browser\'s localStorage and sent directly to the provider\'s API. This site is static — there is no server that could receive or log your key.',
    },
    {
      question: 'What is the difference between the four modes?',
      answer:
        'Cold email writes a subject line plus a sub-150-word pitch; follow-up writes a short polite bump; blog intro writes a 100–150-word hook; blog outline writes a full structured outline with H2 sections.',
    },
    {
      question: 'Will it invent statistics or claims?',
      answer:
        'It is instructed not to invent statistics, but AI can still phrase guesses confidently. Verify every claim before you publish or send.',
    },
    {
      question: 'How does the ai email writer free work?',
      answer:
        'Enter your details using the inputs above and the ai email writer free calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai email writer free free to use?',
      answer:
        'Yes - this ai email writer free is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'Outputs are first drafts, not send-ready copy — edit in your own voice.',
    'Cold outreach must follow anti-spam rules (e.g. CAN-SPAM in the US).',
    'The writer never invents facts about you, but confident phrasing should still be checked.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'AI Email & Blog Writer 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/ai-email-blog-writer/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free ai email writer free 2026: The generated email or blog draft for the mode you picked. free.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'AI Tools',
          item: 'https://husnainblogger.com/tools/ai-tools/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'AI Email & Blog Writer',
          item: 'https://husnainblogger.com/tools/ai-tools/ai-email-blog-writer/',
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
