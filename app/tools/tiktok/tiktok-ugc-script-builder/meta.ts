import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent, BuilderField } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'productName',
    label: 'Product name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Aurora Vitamin C Serum',
  },
  {
    id: 'brandVoice',
    label: 'Brand voice',
    type: 'text',
    required: true,
    placeholder: 'One of: friendly, funny, bold, luxury, professional',
  },
  {
    id: 'videoLength',
    label: 'Video length (seconds)',
    type: 'text',
    required: true,
    placeholder: 'One of: 15, 30, 60',
  },
  {
    id: 'isSponsored',
    label: 'Sponsored or affiliate?',
    type: 'text',
    placeholder: 'Type "yes" for paid/affiliate — inserts a #ad disclosure line',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'scripts', label: 'UGC scripts', type: 'list' },
];

export const content: ToolContent = {
  title: 'UGC Script Example TikTok',
  description:
    'Free ugc script example tiktok 2026: build a UGC script example for TikTok from templates: hook, demo beats, testimonial. Fast, private now.',
  howTo: [
    'Add one item per product you want a script for (up to 10 items).',
    'Enter the productName, a brandVoice (friendly, funny, bold, luxury, or professional), and a videoLength of 15, 30, or 60.',
    'If the video is sponsored or affiliate, type "yes" in the sponsored field to insert a fixed #ad disclosure line.',
    'Generate to get a full UGC-style script per item: hook, demo beats, testimonial lines, objection handler (60s), and CTA.',
    'Film each beat as written, testing the product live — every claim in the final video must be true.',
    'Keep the disclosure line in the final video if the content is paid or affiliate.',
  ],
  methodology:
    'For each item the builder picks a voice-specific hook (5 voices × 4 hooks), demo beats (8), testimonial lines (6), objection handlers (6), and a CTA (6) from fixed banks using a deterministic hash of the product name, then assembles them into a fixed shape per length: 15s gets hook + 1 demo + CTA, 30s adds a second demo and a testimonial, 60s adds a third demo and an objection handler. A "yes" sponsored flag inserts one fixed #ad disclosure line. No AI is used — same items always produce the same scripts.',
  faqs: [
    {
      question: 'What is the best UGC script example for TikTok?',
      answer:
        'The strongest UGC scripts follow a fixed flow: a hook in your brand voice, unedited demo beats, an honest testimonial line, and one CTA. This builder produces that flow from templates in 15, 30, or 60 seconds — you supply the real on-camera test.',
    },
    {
      question: 'Is there a free UGC script example for TikTok?',
      answer:
        'Yes — this builder is free and runs entirely in your browser. Build scripts for up to 10 products per run with hook, demo beats, testimonial lines, and CTA, with no signup.',
    },
    {
      question: 'How do I use the UGC script builder?',
      answer:
        'Add each product as an item with its name, one of five brand voices, and a length of 15, 30, or 60 seconds. Mark sponsored items as "yes" to get the #ad disclosure line, then generate and film each beat as written.',
    },
    {
      question: 'How does the ugc script example tiktok work?',
      answer:
        'Enter your details using the inputs above and the ugc script example tiktok calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ugc script example tiktok free to use?',
      answer:
        'Yes - this ugc script example tiktok is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an ugc script example tiktok?',
      answer:
        'An ugc script example tiktok is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the ugc script example tiktok?',
      answer:
        'No account needed. Open the ugc script example tiktok, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Template-based, not AI: the tool cannot test your product or verify claims — every claim in the final video must be true.',
    'The #ad disclosure line is a template reminder, not legal advice; you are responsible for FTC and local disclosure rules.',
    'Maximum 10 items per run; longer 60-second scripts include an objection-handler beat that 15s scripts skip.',
  ],
  jsonLd: [
  ],
};
