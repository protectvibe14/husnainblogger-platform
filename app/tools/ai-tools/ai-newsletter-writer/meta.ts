import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { getProviderInfo } from '../../../src/lib/ai/providers.ts';
import { getProviders } from './logic.ts';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Newsletter topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. this week\'s AI tools roundup',
  },
  {
    id: 'length',
    label: 'Length',
    type: 'select',
    required: true,
    options: ['short', 'standard', 'long'],
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['friendly', 'professional', 'witty'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'newsletter',
    label: 'Newsletter draft',
    type: 'text',
    description:
    'Free ai newsletter writer 2026: The generated result, ready to copy. free.',
  },
];

export const content: ToolContent = {
  title: 'AI Newsletter Writer',
  description:
    'Draft a complete newsletter — subject line, sections, and sign-off — in your tone with your own free Gemini, Groq, or OpenRouter key., nothing uploaded.',
  howTo: [
    'Describe your newsletter topic.',
    'Pick the length and tone.',
    'Pick a provider, paste your free API key, and click Write Newsletter.',
    'Copy the draft, add your real links, and personalize before sending.',
  ],
  methodology:
    'This tool calls the provider YOU choose with YOUR key. Your topic is sent by your own browser directly to that provider\'s API — the key travels in the Authorization header (Groq/OpenRouter) or the ?key= parameter (Gemini) and is never sent to our servers. The site is static, so there is no backend that could see it. The model writes a full draft (subject line, intro, sections, sign-off with call to action) in your chosen tone and length, without inventing news events, statistics, or subscriber data.',
  examples: [
    {
      title: 'Weekly roundup',
      inputs: { topic: 'this week\'s marketing news', length: 'standard', tone: 'friendly' },
      note: 'Returns a 5-section newsletter draft with subject line and sign-off.',
    },
    {
      title: 'Short update',
      inputs: { topic: 'new course launch announcement', length: 'short', tone: 'professional' },
      note: 'Returns a concise 3-section announcement draft.',
    },
  ],
  faqs: [
    {
      question: 'Is the AI newsletter writer free?',
      answer:
        'Yes. The site charges nothing. You bring a free-tier key from Gemini (AI Studio), Groq, or OpenRouter, and usage counts against that provider\'s free quota on your own account.',
    },
    {
      question: 'What does the draft include?',
      answer:
        'A subject line, a warm intro, the sections you picked (3, 5, or 7), and a sign-off with a call to action.',
    },
    {
      question: 'Where does my topic and API key go?',
      answer:
        'Only to the provider you choose. Your topic and key are sent by your browser directly to the provider\'s API; the key is stored in localStorage. This site is static — there is no server that could receive, log, or store either.',
    },
    {
      question: 'Can I send the draft as-is?',
      answer:
        'Add your real news, links, and offers first — the draft is a structure with placeholder-free prose, but your newsletter needs your actual content.',
    },
    {
      question: 'Does it store or train on my topic?',
      answer:
        'Not on our side — we have no backend to store it with. What the provider does with API content is governed by that provider\'s own policy.',
    },
    {
      question: 'How does the ai newsletter writer work?',
      answer:
        'Enter your details using the inputs above and the ai newsletter writer calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai newsletter writer free to use?',
      answer:
        'Yes - this ai newsletter writer is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'The draft is a starting point — add your real news, links, and subscriber details before sending.',
    'The model does not invent news events or statistics; verify anything time-sensitive.',
    'Avoid pasting sensitive material; provider-side handling follows the provider\'s policy.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'AI Newsletter Writer 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/ai-newsletter-writer/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free ai newsletter writer 2026: The generated result, ready to copy. free.',
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
          name: 'AI Newsletter Writer',
          item: 'https://husnainblogger.com/tools/ai-tools/ai-newsletter-writer/',
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
