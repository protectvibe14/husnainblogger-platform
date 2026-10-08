import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'hookText',
    label: 'Your hook text',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. Why I quit social media for 30 days — the results shocked me',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'scores',
    label: 'Rubric scores',
    type: 'table',
    description: 'Free twitter hook analyzer 2026: Score (0–10) for each rubric dimension: Specificity, Curiosity gap, Clarity, Contrarian. Fast, private, no signup - try it now!',
  },
  {
    id: 'totalScore',
    label: 'Total heuristic score',
    type: 'number',
    description: 'Weighted total out of 10 — a heuristic estimate, not a virality prediction.',
  },
  {
    id: 'verdict',
    label: 'Verdict',
    type: 'text',
    description: 'strong, okay, or weak — based on the fixed rubric thresholds.',
  },
  {
    id: 'suggestions',
    label: 'How to improve it',
    type: 'list',
    description: 'Concrete fixes for each dimension scoring below 7.',
  },
  {
    id: 'notes',
    label: 'Notes',
    type: 'list',
    description: 'Honesty label, over-limit warning, and coverage notes.',
  },
];

export const content: ToolContent = {
  title: 'Twitter Hook Analyzer 2026 – Free Tool | HusnainBlogger',
  description:
    'Analyze any Twitter hook with a free heuristic rubric scoring specificity, curiosity gap, clarity, and contrarian edge. Get a verdict plus fixes — try it now!',
  howTo: [
    'Paste your hook into the Your hook text field (one opening line of your post).',
    'Click run to score it against the four-dimension rubric.',
    'Read the Rubric scores table to see which dimension drags the total down.',
    'Work through the How to improve it list — each fix targets a weak dimension.',
    'Re-run with your revised hook and compare the new total score.',
  ],
  methodology:
    'This tool scores hooks with a fixed, published rubric — never AI and never a virality prediction. Specificity (30%) rewards numbers, timeframes, money markers, and quantity words; Curiosity gap (30%) rewards questions and open-loop phrases and penalizes hooks that answer themselves; Clarity (20%) deducts for hashtag/caps/sentence/emoji clutter; Contrarian edge (20%) rewards stance-taking language. The weighted total is out of 10; strong is 7+, okay is 4.5+, weak is below 4.5. Character counting follows X rules: URL = 23 chars, emoji/CJK = 2 chars.',
  examples: [
    {
      title: 'Creator testing a launch hook',
      inputs: { hookText: 'Why does nobody mention the real secret behind $10k months? I did it in 90 days with 3 steps.' },
      note: 'Scores high on specificity and curiosity gap — earns a strong verdict.',
    },
    {
      title: 'Blogger with a bland opener',
      inputs: { hookText: 'have a nice day everyone' },
      note: 'Scores near zero on every dimension — the suggestions list shows exactly what to add.',
    },
    {
      title: 'Over-long hook check',
      inputs: { hookText: 'This is a very long hook that keeps going and going with far more than two hundred and eighty characters of plain text so the tool flags the over-limit warning while still scoring it' },
      note: 'Still analyzed, but a warning notes it exceeds the 280-character limit.',
    },
  ],
  faqs: [
    {
      question: 'What is the best twitter hook analyzer?',
      answer:
        'The best analyzer is one that shows its work: this Twitter Hook Analyzer scores your hook on four documented dimensions — specificity, curiosity gap, clarity, and contrarian edge — with a fixed rubric, so you know exactly why a hook scores the way it does.',
    },
    {
      question: 'Is there a free twitter hook analyzer?',
      answer:
        'Yes — this Twitter Hook Analyzer is completely free with no signup. Paste your hook, get a 0–10 score, a verdict, and targeted improvement suggestions instantly.',
    },
    {
      question: 'How to analyze twitter hook?',
      answer:
        'Paste the hook into the tool and read the four dimension scores: add numbers and timeframes for specificity, a question or open loop for curiosity, one clean sentence for clarity, and a stance for edge. Then re-run to confirm the score improved.',
    },
    {
      question: 'Can a hook analyzer predict if my tweet will go viral?',
      answer:
        'No — and be skeptical of any tool that claims to. This analyzer gives a heuristic estimate of how well your hook follows proven hook-writing patterns; actual reach depends on your audience, timing, and the X algorithm, which no public tool can predict.',
    },
    {
      question: 'How does the twitter hook analyzer work?',
      answer:
        'Enter your details using the inputs above and the twitter hook analyzer calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the twitter hook analyzer free to use?',
      answer:
        'Yes - this twitter hook analyzer is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a twitter hook analyzer?',
      answer:
        'A twitter hook analyzer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Heuristic estimate, not a virality prediction: the score measures pattern-following, not future performance.',
    'The rubric was written for English hooks — non-English text gets a limited-coverage note.',
    'Character weighting (URL = 23, emoji/CJK = 2) is an approximation of X’s proprietary counting.',
    'Suggestions are generic hook-writing advice, not tailored to your niche or audience.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Twitter Hook Analyzer 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/pinterest-social/x-hook-analyzer/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free twitter hook analyzer 2026: Score (0–10) for each rubric dimension: Specificity, Curiosity gap, Clarity, Contrarian. Fast, private, no signup - try it now!',
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
          name: 'X Hook Analyzer',
          item: 'https://husnainblogger.com/tools/pinterest-social/x-hook-analyzer/',
        },
      ],
    },
  ],
};
