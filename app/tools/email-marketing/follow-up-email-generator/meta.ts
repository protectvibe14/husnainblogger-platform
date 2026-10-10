import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'sequenceStep',
    label: 'Sequence step (1–5)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 2',
    validation: { min: 1, max: 5 },
  },
  {
    id: 'originalSubject',
    label: 'Original subject line',
    type: 'text',
    required: true,
    placeholder: 'e.g. Quick question about your hiring plan',
  },
  {
    id: 'goal',
    label: 'Follow-up goal',
    type: 'text',
    required: true,
    placeholder: 'e.g. book a 15-minute call',
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
  { id: 'subjectOptions', label: 'Follow-up subject options', type: 'list' },
  { id: 'bodyDraft', label: 'Follow-up email draft', type: 'copy' },
];

const DESCRIPTION =
  'Follow up without being pushy: pick your sequence step, add the original subject and your goal, and get 4 subject options plus a full draft.';

export const content: ToolContent = {
  title: 'Follow Up Email Generator',
  description: DESCRIPTION,
  howTo: [
    'Choose your sequence step (1 = first bump, 5 = final break-up nudge).',
    'Enter the original subject line you are following up on.',
    'Enter your follow-up goal (e.g. “book a 15-minute call”).',
    'Pick a tone: friendly, professional, playful, or urgent.',
    'Generate to get 4 step-matched subject options and a full body draft to copy.',
  ],
  methodology:
    'Drafts are assembled deterministically from a fixed library: 20 subject patterns (5 steps × 4) and 15 body templates (5 steps × 3), plus 4 tone closing lines. The body template is picked by the fixed rule (tone index + step) mod 3, with your subject and goal inserted as-is. No AI and no network: the same inputs always produce the same draft.',
  examples: [
    {
      title: 'Step-2 friendly bump',
      inputs: { sequenceStep: 2, originalSubject: 'Quick question about your hiring plan', goal: 'book a 15-minute call', tone: 'friendly' },
      note: 'Four second-touch subjects and a polite bump draft that keeps the goal visible.',
    },
    {
      title: 'Step-5 break-up email',
      inputs: { sequenceStep: 5, originalSubject: 'Partnership idea for Q4', goal: 'get a yes or no', tone: 'professional' },
      note: 'Four final-touch subjects and a respectful break-up draft that closes the loop.',
    },
  ],
  faqs: [
    {
      question: 'What is the best follow up email generator?',
      answer:
        'The best one matches the follow-up to its place in the sequence. This free generator takes your step (1–5), original subject, and goal to produce 4 subject options plus a step-appropriate body draft.',
    },
    {
      question: 'Is there a free follow up email generator?',
      answer:
        'Yes — this generator is completely free with no signup. Enter your sequence step, original subject, goal, and tone to get a full follow-up draft instantly.',
    },
    {
      question: 'How to generate follow up email?',
      answer:
        'State your step in the sequence, the original subject, and your goal, then generate. Use the strongest subject, fill in the {{firstName}} and {{yourName}} placeholders with real details, and send from your own email tool.',
    },
    {
      question: 'What is a follow up email generator?',
      answer:
        'A follow up email generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the follow up email generator?',
      answer:
        'No account needed. Open the follow up email generator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Drafts come from a fixed 35-pattern template library (20 subject + 15 body patterns) — not AI-written copy.',
    'The tool inserts your words as-is; it cannot verify claims, numbers, or offers in your input.',
    'It drafts copy only — it never sends emails and cannot verify consent; follow applicable email laws for your audience.',
  ],
  jsonLd: [],
};
