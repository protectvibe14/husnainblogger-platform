import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/heading-structure-analyzer/';

export const inputs: ToolInput[] = [
  {
    id: 'html',
    label: 'HTML',
    type: 'textarea',
    required: true,
    placeholder: '<h1>Your Post Title</h1><h2>First Section</h2>…',
    // This tool analyzes HTML structure — the sanitizer must NOT strip tags.
    validation: { sanitize: { stripTags: false } },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'issues',
    label: 'Issues found',
    type: 'table',
    description:
    'Free heading hierarchy checker 2026: Every rule violation with its severity and how to fix it. free.',
  },
  {
    id: 'outline',
    label: 'Heading outline',
    type: 'table',
    description:
    'Your headings in document order, with their levels.',
  },
  {
    id: 'score',
    label: 'Structure score (0–100)',
    type: 'number',
    description:
    'Starts at 100; deductions per issue. Never below 0.',
  },
];

export const content: ToolContent = {
  title: 'Heading Hierarchy Checker',
  description:
    'Check your H1–H6 structure in seconds. Paste HTML into this free heading hierarchy checker to flag skipped levels, missing H1s, and empty headings..',
  howTo: [
    'Paste your page HTML into the "HTML" box — at least one <h1>–<h6> tag is required.',
    'Run the tool to extract every heading in document order.',
    'Review the issues table: missing or multiple H1s, skipped levels, empty and duplicate headings.',
    'Fix the flagged headings in your CMS and re-run until the score reaches 100.',
  ],
  methodology:
    'Headings are parsed from your HTML with fixed rules (case-insensitive, inner markup stripped). The score starts at 100: \u221225 for no H1, \u221210 per extra H1, \u221210 per skipped level, \u221210 per empty heading, \u22125 per repeated heading text. The tool reads only the HTML you paste — it never fetches your live page.',
  examples: [
    {
      title: 'Clean structure',
      inputs: { html: '<h1>Guide</h1><h2>Basics</h2><h3>Details</h3>' },
      note: 'One H1 and no skipped levels scores 100.',
    },
    {
      title: 'Skipped level',
      inputs: { html: '<h1>Guide</h1><h3>Details</h3>' },
      note: 'Jumping from H1 to H3 flags a warning and costs 10 points.',
    },
  ],
  faqs: [
    {
      question: 'What is the best heading hierarchy checker?',
      answer:
        'The best one checks the rules that matter — one H1, no skipped levels, no empty or duplicate headings — and explains each fix. This free tool does all four and scores your structure out of 100.',
    },
    {
      question: 'Is there a free heading hierarchy checker?',
      answer:
        'Yes — this tool is completely free with no signup. Paste your HTML and get an issue list, a heading outline, and a score.',
    },
    {
      question: 'How to check heading hierarchy?',
      answer:
        'Extract your page\u2019s headings in order and verify: exactly one H1, levels never skip (H1→H2→H3), no empty headings, and no repeated heading text. This tool runs all four checks automatically on pasted HTML.',
    },
    {
      question: 'How does a heading hierarchy checker work?',
      answer:
        'It parses your HTML for h1–h6 tags, then applies fixed rules: it flags a missing or duplicated H1, any jump that skips a level, empty headings, and repeated heading text, deducting points per issue from a starting score of 100.',
    },
    {
      question: 'What is a heading hierarchy checker?',
      answer:
        'A heading hierarchy checker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'What is a good heading hierarchy checker score?',
      answer: 'Aim for the top rating band shown in the results. If your score is low, the tool highlights exactly what to fix — usually small changes make a big difference.',
    },
    {
      question: 'Why does heading hierarchy checker matter?',
      answer: 'It directly affects your visibility, credibility, and results. Poor scores mean missed opportunities; the checker shows you where you stand and how to improve.',
    },
  ],
  assumptions: [
    'Analyzes only the HTML you paste — it cannot fetch your live page or see headings rendered by JavaScript.',
    'Headings are found with pattern matching; malformed or unclosed tags may not be detected.',
  ],
  jsonLd: [],
};
