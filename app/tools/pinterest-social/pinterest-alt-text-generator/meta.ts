import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/pinterest-alt-text-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'imageDescription',
    label: 'What is in the image?',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. a rustic wooden tray with three lit candles',
  },
  {
    id: 'keyword',
    label: 'Keyword (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. cozy fall decor',
    validation: { max: 80 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'altText',
    label: 'Alt text',
    type: 'text',
    description:
    'Free pinterest image alt text 2026: Accessibility-first alt text built from your description, with your keyword woven in once. Fast, private - try.',
  },
];

export const content: ToolContent = {
  title: 'Pinterest Image Alt Text',
  description:
    'Write alt text that helps everyone find your pins: describe your image, add a keyword, and get accessible, SEO-friendly descriptions instantly.',
  howTo: [
    'Describe what you see in the image in plain words (a keyword alone is not enough).',
    'Add your target keyword if you want it woven in naturally (optional).',
    'Run the tool to get accessibility-first alt text, capped at 500 characters.',
    'Paste it into the alt-text field when you upload the pin.',
    'Keep the description honest — describe what is actually in the image.',
  ],
  methodology:
    'The tool rephrases your own description through one of 8 fixed sentence templates — no AI and no generated copy, and no visual details are invented. If you provide a keyword, it is woven in exactly once. The template is picked deterministically from your description text, so identical inputs always return identical alt text, and anything over 500 characters is compressed.',
  examples: [
    {
      title: 'Candle photo with keyword',
      inputs: { imageDescription: 'a rustic wooden tray with three lit candles', keyword: 'cozy fall decor' },
      note: 'Descriptive alt text with the keyword woven in once.',
    },
    {
      title: 'No keyword',
      inputs: { imageDescription: 'a red bicycle leaning on a brick wall', keyword: '' },
      note: 'Pure accessibility description, no keyword.',
    },
    {
      title: 'Filler prefix cleaned',
      inputs: { imageDescription: 'image of a cat sleeping on a sofa', keyword: 'pet photography' },
      note: 'The "image of" prefix is stripped automatically.',
    },
  ],
  faqs: [
    {
      question: 'What is the best pinterest image alt text?',
      answer:
        'The best Pinterest alt text describes exactly what is in the image in one or two plain sentences, with your keyword woven in once if it fits naturally. This free generator builds that from your description and caps it at 500 characters.',
    },
    {
      question: 'Is there a free pinterest image alt text?',
      answer:
        'Yes — this Pinterest alt text generator is completely free with no signup. Describe your image, optionally add a keyword, and get accessible alt text built from fixed templates with no AI involved.',
    },
    {
      question: 'How to use pinterest image alt text?',
      answer:
        'Describe the image honestly in the first field, add your keyword in the second, then run the tool and paste the result into the alt-text field when you upload your pin. Good alt text helps screen-reader users and gives Pinterest more context about your image.',
    },
    {
      question: 'Why is alt text capped at 500 characters?',
      answer:
        'Pinterest truncates very long alt text, so the tool compresses anything over 500 characters with an ellipsis. Short, accurate descriptions also work better for screen-reader users than long keyword-stuffed paragraphs.',
    },
    {
      question: 'What is a pinterest image alt text?',
      answer:
        'A pinterest image alt text is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Alt text is assembled from 8 fixed templates around your own description — it is structured text, not AI-written, and it never invents details you did not describe.',
    'The keyword is woven in at most once; the tool does not measure keyword density or promise any SEO outcome.',
  ],
  jsonLd: [],
};
