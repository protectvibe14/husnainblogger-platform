import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/robots-txt-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'rules',
    label: 'Crawl rules',
    type: 'textarea',
    required: true,
    placeholder:
      'User-agent: *\nDisallow: /admin/\nAllow: /public/\n\nUser-agent: Googlebot\nDisallow: /private/',
  },
  {
    id: 'sitemapUrl',
    label: 'Sitemap URL (optional)',
    type: 'url',
    required: false,
    placeholder: 'https://example.com/sitemap.xml',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'robotsTxt',
    label: 'robots.txt file (copy)',
    type: 'copy',
    description:
    'Free robots.txt generator 2026: The complete robots.txt — save it as robots.txt in your site root. Get instant results. free now.',
  },
  {
    id: 'errors',
    label: 'Notes and corrections',
    type: 'list',
    description:
    'Auto-corrections and notes, e.g. paths fixed to start with "/".',
  },
];

export const content: ToolContent = {
  title: 'Robots.txt Generator',
  description:
    'Write a valid robots.txt file in minutes, not hours. Add your crawl rules and sitemap URL, then copy the ready-to-upload file. Free.',
  howTo: [
    'Type your "Crawl rules" using one directive per line: User-agent:, Disallow:, or Allow:.',
    'Separate rule groups with a blank line — one group per crawler (e.g. "*" for all, "Googlebot" for Google).',
    'Optionally add your "Sitemap URL" so crawlers can find your sitemap from the file.',
    'Check "Notes and corrections" — paths missing a leading "/" are fixed automatically and reported.',
    'Copy the "robots.txt file", save it as robots.txt in your site root, and test it in Google Search Console.',
  ],
  methodology:
    'This tool parses a simple line format (User-agent:, Allow:, Disallow: — case-insensitive, one directive per line, blank line starts a new group, # lines ignored) and emits standard robots.txt text: one User-agent group per block followed by an optional Sitemap: line. Paths not starting with "/" are corrected by prepending "/" and reported; non-ASCII paths are percent-encoded; an empty Disallow for an agent means "allow all" per the standard and is noted. Every rule in the output comes from your own input — nothing is invented. Correctness of the URLs themselves depends on the paths you enter.',
  examples: [
    {
      title: 'Block admin, allow the rest',
      inputs: {
        rules: 'User-agent: *\nDisallow: /admin/\nDisallow: /private/',
        sitemapUrl: 'https://example.com/sitemap.xml',
      },
      note: 'Two blocks of rules plus a Sitemap line in the output file.',
    },
    {
      title: 'Allow everything',
      inputs: { rules: 'User-agent: *\nDisallow:' },
      note: 'An empty Disallow means crawlers may access everything — the tool notes this.',
    },
    {
      title: 'Auto-corrected path',
      inputs: { rules: 'User-agent: *\nDisallow: admin' },
      note: '"admin" is corrected to "/admin" and the correction is reported in Notes and corrections.',
    },
  ],
  faqs: [
    {
      question: 'What is the best robots.txt generator?',
      answer:
        'The best robots.txt generator produces standard-compliant User-agent groups, validates paths, reports corrections, and needs no signup. This tool does all three — type your rules, copy the file, and upload it to your site root.',
    },
    {
      question: 'Is there a free robots.txt generator?',
      answer:
        'Yes — this robots.txt generator is completely free with no signup. Type your crawl rules, optionally add your sitemap URL, and copy the ready-to-upload file.',
    },
    {
      question: 'How to generate robots txt?',
      answer:
        'Type one directive per line (User-agent:, Disallow:, Allow:), separate crawler groups with a blank line, add your sitemap URL if you have one, then copy the generated file. Save it as robots.txt in your site root and test it in Google Search Console.',
    },
    {
      question: 'How does a robots.txt generator work?',
      answer:
        'It takes the crawl rules you type and formats them into a valid robots.txt file with correct User-agent groups and path syntax, correcting small mistakes like missing leading slashes. Nothing is invented by AI — every rule comes from your own input.',
    },
    {
      question: 'How does the robots.txt generator work?',
      answer:
        'Enter your details using the inputs above and the robots.txt generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the robots.txt generator free to use?',
      answer:
        'Yes - this robots.txt generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a robots.txt generator?',
      answer:
        'A robots.txt generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Whether a URL is actually blocked or allowed depends on the paths you enter — review them before publishing.',
    'robots.txt is a crawling hint to search engines, not a security control — it does not keep private pages hidden from people.',
    'An empty Disallow for an agent means "allow all" per the standard; the tool notes this rather than changing it.',
  ],
  jsonLd: [],
};
