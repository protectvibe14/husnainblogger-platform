import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/pinterest-link-in-bio-page-builder/';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'label',
    label: 'Link label',
    type: 'text',
    required: true,
    placeholder: 'e.g. My latest pins',
  },
  {
    id: 'url',
    label: 'URL',
    type: 'url',
    required: true,
    placeholder: 'https://example.com/my-page',
  },
  {
    id: 'brandName',
    label: 'Brand name (fill once)',
    type: 'text',
    required: true,
    placeholder: 'e.g. Cozy Home Studio',
  },
  {
    id: 'theme',
    label: 'Theme: light, dark, or brand (fill once)',
    type: 'text',
    required: false,
    placeholder: 'light',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'preview',
    label: 'Page preview',
    type: 'list',
    description:
    'Free pinterest link in bio page 2026: The links on your page, in order. free.',
  },
  {
    id: 'htmlFile',
    label: 'HTML file (download)',
    type: 'download',
    description:
    'Single self-contained HTML file — save it with an.html extension.',
  },
  {
    id: 'notes',
    label: 'Build notes',
    type: 'list',
    description:
    'Auto-fixes applied (like added https://) and reminders.',
  },
];

export const content: ToolContent = {
  title: 'Pinterest Link in Bio Page',
  description:
    'Build a free Pinterest link in bio page: add your links, pick a theme, and download one mobile-ready HTML file. — create your page now.',
  howTo: [
    'Click "Add item" for every link you want — type the "Link label" and paste the URL (a missing https:// is added automatically).',
    'Fill the "Brand name" field once in any row — it becomes the page title.',
    'Optionally set the theme once: light, dark, or brand (Pinterest red). Unknown values fall back to light.',
    'Click "Build list" — every row is validated, and any bad URL is reported with its item number.',
    'Use the download button to save the single HTML file, then upload it to your own hosting and put that URL in your Pinterest profile — this tool provides the page, not the hosting.',
  ],
  methodology:
    'This tool composes your link items into a single self-contained HTML file with inline CSS (three fixed themes: light, dark, brand) and one tiny inline script that points the "Pin this page" button at the page\u2019s own URL — no external assets, no network calls, offline-safe. The page includes a "Pin this page" CTA (Pinterest share URL) and a 2:3 hero slot, since Pinterest pins work best at a 2:3 ratio. Every label and URL is HTML-escaped; only http(s) URLs are accepted; invalid rows fail the build with an item-numbered error. Up to 20 links are used per page.',
  faqs: [
    {
      question: 'What is the best pinterest link in bio page?',
      answer:
        'The best page is one you own: a clean mobile-ready page with your links, no signup walls, and no platform taking a cut. This builder gives you exactly that as a single HTML file — a "Pin this page" button and a 2:3 hero slot included — which you host anywhere and link from your Pinterest profile.',
    },
    {
      question: 'Is there a free pinterest link in bio page?',
      answer:
        'Yes — this Pinterest Link-in-Bio Page Builder is completely free with no signup and no limits from us on your links (up to 20 per page). You build the page, download the HTML file, and host it wherever you like; the tool itself never charges.',
    },
    {
      question: 'How to use pinterest link in bio?',
      answer:
        'Pinterest profiles have one website link, so point it at a page that holds everything: your shop, your latest pins, your newsletter, and your other profiles. Build the page with this tool, upload the HTML file to any static host, then paste that page\u2019s URL into your Pinterest profile\u2019s website field.',
    },
    {
      question: 'How does a pinterest link in bio page work?',
      answer:
        'You add one row per link with a label and a URL, plus your brand name and a theme. The tool validates every URL, then assembles the rows into a single self-contained HTML page — one file you can download and upload to any web host. Everything runs in your browser; no hosting or accounts are involved.',
    },
    {
      question: 'How does the pinterest link in bio page work?',
      answer:
        'Enter your details using the inputs above and the pinterest link in bio page calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the pinterest link in bio page free to use?',
      answer:
        'Yes - this pinterest link in bio page is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a pinterest link in bio page?',
      answer:
        'A pinterest link in bio page is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'No hosting is provided: you must upload the downloaded file to your own hosting to get a public link.',
    'The "Pin this page" button uses the page\u2019s own URL once hosted — it cannot pin anything before the file is uploaded.',
    'Only http(s) URLs are accepted; javascript: and other schemes are rejected for safety.',
    'Labels are capped at 60 characters and pages at 20 links.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Pinterest Link in Bio Page 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free pinterest link in bio page 2026: The links on your page, in order. free.',
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
          name: 'Pinterest & Social Tools',
          item: 'https://husnainblogger.com/tools/pinterest-social/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Pinterest Link-in-Bio Page Builder',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
