import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/pinterest-board-name-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'nicheKeyword',
    label: 'Niche keyword',
    type: 'text',
    required: true,
    placeholder: 'e.g. small kitchen organization, fall outfits',
  },
  {
    id: 'tone',
    label: 'Name tone',
    type: 'select',
    required: false,
    options: ['seo', 'playful', 'brand'],
  },
  {
    id: 'count',
    label: 'Number of names',
    type: 'number',
    required: false,
    placeholder: '5',
    validation: { min: 1, max: 10 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'boardNameCandidates',
    label: 'Board name ideas',
    type: 'list',
    description: 'Free pinterest board name ideas 2026: Keyword-led Pinterest board names from a fixed template bank, each capped at 100. Fast, private, no signup - try it now!',
  },
];

export const content: ToolContent = {
  title: 'Pinterest Board Name Ideas 2026 – Free | HusnainBlogger',
  description:
    'Generate Pinterest board name ideas for any niche — pick SEO, playful, or brand tone and get keyword-led names capped at 100 characters. Try it free now!',
  howTo: [
    'Type your niche keyword into the "Niche keyword" field (e.g. small kitchen organization).',
    'Choose a name tone: seo for search-friendly names, playful for personality, or brand for a curated look.',
    'Set "Number of names" between 1 and 10 (default 5) and run the tool.',
    'Pick your favorite from the "Board name ideas" list — every name is already capped at 100 characters.',
    'Paste the name into your new Pinterest board; keep the board focused on that one keyword for best results.',
  ],
  methodology:
    'This tool assembles names from a fixed bank of 36 hand-written name templates (12 per tone: seo, playful, brand) with your keyword inserted — it never uses AI. Templates are picked in bank order, so the same keyword, tone, and count always return the same names. Any name that would exceed 100 characters is trimmed at a word boundary to fit the board-name cap.',
  examples: [
    {
      title: 'SEO board names for meal prep',
      inputs: { nicheKeyword: 'meal prep', tone: 'seo', count: 3 },
      note: 'Returns 3 keyword-led, search-friendly board names with "meal prep" at the front.',
    },
    {
      title: 'Playful board names for gardening',
      inputs: { nicheKeyword: 'gardening', tone: 'playful', count: 5 },
      note: 'Returns 5 personality-driven names like "All Things gardening" from the playful bank.',
    },
    {
      title: 'Brand board names for home office',
      inputs: { nicheKeyword: 'home office', tone: 'brand', count: 4 },
      note: 'Returns 4 curated, studio-style names such as "The home office Edit".',
    },
  ],
  faqs: [
    {
      question: 'What is the best pinterest board name ideas?',
      answer:
        'The best Pinterest board names lead with the exact keyword your audience searches (for example "meal prep ideas" instead of a vague title), because board titles help Pinterest understand what the board is about. This free generator gives you up to 10 keyword-led name options per niche in SEO, playful, or brand tones.',
    },
    {
      question: 'Is there a free pinterest board name ideas?',
      answer:
        'Yes — this Pinterest board name generator is completely free with no signup. You can generate up to 10 names per run in any of the 3 tones, as many times as you like.',
    },
    {
      question: 'How to use pinterest board name?',
      answer:
        'Enter your niche keyword, pick a tone, and choose how many names you want. Copy your favorite name, paste it as the title when you create the board on Pinterest, and keep the board focused on that single topic so it ranks for that keyword.',
    },
    {
      question: 'How does a pinterest board name ideas work?',
      answer:
        'It takes your niche keyword and tone, then fills hand-written name templates from a fixed 36-template bank — cycling in bank order, so results are fully deterministic. No AI is involved, and every name is capped at 100 characters.',
    },
    {
      question: 'How does the pinterest board name ideas work?',
      answer:
        'Enter your details using the inputs above and the pinterest board name ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the pinterest board name ideas free to use?',
      answer:
        'Yes - this pinterest board name ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a pinterest board name ideas?',
      answer:
        'A pinterest board name ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Names come from a fixed bank of 36 templates (12 per tone) — they are naming patterns, not AI-written copy.',
    'Non-Latin keywords are inserted as-is; the tool never transliterates or rewrites them.',
    'A keyword longer than 100 characters is rejected because a keyword-led name could not fit the cap.',
    'Long keywords may be trimmed at a word boundary to keep names under 100 characters; with very long keywords fewer distinct names may be returned rather than duplicates.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Pinterest Board Name Ideas 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free pinterest board name ideas 2026: Keyword-led Pinterest board names from a fixed template bank, each capped at 100. Fast, private, no signup - try it now!',
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
          name: 'Pinterest Board Name Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
