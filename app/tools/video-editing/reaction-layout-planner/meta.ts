import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'canvasAspect',
    label: 'Canvas aspect ratio',
    type: 'select',
    required: true,
    options: ['16:9', '9:16'],
  },
  {
    id: 'facecamSize',
    label: 'Facecam size',
    type: 'select',
    required: true,
    options: ['small', 'medium', 'large'],
  },
  {
    id: 'facecamCorner',
    label: 'Facecam corner',
    type: 'select',
    required: true,
    options: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'facecamRect', label: 'Facecam rectangle (x, y, w, h)', type: 'text' },
  { id: 'contentRect', label: 'Content rectangle (x, y, w, h)', type: 'text' },
  { id: 'safeAreaNotes', label: 'Safe-area notes', type: 'list' },
];

const DESCRIPTION =
  'Lay out reaction videos like a pro: pick your canvas size, facecam size, and corner placement for exact PIP rectangles plus safe-area guidance.';

export const content: ToolContent = {
  title: 'Reaction Video Layout Planner',
  description: DESCRIPTION,
  howTo: [
    'Choose your canvas aspect ratio: 16:9 for YouTube or 9:16 for TikTok, Reels, and Shorts.',
    'Pick a facecam size — small, medium, or large — based on how much the reaction should dominate the frame.',
    'Choose the facecam corner where your picture-in-picture will sit.',
    'Read the facecam rectangle (x, y, width, height in pixels) and place it exactly in your editor.',
    'Follow the safe-area notes so your facecam never hides key action or sits under platform buttons.',
  ],
  methodology:
    'The planner uses fixed geometry on a standard canvas (1920x1080 for 16:9, 1080x1920 for 9:16): facecam width is a fixed fraction of canvas width (small 22%, medium 32%, large 45%) at 16:9 aspect with a 2.5% edge margin. Safe-area notes come from fixed platform-UI rules — for example, right-side facecams on vertical video are flagged because short-form apps put action buttons on the right edge. No AI and no video analysis are involved.',
  examples: [
    {
      title: 'YouTube commentary',
      inputs: { canvasAspect: '16:9', facecamSize: 'medium', facecamCorner: 'top-right' },
      note: 'A medium facecam in the top-right of a 16:9 canvas, with a note about the opposite half for the reacted-to content.',
    },
    {
      title: 'TikTok reaction',
      inputs: { canvasAspect: '9:16', facecamSize: 'small', facecamCorner: 'bottom-left' },
      note: 'A small facecam kept off the right rail and above the caption zone on vertical video.',
    },
  ],
  faqs: [
    {
      question: 'What is the best reaction video layout planner?',
      answer:
        'The best planner gives you exact pixel rectangles plus safe-area warnings, not just a pretty template. This free tool computes the facecam position from fixed geometry and flags platform UI overlaps so your reaction never covers the action.',
    },
    {
      question: 'Is there a free reaction video layout planner?',
      answer:
        'Yes — this reaction video layout planner is completely free with no signup. Enter your canvas, facecam size, and corner, and you get the rectangles and safe-area notes instantly.',
    },
    {
      question: 'How to plan reaction video?',
      answer:
        'Decide your canvas (16:9 for YouTube, 9:16 for shorts), choose how big your facecam should be, and pick a corner that avoids platform buttons. This planner turns those three choices into exact x/y/width/height values you can drop into CapCut, Premiere, or any editor.',
    },
    {
      question: 'How does a reaction video layout planner work?',
      answer:
        'This planner applies fixed layout math: it sizes the facecam as a fraction of a standard canvas, insets it from the edges, and checks the corner against known platform UI zones (like the TikTok right rail). It plans rectangles — it does not analyze or edit your video.',
    },
    {
      question: 'What is a reaction video layout planner?',
      answer:
        'A reaction video layout planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Rectangles are planning estimates on standard canvases (1920x1080, 1080x1920) — measure in your editor before publishing.',
    'Platform UI overlays (TikTok right rail, YouTube end screens) change over time; safe-area notes are guidance, not guarantees.',
    'Facecam sizes and margins are fixed rules (22/32/45% width, 2.5% margin), not measurements of your footage.',
  ],
  jsonLd: [],
};
