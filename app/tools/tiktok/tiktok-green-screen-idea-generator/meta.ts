import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-green-screen-idea-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. budget travel, skincare, personal finance',
  },
  {
    id: 'backgroundType',
    label: 'Background type',
    type: 'select',
    required: true,
    options: ['article', 'screenshot', 'map', 'chart'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'concepts',
    label: 'Green screen video concepts',
    type: 'list',
    description: 'Free tiktok green screen ideas 2026: 5 commentary video concepts, each with a hook, a background asset description, and 4. Fast, private, no signup - try it!',
  },
  {
    id: 'copyrightNote',
    label: 'Copyright reminder',
    type: 'text',
    description: 'Reminder to use your own screenshots or licensed images as green-screen backgrounds.',
  },
];

export const content: ToolContent = {
  title: 'TikTok Green Screen Ideas',
  description:
    'Generate tiktok green screen ideas: 5 commentary concepts with hooks, background descriptions, and script beats for your niche. Pick a background — try it free!',
  howTo: [
    'Type your niche into the "Your niche" box (e.g. budget travel, skincare).',
    'Pick a "Background type": article, screenshot, map, or chart — this shapes the background asset in each idea.',
    'Run the tool to get 5 green screen video concepts with a hook, background description, and 4 script beats each.',
    'Gather your background material: your own screenshots or licensed images only (see the copyright reminder).',
    'Film with TikTok\'s Green Screen effect, follow the script beats, and read the circled part in your hook.',
  ],
  methodology:
    'Ideas are assembled from fixed template banks — 10 hooks, 8 background-asset descriptions (2 per type), 6 script-beat structures, and 5 concept framings — with no AI and no video editing. A deterministic hash of your niche and background type picks the starting templates, so the same inputs always produce the same 5 concepts.',
  examples: [
    {
      title: 'Personal finance with a chart',
      inputs: { niche: 'personal finance', backgroundType: 'chart' },
      note: 'Returns 5 concepts like a "Debunk" video reacting to a bar chart with circled peak bars and 4 script beats.',
    },
    {
      title: 'Skincare with a screenshot',
      inputs: { niche: 'skincare', backgroundType: 'screenshot' },
      note: 'Returns 5 concepts built around your own product-result screenshots with names blurred.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok green screen ideas?',
      answer:
        'The best tiktok green screen ideas pair a strong hook with a background worth reacting to — a circled headline, your own stats screenshot, an annotated map, or a spiking chart — plus clear script beats (hook, zoom, take, CTA). This free generator gives you 5 ready-to-film concepts for your niche with all of that included.',
    },
    {
      question: 'Is there a free tiktok green screen ideas?',
      answer:
        'Yes — this TikTok green screen idea generator is completely free with no signup. Enter your niche, pick a background type, and get 5 commentary concepts with hooks and script beats, as many times as you like.',
    },
    {
      question: 'How to use tiktok green screen?',
      answer:
        'In the TikTok app, tap Effects on the record screen, search "Green Screen," and choose a photo or video from your camera roll as the background. Then follow one of this tool\'s concepts: read the hook while pointing at the circled part, zoom into the key section, give your take, and end with the CTA.',
    },
    {
      question: 'How does a tiktok green screen ideas work?',
      answer:
        'You enter your niche and pick a background type (article, screenshot, map, or chart). The tool deterministically assembles 5 concepts from fixed template banks — hooks, background-asset descriptions, and 4 script beats each — so the same inputs always return the same ideas. It never edits video; you film the concepts in the TikTok app.',
    },
    {
      question: 'How does the tiktok green screen ideas work?',
      answer:
        'Enter your details using the inputs above and the tiktok green screen ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok green screen ideas free to use?',
      answer:
        'Yes - this tiktok green screen ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok green screen ideas?',
      answer:
        'A tiktok green screen ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'This tool generates text concepts only — it does not edit video or create background images.',
    'Ideas come from fixed template banks, not AI; variety comes from the niche and background type you enter.',
    'Always use your own screenshots or licensed images as backgrounds — never copyrighted news sites or other creators\' content.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'TikTok Green Screen Ideas 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free tiktok green screen ideas 2026: 5 commentary video concepts, each with a hook, a background asset description, and 4. Fast, private, no signup - try it!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'TikTok Tools',
          item: 'https://husnainblogger.com/tools/tiktok/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'TikTok Green Screen Idea Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
