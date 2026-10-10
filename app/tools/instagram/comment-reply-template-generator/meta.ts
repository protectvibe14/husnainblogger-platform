import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/comment-reply-template-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'commentType',
    label: 'Comment type',
    type: 'select',
    required: true,
    options: ['praise', 'question', 'criticism', 'spam'],
  },
  {
    id: 'tone',
    label: 'Reply tone',
    type: 'select',
    required: false,
    options: ['friendly', 'professional', 'playful', 'formal'],
  },
  {
    id: 'brandName',
    label: 'Brand name (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. GlowCo — leave blank to keep the {brand} placeholder',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'replies',
    label: 'Reply templates',
    type: 'list',
    description:
    'Free instagram comment reply templates 2026: Three reply templates with {name} slots for the commenter. Get instant results. free now.',
  },
  {
    id: 'copyAll',
    label: 'Copy all replies',
    type: 'copy',
    description:
    'All three reply templates as plain text.',
  },
];

export const content: ToolContent = {
  title: 'Instagram Comment Reply Templates',
  description:
    'Reply to every Instagram comment with confidence. Pick the comment type and tone, get ready-to-use reply templates free —.',
  howTo: [
    'Choose the "Comment type": praise, question, criticism, or spam.',
    'Pick a "Reply tone" — friendly, professional, playful, or formal (defaults to friendly).',
    'Optionally enter your brand name to fill the {brand} slot automatically.',
    'Copy a reply from the "Reply templates" list and replace {name} with the commenter\u2019s name.',
    'For serious complaints, review the reply yourself before posting.',
  ],
  methodology:
    'This tool assembles replies from a fixed bank of 48 hand-written templates (4 comment types × 4 tones × 3 templates). The {name} slot is always left for you to fill; the {brand} slot is filled when you provide a brand name, otherwise kept as a placeholder. Nothing is written by AI.',
  examples: [
    {
      title: 'Friendly praise reply for GlowCo',
      inputs: { commentType: 'praise', tone: 'friendly', brandName: 'GlowCo' },
      note: 'Three warm replies with {name} slots and GlowCo in the sign-off.',
    },
    {
      title: 'Professional criticism reply',
      inputs: { commentType: 'criticism', tone: 'professional' },
      note: 'Three calm, apologetic replies keeping the {brand} placeholder.',
    },
    {
      title: 'Playful spam deflection',
      inputs: { commentType: 'spam', tone: 'playful' },
      note: 'Three light-hearted replies that redirect off-topic comments.',
    },
  ],
  faqs: [
    {
      question: 'What is the best instagram comment reply templates?',
      answer:
        'The best Instagram comment reply templates match the comment type — warm thanks for praise, helpful answers for questions, calm apologies for criticism, and polite redirects for spam. This free generator gives you three templates per type in four tones, each with a {name} slot for personalization.',
    },
    {
      question: 'Is there a free instagram comment reply templates?',
      answer:
        'Yes — this comment reply template generator is completely free with no signup. You can generate replies for all 4 comment types in all 4 tones, as many times as you like.',
    },
    {
      question: 'How to use instagram comment reply templates?',
      answer:
        'Pick the comment type and tone, optionally add your brand name, then copy a reply and replace {name} with the commenter\u2019s name. Personalizing the name slot and tweaking one line makes template replies feel genuine.',
    },
    {
      question: 'What is an instagram comment reply templates?',
      answer:
        'An instagram comment reply templates is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the instagram comment reply templates?',
      answer:
        'No account needed. Open the instagram comment reply templates, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Replies come from a fixed bank of 48 templates — they are starting points, not personalized messages.',
    'Always replace the {name} slot; unfilled placeholders look automated.',
    'For legal issues, threats, or serious complaints, a human should write and review the reply.',
  ],
  jsonLd: [],
};
