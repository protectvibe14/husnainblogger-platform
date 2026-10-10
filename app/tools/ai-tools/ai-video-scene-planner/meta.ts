import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'videoIdea',
    label: 'Video idea',
    type: 'text',
    required: true,
    placeholder: 'e.g. 5-minute morning routine for busy parents',
  },
  {
    id: 'targetLengthSec',
    label: 'Target length (seconds)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 60',
  },
  {
    id: 'sceneCount',
    label: 'Number of scenes',
    type: 'number',
    required: true,
    placeholder: 'e.g. 4',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'scenes',
    label: 'Scene-by-scene plan',
    type: 'table',
    description:
    'Free ai video scene planner 2026: Scene number, visual prompt, narration line and duration per scene. Get instant results. free now.',
  },
  {
    id: 'totalSec',
    label: 'Total duration (seconds)',
    type: 'number',
    description:
    'Scene durations always sum exactly to this target.',
  },
];

export const content: ToolContent = {
  title: 'Video Scene Planner for AI Video',
  description:
    'Plan AI video scenes step-by-step: enter your idea, target length and scene count for visual prompts, narration lines and exact durations. Free planner.',
  howTo: [
    'Type your video idea (2-200 characters) into the Video idea field.',
    'Enter the target length in seconds (5-600) and the number of scenes (2-12).',
    'Click Plan scenes to build the scene-by-scene table.',
    'Review each scene\u2019s visual prompt, narration line and duration — durations always sum to your target.',
    'Rewrite the narration templates in your own words, then generate scenes in your video tool.',
  ],
  methodology:
    'This tool uses fixed arithmetic and fixed template banks: it divides your target length across scenes (leftover seconds go to the earliest scenes so the total is exact), then cycles through 8 shot-type templates for visual prompts and 8 narration templates with your idea inserted. It runs entirely in your browser — it does not generate video and no AI model is involved.',
  examples: [
    {
      title: 'Short-form creator',
      inputs: { videoIdea: '5-minute morning routine', targetLengthSec: 60, sceneCount: 4 },
      note: 'Builds 4 scenes of 15 seconds each with shot prompts and narration templates mentioning the morning routine.',
    },
    {
      title: 'Product explainer',
      inputs: { videoIdea: 'how our budgeting app works', targetLengthSec: 45, sceneCount: 3 },
      note: 'Builds 3 scenes of 15 seconds each, cycling through establishing, medium and close-up shot templates.',
    },
  ],
  faqs: [
    {
      question: 'Does this tool generate AI video?',
      answer:
        'No. It produces a text plan — scene prompts, narration lines and timings — that you use inside a video generation tool. Nothing here renders video or uses an AI model.',
    },
    {
      question: 'How are scene durations calculated?',
      answer:
        'Your target length is divided evenly across scenes. Any leftover seconds go to the earliest scenes, one per scene, so the durations always sum exactly to your target.',
    },
    {
      question: 'Are the narration lines a finished script?',
      answer:
        'No — they are fixed templates with your idea inserted (e.g. "Open with a hook that introduces your idea"). Rewrite them in your own words for the best result.',
    },
    {
      question: 'What happens with more than 8 scenes?',
      answer:
        'The 8 shot-type and 8 narration templates cycle, so scene 9 reuses the template style of scene 1 with its own duration. The planner supports up to 12 scenes.',
    },
    {
      question: 'Is the planner free?',
      answer:
        'Yes — completely free, no signup. It runs in your browser using fixed templates and simple math.',
    },
    {
      question: 'How does the ai video scene planner work?',
      answer:
        'Enter your details using the inputs above and the ai video scene planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai video scene planner free to use?',
      answer:
        'Yes - this ai video scene planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'Narration lines are template placeholders, not a finished voiceover script — rewrite them before recording or generating audio.',
    'Visual prompts are plain shot descriptions; the actual look depends on the video tool and settings you use.',
    'Target length must be at least the scene count in seconds, so every scene gets 1+ second.',
  ],
  jsonLd: [],
};
