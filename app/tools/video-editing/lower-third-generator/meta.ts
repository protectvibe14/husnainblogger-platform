import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Jane Doe',
    validation: { max: 60 },
  },
  {
    id: 'title',
    label: 'Title (optional — leave empty for name-only)',
    type: 'text',
    required: false,
    placeholder: 'e.g. Senior Editor',
    validation: { max: 60 },
  },
  {
    id: 'style',
    label: 'Style preset',
    type: 'select',
    required: true,
    options: ['modern-bar', 'classic-slant', 'minimal-line', 'bold-block', 'mono-card'],
  },
  {
    id: 'brandColor',
    label: 'Brand color (hex)',
    type: 'text',
    required: true,
    placeholder: 'e.g. #ff3366',
    validation: { pattern: '^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$' },
  },
  {
    id: 'durationSec',
    label: 'On-screen duration (seconds)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 5',
    validation: { min: 2, max: 10, unit: 'seconds' },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'cssSnippet', label: 'CSS snippet', type: 'copy' },
  { id: 'htmlSnippet', label: 'HTML snippet', type: 'copy' },
  { id: 'timing', label: 'In / hold / out timing', type: 'table' },
  { id: 'safeAreaCheck', label: 'Safe-area and read-time check', type: 'text' },
];

export const content: ToolContent = {
  title: 'Lower Third Generator',
  description:
    'Build broadcast-style lower thirds fast: enter a name and title, pick from 5 professional style presets, and get a polished, ready-to-use graphic spec.',
  howTo: [
    'Enter the name (up to 60 characters) and optionally a title for the lower third.',
    'Pick one of the 5 style presets: modern-bar, classic-slant, minimal-line, bold-block, or mono-card.',
    'Enter your brand color as a hex code (e.g. #ff3366) and set the on-screen duration (2-10 seconds).',
    'Copy the HTML and CSS snippets into your page or overlay tool.',
    'Read the safe-area check: it flags auto-shrunk fonts, width over the 90% action-safe area, and read-time warnings.',
  ],
  methodology:
    'Pure template engine, never AI and never a renderer: the HTML and CSS are generated from 5 fixed style presets with your brand color as the accent. Timing is fixed arithmetic — 500ms fade in, hold = duration minus 1000ms, 500ms fade out. Checks are estimates, labeled as such: names over 22 characters auto-shrink from 44px (minimum 20px) to stay on one line; read time assumes 20 characters per second (a duration shorter than chars/20 warns); width is estimated at 0.55 x font-size per character against 90% of a 1920px canvas.',
  examples: [
    {
      title: 'Interview lower third',
      inputs: { name: 'Jane Doe', title: 'Senior Editor', style: 'modern-bar', brandColor: '#ff3366', durationSec: 5 },
      note: 'Modern bar style with a 5s timing plan (0.5s in, 4s hold, 0.5s out) and clean read-time and width checks.',
    },
    {
      title: 'Name-only card',
      inputs: { name: 'Ada Lovelace', title: '', style: 'mono-card', brandColor: '#1a73e8', durationSec: 3 },
      note: 'Title omitted: the card renders the name only, centered with a brand-color border.',
    },
  ],
  faqs: [
    {
      question: 'What is the best lower third generator?',
      answer:
        'The best one gives you production-ready code, not just a mockup. This free generator builds an HTML + CSS lower third from 5 fixed style presets, applies your brand color, plans in/hold/out timing for 2-10 seconds, and checks width, font fit, and read time.',
    },
    {
      question: 'Is there a free lower third generator?',
      answer:
        'Yes — this generator is completely free with no signup. Enter a name, optional title, style, brand color, and duration to get copy-ready HTML, CSS, and timing instantly.',
    },
    {
      question: 'How to generate lower third?',
      answer:
        'Enter the name (title optional), choose one of the 5 style presets, set your brand hex color and the on-screen duration. The tool outputs HTML and CSS snippets you can paste into your page or overlay tool, plus a timing plan and safety checks.',
    },
    {
      question: 'How does a lower third generator work?',
      answer:
        'A template engine, not AI: it fills fixed HTML/CSS templates with your name, title, and brand color, auto-shrinks the font if the name is long, computes fade-in/hold/fade-out timing from your duration, and estimates whether the text fits the safe area and can be read in time.',
    },
    {
      question: 'What is a lower third generator?',
      answer:
        'A lower third generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'How do I create lower third generator?',
      answer: 'Describe what you need in the input fields, then click generate. You can regenerate as many times as you like and copy the version that fits best.',
    },
    {
      question: 'Can I customize the generated lower third generator?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
  ],
  assumptions: [
    'The output is code for the web (HTML + CSS), not a rendered video file — import it into your page or overlay tool.',
    'Width and read-time checks are arithmetic estimates, not measured renders; unusual fonts will size differently.',
    'Font auto-shrink keeps long names on one line down to 20px; very long names at 20px may still feel small.',
    'No visual preview is generated here — check the result in your own page before broadcasting.',
  ],
  jsonLd: [],
};
