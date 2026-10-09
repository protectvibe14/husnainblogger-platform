import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/tweet-quote-card-maker/';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'quoteText',
    label: 'Quote text',
    type: 'text',
    required: true,
    placeholder: 'e.g. Consistency beats intensity every single time. (max 280 chars)',
  },
  {
    id: 'author',
    label: 'Author (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. Your name (max 80 chars)',
  },
  {
    id: 'theme',
    label: 'Theme',
    type: 'text',
    required: false,
    placeholder: 'light, dark, or brand (default: dark)',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'cards',
    label: 'Card summary',
    type: 'list',
    description: 'Free tweet quote image generator 2026: Each card with its theme, PNG dimensions, font size, and character count. Fast, private, no signup - try it now!',
  },
  {
    id: 'specDownload',
    label: 'Render spec (download)',
    type: 'download',
    description: 'JSON render spec per card — text, theme colors, dimensions, font size — used by the in-browser canvas renderer.',
  },
];

export const content: ToolContent = {
  title: 'Tweet Quote Image Generator',
  description:
    'Turn any quote into a sharp, shareable card with our tweet quote image generator: validate text, pick a theme, download the PNG. Make yours free!',
  howTo: [
    'Click "Add item" for each quote card — type the "Quote text" (required, max 280 characters).',
    'Optionally add the "Author" and set the "Theme" to light, dark, or brand (defaults to dark).',
    'Click "Build" — every item is validated and numbered errors flag the exact row to fix.',
    'Check the "Card summary" list for each card\'s theme, PNG dimensions, font size, and character count.',
    'Download the "Render spec" JSON if you need the exact layout values (colors, font size, dimensions).',
    'The PNG is drawn by the in-browser canvas renderer at 2x sharpness — quotes over 280 characters are rejected rather than rendered illegible.',
  ],
  methodology:
    'This tool performs pure validation and layout math: quote text is required and capped at 280 characters, the author at 80, and the theme must be light/dark/brand (anything else defaults to dark). Dimensions follow a fixed rule — quotes up to 120 characters render at 1080×1080 square, longer ones at 1200×675 landscape — and font size follows documented tiers (64px down to a 34px floor). The PNG itself is drawn client-side in the browser canvas at 2x; this module computes the spec, not the pixels. No AI, no image API, no network.',
  faqs: [
    {
      question: 'What is the best tweet quote image generator?',
      answer:
        'The best one keeps your text legible: capped length, auto-sized type, and sharp 2x export. This free maker validates your quote (max 280 characters), picks square or landscape dimensions by length, and draws the PNG in your browser — no signup, no watermark, no server upload.',
    },
    {
      question: 'Is there a free tweet quote image generator?',
      answer:
        'Yes — this tool is completely free with no signup. Add up to 20 quote cards per build, choose light/dark/brand themes, and get a per-card summary plus a downloadable render spec; the PNG renders in your browser canvas at 2x sharpness.',
    },
    {
      question: 'How to generate tweet quote image?',
      answer:
        'Add an item, type your quote (max 280 characters) and optional author, pick a theme, and click Build. The tool validates each row, computes the layout (square 1080×1080 for short quotes, 1200×675 landscape for longer ones), and the page\'s canvas renderer draws the downloadable PNG.',
    },
    {
      question: 'How does a tweet quote image generator work?',
      answer:
        'It validates your text, applies fixed layout rules (dimension by length, font-size tiers from 64px to a 34px floor, three fixed color themes), and produces a render spec. The actual PNG is drawn client-side in the browser — no image is ever sent to a server, and emoji renders via your system font.',
    },
    {
      question: 'How does the tweet quote image generator work?',
      answer:
        'Enter your details using the inputs above and the tweet quote image generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tweet quote image generator free to use?',
      answer:
        'Yes - this tweet quote image generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tweet quote image generator?',
      answer:
        'A tweet quote image generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The PNG is drawn by the page\'s client-side canvas renderer — this logic module validates input and computes the layout spec, it does not render pixels itself.',
    'Quotes over 280 characters are rejected instead of shrunk to illegible sizes; shorten the text and rebuild.',
    'Emoji in quotes renders via the viewer\'s system font, so appearance may vary slightly across devices.',
    'Download and canvas rendering require a modern browser with JavaScript enabled.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Tweet Quote Image Generator 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free tweet quote image generator 2026: Each card with its theme, PNG dimensions, font size, and character count. Fast, private, no signup - try it now!',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Pinterest, X & Facebook',
          item: 'https://husnainblogger.com/tools/pinterest-social/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Tweet Quote Card Maker',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
