import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/pinterest-pin-title-a-b-scorer/';

export const inputs: ToolInput[] = [
  {
    id: 'titleA',
    label: 'Title A',
    type: 'text',
    required: true,
    placeholder: 'e.g. 25 Cozy Fall Porch Decor Ideas on a Budget',
  },
  {
    id: 'titleB',
    label: 'Title B',
    type: 'text',
    required: true,
    placeholder: 'e.g. Fall Porch Decorations You Will Love This Season',
  },
  {
    id: 'primaryKeyword',
    label: 'Primary keyword (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. fall porch decor',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'scores',
    label: 'Side-by-side scores',
    type: 'table',
    description:
    'Free pinterest pin title tester 2026: Each title scored 0-100 on the five rubric criteria. free.',
  },
  {
    id: 'winner',
    label: 'Winner',
    type: 'text',
    description:
    'A, B, or tie — the higher total score wins.',
  },
  {
    id: 'notes',
    label: 'Notes',
    type: 'list',
    description:
    'Heuristic label plus any warnings (over-limit, identical titles, limited coverage).',
  },
];

export const content: ToolContent = {
  title: 'Pinterest Pin Title Tester',
  description:
    'Pick the stronger pin title with a clear scoring rubric: compare any two titles against 5 factors to see which one follows pin best practices.',
  howTo: [
    'Type your first pin title into "Title A" and the alternative into "Title B" (keep each under 100 characters).',
    'Optionally add your primary keyword (for example, "fall porch decor") so keyword placement is scored too.',
    'Click run to score both titles 0-100 on keyword position, specificity, length, action language, and curiosity gap.',
    'Read the side-by-side table to see exactly which criterion each title wins or loses.',
    'Pick the winner — or rewrite the loser using the weakest criterion as your guide — then test for real on Pinterest.',
  ],
  methodology:
    'This tool is a deterministic client-side rubric scorer, not AI and not a prediction of Pinterest ranking or CTR. Each title earns 0-100 per criterion with fixed weights: keyword position 30 (keyword in the first 40 chars scores best), specificity 25 (numbers, list words like "tips" or "recipes", "how to", years, parentheses), length 20 (best at 40-100 chars), action language 15 (action verbs like "get" or "transform"), and curiosity gap 10 (questions or words like "secret"). Titles over 100 characters take a 10-point penalty. Identical inputs, identical scores — every time.',
  examples: [
    {
      title: 'Fall porch decor ideas',
      inputs: {
        titleA: '25 Cozy Fall Porch Decor Ideas on a Budget',
        titleB: 'Fall Porch Decorations You Will Love This Season',
        primaryKeyword: 'fall porch decor',
      },
      note: 'Title A usually wins on specificity (the number "25") and keyword position.',
    },
    {
      title: 'Sourdough recipe pins',
      inputs: {
        titleA: 'How to Bake Sourdough Bread at Home (Beginner Guide)',
        titleB: 'Sourdough Bread',
        primaryKeyword: 'sourdough bread',
      },
      note: 'Title A wins on specificity and action language; Title B loses on length and detail.',
    },
  ],
  faqs: [
    {
      question: 'What is the best pinterest pin title tester?',
      answer:
        'The best tester shows its work: it should tell you which title is stronger and exactly why. This tool scores both titles on five transparent criteria — keyword position, specificity, length, action language, and curiosity gap — with fixed weights published in the methodology, so you can see which factor decided the winner.',
    },
    {
      question: 'Is there a free pinterest pin title tester?',
      answer:
        'Yes — this Pinterest Pin Title A/B Scorer is completely free with no signup. Enter two titles, optionally add your keyword, and get side-by-side scores plus a winner instantly, right in your browser.',
    },
    {
      question: 'How to test pinterest pin title?',
      answer:
        'Write two versions of your pin title, then compare them on the factors that matter: does the keyword appear early, is there a specific number or promise, is the length in the 40-100 character sweet spot, does it use action language, and does it create curiosity. This tool scores all five for both titles so you can pick the stronger one before you publish.',
    },
    {
      question: 'How does a pinterest pin title tester work?',
      answer:
        'This tester runs both titles through a fixed heuristic rubric in your browser: it checks keyword placement, specificity signals like numbers and list words, title length, action verbs, and curiosity markers, then weights the five criteria into a 0-100 score per title. It is a heuristic estimate for comparison — it does not predict Pinterest ranking or real click-through rates.',
    },
    {
      question: 'How does the pinterest pin title tester work?',
      answer:
        'Enter your details using the inputs above and the pinterest pin title tester calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the pinterest pin title tester free to use?',
      answer:
        'Yes - this pinterest pin title tester is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a pinterest pin title tester?',
      answer:
        'A pinterest pin title tester is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Scores are heuristic estimates for comparing two titles, not predictions of Pinterest ranking or CTR.',
    'The word banks (list words, action verbs, curiosity words) are English-based; non-English titles get a "limited heuristic coverage" note.',
    'Pinterest truncates long titles in feeds, which is why titles over 100 characters take a 10-point penalty.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Pinterest Pin Title Tester 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free pinterest pin title tester 2026: Each title scored 0-100 on the five rubric criteria. free.',
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
          name: 'Pinterest & Social Tools',
          item: 'https://husnainblogger.com/tools/pinterest-social/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Pinterest Pin Title A/B Scorer',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
