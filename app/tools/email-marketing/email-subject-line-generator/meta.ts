import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'emailPurpose',
    label: 'Email purpose',
    type: 'select',
    required: true,
    options: ['newsletter', 'promo', 'welcome', 'reengagement', 'transactional'],
  },
  {
    id: 'topic',
    label: 'Topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. weekly SEO tips',
  },
  {
    id: 'audience',
    label: 'Audience',
    type: 'text',
    required: true,
    placeholder: 'e.g. beginner bloggers',
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: false,
    options: ['friendly', 'urgent', 'playful', 'professional', 'curious'],
  },
  {
    id: 'count',
    label: 'How many (1-20)',
    type: 'number',
    required: false,
    placeholder: '10',
    validation: { min: 1, max: 20 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'subjectLines', label: 'Generated subject lines', type: 'list' },
  { id: 'notice', label: 'Notice', type: 'text' },
];

export const content: ToolContent = {
  title: 'Email Subject Line Generator',
  description:
    'Never stare at a blank subject line again: pick the email purpose, topic, audience, and tone to generate catchy lines built from 30 proven templates.',
  howTo: [
    'Choose the email purpose: newsletter, promo, welcome, reengagement, or transactional.',
    'Type your topic (e.g. "weekly SEO tips") and your audience (e.g. "beginner bloggers").',
    'Pick a tone — friendly, urgent, playful, professional, or curious — and how many lines you want (1-20).',
    'Run the generator to get your subject lines with character counts and mobile-fit flags.',
    'Copy the lines you like and paste them into your email tool — then test the tester tool to score them.',
  ],
  methodology:
    'Subject lines are assembled from a bundled library of 30 base templates (5 email purposes x 6 patterns) combined with 20 deterministic tone modifiers (5 tones x 4 variants) — 600 possible combinations served in fixed order. This tool runs no AI and makes no network requests: identical inputs always produce identical output, and every line is checked for character count and mobile display fit.',
  examples: [
    {
      title: 'Newsletter subjects',
      inputs: { emailPurpose: 'newsletter', topic: 'weekly SEO tips', audience: 'beginner bloggers', tone: 'friendly', count: 5 },
      note: 'Five friendly newsletter subject lines built around your topic and audience.',
    },
    {
      title: 'Urgent promo subjects',
      inputs: { emailPurpose: 'promo', topic: 'summer course sale', audience: 'past students', tone: 'urgent', count: 8 },
      note: 'Urgent-toned promo lines with deadline-style phrasing.',
    },
    {
      title: 'Welcome email subjects',
      inputs: { emailPurpose: 'welcome', topic: 'email marketing course', audience: 'new subscribers' },
      note: 'Defaults to 10 lines in the friendly tone.',
    },
  ],
  faqs: [
    {
      question: 'What is the best email subject line generator?',
      answer:
        'The best generator gives you variety you can actually use: this free tool builds subject lines from 30 proven patterns across 5 email purposes and 5 tones, with character counts and mobile-fit flags so you can pick lines that display well everywhere.',
    },
    {
      question: 'Is there a free email subject line generator?',
      answer:
        'Yes — this one is completely free with no signup. Generate up to 20 subject lines per run for newsletters, promos, welcome emails, re-engagement, and transactional mail, as many times as you like.',
    },
    {
      question: 'How to generate email subject line ideas?',
      answer:
        'Pick your email purpose, type your topic and audience, and choose a tone. The generator combines your words with 30 pattern templates — try two or three tones, then run your favorites through a subject line tester before sending.',
    },
    {
      question: 'How does an email subject line generator work?',
      answer:
        'This one assembles your topic and audience into bundled pattern templates, then applies tone modifiers (urgent, playful, curious, and more) in a fixed, deterministic order — no AI, no randomness. What you see is exactly what the template library produced, ready to copy.',
    },
    {
      question: 'How does the email subject line generator work?',
      answer:
        'Enter your details using the inputs above and the email subject line generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the email subject line generator free to use?',
      answer:
        'Yes - this email subject line generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an email subject line generator?',
      answer:
        'An email subject line generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Template-based generator — runs no AI; output quality depends on the pattern library, not on your specific offer.',
    'Lines are assembled from 30 base templates plus 20 tone modifiers (bank sizes documented in the tool).',
    'The mobile-fit flag uses an approximate ~41-character iPhone Mail limit; actual rendering varies.',
    'Generated lines are starting points — always adapt them to your brand voice and A/B test before sending.',
  ],
  jsonLd: [],
};
