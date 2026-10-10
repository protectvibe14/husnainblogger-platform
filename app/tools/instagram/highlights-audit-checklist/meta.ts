import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/highlights-audit-checklist/';

const CRITERION_LABELS: Array<[string, string]> = [
  ['hl-start-here', 'Do you have a "Start here" or "About" highlight?'],
  ['hl-testimonials', 'Do you have a testimonials or reviews highlight?'],
  ['hl-offers', 'Do you have an offers or services highlight?'],
  ['hl-faq', 'Do you have an FAQ highlight?'],
  ['hl-covers', 'Do your highlights have clean, consistent covers?'],
  ['hl-names', 'Do your highlights have clear names (not just emojis)?'],
  ['hl-content', 'Does every highlight have 3+ stories (no empty ones)?'],
  ['hl-fresh', 'Were your highlights updated in the last 90 days?'],
  ['hl-count', 'Do you have fewer than 10 highlights (no clutter)?'],
  ['hl-no-broken', 'Are all highlights free of broken or expired content?'],
];

export const inputs: ToolInput[] = CRITERION_LABELS.map(([id, label]) => ({
  id,
  label,
  type: 'select' as const,
  required: true,
  options: ['Yes', 'No', 'N/A'],
}));

export const outputs: ToolOutput[] = [
  {
    id: 'score',
    label: 'Highlights score',
    type: 'number',
    description:
    'Free instagram highlights strategy 2026: Your audit score, 0–100. A manual self-audit estimate. Get instant results. free now.',
  },
  {
    id: 'missingElements',
    label: 'Missing elements',
    type: 'list',
    description:
    'The highlight elements your profile is missing.',
  },
  {
    id: 'fixList',
    label: 'Fix list',
    type: 'list',
    description:
    'Concrete fixes, ordered by impact — highest-weight items first.',
  },
];

export const content: ToolContent = {
  title: 'Instagram Highlights Strategy',
  description:
    'Audit your instagram highlights strategy free: answer 10 yes/no questions for a 0–100 score, your missing elements, and a fix list. — check yours now.',
  howTo: [
    'Open your Instagram profile and look at your highlights row.',
    'Answer the 10 yes/no questions honestly — choose "N/A" only for items that truly do not apply to your account type.',
    'Run the tool to get your 0–100 score, the list of missing elements, and the fix list.',
    'Work through the fix list from the top down — it is ordered by impact.',
    'Re-audit after rebuilding your highlights to confirm the score improved.',
  ],
  methodology:
    'This is a transparent, fully client-side rubric scorer — not an AI judge and not connected to Instagram: it cannot read your highlights; you answer 10 fixed yes/no questions. Each criterion has a weight of 1 or 2 (total weight 14, max 28 points): Yes = 2 points, No = 0, and N/A excludes the item from the denominator (the count is reported). The score is round(earned / possible × 100). Bands: 85–100 Highlight-Ready, 70–84 Good, 50–69 Gaps to fix, 0–49 Needs an overhaul. Missing elements are the criteria you answered "No" to; fix tips are fixed, rule-based suggestions attached to each criterion — never generated.',
  examples: [
    {
      title: 'Complete highlights',
      inputs: {
        'hl-start-here': 'Yes',
        'hl-testimonials': 'Yes',
        'hl-offers': 'Yes',
        'hl-faq': 'Yes',
        'hl-covers': 'Yes',
        'hl-names': 'Yes',
        'hl-content': 'Yes',
        'hl-fresh': 'Yes',
        'hl-count': 'Yes',
        'hl-no-broken': 'Yes',
      },
      note: 'A complete highlights row scoring 100 — Highlight-Ready.',
    },
    {
      title: 'Neglected highlights',
      inputs: {
        'hl-start-here': 'No',
        'hl-testimonials': 'No',
        'hl-offers': 'No',
        'hl-faq': 'No',
        'hl-covers': 'No',
        'hl-names': 'Yes',
        'hl-content': 'Yes',
        'hl-fresh': 'No',
        'hl-count': 'Yes',
        'hl-no-broken': 'Yes',
      },
      note: 'A mid-range score with the heaviest missing elements listed first.',
    },
  ],
  faqs: [
    {
      question: 'What is the best instagram highlights strategy?',
      answer:
        'The best strategy covers the buyer journey: a Start-here highlight, testimonials, offers, and an FAQ — with consistent covers, clear names, and regular updates. This audit checks all ten of those elements against a published rubric and tells you exactly what to add first.',
    },
    {
      question: 'Is there a free instagram highlights strategy?',
      answer:
        'Yes — this Highlights Audit Checklist is completely free with no signup. Answer 10 yes/no questions and get a 0–100 score, the elements you are missing, and an ordered fix list instantly.',
    },
    {
      question: 'How to use instagram highlights strategy?',
      answer:
        'Open your highlights row, answer the 10 questions (Yes, No, or N/A), and run the audit. Add the missing elements starting from the top of the fix list — the heaviest-weight items come first — then re-audit to confirm your score improved.',
    },
    {
      question: 'What is an instagram highlights strategy?',
      answer:
        'An instagram highlights strategy is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the instagram highlights strategy?',
      answer:
        'No account needed. Open the instagram highlights strategy, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'Is this instagram highlights strategy tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
    {
      question: 'How do I use this instagram highlights strategy tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
  ],
  assumptions: [
    'A manual self-audit: the tool cannot read your real Instagram highlights — answers are your own judgment, so answer honestly.',
    'The score is a checklist-based estimate of highlight completeness, not a guarantee of engagement or sales.',
    'Freshness criteria ("updated in the last 90 days") rely on your memory, not live data.',
    'The rubric is fixed; Instagram\u2019s highlight features may change over time.',
  ],
  jsonLd: [],
};
