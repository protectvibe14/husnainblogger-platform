import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'role',
    label: 'Assistant role',
    type: 'text',
    required: true,
    placeholder: 'e.g. a friendly math tutor',
  },
  {
    id: 'audience',
    label: 'Audience',
    type: 'text',
    required: true,
    placeholder: 'e.g. high school students',
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: [
      'professional',
      'friendly',
      'casual',
      'formal',
      'playful',
      'direct',
      'empathetic',
      'authoritative',
    ],
  },
  {
    id: 'doList',
    label: 'Do (one per line)',
    type: 'textarea',
    required: false,
    placeholder: 'Explain step by step\nGive practice problems',
  },
  {
    id: 'dontList',
    label: "Don't (one per line)",
    type: 'textarea',
    required: false,
    placeholder: 'Skip steps\nUse unexplained jargon',
  },
  {
    id: 'constraints',
    label: 'Constraints (one per line)',
    type: 'textarea',
    required: false,
    placeholder: 'Keep answers under 200 words',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'systemPrompt',
    label: 'System prompt',
    type: 'copy',
    description:
    'Free system prompt builder 2026: Assembled system prompt block, ready to paste into your AI tool. Get instant results. free now.',
  },
  {
    id: 'itemCount',
    label: 'Rules included',
    type: 'number',
    description:
    'How many Do / Do-not / Constraint items were included.',
  },
];

export const content: ToolContent = {
  title: 'System Prompt Builder',
  description:
    'Assemble a clean system prompt from a fixed template: role, audience, tone, do/don\u2019t lists and constraints. Free builder — copy and paste into any.',
  howTo: [
    'Type the assistant role and the audience it serves.',
    'Pick a tone from the 8 fixed options.',
    'Add Do items, Don\u2019t items and Constraints, one per line (fill at least one list).',
    'Click Build prompt to assemble the structured block.',
    'Copy the result and paste it as the system prompt in your AI tool of choice.',
  ],
  methodology:
    'This tool fills a fixed template — role line, audience line, tone line (from 8 hand-written tone sentences), then Do / Do not / Constraints sections built from your own list items. It runs entirely in your browser and never calls any AI model: the output is assembled text, ready for you to paste elsewhere.',
  examples: [
    {
      title: 'Math tutor',
      inputs: { role: 'a friendly math tutor', audience: 'high school students', tone: 'friendly', doList: 'Explain step by step', dontList: 'Skip steps', constraints: 'Keep answers under 200 words' },
      note: 'Builds a structured block starting "You are a friendly math tutor." with the three rule sections.',
    },
    {
      title: 'Support agent',
      inputs: { role: 'a customer support agent', audience: 'new users of a budgeting app', tone: 'empathetic', doList: 'Acknowledge the problem first', dontList: '', constraints: 'Never share internal ticket numbers' },
      note: 'Builds the block with only Do and Constraints sections since the Don\u2019t list is empty.',
    },
  ],
  faqs: [
    {
      question: 'Does this tool use AI to write the prompt?',
      answer:
        'No. It assembles your own words into a fixed template structure. No AI model reads or rewrites anything here — you write the rules, the tool formats them.',
    },
    {
      question: 'Where do I paste the result?',
      answer:
        'Into the system-prompt / instructions field of the AI tool you use — most chat and agent platforms have one. The block is plain text and works anywhere.',
    },
    {
      question: 'What if I leave a list empty?',
      answer:
        'That section is simply omitted from the output. You only need at least one item across the three lists.',
    },
    {
      question: 'Will this prompt work with any AI tool?',
      answer:
        'The format is plain text and compatible with any tool that accepts a system prompt. How closely the model follows it depends on the model itself.',
    },
    {
      question: 'Is the builder free?',
      answer:
        'Yes — completely free, no signup. It runs in your browser.',
    },
    {
      question: 'How does the system prompt builder work?',
      answer:
        'Enter your details using the inputs above and the system prompt builder calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the system prompt builder free to use?',
      answer:
        'Yes - this system prompt builder is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'Output quality depends on the rules you write — the tool formats text, it does not improve your instructions.',
    'Different AI tools interpret system prompts differently; test the result in the tool you use.',
  ],
  jsonLd: [],
};
