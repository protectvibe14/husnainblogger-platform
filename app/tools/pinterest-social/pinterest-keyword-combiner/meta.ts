import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/pinterest-keyword-combiner/';

export const inputs: ToolInput[] = [
  {
    id: 'seedKeywords',
    label: 'Seed keywords (one per line)',
    type: 'textarea',
    required: true,
    placeholder: 'cozy bedroom\nsmall apartment\nfall decor',
  },
  {
    id: 'modifiers',
    label: 'Modifiers (one per line)',
    type: 'textarea',
    required: false,
    placeholder: 'Defaults: how to, best, ideas, easy, quick',
  },
  {
    id: 'maxCombos',
    label: 'Max combinations',
    type: 'number',
    required: false,
    placeholder: '50',
    validation: { min: 1, max: 500 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'keywordCombos',
    label: 'Keyword combinations',
    type: 'list',
    description:
    'Free pinterest keyword research 2026: Deterministic seed x modifier and seed x seed combinations, deduplicated and lowercased. Fast, private - try.',
  },
  {
    id: 'note',
    label: 'Honesty note',
    type: 'text',
    description:
    'Reminder that these combos are idea seeds with no search-volume data attached; verify real interest in the Pinterest search bar before building content.',
  },
];

export const content: ToolContent = {
  title: 'Pinterest Keyword Research Tool',
  description:
    'Do Pinterest keyword research the fast way: enter your seed keywords, add your own modifiers, and get deduplicated long-tail ideas in seconds.',
  howTo: [
    'Enter 1–10 seed keywords, one per line (e.g. cozy bedroom, small apartment).',
    'Add your own modifiers, one per line — or leave it blank to use how to, best, ideas, easy, quick.',
    'Set the max number of combinations (defaults to 50, hard cap 500).',
    'Run the tool to get every seed x modifier and seed x seed combination, deduplicated.',
    'Paste the most promising idea seeds into the Pinterest search bar to check real interest before you pin.',
  ],
  methodology:
    'The tool computes a deterministic cartesian product — every modifier + seed, every seed + modifier, and every seed + seed pairing — then removes duplicates after lowercasing and whitespace normalization. No external data, no AI, no search-volume or difficulty scores are used or claimed; the same inputs always return the same list in the same order.',
  examples: [
    {
      title: 'Home decor seeds',
      inputs: { seedKeywords: 'cozy bedroom\nsmall apartment', modifiers: 'best\nideas' },
      note: 'Produces combos like "best cozy bedroom" and "small apartment ideas".',
    },
    {
      title: 'Default modifiers',
      inputs: { seedKeywords: 'fall decor', modifiers: '' },
      note: 'Falls back to how to, best, ideas, easy, quick.',
    },
    {
      title: 'Capped brainstorm',
      inputs: { seedKeywords: 'wedding\nrustic wedding', modifiers: 'ideas', maxCombos: 10 },
      note: 'Returns at most 10 deduplicated combos.',
    },
  ],
  faqs: [
    {
      question: 'What is the best pinterest keyword research?',
      answer:
        'The best Pinterest keyword research starts with your own seeds and expands them into long-tail ideas, then validates them in the Pinterest search bar. This free combiner does the expansion step: it mixes your seeds with modifiers and seed pairs into deduplicated idea seeds you can check for real interest.',
    },
    {
      question: 'Is there a free pinterest keyword research?',
      answer:
        'Yes — this Pinterest keyword combiner is completely free with no signup. You get up to 500 deduplicated keyword combinations from your seeds. Note that it provides idea seeds only, not search-volume or difficulty data.',
    },
    {
      question: 'How to use pinterest keyword research?',
      answer:
        'Enter 1–10 seed keywords one per line, optionally add modifiers, and run the tool. Take the generated combinations and type them into the Pinterest search bar — the guided-search suggestions that appear tell you which ones real users search for.',
    },
    {
      question: 'How does a pinterest keyword research work?',
      answer:
        'You supply seed keywords and modifiers; the tool computes every seed x modifier and seed x seed combination deterministically, then removes duplicates after normalizing case and spacing. Because everything is computed from your inputs, the same inputs always produce the identical list — no AI and no external data involved.',
    },
    {
      question: 'What is a pinterest keyword research?',
      answer:
        'A pinterest keyword research is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Is this pinterest keyword research tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
    {
      question: 'How do I use this pinterest keyword research tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
  ],
  assumptions: [
    'Outputs are brainstorming idea seeds only — the tool has no access to Pinterest search volume, competition, or trend data, and it must never be read as providing those.',
    'Max 10 seed keywords and a 500-combo hard cap keep the list usable; very similar seeds may still produce near-duplicate ideas.',
  ],
  jsonLd: [],
};
