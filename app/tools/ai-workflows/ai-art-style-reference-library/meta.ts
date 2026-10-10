import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'style',
    label: 'Art style',
    type: 'select',
    required: true,
    options: [
      'Cyberpunk',
      'Photorealistic',
      'Watercolor',
      'Oil Painting',
      'Anime',
      'Pixel Art',
      '3D Render',
      'Low Poly',
      'Line Art',
      'Pop Art',
      'Steampunk',
      'Vaporwave',
      'Dark Fantasy',
      'Minimalist',
      'Flat Vector',
      'Isometric',
      'Double Exposure',
      'Charcoal Sketch',
      'Claymation',
      'Neon Noir',
    ],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'styleName', label: 'Style', type: 'text' },
  { id: 'description', label: 'What it looks like', type: 'text' },
  {
    id: 'exampleSnippet',
    label: 'Example prompt snippet',
    type: 'copy',
    description:
    'Free ai art styles list 2026: Paste this into your image generator and adapt it to your subject. Get instant results. free now.',
  },
  { id: 'tags', label: 'Tags', type: 'list' },
  { id: 'sampleKeywords', label: 'Sample keywords', type: 'list' },
];

export const content: ToolContent = {
  title: 'AI Art Styles List',
  description:
    'Pick a style from this curated AI art styles list to see its look, copy an example prompt snippet, and get tags plus keywords. Free - explore now.',
  howTo: [
    'Choose an art style from the dropdown list.',
    'Read the style card: a short description of what it looks like.',
    'Copy the example prompt snippet into your favorite image generator.',
    'Use the tags and sample keywords to refine or search for the style.',
    'Try several styles to find the look that fits your project.',
  ],
  methodology:
    'A fixed reference library of 20 art styles. Every description and example snippet was written by a human as a static reference — nothing is generated, ranked, or scored by AI. Selecting a style simply looks up its card.',
  examples: [
    {
      title: 'Cyberpunk look',
      inputs: { style: 'Cyberpunk' },
      note: 'Shows the neon-city description, a copyable snippet, and style keywords.',
    },
    {
      title: 'Watercolor mood',
      inputs: { style: 'Watercolor' },
      note: 'Soft painting reference with snippet and tags.',
    },
    {
      title: 'Flat vector for blogs',
      inputs: { style: 'Flat Vector' },
      note: 'Clean modern-illustration reference popular for blog graphics.',
    },
  ],
  faqs: [
    {
      question: 'What is the best AI art styles list?',
      answer:
        'The best list is a curated one with visual descriptions and copyable examples for each style. This free library covers 20 popular styles with a human-written description, example snippet, tags, and keywords per style.',
    },
    {
      question: 'Is there a free AI art styles list?',
      answer:
        'Yes — this AI Art Styles List is free with no signup. Pick any style to get its description, an example prompt snippet, tags, and sample keywords instantly.',
    },
    {
      question: 'How do you use AI art styles?',
      answer:
        'Choose a style, then add its name and a snippet like the examples here to your image prompt. Many generators respond well to style keywords such as "watercolor", "pixel art", or "3d render".',
    },
    {
      question: 'How does an AI art styles list work?',
      answer:
        'It is a reference: each entry describes what the style looks like and gives you words to use in your prompts. Select a style on this page to see its full card with a copyable example snippet.',
    },
    {
      question: 'How does the ai art styles list work?',
      answer:
        'Enter your details using the inputs above and the ai art styles list calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai art styles list free to use?',
      answer:
        'Yes - this ai art styles list is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an ai art styles list?',
      answer:
        'An ai art styles list is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'A fixed reference of 20 styles — it does not cover every art style that exists.',
    'Descriptions and snippets are human-written references, not AI output.',
    'Image generators vary; results differ between models and settings.',
  ],
  jsonLd: [],
};
