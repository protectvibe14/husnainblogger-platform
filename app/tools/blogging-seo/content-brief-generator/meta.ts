import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. email marketing',
    validation: { min: 2, max: 150 },
  },
  {
    id: 'targetKeyword',
    label: 'Target keyword (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. email marketing tips',
    validation: { max: 100 },
  },
  {
    id: 'wordCount',
    label: 'Target word count',
    type: 'number',
    required: false,
    placeholder: '1500',
    validation: { min: 300, max: 10000 },
  },
  {
    id: 'audience',
    label: 'Audience (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. small business owners',
    validation: { max: 100 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'briefMarkdown',
    label: 'Content brief',
    type: 'copy',
    description:
    'Full brief in Markdown: keyword, audience, intent guess, outline with word targets, SEO notes and CTAs.',
  keywords: ['ai content brief generator', 'content brief template', 'content brief template google docs', 'content brief template word', 'content creator brief'],
  },
  {
    id: 'sections',
    label: 'Sections',
    type: 'list',
    description:
    'Outline sections with per-section word targets.',
  },
];

export const content: ToolContent = {
  title: 'Content Brief Generator',
  description:
    'Free content brief generator 2026: build a complete SEO brief — keyword, audience, intent guess and outline with per-section word targets.',
  howTo: [
    'Type your article topic into the Topic field (2-150 characters).',
    'Optionally add a target keyword, target word count (300-10,000) and audience.',
    'Click Generate to assemble the brief from fixed section templates.',
    'Review the suggested outline, per-section word targets and on-page SEO notes.',
    'Copy the brief in Markdown and hand it to your writer — then verify intent against the real SERP.',
  ],
  methodology:
    'The generator fills a fixed bank of 14 section templates with your topic (6 sections for 300-800 words, 9 for 801-2,000, 12 for 2,001-10,000) and splits the word count across sections in proportion to each section\'s fixed weight, rounded so the targets sum exactly to your total. The "search intent" line is a simple keyword heuristic (e.g. "buy" suggests transactional), not SERP analysis. Read time is estimated at 200 words per minute. No AI model is used and nothing is fetched from the web.',
  examples: [
    {
      title: 'Beginner guide brief',
      inputs: { topic: 'email marketing', wordCount: 1500, audience: 'small business owners' },
      note: 'Produces a 9-section brief with per-section word targets and SEO notes.',
    },
    {
      title: 'Short brief with keyword',
      inputs: { topic: 'sourdough starter', targetKeyword: 'sourdough starter guide', wordCount: 600 },
      note: 'Produces a 6-section brief with keyword placement notes for the H1 and first 100 words.',
    },
    {
      title: 'Long-form brief',
      inputs: { topic: 'content marketing strategy', wordCount: 4000 },
      note: 'Produces a 12-section brief including trends, costs and a checklist section.',
    },
  ],
  faqs: [
    {
      question: 'What is the best content brief generator?',
      answer:
        'There is no independently verified "best" — compare them on transparency instead. This free generator shows exactly how it builds your brief: fixed section templates, proportional word targets, and a labeled intent heuristic, with no hidden AI and no signup.',
    },
    {
      question: 'Is there a free content brief generator?',
      answer:
        'Yes — this one is completely free with no signup. It assembles a structured brief (keyword, audience, outline with word targets, SEO notes, CTAs) in your browser. It does not pull SERP data or keyword metrics, which is what paid brief tools add.',
    },
    {
      question: 'How to generate content?',
      answer:
        'Start with a clear brief: one topic, one target keyword, a defined audience and a word-count target. Enter those above and the tool assembles an outline with per-section word targets plus on-page SEO notes you can hand to a writer.',
    },
    {
      question: 'How does a content brief generator work?',
      answer:
        'This one fills a fixed bank of 14 section templates with your topic, picks 6, 9 or 12 sections based on your word count, and splits the word budget proportionally across them. It adds a heuristic intent guess and template SEO notes — no AI, no live data.',
    },
    {
      question: 'What is a content brief?',
      answer:
        'A content brief is the plan your writer follows: topic, target keyword, audience, word count, and a section-by-section outline. This tool assembles one from fixed section templates — 6, 9 or 12 sections depending on your word count — with per-section word targets that sum exactly to your total.',
    },
    {
      question: 'What should a content brief include?',
      answer:
        'At minimum: the target keyword, the audience, a guess at search intent, an outline with word targets, on-page SEO notes, and CTAs. This generator outputs all of those as copyable Markdown, though you should verify the intent guess against the real search results before writing.',
    },
    {
      question: 'How long should a content brief be?',
      answer:
        'The brief grows with the article: 300–800 word articles get 6 sections, 801–2,000 get 9, and 2,001–10,000 get 12. The tool splits your word budget proportionally across sections by fixed weights, rounded so the targets sum exactly to your requested total.',
    },
  ],
  assumptions: [
    'Briefs are assembled from a fixed bank of 14 section templates — not AI-generated; treat suggested titles as starting points.',
    'The search-intent line is a rough keyword heuristic; verify intent against the real search results before writing.',
    'Word targets are proportional estimates that sum to your requested total; adjust them to taste.',
    'The tool does not check keyword difficulty, search volume, or competitors.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Content Brief Generator 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/blogging-seo/content-brief-generator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free content brief generator 2026: build a complete SEO brief — keyword, audience, intent guess and outline with per-section word targets.',
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
          name: 'Content Brief Generator',
          item: 'https://husnainblogger.com/tools/blogging-seo/content-brief-generator/',
        },
      ],
    },
  ],
};
