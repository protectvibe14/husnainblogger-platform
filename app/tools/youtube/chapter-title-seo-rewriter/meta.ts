import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/chapter-title-seo-rewriter/';

const DESCRIPTION =
  'Polish youtube chapter title ideas with fixed formatting rules: trim, keyword front-load, and 70-char cap with per-title checks. Rewrite your chapters free!';

export const inputs: ToolInput[] = [
  {
    id: 'chapters',
    label: 'Chapter list (one per line)',
    type: 'textarea',
    required: true,
    placeholder: '0:00 Intro\n2:15 Setting up the camera\n10:45 Lighting tips',
  },
  {
    id: 'primaryKeyword',
    label: 'Primary keyword (optional, front-loaded when present)',
    type: 'text',
    required: false,
    placeholder: 'e.g. lighting tips',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'titles', label: 'Polished chapter titles', type: 'list' },
  { id: 'copyAll', label: 'Copy all titles', type: 'copy' },
  { id: 'checks', label: 'Per-title checks', type: 'list' },
  { id: 'honestyNote', label: 'What this tool is (and is not)', type: 'text' },
  { id: 'count', label: 'Chapters polished', type: 'number' },
];

export const content: ToolContent = {
  title: 'Youtube Chapter Title Ideas',
  description: DESCRIPTION,
  howTo: [
    'Paste your timestamped chapter list into "Chapter list" — one chapter per line, like "0:00 Intro".',
    'Optionally enter a primary keyword: if a title contains it but does not start with it, the keyword is moved to the front.',
    'Run the tool — every title is trimmed, sentence-cased, keyword front-loaded, and capped at 70 characters by fixed rules.',
    'Review the per-title checks: each line reports its final length and whether it was front-loaded or truncated.',
    'Copy the polished list and paste it into your YouTube description; remember this is rule-based polish, not AI rewriting.',
  ],
  methodology:
    'Rule-based normalization in five fixed steps: trim and collapse whitespace, strip trailing punctuation, sentence-case the first letter, keyword front-load (the first case-insensitive occurrence of your primary keyword moves to the front as "Keyword: rest"), and a 70-character heuristic cap that cuts at the last word boundary with a visible ellipsis. No AI and no semantic rewriting are involved — the engine cannot understand meaning. Chapter lines must parse as mm:ss or hh:mm:ss, start at 0:00, number at least 3, and sit 10+ seconds apart; invalid lists are rejected with the offending line number.',
  examples: [
    {
      title: 'Messy chapter list, polished',
      inputs: {
        chapters: '0:00 intro...\n2:15   setting up the camera\n10:45 lighting tips for small rooms\n25:00 final thoughts',
        primaryKeyword: 'lighting tips',
      },
      note: 'Trims and sentence-cases every title; "lighting tips for small rooms" is already front-loaded, so it stays put.',
    },
    {
      title: 'Keyword moved to the front',
      inputs: {
        chapters: '0:00 intro\n5:00 my favorite lighting tips\n12:00 outro',
        primaryKeyword: 'lighting tips',
      },
      note: 'Returns "5:00 lighting tips: My favorite" with a per-title check noting the front-load.',
    },
  ],
  faqs: [
    {
      question: 'what is the best youtube chapter title ideas?',
      answer:
        'Good chapter titles are short, specific, and front-load the topic keyword so viewers scanning the progress bar instantly know what each section covers. This free polisher applies fixed formatting rules — trim, sentence case, keyword front-load, 70-char cap — to whatever chapter list you paste in.',
    },
    {
      question: 'is there a free youtube chapter title ideas?',
      answer:
        'Yes — this chapter title polisher is completely free with no signup. Paste any timestamped chapter list, optionally add a primary keyword, and get polished titles with per-title checks. It is rule-based polish, not AI rewriting.',
    },
    {
      question: 'how to use youtube chapter title?',
      answer:
        'Write chapters as "0:00 Intro" lines in your description (first must be 0:00, at least 3 chapters, 10+ seconds apart). Use this tool to clean them up: it trims, sentence-cases, front-loads your keyword, and caps length at 70 characters, then you paste the result back into the description.',
    },
    {
      question: 'how does a youtube chapter title ideas work?',
      answer:
        'It validates your chapter lines (timestamps, order, gaps) and runs five fixed rules over each title — no AI, no semantic rewriting. The per-title checks show exactly what changed: final length, keyword front-loads, and truncations.',
    },
    {
      question: 'What is a youtube chapter title ideas?',
      answer:
        'A youtube chapter title ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Rule-based polish only: the engine cannot understand meaning or genuinely rewrite for SEO — it applies fixed formatting rules.',
    'Chapter rules enforced: mm:ss or hh:mm:ss timestamps, first chapter 0:00, minimum 3 chapters, 10-second minimum gaps.',
    'The 70-character cap is a documented heuristic for readability, not a YouTube rule; truncations are flagged and visible (…).',
    'Keyword front-loading is a fixed string operation (case-insensitive first occurrence), not semantic keyword research.',
  ],
  jsonLd: [],
};
