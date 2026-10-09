import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/utm-link-builder/';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'baseUrl',
    label: 'Base URL',
    type: 'url',
    required: true,
    placeholder: 'https://example.com/blog/your-post/',
  },
  {
    id: 'utmSource',
    label: 'UTM source',
    type: 'text',
    required: true,
    placeholder: 'e.g. newsletter, google, instagram',
  },
  {
    id: 'utmMedium',
    label: 'UTM medium',
    type: 'text',
    required: true,
    placeholder: 'e.g. email, cpc, social',
  },
  {
    id: 'utmCampaign',
    label: 'UTM campaign (recommended)',
    type: 'text',
    required: false,
    placeholder: 'e.g. spring-launch-2026',
  },
  {
    id: 'utmTerm',
    label: 'UTM term (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. paid keyword',
  },
  {
    id: 'utmContent',
    label: 'UTM content (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. sidebar-cta',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'lines',
    label: 'Tagged URLs',
    type: 'list',
    description:
    'Free utm link builder 2026: One fully built UTM-tagged URL per item, ready to copy. free.',
  },
  {
    id: 'warnings',
    label: 'Build warnings',
    type: 'list',
    description:
    'Warnings such as missing campaign names or overwritten UTM parameters.',
  },
  {
    id: 'count',
    label: 'URLs built',
    type: 'number',
    description:
    'How many tagged URLs were built.',
  },
];

export const content: ToolContent = {
  title: 'UTM Link Builder',
  description:
    'Build tracked campaign URLs with this free utm link builder: add UTM parameters, keep existing links intact, and catch overwrites instantly.',
  howTo: [
    'Add one item per link and paste the base URL (must start with http:// or https://).',
    'Enter the UTM source and medium — for example, newsletter and email.',
    'Add a campaign name (strongly recommended), plus optional term and content values.',
    'Run the tool to get the finished tagged URL, properly encoded and ready to copy.',
    'Read the warnings: missing campaigns and overwritten UTM parameters are flagged for you.',
  ],
  methodology:
    'The tool validates each base URL, then appends utm_source, utm_medium, utm_campaign, utm_term, and utm_content using the documented Google Analytics UTM parameter convention. Values are encoded with encodeURIComponent (RFC 3986). Existing non-UTM query parameters and URL fragments are preserved exactly as typed; any existing utm_* parameters are overwritten and reported as warnings. Nothing is fetched or tracked — this is a URL string builder with validation.',
  faqs: [
    {
      question: 'what is the best utm link builder?',
      answer:
        'The best utm link builder does more than concatenate strings: it validates the base URL, encodes values correctly, preserves your existing query parameters and fragments, and warns you when it overwrites an existing UTM value. This free tool does all of that with no signup.',
    },
    {
      question: 'is there a free utm link builder?',
      answer:
        'Yes — this utm link builder is completely free with no signup. Add your links, fill in source, medium, and campaign, and you get correctly encoded tagged URLs instantly.',
    },
    {
      question: 'how to build utm link?',
      answer:
        'Paste your destination URL, add utm_source (where the traffic comes from), utm_medium (the channel), and utm_campaign (the promotion name). Optionally add utm_term and utm_content for finer detail. The tool assembles them into one clean, encoded URL.',
    },
    {
      question: 'how does an utm link builder work?',
      answer:
        'It appends standardized UTM query parameters to your URL — values like newsletter, email, and spring-launch become ?utm_source=newsletter&utm_medium=email&utm_campaign=spring-launch. Analytics tools such as Google Analytics read these parameters to attribute traffic to the right campaign.',
    },
    {
      question: 'How does the utm link builder work?',
      answer:
        'Enter your details using the inputs above and the utm link builder calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the utm link builder free to use?',
      answer:
        'Yes - this utm link builder is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an utm link builder?',
      answer:
        'An utm link builder is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'This is a URL string builder — it does not check whether the URL is live or whether tracking is installed on the page.',
    'Values are encoded per RFC 3986 (space becomes %20); conventions such as lowercase hyphenated values are recommended for clean GA4 reports but not enforced.',
    'The URL host may be lowercased by the parser; the path, query, and fragment are otherwise preserved as typed.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'UTM Link Builder 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free utm link builder 2026: One fully built UTM-tagged URL per item, ready to copy. free.',
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
          name: 'UTM Link Builder',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
