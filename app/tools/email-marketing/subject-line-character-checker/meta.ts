import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'subjectLine',
    label: 'Subject line',
    type: 'text',
    required: true,
    placeholder: 'e.g. Your 20% discount ends tonight — don’t miss out',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'charCount', label: 'Character count', type: 'number' },
  { id: 'wordCount', label: 'Word count', type: 'number' },
  { id: 'perClient', label: 'Per-client display preview', type: 'table' },
  { id: 'fitsAllMobile', label: 'Fits all mobile inboxes', type: 'text' },
];

const DESCRIPTION =
  'Check email subject line character counter length: exact counts, per-client truncation previews for Gmail, iPhone Mail, and Outlook. Try it free now.';

export const content: ToolContent = {
  title: 'Email Subject Line Character Counter 2027',
  description: DESCRIPTION,
  howTo: [
    'Paste or type your subject line into the subject-line field.',
    'Run the checker to get the exact character count (emoji-safe) and word count.',
    'Read the per-client table: Gmail app, iPhone Mail, Yahoo, Apple Mail, Outlook, and desktop Gmail.',
    'Check the “Truncated?” column and the ellipsis preview to see where your line would cut off.',
    'Shorten the line if “Fits all mobile inboxes” is false, then re-check before sending.',
  ],
  methodology:
    'Length is measured in Unicode code points, so emoji and non-Latin characters count as one character each. Per-client visible thresholds (Gmail app 40, iPhone Mail 41, Yahoo desktop 46, Apple Mail desktop 50, Outlook desktop 60, Gmail desktop 70) are commonly-cited guidance from email-client UI testing — they are NOT vendor guarantees, and actual rendering varies by device and app version. Subjects over 500 characters are previewed from the first 500 with a visible notice; counts always reflect the full input.',
  examples: [
    {
      title: 'Short promo line',
      inputs: { subjectLine: '20% off ends tonight' },
      note: 'Fits every mobile client; nothing truncated.',
    },
    {
      title: 'Long newsletter headline',
      inputs: { subjectLine: 'This week: 7 ways to grow your list, plus the template everyone is asking about' },
      note: 'Truncated on all mobile clients; keep the key promise inside the first 40 characters.',
    },
  ],
  faqs: [
    {
      question: 'What is the best email subject line character counter?',
      answer:
        'The best one counts real user-perceived characters (emoji count as one, not two) and shows per-client truncation, not just a number. This free checker counts code points and simulates display in six common inboxes.',
    },
    {
      question: 'Is there a free email subject line character counter?',
      answer:
        'Yes — this checker is completely free with no signup. Paste your subject line and you get character and word counts, a per-client truncation table, and a mobile-fit verdict instantly.',
    },
    {
      question: 'How to use email subject line character counter?',
      answer:
        'Paste your subject line and run the tool. Aim to fit the first 40 characters of your key message so it survives truncation on mobile clients, then re-check after any edit.',
    },
    {
      question: 'How does the email subject line character counter work?',
      answer:
        'Enter your details using the inputs above and the email subject line character counter calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the email subject line character counter free to use?',
      answer:
        'Yes - this email subject line character counter is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an email subject line character counter?',
      answer:
        'An email subject line character counter is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the email subject line character counter?',
      answer:
        'No account needed. Open the email subject line character counter, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Client display thresholds (40–70 chars) are commonly-cited guidance, not guarantees — mailbox apps change rendering constantly.',
    'The tool cannot verify what any specific device or app version actually displays; it simulates truncation from documented thresholds.',
    'Truncation length guidance is a display rule of thumb, not a deliverability or open-rate factor.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Email Subject Line Character Counter 2026 | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/email-marketing/subject-line-character-checker/',
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
          name: 'Subject Line Character Checker',
          item: 'https://husnainblogger.com/tools/email-marketing/subject-line-character-checker/',
        },
      ],
    },
  ],
};
