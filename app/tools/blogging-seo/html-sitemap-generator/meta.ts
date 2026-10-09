import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/html-sitemap-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'pages',
    label: 'Page list',
    type: 'textarea',
    required: true,
    placeholder:
      'Home | https://example.com/\nGetting Started | https://example.com/start | Guides\nPricing | /pricing | Company',
  },
  {
    id: 'siteName',
    label: 'Site name (optional)',
    type: 'text',
    required: false,
    placeholder: 'Example Blog',
    validation: { max: 100 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'sitemapHtml',
    label: 'HTML sitemap (copy)',
    type: 'copy',
    description:
    'Free html sitemap generator 2026: The HTML fragment — paste it into your sitemap page so it inherits your styling. Fast, private now.',
  },
  {
    id: 'pageCount',
    label: 'Page count',
    type: 'number',
    description:
    'How many pages made it into the sitemap.',
  },
];

export const content: ToolContent = {
  title: 'HTML Sitemap Generator',
  description:
    'Create a clean, human-readable HTML sitemap for your visitors. Paste your pages, group them into sections, and copy the HTML. Free.',
  howTo: [
    'Paste your "Page list" — one page per line as title | URL | optional section.',
    'Use full URLs (https://…) or paths starting with "/" — other values are skipped and reported.',
    'Group pages by adding a section after the second |, e.g. "Pricing | /pricing | Company".',
    'Optionally add your "Site name" — it appears in the main heading of the sitemap.',
    'Copy the "HTML sitemap" fragment and paste it into a page on your site so it inherits your theme\'s styling.',
  ],
  methodology:
    'This tool parses one page per line (title | URL | optional section), validates each entry, and renders an HTML fragment: an <h1> heading, <h2> headings per section (sections keep first-seen order; pages without a section go under "General"), and linked <ul>/<li> lists with HTML-escaped titles and URLs. URLs may be absolute http(s) or root-relative; non-ASCII characters are percent-encoded. Duplicates are removed (first wins); invalid lines are skipped and reported in an HTML comment at the top of the output — nothing is silently dropped. The fragment is unstyled on purpose: it is meant to be pasted into your site template.',
  examples: [
    {
      title: 'Sectioned site map',
      inputs: {
        pages: 'Home | https://example.com/\nGetting Started | https://example.com/start | Guides\nPricing | /pricing | Company',
        siteName: 'Example Blog',
      },
      note: 'Pages grouped under Guides and Company headings with "Example Blog Sitemap" as the title.',
    },
    {
      title: 'Simple flat list',
      inputs: { pages: 'Home | https://example.com/\nAbout | /about' },
      note: 'No sections given — a single plain list with no section headings.',
    },
    {
      title: 'Bad line reported',
      inputs: { pages: 'Good | https://example.com/\nBroken | example.com/no-scheme' },
      note: 'The bad line is skipped and reported in an HTML comment; the good page is still listed.',
    },
  ],
  faqs: [
    {
      question: 'What is the best html sitemap generator?',
      answer:
        'The best html sitemap generator builds a clean, linked page list, supports sections, escapes markup safely, and needs no signup. This tool does all three — paste your pages, copy the HTML, and add it to your site.',
    },
    {
      question: 'Is there a free html sitemap generator?',
      answer:
        'Yes — this html sitemap generator is completely free with no signup. Paste up to 2,000 pages, optionally group them into sections, and copy the ready-to-use HTML.',
    },
    {
      question: 'How to generate html sitemap?',
      answer:
        'Paste one page per line as title | URL | optional section, optionally add your site name, then copy the generated HTML fragment. Paste it into a page on your site so it picks up your theme\'s styling.',
    },
    {
      question: 'How does a html sitemap generator work?',
      answer:
        'It takes the page list you paste and renders it as an HTML fragment with headings and linked lists, grouped by the sections you provide. Nothing is crawled or invented by AI — every page comes from your own list.',
    },
    {
      question: 'How does the html sitemap generator work?',
      answer:
        'Enter your details using the inputs above and the html sitemap generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the html sitemap generator free to use?',
      answer:
        'Yes - this html sitemap generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a html sitemap generator?',
      answer:
        'A html sitemap generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The tool generates an unstyled HTML fragment — paste it into your site template so it inherits your styling and navigation.',
    'URLs must be absolute or start with "/" — other values are skipped and reported in an HTML comment at the top of the output.',
    'Pages without a section are grouped under a "General" heading when other sections exist.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'HTML Sitemap Generator 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free html sitemap generator 2026: The HTML fragment — paste it into your sitemap page so it inherits your styling. Fast, private now.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Blogging & SEO Tools',
          item: 'https://husnainblogger.com/tools/blogging-seo/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'HTML Sitemap Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
