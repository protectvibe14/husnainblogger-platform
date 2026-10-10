import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'imageW',
    label: 'Image width (pixels)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 4000',
    validation: { min: 1, unit: 'px' },
  },
  {
    id: 'imageH',
    label: 'Image height (pixels)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 3000',
    validation: { min: 1, unit: 'px' },
  },
  {
    id: 'videoAspect',
    label: 'Video aspect ratio',
    type: 'select',
    required: true,
    options: ['16:9', '9:16', '1:1'],
  },
  {
    id: 'moveType',
    label: 'Camera move',
    type: 'select',
    required: true,
    options: ['zoom-in', 'zoom-out', 'pan-left', 'pan-right', 'pan-up', 'pan-down'],
  },
  {
    id: 'durationSec',
    label: 'Clip duration (seconds, above 0)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 6',
    validation: { min: 0.1, unit: 's' },
  },
  {
    id: 'zoomStrength',
    label: 'Zoom strength (1.0-2.0, default 1.3)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 1.3',
    validation: { min: 1.0, max: 2.0 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'keyframes', label: 'Keyframe plan (t, x, y, scale)', type: 'copy' },
  { id: 'cropWindows', label: 'Start/end crop windows', type: 'copy' },
  { id: 'safeCheck', label: 'Safety checks and warnings', type: 'list' },
];

export const content: ToolContent = {
  title: 'Ken Burns Effect Planner',
  description:
    'Plan smooth pan-and-zoom moves like a pro: enter your image size and aspect ratio for keyframes, crop windows, and smart upscale safety checks.',
  howTo: [
    'Enter your image width and height in pixels.',
    'Pick the video aspect ratio: 16:9, 9:16, or 1:1.',
    'Choose a camera move: zoom-in, zoom-out, pan-left, pan-right, pan-up, or pan-down.',
    'Set the clip duration in seconds and the zoom strength (1.0-2.0; pans need above 1.0 for room to move).',
    'Copy the keyframe plan (time, center x/y, scale) into your editor\'s keyframes.',
    'Read the safety checks — the tool errors if the image is too small and would upscale.',
  ],
  methodology:
    'Pure geometry math, never AI and never image processing: the tool fits the largest target-aspect crop inside your image, then linearly interpolates the crop center and scale across 11 keyframes. Zooms hold the center; pans move the crop window edge to edge at fixed zoom. The reference frame is 1080p — if the max-zoom crop would be smaller than the frame, the tool errors instead of planning an upscale. Output is coordinates and timings to recreate in your editor, not a rendered video.',
  examples: [
    {
      title: 'Slow zoom-in on a photo',
      inputs: { imageW: 4000, imageH: 3000, videoAspect: '16:9', moveType: 'zoom-in', durationSec: 6, zoomStrength: 1.3 },
      note: 'Center-locked 1.0x to 1.3x zoom — the classic documentary Ken Burns move.',
    },
    {
      title: 'Vertical pan for Shorts',
      inputs: { imageW: 3000, imageH: 4000, videoAspect: '9:16', moveType: 'pan-down', durationSec: 5, zoomStrength: 1.4 },
      note: 'Window travels top to bottom at 1.4x zoom — check the travel distance in the safety notes.',
    },
  ],
  faqs: [
    {
      question: 'What is the best ken burns effect planner?',
      answer:
        'The best one gives you exact numbers. This free planner computes 11 keyframes (time, center x/y in image pixels, scale), start and end crop windows, and safety checks from your image size, aspect, move type, duration, and zoom strength — ready to recreate in any editor.',
    },
    {
      question: 'Is there a free ken burns effect planner?',
      answer:
        'Yes — this planner is completely free with no signup. Enter your image dimensions, pick an aspect (16:9, 9:16, or 1:1) and a camera move, and get the keyframe plan plus upscale safety checks instantly.',
    },
    {
      question: 'How to plan ken burns effect?',
      answer:
        'Know your image size and target aspect first. Choose zoom-in, zoom-out, or a pan direction, set the duration and zoom strength (1.0-2.0), and the planner outputs the exact keyframe times, centers, and scales to dial into your editor. Pans need zoom above 1.0 or there is no room to move.',
    },
    {
      question: 'How does a ken burns effect planner work?',
      answer:
        'It is pure geometry, not AI: the tool fits the largest crop of your target aspect inside the image, then linearly interpolates the crop center and scale across 11 keyframes. If the max-zoom crop would be smaller than a 1080p frame, it errors instead of planning an upscale. The result is coordinates for your editor — no image processing or rendered video involved.',
    },
    {
      question: 'How does the ken burns effect planner work?',
      answer:
        'Enter your details using the inputs above and the ken burns effect planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ken burns effect planner free to use?',
      answer:
        'Yes - this ken burns effect planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a ken burns effect planner?',
      answer:
        'A ken burns effect planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Reference output frame is 1080p (1920x1080, 1080x1920, or 1080x1080 by aspect) — the upscale guard is measured against it.',
    'Pans assume zoom strength above 1.0; at exactly 1.0 the path is static with a warning.',
    'Pan-left/right move the crop window left/right; pan-up/down move it up/down — documented, since naming conventions vary.',
    'Motion is linear between keyframes; your editor\'s own easing applies on top.',
    'The tool never processes your image — output is a coordinate plan only.',
  ],
  jsonLd: [
  ],
};
