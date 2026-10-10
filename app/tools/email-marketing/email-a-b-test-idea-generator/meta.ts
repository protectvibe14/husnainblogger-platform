import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'emailType',
    label: 'Email type',
    type: 'select',
    required: true,
    options: ['welcome', 'newsletter', 'promotional', 'abandoned-cart', 're-engagement'],
  },
  {
    id: 'testFocus',
    label: 'What to test',
    type: 'select',
    required: true,
    options: ['subject', 'preheader', 'cta', 'sendTime', 'content', 'layout'],
  },
  {
    id: 'listSize',
    label: 'List size (optional)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 5000',
    validation: { min: 0 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'testIdeas', label: 'A/B test ideas', type: 'table' },
  { id: 'sampleSizeNote', label: 'Sample-size rule of thumb', type: 'text' },
];

const DESCRIPTION =
  'Stop guessing what works in email: pick your email type and test focus to get 3 ready-to-run A/B tests with variants, hypotheses, and sample sizes.';

export const content: ToolContent = {
  title: 'Email A/B Test Ideas',
  description: DESCRIPTION,
  howTo: [
    'Choose your email type: welcome, newsletter, promotional, abandoned-cart, or re-engagement.',
    'Choose what to test: subject, preheader, CTA, send time, content, or layout.',
    'Optionally enter your list size for a per-variant sample estimate.',
    'Generate to get 3 test ideas with a name, variable, variant A/B, and hypothesis.',
    'Run one variable at a time in your email platform — this tool generates ideas only.',
  ],
  methodology:
    'Ideas come from a fixed bank of 18 hand-written test ideas (6 test foci × 3 ideas), with the hypothesis wording adjusted to your email type by a fixed template. No AI, no network, and no live testing — the same inputs always produce the same ideas. The sample-size note is a simplified rule of thumb (1,000 recipients per variant, 24–48 hours), explicitly not a statistical power calculation.',
  examples: [
    {
      title: 'Subject tests for a newsletter',
      inputs: { emailType: 'newsletter', testFocus: 'subject' },
      note: 'Three subject-line experiments: curiosity vs. clarity, length, and personalization.',
    },
    {
      title: 'CTA tests for an abandoned cart',
      inputs: { emailType: 'abandoned-cart', testFocus: 'cta', listSize: 4000 },
      note: 'Three CTA experiments plus a per-variant estimate from your 4,000-recipient list.',
    },
  ],
  faqs: [
    {
      question: 'What is the best email a/b test ideas?',
      answer:
        'The best ideas test one variable with a clear hypothesis. This free generator gives you 3 experiments per test area — subject, preheader, CTA, send time, content, or layout — each with variants and a hypothesis.',
    },
    {
      question: 'Is there a free email a/b test ideas?',
      answer:
        'Yes — this idea generator is completely free with no signup. Pick your email type and test focus to get 3 ready-to-run experiment ideas instantly.',
    },
    {
      question: 'How to use email a b test?',
      answer:
        'Pick one variable, write two variants, split your list evenly, and let it run at least 24–48 hours. As a rough rule of thumb, aim for 1,000 recipients per variant — this is not a power calculation, so larger lists give more reliable winners.',
    },
    {
      question: 'How does the email a/b test ideas work?',
      answer:
        'Enter your details using the inputs above and the email a/b test ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the email a/b test ideas free to use?',
      answer:
        'Yes - this email a/b test ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an email a/b test ideas?',
      answer:
        'An email a/b test ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the email a/b test ideas?',
      answer:
        'No account needed. Open the email a/b test ideas, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'This tool generates test IDEAS only — it does not run tests, send emails, or analyze results.',
    'Ideas come from a fixed 18-idea template bank, not from anyone’s real test data or AI.',
    'The sample-size guidance is a simplified rule of thumb, not a statistical power calculation; real significance needs a proper calculator.',
  ],
  jsonLd: [
  ],
};
