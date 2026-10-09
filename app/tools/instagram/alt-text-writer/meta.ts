import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

// tool-217 — Alt Text Writer (generator).

export const inputs: ToolInput[] = [
  {
    id: 'imageDescription',
    label: 'Describe the photo',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. Sunset over the beach with a surfer walking out of the water',
  },
  {
    id: 'subject',
    label: 'Main subject (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. a surfer, my dog, a flat-lay of skincare products',
  },
  {
    id: 'count',
    label: 'Number of options',
    type: 'number',
    required: false,
    validation: { min: 1, max: 5 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'altTexts', label: 'Alt-text options', type: 'list' },
  { id: 'accessibilityTips', label: 'Accessibility tips', type: 'list' },
];

export const content: ToolContent = {
  title: 'Instagram Alt Text Generator',
  description:
    'Write better alt text fast with this free instagram alt text generator: describe your photo for WCAG-style template options under 125 characters.',
  howTo: [
    'Describe the photo in the text box: what is visible, who is in it, where it was taken.',
    'Optionally name the main subject (a person, pet, or product).',
    'Choose how many options you want (1–5).',
    'Generate to get WCAG-style alt-text options, each kept to the recommended 125 characters.',
    'Copy your favorite into Instagram\'s "Write alt text" field under Advanced settings.',
  ],
  methodology:
    'Alt-text options are assembled from 8 fixed sentence templates and a 14-word mood bank, filled with your own description — the tool runs fully client-side and cannot see or analyze images. Options longer than 125 characters are trimmed at a word boundary and flagged.',
  examples: [
    {
      title: 'Beach sunset photo',
      inputs: {
        imageDescription: 'Sunset over the beach with a surfer walking out of the water',
        subject: 'a surfer',
        count: 3,
      },
      note: 'Three template-based options describing the surfer and the sunset, all under 125 characters.',
    },
    {
      title: 'Product flat-lay',
      inputs: {
        imageDescription: 'Three skincare bottles arranged on a white marble counter next to a green plant',
        subject: 'skincare bottles',
        count: 2,
      },
      note: 'Names the products, the surface, and the setting so the image makes sense to screen readers.',
    },
  ],
  faqs: [
    {
      question: 'What is the best instagram alt text generator?',
      answer:
        'This free tool assembles WCAG-style alt text from fixed templates using your own photo description — it is honest about its limits: it cannot see or analyze your image, so the quality of the description you write decides the quality of the alt text.',
    },
    {
      question: 'Is there a free instagram alt text generator?',
      answer:
        'Yes — this tool is free, runs entirely in your browser, and gives 1–5 template-based alt-text options plus accessibility tips, with every option kept to the recommended 125 characters.',
    },
    {
      question: 'How to generate instagram alt text ideas?',
      answer:
        'Describe what is visible in the photo (subject, action, setting), pick how many options you want, and generate. Copy the best option into the "Write alt text" field under Advanced settings when you post on Instagram.',
    },
    {
      question: 'How does the instagram alt text generator work?',
      answer:
        'Enter your details using the inputs above and the instagram alt text generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the instagram alt text generator free to use?',
      answer:
        'Yes - this instagram alt text generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an instagram alt text generator?',
      answer:
        'An instagram alt text generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the instagram alt text generator?',
      answer:
        'No account needed. Open the instagram alt text generator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'This tool does NOT analyze images — it writes alt text from the description you type.',
    'Options come from 8 fixed templates and a 14-word mood bank; they are not AI-written.',
    'Alt text is kept to the recommended 125 characters; longer options are trimmed and flagged.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Instagram Alt Text Generator 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/instagram/alt-text-writer/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Write better alt text fast with this free instagram alt text generator: describe your photo for WCAG-style template options under 125 characters.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Instagram Tools',
          item: 'https://husnainblogger.com/tools/instagram/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Instagram Alt Text Generator',
          item: 'https://husnainblogger.com/tools/instagram/alt-text-writer/',
        },
      ],
    },
  ],
};
