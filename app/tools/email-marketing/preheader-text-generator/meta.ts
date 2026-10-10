import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'emailSummary',
    label: 'What is your email about?',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. Our new email course launches next week with five practical lessons',
  },
  {
    id: 'subjectLine',
    label: 'Subject line (to avoid repeating it)',
    type: 'text',
    required: false,
    placeholder: 'e.g. Course launch next week',
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: false,
    options: ['friendly', 'urgent', 'professional', 'curious', 'playful'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'preheaderOptions', label: 'Preheader options', type: 'table' },
  { id: 'notice', label: 'Notice', type: 'text' },
];

export const content: ToolContent = {
  title: 'Email Preheader Generator',
  description:
    'Stop wasting preview text on repeats: summarize your email for 6 preheader options in 5 tones that complement your subject line instead of echoing it.',
  howTo: [
    'Describe what your email is about in the summary field (at least 10 characters).',
    'Optionally paste your subject line so the generator avoids repeating it.',
    'Pick a tone — friendly, urgent, professional, curious, or playful.',
    'Run the generator to get 6 preheader options with character counts.',
    'Copy the option that complements (not repeats) your subject line into your email tool.',
  ],
  methodology:
    'Preheaders are assembled from a bundled library of 18 base templates combined with 5 deterministic tone extenders — no AI, no network. Every variant is measured in user-perceived characters and kept between 40 and 100: short drafts are padded with a tone extender, long ones are trimmed at a word boundary. Variants that would restate more than half of your subject\'s key words are skipped, so the preheader complements the subject instead of echoing it.',
  examples: [
    {
      title: 'Course launch',
      inputs: { emailSummary: 'Our new email course launches next week with five practical lessons', tone: 'friendly' },
      note: 'Six friendly 40-100 character preview lines built from your summary.',
    },
    {
      title: 'Avoiding subject repeat',
      inputs: { emailSummary: 'Our new email course launches next week with five practical lessons', subjectLine: 'Email course launches next week', tone: 'curious' },
      note: 'Curious-toned options that complement the subject instead of restating it.',
    },
    {
      title: 'Flash sale',
      inputs: { emailSummary: 'Weekend-only discount on all premium email templates', tone: 'urgent' },
      note: 'Urgent-toned preheaders padded to the 40-character minimum where needed.',
    },
  ],
  faqs: [
    {
      question: 'What is the best email preheader generator?',
      answer:
        'The best one writes preview text that complements your subject instead of repeating it. This free tool turns your email summary into 6 options of 40-100 characters each, checks every one against your subject line, and shows exact character counts.',
    },
    {
      question: 'Is there a free email preheader generator?',
      answer:
        'Yes — this one is completely free with no signup. Describe your email, optionally add your subject line, and get 6 preview-text options in 5 tones instantly.',
    },
    {
      question: 'How to generate email preheader?',
      answer:
        'Summarize what your email is about, paste your subject line so it is not repeated, and pick a tone. The generator builds 6 variants of 40-100 characters — copy the one that adds new information next to your subject.',
    },
    {
      question: 'How does an email preheader generator work?',
      answer:
        'This one assembles your summary into bundled preview-text templates and applies tone modifiers in a fixed, deterministic order — no AI. Note: Apple Mail on iOS 18.2 and later may show an AI-generated summary instead of your preheader, so keep the first sentence of your email strong too.',
    },
    {
      question: 'How does the email preheader generator work?',
      answer:
        'Enter your details using the inputs above and the email preheader generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the email preheader generator free to use?',
      answer:
        'Yes - this email preheader generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an email preheader generator?',
      answer:
        'An email preheader generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Template-based generator — runs no AI; variants come from 18 bundled templates plus 5 tone extenders.',
    'Every variant is kept between 40 and 100 characters; short drafts are padded, long ones trimmed at a word boundary.',
    'Subject-repeat avoidance is word-overlap based (skips variants restating >50% of subject key words), not semantic.',
    'Apple Mail on iOS 18.2+ may show AI-generated summaries instead of your preheader.',
    'Summaries longer than 300 characters are shortened with a visible notice.',
  ],
  jsonLd: [],
};
