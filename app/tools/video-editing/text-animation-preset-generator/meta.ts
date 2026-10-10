import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'effect',
    label: 'Animation effect',
    type: 'select',
    required: true,
    options: ['typewriter', 'pop-in', 'slide-up', 'karaoke-highlight', 'glitch'],
  },
  {
    id: 'durationMs',
    label: 'Duration (milliseconds, 100-5000)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 800',
    validation: { min: 100, max: 5000, unit: 'ms' },
  },
  {
    id: 'easing',
    label: 'Easing',
    type: 'select',
    required: true,
    options: ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'],
  },
  {
    id: 'colorScheme',
    label: 'Color scheme',
    type: 'select',
    required: false,
    options: ['white-on-black', 'yellow-highlight', 'neon-cyan', 'gradient-purple', 'red-accent'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'cssKeyframes', label: 'CSS keyframes (copy-paste)', type: 'copy' },
  { id: 'capcutSteps', label: 'CapCut rebuild steps', type: 'list' },
  { id: 'previewParams', label: 'Preset summary', type: 'text' },
];

export const content: ToolContent = {
  title: 'Text Animation Generator CSS',
  description:
    'Animate text without the guesswork: get copy-paste CSS text animations plus CapCut rebuild steps - 5 effects, easing curves, and color palettes.',
  howTo: [
    'Pick an animation effect: typewriter, pop-in, slide-up, karaoke-highlight, or glitch.',
    'Set the duration in milliseconds (100-5000) and choose an easing curve.',
    'Choose a color scheme, or leave it on white-on-black.',
    'Copy the generated CSS keyframes into your project or web editor.',
    'In CapCut, follow the manual rebuild steps — CapCut cannot import CSS, so these steps recreate the look by hand.',
    'Preview the result on a phone at full screen before publishing.',
  ],
  methodology:
    'Template engine, never AI: the tool assembles a fixed CSS keyframes preset from documented banks (5 effects, 5 easings, 5 color schemes) parameterized by your duration, easing, and colors. CapCut steps are fixed human instructions per effect — honest manual recreation, since CapCut has no CSS import. Durations under 400ms raise a readability warning; karaoke-highlight falls back to an even highlight sweep because true karaoke needs per-word audio timing.',
  examples: [
    {
      title: 'Pop-in title card',
      inputs: { effect: 'pop-in', durationMs: 800, easing: 'ease-out', colorScheme: 'white-on-black' },
      note: 'Springy pop-in at 800ms — copy the CSS for web, or rebuild the scale keyframes in CapCut.',
    },
    {
      title: 'Typewriter intro line',
      inputs: { effect: 'typewriter', durationMs: 2400, easing: 'linear', colorScheme: 'neon-cyan' },
      note: 'Set steps() to your exact character count for a clean letter-by-letter reveal.',
    },
    {
      title: 'Karaoke-style caption',
      inputs: { effect: 'karaoke-highlight', durationMs: 3000, easing: 'ease', colorScheme: 'yellow-highlight' },
      note: 'Even highlight sweep fallback — split words into separate CapCut layers for exact audio sync.',
    },
  ],
  faqs: [
    {
      question: 'What is the best text animation generator css?',
      answer:
        'The best one gives you usable output, not just a preview. This free generator produces copy-paste CSS keyframes for five effects (typewriter, pop-in, slide-up, karaoke-highlight, glitch) with your duration, easing, and colors — plus honest step-by-step CapCut instructions, since CapCut cannot import CSS.',
    },
    {
      question: 'Is there a free text animation generator css?',
      answer:
        'Yes — this generator is completely free with no signup. Pick an effect, duration (100-5000ms), easing, and color scheme to get the CSS keyframes, CapCut rebuild steps, and a preset summary instantly.',
    },
    {
      question: 'How to generate text animation generator css?',
      answer:
        'Choose one of the five effects, set the duration in milliseconds, pick an easing curve and a color scheme. The tool assembles the @keyframes block and the matching CSS class from a fixed template — then adjust details like steps() in the typewriter effect to your character count.',
    },
    {
      question: 'How does a text animation generator css work?',
      answer:
        'It is a template engine, not AI: your inputs parameterize a fixed CSS preset from documented banks (5 effects, 5 easings, 5 color schemes). The same inputs always produce the same code. Durations under 400ms trigger a readability warning, and the karaoke effect falls back to an even highlight sweep because true karaoke needs per-word audio timing.',
    },
    {
      question: 'How does the text animation generator css work?',
      answer:
        'Enter your details using the inputs above and the text animation generator css calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the text animation generator css free to use?',
      answer:
        'Yes - this text animation generator css is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a text animation generator css?',
      answer:
        'A text animation generator css is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Output is a template assembly from fixed banks (5 effects, 5 easings, 5 color schemes) — no AI involved.',
    'CapCut steps are manual rebuild instructions; CapCut cannot import CSS keyframes.',
    'The karaoke-highlight preset is an even highlight sweep, not true word-by-word karaoke sync.',
    'Durations under 400ms raise a readability warning but still generate.',
    'Preview timing assumes a standard 60fps display; actual rendering depends on the browser or editor.',
  ],
  jsonLd: [
  ],
};
