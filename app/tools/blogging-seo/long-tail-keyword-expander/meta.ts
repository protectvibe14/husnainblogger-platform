import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'seedKeyword',
    label: 'Seed keyword',
    type: 'text',
    required: true,
    placeholder: 'e.g. email marketing',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'expansions',
    label: 'Long-tail idea seeds',
    type: 'list',
    description:
    'Keyword variations built from fixed modifier templates.',
  },
  {
    id: 'count',
    label: 'Ideas generated',
    type: 'number',
    description:
    'How many idea seeds were produced.',
  },
];

export const content: ToolContent = {
  title: 'Long Tail Keyword Generator – Free',
  description:
    'Generate long tail keyword ideas from any seed keyword with fixed modifier templates. Free long tail keyword generator — expand your seed now.',
  howTo: [
    'Type your seed keyword (2-100 characters) into the Seed keyword field.',
    'Click Generate to build variations from the fixed template banks.',
    'Review the idea seeds list for angles that fit your blog topic.',
    'Copy the promising ideas into your content plan or spreadsheet.',
    'Validate shortlisted ideas with real search data before targeting them.',
  ],
  methodology:
    'This tool combines your seed keyword with 28 fixed templates: 8 intent prefixes (e.g. "best"), 10 suffixes (e.g. "guide"), 6 audience phrases (e.g. "for bloggers") and 4 how-to patterns. It runs entirely in your browser — no AI model, no live search data, no search-volume or difficulty scores.',
  examples: [
    {
      title: 'Fitness blog',
      inputs: { seedKeyword: 'home workout' },
      note: 'Produces ideas like "best home workout", "home workout for beginners" and "how to choose home workout".',
    },
    {
      title: 'Marketing blog',
      inputs: { seedKeyword: 'email marketing' },
      note: 'Produces ideas like "email marketing guide", "email marketing for startups" and "email marketing mistakes to avoid".',
    },
    {
      title: 'Food blog',
      inputs: { seedKeyword: 'café recipes' },
      note: 'Unicode seeds work too — produces ideas like "best café recipes" and "café recipes checklist".',
    },
  ],
  faqs: [
    {
      question: 'What is the best long tail keyword generator?',
      answer:
        'No independent ranking proves one tool is "the best" — the right choice depends on whether you need real search-volume data or just brainstorming help. This free generator is a template-based starting point for idea seeds; pair it with a data-backed keyword tool before publishing.',
    },
    {
      question: 'Is there a free long tail keyword generator?',
      answer:
        'Yes — this tool is completely free with no signup. It builds idea seeds from fixed templates in your browser. It does not provide search volume or keyword difficulty, which paid tools charge for.',
    },
    {
      question: 'How to generate long tail keyword ideas?',
      answer:
        'Start from a broad seed keyword, then add intent modifiers ("best", "how to"), audience phrases ("for beginners") and question forms. Enter your seed above and this tool applies those patterns automatically, giving you a starter list to refine.',
    },
    {
      question: 'How does a long tail keyword generator work?',
      answer:
        'This one works with fixed word banks: it inserts your seed keyword into 28 hand-written templates covering prefixes, suffixes, audiences and how-to patterns. It does not query Google and has no live data — every output is a deterministic template combination.',
    },
    {
      question: 'What is a long tail keyword example?',
      answer:
        'A long tail keyword is a specific, longer search phrase like "best running shoes for flat feet women" instead of just "running shoes". They have lower search volume but much lower competition and higher conversion rates. Enter any seed keyword above to generate dozens of long-tail variations.',
    },
    {
      question: 'Are long tail keywords still effective for SEO in 2026?',
      answer:
        'Yes — long tail keywords remain one of the most effective SEO strategies. They are easier to rank for (lower KD), attract more qualified traffic, and convert better because the searcher knows exactly what they want.',
    },
    {
      question: 'How many words should a long tail keyword have?',
      answer:
        'Long tail keywords typically have 3-5+ words. The key is specificity, not just length — "organic dog food for sensitive stomachs" (6 words) is more valuable than a generic 3-word phrase with high competition.',
    },
  ],
  assumptions: [
    'Outputs are brainstorming idea seeds, not real keyword data — they carry no search volume, difficulty or trend information.',
    'Templates are English-language patterns; results may read unnaturally for non-English seeds or very technical topics.',
    'Always validate shortlisted ideas with a data-backed keyword research tool before targeting them.',
  ],
  jsonLd: [
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Long-Tail Keyword Expander',
          item: 'https://husnainblogger.com/tools/blogging-seo/long-tail-keyword-expander/',
        },
      ],
    },
  ],
};
