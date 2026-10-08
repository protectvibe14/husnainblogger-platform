import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/email-marketing/plain-text-email-formatter/';

export const inputs: ToolInput[] = [
  {
    id: 'richText',
    label: 'HTML email content',
    type: 'textarea',
    required: true,
    placeholder: 'Paste your HTML email here…',
  },
  {
    id: 'lineWidth',
    label: 'Line width (characters)',
    type: 'number',
    required: false,
    placeholder: '72',
    validation: { min: 40, max: 120 },
  },
  {
    id: 'linkStyle',
    label: 'Link style',
    type: 'select',
    required: true,
    options: ['inline', 'footnote'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'plainText',
    label: 'Plain-text version',
    type: 'copy',
    description: 'Free html to plain text email converter 2026: Linearized plain-text version of the pasted HTML, wrapped to the chosen line width. Fast, private, no signup -!',
  },
  {
    id: 'stats',
    label: 'Output stats',
    type: 'text',
    description: 'Line and character counts of the generated plain-text version.',
  },
];

export const content: ToolContent = {
  title: 'Html to Plain Text Email Converter 2026 | HusnainBlogger',
  description:
    'Convert an HTML email to a clean plain-text version. Paste your HTML, pick inline or footnote links, and copy the wrapped result with line stats. Free!',
  howTo: [
    'Paste your HTML email content into the text box.',
    'Set the line width (default 72 characters, allowed 40–120).',
    'Choose inline links (text + URL) or footnote links (numbered list at the end).',
    'Run the tool to get the plain-text version plus line/character stats.',
    'Copy the result as the text part of your multipart email — then test-send, since this is a text transformation, not a render preview.',
  ],
  methodology:
    'The formatter applies fixed deterministic rules: script/style blocks are dropped, block tags become line breaks, links become inline "text (url)" or numbered footnotes, images fall back to their alt text, entities are decoded, and lines are wrapped at your width in Unicode code points. No AI, no network — and no claim of rendering fidelity: it never previews how an email client will display the message.',
  examples: [
    {
      title: 'Newsletter snippet, inline links',
      inputs: {
        richText: '<h1>Weekly Update</h1><p>Read our <a href="https://example.com/post">latest post</a>.</p>',
        lineWidth: 72,
        linkStyle: 'inline',
      },
      note: 'Links render as "latest post (https://example.com/post)" right in the text.',
    },
    {
      title: 'Promo email, footnote links',
      inputs: {
        richText: '<p>Shop the <a href="https://example.com/sale">sale</a> and <a href="https://example.com/new">new arrivals</a>.</p>',
        lineWidth: 72,
        linkStyle: 'footnote',
      },
      note: 'Links become numbered references with a "Links:" list appended at the end.',
    },
  ],
  faqs: [
    {
      question: 'What is the best html to plain text email converter?',
      answer:
        'The best html to plain text email converter linearizes your HTML deterministically: links become inline text or numbered footnotes, images fall back to alt text, and lines wrap at a set width. This free converter does exactly that — but note it is a text transformation, not a preview of how any email client will render your message.',
    },
    {
      question: 'Is there a free html to plain text email converter?',
      answer:
        'Yes — this html to plain text email converter is completely free with no signup. Paste your HTML, choose inline or footnote link style, and copy the wrapped plain-text version with line and character stats.',
    },
    {
      question: 'How to convert html to plain text email?',
      answer:
        'Paste your HTML into the tool, set a line width (default 72 characters), and choose inline or footnote links. Run it, then copy the plain-text output as the text part of your multipart email so recipients on text-only clients still get a readable message.',
    },
    {
      question: 'How does a html to plain text email converter work?',
      answer:
        'It applies fixed transformation rules: it strips markup, turns block elements into line breaks, converts links to text-plus-URL (inline or footnoted), replaces images with their alt text, decodes entities, and wraps lines. This converter does all of that locally and deterministically — it never claims to show how an email client will render the HTML.',
    },
    {
      question: 'How does the html to plain text email converter work?',
      answer:
        'Enter your details using the inputs above and the html to plain text email converter calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the html to plain text email converter free to use?',
      answer:
        'Yes - this html to plain text email converter is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a html to plain text email converter?',
      answer:
        'A html to plain text email converter is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'This is a deterministic text transformation, not a rendering preview — it cannot show how any email client will display the HTML.',
    'Script and style content is dropped entirely; images render as their alt text only.',
    'Line width is clamped to 40–120 characters; tokens longer than the width (e.g. long URLs) are hard-broken.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Html to Plain Text Email Converter 2026 | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free html to plain text email converter 2026: Linearized plain-text version of the pasted HTML, wrapped to the chosen line width. Fast, private, no signup -!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Email Marketing Tools',
          item: 'https://husnainblogger.com/tools/email-marketing/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Plain-Text Email Formatter',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
