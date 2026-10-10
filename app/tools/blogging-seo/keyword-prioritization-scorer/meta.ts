import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/keyword-prioritization-scorer/';

export const inputs: ToolInput[] = [
  {
    id: 'keywords',
    label: 'Keywords (one per line)',
    type: 'textarea',
    required: true,
    placeholder: 'term | relevance | volume | difficulty | commercial intent (each 0-10)\nbest espresso machine | 9 | 8 | 3 | 9\ncheap espresso machine | 7 | 9 | 7 | 6',
  },
  {
    id: 'weights',
    label: 'Weights (optional)',
    type: 'text',
    required: false,
    placeholder: 'Four numbers, e.g. 0.3, 0.2, 0.3, 0.2 — defaults to 0.25 each',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'rankedKeywords',
    label: 'Ranked keywords',
    type: 'table',
    description:
    'Free keyword prioritization matrix 2026: Your keywords ranked by composite score, with priority bands. Get instant results. free now.',
  },
  {
    id: 'topPick',
    label: 'Top pick',
    type: 'text',
    description:
    'The highest-scoring keyword and what it scores best on.',
  },
];

export const content: ToolContent = {
  title: 'Keyword Prioritization Matrix',
  description:
    'Prioritize keywords free — rank your keywords by composite score with clear priority bands. Prioritize yours today, free!',
  howTo: [
    'List your keywords in the box, one per line, as: term | relevance | volume | difficulty | commercial intent.',
    'Rate each factor 0-10 from your own research (difficulty: 10 = hardest to rank).',
    'Optionally set custom weights, e.g. 0.3, 0.2, 0.3, 0.2 — leave blank for equal weights.',
    'Run the tool to get a ranked table with 0-100 scores and priority bands.',
    'Start with the top pick, then work down the High-priority rows.',
  ],
  methodology:
    'Score = (wRel x relevance + wVol x volume + wDiff x (10 - difficulty) + wComm x commercial intent) / sum(weights) / 10 x 100. Difficulty is inverted because easier keywords are better. Default weights are 0.25 each; bands are 70+ high priority, 40-69 medium, below 40 low. Ties keep your input order. All ratings are your own judgments — the tool has no live keyword data, so scores are heuristic estimates, not measured opportunity.',
  examples: [
    {
      title: 'Two espresso keywords',
      inputs: {
        keywords: 'best espresso machine | 9 | 8 | 3 | 9\ncheap espresso machine | 7 | 9 | 7 | 6',
      },
      note: '"best espresso machine" wins at 82.5/100 with equal weights.',
    },
    {
      title: 'Volume-first strategy',
      inputs: {
        keywords: 'best espresso machine | 9 | 8 | 3 | 9\ncheap espresso machine | 7 | 9 | 7 | 6',
        weights: '0, 1, 0, 0',
      },
      note: 'With volume-only weights, "cheap espresso machine" (90.0) ranks first.',
    },
  ],
  faqs: [
    {
      question: 'What is the best keyword prioritization matrix?',
      answer:
        'The best matrix weighs relevance, search volume, difficulty, and commercial intent together instead of sorting by one metric. This tool scores each keyword 0-100 with a transparent, editable formula so you can see exactly why a keyword ranks where it does.',
    },
    {
      question: 'Is there a free keyword prioritization matrix?',
      answer:
        'Yes — this tool is completely free with no signup. Paste your keywords with 0-10 ratings, optionally adjust the weights, and get a ranked table with priority bands and a top pick.',
    },
    {
      question: 'How to use keyword prioritization?',
      answer:
        'Rate every candidate keyword 0-10 on relevance, volume, difficulty, and commercial intent using your own research, then score them with consistent weights. Target high-priority keywords first, schedule medium ones next, and revisit low ones later — this tool does the scoring and ranking for you.',
    },
    {
      question: 'What is a keyword prioritization matrix?',
      answer:
        'A keyword prioritization matrix is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the keyword prioritization matrix?',
      answer:
        'No account needed. Open the keyword prioritization matrix, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'Is this keyword prioritization matrix tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
    {
      question: 'How do I use this keyword prioritization matrix tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
  ],
  assumptions: [
    'All ratings are user-entered judgments — the tool has no live search-volume or difficulty data, so scores are heuristic estimates, not measured opportunity.',
    'The rubric rewards relevance, volume, low difficulty, and commercial intent equally by default; adjust the weights to match your actual strategy.',
    'Tied scores keep your input order — put your preferred keyword first when scores are close.',
  ],
  jsonLd: [],
};
