import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/discovery-call-question-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'serviceType',
    label: 'Your service type',
    type: 'select',
    required: true,
    options: [
      'Web design',
      'Copywriting',
      'Video editing',
      'Social media management',
      'Brand & logo design',
      'SEO',
      'Email marketing',
      'Virtual assistance',
      'UGC creation',
      'Other / general freelancing',
    ],
  },
  {
    id: 'callGoal',
    label: 'Call goal',
    type: 'select',
    required: true,
    options: ['qualify', 'scope', 'close'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'questions',
    label: 'Discovery call questions',
    type: 'list',
    description:
    'Free discovery call questions 2026: The curated questions for your goal, grouped: rapport, needs, budget, timeline, decision. Fast, private.',
  },
  {
    id: 'questionCount',
    label: 'Number of questions',
    type: 'number',
    description:
    'How many questions the selected goal returns.',
  },
  {
    id: 'goalLabel',
    label: 'Goal in plain words',
    type: 'text',
    description:
    'What the selected call goal means, in one line.',
  },
];

export const content: ToolContent = {
  title: 'Discovery Call Questions',
  description:
    'Get discovery call questions that fit your goal: pick your service and choose qualify, scope, or close to receive a grouped list of proven questions. Free.',
  howTo: [
    'Choose your service type from the list.',
    'Choose the call goal: qualify (is this client a fit?), scope (what will the project take?), or close (can we agree and start?).',
    'Generate to get the grouped question list — rapport, needs, budget, timeline, decision.',
    'Read through and adapt the wording to your voice before the call.',
  ],
  methodology:
    'No AI is involved: questions come from a fixed bank of 29 curated questions in 5 groups (rapport 5, needs 8, budget 6, timeline 5, decision 5). The call goal selects a fixed subset — qualify gets rapport + needs + budget (19), scope gets rapport + needs + timeline (18), close gets all groups (29) — and "{service}" placeholders are filled with your chosen service type. Same inputs always return the same list.',
  examples: [
    {
      title: 'Web designer qualifying a lead',
      inputs: { serviceType: 'Web design', callGoal: 'qualify' },
      note: '19 questions: rapport, needs (with "web design" filled in), and budget — no timeline or decision questions.',
    },
    {
      title: 'Copywriter closing a warm lead',
      inputs: { serviceType: 'Copywriting', callGoal: 'close' },
      note: 'All 29 questions across 5 groups, ending with decision questions like "Shall we lock in a start date and a deposit to hold it?"',
    },
    {
      title: 'Video editor scoping a project',
      inputs: { serviceType: 'Video editing', callGoal: 'scope' },
      note: '18 questions: rapport + needs + timeline — focused on deliverables and schedule, not closing.',
    },
  ],
  faqs: [
    {
      question: 'What is the best discovery call questions?',
      answer:
        'The best questions match your goal: qualifying asks about fit and budget, scoping asks about deliverables and timeline, closing asks about decision-makers and next steps. This free tool picks the right fixed set for your goal from a curated 29-question bank.',
    },
    {
      question: 'Is there a free discovery call questions?',
      answer:
        'Yes — this generator is completely free with no signup. Choose your service type and call goal to get your grouped question list instantly.',
    },
    {
      question: 'How to use discovery call questions?',
      answer:
        'Pick your service type and your goal for the call. The tool returns a grouped list — start with rapport, then needs, then the money and decision questions. Adapt the wording to your voice; do not read them like a script.',
    },
    {
      question: 'How does a discovery call questions work?',
      answer:
        'It does not generate anything with AI. It filters a fixed 29-question bank by your call goal — qualify (19 questions), scope (18), or close (29) — and fills "{service}" placeholders with your service type. Same inputs always give the same list.',
    },
    {
      question: 'What is a discovery call questions?',
      answer:
        'A discovery call questions is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'How do I create discovery call questions?',
      answer: 'Describe what you need in the input fields, then click generate. You can regenerate as many times as you like and copy the version that fits best.',
    },
    {
      question: 'Can I customize the generated discovery call questions?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
  ],
  assumptions: [
    'Questions come from a fixed 29-question bank — not AI-generated and not personalized beyond the service-type fill.',
    'The question sets reflect common freelancing sales practice; adapt them to your own style and market.',
    'This tool does not record calls, give sales advice, or guarantee outcomes.',
  ],
  jsonLd: [],
};
