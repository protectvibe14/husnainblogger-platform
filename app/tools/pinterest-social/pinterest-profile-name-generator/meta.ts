import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/pinterest-profile-name-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'brandOrName',
    label: 'Brand or name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Maple & Co., The Cozy Corner',
  },
  {
    id: 'keywords',
    label: 'Keywords (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. fall decor, handmade candles',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'displayNameCandidates',
    label: 'Display name ideas',
    type: 'list',
    description:
    'Free pinterest business name ideas 2026: Profile display-name options, each capped at 65 characters. Get instant results. free now.',
  },
  {
    id: 'usernameSuggestions',
    label: 'Username suggestions',
    type: 'list',
    description:
    'Format-valid username suggestions (lowercase, 3-30 chars). Availability must be checked on Pinterest.',
  },
];

export const content: ToolContent = {
  title: 'Pinterest Business Name Ideas',
  description:
    'Brainstorm a Pinterest business name that ranks: enter your brand plus keywords for display name and username ideas, then check availability on Pinterest.',
  howTo: [
    'Type your brand or name into the "Brand or name" field (e.g. Maple & Co.).',
    'Add an optional keyword in the "Keywords" field to make names keyword-led.',
    'Run the tool and review the "Display name ideas" (capped at 65 characters).',
    'Pick a "Username suggestion" you like, then search it on Pinterest to check availability before using it.',
    'Update your profile name and username in your Pinterest settings.',
  ],
  methodology:
    'This tool assembles display names from 4 fixed hand-written name patterns and builds usernames by slugifying your brand into Pinterest\'s username format (lowercase letters, numbers, and underscores, 3-30 characters) — no AI is involved. When a brand is too long, keyword-first truncation keeps your keyword and shrinks the brand at a word boundary. This tool cannot check whether a username is taken.',
  examples: [
    {
      title: 'Name ideas for a decor brand',
      inputs: { brandOrName: 'Maple & Co.', keywords: 'fall decor' },
      note: 'Returns 4 keyword-led display names plus 4 format-valid username suggestions.',
    },
    {
      title: 'Name ideas with no keyword',
      inputs: { brandOrName: 'The Cozy Corner' },
      note: 'Returns 4 plain display names and usernames built from the brand alone.',
    },
    {
      title: 'Long brand name handling',
      inputs: { brandOrName: 'The Extraordinarily Long Handmade Candle Studio of Portland', keywords: 'candles' },
      note: 'Display names are truncated keyword-first so "candles" always survives under 65 characters.',
    },
  ],
  faqs: [
    {
      question: 'What is the best pinterest business name ideas?',
      answer:
        'The best Pinterest business names pair your brand with the keyword your audience searches (for example "Maple & Co. | fall decor"), and use a short, memorable username. This free generator gives you 4 display-name ideas and 4 format-valid username suggestions per brand.',
    },
    {
      question: 'Is there a free pinterest business name ideas?',
      answer:
        'Yes — this Pinterest business name generator is completely free with no signup. Generate name ideas for as many brands and keywords as you like.',
    },
    {
      question: 'How to use pinterest business name?',
      answer:
        'Enter your brand or name, add an optional keyword, and run the tool. Copy a display name into your Pinterest profile name field, then search your chosen username on Pinterest to confirm it is available before claiming it.',
    },
    {
      question: 'How does a pinterest business name ideas work?',
      answer:
        'It takes your brand and keyword, then fills 4 fixed display-name patterns and slugifies the brand into Pinterest\'s username format (lowercase, 3-30 characters, letters/numbers/underscores only). No AI is involved, and availability checking is explicitly out of scope — you must verify names on Pinterest.',
    },
    {
      question: 'How does the pinterest business name ideas work?',
      answer:
        'Enter your details using the inputs above and the pinterest business name ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the pinterest business name ideas free to use?',
      answer:
        'Yes - this pinterest business name ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a pinterest business name ideas?',
      answer:
        'A pinterest business name ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Username availability cannot be checked client-side — suggestions are format-valid only; always verify on Pinterest.',
    'Display names come from 4 fixed patterns; long brands are truncated keyword-first at a word boundary.',
    'Brands with no Latin characters get a neutral fallback username base; display names keep the original script.',
    'Only the first keyword is used for keyword-led names; extra keywords are ignored.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Pinterest Business Name Ideas 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free pinterest business name ideas 2026: Profile display-name options, each capped at 65 characters. Get instant results. free now.',
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
          name: 'Pinterest Profile Name Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
