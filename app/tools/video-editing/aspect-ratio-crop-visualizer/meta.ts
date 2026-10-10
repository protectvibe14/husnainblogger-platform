import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'sourceW',
    label: 'Source width (px)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 1920',
  },
  {
    id: 'sourceH',
    label: 'Source height (px)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 1080',
  },
  {
    id: 'targetAspect',
    label: 'Target aspect ratio',
    type: 'select',
    required: true,
    options: ['16:9', '9:16', '1:1', '4:5', 'custom'],
  },
  {
    id: 'targetAspectCustom',
    label: 'Custom aspect (W:H, only if "custom")',
    type: 'text',
    required: false,
    placeholder: 'e.g. 3:4',
  },
  {
    id: 'cropAnchor',
    label: 'Crop anchor',
    type: 'select',
    required: true,
    options: ['center', 'top', 'bottom', 'left', 'right', 'custom'],
  },
  {
    id: 'anchorX',
    label: 'Custom anchor X (0-100%, only if "custom")',
    type: 'number',
    required: false,
    placeholder: '50',
    validation: { min: 0, max: 100 },
  },
  {
    id: 'anchorY',
    label: 'Custom anchor Y (0-100%, only if "custom")',
    type: 'number',
    required: false,
    placeholder: '50',
    validation: { min: 0, max: 100 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'cropRect', label: 'Crop rectangle (x, y, w, h)', type: 'text' },
  { id: 'pixelsLostPct', label: 'Pixels lost (%)', type: 'number' },
  { id: 'safeZones', label: 'Text safe zones', type: 'text' },
  { id: 'svgPreviewParams', label: 'Preview overlay parameters (JSON)', type: 'text' },
  { id: 'mode', label: 'Mode (crop or letterbox)', type: 'text' },
  { id: 'warning', label: 'Warning', type: 'text' },
];

export const content: ToolContent = {
  title: '16:9 to 9:16 Crop Preview',
  description:
    'Preview your 16:9 to 9:16 crop before you cut: get the exact crop rectangle, pixels lost, and text safe zones for any source size and anchor.',
  howTo: [
    'Enter the source video width and height in pixels.',
    'Pick the target aspect ratio (16:9, 9:16, 1:1, 4:5, or a custom W:H like 3:4).',
    'Choose the crop anchor — center, an edge, or a custom X/Y percentage position.',
    'Run the tool to get the crop rectangle, the percentage of pixels lost, and the text safe zones.',
    'Use the preview parameters to draw the overlay in your editor and reframe subjects before cropping.',
  ],
  methodology:
    'Pure rectangle math, no AI and no rendered image: if the target is wider than the source, the tool returns letterbox mode (full frame, pad with bars instead of cropping); otherwise cropW = min(sourceW, sourceH x targetRatio), cropH = min(sourceH, sourceW / targetRatio), positioned by the anchor and clamped inside the frame. pixelsLostPct = (1 - cropArea / sourceArea) x 100. Safe zones mark the center 80% of the crop for text and subtitles. The "visualizer" outputs computed coordinates (svgPreviewParams) that the app draws as an overlay — parameters, not a rendered picture.',
  examples: [
    {
      title: 'Landscape to Shorts',
      inputs: { sourceW: 1920, sourceH: 1080, targetAspect: '9:16', cropAnchor: 'center' },
      note: 'Centered 608x1080 crop; 68.3% of pixels lost with a heavy-crop warning.',
    },
    {
      title: 'Vertical to widescreen',
      inputs: { sourceW: 1080, sourceH: 1920, targetAspect: '16:9', cropAnchor: 'center' },
      note: 'Target is wider than the source — letterbox mode, pad with bars instead of cropping.',
    },
  ],
  faqs: [
    {
      question: 'What is the best 16:9 to 9:16 crop preview?',
      answer:
        'The best one does the math before you cut: the exact crop rectangle, how much of the frame you lose, and where text stays safe. This free previewer computes all three for any source size and anchor position, so you can reframe subjects before committing to the crop.',
    },
    {
      question: 'Is there a free 16:9 to 9:16 crop preview?',
      answer:
        'Yes — this crop preview is completely free with no signup. Enter your source dimensions, pick a target aspect (16:9, 9:16, 1:1, 4:5, or custom), choose a crop anchor, and get the crop rectangle, pixels lost, and safe zones instantly.',
    },
    {
      question: 'How to preview 16 9 to 9 16 crop?',
      answer:
        'Enter the source width and height, select 9:16 as the target, and pick an anchor (center keeps both sides even). The tool returns the crop rectangle coordinates and the percentage of pixels discarded — for 1920x1080 that is a centered 608x1080 crop keeping only about 32% of the pixels.',
    },
    {
      question: 'How does a 16:9 to 9:16 crop preview work?',
      answer:
        'Pure geometry: the tool computes the largest 9:16 rectangle that fits inside your frame, positions it by your anchor, and reports the coordinates plus the discarded pixel percentage. It outputs numbers the app draws as an overlay — it does not render an image itself. When the target is wider than the source, it switches to letterbox mode and tells you to pad with bars.',
    },
    {
      question: 'How does the 16:9 to 9:16 crop preview work?',
      answer:
        'Enter your details using the inputs above and the 16:9 to 9:16 crop preview calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the 16:9 to 9:16 crop preview free to use?',
      answer:
        'Yes - this 16:9 to 9:16 crop preview is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a 16:9 to 9:16 crop preview?',
      answer:
        'A 16:9 to 9:16 crop preview is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The "visualizer" returns computed coordinates, not a rendered image — the overlay preview is drawn from them by the app.',
    'Heavy crops (50%+ pixels lost) carry an explicit warning; reframe subjects toward the crop center.',
    'Safe zones are the conventional center-80% guideline, not a platform guarantee.',
    'Letterbox mode means no crop is possible — pad with bars or use a wider source.',
    'Results are deterministic: the same inputs always produce the same rectangle.',
  ],
  jsonLd: [],
};
