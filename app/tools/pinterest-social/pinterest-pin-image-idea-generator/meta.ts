import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/pinterest-pin-image-idea-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'pinTopic',
    label: 'Pin topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. small balcony garden, 5-minute pasta',
  },
  {
    id: 'pinFormat',
    label: 'Pin format',
    type: 'select',
    required: false,
    options: ['standard', 'idea', 'video'],
  },
  {
    id: 'count',
    label: 'Number of briefs',
    type: 'number',
    required: false,
    placeholder: '5',
    validation: { min: 1, max: 10 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'imageBriefs',
    label: 'Pin image briefs',
    type: 'list',
    description:
    'Free pinterest pin design ideas 2026: Written creative briefs: title, composition, text overlay, color direction, and format. Fast, private.',
  },
];

export const content: ToolContent = {
  title: 'Pinterest Pin Design Ideas',
  description:
    'Design pins before you even open Canva: get detailed text briefs with titles, composition, overlay text, and color direction for any pin format.',
  howTo: [
    'Type a concrete pin topic into the "Pin topic" field (e.g. small balcony garden — not just "gardening").',
    'Choose the "Pin format": standard, idea, or video (video briefs add first-frame guidance).',
    'Set "Number of briefs" between 1 and 10 (default 5) and run the tool.',
    'Copy a brief from "Pin image briefs" and build it in your design tool — each lists title, composition, overlay text, color direction, and ratio.',
    'Keep overlay text to a few words and export at the brief\'s ratio (2:3 for standard, 9:16 for idea/video).',
  ],
  methodology:
    'This tool assembles written creative briefs from a fixed bank of 42 hand-written brief components (10 titles, 10 compositions, 10 text overlays, 8 color directions, 4 first-frame notes) — no AI is involved. It outputs TEXT briefs only (concept direction), never rendered images, and makes no image-generation claim. Ratios are fixed per format (standard 2:3; idea and video 9:16), and overlay suggestions are capped at 8 words with the topic counting as one.',
  examples: [
    {
      title: 'Standard pin briefs for a garden topic',
      inputs: { pinTopic: 'small balcony garden', pinFormat: 'standard', count: 3 },
      note: 'Returns 3 text briefs at 2:3 with title, composition, overlay, and color direction.',
    },
    {
      title: 'Video pin briefs with first-frame guidance',
      inputs: { pinTopic: '5-minute pasta', pinFormat: 'video', count: 2 },
      note: 'Returns 2 briefs at 9:16, each including a first-frame hook note.',
    },
    {
      title: 'Idea pin briefs for meal prep',
      inputs: { pinTopic: 'meal prep', pinFormat: 'idea', count: 5 },
      note: 'Returns 5 briefs at 9:16 without first-frame notes.',
    },
  ],
  faqs: [
    {
      question: 'What is the best pinterest pin design ideas?',
      answer:
        'The best Pinterest pin designs pair a bold, short title with a clear focal image, high contrast, and the right ratio (2:3 for standard pins, 9:16 for idea and video pins). This free generator gives you up to 10 written design briefs per topic covering title, composition, overlay text, and color direction.',
    },
    {
      question: 'Is there a free pinterest pin design ideas?',
      answer:
        'Yes — this Pinterest pin design idea generator is completely free with no signup. Generate up to 10 text briefs per run for standard, idea, or video pins, as many times as you like.',
    },
    {
      question: 'How to use pinterest pin design?',
      answer:
        'Enter a concrete pin topic, pick the pin format, and choose how many briefs you want. Copy a brief and recreate it in a design tool like Canva, keeping the suggested ratio and the short overlay text.',
    },
    {
      question: 'How does a pinterest pin design ideas work?',
      answer:
        'It takes your topic and format, then fills fixed brief templates from a 42-component bank — cycling in order so results are deterministic. It outputs TEXT briefs only (concept direction), never rendered images; no AI image generation is involved.',
    },
    {
      question: 'What is a pinterest pin design ideas?',
      answer:
        'A pinterest pin design ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Output is written creative briefs only — no images are rendered or generated.',
    'Abstract topics (e.g. "motivation", "things") are rejected; supply a concrete sub-topic for an honest brief.',
    'Ratios are fixed per format (2:3 standard, 9:16 idea/video) — pixel dimensions are intentionally not stated.',
    'Text overlays are capped at 8 words with the topic counting as one word.',
  ],
  jsonLd: [],
};
