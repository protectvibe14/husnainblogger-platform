import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/link-in-bio-page-builder/';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'label',
    label: 'Link label',
    type: 'text',
    required: true,
    placeholder: 'e.g. My portfolio',
  },
  {
    id: 'url',
    label: 'URL',
    type: 'url',
    required: true,
    placeholder: 'https://example.com/my-page',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'preview',
    label: 'Page preview',
    type: 'list',
    description:
    'Free link in bio page generator free 2026: The links on your page, in order. free.',
  },
  {
    id: 'htmlDownload',
    label: 'HTML file (download)',
    type: 'download',
    description:
    'Single self-contained HTML file — save it with an.html extension.',
  },
  {
    id: 'copyEmbed',
    label: 'Copy HTML',
    type: 'copy',
    description:
    'The same HTML file, copied to your clipboard.',
  },
];

export const content: ToolContent = {
  title: 'Link in Bio Page Generator Free',
  description:
    'Build a free link in bio page in seconds: add your links, preview a clean mobile-ready page, and download it as one HTML file. — create yours now.',
  howTo: [
    'Click "Add item" for every link you want on the page — type the "Link label" (e.g. "My portfolio") and paste the full "URL" starting with https://.',
    'Reorder links with the up/down buttons or remove extras so the most important link sits on top.',
    'Click "Build list" — every row is validated, and any bad URL is reported with its item number.',
    'Check the "Page preview" list to confirm the order and labels.',
    'Use the download button to save the single HTML file, or "Copy HTML" to paste it anywhere.',
    'Upload the file to your own hosting (any static host works) and put that page\u2019s URL in your Instagram bio — this tool provides the page, not the hosting.',
  ],
  methodology:
    'This tool composes your link items into a single self-contained HTML file with inline CSS (one fixed clean theme, mobile-first layout) — no external assets, no scripts, no network calls. Every label is HTML-escaped and every URL must be a valid http(s) link; invalid rows fail the build with an item-numbered error. The page title is fixed as "My Links" — edit it in the downloaded file to personalize it.',
  faqs: [
    {
      question: 'What is the best link in bio page generator free?',
      answer:
        'The best free option gives you a clean mobile-ready page with no signup and no paywall on your links. This builder does exactly that: add your labels and URLs, preview the order, and download the whole page as a single HTML file you can host anywhere.',
    },
    {
      question: 'Is there a free link in bio page generator free?',
      answer:
        'Yes — this Link in Bio Page Builder is completely free with no signup and no link limits from us. You build the page, download the HTML file, and host it wherever you like; the tool itself never charges or takes a cut.',
    },
    {
      question: 'How to generate link in bio ideas?',
      answer:
        'Start with the links your audience asks for most: your portfolio or shop, your latest post or offer, a booking or contact page, your newsletter signup, and your other social profiles. Keep the list short — five to eight links convert better than a wall of thirty.',
    },
    {
      question: 'How does a link in bio page generator free work?',
      answer:
        'You add one row per link with a label and a URL. The tool validates every URL, then assembles the rows into a single self-contained HTML page with inline styles — one file you can download, copy, and upload to any web host. Everything runs in your browser; no hosting or accounts are involved.',
    },
    {
      question: 'What is a link in bio page generator free?',
      answer:
        'A link in bio page generator free is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'No hosting is provided: the tool builds and downloads the page file, but you must upload it to your own hosting to get a public link.',
    'The exported page uses one fixed theme and the title "My Links" — personalize both by editing the downloaded HTML.',
    'Only http(s) URLs are accepted; javascript: and other schemes are rejected for safety.',
    'The page is mobile-friendly by design, but always open the downloaded file on your own phone before sharing it.',
  ],
  jsonLd: [],
};
