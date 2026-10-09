import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'showTheme',
    label: 'Show theme',
    type: 'text',
    required: true,
    placeholder: 'e.g. indie game dev',
  },
  {
    id: 'episodeLengthMinutes',
    label: 'Episode length (minutes, optional)',
    type: 'number',
    required: false,
    placeholder: 'Defaults to 30',
    validation: { min: 1, max: 300 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'ideas',
    label: 'Episode ideas',
    type: 'list',
    description: 'Free podcast episode ideas 2026: Episode title ideas, each with a segment breakdown from a fixed segment bank. Fast, private, no signup - try it now!',
  },
  {
    id: 'planNote',
    label: 'Plan note',
    type: 'text',
    description: 'How segments were assigned for the episode length.',
  },
];

export const content: ToolContent = {
  title: 'Podcast Episode Ideas',
  description:
    'Spark your next episodes — combine your show theme with 6 fixed title formulas and segment breakdowns. Free podcast episode ideas generator. Start planning now!',
  howTo: [
    'Enter your show\'s theme in a few words.',
    'Optionally set the episode length in minutes (defaults to 30).',
    'Click generate to get 6 episode ideas, each with a segment breakdown.',
    'Swap any segment for one that fits your format, then record.',
  ],
  methodology:
    'This is a word-bank combiner, not AI ideation. Your theme is inserted into 6 fixed title formulas, and each idea is paired with segments from a fixed bank of 8 named segments: under 20 minutes gets 2 segments, 20–45 minutes gets 3, and over 45 minutes gets 4. Segment assignments follow these fixed rules; nothing is invented beyond the combination.',
  examples: [
    {
      title: 'Indie games show',
      inputs: {
        showTheme: 'indie game dev',
        episodeLengthMinutes: 30,
      },
      note: '6 ideas with 3-segment breakdowns (hook, deep-dive, takeaways).',
    },
    {
      title: 'Short daily show',
      inputs: {
        showTheme: 'morning productivity',
        episodeLengthMinutes: 12,
      },
      note: '6 ideas with 2-segment breakdowns for short episodes.',
    },
  ],
  faqs: [
    {
      question: 'What is the best source of podcast episode ideas?',
      answer:
        'The best podcast episode ideas come from knowing your show\'s theme and your listeners\' questions — this tool turns that theme into starting points. It combines your theme with 6 fixed title formulas and pairs each idea with a segment breakdown from a fixed bank. It will not invent audience demand, so always sanity-check ideas against what your listeners ask for.',
    },
    {
      question: 'Is there a free podcast episode ideas generator?',
      answer:
        'Yes — this one. It is free, runs entirely in your browser, and needs no sign-up. Enter your show\'s theme and optionally the episode length, and you get 6 episode ideas with segment breakdowns in seconds.',
    },
    {
      question: 'How do I plan a podcast episode?',
      answer:
        'Fix the episode\'s promise, then break it into segments that fit your runtime: short episodes need a hook plus takeaways, longer ones add interviews or Q&A. This tool generates the idea list and the segment breakdowns; you decide the order and swap segments to match your format.',
    },
    {
      question: 'How does a podcast episode idea generator work?',
      answer:
        'This one is template-based, not AI: your theme fills 6 fixed title formulas, and a fixed rule assigns segments by episode length — 2 segments under 20 minutes, 3 for 20–45 minutes, 4 above 45 minutes. The same inputs always produce the same ideas.',
    },
    {
      question: 'How does the podcast episode ideas work?',
      answer:
        'Enter your details using the inputs above and the podcast episode ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the podcast episode ideas free to use?',
      answer:
        'Yes - this podcast episode ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a podcast episode ideas?',
      answer:
        'A podcast episode ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Ideas come from 6 fixed title formulas + a fixed 8-segment bank — they are starting points, not final titles.',
    'Segment breakdowns follow fixed length rules; actual segment timing depends on your pacing.',
    'The tool cannot tell you which ideas your audience wants — check listener questions and comments.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Podcast Episode Ideas 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-workflows/podcast-episode-idea-generator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free podcast episode ideas 2026: Episode title ideas, each with a segment breakdown from a fixed segment bank. Fast, private, no signup - try it now!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'AI Workflow Tools',
          item: 'https://husnainblogger.com/tools/ai-workflows/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Podcast Episode Idea Generator',
          item: 'https://husnainblogger.com/tools/ai-workflows/podcast-episode-idea-generator/',
        },
      ],
    },
  ],
};
