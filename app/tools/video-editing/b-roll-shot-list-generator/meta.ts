import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Video topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. making sourdough bread',
  },
  {
    id: 'videoType',
    label: 'Video type',
    type: 'select',
    required: true,
    options: ['tutorial', 'vlog', 'ad', 'documentary'],
  },
  {
    id: 'shotCount',
    label: 'Number of shots',
    type: 'number',
    required: false,
    placeholder: '8',
    validation: { min: 3, max: 30 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'shots', label: 'B-roll shot list', type: 'table' },
  { id: 'coverageChecklist', label: 'Coverage checklist', type: 'list' },
  { id: 'warnings', label: 'Warnings', type: 'list' },
];

export const content: ToolContent = {
  title: 'B-Roll Shot List Ideas',
  description:
    'Never run out of b-roll again: enter your topic and video type for shot ideas with camera angles, movement, and timing. Build yours today!',
  howTo: [
    'Type your video topic — e.g. "making sourdough bread".',
    'Choose the video type: tutorial, vlog, ad, or documentary.',
    'Set how many shots you want (3-30; 8 is the default).',
    'Generate to get each shot with description, angle, movement, and duration.',
    'Use the coverage checklist to spot missing angles before you shoot.',
  ],
  methodology:
    'Shots are assembled from a fixed curated bank (4 video types x 24 shots = 96 entries): your topic is inserted into the description templates and the starting position rotates deterministically from your topic text. It is not AI — no model writes or personalizes anything. Durations and shoot-time notes are heuristic estimates, labeled as such.',
  examples: [
    {
      title: 'Sourdough tutorial, 8 shots',
      inputs: { topic: 'making sourdough bread', videoType: 'tutorial', shotCount: 8 },
      note: '8 shots drawn from the 24-shot tutorial bank, plus a 5-point coverage checklist.',
    },
    {
      title: 'Travel vlog, 12 shots',
      inputs: { topic: 'weekend in the mountains', videoType: 'vlog', shotCount: 12 },
      note: '12 shots from the vlog bank; the checklist flags any uncovered angle type.',
    },
  ],
  faqs: [
    {
      question: 'What is the best b-roll shot list ideas?',
      answer:
        'The best b-roll shot list mixes wide, detail, motion, hands, and POV shots so the edit never feels flat. This free generator builds one from a curated bank of 96 shots across tutorial, vlog, ad, and documentary styles, with a checklist that flags any angle type you missed.',
    },
    {
      question: 'Is there a free b-roll shot list ideas?',
      answer:
        'Yes — this generator is completely free with no signup. Enter your topic, pick a video type, and get 3-30 shot ideas with angles, movement, and timing instantly.',
    },
    {
      question: 'How to use b roll shot?',
      answer:
        'Film each shot on the list as short clips (typically 3-6 seconds), then cut them over your main footage wherever the main shot drags, hides a cut, or needs visual variety. The coverage checklist helps you confirm you filmed every angle type before you leave the location.',
    },
    {
      question: 'How does a b-roll shot list ideas work?',
      answer:
        'It does not use AI. It takes your topic and video type, picks shots from a fixed curated bank of 96 entries (the starting point rotates deterministically from your topic text), and pairs the list with a coverage checklist across five angle categories.',
    },
    {
      question: 'What is a b-roll shot list ideas?',
      answer:
        'A b-roll shot list ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Shots come from a fixed curated bank (4 video types x 24 shots = 96 entries) — not AI-generated ideas.',
    'Shot durations and shoot-time warnings are heuristic estimates, not guarantees.',
    'A vague or very short topic still produces a list, with a warning that the shots are generic.',
    'Requests above 24 shots cycle the bank from the top, flagged with a warning.',
  ],
  jsonLd: [],
};
