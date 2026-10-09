import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { getProviderInfo } from '../../../src/lib/ai/providers.ts';
import { getProviders } from './logic.ts';

export const inputs: ToolInput[] = [
  {
    id: 'language',
    label: 'Language',
    type: 'select',
    required: true,
    options: ['javascript', 'python', 'typescript', 'java', 'php', 'go', 'rust', 'other'],
  },
  {
    id: 'code',
    label: 'Code to explain',
    type: 'textarea',
    required: true,
    placeholder: 'Paste the code snippet (at least 10 characters)',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'explanation',
    label: 'Explanation',
    type: 'text',
    description: 'Free ai code explainer 2026: A plain-language explanation of what the code does, step by step. Instant, private, and mobile-friendly. No signup - try it free!',
  },
];

export const content: ToolContent = {
  title: 'AI Code Explainer',
  description: 'Paste any code snippet and get a plain-language explanation with your own free Gemini, Groq, or OpenRouter key. No signup, nothing uploaded.',
  howTo: [
    'Pick the snippet’s language (or Other).',
    'Paste the code (at least 10 characters, up to 8,000).',
    'Pick a provider, paste your free API key, and click Explain code.',
    'Read the step-by-step explanation — verify against actual behavior for tricky code.',
  ],
  methodology: 'This tool calls the provider YOU choose with YOUR key. Your code is sent by your own browser directly to that provider\'s API — the key travels in the Authorization header (Groq/OpenRouter) or the ?key= parameter (Gemini) and is never sent to our servers. The site is static, so there is no backend that could see it. The model explains what each part does and the overall purpose in plain language.',
  examples: [
    {
      title: 'Python function',
      inputs: { language: 'javascript', code: 'Sample input text for the example...' },
      note: 'Returns a step-by-step plain-language explanation of the function.',
    },
  ],
  faqs: [
    {
      question: 'Is the AI code explainer free?',
      answer:
        'Yes. The site charges nothing. You bring a free-tier key from Gemini (AI Studio), Groq, or OpenRouter, and usage counts against that provider\'s free quota on your own account.',
    },
    {
      question: 'Which languages does it support?',
      answer:
        'JavaScript, Python, TypeScript, Java, PHP, Go, Rust, plus an Other option for anything else.',
    },
    {
      question: 'Where does my code and API key go?',
      answer:
        'Only to the provider you choose. Both are sent by your browser directly to the provider\'s API; the key is stored in localStorage. This site is static — there is no server that could receive, log, or store either.',
    },
    {
      question: 'Can I rely on the explanation for debugging?',
      answer:
        'It describes what the code appears to do — useful for learning, but verify against actual behavior before relying on it for fixes.',
    },
    {
      question: 'How does the ai code explainer work?',
      answer:
        'Enter your details using the inputs above and the ai code explainer calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai code explainer free to use?',
      answer:
        'Yes - this ai code explainer is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an ai code explainer?',
      answer:
        'An ai code explainer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Input is capped at 8,000 characters; longer snippets are rejected, not truncated.',
    'Explanations describe apparent behavior — not a substitute for testing or review.',
    'Avoid pasting proprietary or secret-bearing code; provider-side handling follows the provider’s policy.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'AI Code Explainer 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/ai-code-explainer/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free ai code explainer 2026: A plain-language explanation of what the code does, step by step. Instant, private, and mobile-friendly. No signup - try it free!',
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
          name: 'AI Code Explainer',
          item: 'https://husnainblogger.com/tools/ai-tools/ai-code-explainer/',
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
