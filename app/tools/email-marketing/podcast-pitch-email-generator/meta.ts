import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'podcastName',
    label: 'Podcast name',
    type: 'text',
    required: true,
    placeholder: 'e.g. The Growth Show',
  },
  {
    id: 'episodeTopic',
    label: 'Episode topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. how founders price their first offer',
  },
  {
    id: 'hostName',
    label: 'Host name (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. Maya',
  },
  {
    id: 'yourCredentials',
    label: 'Your credentials',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. 10 years pricing SaaS, 40 podcast appearances',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'subjectOptions', label: 'Subject line options', type: 'list' },
  { id: 'pitchEmail', label: 'Pitch email', type: 'copy' },
  { id: 'notice', label: 'Notice', type: 'text' },
];

export const content: ToolContent = {
  title: 'Podcast Guest Pitch Email',
  description:
    'Land podcast guest spots with a sharper pitch: enter the show name, your topic, and credentials for 8 subject lines plus a ready-to-send email.',
  howTo: [
    'Type the podcast name you want to pitch.',
    'Describe your episode topic in one line.',
    'Add the host name if you know it (optional — a fallback greeting is used otherwise).',
    'Write your credentials: why you are a credible guest for this topic.',
    'Run the tool to get 8 subject lines and a full pitch email you can copy, paste, and personalize.',
  ],
  methodology:
    'Emails are assembled from a bundled library of 8 subject-line templates, 3 full pitch-email body templates, and 5 talking-point prompts (16 patterns total) — served deterministically with no AI and no network requests. The body template is chosen by hashing your inputs, so identical inputs always produce identical output. HTML tags are stripped from your input and no placeholder token ever renders empty.',
  examples: [
    {
      title: 'SaaS pricing episode pitch',
      inputs: {
        podcastName: 'The Growth Show',
        episodeTopic: 'how founders price their first offer',
        hostName: 'Maya',
        yourCredentials: '10 years pricing SaaS, 40 podcast appearances',
      },
      note: 'Eight subject lines and a credentials-led pitch email for the show.',
    },
    {
      title: 'Fitness show pitch',
      inputs: {
        podcastName: 'Fit Habits Daily',
        episodeTopic: 'strength training for busy parents',
        yourCredentials: 'certified strength coach, 12 years training new parents',
      },
      note: 'No host name — the email uses the fallback greeting.',
    },
    {
      title: 'Freelance writing pitch',
      inputs: {
        podcastName: 'The Write Life',
        episodeTopic: 'getting your first 5 clients without a portfolio',
        hostName: 'Jordan',
        yourCredentials: '7-figure copywriter, mentor to 200+ freelancers',
      },
      note: 'Concise or value-first body template chosen deterministically.',
    },
  ],
  faqs: [
    {
      question: 'What is the best podcast guest pitch email?',
      answer:
        'The best pitch is short, specific, and host-focused: a clear episode topic, proof you listen to the show, and credentials that fit the audience. This free tool builds one from 8 subject-line and 3 body templates — personalize the result with one genuine compliment about a recent episode before sending.',
    },
    {
      question: 'Is there a free podcast guest pitch email?',
      answer:
        'Yes — this tool is completely free with no signup. Enter the podcast name, your episode topic, and your credentials to get 8 subject lines and a full pitch email, as many times as you like.',
    },
    {
      question: 'How to use a podcast guest pitch email?',
      answer:
        'Fill in the podcast name, episode topic, optional host name, and your credentials, then run the tool. Copy the pitch email, add one personal line about the show, replace the signature block, and send from an email address that matches your credentials.',
    },
    {
      question: 'How does the podcast guest pitch email work?',
      answer:
        'Enter your details using the inputs above and the podcast guest pitch email calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the podcast guest pitch email free to use?',
      answer:
        'Yes - this podcast guest pitch email is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a podcast guest pitch email?',
      answer:
        'A podcast guest pitch email is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the podcast guest pitch email?',
      answer:
        'No account needed. Open the podcast guest pitch email, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Template-based generator — runs no AI; output quality depends on the pattern library and on how specific your inputs are.',
    'Built from 8 subject-line templates, 3 body templates, and 5 talking-point prompts (bank sizes documented in the tool).',
    'Host name is optional; when empty the email uses a "Hi there," greeting and "your team" as the fallback phrase.',
    'The signature is a placeholder — always replace it with your real name and link before sending.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Podcast Guest Pitch Email 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/email-marketing/podcast-pitch-email-generator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Land podcast guest spots with a sharper pitch: enter the show name, your topic, and credentials for 8 subject lines plus a ready-to-send email.',
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
          name: 'Podcast Pitch Email Generator',
          item: 'https://husnainblogger.com/tools/email-marketing/podcast-pitch-email-generator/',
        },
      ],
    },
  ],
};
