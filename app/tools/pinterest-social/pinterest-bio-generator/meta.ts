import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/pinterest-bio-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'profileFocus',
    label: 'Profile focus',
    type: 'text',
    required: true,
    placeholder: 'e.g. easy weeknight dinners, budget travel tips',
  },
  {
    id: 'keywords',
    label: 'Keywords (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. meal prep, 30-minute meals',
  },
  {
    id: 'cta',
    label: 'Call to action (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. Follow for new recipes',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'bioVariants',
    label: 'Bio ideas',
    type: 'list',
    description: 'Free pinterest bio ideas 2026: Short bio options, each capped at 160 characters, with your keywords and CTA woven in. Fast, private, no signup - try it now!',
  },
];

export const content: ToolContent = {
  title: 'Pinterest Bio Ideas 2026 – Free Tool | HusnainBlogger',
  description:
    'Create Pinterest bio ideas that fit the 160-character limit — enter your focus and keywords for short, searchable bio variants with your CTA. Try it free now!',
  howTo: [
    'Describe your profile focus in the "Profile focus" field (e.g. easy weeknight dinners).',
    'Add optional keywords in the "Keywords" field, separated by commas.',
    'Add an optional call to action in the "Call to action" field (kept under 60 characters).',
    'Run the tool and pick your favorite from the 4 "Bio ideas" — each fits the 160-character limit.',
    'Paste it into the About You section of your Pinterest profile settings.',
  ],
  methodology:
    'This tool assembles bios from 4 fixed hand-written bio patterns (tagline, sentence, list, CTA-led) with your focus, keywords, and CTA inserted — no AI is involved. Keywords are placed first in every pattern so that trimming to the 160-character cap cuts from the end and never removes a supplied keyword. With no keywords, you get plain bios with no filler hashtags.',
  examples: [
    {
      title: 'Bio ideas for a dinner profile',
      inputs: { profileFocus: 'easy weeknight dinners', keywords: 'meal prep, 30-minute meals', cta: 'Follow for new recipes' },
      note: 'Returns 4 bio variants weaving in both keywords and the CTA, each under 160 characters.',
    },
    {
      title: 'Bio ideas with no keywords',
      inputs: { profileFocus: 'home workouts' },
      note: 'Returns 4 plain bio variants with no filler hashtags.',
    },
    {
      title: 'Bio ideas for a travel profile',
      inputs: { profileFocus: 'budget travel tips', keywords: 'cheap flights', cta: 'Save this profile' },
      note: 'Returns 4 short bios built around the keyword and CTA.',
    },
  ],
  faqs: [
    {
      question: 'What is the best pinterest bio ideas?',
      answer:
        'The best Pinterest bios say what you share, include 1-2 searchable keywords, and end with a short call to action — all within 160 characters. This free generator gives you 4 bio variants built from your focus, keywords, and CTA.',
    },
    {
      question: 'Is there a free pinterest bio ideas?',
      answer:
        'Yes — this Pinterest bio generator is completely free with no signup. Generate 4 bio variants per run, as many times as you like.',
    },
    {
      question: 'How to use pinterest bio?',
      answer:
        'Enter your profile focus, add optional keywords and a short call to action, then run the tool. Copy your favorite bio and paste it into the About You field in your Pinterest profile settings.',
    },
    {
      question: 'How does a pinterest bio ideas work?',
      answer:
        'It takes your focus, keywords, and CTA, then fills 4 fixed hand-written bio patterns — keywords go first so trimming to 160 characters never cuts them. No AI is involved; the output is template assembly with your words inserted.',
    },
    {
      question: 'How does the pinterest bio ideas work?',
      answer:
        'Enter your details using the inputs above and the pinterest bio ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the pinterest bio ideas free to use?',
      answer:
        'Yes - this pinterest bio ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a pinterest bio ideas?',
      answer:
        'A pinterest bio ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Bios come from 4 fixed patterns — variety is limited by design, not AI-written.',
    'Focus text over 160 characters is rejected rather than silently compressed.',
    'CTAs over 60 characters are rejected so they fit inside the 160-character budget.',
    'Only the first 3 keywords are used; extra keywords are ignored.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Pinterest Bio Ideas 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free pinterest bio ideas 2026: Short bio options, each capped at 160 characters, with your keywords and CTA woven in. Fast, private, no signup - try it now!',
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
          name: 'Pinterest Bio Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
