import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Space topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. ai voice agents',
    validation: { max: 120 },
  },
  {
    id: 'guests',
    label: 'Guest names (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. Sam Lee, Jane Doe',
    validation: { max: 120 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'spaceTitles',
    label: 'Spaces title ideas',
    type: 'list',
    description:
    'Free twitter spaces title ideas 2026: 8 concise, curiosity-led title ideas for your X Space. free.',
  },
];

export const content: ToolContent = {
  title: 'Twitter Spaces Title Ideas',
  description:
    'Fill your X Space with live listeners: enter your topic and guest names for 8 curiosity-led Spaces titles that fill seats and get people tapping in today.',
  howTo: [
    'Type your Space topic in the Space topic field (for example, "ai voice agents").',
    'Optionally add guest names in the Guest names field — they rotate into some titles.',
    'Click run to generate 8 curiosity-led title ideas.',
    'Pick the title that best matches your Space\'s angle and audience.',
    'Paste it as your Space title when you schedule or start the Space.',
  ],
  methodology:
    'This tool is a template library, not AI: it assembles 8 titles from 12 hand-written, curiosity-led templates, filling in your topic (and guests on alternating titles). A deterministic hash of your inputs rotates the starting template, so the same inputs always return the same 8 titles. Honesty note: no verified X Spaces title character limit was found, so no hard cap is enforced — titles instead follow a ≤70-character guidance, and long topics are shortened with an ellipsis to fit.',
  examples: [
    {
      title: 'Solo host planning a Space',
      inputs: { topic: 'ai voice agents' },
      note: 'Gets 8 curiosity-led titles like "The Truth About AI Voice Agents Nobody Tells You".',
    },
    {
      title: 'Panel Space with guests',
      inputs: { topic: 'crypto', guests: 'Jane Doe' },
      note: 'Alternating titles include the guest, e.g. "Crypto Hot Takes: Unfiltered Debate with Jane Doe".',
    },
  ],
  faqs: [
    {
      question: 'What is the best twitter spaces title ideas?',
      answer:
        'The best titles create curiosity in a few words — a promise, a question, or a hot take. This tool generates 8 such titles from your topic using proven curiosity-led templates, so you can pick one instead of staring at a blank field.',
    },
    {
      question: 'Is there a free twitter spaces title ideas?',
      answer:
        'Yes — this Twitter Spaces Title Ideas tool is completely free with no signup. Enter your topic, optionally add guests, and get 8 title ideas instantly.',
    },
    {
      question: 'How to use twitter spaces title?',
      answer:
        'When you schedule or start a Space on X, paste your chosen title into the title field — it is the first thing potential listeners see. Pick the idea that promises the clearest payoff for joining live.',
    },
    {
      question: 'How does a twitter spaces title ideas work?',
      answer:
        'You enter a topic and optional guests; the tool fills 12 hand-written templates with your words and keeps each title within a 70-character guidance. Nothing is AI-generated — the same inputs always return the same 8 titles.',
    },
    {
      question: 'What is a twitter spaces title ideas?',
      answer:
        'A twitter spaces title ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Titles come from a fixed library of 12 templates — not AI, not personalized to your audience.',
    'No verified X Spaces title character limit was found; the 70-character guidance is ours, not a platform rule.',
    'Same topic + guests always returns the same 8 titles; try different wording for variety.',
  ],
  jsonLd: [],
};
