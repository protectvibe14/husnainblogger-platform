import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'projectScope',
    label: 'Project scope',
    type: 'select',
    required: true,
    options: ['landing', 'five_page', 'ecommerce', 'custom'],
  },
  {
    id: 'pageCount',
    label: 'Number of pages',
    type: 'number',
    required: true,
    placeholder: 'e.g. 5',
    validation: { min: 1 },
  },
  {
    id: 'experienceLevel',
    label: 'Your experience level',
    type: 'select',
    required: true,
    options: ['entry', 'mid', 'senior'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'projectPriceLow', label: 'Suggested project price — low (estimate)', type: 'currency' },
  { id: 'projectPriceHigh', label: 'Suggested project price — high (estimate)', type: 'currency' },
  { id: 'scopeNote', label: 'How the range was built (estimate)', type: 'text' },
];

const DESCRIPTION =
  'Free web design pricing calculator 2026: price your project by scope, page count and experience level, rounded to the nearest $50. No signup — try it now.';

export const content: ToolContent = {
  title: 'Web Design Pricing Calculator',
  description: DESCRIPTION,
  howTo: [
    'Pick the project scope: a landing page, a 5-page business site, an e-commerce store, or a custom web application.',
    'Enter the number of pages — this scales landing and 5-page site prices; e-commerce and custom projects are priced on functionality instead.',
    'Choose your experience level (Entry, Mid, or Senior), which applies a labeled price multiplier.',
    'Run the calculator to see the suggested project price range, rounded to the nearest $50.',
    'Read the "how the range was built" note, then sanity-check the range against your portfolio and the client\'s budget before quoting.',
  ],
  methodology:
    'The tool looks up two fixed tables in code: a base project band per scope (landing $500–$2,000; 5-page $2,000–$7,500; e-commerce $5,000–$25,000; custom $10,000–$50,000) and an experience multiplier (entry ×0.75, mid ×1.0, senior ×1.5). Landing and 5-page prices scale by pages ÷ reference pages (1 and 5); e-commerce and custom ignore page count. Results are rounded to the nearest $50. There is no AI and no live market lookup — every figure is a survey/market estimate.',
  examples: [
    {
      title: 'Mid-level designer, 5-page site, 5 pages',
      inputs: { projectScope: 'five_page', pageCount: 5, experienceLevel: 'mid' },
      note: 'Returns $2,000–$7,500 — the full benchmark band with no adjustments.',
    },
    {
      title: 'Senior designer, e-commerce store',
      inputs: { projectScope: 'ecommerce', pageCount: 25, experienceLevel: 'senior' },
      note: 'Returns $7,500–$37,500. The page count is noted as informational only since e-commerce is priced on functionality.',
    },
  ],
  faqs: [
    {
      question: 'What is the best web design pricing calculator?',
      answer:
        'The best one separates scope types — a landing page and a custom web app should never share one price. This free calculator uses fixed per-scope bands (e.g. $2,000–$7,500 for a 5-page site) plus labeled experience and page-count adjustments, all presented as estimates.',
    },
    {
      question: 'Is there a free web design pricing calculator?',
      answer:
        'Yes — this calculator is completely free with no signup. Pick a scope, enter the page count, and choose your experience level to get an estimated project price range.',
    },
    {
      question: 'How to calculate web design pricing?',
      answer:
        'Start from a typical price band for the scope (landing page, multi-page site, e-commerce, or custom), adjust for your experience, and scale simple sites by page count. This tool applies exactly those steps with fixed, labeled estimate tables — then round to the nearest $50 and sanity-check against the client.',
    },
    {
      question: 'How much should I charge for a landing page?',
      answer:
        'This calculator brackets landing pages at $500–$2,000 before your experience multiplier: entry-level designers multiply by ×0.75, mid-level by ×1.0, and senior designers by ×1.5. Extra pages scale the price proportionally for landing-page projects.',
    },
    {
      question: 'How much does a 5-page website cost to design?',
      answer:
        'The tool brackets a 5-page business site at $2,000–$7,500, scaled by your actual page count (pages ÷ 5) and your experience multiplier. E-commerce and custom projects use separate, wider bands because they are priced on functionality, not pages.',
    },
    {
      question: 'Does my experience level change the quote?',
      answer:
        'Yes — the calculator applies a labeled multiplier: ×0.75 for entry-level, ×1.0 for mid-level, and ×1.5 for senior designers. Pick the level that matches your portfolio and client results, not just your years in the field.',
    },
    {
      question: 'Why doesn\'t page count affect e-commerce pricing?',
      answer:
        'E-commerce stores and custom web apps are priced on functionality — product catalogs, payments, integrations — not page count, so the tool ignores pages for those scopes. Enter the page count anyway; it is shown as informational context in the breakdown.',
    },
  ],
  assumptions: [
    'Scope bands (landing $500–$2,000; 5-page $2,000–$7,500; e-commerce $5,000–$25,000; custom $10,000–$50,000) and the experience multipliers (×0.75 / ×1.0 / ×1.5) are survey/market estimates — NOT official rates and NOT current verified market data.',
    'E-commerce and custom bands are deliberately wide — they are estimates; use real quotes for exact requirements.',
    'Hosting, domains, stock assets, copywriting, and ongoing maintenance are not included.',
    'All amounts are USD.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Web Design Pricing Calculator 2026 | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/web-designer-project-pricing-calculator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: DESCRIPTION,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Make-Money & Affiliate Tools',
          item: 'https://husnainblogger.com/tools/make-money/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Web Designer Project Pricing Calculator',
          item: 'https://husnainblogger.com/tools/make-money/web-designer-project-pricing-calculator/',
        },
      ],
    },
  ],
};
