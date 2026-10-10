import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-seo-keyword-finder/';

const DESCRIPTION =
  'Get discovered in TikTok search with these TikTok SEO keywords — real search terms your audience types daily, matched to all your video topics.';

export const inputs: ToolInput[] = [
  {
    id: 'seedTopic',
    label: 'Seed topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. meal prep, budget travel, sourdough',
    validation: { max: 100 },
  },
  {
    id: 'niche',
    label: 'Niche (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. fitness — adds niche-combined keyword phrases',
    validation: { max: 80 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'keywordPhrases',
    label: 'Keyword-style phrases',
    type: 'list',
    description:
    'Long-tail and niche-combined keyword phrases for captions and on-screen text.',
  },
  {
    id: 'questionPhrases',
    label: 'Question-form phrases',
    type: 'list',
    description:
    'Question versions searchers actually type.',
  },
  {
    id: 'howToPhrases',
    label: 'How-to phrases',
    type: 'list',
    description:
    'Tutorial-style phrases for how-to content.',
  },
  {
    id: 'captionPlacements',
    label: 'Where to place keywords',
    type: 'list',
    description:
    '3 spots to put keywords so TikTok indexes them.',
  },
  {
    id: 'disclaimer',
    label: 'Honesty note',
    type: 'text',
    description:
    'Reminder that this is a suggestion bank, not search-volume data.',
  },
];

export const content: ToolContent = {
  title: 'TikTok SEO Keywords',
  description: DESCRIPTION,
  howTo: [
    'Type your seed topic — the core subject you want to rank for (e.g. meal prep).',
    'Optionally add your niche to get niche-combined phrases like "meal prep for fitness".',
    'Run the tool to get long-tail, question-form, and how-to keyword phrases.',
    'Pick 2–3 phrases and place them where TikTok indexes them: spoken in the first 3 seconds, on-screen text, and caption.',
    'Validate real demand by typing each phrase into TikTok search — this tool cannot show search volume.',
  ],
  methodology:
    'The tool builds keyword-style phrases from fixed word banks — 12 modifiers, 12 long-tail suffixes, 8 question templates, 8 how-to templates, and 3 niche-combination templates — selected by a deterministic rotation seeded from your inputs. There is no TikTok search-volume, competition, or CPC data anywhere in this tool, by design.',
  examples: [
    {
      title: 'Meal prep keywords',
      inputs: { seedTopic: 'meal prep', niche: 'fitness' },
      note: 'Long-tail phrases like "meal prep for beginners" plus niche combos.',
    },
    {
      title: 'Budget travel keywords',
      inputs: { seedTopic: 'budget travel' },
      note: 'Question forms like "how much does budget travel cost?" with no niche filter.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok seo keywords?',
      answer:
        'The best keywords are exact phrases your audience types — long-tail ("meal prep for beginners"), questions ("how to meal prep?"), and how-tos. This free tool generates those phrase styles from your seed topic so you can test them in TikTok search.',
    },
    {
      question: 'Is there a free tiktok seo keywords?',
      answer:
        'Yes — this TikTok SEO keyword finder is completely free with no signup. Enter a seed topic and get long-tail, question, and how-to keyword suggestions for captions and on-screen text.',
    },
    {
      question: 'How to use tiktok seo keywords?',
      answer:
        'Pick a phrase from the tool, say it out loud in the first 3 seconds of your video, put it in your on-screen text, and repeat it naturally in the caption. Then type it into TikTok search yourself to confirm real people search it — this tool shows no volume data.',
    },
    {
      question: 'What is a tiktok seo keywords?',
      answer:
        'A tiktok seo keywords is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the tiktok seo keywords?',
      answer:
        'No account needed. Open the tiktok seo keywords, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'How do I find tiktok seo keywords?',
      answer: 'Enter your criteria above and the finder surfaces the most relevant options. Refine your inputs for more targeted results.',
    },
    {
      question: 'What makes a good tiktok seo keywords?',
      answer: 'Relevance to your specific needs, not just popularity. The finder helps you filter by what actually matters for your situation.',
    },
  ],
  assumptions: [
    'This is a suggestion bank, not search-volume data — no volume, competition, or CPC numbers are shown or implied.',
    'Phrases are assembled from fixed templates; they are starting points to validate in TikTok search, not proven queries.',
    'TikTok\'s search behavior changes over time; re-check your target phrases in the app before building a series around them.',
  ],
  jsonLd: [],
};
