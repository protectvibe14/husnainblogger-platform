import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/x-banner-text-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'tagline',
    label: 'Your tagline',
    type: 'text',
    required: true,
    placeholder: 'e.g. I help founders get customers',
    validation: { min: 2, max: 200 },
  },
  {
    id: 'offer',
    label: 'Your offer (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. Free growth audit',
    validation: { max: 200 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'bannerCopy',
    label: 'Banner copy options',
    type: 'list',
    description: 'Free twitter banner text ideas 2026: Short banner text options, each kept to 60 characters or fewer. Get instant results. No signup - try it free now!',
  },
  {
    id: 'safeZoneNote',
    label: 'Safe-zone guidance',
    type: 'text',
    description: 'Where to place text on the 1500×500 banner so the avatar never covers it.',
  },
];

export const content: ToolContent = {
  title: 'Twitter Banner Text Ideas 2026 – Free Tool | HusnainBlogger',
  description:
    'Get twitter banner text ideas fast: turn your tagline and offer into short, high-contrast banner lines under 60 characters. Create yours free now!',
  howTo: [
    'Type your main line in the "Your tagline" field (e.g. "I help founders get customers").',
    'Optionally add your "Your offer" (e.g. "Free growth audit") for offer-based layouts.',
    'Click Generate to get banner copy options from 6 fixed layout templates.',
    'Pick your favorite line from the "Banner copy options" list — every line is 60 characters or fewer.',
    'Read the "Safe-zone guidance" and keep your text center-right on the 1500×500 banner.',
    'Paste the chosen line into your design tool (e.g. Canva) — this tool writes copy, not images.',
  ],
  methodology:
    'The generator combines your tagline and offer through 6 fixed layout frames (tagline-only, tagline + offer, offer + tagline, tagline + CTA, offer + CTA, CTA + tagline) with 6 fixed CTA one-liners picked deterministically from your text. Every line is trimmed at a word boundary to 60 characters for banner legibility. Layouts needing an offer are skipped when you leave it blank. No AI — fixed templates and a documented word bank.',
  examples: [
    {
      title: 'Founder with tagline and offer',
      inputs: { tagline: 'I help founders get customers', offer: 'Free growth audit' },
      note: 'Gets 6 options, e.g. "I help founders get customers — Free growth audit" and CTA variants.',
    },
    {
      title: 'Creator with tagline only',
      inputs: { tagline: 'Design tips daily' },
      note: 'Gets 3 options (offer layouts skipped), each 60 characters or fewer.',
    },
  ],
  faqs: [
    {
      question: 'What is the best twitter banner text ideas?',
      answer:
        'The best banner text is short, high-contrast, and states your value in one line — ideally under 60 characters so it stays legible at 1500×500. This free generator gives you 6 layout options from your tagline and offer, plus safe-zone guidance so the avatar never covers your words.',
    },
    {
      question: 'Is there a free twitter banner text ideas?',
      answer:
        'Yes — this generator is completely free with no signup. Enter your tagline (and optionally an offer) to get short banner copy options, each capped at 60 characters, with guidance on where to place text on the banner.',
    },
    {
      question: 'How to use twitter banner text?',
      answer:
        'Put one short promise or tagline on your X banner so profile visitors instantly know what you do. Enter your tagline and offer above, pick a generated line, and place it center-right on a 1500×500 design in your design tool — the avatar overlaps the bottom-left, so avoid that corner.',
    },
    {
      question: 'How does a twitter banner text ideas work?',
      answer:
        'The tool runs your tagline and offer through 6 fixed layout frames with a bank of 6 CTA one-liners, trimming every line at a word boundary to 60 characters. It outputs text copy only — no images — and adds a fixed safe-zone note based on X\'s banner layout.',
    },
    {
      question: 'How does the twitter banner text ideas work?',
      answer:
        'Enter your details using the inputs above and the twitter banner text ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the twitter banner text ideas free to use?',
      answer:
        'Yes - this twitter banner text ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a twitter banner text ideas?',
      answer:
        'A twitter banner text ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'This tool produces TEXT COPY only — it does not create or edit images; pair the copy with a designer or canvas tool.',
    'The 60-character cap is a legibility guideline for 1500×500 banners, not an official X rule.',
    'Safe-zone guidance is static and based on X\'s documented banner/avatar layout; X may change its design over time.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Twitter Banner Text Ideas 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free twitter banner text ideas 2026: Short banner text options, each kept to 60 characters or fewer. Get instant results. No signup - try it free now!',
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
          name: 'Pinterest, X & Facebook',
          item: 'https://husnainblogger.com/tools/pinterest-social/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'X Banner Text Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
