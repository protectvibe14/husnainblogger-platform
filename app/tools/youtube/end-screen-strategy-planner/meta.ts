import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'videoDuration',
    label: 'Video duration (seconds)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 480',
    validation: { min: 25, max: 86400 },
  },
  {
    id: 'goal',
    label: 'Goal for the end screen',
    type: 'select',
    required: true,
    options: ['subs', 'watch-time', 'external-link'],
  },
  {
    id: 'madeForKids',
    label: 'Video is marked made-for-kids',
    type: 'boolean',
    required: false,
  },
];

export const outputs: ToolOutput[] = [
  { id: 'layout', label: 'Element layout recommendation', type: 'list' },
  { id: 'timing', label: 'Timing plan', type: 'text' },
  { id: 'eligibility', label: 'Eligibility check', type: 'text' },
  { id: 'runwaySeconds', label: 'End-screen runway (seconds)', type: 'number' },
];

const DESCRIPTION =
  'Plan your final 20 seconds with this free youtube end screen planner — goal-based layouts, timestamps, and eligibility checks for 25s+ videos. Start now.';

export const content: ToolContent = {
  title: 'Youtube End Screen Planner',
  description: DESCRIPTION,
  howTo: [
    'Enter your video duration in seconds (must be at least 25).',
    'Pick your goal: subs, watch-time, or external-link.',
    'Tick made-for-kids if your video carries that audience setting.',
    'Generate — you get a staggered element layout, exact timestamps, and an eligibility verdict.',
    'Apply the plan in YouTube Studio under Content → Editor → End screen.',
  ],
  methodology:
    'The planner encodes YouTube\'s published end-screen rules: minimum 25-second video, up to 4 elements on 16:9, and elements shown during the last 5–20 seconds. It selects a fixed 3-element set per goal (subscribe/video/playlist/link) and staggers the elements evenly across the final 20 seconds with m:ss timestamps. Videos marked made-for-kids get an "unavailable" verdict instead of a plan, since YouTube disables end screens on that content. The tool only plans — you apply it in YouTube Studio.',
  examples: [
    {
      title: '8-minute video for subscribers',
      inputs: { videoDuration: 480, goal: 'subs', madeForKids: false },
      note: 'Subscribe button, recommended video, and playlist staggered across the final 20 seconds.',
    },
    {
      title: '5-minute series episode for watch time',
      inputs: { videoDuration: 300, goal: 'watch-time', madeForKids: false },
      note: 'Playlist and next-episode elements lead, with the subscribe button last.',
    },
    {
      title: 'Short video that is too short',
      inputs: { videoDuration: 20, goal: 'subs', madeForKids: false },
      note: 'Returns an error: end screens are unavailable under 25 seconds.',
    },
  ],
  faqs: [
    {
      question: 'What is the best youtube end screen planner?',
      answer:
        'The useful kind turns your video length and goal into a concrete layout — which elements, where, and at what timestamps — while checking eligibility first. This free planner does that with YouTube\'s published rules: 25-second minimum, up to 4 elements, last 5–20 seconds.',
    },
    {
      question: 'Is there a free youtube end screen planner?',
      answer:
        'Yes — this planner is completely free with no signup. Enter your duration and goal to get a staggered element layout, exact timestamps, and an eligibility verdict you can apply in YouTube Studio.',
    },
    {
      question: 'How to plan youtube end screen?',
      answer:
        'Confirm your video is at least 25 seconds, choose a goal (subs, watch time, or link clicks), and place up to 4 elements in the final 20 seconds — subscribe and related videos work best. This tool generates the layout and timestamps for you.',
    },
    {
      question: 'How does a youtube end screen planner work?',
      answer:
        'This one encodes YouTube\'s end-screen rules and maps your goal to a fixed element set, then staggers the elements across the final 20 seconds with timestamps. It is a rule-based planner, not AI, and you apply the finished plan inside YouTube Studio.',
    },
    {
      question: 'How does the youtube end screen planner work?',
      answer:
        'Enter your details using the inputs above and the youtube end screen planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube end screen planner free to use?',
      answer:
        'Yes - this youtube end screen planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube end screen planner?',
      answer:
        'A youtube end screen planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Rules encoded here (25s minimum, 4 elements, 5–20s window, made-for-kids exclusion) reflect YouTube\'s published guidance as of 2026 — YouTube can change them; verify in YouTube Studio.',
    'The tool plans only; applying elements happens in YouTube Studio under Content → Editor → End screen.',
    'Element placement suggestions assume a standard 16:9 video.',
  ],
  jsonLd: [],
};
