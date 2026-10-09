import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/pinterest-hashtag-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Pin topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. small balcony garden',
    validation: { max: 80 },
  },
  {
    id: 'count',
    label: 'Number of hashtags',
    type: 'number',
    required: false,
    placeholder: '10',
    validation: { min: 1, max: 20 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'hashtags',
    label: 'Hashtag suggestions',
    type: 'list',
    description:
      'Free pinterest hashtags 2026: Specific topic-derived tags first, then curated generic tags. Curated suggestions only —. Fast, private, no signup - try it now!',
  },
  {
    id: 'note',
    label: 'Usage notes',
    type: 'text',
    description:
      'Always labels the tags as curated suggestions (not live trend data), recommends 2–5 specific tags per pin, and steers overly broad topics toward a narrower angle.',
  },
];

export const content: ToolContent = {
  title: 'Pinterest Hashtag Generator',
  description:
    'Find pinterest hashtags with this free generator. Enter your pin topic to get specific topic tags plus curated suggestions, ranked and ready. Try it now!',
  howTo: [
    'Enter your pin topic (up to 80 characters).',
    'Choose how many hashtags you want, from 1 to 20 (defaults to 10).',
    'Run the tool to get topic-derived tags first, then curated generic tags.',
    'Use 2–5 of the most specific tags on your pin — put the most specific one first.',
    'If your topic is very broad, narrow it (e.g. "easy recipes for beginners") and run again.',
  ],
  methodology:
    'The tool builds tags from your topic words in camelCase with four fixed suffixes (Ideas, Tips, Inspiration, DIY), then fills the rest from a fixed bank of 48 hand-picked generic Pinterest hashtags, taken in deterministic rotation from your topic text. No AI and no live data are used — the same topic and count always return the identical list, and the results are labeled as curated suggestions, not trend data.',
  examples: [
    {
      title: 'Balcony garden pin',
      inputs: { topic: 'small balcony garden', count: 10 },
      note: 'Starts with #smallBalconyGarden and its variants, then curated tags.',
    },
    {
      title: 'Short list',
      inputs: { topic: 'meal prep', count: 5 },
      note: 'Five tags, most specific first.',
    },
    {
      title: 'Overly broad topic',
      inputs: { topic: 'food', count: 8 },
      note: 'Adds a note steering you toward a narrower angle.',
    },
  ],
  faqs: [
    {
      question: 'What is the best pinterest hashtags?',
      answer:
        'The best Pinterest hashtags are specific to your pin’s topic — #smallBalconyGarden beats #garden. This free generator puts topic-derived tags first and adds curated generic ones after, and reminds you to use 2–5 relevant tags per pin.',
    },
    {
      question: 'Is there a free pinterest hashtags?',
      answer:
        'Yes — this Pinterest hashtag generator is completely free with no signup. Enter your topic and get up to 20 hashtag suggestions. Note that these are curated suggestions, not live trend or volume data.',
    },
    {
      question: 'How to use pinterest hashtags?',
      answer:
        'Add 2–5 relevant hashtags to your pin description, most specific first. Enter your topic in this tool, pick the most specific suggestions from the list, and skip the generic ones that do not match your pin.',
    },
    {
      question: 'How does a pinterest hashtags work?',
      answer:
        'You enter a topic and the tool builds camelCase tags from your topic words, then fills the list from a fixed bank of 48 curated hashtags in deterministic rotation. Because the bank and rotation are fixed, identical inputs always return the identical list.',
    },
    {
      question: 'How does the pinterest hashtags work?',
      answer:
        'Enter your details using the inputs above and the pinterest hashtags calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the pinterest hashtags free to use?',
      answer:
        'Yes - this pinterest hashtags is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a pinterest hashtags?',
      answer:
        'A pinterest hashtags is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Tags come from your topic words plus a fixed bank of 48 curated generic hashtags — they are suggestions, not live popularity or trend data, and the tool must never be read as providing those.',
    'Very broad single-word topics get a steering note; narrowing the topic yourself produces far more useful tags.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Pinterest Hashtag Generator 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free pinterest hashtags 2026: Specific topic-derived tags first, then curated generic tags. Curated suggestions only —. Fast, private, no signup - try it now!',
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
          name: 'Pinterest Hashtag Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
