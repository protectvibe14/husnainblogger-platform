import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/xml-sitemap-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'urls',
    label: 'URL list',
    type: 'textarea',
    required: true,
    placeholder:
      'https://example.com/ | 2026-09-30 | daily | 1.0\nhttps://example.com/about\nhttps://example.com/contact',
  },
  {
    id: 'baseUrl',
    label: 'Base URL (optional)',
    type: 'url',
    required: false,
    placeholder: 'https://example.com',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'sitemapXml',
    label: 'Sitemap XML (copy)',
    type: 'copy',
    description:
    'Free xml sitemap generator 2026: The complete XML sitemap — save it as sitemap.xml in your site root. Get instant results. free now.',
  },
  {
    id: 'urlCount',
    label: 'URL count',
    type: 'number',
    description:
    'How many URLs made it into the sitemap.',
  },
  {
    id: 'errors',
    label: 'Skipped lines',
    type: 'list',
    description:
    'Lines that were skipped (bad date, duplicate, invalid URL) and why.',
  },
];

export const content: ToolContent = {
  title: 'XML Sitemap Generator',
  description:
    'Generate a free XML sitemap for your site — the complete sitemap file, ready to save as sitemap.xml in seconds. Generate yours now!',
  howTo: [
    'Paste your "URL list" — one absolute URL per line, optionally followed by | lastmod | changefreq | priority.',
    'Use YYYY-MM-DD for lastmod, a changefreq like daily or weekly, and a priority from 0.0 to 1.0.',
    'If your list has relative paths (like /contact), add the "Base URL" so they are resolved to full URLs.',
    'Check "Skipped lines" — duplicates and invalid entries are removed and reported, never silently.',
    'Copy the "Sitemap XML", save it as sitemap.xml in your site root, and submit it in Google Search Console.',
  ],
  methodology:
    'This tool parses one URL per line (optional fields after a | separator: lastmod, changefreq, priority) and emits a sitemaps.org 0.9 XML document with proper XML escaping and percent-encoded non-ASCII characters. Validation per entry: loc must be an absolute http(s) URL (or relative when a base URL resolves it), lastmod a real YYYY-MM-DD date, changefreq one of the 7 protocol values, priority 0.0–1.0. Duplicates are removed (first wins); invalid lines are skipped and reported. The protocol limit is 50,000 URLs — longer lists fail with an error instead of being truncated. Nothing is crawled or invented; correctness of the URLs depends on your input.',
  examples: [
    {
      title: 'Small blog sitemap',
      inputs: {
        urls: 'https://example.com/\nhttps://example.com/about\nhttps://example.com/contact',
      },
      note: 'Three URLs with no optional fields — only <loc> tags are emitted.',
    },
    {
      title: 'With dates and priorities',
      inputs: {
        urls: 'https://example.com/ | 2026-09-30 | daily | 1.0\nhttps://example.com/old | 2024-01-01 | yearly | 0.3',
      },
      note: 'Full entries producing lastmod, changefreq, and priority tags.',
    },
    {
      title: 'Relative paths with base URL',
      inputs: {
        urls: '/contact\n/about',
        baseUrl: 'https://example.com',
      },
      note: 'Relative paths are resolved against the base URL into absolute URLs.',
    },
  ],
  faqs: [
    {
      question: 'What is the best xml sitemap generator?',
      answer:
        'The best xml sitemap generator produces protocol-compliant XML, validates dates and priorities, de-duplicates URLs, and needs no signup. This tool does all three — paste your URLs, copy the XML, and submit it in Google Search Console.',
    },
    {
      question: 'Is there a free xml sitemap generator?',
      answer:
        'Yes — this xml sitemap generator is completely free with no signup. Paste up to 50,000 URLs, optionally add dates, change frequencies, and priorities, then copy the valid XML.',
    },
    {
      question: 'How to generate xml sitemap?',
      answer:
        'Paste one URL per line (optionally with | lastmod | changefreq | priority after each), then copy the generated XML into a sitemap.xml file in your site root. Submit the file in Google Search Console so search engines can find it.',
    },
    {
      question: 'How does a xml sitemap generator work?',
      answer:
        'It takes the URL list you paste, validates each entry against the sitemap protocol (absolute URLs, real dates, valid priorities), and assembles them into the standard XML format. Nothing is crawled or invented by AI — every URL comes from your own list.',
    },
    {
      question: 'What is a xml sitemap generator?',
      answer:
        'A xml sitemap generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Can I customize the generated xml sitemap generator?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
    {
      question: 'What makes a good xml sitemap generator?',
      answer: 'Clarity, specificity, and relevance to your audience. Avoid generic phrases — the more specific your input, the better the output.',
    },
  ],
  assumptions: [
    'The tool validates syntax, not whether a page exists — correctness of the URLs depends on your input.',
    'One sitemap file supports at most 50,000 URLs; longer lists fail with an error rather than being silently cut off.',
    'Invalid lines are skipped and reported — check "Skipped lines" so no page is accidentally left out.',
  ],
  jsonLd: [],
};
