import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/facebook-group-name-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'communityTopic',
    label: 'Community topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. sourdough baking, freelance design, home workouts',
    validation: { max: 60 },
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: false,
    options: ['professional', 'casual'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'groupNames',
    label: 'Group name ideas',
    type: 'list',
    description:
    'Free facebook group name ideas 2026: 8 group-name candidates in your chosen tone. free.',
  },
  {
    id: 'copyAll',
    label: 'Copy all names',
    type: 'copy',
    description:
    'All 8 candidates as plain text, ready to shortlist.',
  },
  {
    id: 'toneUsed',
    label: 'Tone used',
    type: 'text',
    description:
    'Which tone bank the names came from.',
  },
  {
    id: 'capNote',
    label: 'Character-limit note',
    type: 'text',
    description:
    'Honest note on the secondary-sourced 75-character limit.',
  },
];

export const content: ToolContent = {
  title: 'Facebook Group Name Ideas',
  description:
    'Name your Facebook group something people want to join: enter your community topic for 8 catchy name options in a professional or casual tone.',
  howTo: [
    'Type your community topic into the "Community topic" field (e.g. sourdough baking).',
    'Pick a "Tone": professional for business/networking groups, casual for hobby and fan groups. Leave blank to default to professional.',
    'Run the tool to get 8 group-name ideas from the matching tone bank.',
    'Read the "Character-limit note" — the ~75-character limit is guidance from secondary sources, so re-check Facebook\u2019s current rule.',
    'Shortlist your favorites with "Copy all names" and search them on Facebook before creating the group.',
  ],
  methodology:
    'This tool assembles names from a fixed bank of 20 hand-written name patterns (10 professional-tone, 10 casual-tone), inserting your community topic. The 8 names per run are picked deterministically from your inputs — no AI is involved. Every candidate is kept within 75 characters as guidance; the output says plainly that Facebook\u2019s group-name limit is secondary-sourced and may change, so it is presented as guidance, not a guarantee.',
  examples: [
    {
      title: 'Professional names for a baking group',
      inputs: { communityTopic: 'sourdough baking', tone: 'professional' },
      note: 'Returns 8 professional-tone names like "Sourdough Baking Professionals".',
    },
    {
      title: 'Casual names for a workout group',
      inputs: { communityTopic: 'home workouts', tone: 'casual' },
      note: 'Returns 8 casual-tone names like "The Home Workouts Club".',
    },
  ],
  faqs: [
    {
      question: 'What is the best facebook group name ideas?',
      answer:
        'The best facebook group name ideas name the topic clearly so the right members find the group in search, and match the group\u2019s tone — professional names attract networking, casual names attract enthusiasts. Keep it short and searchable. This free generator builds 8 candidates per tone from proven patterns.',
    },
    {
      question: 'Is there a free facebook group name ideas?',
      answer:
        'Yes — this facebook group name generator is completely free with no signup. You get 8 name candidates per run in professional or casual tone, as many times as you like.',
    },
    {
      question: 'How to use facebook group name?',
      answer:
        'Enter your community topic, pick professional or casual tone, and run the tool. Then search your shortlisted names on Facebook to make sure none are taken, and re-check the character limit — this tool treats the ~75-character cap as guidance because it comes from secondary sources.',
    },
    {
      question: 'How does a facebook group name ideas work?',
      answer:
        'It inserts your community topic into 20 hand-written name patterns (10 per tone), picking 8 deterministically from your inputs — no AI involved. Each candidate stays within 75 characters, presented as guidance rather than a guaranteed Facebook limit.',
    },
    {
      question: 'How does the facebook group name ideas work?',
      answer:
        'Enter your details using the inputs above and the facebook group name ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the facebook group name ideas free to use?',
      answer:
        'Yes - this facebook group name ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a facebook group name ideas?',
      answer:
        'A facebook group name ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Names come from a fixed bank of 20 patterns (10 per tone) — the tool assembles text; it does not check availability or verify Facebook\u2019s current limits.',
    'The ~75-character group-name limit is secondary-sourced and applied as guidance, not a guarantee — verify in Facebook before publishing.',
    'Adapt the wording to your community\u2019s voice and check the name isn\u2019t already taken on Facebook.',
  ],
  jsonLd: [
  ],
};
