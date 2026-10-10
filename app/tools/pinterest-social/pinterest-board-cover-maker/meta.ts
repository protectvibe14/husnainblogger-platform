import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/pinterest-board-cover-maker/';

const DESCRIPTION =
  'Design Pinterest board covers that earn the click: get copy-ready design specs and layouts to rebuild in Canva - no image files, just a clear plan.';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'boardName',
    label: 'Board name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Home Decor (2-60 characters)',
  },
  {
    id: 'theme',
    label: 'Theme / keyword (optional)',
    type: 'text',
    placeholder: 'e.g. farmhouse, minimalist',
  },
  {
    id: 'brandColor',
    label: 'Brand color (optional)',
    type: 'text',
    placeholder: 'e.g. #C96F4A — replaces the palette accent',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'covers',
    label: 'Cover design specs',
    type: 'list',
    description:
    'One copy-ready cover design spec per board: palette, typography treatment, accent layout, and an 800x800 recreate recipe.',
  },
  {
    id: 'html',
    label: 'Copy-ready HTML snippets',
    type: 'copy',
    description:
    'Combined 800x800 HTML layout snippets for every board — preview the layout, then rebuild it in Canva.',
  },
  {
    id: 'count',
    label: 'Covers built',
    type: 'number',
    description:
    'How many cover design specs were built.',
  },
  {
    id: 'coverTips',
    label: 'Cover tips',
    type: 'list',
    description:
    'Fixed 800x800 board-cover facts: safe area, naming, and how to set the cover in Pinterest.',
  },
];

export const content: ToolContent = {
  title: 'Pinterest Board Cover Maker',
  description: DESCRIPTION,
  howTo: [
    'Add one item per board and type the "Board name" (2-60 characters — anything outside that range is rejected).',
    'Optionally add a "Theme / keyword" to steer the design brief, and a "Brand color" hex (like #C96F4A) to replace the palette accent.',
    'Run the tool to get a copy-ready cover design spec per board: palette, typography treatment, accent layout, and an 800x800 recreate recipe.',
    'Copy the HTML snippet to preview each layout, or paste the brief into Canva and rebuild the cover in minutes.',
    'Export your finished cover as an 800x800 PNG and set it as the board cover in Pinterest.',
  ],
  methodology:
    'Each board item is validated (board name 2-60 characters, optional theme up to 80 characters, optional hex brand color) and then mapped deterministically from the board name to one of 8 fixed palettes, 6 typography treatments, and 4 accent layouts — the same board name always yields the same spec. The tool emits a copy-ready design brief plus an 800x800 HTML layout snippet per board. It never generates image files: you recreate the cover in Canva or any editor and export the PNG yourself.',
  faqs: [
    {
      question: 'what is the best pinterest board cover maker?',
      answer:
        'The best pinterest board cover maker validates your board names, picks a matching palette, typography, and layout, and hands you a copy-ready design brief with an 800x800 layout snippet. This free tool does exactly that — then you rebuild the cover in Canva in minutes.',
    },
    {
      question: 'is there a free pinterest board cover maker?',
      answer:
        'Yes — this Pinterest Board Cover Maker is completely free with no signup. Build design specs for as many boards as you like, copy each brief and HTML layout snippet, and recreate your covers in Canva at no cost.',
    },
    {
      question: 'how to make pinterest board cover?',
      answer:
        'Add your board name, pick up the generated design spec (palette, typography, and layout), recreate it on an 800x800 canvas in Canva, export as PNG, then open the board in Pinterest, tap the edit icon, and choose the cover.',
    },
    {
      question: 'how does a pinterest board cover maker work?',
      answer:
        'You enter one board name per item, plus an optional theme and brand color. The tool validates each item and deterministically assigns a palette, typography treatment, and accent layout from its fixed banks, then produces a copy-ready design brief and 800x800 HTML snippet per board. It does not create actual image files — you recreate the cover in Canva from the spec.',
    },
    {
      question: 'How does the pinterest board cover maker work?',
      answer:
        'Enter your details using the inputs above and the pinterest board cover maker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the pinterest board cover maker free to use?',
      answer:
        'Yes - this pinterest board cover maker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a pinterest board cover maker?',
      answer:
        'A pinterest board cover maker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'This tool produces design specs and HTML layout snippets, not image files — you recreate the cover in Canva (or any editor) and export the PNG yourself.',
    'Palette, typography, and layout picks are deterministic from the board name (FNV-1a hash), so the same board name always returns the same spec; a brand color overrides only the accent.',
    'Pinterest shows board covers as squares but may crop them to a circle on desktop profiles — the cover tips remind you to keep the title inside the central area.',
  ],
  jsonLd: [],
};
