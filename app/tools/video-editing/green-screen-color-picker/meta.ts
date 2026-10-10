import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'mode',
    label: 'Mode',
    type: 'select',
    required: true,
    options: ['suggest', 'analyze'],
  },
  {
    id: 'subjectColors',
    label: "Subject colors (hex, for 'suggest' mode)",
    type: 'textarea',
    required: false,
    placeholder: 'e.g. #c85a3a, #f5f0e8, #2b3a55 — one per line or comma-separated',
  },
  {
    id: 'sampleHex',
    label: "Sample color (hex, for 'analyze' mode)",
    type: 'text',
    required: false,
    placeholder: 'e.g. #00b140',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'recommendedKeyColor', label: 'Recommended key color', type: 'text' },
  { id: 'hsvRange', label: 'HSV tolerance range', type: 'text' },
  { id: 'spillRiskNotes', label: 'Spill-risk notes', type: 'list' },
];

export const content: ToolContent = {
  title: 'Chroma Key Color Picker',
  description:
    "Pick the right green screen color for your shoot: enter your subject's colors for a screen recommendation - or check whether one color keys cleanly.",
  howTo: [
    "Choose 'suggest' to get a screen-color recommendation, or 'analyze' to check one color.",
    "In suggest mode, paste your subject's main colors as hex values (e.g. #c85a3a) — one per line or comma-separated, at least one color.",
    'In analyze mode, enter a single sample hex like #00b140 instead.',
    'Run the picker to get the recommended key color (broadcast green #00B140 or blue #0000FF).',
    "Copy the HSV range (hue ±12°, minimum saturation and value) into your editor's chroma key effect.",
    'Read the spill-risk notes before you light and shoot the screen.',
  ],
  methodology:
    'Pure color math — RGB to HSV conversion and hue-distance comparison; no AI, no pixel processing. Suggest mode recommends broadcast green #00B140 unless any subject color is greenish (hue 75-165°, saturation ≥ 0.25), in which case it recommends broadcast blue #0000FF so green subject areas stay keyable. Tolerance window: chosen hue ±12°, S ≥ 0.45, V ≥ 0.40 as a starting point. Analyze mode measures the sample\'s hue distance to both standards, centers the window on the sample hue, and warns when saturation is under 0.25 (near-gray, hard to key). This tool does not perform chroma keying — real keying needs per-pixel video access and happens in your editor (Premiere, CapCut, DaVinci).',
  examples: [
    {
      title: 'Subject with a green jacket',
      inputs: { mode: 'suggest', subjectColors: '#2e7d32, #c8a06a', sampleHex: '' },
      note: 'Recommends a blue screen because the subject contains green — keying green would punch holes in the jacket.',
    },
    {
      title: 'Analyze a paint sample',
      inputs: { mode: 'analyze', subjectColors: '', sampleHex: '#00b140' },
      note: 'Confirms the sample matches broadcast green with a tuned HSV window centered on its hue.',
    },
  ],
  faqs: [
    {
      question: 'What is the best chroma key color picker?',
      answer:
        'The best one explains its recommendation. This free picker compares your subject\'s colors against broadcast green (#00B140) and blue (#0000FF) using hue math, then returns the recommended screen color, an HSV tolerance range (hue ±12°), and spill-risk notes.',
    },
    {
      question: 'Is there a free chroma key color picker?',
      answer:
        'Yes — this picker is free with no signup. Pick a mode, enter your hex colors, and get the recommended key color plus HSV range instantly.',
    },
    {
      question: 'How to pick chroma key color?',
      answer:
        'List the colors in your subject and costume. If any are green, shoot on blue; otherwise broadcast green (#00B140) is the standard. Then key by hue in your editor — this tool gives you the exact starting hue window (chosen hue ±12°, S ≥ 0.45, V ≥ 0.40).',
    },
    {
      question: 'How does a chroma key color picker work?',
      answer:
        'It converts your hex colors to HSV and measures hue distance to the two standard key colors. It does not key video itself — real chroma keying needs per-pixel access to your footage, which happens in your editor (Premiere, CapCut, DaVinci).',
    },
    {
      question: 'What is a chroma key color picker?',
      answer:
        'A chroma key color picker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Pure color math only — this tool does not perform chroma keying on video; the key itself happens in your editor.',
    'The green-vs-blue decision uses fixed hue bands (greenish = hue 75-165°, saturation ≥ 0.25); edge tones near the band borders may need a judgment call.',
    'The HSV tolerance window (hue ±12°, S ≥ 0.45, V ≥ 0.40) is a starting point — tune it ±4° in your keyer for your lighting.',
    'Near-gray samples (saturation under 0.25) key poorly; the tool warns about this instead of pretending the sample works.',
    'Same colors always produce the same recommendation — the rules are fully deterministic.',
  ],
  jsonLd: [],
};
