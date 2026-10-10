import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'currentListSize',
    label: 'Current list size (optional)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 1200',
    validation: { min: 0 },
  },
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. fitness coaching',
  },
  {
    id: 'budget',
    label: 'Budget',
    type: 'select',
    required: true,
    options: ['free', 'paid', 'both'],
  },
  {
    id: 'count',
    label: 'How many ideas (1-20)',
    type: 'number',
    required: true,
    placeholder: '10',
    validation: { min: 1, max: 20 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'ideas', label: 'Growth ideas', type: 'table' },
  { id: 'notice', label: 'Notice', type: 'text' },
];

export const content: ToolContent = {
  title: 'Email List Growth Ideas',
  description:
    'Get email list growth ideas free: enter your niche and budget — get up to 20 tactics with effort and cost levels, plus a consent reminder. Start now.',
  howTo: [
    'Type your niche (e.g. "fitness coaching").',
    'Optionally enter your current list size for a tailored stage note.',
    'Choose a budget lane: free, paid, or both.',
    'Enter how many ideas you want (1-20) and run the generator.',
    'Pick the lowest-effort ideas first, and only add people who opted in — never buy lists.',
  ],
  methodology:
    'Ideas come from a bundled bank of 30 tactics (15 free, 15 paid), each tagged with a qualitative effort level and a qualitative cost tier — labels only, never predicted signup rates or prices. The tool filters by your budget lane and serves ideas in fixed bank order, deterministically: identical inputs always produce identical output. No AI, no network requests.',
  examples: [
    {
      title: 'Free ideas for a food blogger',
      inputs: { niche: 'easy weeknight recipes', budget: 'free', count: 10 },
      note: 'Ten free list-building tactics tailored to the niche.',
    },
    {
      title: 'Paid ideas for a coach',
      inputs: { niche: 'fitness coaching', budget: 'paid', count: 8, currentListSize: 2500 },
      note: 'Eight paid tactics with a "growing list" stage note.',
    },
    {
      title: 'Mixed ideas for a freelancer',
      inputs: { niche: 'logo design', budget: 'both', count: 12 },
      note: 'A mix of free and paid ideas in fixed bank order.',
    },
  ],
  faqs: [
    {
      question: 'What is the best email list growth ideas?',
      answer:
        'The best ideas match your budget and niche: free tactics like lead magnets, quizzes, and content upgrades compound over time, while paid tactics like newsletter sponsorships scale faster but cost money. This free tool gives you up to 20 of each, filtered by the budget lane you choose.',
    },
    {
      question: 'Is there a free email list growth ideas?',
      answer:
        'Yes — this tool is free with no signup, and it includes a free-only budget lane with 15 tactics that cost nothing but time. Generate up to 20 ideas per run, as often as you like.',
    },
    {
      question: 'How to use email list growth?',
      answer:
        'Enter your niche, pick a budget (free, paid, or both), and choose how many ideas you want. Work through the lowest-effort ideas first, measure what actually converts for you, and always grow with permission — never buy or scrape lists.',
    },
    {
      question: 'What is an email list growth ideas?',
      answer:
        'An email list growth ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the email list growth ideas?',
      answer:
        'No account needed. Open the email list growth ideas, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'What makes a good email list growth ideas?',
      answer: 'Clarity, specificity, and relevance to your audience. Avoid generic phrases — the more specific your input, the better the output.',
    },
    {
      question: 'Can I customize the generated email list growth ideas?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
  ],
  assumptions: [
    'Idea list only — the tool does not predict signup rates, subscriber counts, or results.',
    'Cost tiers are qualitative labels (Free / Low / Medium / High budget), not prices.',
    'Built from a fixed bank of 30 ideas (15 free + 15 paid), served in fixed order.',
    'This is not legal advice; consent rules vary by country — check what applies to your list.',
  ],
  jsonLd: [],
};
