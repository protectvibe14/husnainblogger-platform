import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/pinterest-fresh-pin-checklist/';

export const inputs: ToolInput[] = [
  {
    id: 'pinType',
    label: 'Pin type',
    type: 'select',
    required: false,
    options: ['standard', 'idea', 'video'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'checklist',
    label: 'Your fresh-pin checklist',
    type: 'table',
    description: 'Free pinterest fresh pins 2026: Checklist items specific to the selected pin type, each with why it matters. Fast, private, no signup - try it now!',
  },
  {
    id: 'itemCount',
    label: 'Items',
    type: 'number',
    description: 'How many checklist items were returned for this pin type.',
  },
  {
    id: 'pinTypeUsed',
    label: 'Pin type used',
    type: 'text',
    description: 'Which pin type the checklist was built for.',
  },
  {
    id: 'disclaimer',
    label: 'Honest note',
    type: 'text',
    description: 'What this checklist can and cannot promise about Pinterest distribution.',
  },
];

export const content: ToolContent = {
  title: 'Pinterest Fresh Pins Checklist 2026 – Free | HusnainBlogger',
  description:
    'Build a free pinterest fresh pins checklist for standard, idea, or video pins. Get best-practice checks for new images, titles, and keywords. Try it now!',
  howTo: [
    'Pick your "Pin type": standard, idea, or video. Leave it blank to default to standard.',
    'Run the tool to get your checklist — each item comes with a "Why it matters" explanation.',
    'Work through the items before publishing: new image, unique title and description, correct ratio, keyword coverage.',
    'Read the "Honest note" at the bottom so you know exactly what the checklist does and does not promise.',
  ],
  methodology:
    'This tool assembles a static checklist from a curated bank of 24 hand-written best-practice items (8 each for standard, idea, and video pins) — no AI is involved. Items cover a new image per URL, unique titles and descriptions, correct ratios, and keyword coverage. "Freshness" here means creator best practice only: the tool does not know or claim Pinterest\'s internal freshness detection signals, and following the checklist does not guarantee a distribution boost.',
  examples: [
    {
      title: 'Standard pin checklist',
      inputs: { pinType: 'standard' },
      note: 'Returns 8 checks including a brand-new image, unique title/description, and 2:3 ratio.',
    },
    {
      title: 'Idea pin checklist',
      inputs: { pinType: 'idea' },
      note: 'Returns 8 idea-pin-specific checks including new story pages and a 9:16 cover.',
    },
    {
      title: 'Default (no pin type)',
      inputs: {},
      note: 'Defaults to the standard-pin checklist.',
    },
  ],
  faqs: [
    {
      question: 'What is the best pinterest fresh pins?',
      answer:
        'The best pinterest fresh pins approach is simple: publish genuinely new creative for each URL — a new image, a unique title and description, and the right ratio — instead of re-uploading the same pin. This free checklist walks you through those best-practice checks for standard, idea, and video pins.',
    },
    {
      question: 'Is there a free pinterest fresh pins?',
      answer:
        'Yes — this pinterest fresh pins checklist is completely free with no signup. Pick your pin type and get 8 targeted checks with explanations, as many times as you like.',
    },
    {
      question: 'How to use pinterest fresh pins?',
      answer:
        'Select your pin type (standard, idea, or video) and run the tool. Work through each checklist item — new image, unique title and description, keyword coverage — before you publish the pin.',
    },
    {
      question: 'Does this checklist guarantee my pins get more distribution?',
      answer:
        'No, and any tool that promises that is misleading you. This checklist reflects creator best practice for making pins that look and read as new; it does not describe Pinterest\'s internal freshness detection, and only Pinterest\'s systems decide how a pin is distributed.',
    },
    {
      question: 'How does the pinterest fresh pins work?',
      answer:
        'Enter your details using the inputs above and the pinterest fresh pins calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the pinterest fresh pins free to use?',
      answer:
        'Yes - this pinterest fresh pins is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a pinterest fresh pins?',
      answer:
        'A pinterest fresh pins is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The checklist comes from a fixed bank of 24 hand-written items — it assembles text; it does not analyze your pins or account.',
    '"Freshness" is framed as creator best practice, not Pinterest\'s internal detection logic, which is not public.',
    'Following the checklist does not guarantee a distribution boost — the disclaimer returned with every run says this explicitly.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Pinterest Fresh Pins Checklist 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free pinterest fresh pins 2026: Checklist items specific to the selected pin type, each with why it matters. Fast, private, no signup - try it now!',
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
          name: 'Pinterest Fresh Pin Checklist',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
