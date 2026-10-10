import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'workingTitle',
    label: 'Working title',
    type: 'text',
    required: true,
    placeholder: 'e.g. Email Marketing for Freelancers',
  },
  {
    id: 'chapterCount',
    label: 'Number of chapters',
    type: 'number',
    required: true,
    placeholder: '3 – 30',
    validation: { min: 3, max: 30 },
  },
  {
    id: 'targetReader',
    label: 'Target reader (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. busy coaches',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'outline',
    label: 'Chapter outline',
    type: 'list',
    description:
    'Free ebook outline generator 2026: Numbered chapter list with working titles and per-chapter beat slots. Get instant results. free now.',
  },
];

export const content: ToolContent = {
  title: 'Ebook Outline Generator',
  description:
    'Generate a complete ebook chapter outline — numbered chapters with working titles and beat slots. Free ebook outline generator, no sign-up. Start.',
  howTo: [
    'Enter your ebook\'s working title (long titles are shortened to 80 characters).',
    'Choose how many chapters you want, from 3 to 30.',
    'Optionally name your target reader so the beat slots speak to them.',
    'Click generate to get a numbered chapter list with working titles.',
    'Copy the outline and fill in each chapter\'s beat slots with your own content.',
  ],
  methodology:
    'This is a template engine, not AI writing: your working title, chapter count, and target reader are placed into fixed chapter patterns (an opening chapter, rotating body-chapter titles, and a closing action plan). Each chapter carries three fill-in beat slots — hook, core idea, and action step — so the structure is done for you while all writing stays yours.',
  examples: [
    {
      title: 'Freelancer guide',
      inputs: {
        workingTitle: 'Email Marketing for Freelancers',
        chapterCount: 6,
        targetReader: 'freelance designers',
      },
      note: '6 chapters with reader-specific beat slots.',
    },
    {
      title: 'Short lead magnet',
      inputs: {
        workingTitle: 'The 7-Day Habit Reset',
        chapterCount: 3,
      },
      note: 'Minimum 3 chapters: opening, one body chapter, closing.',
    },
  ],
  faqs: [
    {
      question: 'What is the best ebook outline generator?',
      answer:
        'There is no single "best" ebook outline generator — the right one depends on whether you want structure help or full drafting. This free tool gives you the structure: a numbered chapter list with working titles and fill-in beat slots based on your title, chapter count, and target reader. It never pretends to write the book for you.',
    },
    {
      question: 'Is there a free ebook outline generator?',
      answer:
        'Yes — this one. It is free, runs entirely in your browser, and needs no sign-up. Enter a working title, pick 3–30 chapters, and you get a numbered outline with beat slots for every chapter.',
    },
    {
      question: 'How do I outline an ebook?',
      answer:
        'Start with your working title and target reader, fix the chapter count, then draft one working title per chapter plus the beats each chapter must hit. This tool automates that scaffolding: it generates the numbered chapters and beat slots (hook, core idea, action step) so you can start writing immediately.',
    },
    {
      question: 'How does an ebook outline generator work?',
      answer:
        'This one is template-based, not AI: your inputs are placed into fixed chapter patterns — an opening overview chapter, rotating body-chapter titles, and a closing 30-day action plan — and each chapter gets fill-in beat slots. The same inputs always produce the same outline.',
    },
    {
      question: 'What is an ebook outline generator?',
      answer:
        'An ebook outline generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'How do I create ebook outline generator?',
      answer: 'Describe what you need in the input fields, then click generate. You can regenerate as many times as you like and copy the version that fits best.',
    },
    {
      question: 'What makes a good ebook outline generator?',
      answer: 'Clarity, specificity, and relevance to your audience. Avoid generic phrases — the more specific your input, the better the output.',
    },
  ],
  assumptions: [
    'Chapter titles follow fixed template patterns — treat them as starting points, not final copy.',
    'No chapter content is written for you; every beat slot must be filled in by the author.',
    'Working titles longer than 80 characters are shortened in the chapter titles.',
    'This tool plans structure only; it does not check grammar, facts, or market demand for your topic.',
  ],
  jsonLd: [],
};
