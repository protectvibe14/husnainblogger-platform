import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-storytime-script-builder/';

const DESCRIPTION =
  'Write viral storytimes with this free storytime script tiktok builder. Add your story beats for a full script with hooks, cues, and pacing. Build yours!';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'storyTitle',
    label: 'Story title',
    type: 'text',
    required: true,
    placeholder: 'e.g. The client who ghosted me (100 characters max)',
  },
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. freelancing, real estate, fitness',
  },
  {
    id: 'setup',
    label: 'Setup — what happened first',
    type: 'text',
    required: true,
    placeholder: 'Set the scene: who, where, what was normal (20+ characters)',
  },
  {
    id: 'conflict',
    label: 'Conflict — what went wrong',
    type: 'text',
    required: true,
    placeholder: 'The problem, the stakes, the tension (20+ characters)',
  },
  {
    id: 'twist',
    label: 'Twist — the surprise (optional)',
    type: 'text',
    required: false,
    placeholder: 'The unexpected turn — leave empty if there is none',
  },
  {
    id: 'resolution',
    label: 'Resolution — how it ended (optional)',
    type: 'text',
    required: false,
    placeholder: 'The payoff or lesson — leave empty to end on a cliffhanger',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'scripts',
    label: 'Storytime scripts',
    type: 'list',
    description:
    'One full script per story: hook, beats with on-screen-text cues, pacing notes, CTA.',
  },
  {
    id: 'narrationEstimates',
    label: 'Narration time estimates',
    type: 'list',
    description:
    'Per-story narration estimate in seconds — an estimate, not a measurement.',
  },
  {
    id: 'pacingSummaries',
    label: 'Pacing timelines',
    type: 'list',
    description:
    'Per-story timestamp chain (hook → beats → CTA) for filming.',
  },
  {
    id: 'seriesNote',
    label: 'Series suggestion',
    type: 'text',
    description:
    'Flags stories over the ~180s target and suggests a multi-part series.',
  },
];

export const content: ToolContent = {
  title: 'Storytime Script TikTok',
  description: DESCRIPTION,
  howTo: [
    'Add one item per story and type the "Story title" plus your niche.',
    'Write the "Setup" (what happened first) and "Conflict" (what went wrong) — at least these two beats are required.',
    'Optionally add a "Twist" and "Resolution"; leave them empty to end on a cliffhanger.',
    'Run the builder to get the full script with a first-3-seconds hook, on-screen-text cues, pacing beats, and a CTA.',
    'Check the narration estimate: stories over ~180 seconds get a multi-part series suggestion instead.',
  ],
  methodology:
    'The tool assembles each script from one fixed template — hook, setup, conflict, optional twist, optional resolution, CTA — with 6 fixed hooks and 6 fixed CTAs selected by a deterministic rotation over your text. Narration time is estimated from word count at ~2.5 words per second and is labeled an estimate. No AI is involved.',
  faqs: [
    {
      question: 'What is the best storytime script tiktok?',
      answer:
        'The best storytime scripts open with a hook in the first 3 seconds, build tension beat by beat, and end with a twist or a clear payoff. This free builder writes that structure for you: paste your story beats and get a full script with on-screen-text cues and pacing notes.',
    },
    {
      question: 'Is there a free storytime script tiktok?',
      answer:
        'Yes — this TikTok storytime script builder is completely free with no signup. Build up to 10 storytime scripts at a time, each with a hook, pacing beats, CTA, and a narration-time estimate.',
    },
    {
      question: 'How to use storytime script tiktok?',
      answer:
        'Add a story item, write at least the setup and conflict beats, and run the builder. Film the hook in the first 3 seconds, follow the on-screen-text cues, pause where the pacing beats tell you, and close with the CTA. If your story is very long, the tool suggests splitting it into a multi-part series.',
    },
    {
      question: 'What is a storytime script tiktok?',
      answer:
        'A storytime script tiktok is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the storytime script tiktok?',
      answer:
        'No account needed. Open the storytime script tiktok, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Scripts are assembled from fixed templates — the hook and CTA are selected from banks of 6, not written by AI.',
    'The narration time is an estimate (~2.5 words/second); your actual speaking pace will differ.',
    'Stories estimated over ~180 seconds are flagged for a multi-part series rather than squeezed into one video.',
  ],
  jsonLd: [],
};
