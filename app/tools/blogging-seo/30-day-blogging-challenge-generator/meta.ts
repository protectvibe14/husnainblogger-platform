import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. home baking',
    validation: { min: 2, max: 80 },
  },
  {
    id: 'startDate',
    label: 'Start date (optional)',
    type: 'date',
    required: false,
    placeholder: 'Defaults to today',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'challenge',
    label: '30-day challenge',
    type: 'table',
    description: 'Free 30 day blog challenge 2026: Day-by-day plan: date, task and focus label for all 30 days. Instant, private, and mobile-friendly. No signup - try it free!',
  },
  {
    id: 'checklistMarkdown',
    label: 'Checklist',
    type: 'copy',
    description: 'The 30-day challenge as a Markdown checklist with tick boxes.',
  },
];

export const content: ToolContent = {
  title: '30 Day Blog Challenge 2026 – Free Tool | HusnainBlogger',
  description:
    'Take the 30 day blog challenge: one daily blogging task for 30 days, dated from your start date, with a tick-off checklist. Free — start your challenge today!',
  howTo: [
    'Type your niche into the Niche field (2-80 characters).',
    'Optionally pick a start date — it defaults to today.',
    'Click Generate to build your 30-day challenge from the fixed daily prompt bank.',
    'Review the day-by-day tasks with their focus labels (writing, SEO, promotion...).',
    'Copy the Markdown checklist into your notes app and tick off each day.',
  ],
  methodology:
    'The generator walks a fixed bank of exactly 30 daily prompts — day N always gets bank entry N, in order, with no randomness and no AI. Each day gets a date (UTC) counted from your start date, a day name, the niche-filled task and a focus label (Setup, Writing, SEO, Promotion, Engagement, Growth, Planning, Review). Output is a day-by-day table plus a Markdown checklist. Nothing is fetched from the web.',
  examples: [
    {
      title: 'Baking blog challenge',
      inputs: { niche: 'home baking', startDate: '2026-10-01' },
      note: 'Produces 30 dated daily tasks, e.g. day 3: a "7 things I wish I knew about home baking" listicle.',
    },
    {
      title: 'Starting today',
      inputs: { niche: 'personal finance' },
      note: 'Omits the start date — day 1 lands on today (UTC).',
    },
    {
      title: 'Niche business blog',
      inputs: { niche: 'urban gardening', startDate: '2026-11-01' },
      note: 'Produces 30 dated tasks mixing writing, SEO, promotion and review days.',
    },
  ],
  faqs: [
    {
      question: 'What is the best 30 day blog challenge?',
      answer:
        'The best challenge is the one you finish — consistency beats any specific prompt list. This free generator gives you 30 fixed daily prompts mixing writing, SEO, promotion and review days, plus a tick-off checklist. No signup, no AI, no hidden upsell.',
    },
    {
      question: 'Is there a free 30 day blog challenge?',
      answer:
        'Yes — this generator is completely free with no signup. Enter your niche and get 30 dated daily blogging tasks with a Markdown checklist. It does not track your progress; copy the checklist into your notes app to tick days off.',
    },
    {
      question: 'How to use 30 day blog?',
      answer:
        'Do one task per day for 30 days: writing days build your archive, SEO days improve old posts, promotion days get readers. Generate your dated plan above, then work through the checklist one checkbox at a time.',
    },
    {
      question: 'How does a 30 day blog challenge work?',
      answer:
        'This generator assigns you one fixed daily blogging prompt for 30 days — from setup and writing tasks to SEO, promotion and review days — dated from your chosen start date. It is a fixed prompt bank, not AI coaching, so the same inputs always give the same plan.',
    },
    {
      question: 'How does the 30 day blog challenge work?',
      answer:
        'Enter your details using the inputs above and the 30 day blog challenge calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the 30 day blog challenge free to use?',
      answer:
        'Yes - this 30 day blog challenge is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a 30 day blog challenge?',
      answer:
        'A 30 day blog challenge is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Daily tasks come from a fixed bank of 30 prompts — generic blogging prompts, not personalized coaching.',
    'The checklist is a Markdown document; this tool tracks nothing — copy it into your notes app to tick days off.',
    'Without a start date the challenge begins today (UTC); dates are computed in UTC.',
    'Start dates must be real calendar dates in YYYY-MM-DD form.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: '30 Day Blog Challenge 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/blogging-seo/30-day-blogging-challenge-generator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free 30 day blog challenge 2026: Day-by-day plan: date, task and focus label for all 30 days. Instant, private, and mobile-friendly. No signup - try it free!',
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
          name: 'Blogging & SEO Tools',
          item: 'https://husnainblogger.com/tools/blogging-seo/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: '30-Day Blogging Challenge Generator',
          item: 'https://husnainblogger.com/tools/blogging-seo/30-day-blogging-challenge-generator/',
        },
      ],
    },
  ],
};
