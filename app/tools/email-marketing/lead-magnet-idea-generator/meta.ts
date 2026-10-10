import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/email-marketing/lead-magnet-idea-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. email marketing',
  },
  {
    id: 'audience',
    label: 'Audience',
    type: 'text',
    required: true,
    placeholder: 'e.g. bloggers',
  },
  {
    id: 'format',
    label: 'Format',
    type: 'select',
    required: false,
    options: ['any', 'ebook', 'checklist', 'template', 'video', 'email-course'],
  },
  {
    id: 'count',
    label: 'Number of ideas',
    type: 'number',
    required: true,
    placeholder: 'e.g. 5',
    validation: { min: 1, max: 20 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'ideas',
    label: 'Lead magnet ideas',
    type: 'table',
    description:
    'Free lead magnet ideas generator 2026: Table of titled lead-magnet ideas: number, idea title, format, and a short. Fast, private now.',
  },
];

export const content: ToolContent = {
  title: 'Lead Magnet Ideas Generator',
  description:
    'Brainstorm lead magnets worth downloading: enter your niche and audience for up to 20 titled ideas across 5 formats, each with the reason it converts.',
  howTo: [
    'Enter your niche (e.g. email marketing) and your target audience (e.g. bloggers).',
    'Optionally lock a format — ebook, checklist, template, video, or email course — or leave "any" to mix them.',
    'Enter how many ideas you want (1–20).',
    'Run the tool to get a table of titled ideas, each with its format and a "why it converts" reason.',
    'Pick a favorite and build it — sibling tools cover titles, checklists, and quizzes next.',
  ],
  methodology:
    'Ideas are assembled from fixed banks (24 title patterns, 20 conversion reasons across 5 formats) filled with your niche and audience — no AI, no guessing. Selection is a deterministic hash of your inputs, so the same inputs always produce the same idea list. "Why it converts" notes are general best-practice explanations, not predictions about your audience.',
  examples: [
    {
      title: 'Checklist ideas for bloggers',
      inputs: { niche: 'email marketing', audience: 'bloggers', format: 'checklist', count: 3 },
      note: 'Three checklist-format ideas for a blogger audience.',
    },
    {
      title: 'Mixed formats for course creators',
      inputs: { niche: 'online courses', audience: 'coaches', format: 'any', count: 5 },
      note: 'Five ideas cycling through all five formats.',
    },
  ],
  faqs: [
    {
      question: 'What is the best lead magnet ideas generator?',
      answer:
        'The best one matches ideas to your niche and audience instead of giving generic lists: this free generator combines your niche and audience with 24 fixed title patterns across 5 formats, and explains why each format tends to convert.',
    },
    {
      question: 'Is there a free lead magnet ideas generator?',
      answer:
        'Yes — this lead magnet ideas generator is completely free with no signup. You can generate 1–20 titled ideas per run, filtered by format if you like.',
    },
    {
      question: 'How to generate lead magnet?',
      answer:
        'Start from your niche and audience, pick a format that fits how they like to consume (checklists and templates for busy people, video for trust, email courses for habit-building), then title it around one clear outcome. This tool does the brainstorming; you build the winner.',
    },
    {
      question: 'How does a lead magnet ideas generator work?',
      answer:
        'It fills fixed title patterns with your niche and audience, assigns each idea a format (or cycles through all five), and attaches a general "why it converts" reason per format. Every idea is assembled from template banks — nothing is written by AI.',
    },
    {
      question: 'How does the lead magnet ideas generator work?',
      answer:
        'Enter your details using the inputs above and the lead magnet ideas generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the lead magnet ideas generator free to use?',
      answer:
        'Yes - this lead magnet ideas generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a lead magnet ideas generator?',
      answer:
        'A lead magnet ideas generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Ideas are assembled from fixed banks (24 title patterns, 20 conversion reasons) — no AI ideation is involved; titles may feel formulaic by design.',
    '"Why it converts" notes are general best-practice explanations, not guarantees for your specific audience.',
    'This tool covers general lead-magnet ideation; sibling tools cover titles, content upgrades, and quizzes in more depth.',
  ],
  jsonLd: [
  ],
};
