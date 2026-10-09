import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'publishDate',
    label: 'Publish date',
    type: 'date',
    required: true,
  },
  {
    id: 'updatedDate',
    label: 'Last-updated date',
    type: 'date',
    required: true,
  },
  {
    id: 'wordCount',
    label: 'Word count (optional)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 1500',
    validation: { min: 0 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'verdict', label: 'Freshness verdict', type: 'text' },
  { id: 'ageDays', label: 'Age in days', type: 'number' },
  { id: 'daysSinceUpdate', label: 'Days since last update', type: 'number' },
  { id: 'priorityScore', label: 'Update priority (0–100)', type: 'number' },
  { id: 'guidance', label: 'What to do', type: 'text' },
  { id: 'heuristicNote', label: 'Honesty note', type: 'text' },
];

const DESCRIPTION =
  'Spot stale pages fast with this content freshness checker — find outdated stats, broken references, and refresh opportunities in minutes. Prioritize.';

export const content: ToolContent = {
  title: 'Content Freshness Checker',
  description: DESCRIPTION,
  howTo: [
    'Enter the date the post was first published (YYYY-MM-DD).',
    'Enter the date it was last updated — use the publish date if it was never updated.',
    'Optionally enter the word count (longer posts get a higher update priority).',
    'Run the check to get the age in days, a freshness verdict, and a 0–100 update priority score.',
    'Work through high-priority posts first; refresh facts, links, screenshots, and year references.',
  ],
  methodology:
    'Whole-day UTC date arithmetic computes age and days since last update. Verdicts use clearly labeled editorial guideline bands (not Google-published rules — Google has never published freshness thresholds): Fresh = updated within 90 days; Needs update = 91–365 days; Stale = 366+ days. The update priority score (0–100, higher = update sooner) combines staleness (up to 70 pts, scaled over a year), word count (up to 15 pts — longer posts have more to lose), and a 10-pt bonus when a post older than 180 days was never updated. Impossible dates (e.g. 2026-02-30) are rejected; future dates and updated-before-published are rejected.',
  examples: [
    {
      title: 'Recently refreshed guide',
      inputs: { publishDate: '2023-06-01', updatedDate: '2026-09-01', wordCount: 2500 },
      note: 'Verdict: Fresh (updated ~1 month ago). Low priority score — nothing urgent.',
    },
    {
      title: 'Never-updated old post',
      inputs: { publishDate: '2020-03-15', updatedDate: '2020-03-15', wordCount: 3000 },
      note: 'Verdict: Stale with a high priority score — never updated in 6+ years, long post, refresh recommended.',
    },
  ],
  faqs: [
    {
      question: 'How often should I update old blog posts?',
      answer:
        'It depends on the topic. News and statistics-heavy posts may need quarterly reviews; evergreen guides can go a year or more. As a guideline, this checker flags content untouched for 91–365 days as "Needs update" and 366+ days as "Stale" — but interpret the bands for your niche.',
    },
    {
      question: 'Does updating old content help SEO?',
      answer:
        'Refreshing outdated content — new facts, current examples, fixed links — is widely reported to help pages regain relevance. Google has confirmed it uses "freshness" as a signal for time-sensitive queries, though it publishes no thresholds.',
    },
    {
      question: 'Should I change the publish date when I update?',
      answer:
        'Best practice is to keep the original publish date and show a visible "Last updated" date. Some publishers update the displayed date on substantial rewrites — either way, enter both dates honestly in the checker above.',
    },
    {
      question: 'How does the content freshness checker work?',
      answer:
        'Enter your details using the inputs above and the content freshness checker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the content freshness checker free to use?',
      answer:
        'Yes - this content freshness checker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a content freshness checker?',
      answer:
        'A content freshness checker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the content freshness checker?',
      answer:
        'No account needed. Open the content freshness checker, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'The Fresh / Needs update / Stale bands are editorial guidelines — Google publishes no freshness thresholds.',
    'Time-sensitive topics (news, stats, tool roundups) go stale faster than evergreen topics; interpret bands accordingly.',
    'The tool computes from the dates you enter — it cannot fetch your page or see actual rankings.',
    'Date math uses whole UTC days; "today" is the day you run the check.',
    'The priority score is a heuristic triage aid, not a ranking prediction.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Content Freshness Checker 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/blogging-seo/content-freshness-checker/',
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
          name: 'Blogging SEO & Content Tools',
          item: 'https://husnainblogger.com/tools/blogging-seo/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Content Freshness Checker',
          item: 'https://husnainblogger.com/tools/blogging-seo/content-freshness-checker/',
        },
      ],
    },
  ],
};
