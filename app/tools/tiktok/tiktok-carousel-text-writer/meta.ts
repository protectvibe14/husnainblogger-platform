import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-carousel-text-writer/';

export const inputs: ToolInput[] = [
  {
    id: 'carouselTopic',
    label: 'Carousel topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. beginner meal prep, home workouts, budget travel',
  },
  {
    id: 'slideCount',
    label: 'Number of slides',
    type: 'number',
    required: true,
    validation: { min: 2, max: 35 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'slides',
    label: 'Per-slide text',
    type: 'list',
    description: 'Free tiktok carousel text 2026: Ready-to-use text for every slide: hook cover line, value lines, and a CTA line. Fast, private, no signup - try it now!',
  },
  {
    id: 'note',
    label: 'Note',
    type: 'text',
    description: 'Confirms the slide breakdown and word guidance — and states it plainly if your request was clamped to TikTok\'s 35-slide cap.',
  },
];

export const content: ToolContent = {
  title: 'TikTok Carousel Text',
  description:
    'Write tiktok carousel text in seconds: hook cover line, value lines, and CTA per slide, all under 50 words. Enter your topic — try it free now!',
  howTo: [
    'Type your "Carousel topic" (e.g. home workouts) and enter a "Number of slides" from 2 to 35.',
    'Run the tool: Slide 1 gets a hook cover line, middle slides get value lines, and the last slide gets a CTA.',
    'Copy each line onto its slide — every line is written under 50 words so it stays readable on mobile.',
    'Check the "Note": if you asked for more than 35 slides, it says so — TikTok Photo Mode caps at 35.',
    'Pair each text line with a photo or graphic, then build the carousel in the TikTok app.',
  ],
  methodology:
    'Text comes from fixed template banks, not AI: 10 cover hooks, 12 value lines, and 5 CTAs. A deterministic hash of your topic picks the starting templates and value lines cycle through the bank, so the same inputs always produce the same text. Slide counts are validated as whole numbers from 2 to 35; requests above 35 are clamped to 35 with an honest note.',
  examples: [
    {
      title: '5-slide home workout carousel',
      inputs: { carouselTopic: 'home workouts', slideCount: 5 },
      note: 'Hook cover line, 3 value lines, and a CTA — every line under 50 words.',
    },
    {
      title: '40 slides requested',
      inputs: { carouselTopic: 'budget travel', slideCount: 40 },
      note: 'Clamped to 35 slides with a note saying exactly that — TikTok Photo Mode\'s cap.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok carousel text?',
      answer:
        'The best tiktok carousel text is short and scannable: a hook cover line that stops the swipe, one value line per slide under 50 words, and a single CTA on the last slide. This free writer generates exactly that structure for any topic and any slide count from 2 to 35.',
    },
    {
      question: 'Is there a free tiktok carousel text?',
      answer:
        'Yes — this TikTok carousel text writer is completely free with no signup. Enter your topic and slide count, and get ready-to-use text for every slide, as many times as you like.',
    },
    {
      question: 'How to use tiktok carousel text?',
      answer:
        'Paste your topic and slide count, run the tool, then copy each line onto its slide in the TikTok app\'s Photo mode. Keep text big and high-contrast, one idea per slide, and put your CTA on the final slide. Every generated line is already written under 50 words.',
    },
    {
      question: 'How does the tiktok carousel text work?',
      answer:
        'Enter your details using the inputs above and the tiktok carousel text calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok carousel text free to use?',
      answer:
        'Yes - this tiktok carousel text is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok carousel text?',
      answer:
        'A tiktok carousel text is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the tiktok carousel text?',
      answer:
        'No account needed. Open the tiktok carousel text, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Text comes from fixed template banks, not AI; quality comes from the topic you enter.',
    'This tool writes text only — it does not create images or post carousels.',
    'The 35-slide cap follows TikTok\'s Photo Mode rule; requests above it are clamped, never silently accepted.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'TikTok Carousel Text 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free tiktok carousel text 2026: Ready-to-use text for every slide: hook cover line, value lines, and a CTA line. Fast, private, no signup - try it now!',
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
          name: 'TikTok Carousel Text Writer',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
