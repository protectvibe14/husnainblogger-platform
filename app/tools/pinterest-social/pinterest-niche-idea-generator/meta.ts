import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/pinterest-niche-idea-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'interests',
    label: 'Your interests',
    type: 'text',
    required: true,
    placeholder: 'e.g. home decor, baking, travel',
    validation: { max: 120 },
  },
  {
    id: 'audience',
    label: 'Audience country',
    type: 'select',
    required: false,
    options: ['US', 'UK', 'CA', 'AU'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'nicheIdeas',
    label: 'Niche ideas',
    type: 'table',
    description:
    'Free pinterest niche ideas 2026: Ranked niche ideas with an angle and why each fits your interests. Get instant results. free now.',
  },
  {
    id: 'ideaCount',
    label: 'Ideas',
    type: 'number',
    description:
    'How many niche ideas were returned.',
  },
  {
    id: 'audienceUsed',
    label: 'Audience',
    type: 'text',
    description:
    'Which audience country the ideas are framed for.',
  },
  {
    id: 'guidance',
    label: 'Guidance',
    type: 'text',
    description:
    'Honest notes: clarifier picks for vague input, handicap warning for non-visual niches.',
  },
];

export const content: ToolContent = {
  title: 'Pinterest Niche Ideas Generator',
  description:
    'Find your Pinterest niche with confidence: describe your interests for matched ideas from 24 visual niches, with angles and honest fit guidance.',
  howTo: [
    'Describe your "Your interests" in a few words, e.g. "home decor, baking, travel".',
    'Optionally pick an "Audience country" (US, UK, CA, or AU). Leave it blank to target all four.',
    'Run the tool to get ranked niche ideas — each with an angle and a "Why it fits" explanation tied to your interests.',
    'If your input is vague, the tool asks you to pick one interest area from a clarifier list for sharper ideas.',
    'Read the "Guidance" note: it warns you honestly if your niche is non-visual, and reminds you these are pattern templates, not market data.',
  ],
  methodology:
    'Your interests are tokenized and scored against a fixed bank of 24 Pinterest-native (visual, searchable) niches, each with interest keywords, an angle template, and a fit rationale. The top 6 score, ties broken by bank order — no AI and no market data are involved. Interests matching fewer than 2 keywords are treated as vague: you get 3 exploratory picks plus a clarifier list. Interests matching non-visual hints (finance, coding, crypto, etc.) get an honest handicap note, since Pinterest rewards visual categories.',
  examples: [
    {
      title: 'Decor enthusiast',
      inputs: { interests: 'home decor and interior design' },
      note: 'Returns Home Decor ranked first with 6 ideas total, framed for a US/UK/CA/AU audience.',
    },
    {
      title: 'Foodie in the UK',
      inputs: { interests: 'cooking recipes and baking', audience: 'UK' },
      note: 'Returns Recipes & Meal Prep first, ideas framed for a UK audience.',
    },
    {
      title: 'Vague input',
      inputs: { interests: 'stuff things' },
      note: 'Returns 3 exploratory picks plus a clarifier list of interest areas to choose from.',
    },
  ],
  faqs: [
    {
      question: 'What is the best pinterest niche ideas?',
      answer:
        'The best pinterest niche ideas match two things: what you enjoy making and what Pinterest users actively search for — visual, save-worthy categories like home decor, recipes, fashion, and DIY. This free generator scores your interests against 24 such niches and ranks the best fits with angles and fit reasons.',
    },
    {
      question: 'Is there a free pinterest niche ideas?',
      answer:
        'Yes — this pinterest niche ideas generator is completely free with no signup. Describe your interests and get ranked niche ideas with angles and honest guidance, as many times as you like.',
    },
    {
      question: 'How to use pinterest niche?',
      answer:
        'Enter your interests and optionally an audience country, then run the tool. Pick one niche from the ranked ideas, validate demand with Pinterest Trends and keyword search volume, then build boards around the suggested angle.',
    },
    {
      question: 'How does a pinterest niche ideas work?',
      answer:
        'It matches your interests against a fixed bank of 24 Pinterest-native niches by counting keyword hits — the more keywords that match, the higher the niche ranks. No AI is involved, and it never claims to know which niches are profitable: the guidance tells you to validate demand with real data before committing.',
    },
    {
      question: 'How does the pinterest niche ideas work?',
      answer:
        'Enter your details using the inputs above and the pinterest niche ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the pinterest niche ideas free to use?',
      answer:
        'Yes - this pinterest niche ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a pinterest niche ideas?',
      answer:
        'A pinterest niche ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Ideas come from a fixed bank of 24 visual niches — the tool matches patterns; it does not analyze markets or predict profitability.',
    'Vague interests get 3 exploratory picks plus a clarifier list rather than confident rankings.',
    'Non-visual interests get an honest handicap warning, since Pinterest rewards visual, searchable categories.',
  ],
  jsonLd: [
  ],
};
