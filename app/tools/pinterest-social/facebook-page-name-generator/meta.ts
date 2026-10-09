import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/facebook-page-name-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'businessType',
    label: 'Business type',
    type: 'text',
    required: true,
    placeholder: 'e.g. bakery, plumbing service, fitness studio',
    validation: { max: 60 },
  },
  {
    id: 'keywords',
    label: 'Keywords (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'e.g. custom cakes, Chicago (comma or line separated, max 5)',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'pageNames',
    label: 'Page name ideas',
    type: 'list',
    description: 'Free facebook page name ideas 2026: 8 searchable page-name candidates, each within Facebook\\u2019s 75-character limit. Fast, private, no signup - try it now!',
  },
  {
    id: 'copyAll',
    label: 'Copy all names',
    type: 'copy',
    description: 'All 8 candidates as plain text, ready to check on Facebook.',
  },
  {
    id: 'availabilityNote',
    label: 'Availability note',
    type: 'text',
    description: 'Why availability must be checked manually on Facebook.',
  },
];

export const content: ToolContent = {
  title: 'Facebook Page Name Ideas',
  description:
    'Get free facebook page name ideas for your business. Enter your business type and keywords to get 8 searchable name options. Check availability on Facebook!',
  howTo: [
    'Type your business type into the "Business type" field (e.g. bakery).',
    'Optionally add up to 5 keywords in "Keywords", comma or line separated (e.g. custom cakes, Chicago).',
    'Run the tool to get 8 page-name ideas, each within Facebook\u2019s 75-character limit.',
    'Use "Copy all names" and search each candidate on Facebook to check availability.',
    'Before creating the page, also check your local trademark database — this tool cannot verify availability or legal clearance.',
  ],
  methodology:
    'This tool assembles names from a fixed bank of 16 hand-written name patterns (8 combining business type + keyword, 8 using only the business type when no keywords are given). Patterns are picked deterministically from your inputs — no AI is involved. Every candidate is title-cased and kept within 75 characters; over-long candidates are dropped, never truncated. Inputs containing "official", "verified", "facebook", "meta", or "fb" are rejected because Facebook\u2019s naming rules ban misleading official/verified claims.',
  examples: [
    {
      title: 'Bakery with keywords',
      inputs: { businessType: 'bakery', keywords: 'custom cakes, Chicago' },
      note: 'Returns 8 keyword-combined page names like "Custom Cakes Bakery".',
    },
    {
      title: 'Plumbing service, no keywords',
      inputs: { businessType: 'plumbing service' },
      note: 'Returns 8 business-type-only names like "The Plumbing Service".',
    },
  ],
  faqs: [
    {
      question: 'What is the best facebook page name ideas?',
      answer:
        'The best facebook page name ideas combine your real business name with a searchable keyword (what you do + where), stay under 75 characters, and match the name customers already know you by. Avoid words like "official" or "verified" — Facebook rejects misleading claims. This free generator builds 8 candidates from proven patterns.',
    },
    {
      question: 'Is there a free facebook page name ideas?',
      answer:
        'Yes — this facebook page name generator is completely free with no signup. You get 8 name candidates per run, with or without keywords, as many times as you like.',
    },
    {
      question: 'How to use facebook page name?',
      answer:
        'Enter your business type, optionally add keywords, and run the tool. Then search each candidate on Facebook to confirm availability, since this tool cannot check whether a name is taken, and avoid generic names that could clash with trademarks.',
    },
    {
      question: 'How does a facebook page name ideas work?',
      answer:
        'It inserts your business type and keywords into 16 hand-written name patterns, picking them deterministically from your inputs — no AI involved. Every candidate stays within Facebook\u2019s 75-character page-name limit, and availability must be checked manually on Facebook.',
    },
    {
      question: 'How does the facebook page name ideas work?',
      answer:
        'Enter your details using the inputs above and the facebook page name ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the facebook page name ideas free to use?',
      answer:
        'Yes - this facebook page name ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a facebook page name ideas?',
      answer:
        'A facebook page name ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Names come from a fixed bank of 16 patterns — the tool assembles text; it does not check availability, invent brands, or verify trademark clearance.',
    'The 75-character page-name limit is enforced on every candidate; over-long candidates are dropped.',
    'Inputs containing "official", "verified", "facebook", "meta", or "fb" are rejected to stay within Facebook\u2019s naming rules.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Facebook Page Name Ideas 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free facebook page name ideas 2026: 8 searchable page-name candidates, each within Facebook\\\\u2019s 75-character limit. Fast, private, no signup - try it now!',
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
          name: 'Facebook Page Name Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
