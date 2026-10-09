import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/description-template-builder/';

const DESCRIPTION =
  'Build better video descriptions with this YouTube description template — hook line, chapters, links, CTA, hashtags, and FTC disclosure included.';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'topic',
    label: 'Video topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. budget travel tips',
  },
  {
    id: 'keywords',
    label: 'Keywords (comma-separated)',
    type: 'text',
    placeholder: 'e.g. budget travel, cheap flights, travel hacks',
  },
  {
    id: 'links',
    label: 'Links (one per line)',
    type: 'text',
    placeholder: 'https://example.com/guide',
  },
  {
    id: 'affiliateLinks',
    label: 'Affiliate links (one per line, optional)',
    type: 'text',
    placeholder: 'If present, a mandatory FTC disclosure is added',
  },
  {
    id: 'chapters',
    label: 'Chapters (one per line, optional)',
    type: 'text',
    placeholder: '0:00 Intro (first must be 0:00, min 3 chapters, 10s+ gaps)',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'descriptions', label: 'Assembled descriptions', type: 'list' },
  { id: 'aboveFold', label: 'Above-the-fold previews (first 150 chars)', type: 'list' },
  { id: 'charCounts', label: 'Character counts', type: 'list' },
  { id: 'warnings', label: 'Warnings (chapters, hashtags)', type: 'list' },
  { id: 'count', label: 'Descriptions built', type: 'number' },
];

export const content: ToolContent = {
  title: 'YouTube Description Template',
  description: DESCRIPTION,
  howTo: [
    'Add one item per video and enter the video topic (required) plus your keywords, comma-separated.',
    'Paste your links one per line — every link must start with http:// or https://.',
    'If you use affiliate links, add them separately: the builder appends a mandatory FTC disclosure block.',
    'Optionally add chapters one per line ("0:00 Intro") — they are included only if the first is 0:00, there are at least 3, and gaps are 10 seconds or more.',
    'Run the builder, check the character count (must stay under 5000) and any hashtag warnings, then paste the description into YouTube Studio.',
  ],
  methodology:
    'Pure text assembly from your fields — no AI, no generation. Sections are fixed: a hook + keywords headline, an optional validated chapters block, links, an FTC disclosure (only when affiliate links are present), a subscribe CTA, and hashtags derived from your keywords. Chapter lines must parse as mm:ss or hh:mm:ss; invalid chapter sets are omitted with a warning. Hashtag counts above 15 trigger a warning because YouTube ignores all hashtags past 15. Anything over 5000 characters is rejected.',
  faqs: [
    {
      question: 'How to write a good youtube description?',
      answer: 'This is a common question about how to write a good youtube description. Use the tool above to get your answer instantly - it is free and requires no signup.',
    },
    {
      question: 'What is the best YouTube description template?',
      answer:
        'The best description opens with a keyword-rich hook line (the first 150 characters show above the fold), then chapters, links, a clear CTA, and a few relevant hashtags. This free builder assembles exactly that structure per video — you paste the result into YouTube Studio yourself.',
    },
    {
      question: 'Is there a free YouTube description template?',
      answer:
        'Yes — this description builder is completely free with no signup. Build as many descriptions as you need; each one enforces the 5000-character limit, validates chapters, warns on hashtag overuse, and adds an FTC disclosure when you include affiliate links.',
    },
    {
      question: 'How to use a YouTube description?',
      answer:
        'Put your main keywords in the first 1–2 sentences (viewers see ~150 characters before "show more"), add chapters so viewers can jump around, list your links, and close with a subscribe CTA. Use this builder to assemble that layout consistently, then paste it into the description box in YouTube Studio.',
    },
    {
      question: 'How does a YouTube description template work?',
      answer:
        'It is fixed text assembly: your topic, keywords, links, and chapters are slotted into a proven section order — hook line, chapters, links, disclosure, CTA, hashtags. No AI writes anything; the builder validates length, chapters, and URLs and warns you about anything YouTube would ignore.',
    },
    {
      question: 'What should I put in a YouTube description?',
      answer:
        'Start with your keywords in the first 150 characters, then add chapters, your links, and a subscribe CTA, finishing with hashtags built from your keywords. If you list affiliate links, the builder automatically appends a mandatory FTC disclosure block to keep you compliant.',
    },
    {
      question: 'How many hashtags can I use in a YouTube description?',
      answer:
        'YouTube ignores ALL hashtags in a description when it lists more than 15. This builder warns you as soon as your hashtags cross 15 — the edit is left to you, but fewer, more relevant hashtags always perform better.',
    },
    {
      question: 'How do I add chapters to my YouTube description?',
      answer:
        'List them one per line like "0:00 Intro" — the first chapter must start at 0:00, you need at least 3 chapters, and each gap must be 10 seconds or more. The builder validates every chapter set and omits invalid ones with a warning.',
    },
  ],
  assumptions: [
    'Text assembly only: nothing is published to YouTube — you paste the output into YouTube Studio manually.',
    'Chapter rules enforced: first chapter 0:00, minimum 3 chapters, 10-second minimum gaps; invalid sets are omitted with a warning.',
    'YouTube ignores ALL hashtags when a description lists more than 15 — the tool warns but leaves the edit to you.',
    'Descriptions over 5000 characters are rejected; the FTC disclosure appears only when affiliate links are provided.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'YouTube Description Template 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: DESCRIPTION,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'YouTube Tools',
          item: 'https://husnainblogger.com/tools/youtube/',
        },
        { '@type': 'ListItem', position: 4, name: 'Description Template Builder', item: TOOL_URL },
      ],
    },
  ],
};
