import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/facebook-reel-hook-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Your reel topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. budget skincare',
    validation: { max: 60 },
  },
  {
    id: 'count',
    label: 'How many hooks (1–10)',
    type: 'number',
    required: false,
    placeholder: '5',
    validation: { min: 1, max: 10 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'hooks',
    label: 'Reel hooks',
    type: 'list',
    description:
    'Free facebook reels hooks 2026: Hook lines, each 15 words or fewer, written to be spoken in the first 2 seconds. Fast, private now.',
  },
  {
    id: 'framingNote',
    label: '9:16 framing note',
    type: 'text',
    description:
    'Vertical filming guidance for the 1080x1920 Facebook Reels canvas.',
  },
];

export const content: ToolContent = {
  title: 'Facebook Reels Hooks',
  description:
    'Stop the scroll in the first 2 seconds: enter your reel topic for up to 10 punchy spoken hook lines and 9:16 framing tips. Try it now!',
  howTo: [
    'Type your reel topic (up to 60 characters), e.g. "budget skincare".',
    'Choose how many hooks you want (1–10, default 5).',
    'Run the tool to get hook lines written in spoken language, 15 words or fewer.',
    'Pick the hook that fits your style, film vertical 9:16, and say the hook in the first 2 seconds.',
  ],
  methodology:
    'Hooks are assembled from a fixed bank of 16 hand-written hook templates with your topic slotted in — no AI and no generated copy. Your topic is trimmed to its first 4 words so every hook stays within 15 words, and the template order rotates deterministically from a hash of your topic, so the same topic always returns the same hooks.',
  examples: [
    {
      title: 'Skincare creator hooks',
      inputs: { topic: 'budget skincare', count: 5 },
      note: 'Five spoken hooks plus the 9:16 framing note.',
    },
    {
      title: 'Home cook hooks',
      inputs: { topic: 'meal prep', count: 3 },
      note: 'Three short hook lines for a meal-prep reel.',
    },
  ],
  faqs: [
    {
      question: 'What is the best facebook reels hooks?',
      answer:
        'The best Facebook Reels hooks are short spoken lines (under 15 words) that promise a payoff or name a mistake in the first 2 seconds. This free tool gives you 1–10 hook lines per topic, built from proven hook patterns like mistakes, POV reveals, and quick tips.',
    },
    {
      question: 'Is there a free facebook reels hooks?',
      answer:
        'Yes — this Facebook Reels hooks generator is completely free with no signup. Enter any topic and get up to 10 hook lines plus a 9:16 vertical filming note.',
    },
    {
      question: 'How to use facebook reels hooks?',
      answer:
        'Enter your reel topic, pick how many hooks you want, and run the tool. Say the hook you choose on camera in the first 2 seconds of your reel and keep the same promise on screen as text.',
    },
    {
      question: 'How does a facebook reels hooks work?',
      answer:
        'It slots your topic into a fixed bank of 16 proven hook templates (mistakes, tips, POV, before/after) and trims the result to 15 words or fewer. There is no AI — the same topic always returns the same hooks.',
    },
    {
      question: 'What is a facebook reels hooks?',
      answer:
        'A facebook reels hooks is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Can I customize the generated facebook reels hooks?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
    {
      question: 'How do I create facebook reels hooks?',
      answer: 'Describe what you need in the input fields, then click generate. You can regenerate as many times as you like and copy the version that fits best.',
    },
  ],
  assumptions: [
    'Hooks come from fixed templates with your topic filled in — they are starting points, not AI-written scripts. Rewrite them in your own voice before filming.',
    'Reel duration and audio specs are not verified by this tool, so none are claimed here; check Facebook’s current guidance before publishing.',
  ],
  jsonLd: [],
};
