import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-search-intent-mapper/';

const DESCRIPTION =
  'Know what viewers want with this look at what people search on TikTok — intent mapped so your videos answer real queries. Answer what viewers ask.';

export const inputs: ToolInput[] = [
  {
    id: 'searchPhrase',
    label: 'Search phrase',
    type: 'text',
    required: true,
    placeholder: 'e.g. best budget mic, how to curl hair, ramen near me',
    validation: { max: 150 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'intentLabel',
    label: 'Intent category',
    type: 'text',
    description:
    'how-to, review, entertainment, local, buy — or unclear when no signals match.',
  },
  {
    id: 'secondaryIntent',
    label: 'Secondary intent',
    type: 'text',
    description:
    'Runner-up intent for ambiguous phrases, or none.',
  },
  {
    id: 'confidence',
    label: 'Confidence note',
    type: 'text',
    description:
    'High / Moderate / Low with the matched signals that drove the call.',
  },
  {
    id: 'contentAngles',
    label: 'Content angles',
    type: 'list',
    description:
    'Video angles matched to the detected intent(s), with your phrase filled in.',
  },
  {
    id: 'captionKeywordTips',
    label: 'Caption keyword tips',
    type: 'list',
    description:
    'Where to place the phrase so TikTok indexes it.',
  },
  {
    id: 'matchedSignals',
    label: 'Matched signals',
    type: 'list',
    description:
    'Exactly which trigger words fired per intent — full transparency.',
  },
];

export const content: ToolContent = {
  title: 'TikTok Search Intent Mapper',
  description: DESCRIPTION,
  howTo: [
    'Type the exact phrase a viewer might search — e.g. "best budget mic" or "ramen near me".',
    'Run the tool: it matches your phrase against 75 fixed intent trigger words across 5 intents.',
    'Read the intent label and the confidence note — ambiguous phrases show the top-2 intents as a blend, never one invented answer.',
    'Pick a content angle and film it in that intent\'s format: tutorials answer, reviews give verdicts, entertainment hooks fast.',
    'Place the phrase where TikTok indexes it: spoken in the first 3 seconds, on-screen text, and caption.',
  ],
  methodology:
    'The tool lowercases your phrase and scores it against 5 fixed intent trigger banks (75 triggers total: how-to, review, entertainment, local, buy — 1 point per distinct trigger, single words matched on word boundaries). Two or more signals with a 2-point lead means high confidence; anything weaker shows the top-2 intents with a moderate/low confidence note. Content angles come from 30 fixed templates (6 per intent). No TikTok Search Insights data is used.',
  examples: [
    {
      title: 'Product search',
      inputs: { searchPhrase: 'best budget mic' },
      note: 'Review intent, high confidence — verdict-style angles like "worth it or skip?"',
    },
    {
      title: 'Local search',
      inputs: { searchPhrase: 'ramen near me open now' },
      note: 'Local intent — walking-tour and practical-guide angles.',
    },
    {
      title: 'Ambiguous search',
      inputs: { searchPhrase: 'best how to mic' },
      note: 'Moderate confidence blend of review + how-to instead of one forced answer.',
    },
  ],
  faqs: [
    {
      question: 'What is the best what people search on tiktok?',
      answer:
        'The best way to decode a TikTok search phrase is intent matching: is the searcher trying to learn (how-to), decide (review), laugh (entertainment), find (local), or purchase (buy)? This free tool classifies any phrase into those 5 intents and gives you video angles for each.',
    },
    {
      question: 'Is there a free what people search on tiktok?',
      answer:
        'Yes — this TikTok search intent mapper is completely free with no signup. Type any phrase and get its intent category, a confidence note, content angles, and keyword-placement tips.',
    },
    {
      question: 'How to use what people search on tiktok?',
      answer:
        'Type a phrase your audience might search, read the intent label and confidence note, then film the matching angle: tutorials for how-to, verdicts for review, fast hooks for entertainment, tours for local, comparisons for buy.',
    },
    {
      question: 'How does a what people search on tiktok work?',
      answer:
        'This tool matches your phrase against 75 fixed trigger words across 5 intents and scores each one. Strong signals get a high-confidence single intent; weak or mixed signals show the top-2 intents as a blend. It uses word-bank matching, not TikTok search data.',
    },
    {
      question: 'What is a what people search on tiktok?',
      answer:
        'A what people search on tiktok is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Classification is keyword matching against 75 fixed triggers — not TikTok Search Insights data and not a guarantee of real search demand.',
    'Ambiguous phrases deliberately return a top-2 blend with a confidence note instead of one forced classification.',
    'A phrase with no trigger matches returns "unclear" with all 5 intents as possibilities — the tool does not guess.',
  ],
  jsonLd: [],
};
