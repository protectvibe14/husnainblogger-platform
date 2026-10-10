import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/facebook-bio-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'whoYouAre',
    label: 'Who you are',
    type: 'text',
    required: true,
    placeholder: 'e.g. Sara Malik, or "Crumb & Co Bakery"',
    validation: { max: 60 },
  },
  {
    id: 'whatYouDo',
    label: 'What you do',
    type: 'text',
    required: true,
    placeholder: 'e.g. baking custom cakes in Chicago',
    validation: { max: 120 },
  },
  {
    id: 'mode',
    label: 'Bio type',
    type: 'select',
    required: false,
    options: ['personal', 'page'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'bio',
    label: 'Your bio',
    type: 'copy',
    description:
    'Free facebook bio 2026: Your bio, trimmed to fit the selected mode\\. free.',
  },
  {
    id: 'variants',
    label: 'More variants',
    type: 'list',
    description:
    'Three extra bios from the template bank, all within the limit.',
  },
  {
    id: 'pageBio',
    label: 'Bonus: Page version',
    type: 'copy',
    description:
    'The Facebook Page short-description variant (255 chars max).',
  },
  {
    id: 'modeUsed',
    label: 'Mode used',
    type: 'text',
    description:
    'Which bio type and character limit the bio was built for.',
  },
  {
    id: 'capNote',
    label: 'Character check',
    type: 'text',
    description:
    'Bio length and whether it was trimmed to fit the limit.',
  },
];

export const content: ToolContent = {
  title: 'Facebook Bio Generator',
  description:
    'Fix your Facebook bio in just minutes: describe who you are and what you do to get polished profile and Page bios that fit the character limits.',
  howTo: [
    'Type who you are into the "Who you are" field (your name or Page name).',
    'Describe what you do in the "What you do" field, e.g. "baking custom cakes in Chicago".',
    'Pick "Bio type": personal (101 chars max) or page (255 chars max). Leave it blank to default to personal.',
    'Run the tool and copy your bio — check "More variants" for 3 alternates and "Bonus: Page version" for the Page variant.',
    'Paste the bio into your profile\'s Intro section or your Page\'s short description.',
  ],
  methodology:
    'This tool assembles bios from a fixed bank of 12 hand-written templates (6 for personal profiles, 6 for Page short descriptions), inserting your "who you are" and "what you do". The template is picked deterministically from your inputs — no AI is involved. If the assembled bio exceeds the mode\'s limit (101 or 255 chars), it is truncated at a word boundary with an ellipsis, and the tool tells you.',
  examples: [
    {
      title: 'Personal bio for a baker',
      inputs: { whoYouAre: 'Sara Malik', whatYouDo: 'baking custom cakes in Chicago', mode: 'personal' },
      note: 'Returns a personal bio within 101 characters, 3 variants, and a bonus Page version.',
    },
    {
      title: 'Page short description for a bakery',
      inputs: { whoYouAre: 'Crumb & Co Bakery', whatYouDo: 'custom cakes and daily fresh bread', mode: 'page' },
      note: 'Returns a Page short description within 255 characters.',
    },
  ],
  faqs: [
    {
      question: 'What is the best facebook bio?',
      answer:
        'The best facebook bio states who you are and what you do in one clear line, without filler — readers decide in seconds whether to follow. Personal profiles are limited to 101 characters and Pages to 255, so every word has to earn its place. This free generator builds bios from proven template patterns within those limits.',
    },
    {
      question: 'Is there a free facebook bio?',
      answer:
        'Yes — this facebook bio generator is completely free with no signup. You get a primary bio, 3 extra variants, and a bonus Page version on every run, as many times as you like.',
    },
    {
      question: 'How to use facebook bio?',
      answer:
        'Enter who you are and what you do, pick personal or Page mode, and run the tool. Copy the bio and paste it into your profile\u2019s Intro section (personal) or your Page\u2019s short description field under Page settings.',
    },
    {
      question: 'How does a facebook bio work?',
      answer:
        'Your bio is the short text shown at the top of your profile or Page — personal bios cap at 101 characters, Page short descriptions at 255. This tool fills hand-written templates with your details and trims them to fit, so the text you paste never gets cut off.',
    },
    {
      question: 'What is a facebook bio?',
      answer:
        'A facebook bio is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Bios come from a fixed bank of 12 templates (6 personal + 6 page) — the tool assembles text; it does not write with AI.',
    'Character limits (101 personal, 255 Page) reflect Facebook\u2019s documented limits; if Facebook changes them, re-check before publishing.',
    'If an assembled bio exceeds the limit it is truncated at a word boundary with an ellipsis — reword your inputs if the trimmed result feels incomplete.',
  ],
  jsonLd: [],
};
