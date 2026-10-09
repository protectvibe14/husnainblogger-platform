import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/x-viral-template-rewriter/';

export const inputs: ToolInput[] = [
  {
    id: 'draft',
    label: 'Your draft',
    type: 'textarea',
    required: true,
    placeholder: 'Paste the tweet draft you want to reshape…',
    validation: { min: 3, max: 2000 },
  },
  {
    id: 'template',
    label: 'Viral pattern',
    type: 'select',
    required: true,
    options: ['stat-hook', 'question-hook', 'hot-take', 'build-in-public'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'rewrites',
    label: 'Rewrites',
    type: 'list',
    description:
    'Free viral tweet templates 2026: 3 rewrites of your draft in the chosen pattern, each within 280 weighted characters. Fast, private now.',
  },
  {
    id: 'fitNote',
    label: 'Fit note',
    type: 'text',
    description:
    'Character-budget summary, plus a note if your draft already matched the pattern.',
  },
];

export const content: ToolContent = {
  title: 'Viral Tweet Templates',
  description:
    'Rewrite with viral tweet templates free: pick a proven pattern and get 3 reshaped drafts that fit X’s 280-character limit. Reshape your tweet now.',
  howTo: [
    'Paste your tweet draft into the "Your draft" box (up to 2,000 characters).',
    'Choose a "Viral pattern": stat-hook, question-hook, hot-take, or build-in-public.',
    'Click Generate to get 3 rewrites that keep your own words inside the chosen pattern.',
    'Read the "Fit note" to see the character budget and whether your draft already matched the pattern.',
    'Copy the rewrite that sounds most like you and post it on X.',
    'Re-run with a different pattern if none of the 3 feel right.',
  ],
  methodology:
    'The rewriter wraps your draft in one of 4 curated pattern templates (3 fixed frames each) without inventing facts or stats — {core} is always your own text, trimmed at a word boundary so the result fits 280 weighted characters (URLs count as 23). A documented regex per template detects drafts that already match the pattern and reports "light polish only". This is a static pattern library, not live trend data, and no AI is involved.',
  examples: [
    {
      title: 'Plain draft as a hot take',
      inputs: { draft: 'Hashtags barely move the needle anymore.', template: 'hot-take' },
      note: 'Gets 3 hot-take framings, e.g. "Unpopular opinion: Hashtags barely move the needle anymore."',
    },
    {
      title: 'Draft that already asks a question',
      inputs: { draft: 'Do you still schedule your posts?', template: 'question-hook' },
      note: 'The fit note flags it as already on-pattern; rewrites are light polish only.',
    },
    {
      title: 'Long draft trimmed to budget',
      inputs: { draft: 'Consistency beats intensity, and I have tested this across 90 days of daily posting with real numbers to back it up for anyone willing to try it.', template: 'stat-hook' },
      note: 'Core text is trimmed at a word boundary so every rewrite stays within 280 weighted characters.',
    },
  ],
  faqs: [
    {
      question: 'What is the best viral tweet templates?',
      answer:
        'No template guarantees virality — but common high-performing patterns include stat hooks, question hooks, hot takes, and build-in-public updates. This free tool reshapes your draft into 3 rewrites per pattern so you can test which framing fits your voice.',
    },
    {
      question: 'Is there a free viral tweet templates?',
      answer:
        'Yes — this rewriter is completely free with no signup. Paste a draft, pick one of 4 patterns, and get 3 rewrites that each fit X\'s 280-character limit, with a note if your draft already matched the pattern.',
    },
    {
      question: 'How to use viral tweet templates?',
      answer:
        'Paste your draft, choose a pattern (e.g. hot-take), and copy the rewrite that sounds most like you. The tool reuses your own words inside the frame and trims to 280 weighted characters — it does not invent stats or facts for you.',
    },
    {
      question: 'How does the viral tweet templates work?',
      answer:
        'Enter your details using the inputs above and the viral tweet templates calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the viral tweet templates free to use?',
      answer:
        'Yes - this viral tweet templates is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a viral tweet templates?',
      answer:
        'A viral tweet templates is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the viral tweet templates?',
      answer:
        'No account needed. Open the viral tweet templates, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'These are static curated pattern frames — a pattern library, NOT live trend data or a predictor of virality.',
    'Weighted character counting is an approximation: URLs count as 23 characters and everything else as 1; X weights some scripts and emoji differently.',
    'No facts, stats, or numbers are invented — every rewrite reuses your draft\'s own words, trimmed at a word boundary to fit the budget.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Viral Tweet Templates 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free viral tweet templates 2026: 3 rewrites of your draft in the chosen pattern, each within 280 weighted characters. Fast, private now.',
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
          name: 'Pinterest, X & Facebook',
          item: 'https://husnainblogger.com/tools/pinterest-social/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'X Viral Template Rewriter',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
