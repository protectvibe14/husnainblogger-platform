import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { getProviderInfo } from '../../../src/lib/ai/providers.ts';
import { getProviders } from './logic.ts';

export const inputs: ToolInput[] = [
  {
    id: 'content',
    label: 'Original content',
    type: 'textarea',
    required: true,
    placeholder: 'Paste your blog post, script, or transcript (100–8,000 characters)',
  },
  {
    id: 'source',
    label: 'Source format',
    type: 'select',
    required: true,
    options: ['blog-post', 'video-script', 'podcast-transcript', 'newsletter'],
  },
  {
    id: 'target',
    label: 'Repurpose into',
    type: 'select',
    required: true,
    options: ['twitter-thread', 'linkedin-post', 'instagram-carousel', 'email-newsletter', 'tiktok-script'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'repurposed',
    label: 'Repurposed content',
    type: 'text',
    description: 'Free ai content repurposer 2026: The generated result, ready to copy. Instant, private, and mobile-friendly. No signup - try it free!',
  },
];

export const content: ToolContent = {
  title: 'AI Content Repurposer 2026 – Free Tool | HusnainBlogger',
  description:
    'Turn one piece of content into many: repurpose a blog post, script, or transcript into threads, LinkedIn posts, carousels, or newsletters with your own free Gemini, Groq, or OpenRouter key. No signup, nothing uploaded.',
  howTo: [
    'Paste your original content (100–8,000 characters).',
    'Pick its source format and the format to repurpose into.',
    'Pick a provider, paste your free API key, and click Repurpose Content.',
    'Copy the result and review it before publishing.',
  ],
  methodology:
    'This tool calls the provider YOU choose with YOUR key. Your content is sent by your own browser directly to that provider\'s API — the key travels in the Authorization header (Groq/OpenRouter) or the ?key= parameter (Gemini) and is never sent to our servers. The site is static, so there is no backend that could see it. The model keeps your key ideas and facts while adapting structure, length, and voice to the target format, adding nothing that was not in the original.',
  examples: [
    {
      title: 'Blog to thread',
      inputs: { content: 'A 600-word blog post about email marketing basics...', source: 'blog-post', target: 'twitter-thread' },
      note: 'Returns a numbered X thread distilling the post\'s key points.',
    },
    {
      title: 'Video to LinkedIn',
      inputs: { content: 'A video script about remote work productivity...', source: 'video-script', target: 'linkedin-post' },
      note: 'Returns a professional LinkedIn post version of the script.',
    },
  ],
  faqs: [
    {
      question: 'Is the AI content repurposer free?',
      answer:
        'Yes. The site charges nothing. You bring a free-tier key from Gemini (AI Studio), Groq, or OpenRouter, and usage counts against that provider\'s free quota on your own account.',
    },
    {
      question: 'How long can my content be?',
      answer:
        'Between 100 and 8,000 characters. Shorter or longer input is rejected with a clear message rather than silently cut.',
    },
    {
      question: 'Where does my content and API key go?',
      answer:
        'Only to the provider you choose. Your content and key are sent by your browser directly to the provider\'s API; the key is stored in localStorage. This site is static — there is no server that could receive, log, or store either.',
    },
    {
      question: 'Will the repurposed version keep my facts right?',
      answer:
        'It keeps your key ideas and adds nothing new, but AI can phrase guesses confidently. Skim the output before publishing.',
    },
    {
      question: 'Does it store or train on my content?',
      answer:
        'Not on our side — we have no backend to store it with. What the provider does with API content is governed by that provider\'s own policy; avoid pasting sensitive or confidential text.',
    },
    {
      question: 'How does the ai content repurposer work?',
      answer:
        'Enter your details using the inputs above and the ai content repurposer calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai content repurposer free to use?',
      answer:
        'Yes - this ai content repurposer is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'Input must be 100–8,000 characters; anything else is rejected, not truncated.',
    'The repurposed version adapts structure and voice — review it before publishing.',
    'Avoid pasting sensitive or confidential text; provider-side handling follows the provider\'s policy.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'AI Content Repurposer 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/ai-content-repurposer/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free ai content repurposer 2026: The generated result, ready to copy. Instant, private, and mobile-friendly. No signup - try it free!',
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
          name: 'AI Content Repurposer',
          item: 'https://husnainblogger.com/tools/ai-tools/ai-content-repurposer/',
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
