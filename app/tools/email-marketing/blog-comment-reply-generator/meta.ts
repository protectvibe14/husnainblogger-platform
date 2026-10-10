import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'commentText',
    label: 'Blog comment',
    type: 'textarea',
    required: true,
    placeholder: 'Paste the reader’s comment here…',
  },
  {
    id: 'replyTone',
    label: 'Reply tone',
    type: 'select',
    required: true,
    options: ['friendly', 'professional', 'witty'],
  },
  {
    id: 'authorName',
    label: 'Commenter name (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. Sara',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'replyDrafts', label: 'Reply drafts', type: 'list' },
];

const DESCRIPTION =
  'Reply to reader comments like a pro: paste the comment, choose a friendly, professional, or witty tone, and get a thoughtful draft in seconds.';

export const content: ToolContent = {
  title: 'Blog Comment Reply Generator',
  description: DESCRIPTION,
  howTo: [
    'Paste the reader’s blog comment into the comment field.',
    'Optionally add the commenter’s name for a personal greeting.',
    'Pick a reply tone: friendly, professional, or witty.',
    'Generate to get 3 reply drafts built from the fixed 18-template library.',
    'Review, personalize, and post the draft you like best.',
  ],
  methodology:
    'Each draft is assembled deterministically from a fixed library of 18 hand-written reply templates (3 tones × 6 templates), with your commenter’s name and a trimmed excerpt of the comment inserted into the slots — no AI, no network, and the same comment plus tone always produces the same 3 drafts. Overlong comments are trimmed with a visible notice, and HTML is stripped from inputs before assembly.',
  examples: [
    {
      title: 'Friendly reply to a thank-you comment',
      inputs: { commentText: 'This post finally made email segmentation click for me. Thank you!', replyTone: 'friendly', authorName: 'Sara' },
      note: 'Three warm drafts that reference the comment and invite a follow-up.',
    },
    {
      title: 'Professional reply to critical feedback',
      inputs: { commentText: 'I disagree with the section on send times — my data shows the opposite.', replyTone: 'professional', authorName: '' },
      note: 'Three courteous drafts that acknowledge the point and keep the discussion constructive.',
    },
  ],
  faqs: [
    {
      question: 'What is the best blog comment reply generator?',
      answer:
        'The best one helps you reply quickly without sounding robotic. This free generator gives you 3 reply drafts per comment in friendly, professional, or witty tones, each referencing the actual comment — but always personalize the draft before posting.',
    },
    {
      question: 'Is there a free blog comment reply generator?',
      answer:
        'Yes — this blog comment reply generator is completely free with no signup. Paste any comment, pick a tone, and get 3 reply drafts instantly.',
    },
    {
      question: 'How to generate blog comment reply?',
      answer:
        'Paste the reader’s comment, optionally add their name, choose friendly, professional, or witty, and generate. Review the 3 drafts, edit the best one in your own voice, then reply on your blog.',
    },
    {
      question: 'Does this blog comment reply generator use AI?',
      answer:
        'No. It assembles drafts from a fixed library of 18 hand-written templates (3 tones × 6). That makes it deterministic and free, but it cannot understand nuance the way you can — always review drafts before posting.',
    },
    {
      question: 'How does the blog comment reply generator work?',
      answer:
        'Enter your details using the inputs above and the blog comment reply generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the blog comment reply generator free to use?',
      answer:
        'Yes - this blog comment reply generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a blog comment reply generator?',
      answer:
        'A blog comment reply generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Drafts come from a fixed 18-template library, not AI — always review and personalize before posting a reply.',
    'The tool references the comment’s excerpt; it cannot detect tone, sarcasm, or spam — use your judgment.',
    'Comments longer than 1000 characters are trimmed with a visible notice.',
  ],
  jsonLd: [],
};
