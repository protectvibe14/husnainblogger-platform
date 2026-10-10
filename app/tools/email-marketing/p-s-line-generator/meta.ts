import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'emailGoal',
    label: 'Your email goal',
    type: 'text',
    required: true,
    placeholder: 'e.g. book a demo call',
  },
  {
    id: 'offer',
    label: 'What you are offering',
    type: 'text',
    required: true,
    placeholder: 'e.g. the free email audit',
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['friendly', 'professional', 'playful', 'urgent'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'psLines', label: 'P.S. line ideas', type: 'list' },
];

const DESCRIPTION =
  'The P.S. gets read first, so make it count: enter your goal and offer for 6 ready-to-paste postscripts in friendly, professional, playful, or urgent tones.';

export const content: ToolContent = {
  title: 'Email Ps Generator',
  description: DESCRIPTION,
  howTo: [
    'Type your email goal (e.g. “book a demo call”) in the goal field.',
    'Enter what you are offering — the product, bonus, or lead magnet.',
    'Pick a tone: friendly, professional, playful, or urgent.',
    'Generate to get 6 P.S. lines drawn from the fixed 24-pattern template library.',
    'Pick the strongest line, adjust it to your voice, and paste it after your sign-off.',
  ],
  methodology:
    'Lines are assembled deterministically from a fixed template library of 24 hand-written patterns (4 tones × 6 patterns) with your goal and offer inserted into the slots. No AI and no network: the same inputs always produce the same 6 lines. A guard skips any pattern whose filled line would contain repeated adjacent words.',
  examples: [
    {
      title: 'Friendly P.S. for a demo email',
      inputs: { emailGoal: 'book a demo call', offer: 'the free email audit', tone: 'friendly' },
      note: 'Six gentle, conversational postscripts that restate the offer.',
    },
    {
      title: 'Urgent P.S. for a deadline push',
      inputs: { emailGoal: 'close signups', offer: 'the early-bird bonus', tone: 'urgent' },
      note: 'Six deadline-driven lines that reinforce scarcity without hype tricks.',
    },
  ],
  faqs: [
    {
      question: 'What is the best email ps generator?',
      answer:
        'The best one gives you multiple tone options and ready-to-paste lines without fluff. This free generator produces 6 P.S. lines in friendly, professional, playful, or urgent tones from a fixed 24-pattern library.',
    },
    {
      question: 'Is there a free email ps generator?',
      answer:
        'Yes — this generator is completely free with no signup. Enter your goal, offer, and tone to get 6 P.S. lines instantly.',
    },
    {
      question: 'How to generate email ps?',
      answer:
        'Describe your email goal and your offer, pick a tone, and generate. You get 6 postscript options — choose the one that best restates your call to action, then tweak it to your voice.',
    },
    {
      question: 'What is an email ps generator?',
      answer:
        'An email ps generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the email ps generator?',
      answer:
        'No account needed. Open the email ps generator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'What makes a good email ps generator?',
      answer: 'Clarity, specificity, and relevance to your audience. Avoid generic phrases — the more specific your input, the better the output.',
    },
    {
      question: 'Can I customize the generated email ps generator?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
  ],
  assumptions: [
    'Lines come from a fixed 24-pattern template library — not AI-generated copy.',
    'The tool inserts your words as-is; it cannot verify that your offer wording is accurate.',
    'Inputs longer than 200 characters are trimmed with a visible notice.',
  ],
  jsonLd: [],
};
