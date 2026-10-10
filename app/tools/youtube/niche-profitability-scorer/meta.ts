import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/niche-profitability-scorer/';

const DESCRIPTION =
  'Pick a profitable niche with this YouTube niche scorer — competition, CPM potential, and audience demand weighed into one clear score. Compare niches.';

export const inputs: ToolInput[] = [
  {
    id: 'nicheName',
    label: 'Niche name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Personal finance',
  },
  {
    id: 'cpmBand',
    label: 'Estimated CPM band (your estimate)',
    type: 'select',
    required: true,
    options: ['under-5', '5-15', '15-30', 'over-30'],
  },
  {
    id: 'competition',
    label: 'Competition (1 = wide open, 5 = saturated)',
    type: 'number',
    required: true,
    validation: { min: 1, max: 5 },
  },
  {
    id: 'productionCost',
    label: 'Production cost (1 = cheap, 5 = expensive)',
    type: 'number',
    required: true,
    validation: { min: 1, max: 5 },
  },
  {
    id: 'buyingIntent',
    label: 'Audience buying intent (1 = low, 5 = high)',
    type: 'number',
    required: true,
    validation: { min: 1, max: 5 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'nicheName', label: 'Niche', type: 'text' },
  { id: 'score', label: 'Profitability score (0–100)', type: 'number' },
  { id: 'band', label: 'Band', type: 'text' },
  { id: 'breakdown', label: 'Score breakdown', type: 'list' },
  { id: 'notes', label: 'What each input did', type: 'list' },
  { id: 'heuristic', label: 'Heuristic flag', type: 'text' },
];

export const content: ToolContent = {
  title: 'YouTube Niche Scorer',
  description: DESCRIPTION,
  howTo: [
    'Enter the niche you are considering, e.g. "Home coffee brewing".',
    'Pick your best estimate of its CPM band — this is your guess, the tool cannot look up real CPMs.',
    'Rate competition, production cost, and audience buying intent from 1 to 5 honestly.',
    'Run the scorer to get a 0–100 score with a High / Medium / Low band.',
    'Read the breakdown to see which input moved the score most — then improve the weakest factor.',
  ],
  methodology:
    'The scorer applies a published weighted rubric to your own estimates: CPM band 35% (under-$5=15, $5–15=45, $15–30=70, over-$30=95 points), audience buying intent 25%, competition 25% (inverted — lower competition scores higher), production cost 15% (inverted — cheaper scores higher). 1–5 ratings are normalized to 0–100. Bands: 70+ High, 40–69 Medium, below 40 Low. This is an opinionated heuristic, not market data — the score is only as good as your inputs.',
  examples: [
    {
      title: 'Personal finance',
      inputs: { nicheName: 'Personal finance', cpmBand: 'over-30', competition: 2, productionCost: 2, buyingIntent: 5 },
      note: 'High-CPM, high-intent niche with manageable competition scores 88 — High band.',
    },
    {
      title: 'Generic vlogs',
      inputs: { nicheName: 'Generic vlogs', cpmBand: 'under-5', competition: 5, productionCost: 4, buyingIntent: 1 },
      note: 'Low CPM, saturated and low intent scores 9 — Low band, meaning it needs a deliberate non-ad revenue plan.',
    },
  ],
  faqs: [
    {
      question: 'what is the best youtube niche scorer?',
      answer:
        'An honest one: it must say where its numbers come from. This free scorer uses a published rubric on your own estimates (CPM band, competition, cost, buying intent) and labels the result a heuristic — it never pretends to have real market data.',
    },
    {
      question: 'is there a free youtube niche scorer?',
      answer:
        'Yes — this scorer is completely free with no signup. Enter your niche, estimate its CPM band, rate competition, production cost, and buying intent 1–5, and get a 0–100 score with a High/Medium/Low band.',
    },
    {
      question: 'how to score youtube niche?',
      answer:
        'Weigh four factors: what advertisers pay (CPM), whether the audience buys things, how crowded the niche is, and how expensive videos are to make. This tool applies fixed weights (35/25/25/15) to your ratings — but the score is only as good as the honesty of your inputs.',
    },
    {
      question: 'How does the youtube niche scorer work?',
      answer:
        'Enter your details using the inputs above and the youtube niche scorer calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube niche scorer free to use?',
      answer:
        'Yes - this youtube niche scorer is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube niche scorer?',
      answer:
        'A youtube niche scorer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the youtube niche scorer?',
      answer:
        'No account needed. Open the youtube niche scorer, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'The score is an opinionated heuristic built from your estimates, not real CPM or competition data — the tool cannot fetch either client-side.',
    'CPM bands are rough self-estimates; real CPMs vary by country, season, and channel.',
    'A Low band is not a verdict against the niche — it means monetization is harder and needs a plan beyond ad revenue.',
  ],
  jsonLd: [
  ],
};
