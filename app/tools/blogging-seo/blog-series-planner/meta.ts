import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/blog-series-planner/';

export const inputs: ToolInput[] = [
  {
    id: 'seriesTopic',
    label: 'Series topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. email marketing',
    validation: { min: 2, max: 120 },
  },
  {
    id: 'partCount',
    label: 'Number of parts',
    type: 'number',
    required: true,
    placeholder: '2-12',
    validation: { min: 2, max: 12 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'seriesTitle',
    label: 'Series title',
    type: 'text',
    description: 'Free blog series planner 2026: The suggested overarching title for the whole series. Instant, private, and mobile-friendly. No signup - try it free!',
  },
  {
    id: 'parts',
    label: 'Series plan',
    type: 'table',
    description:
      'One row per part: role, suggested title and slug, target words, read-time estimate, angle and internal-linking notes.',
  },
];

export const content: ToolContent = {
  title: 'Blog Series Planner 2026 – Free Tool | HusnainBlogger',
  description:
    'Map out a multi-part blog series in minutes — this free blog series planner structures 2–12 parts with titles, slugs and linking notes. Plan your series now!',
  howTo: [
    'Type your series topic into the Series topic field (2–120 characters).',
    'Enter how many installments you want (a whole number from 2 to 12).',
    'Run the tool to get a suggested series title and a part-by-part plan.',
    'Rewrite the suggested titles for your target search results before publishing.',
    'Follow the internal-linking notes so every part connects to the rest of the series.',
  ],
  methodology:
    'Parts are assembled from a fixed bank of 12 part-role templates (overview, foundations, deep dive, process, mistakes, tools, case study, advanced, comparison, checklist, FAQ, conclusion). For N parts the engine spreads the bank evenly — index_i = round(i × 11 / (N − 1)) — so part 1 is always the overview and the last part is always the conclusion. Read-time estimates assume ~200 words/minute. No AI model and no live data are used; this is a deterministic planning aid, not a ranking guarantee.',
  examples: [
    {
      title: 'Four-part email series',
      inputs: { seriesTopic: 'email marketing', partCount: 4 },
      note: 'Overview → process → checklist → conclusion: title "email marketing: A 4-Part Series".',
    },
    {
      title: 'Full twelve-part course',
      inputs: { seriesTopic: 'python for bloggers', partCount: 12 },
      note: 'Uses all 12 role templates, one per part, with suggested slugs like python-for-bloggers-part-1.',
    },
  ],
  faqs: [
    {
      question: 'What is the best blog series planner?',
      answer:
        'There is no independent test crowning one planner "the best" — the honest differentiator is transparency. This free planner publishes its full template bank and arc-selection rules, so you can see exactly where every suggestion comes from.',
    },
    {
      question: 'Is there a free blog series planner?',
      answer:
        'Yes — this tool is completely free with no signup. It structures your series into 2–12 parts with suggested titles, slugs, angles and internal-linking notes, all in your browser.',
    },
    {
      question: 'How to plan a blog series?',
      answer:
        'Start with one clear topic, decide on 2–12 installments, and give the series a narrative arc: overview first, foundations and process in the middle, action items and conclusion last. Enter your topic above and the planner lays that arc out for you — then rewrite the suggested titles for your audience before publishing.',
    },
    {
      question: 'How does the blog series planner work?',
      answer:
        'Enter your details using the inputs above and the blog series planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the blog series planner free to use?',
      answer:
        'Yes - this blog series planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a blog series planner?',
      answer:
        'A blog series planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the blog series planner?',
      answer:
        'No account needed. Open the blog series planner, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Planning aid only — does not check SERPs, search volume, or keyword difficulty.',
    'Suggested titles and slugs are fixed English templates; rewrite for the target SERP before publishing.',
    'Read-time estimates assume ~200 words/minute — a rough planning figure, not a measurement.',
    'Internal-linking notes are fixed structural guidance, not measured linking data.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Blog Series Planner 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free blog series planner 2026: The suggested overarching title for the whole series. Instant, private, and mobile-friendly. No signup - try it free!',
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
          name: 'Blog Series Planner',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
