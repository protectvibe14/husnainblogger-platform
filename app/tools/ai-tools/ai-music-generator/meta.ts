import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'endpoint',
    label: 'Compatible API base URL',
    type: 'text',
    required: true,
    placeholder: 'e.g. https://api.sunoapi.org',
  },
  {
    id: 'prompt',
    label: 'Describe the music',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. An upbeat pop song about summer mornings, acoustic guitar and warm vocals',
  },
  {
    id: 'instrumental',
    label: 'Instrumental (no vocals)',
    type: 'boolean',
    required: false,
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'tracks',
    label: 'Generated songs',
    type: 'download',
    description:
    'Free ai music generator 2026: Two song variations per generation, playable on the page with a download button each. Fast, private now.',
  },
];

export const content: ToolContent = {
  title: 'Ai Music Generator',
  description:
    'Make AI songs with your own Suno-compatible API key — describe the track, generate two variations, then play and download the MP3s. needed.',
  howTo: [
    'Get a key from a Suno-compatible API provider and paste its base URL + key into the key vault above.',
    'Describe the music you want (up to 500 characters) and tick instrumental if you want no vocals.',
    'Press Generate — the tool creates the task, then polls the provider every few seconds until the songs are ready (usually 1–3 minutes).',
    'Press Cancel anytime to stop polling.',
    'Listen to both variations with the play buttons and download the one you like as an MP3.',
  ],
  methodology:
    'Your browser calls YOUR compatible API directly: POST {base}/api/v1/generate with {prompt, customMode:false, instrumental, model:"V4_5"} returns a task id; GET {base}/api/v1/generate/record-info?taskId= is polled until data.status is SUCCESS, then the two audio URLs under response.sunoData[] are rendered as players. HusnainBlogger has no backend — your base URL and key stay in your browser, and generation only works after you save them.',
  examples: [
    {
      title: 'Summer pop song',
      inputs: { prompt: 'An upbeat pop song about summer mornings, acoustic guitar and warm vocals' },
      note: 'Two full song variations with lyrics — download your favourite.',
    },
    {
      title: 'Lo-fi background',
      inputs: { prompt: 'Chill lo-fi hip-hop beat, soft piano and vinyl crackle, 90 seconds', instrumental: true },
      note: 'Instrumental track for video backgrounds or focus sessions.',
    },
  ],
  faqs: [
    {
      question: 'Is my API key safe?',
      answer:
        'Yes. Your base URL and key are stored only in your browser\'s localStorage and are sent directly to the provider you chose. HusnainBlogger is a static site with no backend — we cannot see, log, or store them.',
    },
    {
      question: 'Does Suno have an official API?',
      answer:
        'No — Suno offers no official public API. This tool uses the widely-used third-party Suno-compatible convention (generate + record-info endpoints). Confirm the exact base URL and endpoints in your provider\'s own docs; if their docs differ, this tool will not work with them.',
    },
    {
      question: 'Is music generation free?',
      answer:
        'The tool is free; generation bills YOUR compatible-API account, usually in credits per song. Check your provider\'s pricing before generating.',
    },
    {
      question: 'Why do I get two songs?',
      answer:
        'Compatible providers generate two variations per task by default. Both appear with play buttons — keep the one you like.',
    },
    {
      question: 'How long does it take?',
      answer:
        'Usually 1–3 minutes. The tool polls the provider until the songs are ready, with a 10-minute cap and a Cancel button.',
    },
    {
      question: 'How does the ai music generator work?',
      answer:
        'Enter your details using the inputs above and the ai music generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai music generator free to use?',
      answer:
        'Yes - this ai music generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'No key + base URL = no generation. Both must be saved first.',
    'The tool assumes the third-party Suno-compatible contract; providers with a different contract will fail with a clear error.',
    'Browser calls depend on the chosen provider\'s CORS policy — not guaranteed by this tool.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Ai Music Generator 2026 – Free Generator | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/ai-music-generator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free Ai Music Generator 2026 – Free Generator - required.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ai Music Generator 2026 – Free Generator | HusnainBlogger', item: 'https://husnainblogger.com/' },
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
          name: 'AI Music Generator',
          item: 'https://husnainblogger.com/tools/ai-tools/ai-music-generator/',
        },
      ],
    },
  ],
};

export const aiConfig: AiToolConfig = {
  lane: 'D',
  headline: 'Make AI songs with YOUR compatible-API key — two variations, MP3 out.',
  providers: ['custom-music-api'],
  disclosures: [
    'Suno offers no official API — this uses the widely-used third-party compatible convention; confirm your provider\'s docs.',
    'Bring-your-own base URL + key: both stay in your browser. No key = no generation.',
    'Generation bills YOUR compatible-API account (usually credits per song).',
    'Browser support depends on your chosen provider\'s CORS policy.',
  ],
  noKeyHeadline: 'Save your compatible-API key and base URL to unlock music generation',
  noKeyBody:
    'This tool is fully built — the only missing pieces are yours: a Suno-compatible API base URL and key (link above to find a provider). Paste them into the key vault, press Save, and the full flow works immediately: describe the music → Generate → two songs in a few minutes → download MP3.',
};
