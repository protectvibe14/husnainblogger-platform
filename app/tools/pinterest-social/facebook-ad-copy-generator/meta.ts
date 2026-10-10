import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/facebook-ad-copy-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'offer',
    label: 'Your offer',
    type: 'text',
    required: true,
    placeholder: 'e.g. 50% off our starter skincare kit',
    validation: { max: 100 },
  },
  {
    id: 'cta',
    label: 'Call to action (optional)',
    type: 'text',
    required: false,
    placeholder: 'Learn more',
    validation: { max: 60 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'primaryText',
    label: 'Primary text',
    type: 'text',
    description:
    'Free facebook ad copy generator 2026: Ad primary text with your CTA placed inside the visible first 125 characters. Fast, private now.',
  },
  {
    id: 'description',
    label: 'Description',
    type: 'text',
    description:
    'Short ad description, 30 characters or fewer.',
  },
  {
    id: 'headlineTip',
    label: 'Headline tip',
    type: 'text',
    description:
    'Cross-reference to the Facebook Ad Headline Generator.',
  },
];

export const content: ToolContent = {
  title: 'Facebook Ad Copy Generator',
  description:
    'Write Facebook ad copy with this free generator. Get primary text with the CTA in the visible first 125 characters plus a short description. Start now.',
  howTo: [
    'Describe your offer in up to 100 characters, e.g. "50% off our starter skincare kit".',
    'Optionally enter your own call to action (default: "Learn more").',
    'Run the tool to get primary text — your CTA always lands inside the visible first 125 characters — plus a description of 30 characters or fewer.',
    'Follow the headline tip to pair the copy with a matching 40-character headline, then rewrite everything in your own voice.',
  ],
  methodology:
    'Copy is assembled from a fixed bank of 8 primary-text templates and 3 description templates with your offer and CTA slotted in — no AI is used. Every template places the CTA inside the first 125 characters (the visible window before "See more"), and descriptions are compressed at a word boundary to 30 characters or fewer. Closing sentences are neutral and make no claims about your business or ad performance.',
  examples: [
    {
      title: 'Skincare sale ad copy',
      inputs: { offer: '50% off our starter skincare kit', cta: 'Shop now' },
      note: 'Primary text with "Shop now" in the first 125 characters plus a ≤30-char description.',
    },
    {
      title: 'SaaS free trial ad copy',
      inputs: { offer: 'free 14-day trial, no credit card', cta: 'Start free' },
      note: 'Uses the default structure with a custom CTA.',
    },
  ],
  faqs: [
    {
      question: 'What is the best facebook ad copy generator?',
      answer:
        'The best Facebook ad copy generator puts your CTA inside the first 125 characters (the visible window) and keeps the description under 30 characters. This free tool does exactly that with proven copy templates — use the output as a starting point and rewrite it in your own voice.',
    },
    {
      question: 'Is there a free facebook ad copy generator?',
      answer:
        'Yes — this Facebook ad copy generator is completely free with no signup. Enter your offer for primary text with your CTA in the visible window, a short description, and a headline pairing tip.',
    },
    {
      question: 'How to generate facebook ad?',
      answer:
        'Enter your offer and optionally your own CTA, then run the tool. Copy the primary text and description into your ad, and use the headline tip to add a matching 40-character headline. Note: this tool writes copy only — it does not connect to Ads Manager or place ads.',
    },
    {
      question: 'How does a facebook ad copy generator work?',
      answer:
        'It slots your offer and CTA into a fixed bank of proven copy templates, guaranteeing the CTA sits within the first 125 characters and the description stays under 30. No AI is involved — the same offer and CTA always return the same copy.',
    },
    {
      question: 'What is a facebook ad copy generator?',
      answer:
        'A facebook ad copy generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Copy comes from fixed templates — starting points that need your own offer details, compliance review, and voice. This tool makes no performance or delivery claims.',
    'The tool writes ad copy only; it has no Facebook Ads Manager integration and cannot create, launch, or manage ads.',
  ],
  jsonLd: [],
};
