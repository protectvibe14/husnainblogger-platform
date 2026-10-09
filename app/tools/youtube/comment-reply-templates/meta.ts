import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/comment-reply-templates/';

export const inputs: ToolInput[] = [
  {
    id: 'commentType',
    label: 'Comment type',
    type: 'select',
    required: true,
    options: ['thank-you', 'question', 'criticism', 'collaboration', 'spam-adjacent'],
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['warm', 'professional', 'playful'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'replies',
    label: 'Reply templates',
    type: 'list',
    description:
    'Free youtube comment reply templates 2026: Two copy-paste reply drafts for the chosen comment type and tone. Fast, private now.',
  },
  {
    id: 'note',
    label: 'Usage note',
    type: 'text',
    description:
    'Template-bank size, placeholder legend and no-auto-reply disclaimer.',
  },
];

export const content: ToolContent = {
  title: 'YouTube Comment Reply Templates',
  description:
    'Reply to YouTube comments faster with free copy-paste templates: pick a comment type and tone to get ready drafts with placeholders. Grab yours now.',
  howTo: [
    'Choose the Comment Type: thank-you, question, criticism, collaboration or spam-adjacent.',
    'Pick a Tone: warm, professional or playful.',
    'Click Generate to get 2 copy-paste reply drafts.',
    'Replace [Commenter], [Your Name] and [your email] with your own details.',
    'Paste the reply manually under the YouTube comment — auto-replies are not supported.',
  ],
  methodology:
    'Replies come from a fixed bank of 30 hand-written templates (5 comment types x 3 tones x 2 templates) — no AI, no generated text. The same comment type and tone always return the same templates. Question templates include a [your answer] slot for you to fill in; nothing is posted anywhere automatically.',
  examples: [
    {
      title: 'Warm reply to a thank-you comment',
      inputs: { commentType: 'thank-you', tone: 'warm' },
      note: 'Returns 2 warm thank-you drafts with [Commenter] and [Your Name] placeholders.',
    },
    {
      title: 'Professional reply to criticism',
      inputs: { commentType: 'criticism', tone: 'professional' },
      note: 'Returns 2 calm, professional drafts that acknowledge feedback without escalating.',
    },
  ],
  faqs: [
    {
      question: 'What is the best youtube comment reply templates?',
      answer:
        'There is no verified "best" — the right reply depends on the comment and your channel voice. This free tool gives you 2 copy-paste drafts per comment type and tone from a fixed 30-template bank, with placeholders for the commenter name so each reply still feels personal.',
    },
    {
      question: 'Is there a free youtube comment reply templates?',
      answer:
        'Yes — this template tool is completely free with no signup. Pick a comment type (thank-you, question, criticism, collaboration or spam-adjacent) and a tone, and get 2 ready drafts to adapt and paste yourself.',
    },
    {
      question: 'How to use youtube comment reply templates?',
      answer:
        'Choose the comment type and tone that match the situation, copy one of the two drafts, replace the [Commenter] and [Your Name] placeholders, and paste it as your reply under the YouTube comment. The tool cannot post replies for you — YouTube has no supported auto-reply path here, and automated replies risk spam flags.',
    },
    {
      question: 'How does the youtube comment reply templates work?',
      answer:
        'Enter your details using the inputs above and the youtube comment reply templates calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube comment reply templates free to use?',
      answer:
        'Yes - this youtube comment reply templates is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube comment reply templates?',
      answer:
        'A youtube comment reply templates is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the youtube comment reply templates?',
      answer:
        'No account needed. Open the youtube comment reply templates, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Fixed 30-template bank (5 types x 3 tones x 2) — drafts are starting points, not AI-personalized replies.',
    'Copy-paste only: the tool cannot auto-reply to YouTube comments and does not touch your account.',
    'You must replace the [Commenter], [Your Name] and [your email] placeholders before posting.',
    'Spam-adjacent templates are polite boundary-setting drafts; use YouTube Studio moderation tools for actual spam.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'YouTube Comment Reply Templates 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free youtube comment reply templates 2026: Two copy-paste reply drafts for the chosen comment type and tone. Fast, private now.',
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
          name: 'YouTube Tools',
          item: 'https://husnainblogger.com/tools/youtube/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Comment Reply Templates',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
