import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'seedKeyword',
    label: 'Seed keyword',
    type: 'text',
    required: true,
    placeholder: 'e.g. dog training',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'expansions',
    label: 'Alphabet soup ideas',
    type: 'list',
    description: 'Free alphabet soup keyword method 2026: Your seed followed by each letter a-z. Instant, private, and mobile-friendly. No signup - try it free!',
  },
  {
    id: 'count',
    label: 'Ideas generated',
    type: 'number',
    description: 'Always 26 — one per letter.',
  },
];

export const content: ToolContent = {
  title: 'Alphabet Soup Keyword Method 2026 – Free | HusnainBlogger',
  description:
    'Run the alphabet soup keyword method: expand any seed with a–z suffixes for brainstorming. Free alphabet soup keyword method — try your seed now!',
  howTo: [
    'Type your seed keyword (2-100 characters) into the Seed keyword field.',
    'Click Generate to append each letter a-z to your seed.',
    'Scan the 26 combinations for letters that spark real keyword ideas.',
    'Take promising letters (e.g. "dog training t") and research what searchers actually type after them.',
    'Validate shortlisted ideas with real keyword data before targeting them.',
  ],
  methodology:
    'The alphabet soup method appends each letter a-z to your seed ("{seed} a" through "{seed} z"), mimicking the starting point of an autocomplete exploration. It runs entirely in your browser — no AI model, no live autocomplete or search-volume data. Every run produces exactly 26 deterministic combinations.',
  examples: [
    {
      title: 'Pet blog',
      inputs: { seedKeyword: 'dog training' },
      note: 'Produces "dog training a" through "dog training z" — a letter like "t" may spark ideas such as "dog training tips".',
    },
    {
      title: 'SEO blog',
      inputs: { seedKeyword: 'keyword research' },
      note: 'Produces "keyword research a" through "keyword research z" for autocomplete-style brainstorming.',
    },
  ],
  faqs: [
    {
      question: 'What is the best alphabet soup keyword method?',
      answer:
        'The method itself is the trick — appending a-z to a seed to brainstorm autocomplete-style ideas — so "best" comes down to execution. This free tool automates the mechanical part in your browser; the research judgment afterward is yours.',
    },
    {
      question: 'Is there a free alphabet soup keyword method?',
      answer:
        'Yes — this tool is completely free with no signup. It generates all 26 letter combinations instantly. It does not show real autocomplete suggestions or search volumes.',
    },
    {
      question: 'How to use alphabet soup keyword method?',
      answer:
        'Type a seed keyword, append each letter a-z, and note which letters suggest real queries — then check those against actual autocomplete results and keyword data. Enter your seed above to generate the 26 starting combinations.',
    },
    {
      question: 'How does an alphabet soup keyword method work?',
      answer:
        'It mechanically produces "{seed} a" through "{seed} z" so you can brainstorm what searchers might type after each letter. This tool does the letter-appending for you; it never queries Google, so the outputs are idea seeds, not real suggestions.',
    },
    {
      question: 'How does the alphabet soup keyword method work?',
      answer:
        'Enter your details using the inputs above and the alphabet soup keyword method calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the alphabet soup keyword method free to use?',
      answer:
        'Yes - this alphabet soup keyword method is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an alphabet soup keyword method?',
      answer:
        'An alphabet soup keyword method is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Outputs are mechanical letter combinations, not real autocomplete suggestions — they carry no search data.',
    'For non-Latin seeds the a-z letters still apply as suffixes, which may be less useful.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Alphabet Soup Keyword Method 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/blogging-seo/alphabet-soup-keyword-expander/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free alphabet soup keyword method 2026: Your seed followed by each letter a-z. Instant, private, and mobile-friendly. No signup - try it free!',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Blogging SEO & Content Tools',
          item: 'https://husnainblogger.com/tools/blogging-seo/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Alphabet Soup Keyword Expander',
          item: 'https://husnainblogger.com/tools/blogging-seo/alphabet-soup-keyword-expander/',
        },
      ],
    },
  ],
};
