import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { getProviderInfo } from '../../../src/lib/ai/providers.ts';
import { getProviders } from './logic.ts';

export const inputs: ToolInput[] = [
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['professional', 'casual', 'academic'],
  },
  {
    id: 'text',
    label: 'Text to rewrite',
    type: 'textarea',
    required: true,
    placeholder: 'Paste the text you want paraphrased (up to 6,000 characters)',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'rewrite',
    label: 'Rewritten text',
    type: 'text',
    description: 'Free ai paraphrasing tool 2026: Your text rewritten in the chosen tone, meaning preserved. Instant, private, and mobile-friendly. No signup - try it free!',
  },
];


export const content: ToolContent = {
  title: 'AI Paraphraser & Rewriter',
  description:
    'Rewrite any text in a professional, casual, or academic tone with your own free Gemini, Groq, or OpenRouter key. Meaning preserved, no signup needed.',
  howTo: [
    'Pick a tone: professional, casual, or academic.',
    'Paste the text you want rewritten (10 to 6,000 characters).',
    'Pick a provider, paste your free API key, and click Generate.',
    'Copy the rewrite and re-check any critical facts against the original.',
  ],
  methodology:
    'This tool calls the provider YOU choose with YOUR key. Your text is sent by your own browser directly to that provider\'s API — the key travels in the Authorization header (Groq/OpenRouter) or the ?key= parameter (Gemini) and is never sent to our servers. The site is static, so there is no backend that could see it. The model rewrites your text in the chosen tone, preserving the original meaning and key facts, without adding new claims.',
  examples: [
    {
      title: 'Stiff to casual',
      inputs: { tone: 'casual', text: 'We are pleased to inform you that your request has been approved.' },
      note: 'Returns a friendlier version like "Good news — your request got approved!"',
    },
    {
      title: 'Casual to academic',
      inputs: { tone: 'academic', text: 'Social media really changed how teens talk to each other.' },
      note: 'Returns a formal rewrite preserving the claim about teen communication.',
    },
  ],
  faqs: [
    {
      question: 'Is the AI paraphraser free?',
      answer:
        'Yes. The site charges nothing. You bring a free-tier key from Gemini (AI Studio), Groq, or OpenRouter, and usage counts against that provider\'s free quota on your own account.',
    },
    {
      question: 'Will it change the meaning of my text?',
      answer:
        'It is instructed to preserve the original meaning and all key facts while changing the tone and wording. Still, re-check critical facts against the original — especially in technical or legal text.',
    },
    {
      question: 'Where does my text and API key go?',
      answer:
        'Only to the provider you choose. Both are sent by your browser directly to the provider\'s API; the key is stored in localStorage. This site is static — there is no server that could receive, log, or store either.',
    },
    {
      question: 'Can I use the rewrite as my own writing?',
      answer:
        'Rewriting does not make text yours: cite your sources and respect copyright. For school or work, check the relevant originality policy — many institutions treat undisclosed AI paraphrasing as misconduct.',
    },
    {
      question: 'How long can the text be?',
      answer:
        'Between 10 and 6,000 characters per rewrite. Longer passages can be split and rewritten in parts.',
    },
    {
      question: 'How does the ai paraphrasing tool work?',
      answer:
        'Enter your details using the inputs above and the ai paraphrasing tool calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai paraphrasing tool free to use?',
      answer:
        'Yes - this ai paraphrasing tool is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'Rewrites preserve meaning, not wording — re-check critical facts against the original.',
    'Paraphrasing does not transfer ownership: cite sources and respect copyright and institutional policies.',
    'Very long or technical passages may lose nuance in the rewrite.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'AI Paraphraser & Rewriter 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/ai-paraphraser-rewriter/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free ai paraphrasing tool 2026: Your text rewritten in the chosen tone, meaning preserved. Instant, private, and mobile-friendly. No signup - try it free!',
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
          name: 'AI Paraphraser & Rewriter',
          item: 'https://husnainblogger.com/tools/ai-tools/ai-paraphraser-rewriter/',
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
