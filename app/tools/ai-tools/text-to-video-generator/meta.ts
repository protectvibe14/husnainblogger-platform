import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'prompt',
    label: 'Video prompt',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. slow aerial shot over a misty pine forest at sunrise, cinematic',
  },
  {
    id: 'duration',
    label: 'Duration',
    type: 'select',
    required: false,
    options: ['4s', '6s', '8s'],
  },
  {
    id: 'aspect',
    label: 'Aspect ratio',
    type: 'select',
    required: false,
    options: ['16:9', '9:16'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'video',
    label: 'Generated video',
    type: 'download',
    description: 'Free text to video ai generator 2026: AI-generated video clip (MP4) from your prompt, playable on the page with a download. Fast, private, no signup - try it!',
  },
  {
    id: 'duration',
    label: 'Clip length',
    type: 'text',
    description: 'The duration you requested (4s, 6s or 8s).',
  },
];

export const content: ToolContent = {
  title: 'Text to Video AI Generator 2026 – Free | HusnainBlogger',
  description:
    'Turn text into AI video with your own fal.ai key — Google Veo 3 clips in 4, 6 or 8 seconds. Paste your key, describe the shot, preview and download. No signup.',
  howTo: [
    'Save your fal.ai API key in the key vault above (it stays in this browser only).',
    'Describe the shot: subject, motion, camera move, lighting. Cinematic detail gives better clips.',
    'Pick a duration (4s, 6s or 8s) and an aspect ratio — 16:9 for YouTube, 9:16 for Shorts/Reels.',
    'Press Generate. The job is submitted to the fal.ai queue; this page polls and shows live status (queued → generating → done).',
    'Watch the preview, then download the MP4. Longer clips cost more — every second bills your fal.ai account.',
  ],
  methodology:
    'Your browser calls YOUR fal.ai key directly at the verified endpoint fal-ai/veo3 (Google Veo 3 text-to-video): POST submit → poll /requests/{id}/status → fetch /requests/{id}/response. HusnainBlogger has no backend — keys never leave your browser, and generation only works after you save a key.',
  examples: [
    {
      title: 'YouTube b-roll',
      inputs: { prompt: 'slow aerial shot over a misty pine forest at sunrise, cinematic', duration: '6s', aspect: '16:9' },
      note: 'Produces a 6-second cinematic establishing shot you can reuse as channel b-roll.',
    },
    {
      title: 'Shorts background',
      inputs: { prompt: 'neon city street in the rain, reflections on wet asphalt, slow push-in', duration: '4s', aspect: '9:16' },
      note: 'Produces a vertical loop-ready clip sized for YouTube Shorts and Reels.',
    },
  ],
  faqs: [
    {
      question: 'Is my API key safe?',
      answer:
        'Yes. Your fal.ai key is stored only in your browser\'s localStorage and is sent directly to fal.ai. HusnainBlogger is a static site with no backend — we cannot see, log, or store your key.',
    },
    {
      question: 'How much does text-to-video cost?',
      answer:
        'Video is billed per second on YOUR fal.ai account and is the most expensive generation category — a 6–8 second Veo clip can cost over a dollar. The exact figure is on your fal.ai dashboard; generate short clips first to gauge cost.',
    },
    {
      question: 'How long does a video take to generate?',
      answer:
        'Typically a few minutes: the job queues on fal.ai, renders, then this page fetches the MP4. The page polls for up to 10 minutes and shows live status; you can cancel any time.',
    },
    {
      question: 'Why did the call fail with a network error?',
      answer:
        'fal.ai officially recommends calling through your own server proxy, so some browsers block the direct call (CORS). If you see a network error, run the same request from your own computer with the same key, or wait and retry.',
    },
    {
      question: 'Can I generate videos of real people?',
      answer:
        'No — do not use this to depict real, identifiable people or events as if real. AI video is invented footage; use it for b-roll, backgrounds, and creative scenes.',
    },
    {
      question: 'How does the text to video ai generator work?',
      answer:
        'Enter your details using the inputs above and the text to video ai generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the text to video ai generator free to use?',
      answer:
        'Yes - this text to video ai generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'No key = no generation. The tool is fully wired, but fal.ai needs your own API key saved first.',
    'Durations are fixed by the Veo 3 endpoint (4s, 6s, 8s) — custom lengths are not supported.',
    'fal.ai browser calls are not officially supported by fal.ai; CORS blocking is a known possibility, not a bug in this tool.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Text to Video AI Generator 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/text-to-video-generator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free Text to Video Ai Generator 2026 – Free Generator - no signup required.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Text to Video Ai Generator 2026 – Free Generator | HusnainBlogger', item: 'https://husnainblogger.com/' },
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
          name: 'Text-to-Video Generator',
          item: 'https://husnainblogger.com/tools/ai-tools/text-to-video-generator/',
        },
      ],
    },
  ],
};

export const aiConfig: AiToolConfig = {
  lane: 'D',
  headline: 'Text-to-video (Google Veo 3) with YOUR fal.ai key — submit, poll, download.',
  providers: ['falai'],
  disclosures: [
    'Bring-your-own-key: video bills YOUR fal.ai account PER SECOND — the priciest generation category.',
    'Model endpoint fal-ai/veo3 (Google Veo 3 text-to-video) verified 2026-10-01.',
    'fal.ai officially recommends a server proxy; direct browser calls may be blocked by CORS — the tool reports it clearly.',
    'AI video is invented footage — never depict real, identifiable people or events as if real.',
  ],
  noKeyHeadline: 'Save your fal.ai key to unlock video generation',
  noKeyBody:
    'This tool is fully built — the only missing piece is your key. Get a fal.ai key (link above), paste it into the key vault, and press Save. Then press Generate and it works immediately — nothing else to configure. Remember: video bills per second on your fal.ai account.',
};
