import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/client-red-flag-checklist/';

export const inputs: ToolInput[] = [
  {
    id: 'observedSignals',
    label: 'Observed signals (one per line)',
    type: 'textarea',
    required: true,
    placeholder:
      'List each warning sign you have seen, one per line — e.g.\nClient refuses to sign a written contract or agreement\nPressures you to start work before any deposit is paid\nExpands the scope after the price was already agreed',
  },
  {
    id: 'notes',
    label: 'Your notes (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'Private context for yourself — project name, dates, anything you want to remember.',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'riskScore', label: 'Risk score (count-based)', type: 'number', description: 'Free freelance client red flags 2026: Sum of the fixed weights of your selected signals. Instant, private, and mobile-friendly. No signup - try it free!', label: 'Risk band', type: 'text', description: 'Low, Caution, or High — a fixed rule, not a prediction.' },
  { id: 'flaggedSignals', label: 'Flagged signals', type: 'list', description: 'The signals you selected, with their fixed severity weights.' },
  { id: 'nextSteps', label: 'Suggested next steps', type: 'list', description: 'Generic, informational steps — not legal or financial advice.' },
  { id: 'disclaimer', label: 'Assessment note', type: 'text', description: 'Labels the result as your assessment aid, not a factual claim.' },
];

export const content: ToolContent = {
  title: 'Freelance Client Red Flags 2026 – Free | HusnainBlogger',
  description:
    'Spot freelance client red flags before you commit: select the warning signs you\'ve seen to get a count-based risk score, a plain summary, and next steps. Free.',
  howTo: [
    'List every warning sign you have actually observed, one signal per line in the observedSignals box.',
    'Add optional private notes (project name, dates) so you remember the context later.',
    'Run the checklist to get your count-based risk score and its Low / Caution / High band.',
    'Read the flagged-signals summary and the generic suggested next steps.',
    'Remember: the output is your own assessment aid — it makes no claim about the client.',
  ],
  methodology:
    'You select signals from a fixed 24-item bank; each signal carries a fixed severity weight (1-3). The risk score is the plain sum of the weights, and the band is a fixed rule: 0-2 Low, 3-6 Caution, 7+ High. No AI is involved, no external data is used, and nothing is predicted — the weights and bands are arbitrary fixed rules, not calibrated forecasts.',
  examples: [
    {
      title: 'Contract refuser who wants you to start now',
      inputs: {
        observedSignals:
          'Client refuses to sign a written contract or agreement\nPressures you to start work before any deposit is paid',
      },
      note: 'Two weight-3 signals = score 6, band Caution. Both lines match the bank exactly.',
    },
    {
      title: 'Scope creep plus vague brief',
      inputs: {
        observedSignals:
          'Expands the scope after the price was already agreed\nRequirements are vague and keep shifting',
        notes: 'Website redesign, March 2026',
      },
      note: 'Two weight-2 signals = score 4, band Caution; your notes are kept private and unscored.',
    },
  ],
  faqs: [
    {
      question: 'What is the best freelance client red flags?',
      answer:
        'The best one is a concrete checklist of observable behaviors — not vague advice. This free tool scores 24 specific warning signs (no contract, scope creep, payment excuses) with a fixed weight each, so you get a repeatable count-based score instead of a gut feeling.',
    },
    {
      question: 'Is there a free freelance client red flags?',
      answer:
        'Yes — this checklist is completely free with no signup. Select the warning signs you have observed and get your risk score, summary, and next steps instantly.',
    },
    {
      question: 'How to use freelance client red flags?',
      answer:
        'List each warning sign you have actually seen, one per line, and add private notes if you like. The tool counts your selected signals with fixed weights (1-3 each) and shows a Low, Caution, or High band plus generic next steps.',
    },
    {
      question: 'How does a freelance client red flags work?',
      answer:
        'It does not use AI and it makes no prediction about the client. You pick signals from a fixed 24-item bank, the tool adds up their fixed weights into a score, and a fixed rule (0-2 Low, 3-6 Caution, 7+ High) sets the band. It is your assessment aid, not a factual claim.',
    },
    {
      question: 'How does the freelance client red flags work?',
      answer:
        'Enter your details using the inputs above and the freelance client red flags calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the freelance client red flags free to use?',
      answer:
        'Yes - this freelance client red flags is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a freelance client red flags?',
      answer:
        'A freelance client red flags is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Score and band come from a fixed, arbitrary rule over signals you selected — not a calibrated prediction.',
    'Signals are your own subjective observations; the output is labeled as your assessment aid, not a factual claim about the client.',
    'Signal labels describe observable behaviors and deliberately avoid accusatory language.',
    'Next steps are generic information, not legal or financial advice.',
    'The signal bank is fixed at 24 items and does not cover every possible warning sign.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Freelance Client Red Flags 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free freelance client red flags 2026: Sum of the fixed weights of your selected signals. Instant, private, and mobile-friendly. No signup - try it free!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Creator Business Tools',
          item: 'https://husnainblogger.com/tools/creator-business/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Client Red Flag Checklist',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
