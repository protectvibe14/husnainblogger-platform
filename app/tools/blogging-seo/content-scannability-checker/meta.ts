import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/content-scannability-checker/';

export const inputs: ToolInput[] = [
  {
    id: 'content',
    label: 'Blog content',
    type: 'textarea',
    required: true,
    placeholder: 'Paste your full blog post here (markdown or plain text)…',
    validation: { max: 200000 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'score',
    label: 'Scannability score',
    type: 'number',
    description:
    'Free blog scannability checker 2026: 0–100 score from our transparent structural rubric (starts at 100, deductions per failed. Fast, private - try.',
  },
  {
    id: 'grade',
    label: 'Grade',
    type: 'text',
    description:
    'Letter grade: A (90–100), B (75–89), C (60–74), D (40–59), F (0–39).',
  },
  {
    id: 'checks',
    label: 'Pass/fail checks',
    type: 'list',
    description:
    'One line per rubric check with the measured value (fails first, then passes).',
  },
  {
    id: 'recommendations',
    label: 'Recommendations',
    type: 'list',
    description:
    'One concrete fix per failed check.',
  },
];

export const content: ToolContent = {
  title: 'Blog Scannability Checker',
  description:
    'Check how scannable your post is with this free blog scannability checker. Get a 0-100 score, pass/fail checks, and fixes for headings and lists. Test.',
  howTo: [
    'Paste your full blog post into the content box — markdown or plain text both work.',
    'Run the tool to get a 0–100 scannability score and a letter grade.',
    'Read the pass/fail checks: each one shows the measured value, e.g. longest paragraph in words.',
    'Work through the recommendations — one concrete fix per failed check.',
    'Re-paste the revised post and re-run to confirm your score improved.',
  ],
  methodology:
    'The score is our own deterministic heuristic, published here in full — not a Google ranking factor. It starts at 100 and subtracts fixed deductions: −15 under 100 words, −20 for zero headings, −10 for fewer than 1 heading per 300 words, −15 for any paragraph over 150 words, −10 for average paragraph over 80 words, −10 for no lists, −10 for average sentence over 25 words. Headings are detected as markdown (#) or HTML <h1>–<h6>.',
  examples: [
    {
      title: 'Well-structured how-to post',
      inputs: {
        content:
          '# How to Water Houseplants\n\nWatering houseplants is simple once you learn the basics.\n\n## Check the soil first\n\nStick your finger into the soil. If the top inch feels dry, water it.\n\n## Water thoroughly\n\n- Pour water slowly at the base.\n- Let excess water drain out.\n- Empty the saucer after ten minutes.',
      },
      note: 'Headings, short paragraphs, and a list — scores high (may still lose the −15 length deduction if under 100 words).',
    },
    {
      title: 'Wall-of-text draft',
      inputs: {
        content:
          'This is a single enormous paragraph with no headings and no lists that just keeps going and going with sentence after sentence packed together so that no reader can possibly scan it comfortably or find the point quickly at all.',
      },
      note: 'No headings, no lists, one dense paragraph — expect a low score with clear fixes.',
    },
  ],
  faqs: [
    {
      question: 'What is the best blog scannability checker?',
      answer:
        'The best checker shows its work: this free tool scores your post 0–100 with a fully published rubric, lists every pass/fail check with measured values, and gives one concrete fix per failure — so you know exactly what to change.',
    },
    {
      question: 'Is there a free blog scannability checker?',
      answer:
        'Yes — this blog scannability checker is completely free with no signup. Paste up to 200,000 characters and get the score, grade, checks, and recommendations instantly.',
    },
    {
      question: 'How to check blog scannability?',
      answer:
        'Paste your post into the tool and review the seven structural checks: content length, headings, heading density, longest paragraph, paragraph density, lists, and average sentence length. Fix the failed checks — add subheadings, break up long paragraphs, and turn grouped ideas into lists — then re-run.',
    },
    {
      question: 'What is a blog scannability checker?',
      answer:
        'A blog scannability checker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the blog scannability checker?',
      answer:
        'No account needed. Open the blog scannability checker, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'The 0–100 score is our own editorial heuristic with published deductions — it is not a Google ranking factor and not a published industry standard.',
    'Heading detection covers markdown (#) and HTML <h1>–<h6> only; other formats (Google Docs styles, etc.) are not detected.',
    'Very short posts can never score 100 because the −15 length deduction applies under 100 words — that is intentional.',
  ],
  jsonLd: [],
};
