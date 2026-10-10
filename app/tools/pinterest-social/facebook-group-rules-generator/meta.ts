import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/facebook-group-rules-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'groupPurpose',
    label: 'Group purpose',
    type: 'text',
    required: true,
    placeholder: 'e.g. a support community for new parents',
    validation: { max: 120 },
  },
  {
    id: 'strictness',
    label: 'Strictness',
    type: 'select',
    required: false,
    options: ['relaxed', 'moderate', 'strict'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'intro',
    label: 'Rules header',
    type: 'text',
    description:
    'Free facebook group rules template 2026: One-line header describing the rule set. free.',
  },
  {
    id: 'rules',
    label: 'Group rules',
    type: 'list',
    description:
    '5 rules (spam, self-promo, respect, off-topic, moderation), each with a "why" line.',
  },
  {
    id: 'copyAll',
    label: 'Copy all rules',
    type: 'copy',
    description:
    'Numbered rule set as plain text, ready to paste into your group description.',
  },
  {
    id: 'disclaimer',
    label: 'Disclaimer',
    type: 'text',
    description:
    'Why compliance with Facebook\u2019s rules stays the admin\u2019s job.',
  },
];

export const content: ToolContent = {
  title: 'Facebook Group Rules Template',
  description:
    'Set group rules once and enforce them easily: pick a relaxed, moderate, or strict stance to get 5 clear rules with plain-English explanations.',
  howTo: [
    'Describe your group\u2019s purpose in the "Group purpose" field (e.g. a support community for new parents).',
    'Pick "Strictness": relaxed, moderate (default), or strict.',
    'Run the tool to get 5 plain-language rules covering spam, self-promotion, respect, off-topic posts, and moderation — each with a "why" line.',
    'Use "Copy all rules" to paste the numbered set into your group\u2019s description or rules section.',
    'Read the disclaimer, adjust the wording to your community, and make sure the rules follow Facebook\u2019s Community Standards.',
  ],
  methodology:
    'This tool assembles rule sets from a fixed bank of 30 hand-written rules (5 categories x 3 strictness levels x 2 variants). The variant per category is picked deterministically from your inputs — no AI is involved. Every rule is plain-language and enforceable, with a "why" line so members understand the reasoning. No hard character cap is applied because there is no verified platform cap on rule text; compliance with Facebook\u2019s Community Standards remains the admin\u2019s responsibility.',
  examples: [
    {
      title: 'Moderate rules for a parenting group',
      inputs: { groupPurpose: 'a support community for new parents', strictness: 'moderate' },
      note: 'Returns 5 moderate rules, e.g. promo only in the weekly thread.',
    },
    {
      title: 'Strict rules for a professional group',
      inputs: { groupPurpose: 'networking for freelance designers', strictness: 'strict' },
      note: 'Returns 5 strict rules with zero-tolerance phrasing.',
    },
  ],
  faqs: [
    {
      question: 'What is the best facebook group rules template?',
      answer:
        'The best facebook group rules template covers the five basics in plain language: no spam, limits on self-promotion, respect between members, staying on-topic, and how admins enforce the rules. Adding a short "why" to each rule raises compliance because members understand the reasoning. This free generator builds that 5-rule set at relaxed, moderate, or strict strictness.',
    },
    {
      question: 'Is there a free facebook group rules template?',
      answer:
        'Yes — this facebook group rules generator is completely free with no signup. You get a 5-rule set with explanations at any strictness level, as many times as you like.',
    },
    {
      question: 'How to use facebook group rules?',
      answer:
        'Describe your group\u2019s purpose, pick a strictness level, and run the tool. Copy the numbered rules into your group\u2019s description or the dedicated rules section, then pin a post pointing members to them.',
    },
    {
      question: 'How does a facebook group rules template work?',
      answer:
        'It picks one hand-written rule per category (spam, self-promo, respect, off-topic, moderation) at your chosen strictness from a fixed 30-rule bank — no AI involved. You are still responsible for keeping the rules within Facebook\u2019s Community Standards.',
    },
    {
      question: 'How does the facebook group rules template work?',
      answer:
        'Enter your details using the inputs above and the facebook group rules template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the facebook group rules template free to use?',
      answer:
        'Yes - this facebook group rules template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a facebook group rules template?',
      answer:
        'A facebook group rules template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Rules come from a fixed bank of 30 hand-written rules — the tool assembles a starting template; it does not give legal advice.',
    'No hard character cap is applied because there is no verified platform cap on rule text.',
    'Compliance with Facebook\u2019s Community Standards and Terms is the group admin\u2019s responsibility — adjust the wording before publishing.',
  ],
  jsonLd: [
  ],
};
