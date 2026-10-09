import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'durationSec',
    label: 'Video duration (seconds)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 120',
  },
  {
    id: 'timestampSec',
    label: 'Timestamp to capture (seconds)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 12.5',
  },
  {
    id: 'sourceWidth',
    label: 'Source video width (px)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 1920',
  },
  {
    id: 'sourceHeight',
    label: 'Source video height (px)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 1080',
  },
  {
    id: 'outputSize',
    label: 'Output size',
    type: 'select',
    required: true,
    options: ['original', '1080p', '720p'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'actualTimestampSec', label: 'Actual capture timestamp (s)', type: 'number' },
  { id: 'outputDimensions', label: 'Target frame dimensions (px)', type: 'text' },
  { id: 'extractionSettings', label: 'Frame-extraction settings', type: 'text' },
  { id: 'warning', label: 'Warning', type: 'text' },
];

export const content: ToolContent = {
  title: 'Extract Frame From Video',
  description:
    "Grab the perfect video frame every time: validate any timestamp against your video's duration, then get the exact capture specs for the shot.",
  howTo: [
    'Enter the video duration in seconds and the timestamp where the frame should be captured.',
    'Enter the source video width and height in pixels (e.g. 1920 x 1080).',
    'Pick the output size: original, 1080p, or 720p.',
    'Run the tool to get the validated capture timestamp, target dimensions, and extraction settings.',
    'Use the settings in the app: it seeks the <video> to the timestamp and draws the frame to a canvas.',
  ],
  methodology:
    'Timestamp clamping + dimension scaling math only (no AI, no video decoding here): a timestamp past the duration is clamped to the last frame (the duration in seconds) with a warning, and the reported timestamp is always the actual one. "original" keeps source pixels; 1080p fits the frame inside 1920x1080 and 720p inside 1280x720, preserving aspect ratio, never upscaling, and rounding down to even integers for encoder safety. Pure logic cannot decode video — the actual frame grab runs in your browser via <video> + canvas, fully client-side with no upload.',
  examples: [
    {
      title: 'Thumbnail from a 2-minute video',
      inputs: { durationSec: 120, timestampSec: 12.5, sourceWidth: 1920, sourceHeight: 1080, outputSize: '1080p' },
      note: 'Timestamp is valid — 12.5s captured at 1920 x 1080, no warning.',
    },
    {
      title: 'Timestamp past the end',
      inputs: { durationSec: 60, timestampSec: 999, sourceWidth: 1280, sourceHeight: 720, outputSize: '720p' },
      note: 'Clamped to the 60s last frame with an explicit warning.',
    },
  ],
  faqs: [
    {
      question: 'What is the best extract frame from video?',
      answer:
        'The best approach keeps everything on your device: a browser seeks the video to your timestamp and draws the frame to a canvas — no upload, no server. This free tool computes the honest math behind that: it validates and clamps the timestamp and scales the output dimensions so the capture step is exact.',
    },
    {
      question: 'Is there a free extract frame from video?',
      answer:
        'Yes — this tool is completely free with no signup. Enter the duration, timestamp, source resolution, and output size to get the validated capture timestamp, target dimensions, and the extraction settings the browser capture step uses.',
    },
    {
      question: 'How to use extract frame from video?',
      answer:
        'Enter the video duration and the timestamp in seconds, the source resolution (e.g. 1920 x 1080), and pick original, 1080p, or 720p. The tool returns the actual capture timestamp (clamped if you went past the end), the target dimensions, and the settings the in-browser capture step follows.',
    },
    {
      question: 'How does an extract frame from video work?',
      answer:
        'Two layers: pure math validates the timestamp (clamping past-the-end requests to the last frame) and scales the frame to the target size while preserving aspect ratio; then the app seeks an HTML <video> to that timestamp and draws the frame to a canvas. No decoding or image output happens in the math layer — and nothing is ever uploaded.',
    },
    {
      question: 'How does the extract frame from video work?',
      answer:
        'Enter your details using the inputs above and the extract frame from video calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the extract frame from video free to use?',
      answer:
        'Yes - this extract frame from video is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an extract frame from video?',
      answer:
        'An extract frame from video is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Pure logic cannot decode video or produce an image — the actual frame grab needs <video> + canvas in the browser.',
    'Timestamps past the duration are clamped to the last frame with a warning, never silently dropped.',
    'Output sizes never upscale: a source smaller than the target box keeps its own dimensions.',
    'Dimensions are rounded down to even integers (encoder-safe); tiny rounding differences are normal.',
    'DRM-protected or unplayable files cannot be captured by the browser step — the math still validates.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Extract Frame From Video 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/video-editing/video-frame-grabber/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    "Grab the perfect video frame every time: validate any timestamp against your video's duration, then get the exact capture specs for the shot.",
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'CapCut & Video Editing',
          item: 'https://husnainblogger.com/tools/video-editing/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Video Frame Grabber',
          item: 'https://husnainblogger.com/tools/video-editing/video-frame-grabber/',
        },
      ],
    },
  ],
};
