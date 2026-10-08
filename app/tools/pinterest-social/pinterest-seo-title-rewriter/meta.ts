import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/pinterest-seo-title-rewriter/';

export const inputs: ToolInput[] = [
  {
    id: 'draftTitle',
    label: 'Draft pin title',
    type: 'text',
    required: true,
    placeholder: 'e.g. how to organize a tiny closet',
    validation: { max: 200 },
  },
  {
    id: 'primaryKeyword',
    label: 'Primary keyword',
    type: 'text',
    required: true,
    placeholder: 'e.g. small closet organization',
    validation: { max: 100 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'rewrites',
    label: 'Title rewrites',
    type: 'list',
    description:
      'Free pinterest seo 2026: Title variants from a fixed pattern bank. Every rewrite is 100 characters or fewer,. Fast, private, no signup - try it now!',
  },
  {
    id: 'note',
    label: 'Optimization note',
    type: 'text',
    description:
      'Empty unless your draft already front-loads the keyword — then it says so and the variants below are optional alternatives.',
  },
];

export const content: ToolContent = {
  title: 'Pinterest SEO Title Rewriter 2026 – Free | HusnainBlogger',
  description:
    'Boost pinterest seo with this free title rewriter. Enter your draft and keyword to get front-loaded, under-100-character title variants instantly. Try it now!',
  howTo: [
    'Enter your draft pin title (up to 200 characters).',
    'Enter your primary keyword (up to 100 characters).',
    'Run the tool to get title rewrites from a fixed pattern bank.',
    'Pick the variant that front-loads your keyword naturally and fits your pin.',
    'If your draft already front-loads the keyword, the tool tells you — the variants are optional.',
  ],
  methodology:
    'The tool fills 18 fixed title patterns with your keyword and the core of your draft — no AI and no generated copy. It only keeps variants that are 100 characters or fewer and place your keyword within the first five words, then returns them in fixed bank order, so identical inputs always give identical results. Front-loading the keyword is a common Pinterest SEO convention, not a guarantee of reach.',
  examples: [
    {
      title: 'Closet organization draft',
      inputs: { draftTitle: 'how to organize a tiny closet', primaryKeyword: 'small closet organization' },
      note: 'Variants like "Small Closet Organization: how to organize a tiny closet".',
    },
    {
      title: 'Already-optimized draft',
      inputs: { draftTitle: 'Small closet organization on a budget', primaryKeyword: 'small closet organization' },
      note: 'Returns variants plus an "already optimized" note.',
    },
    {
      title: 'Keyword-only draft',
      inputs: { draftTitle: 'fall wreaths', primaryKeyword: 'fall wreaths' },
      note: 'Uses keyword-only fallback patterns when the draft has no extra core.',
    },
  ],
  faqs: [
    {
      question: 'What is the best pinterest seo?',
      answer:
        'The best Pinterest SEO starts with a clear keyword in your pin title — ideally in the first few words — plus a matching description and relevant boards. This free rewriter handles the title part: it front-loads your keyword into variants that stay under 100 characters.',
    },
    {
      question: 'Is there a free pinterest seo?',
      answer:
        'Yes — this Pinterest SEO title rewriter is completely free with no signup. Enter your draft title and primary keyword to get a list of front-loaded title variants built from a fixed pattern bank.',
    },
    {
      question: 'How to use pinterest seo?',
      answer:
        'Enter your draft title and primary keyword, then pick the rewrite that reads most naturally with your keyword up front. Use it as your pin title, and pair it with a keyword-rich pin description for the full effect.',
    },
    {
      question: 'Why do rewrites cap at 100 characters?',
      answer:
        'Long titles get cut off in Pinterest feeds and search results, so the tool drops any pattern that exceeds 100 characters after filling in your keyword and draft. Short, front-loaded titles stay fully readable everywhere your pin appears.',
    },
    {
      question: 'How does the pinterest seo work?',
      answer:
        'Enter your details using the inputs above and the pinterest seo calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the pinterest seo free to use?',
      answer:
        'Yes - this pinterest seo is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a pinterest seo?',
      answer:
        'A pinterest seo is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Rewrites come from 18 fixed patterns — wording is templated, not AI-written. Pick the one that sounds most natural for your niche.',
    'Keyword front-loading is a widely used SEO convention, not a ranking guarantee; the tool makes no claims about reach or traffic.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Pinterest SEO Title Rewriter 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free pinterest seo 2026: Title variants from a fixed pattern bank. Every rewrite is 100 characters or fewer,. Fast, private, no signup - try it now!',
    },
    {
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
          name: 'Pinterest SEO Title Rewriter',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
