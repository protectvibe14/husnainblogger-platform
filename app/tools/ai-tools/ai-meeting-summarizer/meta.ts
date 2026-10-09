import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { getProviderInfo } from '../../../src/lib/ai/providers.ts';
import { getProviders } from './logic.ts';

export const inputs: ToolInput[] = [
  {
    id: 'format',
    label: 'Output format',
    type: 'select',
    required: true,
    options: ['action-items', 'bullets', 'minutes'],
  },
  {
    id: 'notes',
    label: 'Meeting notes',
    type: 'textarea',
    required: true,
    placeholder: 'Paste your raw meeting notes (at least 50 characters)',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'summary',
    label: 'Meeting summary',
    type: 'text',
    description: 'Free ai meeting notes summarizer 2026: The summary in the format you picked: action items, key bullets, or minutes. Fast, private, no signup - try it now!',
  },
];

export const content: ToolContent = {
  title: 'AI Meeting Notes Summarizer',
  description: 'Turn messy meeting notes into action items, key bullets, or minutes with your own free Gemini, Groq, or OpenRouter key. No signup, nothing uploaded.',
  howTo: [
    'Pick an output format: action items, key bullets, or meeting minutes.',
    'Paste your raw meeting notes (at least 50 characters, up to 8,000).',
    'Pick a provider, paste your free API key, and click Summarize notes.',
    'Copy the summary — verify names and commitments against the original.',
  ],
  methodology: 'This tool calls the provider YOU choose with YOUR key. Your notes are sent by your own browser directly to that provider\'s API — the key travels in the Authorization header (Groq/OpenRouter) or the ?key= parameter (Gemini) and is never sent to our servers. The site is static, so there is no backend that could see it. The model condenses your notes into the shape you picked, preserving names, dates, and commitments as written.',
  examples: [
    {
      title: 'Team standup notes',
      inputs: { format: 'action-items', notes: 'Sample input text for the example...' },
      note: 'Returns action items with owners extracted from the notes.',
    },
  ],
  faqs: [
    {
      question: 'Is the AI meeting notes summarizer free?',
      answer:
        'Yes. The site charges nothing. You bring a free-tier key from Gemini (AI Studio), Groq, or OpenRouter, and usage counts against that provider\'s free quota on your own account.',
    },
    {
      question: 'What formats can it produce?',
      answer:
        'Three: action items (task + owner), key bullet points, or short meeting minutes with decisions and action items.',
    },
    {
      question: 'Where do my notes and API key go?',
      answer:
        'Only to the provider you choose. Both are sent by your browser directly to the provider\'s API; the key is stored in localStorage. This site is static — there is no server that could receive, log, or store either.',
    },
    {
      question: 'Can I trust the action items?',
      answer:
        'Names and commitments are preserved as written, but nuance can be missed. Always verify against the original notes before assigning work.',
    },
    {
      question: 'How does the ai meeting notes summarizer work?',
      answer:
        'Enter your details using the inputs above and the ai meeting notes summarizer calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai meeting notes summarizer free to use?',
      answer:
        'Yes - this ai meeting notes summarizer is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an ai meeting notes summarizer?',
      answer:
        'An ai meeting notes summarizer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Input is capped at 8,000 characters; longer notes are rejected, not truncated.',
    'The summarizer never invents attendees or decisions, but it can miss nuance.',
    'Avoid pasting confidential meeting content; provider-side handling follows the provider’s policy.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'AI Meeting Notes Summarizer 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/ai-meeting-summarizer/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free ai meeting notes summarizer 2026: The summary in the format you picked: action items, key bullets, or minutes. Fast, private, no signup - try it now!',
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
          name: 'AI Meeting Notes Summarizer',
          item: 'https://husnainblogger.com/tools/ai-tools/ai-meeting-summarizer/',
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
