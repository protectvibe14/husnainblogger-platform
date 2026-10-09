import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/x-post-formatter/';

export const inputs: ToolInput[] = [
  {
    id: 'text',
    label: 'Post text',
    type: 'textarea',
    required: true,
    placeholder: 'Paste your X post draft here…',
    validation: { max: 10000 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'formattedText',
    label: 'Formatted text',
    type: 'copy',
    description:
    'Free twitter bold text generator 2026: Your text with trailing spaces trimmed, extra spaces collapsed, and blank lines cleaned up. Fast, private -.',
  },
  {
    id: 'boldText',
    label: 'Bold version',
    type: 'copy',
    description:
    'The formatted text in bold Unicode characters, ready to paste into an X post.',
  },
  {
    id: 'weightedCount',
    label: 'Weighted character count',
    type: 'number',
    description:
    'Character count using conservative X-style weighting: URLs count 23, non-ASCII characters count 2.',
  },
  {
    id: 'remaining',
    label: 'Characters remaining',
    type: 'number',
    description:
    'How many weighted characters you have left before the 280 budget (0 when over).',
  },
  {
    id: 'overBy',
    label: 'Over budget by',
    type: 'number',
    description:
    'How many weighted characters over 280 the text is (0 when it fits). Over-budget text is flagged, never cut.',
  },
  {
    id: 'changeNote',
    label: 'What changed',
    type: 'text',
    description:
    'Exactly what the formatter cleaned up — or "no changes needed" if the text was already clean.',
  },
];

export const content: ToolContent = {
  title: 'Twitter Bold Text Generator',
  description:
    'Clean up messy X posts in one click: fix spacing and broken line breaks, check your 280-character budget, and get a bold-text version instantly.',
  howTo: [
    'Paste your X post draft into the "Post text" field.',
    'Run the tool to clean it: trailing spaces trimmed, extra spaces collapsed, messy blank lines fixed.',
    'Check the budget meter — "Weighted character count", "Characters remaining", and "Over budget by" — before posting.',
    'Copy the "Bold version" if you want bold-style Unicode text in your post.',
    'Paste the formatted text into X. If it is over budget, trim it yourself — the tool flags it but never cuts your words.',
  ],
  methodology:
    'This tool applies pure deterministic transforms: per-line trailing-whitespace trim, tab-to-space conversion, collapsing 2+ spaces to one, collapsing 3+ blank lines into one, and stripping leading/trailing blank lines. The budget meter uses a conservative weighted count (URLs count 23, non-ASCII characters count 2, everything else counts 1) against a 280 budget. The bold version maps A–Z, a–z, and 0–9 to mathematical alphanumeric symbols. No AI is involved and no platform endorsement is claimed.',
  examples: [
    {
      title: 'Clean a messy draft',
      inputs: { text: 'Big announcement   \n\n\n\nWe just launched.  \nCheck it out!' },
      note: 'Returns cleaned text with single spacing, one blank line, a budget meter, and a bold Unicode version.',
    },
    {
      title: 'Check a post with a link',
      inputs: { text: 'New guide is live: https://example.com/my-very-long-article-url check it out' },
      note: 'Shows the weighted count with the URL counted as 23, plus how many characters remain.',
    },
  ],
  faqs: [
    {
      question: 'What is the best twitter bold text generator?',
      answer:
        'The best twitter bold text generator also checks whether the result fits: bold Unicode characters can push a post over the limit. This free tool gives you both — a bold Unicode version of your text and a weighted character budget meter (URLs count 23, non-ASCII counts 2) so you know it posts cleanly.',
    },
    {
      question: 'Is there a free twitter bold text generator?',
      answer:
        'Yes — this formatter and bold text generator is completely free with no signup. Paste any text and get a cleaned version, a bold Unicode version, and a full character-budget breakdown, as many times as you like.',
    },
    {
      question: 'How to generate twitter bold text ideas?',
      answer:
        'Paste your text and run the tool — the "Bold version" output converts your letters and digits to bold Unicode characters that X renders as bold text. Copy it straight into your post. If the budget meter shows "Over budget by", trim the text first.',
    },
    {
      question: 'How does a twitter bold text generator work?',
      answer:
        'It maps regular A–Z, a–z, and 0–9 characters to their bold counterparts in the Unicode mathematical alphanumeric symbols block — X and most apps render those as bold. This tool does that conversion deterministically, with no fonts installed and no AI involved.',
    },
    {
      question: 'How does the twitter bold text generator work?',
      answer:
        'Enter your details using the inputs above and the twitter bold text generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the twitter bold text generator free to use?',
      answer:
        'Yes - this twitter bold text generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a twitter bold text generator?',
      answer:
        'A twitter bold text generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The 280 weighted-character budget is a conservative approximation (URLs count 23, non-ASCII characters count 2) — always confirm in X before posting.',
    'Bold text uses Unicode mathematical alphanumeric symbols, not a font setting — a few older devices or screen readers may render them differently.',
    'Over-budget text is flagged with an exact "over by" number and never cut; trimming stays your decision.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Twitter Bold Text Generator 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free twitter bold text generator 2026: Your text with trailing spaces trimmed, extra spaces collapsed, and blank lines cleaned up. Fast, private -.',
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
          name: 'X Post Formatter',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
