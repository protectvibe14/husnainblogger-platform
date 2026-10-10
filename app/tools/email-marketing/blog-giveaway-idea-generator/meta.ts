import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'blogNiche',
    label: 'Blog niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. home baking',
  },
  {
    id: 'audience',
    label: 'Audience',
    type: 'text',
    required: true,
    placeholder: 'e.g. new parents',
  },
  {
    id: 'prizeBudget',
    label: 'Prize budget (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. $50',
  },
  {
    id: 'count',
    label: 'Number of ideas (1–10)',
    type: 'number',
    required: true,
    validation: { min: 1, max: 10 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'ideas', label: 'Giveaway ideas', type: 'table' },
  { id: 'notice', label: 'Notice', type: 'text' },
];

const DESCRIPTION =
  'Plan a giveaway readers actually want: enter your niche, audience, and prize budget for tier-matched prize ideas with entry mechanics that grow your list.';

export const content: ToolContent = {
  title: 'Blog Giveaway Ideas Generator',
  description: DESCRIPTION,
  howTo: [
    'Enter your blog niche (e.g. “home baking”).',
    'Describe your audience (e.g. “new parents”).',
    'Optionally enter a prize budget (e.g. “$50”) to get tier-matched prize ideas.',
    'Choose how many ideas you want (1–10) and generate.',
    'Each idea shows a title, prize, entry mechanic, and duration — pick the one that fits your list goals.',
  ],
  methodology:
    'Ideas are assembled deterministically from fixed banks: 12 idea-title templates, 24 prize templates across 4 budget tiers (low/mid/high/unspecified), 6 entry mechanics, and 4 durations. Your prize budget text is scanned for a dollar amount to pick a prize tier; a code-point hash of your niche and audience picks the starting offsets. No AI and no network: the same inputs always produce the same list. Prizes are template ideas, not real products with real prices.',
  examples: [
    {
      title: 'Baking blog giveaway with a $50 budget',
      inputs: { blogNiche: 'home baking', audience: 'new parents', prizeBudget: '$50', count: 3 },
      note: 'Three mid-tier giveaway ideas with email-list entry mechanics.',
    },
    {
      title: 'Travel blog giveaway with no set budget',
      inputs: { blogNiche: 'travel', audience: 'students', prizeBudget: '', count: 2 },
      note: 'Two ideas with honest generic prizes until a budget is set.',
    },
  ],
  faqs: [
    {
      question: 'What is the best blog giveaway ideas generator?',
      answer:
        'The best one pairs each idea with a prize, entry mechanic, and duration — not just a title. This free generator gives 1–10 complete giveaway ideas matched to your niche, audience, and optional prize budget.',
    },
    {
      question: 'Is there a free blog giveaway ideas generator?',
      answer:
        'Yes — this blog giveaway ideas generator is completely free with no signup. Enter your niche and audience to get prize, entry-mechanic, and duration combos instantly.',
    },
    {
      question: 'How to generate blog giveaway?',
      answer:
        'Enter your blog niche, audience, and optional prize budget, then choose how many ideas you want. The tool assembles each idea from fixed template banks and picks a prize tier from your budget.',
    },
    {
      question: 'How does a blog giveaway ideas generator work?',
      answer:
        'It combines your niche with fixed banks of idea titles, prizes, entry mechanics, and durations. A dollar amount in your budget text selects the prize tier. No AI is involved, so the same inputs always produce the same ideas.',
    },
    {
      question: 'How does the blog giveaway ideas generator work?',
      answer:
        'Enter your details using the inputs above and the blog giveaway ideas generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the blog giveaway ideas generator free to use?',
      answer:
        'Yes - this blog giveaway ideas generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a blog giveaway ideas generator?',
      answer:
        'A blog giveaway ideas generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Prizes are template ideas, not real products — verify availability and pricing yourself.',
    'Giveaway rules and tax obligations vary by country; this is not legal advice.',
    'Ideas come from fixed template banks, not AI; wording variety is limited.',
  ],
  jsonLd: [],
};
