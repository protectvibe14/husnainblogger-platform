import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'easing',
    label: 'Easing curve',
    type: 'select',
    required: true,
    options: ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'custom'],
  },
  {
    id: 'durationMs',
    label: 'Duration (milliseconds, above 0)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 800',
    validation: { min: 1, unit: 'ms' },
  },
  {
    id: 'samples',
    label: 'Curve samples (10-240, default 60)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 60',
    validation: { min: 10, max: 240 },
  },
  {
    id: 'x1',
    label: 'Custom bezier x1 (0-1, only for custom easing)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 0.34',
    validation: { min: 0, max: 1 },
  },
  {
    id: 'y1',
    label: 'Custom bezier y1 (may overshoot, only for custom)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 1.2',
  },
  {
    id: 'x2',
    label: 'Custom bezier x2 (0-1, only for custom easing)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 0.64',
    validation: { min: 0, max: 1 },
  },
  {
    id: 'y2',
    label: 'Custom bezier y2 (may overshoot, only for custom)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 1',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'curvePoints', label: 'Sampled curve points (t, value)', type: 'copy' },
  { id: 'cssEasingString', label: 'CSS easing string', type: 'copy' },
  { id: 'capcutApproximation', label: 'CapCut approximation guidance', type: 'text' },
];

export const content: ToolContent = {
  title: 'Easing Curve Visualizer',
  description:
    'See your easing curves before you animate: sample curves with exact control points, copy the CSS string, and get honest CapCut rebuild guidance.',
  howTo: [
    'Pick an easing curve — linear, ease, ease-in, ease-out, ease-in-out, or custom.',
    'For custom, enter the four cubic-bezier control points (x1 and x2 must stay within 0-1; y values may overshoot).',
    'Set the duration in milliseconds and the number of curve samples (10-240, default 60).',
    'Read the sampled curve points — these feed the on-page curve drawing, a computed preview rather than a rendered animation.',
    'Copy the CSS easing string straight into your stylesheet.',
    'In CapCut, use the approximation guidance — CapCut has limited easing options, so this maps to the nearest standard curve.',
  ],
  methodology:
    'Pure cubic-bezier math, never AI: the tool evaluates the curve with a Newton-Raphson solver (8 iterations, 1e-6 tolerance) plus a bisection fallback, sampling t from 0 to 1 at N points. Named curves use the standard CSS control points. The UI draws the curve from these computed points — a math preview, not a rendered animation. The CapCut note maps your curve to the nearest standard easing with an explicit approximation warning.',
  examples: [
    {
      title: 'Standard ease-out preview',
      inputs: { easing: 'ease-out', durationMs: 800, samples: 60 },
      note: 'Fast start, gentle landing — the classic UI entrance curve.',
    },
    {
      title: 'Custom springy overshoot',
      inputs: { easing: 'custom', durationMs: 900, x1: 0.34, y1: 1.4, x2: 0.64, y2: 1, samples: 60 },
      note: 'y1 above 1 creates overshoot (anticipation) — the tool flags that CapCut cannot reproduce it.',
    },
  ],
  faqs: [
    {
      question: 'What is the best easing curve visualizer?',
      answer:
        'The best one shows the actual math. This free visualizer evaluates your easing curve with a real cubic-bezier solver, samples it at 10-240 points, draws the computed curve, and hands you the exact CSS string — plus honest guidance for recreating the feel in CapCut.',
    },
    {
      question: 'Is there a free easing curve visualizer?',
      answer:
        'Yes — this visualizer is completely free with no signup. Choose a standard curve or enter custom cubic-bezier control points, set a duration and sample count, and get the curve points, the CSS string, and CapCut approximation guidance instantly.',
    },
    {
      question: 'How to visualize easing curve?',
      answer:
        'Pick a curve (or enter custom control points with x1/x2 within 0-1), set the duration and sample count. The tool computes the curve point by point — t from 0 to 1 mapped to eased progress — and the page draws those computed points as the curve you inspect.',
    },
    {
      question: 'How does an easing curve visualizer work?',
      answer:
        'It is pure math, not AI: a Newton-Raphson solver finds where the cubic-bezier curve sits for each time value, producing sampled (t, value) points. Overshoot (y outside 0-1) is flagged as an anticipation effect. CapCut mappings are nearest-standard-curve approximations, labeled as such, since CapCut cannot reproduce arbitrary bezier curves.',
    },
    {
      question: 'How does the easing curve visualizer work?',
      answer:
        'Enter your details using the inputs above and the easing curve visualizer calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the easing curve visualizer free to use?',
      answer:
        'Yes - this easing curve visualizer is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an easing curve visualizer?',
      answer:
        'An easing curve visualizer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Curve points are computed samples (Newton-Raphson, 1e-6 tolerance) — the drawing is a math preview, not a rendered animation.',
    'Custom x1/x2 outside 0-1 are rejected as invalid CSS; y values may overshoot with a warning.',
    'CapCut guidance is a nearest-standard-curve approximation — CapCut cannot reproduce arbitrary beziers or overshoot.',
    'The duration input only contextualizes the curve; the math is duration-independent.',
    'No rendering engine is involved — nothing here plays an actual animation.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Easing Curve Visualizer 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/video-editing/keyframe-easing-visualizer/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'See your easing curves before you animate: sample curves with exact control points, copy the CSS string, and get honest CapCut rebuild guidance.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Video Editing Tools',
          item: 'https://husnainblogger.com/tools/video-editing/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Keyframe Easing Visualizer',
          item: 'https://husnainblogger.com/tools/video-editing/keyframe-easing-visualizer/',
        },
      ],
    },
  ],
};
