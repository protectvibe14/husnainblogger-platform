import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/keyword-gap-worksheet/';

export const inputs: ToolInput[] = [
  {
    id: 'yourKeywords',
    label: 'Your keywords',
    type: 'textarea',
    required: true,
    placeholder: 'Paste one keyword per line, e.g.\nseo tips\nblog seo\nkeyword research',
  },
  {
    id: 'competitorKeywords',
    label: 'Competitor keywords',
    type: 'textarea',
    required: true,
    placeholder: 'Paste the competitor keyword list, one per line',
  },
  {
    id: 'competitorLabel',
    label: 'Competitor label (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. RivalBlog — used as a column header',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'gapTable',
    label: 'Keyword gap worksheet',
    type: 'table',
    description:
    'Free keyword gap analysis template 2026: Every keyword classified as a Gap, an Overlap, or only in your list. Fast, private now.',
  },
  {
    id: 'overlapCount',
    label: 'Overlap count',
    type: 'number',
    description:
    'How many keywords appear in both lists.',
  },
  {
    id: 'worksheetCsv',
    label: 'Download worksheet (CSV)',
    type: 'download',
    description:
    'The full worksheet as a CSV file you can open in Excel or Google Sheets.',
  },
];

export const content: ToolContent = {
  title: 'Keyword Gap Analysis Template',
  description:
    'Paste two keyword lists into this free keyword gap analysis template. Find competitor gaps and overlaps, then download the worksheet as a CSV file.',
  howTo: [
    'Paste your own keywords into the "Your keywords" box, one keyword per line.',
    'Paste the competitor keyword list into the "Competitor keywords" box.',
    'Optionally add a competitor label so the worksheet columns are named clearly.',
    'Run the tool to see every keyword classified as a Gap, an Overlap, or only in your list.',
    'Download the worksheet CSV and use the Gap rows as your content backlog.',
  ],
  methodology:
    'This is a manual worksheet, not a keyword research tool: it compares the two lists you paste, nothing more. Keywords are normalized (lowercased, whitespace collapsed) before comparison, duplicates are removed, and rows are sorted with gaps first. It cannot fetch a competitor\'s real rankings or search volume — for live data, check Google Search Console or a keyword research tool.',
  examples: [
    {
      title: 'Blog vs competitor',
      inputs: {
        yourKeywords: 'seo tips\nblog seo\nkeyword research',
        competitorKeywords: 'seo tips\ncontent marketing\nlink building',
      },
      note: 'Two gaps found (content marketing, link building) and one overlap.',
    },
    {
      title: 'Labeled worksheet',
      inputs: {
        yourKeywords: 'email marketing\nnewsletter tips',
        competitorKeywords: 'email marketing\nautomation tools',
        competitorLabel: 'RivalBlog',
      },
      note: 'The competitor column is labeled RivalBlog in the table and CSV.',
    },
  ],
  faqs: [
    {
      question: 'What is the best keyword gap analysis template?',
      answer:
        'The best template is one you can fill in yourself: two columns (your keywords vs a competitor\'s), with each keyword classified as a gap, an overlap, or unique to you. This tool builds that worksheet automatically from the lists you paste and lets you download it as CSV.',
    },
    {
      question: 'Is there a free keyword gap analysis template?',
      answer:
        'Yes — this tool is completely free with no signup. Paste your keyword list and a competitor\'s list, and you get the full gap worksheet plus a downloadable CSV.',
    },
    {
      question: 'How to use keyword gap analysis?',
      answer:
        'List the keywords you target, list the keywords a competitor targets, then compare: keywords they target that you don\'t are your gaps — each gap is a potential new article or page. Overlaps show where you compete head-to-head, so you can strengthen those pages.',
    },
    {
      question: 'How does a keyword gap analysis template work?',
      answer:
        'You paste both lists and the tool normalizes them (lowercase, trimmed) so "SEO Tips" and "seo tips" count as one keyword. It then marks each keyword as a gap (competitor-only), an overlap (in both), or only in your list, sorted with gaps first.',
    },
    {
      question: 'What is a keyword gap analysis template?',
      answer:
        'A keyword gap analysis template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Manual worksheet: it only compares the lists you paste. It does not fetch live competitor rankings, search volume, or keyword difficulty.',
    'Matching is by exact keyword text after normalization — close variants (e.g. "seo tip" vs "seo tips") are treated as different keywords.',
  ],
  jsonLd: [],
};
