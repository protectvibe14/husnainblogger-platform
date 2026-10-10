import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/content-similarity-checker/';

export const inputs: ToolInput[] = [
  {
    id: 'textA',
    label: 'Text A',
    type: 'textarea',
    required: true,
    placeholder: 'Paste the first text here…',
  },
  {
    id: 'textB',
    label: 'Text B',
    type: 'textarea',
    required: true,
    placeholder: 'Paste the second text here…',
  },
  {
    id: 'shingleSize',
    label: 'Shingle size (2–5)',
    type: 'number',
    required: false,
    placeholder: '3',
    validation: { min: 2, max: 5 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'jaccardSimilarity',
    label: 'Jaccard similarity (0–1)',
    type: 'number',
    description:
    'Free duplicate content checker 2026: Shared word sequences divided by all unique word sequences. Get instant results. free now.',
  },
  {
    id: 'similarityPercent',
    label: 'Similarity',
    type: 'percent',
    description:
    'The Jaccard score as a percentage.',
  },
  {
    id: 'verdict',
    label: 'Verdict',
    type: 'text',
    description:
    'Plain-English verdict from the published similarity bands.',
  },
];

export const content: ToolContent = {
  title: 'Duplicate Content Checker',
  description:
    'Compare two texts for duplicated passages. This free duplicate content checker scores word-sequence overlap with the Jaccard index — Compare now.',
  howTo: [
    'Paste the first text into "Text A" and the second into "Text B".',
    'Optionally set "Shingle size" (2–5, default 3) — smaller sizes catch shorter shared phrases.',
    'Run the tool to get the Jaccard similarity score, the percentage, and a plain-English verdict.',
    'Use the verdict bands to decide whether overlapping passages need rewriting before publishing.',
  ],
  methodology:
    'Both texts are lowercased and split into word sequences of the chosen shingle size (default 3). The Jaccard index — shared sequences divided by all unique sequences — gives a 0–1 score. Verdict bands: \u22650.90 near-duplicate, \u22650.50 high, \u22650.20 moderate, >0 low, 0 none. This measures overlap between your two texts only; it is not a plagiarism check against the web.',
  examples: [
    {
      title: 'Two article drafts',
      inputs: {
        textA: 'Content marketing drives organic traffic over time.',
        textB: 'Content marketing drives organic traffic over time, mostly.',
        shingleSize: 3,
      },
      note: 'Near-duplicate drafts score high.',
    },
    {
      title: 'Unrelated paragraphs',
      inputs: {
        textA: 'Apples oranges bananas grapes.',
        textB: 'Trucks trains airplanes bicycles.',
      },
      note: 'No shared word sequences scores zero.',
    },
  ],
  faqs: [
    {
      question: 'What is the best duplicate content checker?',
      answer:
        'The best checker for your own drafts compares texts with a transparent method like the Jaccard index — this free tool does exactly that between any two texts you paste, with no signup.',
    },
    {
      question: 'Is there a free duplicate content checker?',
      answer:
        'Yes — this tool is completely free. Paste two texts and get an overlap score plus a verdict in seconds.',
    },
    {
      question: 'How to check duplicate content?',
      answer:
        'Paste both versions into the tool and compare their word-sequence overlap. A score above 0.90 means near-duplicate passages; above 0.50 means large overlaps worth reviewing. For checking against the whole web you need a plagiarism service with a search index — this tool only compares your two texts.',
    },
    {
      question: 'How does a duplicate content checker work?',
      answer:
        'It breaks each text into overlapping word sequences (shingles), then computes the Jaccard index: shared sequences divided by total unique sequences. The math is fixed and published, so the same texts always give the same score.',
    },
    {
      question: 'How does the duplicate content checker work?',
      answer:
        'Enter your details using the inputs above and the duplicate content checker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the duplicate content checker free to use?',
      answer:
        'Yes - this duplicate content checker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a duplicate content checker?',
      answer:
        'A duplicate content checker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Compares only the two texts you paste — it cannot check the web or any search index, so it is not a plagiarism verdict.',
    'Shared boilerplate (quotes, disclosures, repeated headers) raises the score without meaning either text copied the other.',
  ],
  jsonLd: [
  ],
};
