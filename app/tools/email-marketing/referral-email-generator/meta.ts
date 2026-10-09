import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'programName',
    label: 'Referral program name',
    type: 'text',
    required: true,
    placeholder: 'e.g. BookClub Plus',
  },
  {
    id: 'reward',
    label: 'Referral reward',
    type: 'text',
    required: true,
    placeholder: 'e.g. $20 credit for both',
  },
  {
    id: 'audience',
    label: 'Audience',
    type: 'text',
    required: true,
    placeholder: 'e.g. loyal readers',
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['friendly', 'professional', 'playful', 'urgent'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'subjectOptions', label: 'Subject line options', type: 'list' },
  { id: 'bodyDraft', label: 'Email body draft', type: 'copy' },
  { id: 'shareBlock', label: 'Share / forward block', type: 'copy' },
];

const DESCRIPTION =
  'Turn happy customers into referrers: enter your program name, the reward for both sides, and your audience for a ready-to-send referral email.';

export const content: ToolContent = {
  title: 'Referral Email Template Generator',
  description: DESCRIPTION,
  howTo: [
    'Enter your referral program name (e.g. “BookClub Plus”).',
    'Describe the reward both sides get (e.g. “$20 credit”).',
    'Describe your audience (e.g. “loyal readers”).',
    'Pick a tone: friendly, professional, playful, or urgent.',
    'Generate to get 5 subject lines, a complete body draft, and a share block — then paste them into your email tool.',
  ],
  methodology:
    'Email copy is assembled deterministically from a fixed template bank of 20 hand-written subject lines (4 tones × 5), 4 body templates, and 1 fixed share block, with your program name, reward, and audience inserted into the slots. No AI and no network: the same inputs always produce the same email. The share block uses a visible “[your referral link here]” placeholder — it is never left as an unresolved token.',
  examples: [
    {
      title: 'Friendly referral email for a book club',
      inputs: { programName: 'BookClub Plus', reward: '$20 credit', audience: 'loyal readers', tone: 'friendly' },
      note: 'Warm invite that explains the both-sides reward clearly.',
    },
    {
      title: 'Urgent referral email for a SaaS launch',
      inputs: { programName: 'Flowdesk', reward: '2 free months', audience: 'power users', tone: 'urgent' },
      note: 'Deadline-driven copy for a time-limited referral bonus.',
    },
  ],
  faqs: [
    {
      question: 'What is the best referral email template generator?',
      answer:
        'The best one covers subjects, body, and the share block in one go. This free generator produces 5 subject lines, a full body draft, and a forward/share block in friendly, professional, playful, or urgent tones.',
    },
    {
      question: 'Is there a free referral email template generator?',
      answer:
        'Yes — this referral email template generator is completely free with no signup. Enter your program name, reward, and audience to get a complete referral email instantly.',
    },
    {
      question: 'How to generate referral email?',
      answer:
        'Describe your program name, the reward, and your audience, then pick a tone. The tool assembles subject options, a body draft explaining how the referral works, and a share block with a link placeholder.',
    },
    {
      question: 'How does a referral email template generator work?',
      answer:
        'It inserts your program details into a fixed template bank of 20 subjects, 4 body templates, and a share block. No AI is involved, so results are consistent and transparent — it writes the email copy, not your program rules.',
    },
    {
      question: 'How does the referral email template generator work?',
      answer:
        'Enter your details using the inputs above and the referral email template generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the referral email template generator free to use?',
      answer:
        'Yes - this referral email template generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a referral email template generator?',
      answer:
        'A referral email template generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'This writes referral EMAIL copy only — it does not plan program mechanics (that is the separate Referral Program Planner).',
    'Copy comes from a fixed template bank, not AI; wording variety is limited to the bank.',
    'Inputs longer than 200 characters are trimmed with a visible notice.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Referral Email Template Generator 2026 | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/email-marketing/referral-email-generator/',
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
          name: 'Email Marketing Tools',
          item: 'https://husnainblogger.com/tools/email-marketing/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Referral Email Template Generator',
          item: 'https://husnainblogger.com/tools/email-marketing/referral-email-generator/',
        },
      ],
    },
  ],
};
