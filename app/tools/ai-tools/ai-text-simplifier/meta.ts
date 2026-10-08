import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { getProviderInfo } from '../../../src/lib/ai/providers.ts';
import { getProviders } from './logic.ts';

export const inputs: ToolInput[] = [
  {
    id: 'level',
    label: 'Reading level',
    type: 'select',
    required: true,
    options: ['plain', 'easy', 'kid-friendly'],
  },
  {
    id: 'text',
    label: 'Text to simplify',
    type: 'textarea',
    required: true,
    placeholder: 'Paste the text you want simplified (at least 50 characters)',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'simplified',
    label: 'Simplified text',
    type: 'text',
    description: 'Free ai text simplifier 2026: The same content rewritten at the reading level you picked. Instant, private, and mobile-friendly. No signup - try it free!',
  },
];

export const content: ToolContent = {
  title: 'AI Text Simplifier 2026 – Free Tool | HusnainBlogger',
  description: 'Rewrite complex text in plain, easy, or kid-friendly language with your own free Gemini, Groq, or OpenRouter key. No signup, nothing uploaded.',
  howTo: [
    'Pick a reading level: plain language, easy read, or kid-friendly.',
    'Paste the text (at least 50 characters, up to 8,000).',
    'Pick a provider, paste your free API key, and click Simplify text.',
    'Copy the rewritten text — check it fits your actual audience.',
  ],
  methodology: 'This tool calls the provider YOU choose with YOUR key. Your text is sent by your own browser directly to that provider\'s API — the key travels in the Authorization header (Groq/OpenRouter) or the ?key= parameter (Gemini) and is never sent to our servers. The site is static, so there is no backend that could see it. The model rewrites your text at the chosen reading level, keeping key facts and adding nothing new.',
  examples: [
    {
      title: 'Dense paragraph',
      inputs: { level: 'plain', text: 'Sample input text for the example...' },
      note: 'Returns the same content rewritten in plain language.',
    },
  ],
  faqs: [
    {
      question: 'Is the AI text simplifier free?',
      answer:
        'Yes. The site charges nothing. You bring a free-tier key from Gemini (AI Studio), Groq, or OpenRouter, and usage counts against that provider\'s free quota on your own account.',
    },
    {
      question: 'What reading levels are available?',
      answer:
        'Plain language (clear, no jargon), easy read (short sentences, common words), and kid-friendly (a 10-year-old can understand).',
    },
    {
      question: 'Where does my text and API key go?',
      answer:
        'Only to the provider you choose. Both are sent by your browser directly to the provider\'s API; the key is stored in localStorage. This site is static — there is no server that could receive, log, or store either.',
    },
    {
      question: 'Can I use simplified text for legal or medical content?',
      answer:
        'No — simplification drops nuance. Use the original for legal, medical, or technical decisions.',
    },
    {
      question: 'How does the ai text simplifier work?',
      answer:
        'Enter your details using the inputs above and the ai text simplifier calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai text simplifier free to use?',
      answer:
        'Yes - this ai text simplifier is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an ai text simplifier?',
      answer:
        'An ai text simplifier is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Input is capped at 8,000 characters; longer text is rejected, not truncated.',
    'Simplified text keeps key facts but drops nuance — not for legal/medical/technical use.',
    'Reading levels are approximate; check the result fits your actual audience.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'AI Text Simplifier 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/ai-text-simplifier/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free ai text simplifier 2026: The same content rewritten at the reading level you picked. Instant, private, and mobile-friendly. No signup - try it free!',
    },
    {
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
          name: 'AI Text Simplifier',
          item: 'https://husnainblogger.com/tools/ai-tools/ai-text-simplifier/',
        },
      ],
    },
  ],
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
