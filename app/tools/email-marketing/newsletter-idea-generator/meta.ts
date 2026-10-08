import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Newsletter niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. houseplant care',
    validation: { max: 100 },
  },
  {
    id: 'audience',
    label: 'Target audience',
    type: 'text',
    required: true,
    placeholder: 'e.g. beginner plant parents',
    validation: { max: 100 },
  },
  {
    id: 'frequency',
    label: 'Publishing frequency',
    type: 'select',
    required: false,
    options: ['weekly', 'biweekly', 'monthly'],
  },
  {
    id: 'count',
    label: 'Number of ideas',
    type: 'number',
    required: false,
    placeholder: '1–20 (default: 10)',
    validation: { min: 1, max: 20 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'ideas', label: 'Newsletter ideas', type: 'table' },
  { id: 'notices', label: 'Notes', type: 'text' },
];

export const content: ToolContent = {
  title: 'Newsletter Ideas Generator 2026 – Free | HusnainBlogger',
  description:
    'Free newsletter ideas generator 2026: Never run out of newsletter topics: enter your niche and audience to get up to 20. Fast, private, no signup - try it now!',
  howTo: [
    'Enter your newsletter niche in a few words.',
    'Describe your target audience.',
    'Choose your publishing frequency: weekly, biweekly, or monthly.',
    'Pick how many ideas you want (1–20; 10 is the default).',
    'Use each idea’s title, angle, and “why it works” note to plan your next issues.',
  ],
  methodology:
    'This tool matches your niche against 24 fixed title patterns, then rotates through 12 content-angle patterns and 12 “why it works” explanations from a fixed library. A deterministic hash of your inputs picks the starting offset, so identical inputs always produce the identical list, and titles never repeat within a run (24 patterns ≥ the 20-idea maximum). The frequency you choose is recorded for planning; the patterns are cadence-agnostic. It runs no AI model.',
  examples: [
    {
      title: 'Houseplant newsletter',
      inputs: {
        niche: 'houseplant care',
        audience: 'beginner plant parents',
        frequency: 'weekly',
        count: 10,
      },
      note: 'Ten weekly issue ideas for a houseplant newsletter.',
    },
    {
      title: 'Freelance finance',
      inputs: {
        niche: 'money management for freelancers',
        audience: 'self-employed creatives',
        frequency: 'monthly',
        count: 5,
      },
      note: 'Five monthly deep-dive ideas for a freelance finance newsletter.',
    },
  ],
  faqs: [
    {
      question: 'What is the best newsletter ideas generator?',
      answer:
        'The best newsletter ideas match proven formats — tutorials, case studies, myth-busting, Q&As — to your specific niche. This free generator does exactly that from a fixed pattern library; you bring the expertise that fills each idea in.',
    },
    {
      question: 'Is there a free newsletter ideas generator?',
      answer:
        'Yes — this generator is completely free with no signup. It assembles ideas from fixed title, angle, and reasoning patterns, not AI, so every suggestion is transparent and repeatable.',
    },
    {
      question: 'How to generate newsletter?',
      answer:
        'Enter your niche and audience, choose a publishing frequency, and pick how many ideas you want (up to 20). The tool returns a table of issue titles, each with a suggested angle and why that format works.',
    },
    {
      question: 'How does a newsletter ideas generator work?',
      answer:
        'It combines your niche with 24 fixed title patterns and pairs each with a content angle and a plain-language explanation of why the format engages readers. Selection is deterministic: the same inputs always produce the same ideas.',
    },
    {
      question: 'How does the newsletter ideas generator work?',
      answer:
        'Enter your details using the inputs above and the newsletter ideas generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the newsletter ideas generator free to use?',
      answer:
        'Yes - this newsletter ideas generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a newsletter ideas generator?',
      answer:
        'A newsletter ideas generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Ideas come from a fixed pattern library (24 titles, 12 angles, 12 explanations) — not AI — so treat them as starting points, not finished issues.',
    'The frequency setting is planning context only; patterns are cadence-agnostic.',
    '“Why it works” notes describe general format strengths, not measured performance data.',
    'This tool cannot predict open rates or subscriber growth.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Newsletter Ideas Generator 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/email-marketing/newsletter-idea-generator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free newsletter ideas generator 2026: Never run out of newsletter topics: enter your niche and audience to get up to 20. Fast, private, no signup - try it now!',
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
          name: 'Newsletter Ideas Generator',
          item: 'https://husnainblogger.com/tools/email-marketing/newsletter-idea-generator/',
        },
      ],
    },
  ],
};
