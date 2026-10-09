import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/email-marketing/newsletter-name-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Newsletter niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. personal finance, sourdough baking, indie SaaS',
  },
  {
    id: 'keywords',
    label: 'Keywords (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. money, habits (comma-separated)',
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['playful', 'professional', 'witty', 'minimal', 'bold'],
  },
  {
    id: 'count',
    label: 'Number of names',
    type: 'number',
    required: true,
    placeholder: '10',
    validation: { min: 1, max: 20 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'names',
    label: 'Generated names',
    type: 'table',
    description:
    'Free newsletter name generator 2026: Name ideas, each with a matching tagline suggestion. free.',
  },
  {
    id: 'notices',
    label: 'Notes',
    type: 'list',
    description:
    'Truncation notes and the availability-check reminder.',
  },
];

export const content: ToolContent = {
  title: 'Newsletter Name Generator',
  description:
    'Name your newsletter something memorable: enter your niche and keywords, pick from 5 tones, and get name ideas with matching taglines included.',
  howTo: [
    'Type your newsletter niche in the "Newsletter niche" field (e.g. personal finance).',
    'Optionally add a few comma-separated keywords to flavor the names.',
    'Pick a tone: playful, professional, witty, minimal, or bold.',
    'Choose how many names to generate (1–20) and run the tool.',
    'Copy your favorites, then check domain and social-handle availability manually — this tool cannot check availability.',
  ],
  methodology:
    'Names are assembled deterministically from fixed word banks (18 suffixes, 40 tone words across 5 tones, 10 name patterns, 8 tagline templates) using a seeded combination of your inputs — no AI is involved, and the same inputs always produce the same names. The tool cannot check whether a name is taken: domain and social-handle availability must be verified manually before you commit to a name.',
  examples: [
    {
      title: 'Finance newsletter, bold tone',
      inputs: { niche: 'personal finance', keywords: 'money, habits', tone: 'bold', count: 5 },
      note: 'Five bold name ideas with matching tagline suggestions.',
    },
    {
      title: 'Baking newsletter, playful tone',
      inputs: { niche: 'sourdough baking', tone: 'playful', count: 3 },
      note: 'Keywords are optional — a niche and a tone are enough to start.',
    },
  ],
  faqs: [
    {
      question: 'What is the best newsletter name generator?',
      answer:
        'The best newsletter name generator gives you original, on-topic ideas matched to your niche and tone — with tagline suggestions you can actually use. This tool does that for free, but remember to check domain and social-handle availability manually, since no free client-side generator can verify that for you.',
    },
    {
      question: 'Is there a free newsletter name generator?',
      answer:
        'Yes — this newsletter name generator is free with no signup. Enter your niche, pick a tone, and generate up to 20 names with tagline suggestions.',
    },
    {
      question: 'How to generate newsletter name ideas?',
      answer:
        'Enter your niche and a few keywords, choose a tone, and generate a batch of names. Shortlist the ones that are easy to spell and say aloud, then check domain and social-handle availability manually before committing.',
    },
    {
      question: 'Can bloggers use this newsletter name generator?',
      answer:
        'Yes — enter your blog’s niche and the tone your readers expect, then generate names that match your existing brand. Pair a winning name with one of the suggested taglines as your signup-page headline.',
    },
    {
      question: 'How does the newsletter name generator work?',
      answer:
        'Enter your details using the inputs above and the newsletter name generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the newsletter name generator free to use?',
      answer:
        'Yes - this newsletter name generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a newsletter name generator?',
      answer:
        'A newsletter name generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'This tool cannot check domain or social-handle availability — verify every name manually before using it.',
    'Names are assembled from fixed word banks and patterns, not written by AI; treat them as starting ideas.',
    'Niche and keyword inputs are truncated at 80 and 120 characters (code points) respectively, with a visible notice.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Newsletter Name Generator 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free newsletter name generator 2026: Name ideas, each with a matching tagline suggestion. free.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Email Marketing Tools',
          item: 'https://husnainblogger.com/tools/email-marketing/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Newsletter Name Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
