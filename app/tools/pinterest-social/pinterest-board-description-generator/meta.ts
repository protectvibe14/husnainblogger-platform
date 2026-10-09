import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/pinterest-board-description-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'boardName',
    label: 'Board name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Cozy Fall Decor, Small Kitchen Ideas',
  },
  {
    id: 'keywords',
    label: 'Keywords (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. pantry organization, tiny kitchens',
  },
  {
    id: 'tone',
    label: 'Description tone',
    type: 'select',
    required: false,
    options: ['friendly', 'professional', 'seo'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'boardDescription',
    label: 'Board description',
    type: 'text',
    description: 'Free pinterest board description 2026: A natural, keyword-rich board description under 500 characters, built from fixed sentence. Fast, private, no signup -!',
  },
];

export const content: ToolContent = {
  title: 'Pinterest Board Description',
  description:
    'Write a keyword-rich Pinterest board description in seconds — enter your board name and keywords for a natural, under-500-character result. Try it free now!',
  howTo: [
    'Type your board name into the "Board name" field — it becomes the first sentence of the description.',
    'Add keywords in the "Keywords" field, separated by commas (e.g. pantry organization, tiny kitchens).',
    'Pick a tone: friendly, professional, or seo, then run the tool.',
    'Copy the result from "Board description" — it is always under 500 characters.',
    'Paste it into the board description field on Pinterest when you create or edit the board.',
  ],
  methodology:
    'This tool assembles descriptions from a fixed bank of 28 hand-written sentence templates (12 openers, 10 value lines, 6 closers) — no AI is involved. Your board name opens the first sentence, up to 6 keywords are woven into natural middle sentences, and sentences are dropped from the end if needed to stay under 500 characters. Keywords only ever appear inside sentences, never as a stuffed comma-separated list.',
  examples: [
    {
      title: 'SEO description for a decor board',
      inputs: { boardName: 'Cozy Fall Decor', keywords: 'pumpkin centerpieces, autumn mantels', tone: 'seo' },
      note: 'Returns a keyword-rich description opening with the board name, under 500 characters.',
    },
    {
      title: 'Friendly description with no keywords',
      inputs: { boardName: 'DIY Gifts', tone: 'friendly' },
      note: 'Returns a warm, generic description with no filler hashtags.',
    },
    {
      title: 'Professional description for a kitchen board',
      inputs: { boardName: 'Small Kitchen Ideas', keywords: 'pantry organization', tone: 'professional' },
      note: 'Returns a professional-toned description weaving in the supplied keyword.',
    },
  ],
  faqs: [
    {
      question: 'What is the best pinterest board description?',
      answer:
        'The best Pinterest board description opens with your board\'s main keyword and adds 2-3 natural sentences covering related keywords, staying under 500 characters. This free generator builds exactly that from your board name and keywords using fixed sentence templates.',
    },
    {
      question: 'Is there a free pinterest board description?',
      answer:
        'Yes — this Pinterest board description generator is completely free with no signup. Generate as many descriptions as you like, in friendly, professional, or SEO tones.',
    },
    {
      question: 'How to use pinterest board description?',
      answer:
        'Enter your board name, add optional keywords separated by commas, pick a tone, and run the tool. Copy the result and paste it into the description field when creating or editing a board on Pinterest. Only the first 6 keywords are used, so put your most important ones first.',
    },
    {
      question: 'How does a pinterest board description work?',
      answer:
        'It takes your board name and keywords, then fills fixed sentence templates from a 28-template bank — the board name opens the first sentence and keywords are woven into natural middle sentences. No AI is involved, and the result is always capped at 500 characters.',
    },
    {
      question: 'How does the pinterest board description work?',
      answer:
        'Enter your details using the inputs above and the pinterest board description calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the pinterest board description free to use?',
      answer:
        'Yes - this pinterest board description is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a pinterest board description?',
      answer:
        'A pinterest board description is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Descriptions come from a fixed bank of 28 sentence templates — phrasing variety is limited by design, not AI-written.',
    'Only the first 6 keywords are woven in; extra keywords are ignored to protect the 500-character budget.',
    'Board names over 200 characters are rejected because they cannot fit a useful description under 500 characters.',
    'Non-Latin board names and keywords are inserted as-is; the tool never transliterates them.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Pinterest Board Description 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free pinterest board description 2026: A natural, keyword-rich board description under 500 characters, built from fixed sentence. Fast, private, no signup -!',
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
          name: 'Pinterest Board Description Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
