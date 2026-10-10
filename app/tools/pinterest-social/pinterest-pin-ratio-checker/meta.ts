import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/pinterest-pin-ratio-checker/';

export const inputs: ToolInput[] = [
  {
    id: 'widthPx',
    label: 'Pin width (pixels)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 1000',
    validation: { min: 1 },
  },
  {
    id: 'heightPx',
    label: 'Pin height (pixels)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 1500',
    validation: { min: 1 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'ratio',
    label: 'Reduced ratio',
    type: 'text',
    description:
    'Free pinterest pin size checker 2026: Your dimensions reduced to W:H form via GCD (e.g. 1000×1500 → 2:3). Get instant results. free now.',
  },
  {
    id: 'closestFormat',
    label: 'Closest pin format',
    type: 'text',
    description:
    'Which best-practice format your size matches: standard 2:3, square 1:1, idea 9:16, long 1:2.1, or off-spec.',
  },
  {
    id: 'verdict',
    label: 'Feed verdict',
    type: 'text',
    description:
    'feed-safe, cropped-in-feed, or low-visibility — how the size is expected to display.',
  },
  {
    id: 'recommendation',
    label: 'Recommendation',
    type: 'text',
    description:
    'What to do about it, including the 2:3 best-practice size when resizing is advised.',
  },
];

export const content: ToolContent = {
  title: 'Pinterest Pin Size Checker',
  description:
    'Check your pin size before you post: enter the width and height in pixels to verify the ideal 2:3 best-practice ratio and feed safety instantly.',
  howTo: [
    'Enter your pin "Pin width (pixels)", e.g. 1000.',
    'Enter your "Pin height (pixels)", e.g. 1500.',
    'Run the tool: it reduces your dimensions via GCD and shows the "Reduced ratio" (e.g. 2:3).',
    'Read the "Closest pin format" and "Feed verdict" to see whether your size is feed-safe, gets cropped, or shows with low visibility.',
    'Follow the "Recommendation" — resize to the 2:3 best-practice size (1000 × 1500 px) if your pin is off-spec.',
  ],
  methodology:
    'Your pixel dimensions are rounded and reduced to a W:H ratio using greatest-common-divisor (GCD) arithmetic. The aspect ratio is then compared against a fixed threshold table: within ±0.04 of 2:3, 1:1, or 9:16 matches that format; taller than 2:3 (down to ~1:2.1) counts as a long pin; anything else is off-spec. Verdicts are feed-safe for 2:3 and 9:16, low-visibility for square 1:1, and cropped-in-feed for long or off-spec sizes. The 2:3 "ideal pin" size is widely documented creator guidance — this tool does not claim Pinterest endorses it and it does not check real pins, only the numbers you enter.',
  examples: [
    {
      title: 'Ideal pin size',
      inputs: { widthPx: 1000, heightPx: 1500 },
      note: 'Reduces to 2:3, matches standard-2:3, verdict feed-safe.',
    },
    {
      title: 'Square image',
      inputs: { widthPx: 1080, heightPx: 1080 },
      note: 'Reduces to 1:1, matches square-1:1, verdict low-visibility — valid but smaller in feeds.',
    },
    {
      title: 'Extremely tall image',
      inputs: { widthPx: 100, heightPx: 1000 },
      note: 'Ratio 1:10 is off-spec — the tool warns it will crop heavily.',
    },
  ],
  faqs: [
    {
      question: 'What is the best pinterest pin size checker?',
      answer:
        'The best pinterest pin size checker tells you whether your image matches the 2:3 best-practice ratio and how it will display in the feed — not just the raw numbers. This free checker reduces your dimensions via GCD, matches them against the 2:3, 1:1, 9:16, and long-pin formats, and gives a feed-safe, cropped-in-feed, or low-visibility verdict.',
    },
    {
      question: 'Is there a free pinterest pin size checker?',
      answer:
        'Yes — this pinterest pin size checker is completely free with no signup. Enter any width and height in pixels and get the reduced ratio, closest format, and feed verdict instantly, as many times as you like.',
    },
    {
      question: 'How to check pinterest pin size?',
      answer:
        'Enter the pin\'s width and height in pixels and run the tool. It reduces them to a W:H ratio (e.g. 1000×1500 → 2:3) and tells you if the size is feed-safe. If it is off-spec, resize to the 2:3 best-practice size of 1000 × 1500 px.',
    },
    {
      question: 'How does a pinterest pin size checker work?',
      answer:
        'It does deterministic math: your dimensions are reduced to their simplest ratio using the greatest common divisor, then the aspect ratio is compared against known best-practice formats (2:3, 1:1, 9:16, 1:2.1). No AI is involved and it does not fetch or inspect your actual Pinterest pins — it only evaluates the numbers you type.',
    },
    {
      question: 'How does the pinterest pin size checker work?',
      answer:
        'Enter your details using the inputs above and the pinterest pin size checker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the pinterest pin size checker free to use?',
      answer:
        'Yes - this pinterest pin size checker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a pinterest pin size checker?',
      answer:
        'A pinterest pin size checker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The 2:3 "ideal pin" size is widely documented creator best practice, not an official Pinterest requirement — the tool never claims platform endorsement.',
    'The tool checks the numbers you enter only; it cannot inspect real pins or your Pinterest account.',
    'Non-integer dimensions are rounded before the ratio is computed, so borderline sizes may match a different format than the unrounded value would.',
  ],
  jsonLd: [
  ],
};
