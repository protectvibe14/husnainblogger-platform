import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/story-sequence-planner/';

export const inputs: ToolInput[] = [
  {
    id: 'goal',
    label: 'Goal',
    type: 'select',
    required: true,
    options: ['Sell', 'Launch', 'Engage', 'Educate', 'Announce'],
  },
  {
    id: 'storyCount',
    label: 'Number of stories',
    type: 'number',
    required: false,
    placeholder: '5',
    validation: { min: 3, max: 10 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'plan',
    label: 'Sequence plan',
    type: 'table',
    description:
    'Free how to plan instagram stories 2026: Ordered slots with format, draft text, and posting timing. Get instant results. free now.',
  },
  {
    id: 'timingSuggestion',
    label: 'Timing suggestion',
    type: 'text',
    description:
    'Overall posting rhythm for the sequence.',
  },
  {
    id: 'copyAll',
    label: 'Copy full plan',
    type: 'copy',
    description:
    'The whole sequence plan as plain text.',
  },
];

export const content: ToolContent = {
  title: 'How to Plan Instagram Stories',
  description:
    'Learn how to plan instagram stories: pick a goal, get an ordered story sequence with formats, drafts, and timing. Free planner.',
  howTo: [
    'Pick your "Goal": Sell, Launch, Engage, Educate, or Announce.',
    'Choose "Number of stories" for the sequence (3–10, defaults to 5).',
    'Run the tool to get an ordered plan — every slot shows its format, draft text, and posting timing.',
    'Read the "Timing suggestion" for the overall posting rhythm across the day.',
    'Use "Copy full plan", replace the bracketed placeholders like [your offer] with your content, and post the stories yourself in Instagram.',
  ],
  methodology:
    'This tool selects one of 5 fixed goal playbooks (33 hand-written story slots in total) and lays out your chosen number of stories: the first slot is always the hook and the last is always the call-to-action; shorter counts trim middle slots, longer counts add engagement-booster slots before the CTA. Drafts ship with bracketed placeholders for you to fill in, and timing labels are generic best-practice suggestions. Nothing is written by AI, and nothing is published to Instagram.',
  examples: [
    {
      title: 'Sell in 5 stories',
      inputs: { goal: 'Sell', storyCount: 5 },
      note: 'A compact selling arc: hook, problem, solution, offer, last-call CTA.',
    },
    {
      title: 'Launch in 8 stories',
      inputs: { goal: 'Launch', storyCount: 8 },
      note: 'Full launch playbook plus one engagement booster before the CTA.',
    },
    {
      title: 'Engage, default length',
      inputs: { goal: 'Engage' },
      note: 'Omitting the count gives you the default 5-story engagement sequence.',
    },
  ],
  faqs: [
    {
      question: 'What is the best how to plan instagram stories?',
      answer:
        'The best way to plan instagram stories is to pick one goal per sequence and order your stories as an arc: hook first, value or proof in the middle, call-to-action last. This planner does that for you — choose Sell, Launch, Engage, Educate, or Announce and get an ordered slot-by-slot plan.',
    },
    {
      question: 'Is there a free how to plan instagram stories?',
      answer:
        'Yes — this instagram story sequence planner is completely free with no signup. You can plan sequences of 3 to 10 stories for any of the 5 goals, and run it again for every campaign.',
    },
    {
      question: 'How to use how to plan instagram stories?',
      answer:
        'Pick a goal and how many stories you want (3–10), then run the tool. Copy the plan, replace the bracketed placeholders like [your offer] with your own content, and post the stories in order in the Instagram app following the timing suggestions.',
    },
    {
      question: 'How does a how to plan instagram stories work?',
      answer:
        'You choose a goal, and the tool lays out a fixed, hand-written playbook for that goal into your chosen number of slots — always opening with a hook and closing with a call-to-action, with format, draft text, and timing per slot. It only produces the plan; you publish the stories yourself.',
    },
    {
      question: 'How does the how to plan instagram stories work?',
      answer:
        'Enter your details using the inputs above and the how to plan instagram stories calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the how to plan instagram stories free to use?',
      answer:
        'Yes - this how to plan instagram stories is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a how to plan instagram stories?',
      answer:
        'A how to plan instagram stories is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Sequences come from 5 fixed goal playbooks (33 hand-written slots) — not AI generation.',
    'Drafts contain bracketed placeholders like [your offer]; they are meant to be filled in, not posted as-is.',
    'Timing suggestions are generic best-practice labels, not personalized to your audience analytics.',
    'This planner does not publish anything to Instagram — it only produces the plan.',
  ],
  jsonLd: [
  ],
};
