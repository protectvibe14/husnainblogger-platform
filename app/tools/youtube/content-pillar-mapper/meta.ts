import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/content-pillar-mapper/';

const DESCRIPTION =
  'Plan your channel with this free YouTube content pillars template — turn 1–8 pillars into subtopic prompts and format suggestions. Build your map now.';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Channel niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. home coffee',
  },
  {
    id: 'pillars',
    label: 'Pillar names (one per line, 1–8)',
    type: 'textarea',
    required: true,
    placeholder: 'Brewing guides\nGear reviews\nCoffee science',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'pillarMap', label: 'Pillar map', type: 'table' },
  { id: 'promptCards', label: 'Subtopic prompt cards', type: 'list' },
  { id: 'pillarCount', label: 'Pillar count', type: 'number' },
  { id: 'methodologyNote', label: 'How the map was built', type: 'text' },
  { id: 'isTemplateBased', label: 'Template flag', type: 'text' },
];

export const content: ToolContent = {
  title: 'YouTube Content Pillars Template',
  description: DESCRIPTION,
  howTo: [
    'Enter your channel niche, e.g. "home coffee".',
    'List your content pillars one per line — 1 to 8 pillars (e.g. Brewing guides, Gear reviews, Coffee science).',
    'Run the mapper to get a pillar map: each pillar with subtopic prompts and suggested formats.',
    'Use the prompt cards as filming briefs — expand each one with your own angle and research.',
    'Revisit monthly: retire pillars that underperform and add ones your audience asks for.',
  ],
  methodology:
    'The mapper takes the pillar names you supply and attaches fixed template patterns: 3 subtopic prompts per pillar from a 12-pattern bank (with your pillar and niche filled in) and 2 format suggestions from an 8-format list, assigned by pillar index in fixed rotation. These are template patterns, not researched topics — no AI generation and no demand data is involved.',
  examples: [
    {
      title: 'Home coffee channel',
      inputs: { niche: 'home coffee', pillars: 'Brewing guides\nGear reviews\nCoffee science' },
      note: '3 pillars × 3 prompt patterns + 2 format suggestions each — 9 prompt cards total.',
    },
    {
      title: 'Single pillar',
      inputs: { niche: 'fitness', pillars: 'Home workouts' },
      note: 'One pillar still gets 3 subtopic prompts and 2 formats — a focused starting map.',
    },
  ],
  faqs: [
    {
      question: 'what is the best youtube content pillars template?',
      answer:
        'One that keeps you to a few focused pillars and turns each into concrete video ideas. This free template takes 1–8 pillars you define and generates 3 subtopic prompt patterns plus 2 format suggestions per pillar.',
    },
    {
      question: 'is there a free youtube content pillars template?',
      answer:
        'Yes — this mapper is completely free with no signup. Enter your niche and up to 8 pillar names, one per line, and get a full pillar map with prompt cards and format suggestions.',
    },
    {
      question: 'how to use youtube content pillars?',
      answer:
        'Define 3–5 core topics your channel covers, then plan most videos inside those pillars so your audience knows what to expect. This tool turns each pillar into subtopic prompts and format suggestions you can film from.',
    },
    {
      question: 'how does a youtube content pillars template work?',
      answer:
        'You supply the pillar names; the tool attaches fixed subtopic prompt patterns (12-template bank) and format suggestions (8-format list) in deterministic rotation. It does not research topics — validate demand for each idea yourself.',
    },
    {
      question: 'How does the youtube content pillars template work?',
      answer:
        'Enter your details using the inputs above and the youtube content pillars template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube content pillars template free to use?',
      answer:
        'Yes - this youtube content pillars template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube content pillars template?',
      answer:
        'A youtube content pillars template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Subtopic prompts are template patterns filled with your pillar and niche, not researched topics — demand validation is your job.',
    'Format suggestions are generic guidance, not performance predictions; test what your audience actually watches.',
    'The map stays useful only if you maintain it — retire pillars that underperform and add ones viewers ask for.',
  ],
  jsonLd: [],
};
