import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'action',
    label: 'What should the button do?',
    type: 'text',
    required: true,
    placeholder: 'e.g. free guide',
  },
  {
    id: 'audience',
    label: 'Audience (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. bloggers',
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: false,
    options: ['direct', 'friendly', 'urgent', 'playful'],
  },
  {
    id: 'maxWords',
    label: 'Max words (1-8)',
    type: 'number',
    required: false,
    placeholder: '4',
    validation: { min: 1, max: 8 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'ctaTexts', label: 'Button text options', type: 'table' },
  { id: 'warnings', label: 'Warnings', type: 'list' },
  { id: 'notice', label: 'Notice', type: 'text' },
];

export const content: ToolContent = {
  title: 'Email CTA Generator',
  description:
    'Write CTA buttons people actually click: describe the action, pick from 4 tones, and get verb-first button copy capped at your chosen word count.',
  howTo: [
    'Describe the action your button triggers (e.g. "free guide").',
    'Optionally add your audience and pick a tone: direct, friendly, urgent, or playful.',
    'Set the max word count (default 4, up to 8) for tight button microcopy.',
    'Run the generator to get button text options with word counts.',
    'Watch for the mobile tap-width warning on long labels, then copy your favorite into your email.',
  ],
  methodology:
    'Button copy is assembled from a bundled library of 20 verb-first templates combined with 16 deterministic tone modifiers (4 tones x 4 variants) — no AI, no network. Options that exceed your word limit are filtered out, duplicates are removed, and up to 12 unique CTAs are served in fixed order, so identical inputs always produce identical output. Labels longer than ~24 characters trigger a mobile tap-width warning.',
  examples: [
    {
      title: 'Lead magnet button',
      inputs: { action: 'free guide', tone: 'direct', maxWords: 4 },
      note: 'Short verb-first options like "Get free guide" and "Download free guide now".',
    },
    {
      title: 'Urgent webinar signup',
      inputs: { action: 'webinar seat', audience: 'marketers', tone: 'urgent', maxWords: 6 },
      note: 'Urgent-toned options with deadline-style phrasing, audience included.',
    },
    {
      title: 'Playful trial button',
      inputs: { action: 'free trial', tone: 'playful' },
      note: 'Defaults to 4 words max in the playful tone.',
    },
  ],
  faqs: [
    {
      question: 'What is the best email cta generator?',
      answer:
        'The best one writes verb-first microcopy that fits a button. This free tool builds options from 20 verb-first templates in 4 tones, enforces your word limit, shows word counts, and warns when a label gets too long for comfortable phone tapping.',
    },
    {
      question: 'Is there a free email cta generator?',
      answer:
        'Yes — this one is completely free with no signup. Describe your button action, pick a tone and word limit, and get up to 12 button text options instantly.',
    },
    {
      question: 'How to generate email cta?',
      answer:
        'Start with the action (what happens after the click), choose a tone, and set a word limit — 4 words is the default because short buttons convert better. Copy your favorite option straight into your email builder.',
    },
    {
      question: 'How does an email cta generator work?',
      answer:
        'This one combines your action with bundled verb-first button templates and applies tone modifiers in a fixed, deterministic order — no AI. Every option is checked against your word limit, and long labels get a mobile tap-width warning.',
    },
    {
      question: 'How does the email cta generator work?',
      answer:
        'Enter your details using the inputs above and the email cta generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the email cta generator free to use?',
      answer:
        'Yes - this email cta generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an email cta generator?',
      answer:
        'An email cta generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Template-based generator — runs no AI; options come from 20 bundled templates plus 16 tone modifiers.',
    'Verb-first by design; a 1-word limit fits nothing and returns an honest error.',
    'The ~24-character tap-width warning is a heuristic for small phone screens, not a measured rule.',
    'Word counts use whitespace splitting; emoji count as one character each.',
    'Actions longer than 60 characters are shortened with a visible notice.',
  ],
  jsonLd: [
  ],
};
