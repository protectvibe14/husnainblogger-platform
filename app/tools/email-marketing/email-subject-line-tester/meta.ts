import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'subjectLine',
    label: 'Subject line',
    type: 'text',
    required: true,
    placeholder: 'e.g. How to double your freelance income in 30 days',
  },
  {
    id: 'audienceHint',
    label: 'Audience hint (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. new subscribers',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'score', label: 'Score (0-100)', type: 'number' },
  { id: 'band', label: 'Score band', type: 'text' },
  { id: 'checkResults', label: 'Check-by-check results', type: 'table' },
  { id: 'truncationPreview', label: 'Truncation preview by email client', type: 'table' },
  { id: 'warnings', label: 'Warnings', type: 'list' },
  { id: 'suggestions', label: 'Suggestions', type: 'list' },
  { id: 'audienceNote', label: 'Audience note', type: 'text' },
];

export const content: ToolContent = {
  title: 'Email Subject Line Tester',
  description:
    'Free email subject line tester 2026: Test any email subject line free: get a 0-100 rule-based score, spam-trigger flags,. Fast, private, no signup - try it now!',
  howTo: [
    'Type or paste your subject line into the subject line field.',
    'Optionally add an audience hint (e.g. "new subscribers") for context.',
    'Run the test to get your 0-100 score and score band.',
    'Review the check-by-check results to see which signals passed or failed.',
    'Check the truncation preview to see how the subject shows on iPhone Mail, Gmail, and Outlook.',
    'Apply the suggestions, then re-test your improved subject line.',
  ],
  methodology:
    'This is a published, transparent rule-based scorer — not machine learning and not a deliverability predictor. It starts at 50 points: length (30-50 chars +15; very short/long -15), spam-trigger words (-8 each, capped at -24), ALL-CAPS ratio (-5 to -10), personalization token (+8), emoji use (+5 for 1-2, -5 for 5+), question or curiosity cue (+5), extra exclamation marks (-3 each, capped at -9), and numbers (+3). Bands: 80+ excellent, 60-79 good, 40-59 fair, below 40 needs work. Weights are documented estimates from common email best practices, NOT data-derived open-rate predictors — treat the score as guidance, then A/B test with your real audience.',
  examples: [
    {
      title: 'Strong subject',
      inputs: { subjectLine: 'How to double your freelance income in 30 days' },
      note: 'Scores 73 (good): ideal length, curiosity cue, and a specificity number.',
    },
    {
      title: 'Spammy subject',
      inputs: { subjectLine: 'FREE MONEY!!! Click here now, winner guaranteed' },
      note: 'Scores 30 (needs work): spam triggers, heavy caps, and extra exclamation marks.',
    },
    {
      title: 'With audience hint',
      inputs: { subjectLine: 'Your weekly deals are here', audienceHint: 'existing customers' },
      note: 'The audience hint is noted for context; it does not change the score.',
    },
  ],
  faqs: [
    {
      question: 'What is the best email subject line tester?',
      answer:
        'The best tester shows you exactly why a subject scored the way it did. This free tool gives a 0-100 score with a published check-by-check breakdown — length, spam triggers, caps, emoji, curiosity cues — plus a per-client truncation preview, so you can fix what is actually wrong.',
    },
    {
      question: 'Is there a free email subject line tester?',
      answer:
        'Yes — this one is completely free with no signup. Paste any subject line and get a score, check results, truncation previews, and suggestions instantly, as many times as you like.',
    },
    {
      question: 'How to test email subject line?',
      answer:
        'Paste your subject line into the tool and run the test. Check the score band, read the failing checks, review how it truncates on iPhone Mail, Gmail, and Outlook, then apply the suggestions and re-test until it scores well.',
    },
    {
      question: 'How does an email subject line tester work?',
      answer:
        'It runs your subject line through transparent rules — length, spam-trigger words, caps, emoji, curiosity cues, exclamation marks, and personalization — and combines them into a score with fix-it suggestions. The weights here are documented estimates for guidance, not measured open-rate predictors, so always confirm with an A/B test.',
    },
    {
      question: 'How does the email subject line tester work?',
      answer:
        'Enter your details using the inputs above and the email subject line tester calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the email subject line tester free to use?',
      answer:
        'Yes - this email subject line tester is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an email subject line tester?',
      answer:
        'An email subject line tester is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Rule-based heuristic scoring only — not machine learning, not a deliverability guarantee; it cannot predict open rates or inbox placement.',
    'The spam-trigger list is a transparent heuristic, not a real spam filter; mailbox providers weigh many more signals.',
    'Weights (e.g. +15 for ideal length) are documented estimates, not data-derived predictors.',
    'Truncation limits are approximations of common clients; actual rendering varies by device, font, and app version.',
    'Length guidance (30-50 chars) is a display rule of thumb, not a ranking factor.',
    'The audience hint is accepted for context only and does not change the score.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Email Subject Line Tester 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/email-marketing/email-subject-line-tester/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free email subject line tester 2026: Test any email subject line free: get a 0-100 rule-based score, spam-trigger flags,. Fast, private, no signup - try it now!',
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
          name: 'Email Subject Line Tester',
          item: 'https://husnainblogger.com/tools/email-marketing/email-subject-line-tester/',
        },
      ],
    },
  ],
};
