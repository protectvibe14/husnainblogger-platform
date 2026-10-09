import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/x-thread-numbering-formatter/';

export const inputs: ToolInput[] = [
  {
    id: 'tweets',
    label: 'Your tweets (one per line)',
    type: 'textarea',
    required: true,
    placeholder: 'Paste each tweet on its own line…',
    validation: { max: 20000 },
  },
  {
    id: 'numberingStyle',
    label: 'Numbering style',
    type: 'select',
    required: false,
    options: ['1/8', '(1/8)'],
  },
  {
    id: 'placement',
    label: 'Marker placement',
    type: 'select',
    required: false,
    options: ['end', 'start'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'numberedTweets',
    label: 'Numbered tweets',
    type: 'list',
    description:
    'Free twitter thread numbering 2026: Your tweets with fresh 1/N markers applied at the start or end. Old markers are stripped. Fast, private.',
  },
  {
    id: 'flagged',
    label: 'Needs trimming',
    type: 'list',
    description:
    'Tweets that overflow the 280 weighted-character budget after numbering — flagged for manual trimming, never auto-cut.',
  },
  {
    id: 'note',
    label: 'Notes',
    type: 'text',
    description:
    'Which marker range was applied and whether old numbering or blank lines were removed.',
  },
];

export const content: ToolContent = {
  title: 'Twitter Thread Numbering',
  description:
    'Number your X thread cleanly in seconds: paste up to 25 tweets for 1/8-style markers at the start or end, re-checked against the 280-character budget.',
  howTo: [
    'Paste your tweets into the "Your tweets (one per line)" field — one tweet per line, up to 25.',
    'Choose a "Numbering style" (1/8 or (1/8)) and a "Marker placement" (end or start).',
    'Run the tool: old numbering is stripped first, then fresh markers are applied and every tweet is re-checked.',
    'Review "Needs trimming" — any tweet over the budget is flagged there, never cut automatically.',
    'Copy the numbered tweets in order and post them on X as a reply chain.',
  ],
  methodology:
    'This tool strips any existing 1/N-style markers (leading or trailing, with or without parentheses) so re-numbering never stacks markers, then applies the chosen style — e.g. "1/8" or "(1/8)" — at the chosen placement. Every numbered tweet is re-validated against a conservative 280 weighted-character budget (URLs count 23, non-ASCII characters count 2). Overflows are flagged with an exact over-by number for manual trimming. Fully deterministic; no AI involved.',
  examples: [
    {
      title: 'Number a 3-tweet thread',
      inputs: { tweets: 'Hook tweet here\nMiddle tweet here\nFinal CTA tweet here', numberingStyle: '1/8', placement: 'end' },
      note: 'Returns "Hook tweet here 1/3", "Middle tweet here 2/3", "Final CTA tweet here 3/3" with no flags.',
    },
    {
      title: 'Re-number a thread with old markers',
      inputs: { tweets: '1/3 Old hook\n(2/3) Old middle\nOld end 3/3', numberingStyle: '(1/8)', placement: 'end' },
      note: 'Old markers are stripped first, then fresh (1/3)–(3/3) markers are applied.',
    },
  ],
  faqs: [
    {
      question: 'What is the best twitter thread numbering?',
      answer:
        'The best twitter thread numbering is a clean 1/N marker on every tweet — e.g. 1/8 through 8/8 — so readers know where they are and what is left. This free formatter strips any old numbering first (no doubled markers), applies your chosen style, and re-checks every tweet against the character budget.',
    },
    {
      question: 'Is there a free twitter thread numbering?',
      answer:
        'Yes — this thread numbering formatter is completely free with no signup. Number up to 25 tweets per thread, in 1/8 or (1/8) style at the start or end, with overflow flagging included, as many times as you like.',
    },
    {
      question: 'How to use twitter thread numbering?',
      answer:
        'Paste your tweets one per line, pick the style and placement, and run the tool. Copy the numbered tweets in order and post them on X as a reply chain. If any tweet lands in "Needs trimming", shorten it yourself before posting — the tool flags it but never cuts your words.',
    },
    {
      question: 'Where should the numbers go in a twitter thread?',
      answer:
        'The most common convention is the marker at the end of each tweet (e.g. "… 3/8"), which keeps the hook readable. Markers at the start work too and are easier to scan. This tool supports both — pick "end" or "start" under "Marker placement".',
    },
    {
      question: 'How does the twitter thread numbering work?',
      answer:
        'Enter your details using the inputs above and the twitter thread numbering calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the twitter thread numbering free to use?',
      answer:
        'Yes - this twitter thread numbering is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a twitter thread numbering?',
      answer:
        'A twitter thread numbering is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'One tweet per line: blank lines are skipped and noted, and at most 25 tweets can be numbered in one run.',
    'The 280 weighted-character budget is a conservative approximation (URLs count 23, non-ASCII characters count 2) — confirm in X before posting.',
    'Overflow after numbering is flagged for manual trimming and never auto-cut; only existing 1/N-style markers are stripped, other text is untouched.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Twitter Thread Numbering 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free twitter thread numbering 2026: Your tweets with fresh 1/N markers applied at the start or end. Old markers are stripped. Fast, private.',
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
          name: 'X Thread Numbering Formatter',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
