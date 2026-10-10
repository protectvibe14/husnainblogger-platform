import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'videoTopic',
    label: 'Video topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. sourdough starter, budget travel tips',
    validation: { max: 200 },
  },
  {
    id: 'nextVideoTopic',
    label: 'Next video topic (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. no-knead bread recipe — used for the bridge line',
    validation: { max: 200 },
  },
  {
    id: 'pattern',
    label: 'Ending pattern',
    type: 'select',
    required: true,
    options: ['loop-back', 'next-video-bridge', 'open-loop', 'end-screen-runway'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'scriptBeats', label: 'Ending script beats', type: 'list' },
  { id: 'timingNote', label: 'Timing note', type: 'text' },
  { id: 'runwayRule', label: 'End-screen runway rule', type: 'text' },
];

const DESCRIPTION =
  'Get YouTube end screen ideas with this free tool — build a 60–120 second ending with timed script beats and a clear end-screen runway. Plan your ending now!';

export const content: ToolContent = {
  title: 'YouTube End Screen Ideas',
  description: DESCRIPTION,
  howTo: [
    'Enter your video topic in the Video topic field.',
    'Optionally enter your next video topic — it fills the bridge line that hands viewers to the next video.',
    'Pick an ending pattern: loop-back to the hook, next-video bridge, open loop, or end-screen runway.',
    'Run the tool to get five timed script beats for your final 60–120 seconds.',
    'Follow the runway rule: keep the last 5–20 seconds visually clear so your end-screen cards are clickable.',
  ],
  methodology:
    'The tool assembles endings from a fixed bank: 4 patterns × 5 template beats each (20 beats total) using your topic and next-video topic. Every beat carries a timing label (10s, 15s, 20s) and every pattern ships with a fixed timing note. The runway rule is fixed guidance — keep the final 5–20 seconds clear for end-screen cards. No AI and no retention statistics: the tool makes no numerical claims about retention gains.',
  examples: [
    {
      title: 'Bridge to the next video',
      inputs: { videoTopic: 'sourdough starter', nextVideoTopic: 'no-knead bread recipe', pattern: 'next-video-bridge' },
      note: 'A clean wrap-up with a bridge line that hands viewers to the no-knead recipe.',
    },
    {
      title: 'Open loop ending',
      inputs: { videoTopic: 'meal prep', pattern: 'open-loop' },
      note: 'Plants an unanswered question; the generic fallback names the next video when you skip the optional topic.',
    },
  ],
  faqs: [
    {
      question: 'what is the best youtube end screen ideas?',
      answer:
        'The strongest endings hand viewers somewhere: loop back to your intro hook for payoff, bridge directly to a related video, or plant an open loop that only the next video resolves. This free tool builds all four patterns as timed script beats for your final 60–120 seconds.',
    },
    {
      question: 'is there a free youtube end screen ideas?',
      answer:
        'Yes — this end-screen planner is completely free with no signup. Pick a pattern and get five timed script beats plus the 5–20 second clear-window runway rule for your end-screen cards.',
    },
    {
      question: 'how to use youtube end screen?',
      answer:
        'Add end-screen elements (video or playlist cards plus a subscribe button) in YouTube Studio, and keep the last 5–20 seconds of your video visually clear so they are clickable. Use this tool to script that ending: pick a pattern, follow the beats, and go quiet while the cards show.',
    },
    {
      question: 'how does a youtube end screen ideas work?',
      answer:
        'This tool takes your video topic and an optional next-video topic, then fills a fixed 5-beat template for your chosen pattern — loop-back, next-video bridge, open loop, or end-screen runway. Every beat has a timing label, and the runway rule reminds you to keep the final 5–20 seconds clear. It is template assembly, not AI, and it promises no retention numbers.',
    },
    {
      question: 'What is a youtube end screen ideas?',
      answer:
        'A youtube end screen ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Fixed template bank: 4 patterns × 5 beats each. The beats are generic by design — adapt the wording to your voice.',
    'No retention statistics are promised. The patterns follow common creator practice; results depend on your content.',
    'The 5–20 second clear window matches YouTube end-screen element timing; YouTube may change its interface.',
    'If you skip the next-video topic, a generic fallback phrase ("the next video in this series") fills bridge lines.',
  ],
  jsonLd: [],
};
