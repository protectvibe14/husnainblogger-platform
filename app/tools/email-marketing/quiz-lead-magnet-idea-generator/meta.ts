import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/email-marketing/quiz-lead-magnet-idea-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. email marketing',
  },
  {
    id: 'audience',
    label: 'Audience',
    type: 'text',
    required: true,
    placeholder: 'e.g. freelancers',
  },
  {
    id: 'quizGoal',
    label: 'Quiz goal',
    type: 'select',
    required: true,
    options: ['segment', 'entertain', 'qualify'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'quizzes',
    label: 'Quiz lead magnet ideas',
    type: 'table',
    description:
    'Free quiz lead magnet ideas 2026: Table of 4 quiz concepts: number, quiz title, sample questions, result types, and the. Fast, private now.',
  },
];

export const content: ToolContent = {
  title: 'Quiz Lead Magnet Ideas',
  description:
    'Plan quizzes with this free quiz lead magnet ideas generator: get titles, sample questions, and result types for segment, entertain, or qualify. Start now.',
  howTo: [
    'Enter your niche (e.g. email marketing) and your target audience (e.g. freelancers).',
    'Pick a quiz goal: segment (bucket takers into types), entertain (personality-style quizzes), or qualify (pre-screen leads).',
    'Run the tool to get 4 quiz concepts, each with a title, 3 sample questions, and 3 result types.',
    'Pick a concept, then write the full quiz script and build result pages before launching — sample questions are starters, not the whole quiz.',
    'Pair it with the Lead Magnet Title Generator for the opt-in headline.',
  ],
  methodology:
    'Concepts are assembled from fixed banks (18 quiz title patterns, 18 sample questions — 6 per goal — and 12 result-type patterns) filled with your niche and audience — no AI, no guessing. Selection is a deterministic hash of your inputs, so the same inputs always produce the same 4 concepts.',
  examples: [
    {
      title: 'Segmenting quizzes for freelancers',
      inputs: { niche: 'email marketing', audience: 'freelancers', quizGoal: 'segment' },
      note: 'Four quiz concepts designed to bucket freelancers by need.',
    },
    {
      title: 'Entertaining quizzes for course creators',
      inputs: { niche: 'online courses', audience: 'coaches', quizGoal: 'entertain' },
      note: 'Four personality-style quiz concepts for a coach audience.',
    },
  ],
  faqs: [
    {
      question: 'What is the best quiz lead magnet ideas?',
      answer:
        'The best quiz idea matches your goal: segmenting quizzes bucket takers by need, entertaining quizzes go viral with personality results, and qualifying quizzes pre-screen leads. This free generator builds 4 concepts per goal from fixed template banks — titles, sample questions, and result types.',
    },
    {
      question: 'Is there a free quiz lead magnet ideas?',
      answer:
        'Yes — this quiz lead magnet ideas generator is completely free with no signup. Each run produces 4 quiz concepts with titles, sample questions, and result types for your chosen goal.',
    },
    {
      question: 'How to use quiz lead magnet?',
      answer:
        'Pick a concept with a clear result payoff, write the full quiz script (questions plus scoring), build a result page for each outcome that delivers value, then gate the detailed results behind an email opt-in. Promote the quiz in posts and on social.',
    },
    {
      question: 'How does a quiz lead magnet ideas work?',
      answer:
        'It fills fixed quiz-title patterns with your niche and audience, attaches 3 sample questions from a bank written for your goal (segment, entertain, or qualify), and 3 result types per idea. Every concept is assembled from template banks — nothing is written by AI.',
    },
    {
      question: 'What is a quiz lead magnet ideas?',
      answer:
        'A quiz lead magnet ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Concepts are assembled from fixed banks (18 titles, 18 questions, 12 result types) — no AI ideation; sample questions are starters, not a complete quiz script.',
    'A working quiz needs real scoring logic and result pages, which this tool does not build.',
    'This tool covers quiz-format lead magnets only; general ideation is the Lead Magnet Idea Generator and titles are the Lead Magnet Title Generator.',
  ],
  jsonLd: [],
};
