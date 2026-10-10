import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/pinterest-idea-pin-script-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Idea pin topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. small balcony garden',
    validation: { max: 120 },
  },
  {
    id: 'pageCount',
    label: 'Number of pages',
    type: 'number',
    required: false,
    placeholder: '5',
    validation: { min: 1, max: 20 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'scriptPages',
    label: 'Page-by-page script',
    type: 'table',
    description:
    'Free pinterest idea pin ideas 2026: One row per page: page number, visual direction, on-screen text (kept short for 9:16). Fast, private.',
  },
  {
    id: 'warning',
    label: 'Platform notes',
    type: 'text',
    description:
    'Empty unless something needs attention — e.g. the page count was clamped to 20, or your topic hints at an outbound link (idea pins carry none).',
  },
];

export const content: ToolContent = {
  title: 'Pinterest Idea Pin Ideas',
  description:
    'Script your idea pins page by page: enter your topic and page count for a complete visual, text, and caption plan covering every single page.',
  howTo: [
    'Enter your idea pin topic (up to 120 characters).',
    'Choose the number of pages, from 1 to 20 (defaults to 5).',
    'Run the tool to get a page-by-page script: visual direction, on-screen text, and caption line for each page.',
    'Film page 1 as the hook, the middle pages as steps, and the final page as your call to action.',
    'Keep on-screen text short and vertical — the tool already trims it for 9:16 readability.',
  ],
  methodology:
    'The tool assembles scripts from a fixed bank of 72 hand-written templates — hook lines, visual directions, step frames, and closing calls to action — with no AI and no generated copy. It picks one deterministic variant per page from your topic text, so the same topic and page count always produce the identical script. On-screen text is hard-capped at 90 characters and captions at 220.',
  examples: [
    {
      title: '5-page balcony garden pin',
      inputs: { topic: 'small balcony garden', pageCount: 5 },
      note: 'Hook page, three numbered steps, and a save/follow closing page.',
    },
    {
      title: '3-page quick tip pin',
      inputs: { topic: 'meal prep bowls', pageCount: 3 },
      note: 'Compact hook, one step, and a call-to-action page.',
    },
    {
      title: 'Link-hint topic with warning',
      inputs: { topic: 'shop my handmade soaps - link in bio', pageCount: 4 },
      note: 'Adds a warning that idea pins carry no outbound link.',
    },
  ],
  faqs: [
    {
      question: 'What is the best pinterest idea pin ideas?',
      answer:
        'The best idea pins follow a simple arc: one strong hook page, a few clear step pages, and a final call-to-action page. This free generator builds that exact page-by-page script from your topic, with visual directions and caption lines included.',
    },
    {
      question: 'Is there a free pinterest idea pin ideas?',
      answer:
        'Yes — this Pinterest idea pin script generator is completely free with no signup. Enter your topic and page count, and get a full page-by-page script with hook, steps, and closing call to action.',
    },
    {
      question: 'How to use pinterest idea pin?',
      answer:
        'Enter your topic, pick a page count between 1 and 20, then film the pages the tool scripts for you: hook first, steps in the middle, call to action last. Keep the on-screen text the tool gives you short and readable in vertical 9:16.',
    },
    {
      question: 'How does a pinterest idea pin ideas work?',
      answer:
        'You give the tool a topic and page count, and it assembles a script from a fixed template bank — one visual direction, one short on-screen text, and one caption line per page. It is deterministic: the same inputs always return the same script, and it warns you if your topic hints at an outbound link, which idea pins do not support.',
    },
    {
      question: 'What is a pinterest idea pin ideas?',
      answer:
        'A pinterest idea pin ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Can I customize the generated pinterest idea pin ideas?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
    {
      question: 'What makes a good pinterest idea pin ideas?',
      answer: 'Clarity, specificity, and relevance to your audience. Avoid generic phrases — the more specific your input, the better the output.',
    },
  ],
  assumptions: [
    'Scripts are assembled from 72 fixed templates — the wording is structured text, not AI-written copy. Rewrite it in your own voice before filming.',
    'The 20-page cap and the no-outbound-link rule are treated as static platform facts; the tool does not verify live Pinterest limits.',
  ],
  jsonLd: [],
};
