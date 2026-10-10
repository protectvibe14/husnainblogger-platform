import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'sceneDescription',
    label: 'Scene description',
    type: 'text',
    required: true,
    placeholder: 'e.g. coffee shop interview, morning light',
  },
  {
    id: 'coverage',
    label: 'Coverage level',
    type: 'select',
    required: true,
    options: ['basic', 'full'],
  },
  {
    id: 'cameraCount',
    label: 'Number of cameras (1-3)',
    type: 'number',
    required: true,
    placeholder: '1',
    validation: { min: 1, max: 3 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'shots', label: 'Shot list', type: 'table' },
  { id: 'shootOrder', label: 'Shoot order', type: 'list' },
  { id: 'warnings', label: 'Warnings', type: 'list' },
];

export const content: ToolContent = {
  title: 'Video Shot List Generator',
  description:
    'Plan any scene shot by shot: pick basic or full coverage plus your camera count for shot sizes, camera angles, and lens ideas in shoot order.',
  howTo: [
    'Describe the scene — e.g. "coffee shop interview, morning light".',
    'Pick basic coverage (6 essential shots) or full coverage (12 shots).',
    'Set your camera count (1-3).',
    'Generate to get shot size, angle, movement, lens idea, and purpose for every shot.',
    'Shoot in the listed setup order to minimize moving the camera.',
  ],
  methodology:
    'Shots come from a fixed 12-entry coverage bank (basic uses the first 6, full uses all 12); your scene description is inserted verbatim into each purpose line. Entries carry a setup group so the shoot order batches shots that share a camera position. It is template-driven, not AI — no model invents shots. Lens values are typical suggestions, not requirements.',
  examples: [
    {
      title: 'Coffee shop interview, 1 camera',
      inputs: { sceneDescription: 'coffee shop interview, morning light', coverage: 'basic', cameraCount: 1 },
      note: '6 essential shots plus a setup-batched shoot order and a single-camera reset warning.',
    },
    {
      title: 'Product demo, 2 cameras, full coverage',
      inputs: { sceneDescription: 'product demo on a desk', coverage: 'full', cameraCount: 2 },
      note: 'All 12 shots with a 2-camera shoot tip; no reset warning.',
    },
  ],
  faqs: [
    {
      question: 'What is the best video shot list generator?',
      answer:
        'The best one covers a scene completely and tells you what order to shoot in. This free generator builds a 6-shot basic or 12-shot full coverage list from a fixed template bank, with lens ideas and a setup-batched shoot order that minimizes camera moves.',
    },
    {
      question: 'Is there a free video shot list generator?',
      answer:
        'Yes — this generator is completely free with no signup. Describe your scene, pick basic or full coverage, set your camera count, and get the full list instantly.',
    },
    {
      question: 'How to generate video shot?',
      answer:
        'Describe the scene, choose basic (6 shots) or full (12 shots) coverage, and set how many cameras you have. The generator returns shot sizes, angles, movement, lens ideas, and purposes — then orders them by camera setup so you film efficiently.',
    },
    {
      question: 'How does a video shot list generator work?',
      answer:
        'It is template-driven, not AI: it fills a fixed 12-entry coverage bank with your scene description, batches the entries by camera setup into a shoot order, and adds warnings for single-camera resets or very short scene descriptions. The same inputs always produce the same list.',
    },
    {
      question: 'How does the video shot list generator work?',
      answer:
        'Enter your details using the inputs above and the video shot list generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the video shot list generator free to use?',
      answer:
        'Yes - this video shot list generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a video shot list generator?',
      answer:
        'A video shot list generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Shots come from a fixed 12-entry bank — not AI-generated coverage.',
    'Lens values are typical suggestions (labeled "typical"), not requirements.',
    'A very short scene description caps full coverage at 8 shots, with a note asking for more detail.',
    'Shoot-time notes are heuristic estimates, not guarantees.',
    'This enumerates general camera coverage; the B-roll-specific version is a separate tool (B-Roll Shot List Generator).',
  ],
  jsonLd: [],
};
