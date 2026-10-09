import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-cover-text-idea-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'videoTopic',
    label: 'Video topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. meal prep, sourdough, home workouts',
    validation: { max: 60 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'covers',
    label: 'Cover text lines',
    type: 'list',
    description:
    'Free tiktok cover text ideas 2026: 8 big-bold cover lines, each capped at 25 characters for cover readability. Fast, private now.',
  },
  {
    id: 'copyAll',
    label: 'Copy all lines',
    type: 'copy',
    description:
    'All 8 cover lines as plain text, with honest variants suggested for any clickbait-flagged lines.',
  },
];

export const content: ToolContent = {
  title: 'TikTok Cover Text Ideas',
  description:
    'Get free tiktok cover text ideas: 8 big-bold cover lines capped at 25 chars for readability, with honest variants suggested for clickbait lines.',
  howTo: [
    'Enter your "Video topic" (up to 60 characters).',
    'Run the tool to get 8 cover text lines in big-bold style, each 25 characters or fewer.',
    'Review any lines flagged with an honest version — the tool marks clickbait-style lines and suggests a truthful rewrite.',
    'Use "Copy all lines" to paste the set into your notes or editor.',
    'Apply your chosen line as cover text in the TikTok app or your editor, in large high-contrast type.',
  ],
  methodology:
    'This tool fills your video topic (uppercased) into a fixed bank of 20 hand-written cover text templates. A deterministic hash of your topic rotates which 8 templates are picked — the same topic always returns the same 8 lines. Any line that would exceed 25 characters has its topic trimmed at a word boundary, and templates flagged as clickbait get an honest alternative suggested in the copy-all text. Nothing is AI-generated, and the tool never renders covers: it only produces the text.',
  examples: [
    {
      title: 'Cover lines for a meal-prep video',
      inputs: { videoTopic: 'meal prep' },
      note: 'Returns 8 cover lines, each within 25 characters.',
    },
    {
      title: 'Cover lines for a long topic',
      inputs: { videoTopic: 'ai voice agents for dental clinics' },
      note: 'Long topics are trimmed at word boundaries so every line still fits 25 characters.',
    },
    {
      title: 'Cover lines for a sourdough video',
      inputs: { videoTopic: 'sourdough' },
      note: 'Clickbait-flagged templates include an honest rewrite in the copy-all text.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok cover text ideas?',
      answer:
        'The best tiktok cover text ideas are short, specific, and honest — big bold phrases like "MEAL PREP IN 60 SECONDS" that promise exactly what the video delivers. This free generator gives you 8 cover lines per topic, each capped at 25 characters for readability, and flags clickbait-style lines with an honest rewrite.',
    },
    {
      question: 'Is there a free tiktok cover text ideas?',
      answer:
        'Yes — this TikTok cover text generator is completely free with no signup. Enter any video topic and get 8 cover text lines, as many times as you like.',
    },
    {
      question: 'How to use tiktok cover text?',
      answer:
        'Copy one of the generated lines and add it as cover text on your TikTok video in large, high-contrast type — the cover is what viewers see on your profile grid, so it should say what the video is about in a few words. Keep it under 25 characters so it stays readable at thumbnail size.',
    },
    {
      question: 'How does a tiktok cover text ideas work?',
      answer:
        'It inserts your video topic into a fixed 20-template bank, uppercased for cover style, and deterministically rotates which 8 templates you get per topic. Templates flagged as clickbait get an honest alternative suggested. No AI is involved; it is template assembly with your topic inserted.',
    },
    {
      question: 'How does the tiktok cover text ideas work?',
      answer:
        'Enter your details using the inputs above and the tiktok cover text ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok cover text ideas free to use?',
      answer:
        'Yes - this tiktok cover text ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok cover text ideas?',
      answer:
        'A tiktok cover text ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Cover lines come from a fixed 20-template bank — the same topic always returns the same 8 lines.',
    'The 25-character cap is cover readability guidance, not a TikTok rule.',
    'This tool produces cover text only; it does not design or render cover images.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'TikTok Cover Text Ideas 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free tiktok cover text ideas 2026: 8 big-bold cover lines, each capped at 25 characters for cover readability. Fast, private now.',
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
          name: 'TikTok Cover Text Idea Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
