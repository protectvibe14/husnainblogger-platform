import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/internal-link-opportunity-finder/';

export const inputs: ToolInput[] = [
  {
    id: 'content',
    label: 'Article content',
    type: 'textarea',
    required: true,
    placeholder: 'Paste your full article text — plain text, Markdown, or HTML.',
  },
  {
    id: 'targetPages',
    label: 'Target pages (URL | keywords)',
    type: 'textarea',
    required: true,
    placeholder: 'https://yoursite.com/guide/ | seo guide, ranking tips\nhttps://yoursite.com/tools/ | free seo tools',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'opportunities',
    label: 'Internal link opportunities',
    type: 'table',
    description:
    'Free internal link finder 2026: Each keyword match with its target URL and the surrounding context. Get instant results. free now.',
  },
  {
    id: 'count',
    label: 'Opportunities found',
    type: 'number',
    description:
    'Total number of internal linking opportunities detected.',
  },
];

export const content: ToolContent = {
  title: 'Internal Link Finder',
  description:
    'Find internal linking opportunities fast. Paste your article plus target pages and this free internal link finder matches keywords to context.',
  howTo: [
    'Paste your full article into "Article content" — plain text, Markdown, or HTML all work.',
    'List your target pages in "Target pages", one per line: URL | keyword 1, keyword 2.',
    'Run the tool to scan for plain-text keyword matches that are not already linked.',
    'Review each opportunity with its context snippet, then add the internal link in your CMS.',
  ],
  methodology:
    'The tool lowercases your content and finds the first plain-text occurrence of each target keyword (case-insensitive, Unicode-safe substring match) that sits outside existing link markup. Pages whose URL is already linked are skipped entirely, and keywords already used as link text are not suggested again. No crawling, no AI, no SERP data — it only compares what you paste, checking pages in the order you list them.',
  faqs: [
    {
      question: 'What is the best internal link finder?',
      answer:
        'The best internal link finder is one you will actually use consistently — this free tool finds opportunities by matching your target keywords against your article text, which covers the core job without a crawl budget or a subscription.',
    },
    {
      question: 'Is there a free internal link finder?',
      answer:
        'Yes — this tool is completely free with no signup. Paste your article and your target pages with keywords, and it lists every plain-text keyword match that is not already linked.',
    },
    {
      question: 'How to find internal link?',
      answer:
        'List the pages you want to promote with 2–5 keywords each, then scan your draft for those keywords appearing as plain text. Every match is a candidate anchor — this tool automates that scan and skips phrases that are already linked.',
    },
    {
      question: 'How does an internal link finder work?',
      answer:
        'You paste your article and a list of target pages with keywords. The tool searches the text for each keyword (case-insensitive), skips anything inside existing links, and returns the matched keyword, the target URL, and the surrounding sentence as context.',
    },
    {
      question: 'What is an internal link finder?',
      answer:
        'An internal link finder is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Cannot crawl a live site — it only analyzes the article text and target pages you paste.',
    'Matches are plain keyword substrings, not semantic matches; it will not find related phrases you did not list as keywords.',
    'Suggestions are candidates, not commands — only add a link where the anchor fits naturally for readers.',
  ],
  jsonLd: [],
};
