import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'titleText',
    label: 'Video title text',
    type: 'text',
    required: true,
    placeholder: 'e.g. How I made $10K with AI',
    validation: { max: 120 },
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['hype', 'calm', 'funny'],
  },
  {
    id: 'maxEmojis',
    label: 'Max emojis',
    type: 'number',
    required: false,
    placeholder: '3',
    validation: { min: 1, max: 5 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'suggestions', label: 'Title suggestions', type: 'list' },
  { id: 'renderingNote', label: 'Rendering note', type: 'text' },
];

const DESCRIPTION =
  'Find the best emoji for youtube titles — type your title, pick a tone, and get front, end, and split emoji placements. Free, no signup. Try it now.';

export const content: ToolContent = {
  title: 'Emoji for YouTube Titles',
  description: DESCRIPTION,
  howTo: [
    'Type your video title text (120 characters max) into the title field.',
    'Choose a tone — hype, calm, or funny — to steer which emojis get picked.',
    'Set max emojis (1–5; defaults to 3). Emoji already in your title count toward this limit.',
    'Review the three suggestions: front placement, end placement, and split placement.',
    'Copy your favorite and preview it on a phone — emoji designs vary by device.',
  ],
  methodology:
    'The tool scans your title against a fixed bank of 16 keyword categories (64 mapped emojis, e.g. money, food, travel keywords) in bank order, then fills remaining slots from a fixed 5-emoji set for your chosen tone — no AI involved. Placement follows three fixed rules: all emojis first, all last, or split around the title. Emoji are counted Unicode-aware, with ZWJ sequences counted as one emoji, so the max-emojis limit is never exceeded.',
  examples: [
    {
      title: 'Money video, hype tone',
      inputs: { titleText: 'How I made money with AI', tone: 'hype', maxEmojis: 3 },
      note: 'Money keywords pull money emojis first; hype defaults fill the rest.',
    },
    {
      title: 'Calm tutorial title',
      inputs: { titleText: 'Beginner photo editing guide', tone: 'calm', maxEmojis: 2 },
      note: 'Learning keywords matched, with calm-tone emojis and only 2 total.',
    },
  ],
  faqs: [
    {
      question: 'What is the best emoji for youtube titles?',
      answer:
        'The best emoji match your topic and tone — money videos want money emoji, tutorials want learning emoji. This free suggester maps your title keywords to a curated emoji bank and shows three placements so you can pick what looks right.',
    },
    {
      question: 'Is there a free emoji for youtube titles?',
      answer:
        'Yes — this emoji suggester is completely free with no signup. Type your title, pick a tone, and get three emoji-enhanced versions with front, end, and split placements.',
    },
    {
      question: 'How to use emoji for youtube titles?',
      answer:
        'Keep it to 1–3 emoji, place them at the front for attention or the end for polish, and never let emoji replace your keywords — search still reads the text. This tool enforces the count and shows all three placements for every title.',
    },
    {
      question: 'How does an emoji for youtube titles work?',
      answer:
        'This suggester matches words in your title against a fixed keyword-to-emoji bank, fills any leftover slots with tone-based defaults, and renders front, end, and split placements. Emoji already in your title count toward the limit, and ZWJ sequences count as one emoji.',
    },
    {
      question: 'How does the emoji for youtube titles work?',
      answer:
        'Enter your details using the inputs above and the emoji for youtube titles calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the emoji for youtube titles free to use?',
      answer:
        'Yes - this emoji for youtube titles is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an emoji for youtube titles?',
      answer:
        'An emoji for youtube titles is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Emoji come from a fixed bank (16 keyword categories x 4 emojis + 3 tone sets x 5) — the tool does not invent emoji or analyze trends.',
    'Emoji rendering varies by OS and device; a suggestion that looks great on one phone may differ on another — preview before publishing.',
    'Keyword matching is simple substring matching in bank order; it does not understand context or sarcasm.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Emoji for YouTube Titles 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/video-editing/emoji-title-suggester/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: DESCRIPTION,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Video Editing Tools',
          item: 'https://husnainblogger.com/tools/video-editing/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Emoji Title Suggester',
          item: 'https://husnainblogger.com/tools/video-editing/emoji-title-suggester/',
        },
      ],
    },
  ],
};
