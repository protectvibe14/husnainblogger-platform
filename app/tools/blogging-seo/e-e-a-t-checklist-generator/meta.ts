import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/e-e-a-t-checklist-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'contentType',
    label: 'Content type',
    type: 'select',
    required: false,
    options: ['article', 'review', 'guide', 'homepage'],
    placeholder: 'Defaults to article',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'checklist',
    label: 'E-E-A-T checklist',
    type: 'table',
    description:
    'One row per check: what to verify and how to do it.',
  keywords: ['checklist for din application', 'checklist in a sentence', 'eeat seo checklist'],
  },
  {
    id: 'checklistMarkdown',
    label: 'Checklist (Markdown)',
    type: 'copy',
    description:
    'The same checklist as copyable Markdown checkboxes.',
  },
];

export const content: ToolContent = {
  title: 'EEAT Checklist',
  description:
    'Free EEAT checklist 2026: audit any article, review, guide or page against E-E-A-T trust signals with a copyable Markdown checklist. —.',
  howTo: [
    'Pick your content type: article, review, guide or homepage (defaults to article).',
    'Run the tool to get your E-E-A-T checklist with one-line how-tos per check.',
    'Work through each check on your draft — author byline, experience evidence, sources, dates.',
    'Copy the Markdown version into your task manager or document to track progress.',
  ],
  methodology:
    'The generator assembles the checklist from a fixed item bank: 8 base checks (author byline, credentials, first-hand experience, original analysis, sources cited, About/Contact pages, visible dates, corrections path) plus type-specific additions — article +3, review +4, guide +3, homepage +3. Unknown content types fall back to the article checklist. No AI and no live data are used; every item is best-practice guidance, not an official Google checklist.',
  examples: [
    {
      title: 'Blog post checklist',
      inputs: { contentType: 'article' },
      note: '11 checks covering bylines, experience evidence, sourcing and update dates.',
    },
    {
      title: 'Product review checklist',
      inputs: { contentType: 'review' },
      note: '12 checks adding real product testing, balanced pros/cons and comparisons.',
    },
  ],
  faqs: [
    {
      question: 'What is the best EEAT checklist?',
      answer:
        'No independent test crowns one checklist "the best" — and no checklist is Google-endorsed. A good one covers all four signals: experience (first-hand proof), expertise (credentials), authoritativeness (original analysis, sources), trustworthiness (bylines, dates, corrections). This free generator does exactly that from a fixed, published item bank.',
    },
    {
      question: 'Is there a free EEAT checklist?',
      answer:
        'Yes — this tool is completely free with no signup. Pick article, review, guide or homepage and get a checklist with one-line how-tos, plus a copyable Markdown version.',
    },
    {
      question: 'How to use E-E-A-T for a blog post?',
      answer:
        'Add a real author byline with credentials, show first-hand experience (photos, tests, quotes), cite sources for claims, and show publish/update dates. Run the checklist above against your draft before publishing — but remember it is guidance, not a ranking guarantee.',
    },
    {
      question: 'How does an E-E-A-T checklist work?',
      answer:
        'You walk through each item — author info, experience evidence, sourcing, trust pages — and fix what is missing. This generator assembles the items from a fixed bank tailored to your content type; it does not score or certify your page.',
    },
    {
      question: 'What does E-E-A-T stand for?',
      answer:
        'E-E-A-T stands for Experience, Expertise, Authoritativeness and Trustworthiness — the signals Google quality raters are told to look for in content. This generator covers all four: experience checks ask for first-hand proof, expertise and authoritativeness checks ask for credentials and original analysis, and trust checks ask for bylines, dates and corrections.',
    },
    {
      question: 'Is E-E-A-T a Google ranking factor?',
      answer:
        'Google has not confirmed E-E-A-T as a direct ranking factor; it describes what human quality raters evaluate, not a score the algorithm reads. Treat this checklist as guidance for making content trustworthy — checking every box does not guarantee higher rankings.',
    },
    {
      question: 'What extra checks does the review version of the EEAT checklist add?',
      answer:
        'The review version adds 4 type-specific checks on top of the 8 base checks: real product testing, balanced pros and cons, comparisons with alternatives, and clear disclosure of testing methods. Select "review" as the content type to get all 12 checks, each with a one-line how-to.',
    },
  ],
  assumptions: [
    'Best-practice guidance only — not a Google endorsement; checking every box does not guarantee rankings.',
    'Items are fixed English strings: general guidance, not tailored legal or SEO advice.',
    'E-E-A-T describes what Google quality raters look for; it is not a confirmed direct ranking factor.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'EEAT Checklist 2026 – Free SEO Audit Guide | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free EEAT checklist 2026: audit any article, review, guide or page against E-E-A-T trust signals with a copyable Markdown checklist. —.',
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
          name: 'E-E-A-T Checklist Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
