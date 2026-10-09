import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Video topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. sourdough bread, budget travel, desk setup',
    validation: { max: 200 },
  },
  {
    id: 'titleStyle',
    label: 'Title style',
    type: 'select',
    required: true,
    options: ['how-to', 'listicle', 'question', 'curiosity-gap', 'bold-claim', 'comparison'],
  },
  {
    id: 'thumbStyle',
    label: 'Thumbnail text style',
    type: 'select',
    required: true,
    options: ['big-number', 'short-promise', 'contrast-pair', 'reaction', 'question-tease'],
  },
  {
    id: 'count',
    label: 'Number of combos',
    type: 'number',
    required: true,
    placeholder: '1–6',
    validation: { min: 1, max: 6 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'combos', label: 'Title + thumbnail-text combos', type: 'list' },
  { id: 'mockPreview', label: 'Text-only mock preview', type: 'text' },
  { id: 'honestyNote', label: 'What this preview is', type: 'text' },
];

const DESCRIPTION =
  'Use this free YouTube packaging tester to combine title and thumbnail-text styles into clickable combos with text-only previews. Build combos now!';

export const content: ToolContent = {
  title: 'YouTube Packaging Tester',
  description: DESCRIPTION,
  howTo: [
    'Enter your video topic in the Topic field (keep it under 200 characters).',
    'Choose a Title style (how-to, listicle, question, curiosity gap, bold claim, or comparison).',
    'Choose a Thumbnail text style (big number, short promise, contrast pair, reaction, or question tease).',
    'Set the number of combos (1–6) and run the tool.',
    'Compare the combos side by side in the text-only mock previews, then build your favorite in your editor and A/B test it with YouTube Test & Compare.',
  ],
  methodology:
    'The tool assembles combos from fixed template banks: 6 title styles × 3 templates each (18 total) and 5 thumbnail-text styles × 4 templates each (20 total, every one ≤5 words by construction). Title template i pairs with thumbnail template (i mod 4) in deterministic bank order, cycling when the count exceeds the bank. Assembled titles over 100 characters are trimmed and flagged. No AI is involved and no images are generated — the preview is an ASCII layout mock labeled as text-only.',
  examples: [
    {
      title: 'How-to packaging',
      inputs: { topic: 'sourdough bread', titleStyle: 'how-to', thumbStyle: 'big-number', count: 3 },
      note: 'Three how-to titles paired with big-number thumbnail text, shown as text mockups.',
    },
    {
      title: 'Curiosity packaging',
      inputs: { topic: 'budget travel', titleStyle: 'curiosity-gap', thumbStyle: 'contrast-pair', count: 2 },
      note: 'Two curiosity-gap titles paired with before/after-style contrast text.',
    },
  ],
  faqs: [
    {
      question: 'what is the best youtube packaging tester?',
      answer:
        'The most reliable test is YouTube\'s own Test & Compare, which shows real variants to real viewers. This free tester helps you brainstorm: it assembles title + thumbnail-text combos from fixed templates and shows them as text-only mockups so you can shortlist before designing.',
    },
    {
      question: 'is there a free youtube packaging tester?',
      answer:
        'Yes — this packaging tester is free with no signup. It generates up to 6 title + thumbnail-text combos per run with text-only mock previews. It does not create images; design the final thumbnail in your editor.',
    },
    {
      question: 'how to test youtube packaging?',
      answer:
        'Draft several title + thumbnail-text combos with this tester, pick the strongest 2–3, design real thumbnails for them, then run YouTube\'s Test & Compare to see which packaging gets more clicks. Packaging is the title and thumbnail working together — never test one without the other.',
    },
    {
      question: 'how does a youtube packaging tester work?',
      answer:
        'This one combines fixed template banks — 18 title templates across 6 styles and 20 thumbnail-text templates across 5 styles — pairing them deterministically into combos shown as text-only layout mockups. Titles stay within 100 characters and thumbnail text within 5 words. It never generates images.',
    },
    {
      question: 'How does the youtube packaging tester work?',
      answer:
        'Enter your details using the inputs above and the youtube packaging tester calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube packaging tester free to use?',
      answer:
        'Yes - this youtube packaging tester is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube packaging tester?',
      answer:
        'A youtube packaging tester is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Template banks are fixed (18 title templates, 20 thumbnail-text templates) — variety comes from cycling the banks, not from AI.',
    'Previews are ASCII text mockups, not rendered thumbnails. Design your real thumbnail in an editor.',
    'This tool brainstorms packaging; only YouTube Test & Compare measures real click performance.',
    'Titles are trimmed to 100 characters max and thumbnail text is capped at 5 words per YouTube best practice.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'YouTube Packaging Tester 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/youtube/packaging-combo-preview/',
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
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Packaging Combo Preview',
          item: 'https://husnainblogger.com/tools/youtube/packaging-combo-preview/',
        },
      ],
    },
  ],
};
