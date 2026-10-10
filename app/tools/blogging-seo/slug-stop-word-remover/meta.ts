import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/slug-stop-word-remover/';

export const inputs: ToolInput[] = [
  {
    id: 'titleOrSlug',
    label: 'Title or slug',
    type: 'text',
    required: true,
    placeholder: 'The Ultimate Guide to Making Money Online',
  },
  {
    id: 'keepWords',
    label: 'Words to keep (optional)',
    type: 'text',
    required: false,
    placeholder: 'AI, SEO — comma-separated',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'cleanSlug',
    label: 'Clean slug',
    type: 'text',
    description:
    'Free url slug optimizer 2026: The shortened slug: stop words removed, words joined with hyphens. Get instant results. free now.',
  },
  {
    id: 'removedWords',
    label: 'Removed stop words',
    type: 'list',
    description:
    'Every stop word that was stripped, in order of appearance.',
  },
];

export const content: ToolContent = {
  title: 'URL Slug Optimizer',
  description:
    'Optimize your URL slugs free — stop words removed, words joined with hyphens for a cleaner slug, free. Optimize yours now!',
  howTo: [
    'Paste your post title or existing slug into "Title or slug".',
    'Optionally list words to protect in "Words to keep" — comma-separated, e.g. AI, SEO.',
    'Run the tool to strip the 173-word English stop-word list and join the rest with hyphens.',
    'Copy the clean slug and use it as your permalink; add a 301 redirect if you change a live URL.',
  ],
  methodology:
    'The input is lowercased and tokenized, then every token on the fixed 173-word English stop-word list is removed — except words you protected. The survivors are joined with hyphens. If every word is a stop word, the first word is kept so the slug is never empty. No AI and no stemming: the same input always returns the same slug.',
  examples: [
    {
      title: 'Blog post title',
      inputs: { titleOrSlug: 'The Ultimate Guide to Making Money Online' },
      note: 'Stop words removed, keywords joined with hyphens.',
    },
    {
      title: 'Protecting a brand term',
      inputs: { titleOrSlug: 'The Best of the Best', keepWords: 'the' },
      note: '"the" is kept even though it is a stop word.',
    },
  ],
  faqs: [
    {
      question: 'What is the best url slug optimizer?',
      answer:
        'The best slug optimizer shortens URLs by removing filler words while keeping meaning — this free tool does that with a fixed 173-word English stop-word list, plus a keep-words option for brand terms.',
    },
    {
      question: 'Is there a free url slug optimizer?',
      answer:
        'Yes — this tool is completely free with no signup. Paste any title or slug and copy the cleaned permalink it returns.',
    },
    {
      question: 'How to optimize url slug?',
      answer:
        'Remove stop words (the, and, of, to), keep it lowercase with hyphens, and stay under about 60 characters with your main keyword near the front. This tool applies the stop-word step automatically.',
    },
    {
      question: 'How does an url slug optimizer work?',
      answer:
        'It tokenizes your title, drops every word on a fixed English stop-word list (unless you protected it), and joins the remaining words with hyphens. The rules are fixed, so results are identical for the same input.',
    },
    {
      question: 'What is an url slug optimizer?',
      answer:
        'An url slug optimizer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Is this url slug optimizer tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
    {
      question: 'How do I use this url slug optimizer tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
  ],
  assumptions: [
    'English stop words only — other languages pass through unchanged.',
    'Changing a published post\u2019s slug changes its URL; add a 301 redirect from the old URL to avoid broken links.',
  ],
  jsonLd: [],
};
