import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/reels-audio-search-term-finder/';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. fitness, home decor, book reviews',
  },
  {
    id: 'mood',
    label: 'Audio mood',
    type: 'select',
    required: true,
    options: ['Upbeat', 'Chill', 'Dramatic', 'Funny', 'Romantic', 'Inspirational'],
  },
  {
    id: 'count',
    label: 'Number of terms',
    type: 'number',
    required: true,
    placeholder: '1–10',
    validation: { min: 1, max: 10 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'searchTerms',
    label: 'Search terms',
    type: 'list',
    description: 'Free reels trending audio search 2026: Phrases to type into Instagram\\. Instant, private, and mobile-friendly. No signup - try it free!',
  },
  {
    id: 'tipNote',
    label: 'How to use them',
    type: 'text',
    description: 'How to run these phrases through Instagram\'s audio search and spot trending tracks.',
  },
];

export const content: ToolContent = {
  title: 'Reels Trending Audio Search 2026 – Free | HusnainBlogger',
  description:
    'Find the right sound faster with free reels trending audio search: mood-matched search phrases for your niche, used inside Instagram. Find your audio now!',
  howTo: [
    'Type your "niche" — what your Reels are about (e.g. fitness, home decor).',
    'Pick the "Audio mood" that fits the Reel you are making.',
    'Choose how many terms you want (1–10) and run the tool.',
    'Open the Reels composer in Instagram, tap Audio, and type each phrase into the search box.',
    'Look for tracks with a rising arrow — that marks audio that is trending right now.',
  ],
  methodology:
    'This tool assembles search phrases from 10 fixed formula templates combined with your niche and one of 6 moods (16 templates in all). The first N templates are returned for your chosen count, so output is deterministic. It produces search phrases only — it cannot query Instagram\'s trending charts, which exist only inside the Instagram app and have no public API.',
  examples: [
    {
      title: 'Fitness Reel, upbeat mood',
      inputs: { niche: 'fitness', mood: 'Upbeat', count: 3 },
      note: 'Three upbeat search phrases for finding workout Reel audio.',
    },
    {
      title: 'Home decor, chill mood',
      inputs: { niche: 'home decor', mood: 'Chill', count: 5 },
      note: 'Five mellow phrases for cozy home-tour audio.',
    },
    {
      title: 'Book reviews, dramatic mood',
      inputs: { niche: 'book reviews', mood: 'Dramatic', count: 2 },
      note: 'Two dramatic phrases for book-talk and plot-twist Reels.',
    },
  ],
  faqs: [
    {
      question: 'what is the best reels trending audio search?',
      answer:
        'The best reels trending audio search gives you the exact phrases to type into Instagram\'s audio search for your niche and mood — so you land on the right sound in seconds. This free tool builds those phrases for 6 moods and any niche, and honestly cannot show live trending charts (no website can).',
    },
    {
      question: 'is there a free reels trending audio search?',
      answer:
        'Yes — this reels trending audio search is completely free with no signup. Enter your niche, pick a mood, and get up to 10 search phrases to use inside Instagram\'s Reels audio search.',
    },
    {
      question: 'how to use reels trending audio search?',
      answer:
        'Enter your niche and the mood of your Reel, take the generated phrases, and type them into Instagram\'s Reels audio search (composer → Audio → search). Pick tracks marked with a rising arrow — those are the ones trending.',
    },
    {
      question: 'how does a reels trending audio search work?',
      answer:
        'It combines your niche and mood with fixed search-phrase formulas to produce targeted audio queries. You run those queries inside Instagram itself, because trending-audio data lives only in the Instagram app — this tool gives you the phrases, Instagram gives you the live results.',
    },
    {
      question: 'How does the reels trending audio search work?',
      answer:
        'Enter your details using the inputs above and the reels trending audio search calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the reels trending audio search free to use?',
      answer:
        'Yes - this reels trending audio search is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a reels trending audio search?',
      answer:
        'A reels trending audio search is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Outputs are search phrases, not live trending-audio data — no website can query Instagram\'s trending charts; they exist only inside the Instagram app.',
    'Phrases come from 10 fixed templates, not AI — they are starting points, so try small variations if a phrase returns few results.',
    'Trending status changes fast: a phrase that works today may surface different tracks next week, so re-check inside Instagram.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Reels Trending Audio Search 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free reels trending audio search 2026: Phrases to type into Instagram\\\\. Instant, private, and mobile-friendly. No signup - try it free!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Instagram Tools',
          item: 'https://husnainblogger.com/tools/instagram/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Reels Audio Search Term Finder',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
