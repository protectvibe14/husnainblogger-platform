import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'text',
    label: 'Email text (subject or body)',
    type: 'textarea',
    required: true,
    placeholder: 'Paste your email subject line or body text here…',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'matches', label: 'Matched trigger words', type: 'table' },
  { id: 'riskLevel', label: 'Risk level', type: 'text' },
  { id: 'rewriteSuggestions', label: 'Rewrite suggestions', type: 'list' },
  { id: 'notice', label: 'Notice', type: 'text' },
];

export const content: ToolContent = {
  title: 'Email Spam Word Checker',
  description:
    'Check your copy against 45 spam trigger words before you hit send: paste any subject or body text and see flagged terms with severity ratings.',
  howTo: [
    'Paste your email subject line or full body text into the text field.',
    'Run the check to match it against the bundled 45-term trigger-word list.',
    'Review the flagged terms with their category (urgency, money, deceptive…) and severity.',
    'Read your risk level: low, medium, or high.',
    'Apply the rewrite suggestions to soften or replace the flagged wording, then re-check.',
  ],
  methodology:
    'This is a pattern linter, not a live spam-filter test: it matches your text against a bundled, curated list of 45 spam-trigger words and phrases in 6 categories (urgency, money, deceptive, pressure, shady, common), using case-insensitive whole-word matching. Risk is low by default, medium with any medium-severity match or 2+ matches, and high with any high-severity match or 6+ matches. Real mailbox filters are behavioral and ML-based — sender reputation, authentication, and engagement — and cannot be tested from a browser, so treat this as a writing aid, not a deliverability guarantee.',
  examples: [
    {
      title: 'Spammy promo',
      inputs: { text: 'Act now! This is urgent and 100% free, guaranteed.' },
      note: 'Flags act now, urgent, 100% free, guaranteed — risk level high.',
    },
    {
      title: 'Clean newsletter',
      inputs: { text: 'Hi Sarah, here is the weekly roundup you signed up for.' },
      note: 'No matches — risk level low.',
    },
    {
      title: 'Soft-sell check',
      inputs: { text: 'Buy now and save with this deal' },
      note: 'Flags buy now (medium) and deal (low) — risk level medium.',
    },
  ],
  faqs: [
    {
      question: 'What is the best email spam word checker?',
      answer:
        'The best checker explains why each word is risky. This free tool matches your text against a curated 45-term trigger list, labels each hit by category and severity (high, medium, low), and gives a rewrite tip per category — so you fix wording instead of guessing.',
    },
    {
      question: 'Is there a free email spam word checker?',
      answer:
        'Yes — this one is completely free with no signup. Paste any subject line or body text and get flagged words, a risk level, and rewrite suggestions instantly.',
    },
    {
      question: 'How to check email spam word?',
      answer:
        'Paste your email text into the tool and run the check. It highlights trigger words like "free", "guaranteed", and "act now", rates your overall risk as low, medium, or high, and suggests safer rewrites for each flagged category.',
    },
    {
      question: 'How does an email spam word checker work?',
      answer:
        'It scans your text for words and phrases historically associated with spam, using case-insensitive whole-word matching against a bundled list. Important: this is a writing aid, not a live filter test — real spam filters weigh sender reputation, authentication (SPF/DKIM/DMARC), and engagement, which no browser tool can check.',
    },
    {
      question: 'How does the email spam word checker work?',
      answer:
        'Enter your details using the inputs above and the email spam word checker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the email spam word checker free to use?',
      answer:
        'Yes - this email spam word checker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an email spam word checker?',
      answer:
        'An email spam word checker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Pattern linter only — NOT a live spam-filter test; it cannot predict inbox placement.',
    'Matches against a bundled 45-term curated list; real filters use far more signals.',
    'Severity ratings and risk thresholds are heuristic writing guidance, not measured filter behavior.',
    'Word-boundary matching means some variants (misspellings, leetspeak, curly apostrophes) will not match.',
    'Text longer than 5000 characters is truncated with a visible notice.',
  ],
  jsonLd: [
  ],
};
