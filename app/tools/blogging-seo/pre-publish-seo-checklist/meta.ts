import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/pre-publish-seo-checklist/';

export const inputs: ToolInput[] = [
  {
    id: 'title',
    label: 'Draft title',
    type: 'text',
    required: false,
    placeholder: 'e.g. 10 Email Marketing Tips for Beginners',
    validation: { max: 200 },
  },
  {
    id: 'metaDescription',
    label: 'Meta description',
    type: 'textarea',
    required: false,
    placeholder: 'Paste your draft meta description…',
    validation: { max: 500 },
  },
  {
    id: 'targetKeyword',
    label: 'Target keyword',
    type: 'text',
    required: false,
    placeholder: 'e.g. email marketing tips',
    validation: { max: 100 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'checklist',
    label: 'Pre-publish checklist',
    type: 'table',
    description:
    '12 checks: status (pass/fail/manual), how-to, and the finding for evaluated checks.',
  },
  {
    id: 'passCount',
    label: 'Checks passed',
    type: 'number',
    description:
    'How many automatic checks passed.',
  },
  {
    id: 'failCount',
    label: 'Checks failed',
    type: 'number',
    description:
    'How many automatic checks failed.',
  },
];

export const content: ToolContent = {
  title: 'Blog Post SEO Checklist',
  description:
    'Free blog post SEO checklist 2026: auto-check your title, meta description and keyword plus 8 manual on-page items before you publish. Free to use..',
  howTo: [
    'Paste your draft title, meta description and target keyword (all optional).',
    'Run the tool to evaluate what it can check automatically: title and meta length, keyword presence.',
    'Work through the manual checks it cannot see: slug, H1, images, links, mobile preview.',
    'Fix every "fail", then re-run with the updated text until all automatic checks pass.',
  ],
  methodology:
    'The tool performs pure string checks on the three optional fields you paste in: title length against 30–60 characters, meta description against 120–160, and case-insensitive keyword presence in both — these length targets are common industry guidance, not Google rules. Anything the tool cannot see (slug, headings, images, links, rendering) becomes an honest "manual" item instead of a guessed result. Leave all fields empty for the generic version. No AI, no page fetch, no live data.',
  examples: [
    {
      title: 'Well-formed draft',
      inputs: {
        title: 'Best blog post SEO checklist for beginners',
        metaDescription:
          'Learn blog post SEO the easy way: this checklist covers titles, meta descriptions and on-page basics for beginners.',
        targetKeyword: 'blog post seo',
      },
      note: '3 passes, 1 fail — the meta description is 115 characters, under the 120–160 target.',
    },
    {
      title: 'Empty draft (generic checklist)',
      inputs: {},
      note: 'All 12 checks marked manual — general guidance to work through by hand.',
    },
  ],
  faqs: [
    {
      question: 'How long should a blog post be for seo?',
      answer: 'This is a common question about how long should a blog post be for seo. Use the tool above to get your answer instantly - it is free and requires no signup.',
    },
    {
      question: 'What is the best blog post SEO checklist?',
      answer:
        'No independent test crowns one checklist "the best" — the honest split is what a tool can check versus what it cannot. This free checklist auto-evaluates your title, meta description and keyword, and marks everything else (slug, H1, images, links) as manual items to verify by hand instead of inventing results.',
    },
    {
      question: 'Is there a free blog post SEO checklist?',
      answer:
        'Yes — this tool is completely free with no signup. Paste your draft title, meta description and target keyword for instant length and keyword checks, plus 8 manual checks to work through before publishing.',
    },
    {
      question: 'How to use a blog post SEO checklist?',
      answer:
        'Run your draft through the automatic checks first (title 30–60 characters, meta 120–160, keyword in both), fix every fail, then verify the manual items on the actual page: slug, single H1, image alt text, internal and external links, and a mobile preview.',
    },
    {
      question: 'How does a blog post SEO checklist work?',
      answer:
        'This one compares the title and meta description you paste against published length guidance and checks keyword presence — simple string math, no AI. Checks the tool cannot perform are listed as manual so you verify them yourself on the page.',
    },
    {
      question: 'What should be on an SEO checklist before publishing?',
      answer:
        'The basics are a focused title, a compelling meta description, your target keyword in the key spots, a clean slug, one H1, image alt text, internal and external links, and a mobile preview. This tool auto-checks title and meta length plus keyword presence across 12 checks, and marks the rest as manual items to verify by hand.',
    },
    {
      question: 'What is the ideal title tag length?',
      answer:
        'Common industry guidance says roughly 30–60 characters to avoid truncation in search results. This tool flags titles outside that range — but it is guidance, not a Google rule, so a slightly longer title that earns clicks still beats a perfect one nobody clicks.',
    },
    {
      question: 'What is the ideal meta description length?',
      answer:
        'The widely cited guidance is 120–160 characters, which this tool checks your draft against. Meta descriptions do not directly affect rankings, but a clear, keyword-relevant one in that range can improve click-through.',
    },
  ],
  assumptions: [
    'General guidance only — the tool cannot see your page, CMS, or search results; it checks only the three pasted fields.',
    'Length targets (title 30–60, meta 120–160) are industry guidance, not Google rules; passing does not guarantee rankings or SERP display.',
    '"Manual" items are honest unknowns: verify them on the real page instead of trusting a guess.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Blog Post SEO Checklist 2026 – Free Guide | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free blog post SEO checklist 2026: auto-check your title, meta description and keyword plus 8 manual on-page items before you publish.',
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
          name: 'Blogging & SEO Tools',
          item: 'https://husnainblogger.com/tools/blogging-seo/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Pre-Publish SEO Checklist',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
