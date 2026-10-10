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
    description:
    'Free alphabet soup keyword method 2026: Your seed followed by each letter a-z. free.',
  },
  {
    id: 'count',
    label: 'Ideas generated',
    type: 'number',
    description:
    'Always 26 — one per letter.',
  },
];

export const content: ToolContent = {
  title: 'Alphabet Soup Keyword Method',
  description:
    'Run the alphabet soup keyword method: expand any seed with a–z suffixes for brainstorming. Free alphabet soup keyword method — try your seed now.',
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
      question: 'What is an alphabet soup keyword method?',
      answer:
        'An alphabet soup keyword method is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'How do I use this alphabet soup keyword method tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
    {
      question: 'Is this alphabet soup keyword method tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
  ],
  assumptions: [
    'Outputs are mechanical letter combinations, not real autocomplete suggestions — they carry no search data.',
    'For non-Latin seeds the a-z letters still apply as suffixes, which may be less useful.',
  ],
  jsonLd: [],
};
