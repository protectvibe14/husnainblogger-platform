import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'brandText',
    label: 'Brand name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Blue Finch',
  },
  {
    id: 'shape',
    label: 'Shape',
    type: 'select',
    required: true,
    options: ['Circle', 'Shield', 'Hexagon', 'Badge'],
  },
  {
    id: 'palette',
    label: 'Color palette',
    type: 'select',
    required: true,
    options: ['Ocean', 'Sunset', 'Forest', 'Mono', 'Neon', 'Royal'],
  },
  {
    id: 'style',
    label: 'Text style',
    type: 'select',
    required: true,
    options: ['Monogram (initials)', 'Wordmark (full text)'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'svg',
    label: 'Logo SVG',
    type: 'copy',
    description: 'Free svg logo maker 2026: Standalone SVG markup — paste into any HTML file or save as .svg. Instant, private, and mobile-friendly. No signup - try it free!',
  },
  {
    id: 'downloadName',
    label: 'Download filename',
    type: 'text',
    description: 'Suggested filename when you save the SVG.',
  },
];

export const content: ToolContent = {
  title: 'SVG Logo Composer: Free Maker',
  description:
    'Build a real vector logo free: pick a shape, palette and text style, then copy or download the SVG markup. No signup — runs fully in your browser.',
  howTo: [
    'Enter your brand name (up to 20 characters).',
    'Choose a shape: circle, shield, hexagon or badge.',
    'Pick one of the 6 color palettes.',
    'Choose monogram (initials) or wordmark (full text) style.',
    'Copy the SVG markup or download the .svg file and use it anywhere.',
  ],
  methodology:
    'Pure geometry, run entirely in your browser — no AI, no image generation. Your brand text is XML-escaped and combined with computed primitives: circles, a shield path, a flat-top hexagon polygon (points computed with trigonometry) and a badge ring, each in the selected palette with an accent ring. Monogram mode renders the first letters of the first two words; wordmark mode scales the font to fit. The output is complete standalone SVG (200×200 viewBox) that renders in any browser.',
  examples: [
    {
      title: 'Startup monogram',
      inputs: {
        brandText: 'Northwind',
        shape: 'Hexagon',
        palette: 'Ocean',
        style: 'Monogram (initials)',
      },
      note: 'Produces a hexagon logo with a bold "N" monogram in ocean blue with a gold accent ring.',
    },
    {
      title: 'Shop wordmark',
      inputs: {
        brandText: 'Blue Finch',
        shape: 'Badge',
        palette: 'Forest',
        style: 'Wordmark (full text)',
      },
      note: 'Produces a badge logo reading "Blue Finch" in forest green with a light accent ring.',
    },
  ],
  faqs: [
    {
      question: 'Is this a professionally designed logo?',
      answer:
        'No — and the tool is honest about that. It builds a clean geometric starting mark from SVG primitives. It is great for MVPs, favicons and placeholders; a real brand identity still deserves a designer.',
    },
    {
      question: 'How do I use the SVG file?',
      answer:
        'Copy the markup straight into an HTML file, or download it as .svg and open it in any vector editor (Figma, Illustrator, Inkscape). Because it is vector, it scales to any size without blurring.',
    },
    {
      question: 'Can I change the colors afterwards?',
      answer:
        'Yes. The SVG uses plain fill attributes — open the file in a text editor and replace the hex codes, or restyle it with CSS when embedded inline.',
    },
    {
      question: 'Why is the brand text limited to 20 characters?',
      answer:
        'Long text cannot stay legible inside a 200×200 mark. For longer names, use the monogram style or shorten to the brand’s core word.',
    },
    {
      question: 'How does the svg logo maker work?',
      answer:
        'Enter your details using the inputs above and the svg logo maker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the svg logo maker free to use?',
      answer:
        'Yes - this svg logo maker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a svg logo maker?',
      answer:
        'A svg logo maker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Geometric logo built from SVG primitives — a clean starting mark, not a professionally designed identity.',
    'Four fixed shapes and six fixed palettes; no custom colors or uploaded artwork.',
    'Text uses system fonts so the SVG renders identically everywhere without font files.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SVG Logo Composer: Free Maker 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/svg-logo-composer/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free svg logo maker 2026: Standalone SVG markup — paste into any HTML file or save as .svg. Instant, private, and mobile-friendly. No signup - try it free!',
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
          name: 'AI Tools',
          item: 'https://husnainblogger.com/tools/ai-tools/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'SVG Logo Composer',
          item: 'https://husnainblogger.com/tools/ai-tools/svg-logo-composer/',
        },
      ],
    },
  ],
};
