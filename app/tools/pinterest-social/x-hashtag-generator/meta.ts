import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/x-hashtag-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. freelance design',
    validation: { max: 100 },
  },
  {
    id: 'count',
    label: 'How many hashtags',
    type: 'number',
    required: false,
    placeholder: '3',
    validation: { min: 1, max: 5 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'hashtags',
    label: 'Hashtag ideas',
    type: 'list',
    description: 'Free twitter hashtag generator 2026: Clean, space-free hashtags built from your topic plus picks from a curated generic bank —. Fast, private, no signup - try!',
  },
  {
    id: 'usageNote',
    label: 'Usage note',
    type: 'text',
    description: 'Best-practice guidance (0–2 hashtags per post) and an honest note when hashtags add little value for your topic.',
  },
];

export const content: ToolContent = {
  title: 'Twitter Hashtag Generator',
  description:
    'Generate free twitter hashtag ideas from any topic. Get clean, topic-based hashtags plus honest usage guidance — a curated bank, never fake trends. Try it!',
  howTo: [
    'Type your topic into the "Topic" field (keep it under 100 characters).',
    'Set "How many hashtags" from 1 to 5 (leave it blank for the default of 3).',
    'Run the tool to get hashtag ideas built from your topic plus a curated generic bank.',
    'Read the "Usage note" — it tells you when 0–2 per post is best and when hashtags add little value at all.',
    'Before posting, check X search to see which tags your audience actually uses.',
  ],
  methodology:
    'This tool builds tags from your topic (the joined CamelCase form plus each significant word) and fills the rest from a fixed, hand-written bank of 24 generic tags, picked deterministically from your topic — no AI is involved. Live trend data is unavailable client-side, so outputs are explicitly labeled as composed ideas, never as trending. Topics in a small low-hashtag-culture list (tax, insurance, legal, and similar) get an honest note that hashtags add little value there.',
  examples: [
    {
      title: 'Hashtags for a design topic',
      inputs: { topic: 'freelance design', count: 3 },
      note: 'Returns #FreelanceDesign, #Freelance, #Design — clean, space-free, topic-based.',
    },
    {
      title: 'Five ideas for fitness',
      inputs: { topic: 'home workouts', count: 5 },
      note: 'Returns 5 unique tags: topic-derived first, then curated generic picks.',
    },
  ],
  faqs: [
    {
      question: 'What is the best twitter hashtag generator?',
      answer:
        'The best twitter hashtag generator is honest about what it can do: it composes clean, topic-based tags from a curated bank instead of pretending to know live trends. This free tool does that — topic-derived tags first, then generic picks — and tells you when hashtags add little value for your topic at all.',
    },
    {
      question: 'Is there a free twitter hashtag generator?',
      answer:
        'Yes — this twitter hashtag generator is completely free with no signup. Enter any topic and get 1–5 hashtag ideas with usage guidance, as many times as you like.',
    },
    {
      question: 'How to generate twitter hashtag ideas?',
      answer:
        'Enter your topic and how many tags you want (1–5), then run the tool. Copy the ideas you like and check them in X search first — tags your audience actually uses beat generic ones every time.',
    },
    {
      question: 'How does a twitter hashtag generator work?',
      answer:
        'It takes your topic, strips spaces and punctuation into CamelCase tags (e.g. "home workouts" becomes #HomeWorkouts), and adds picks from a curated bank of 24 generic tags. It does not — and client-side tools cannot — read live X trend data, so nothing here is presented as "trending".',
    },
    {
      question: 'How does the twitter hashtag generator work?',
      answer:
        'Enter your details using the inputs above and the twitter hashtag generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the twitter hashtag generator free to use?',
      answer:
        'Yes - this twitter hashtag generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a twitter hashtag generator?',
      answer:
        'A twitter hashtag generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Hashtags are composed from your topic plus a fixed bank of 24 generic tags — they are ideas, not live trend data.',
    'Best practice is 0–2 hashtags per post on X; more reads as spam. Topics like tax, insurance, or legal get an explicit note that hashtags add little value.',
    'All tags are normalized (letters, digits, and underscores only, no spaces); count must be a whole number between 1 and 5.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Twitter Hashtag Generator 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free twitter hashtag generator 2026: Clean, space-free hashtags built from your topic plus picks from a curated generic bank —. Fast, private, no signup - try!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Pinterest & Social Tools',
          item: 'https://husnainblogger.com/tools/pinterest-social/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'X Hashtag Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
