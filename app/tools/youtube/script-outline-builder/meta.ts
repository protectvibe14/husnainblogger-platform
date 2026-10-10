import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/script-outline-builder/';

const DESCRIPTION =
  'Structure videos that retain with this YouTube script outline template — hook, setup, payoff, and CTA laid out scene by scene for you. Fill sections.';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'topic',
    label: 'Video topic (item 1: setup)',
    type: 'text',
    required: true,
    placeholder: 'e.g. How to boil an egg',
  },
  {
    id: 'targetMinutes',
    label: 'Target duration in minutes (item 1)',
    type: 'text',
    placeholder: 'e.g. 10 (default)',
  },
  {
    id: 'format',
    label: 'Format (item 1)',
    type: 'text',
    placeholder: 'tutorial | review | vlog | essay (default: tutorial)',
  },
  {
    id: 'sectionTitle',
    label: 'Section title (items 2+: sections)',
    type: 'text',
    placeholder: 'e.g. Step 1: prep the pan',
  },
  {
    id: 'sectionType',
    label: 'Section type (items 2+: sections)',
    type: 'text',
    placeholder: 'hook | setup | value | payoff | cta',
  },
  {
    id: 'talkingPoints',
    label: 'Talking points (items 2+, optional)',
    type: 'text',
    placeholder: 'Your own notes for this section (max 500 chars)',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'outline', label: 'Sectioned outline with word budgets', type: 'list' },
  { id: 'totalWords', label: 'Total planned words', type: 'number' },
  { id: 'sectionCount', label: 'Sections', type: 'number' },
  { id: 'copyBlocks', label: 'Copy-paste outline', type: 'copy' },
  { id: 'summary', label: 'Plain-English result', type: 'text' },
  { id: 'honestyNotes', label: 'What the tool does and does not do', type: 'list' },
];

export const content: ToolContent = {
  title: 'Youtube Script Outline Template',
  description: DESCRIPTION,
  howTo: [
    'Fill in item 1 as your video setup: the topic (required), target duration in minutes, and format (tutorial, review, vlog, or essay).',
    'Add more items for your own sections: each needs a section title and a section type (hook, setup, value, payoff, or cta), plus optional talking points.',
    'If you add no section items, the tool emits the fixed scaffold for your chosen format — hook → setup → value beats → payoff → CTA.',
    'Run the builder to get a numbered outline with per-section word budgets at the 150 wpm narration convention.',
    'Copy the outline block and fill each section slot with your own words — the talking points are yours to write.',
  ],
  methodology:
    'This is a template scaffold, not a script writer: sections are fixed slots (titles + slot guidance), one scaffold per format, and nothing is AI-generated. Word budgets use the 150 wpm narration convention (an estimate) with fixed per-type shares — hook 5%, setup 10%, main value 60%, payoff 15%, CTA 10% — split evenly when several sections share a type.',
  faqs: [
    {
      question: 'what is the best youtube script outline template?',
      answer:
        'The best one follows the proven hook → setup → value beats → payoff → CTA structure and gives every section a word budget so your script fits the target runtime. This free builder does exactly that for tutorials, reviews, vlogs, and essays — you fill each slot with your own talking points.',
    },
    {
      question: 'is there a free youtube script outline template?',
      answer:
        'Yes — this tool is completely free with no signup. Enter your topic, target duration, and format, and get a sectioned outline with per-section word budgets plus a copy-paste block. The sections are slots for your own words, not generated prose.',
    },
    {
      question: 'how to use youtube?',
      answer:
        'If you mean this youtube script outline template: fill item 1 with your video topic, target minutes, and format, add section items (or let the fixed scaffold generate them), and run the builder. You get a numbered outline with word budgets — then write your actual script into each section slot.',
    },
    {
      question: 'how does a youtube script outline template work?',
      answer:
        'It gives you the skeleton of a video — hook, setup, value beats, payoff, CTA — with a word budget per section so the script fits your target length. This tool builds that skeleton from your topic, duration, and format; the talking points and the script itself stay yours to write.',
    },
    {
      question: 'What is a youtube script outline template?',
      answer:
        'A youtube script outline template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Can I save or export my youtube script outline template?',
      answer: 'Yes, copy the result or use your browser\'s print-to-PDF. Everything stays on your device — nothing is uploaded or stored.',
    },
    {
      question: 'How do I build youtube script outline template?',
      answer: 'Fill in the fields with your details and the builder assembles everything into a polished result. Edit any section until it feels right.',
    },
  ],
  assumptions: [
    'Sections are fixed template slots, not generated prose — the tool never writes your script and nothing is AI-generated.',
    'Word budgets use the 150 wpm narration convention (an estimate); real pacing varies and B-roll adds unscripted time.',
    'Only the first item is treated as the video setup; additional items are sections.',
  ],
  jsonLd: [],
};
