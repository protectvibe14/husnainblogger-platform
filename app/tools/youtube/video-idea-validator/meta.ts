import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const RATING_OPTIONS = ['1', '2', '3', '4', '5'];

export const inputs: ToolInput[] = [
  {
    id: 'ideaTitle',
    label: 'Video idea title',
    type: 'text',
    required: true,
    placeholder: 'e.g. I tried waking up at 5am for 30 days',
    validation: { max: 200 },
  },
  {
    id: 'demand',
    label: 'Search demand (1 = nobody searching, 5 = lots searching)',
    type: 'select',
    required: true,
    options: RATING_OPTIONS,
  },
  {
    id: 'competition',
    label: 'Competition winnability (1 = saturated, 5 = wide open)',
    type: 'select',
    required: true,
    options: RATING_OPTIONS,
  },
  {
    id: 'channelFit',
    label: 'Channel fit (1 = off-niche, 5 = perfect fit)',
    type: 'select',
    required: true,
    options: RATING_OPTIONS,
  },
  {
    id: 'packaging',
    label: 'Packaging potential (1 = hard to title, 5 = writes itself)',
    type: 'select',
    required: true,
    options: RATING_OPTIONS,
  },
  {
    id: 'effort',
    label: 'Effort efficiency (1 = weeks of work, 5 = film this weekend)',
    type: 'select',
    required: true,
    options: RATING_OPTIONS,
  },
];

export const outputs: ToolOutput[] = [
  { id: 'score', label: 'Idea score (0–100)', type: 'number' },
  { id: 'verdict', label: 'Verdict', type: 'text' },
  { id: 'weakestFactor', label: 'Weakest factor', type: 'text' },
  { id: 'factorBreakdown', label: 'Factor breakdown', type: 'list' },
  { id: 'honestNote', label: 'What this score is', type: 'text' },
];

const DESCRIPTION =
  'Use this free YouTube video idea validator to score any idea on five transparent factors and get a greenlight, refine, or park verdict. Score it now!';

export const content: ToolContent = {
  title: 'YouTube Video Idea Validator',
  description: DESCRIPTION,
  howTo: [
    'Type your video idea title into the first field.',
    'Rate the five factors from 1 to 5: Search demand, Competition winnability, Channel fit, Packaging potential, and Effort efficiency.',
    'Run the tool to get your 0–100 score, the GREENLIGHT / REFINE / PARK verdict, and your weakest factor.',
    'If the verdict is REFINE, fix the weakest factor first — that is where the idea bleeds points.',
    'Use the score to compare several ideas and film the highest-scoring one first.',
  ],
  methodology:
    'Published transparent rubric: you self-rate five factors 1–5 and each rating earns (rating − 1) ÷ 4 × its weight — Search demand 30, Competition winnability 25, Channel fit 20, Packaging potential 15, Effort efficiency 10 (weights sum to 100). The score is the rounded total. Verdict bands: 75–100 GREENLIGHT, 50–74 REFINE, 0–49 PARK. The weakest factor is the criterion with the lowest earned share (ties break in rubric order). This is a structured gut-check calculator, not AI and not prediction: it has no access to search volume, trend data, or any live YouTube signal.',
  examples: [
    {
      title: 'Strong idea',
      inputs: { ideaTitle: 'I tested 5 budget microphones', demand: 5, competition: 4, channelFit: 5, packaging: 5, effort: 4 },
      note: 'High ratings across the board score near 100 and earn a GREENLIGHT verdict.',
    },
    {
      title: 'Idea needing work',
      inputs: { ideaTitle: 'My daily vlog #12', demand: 2, competition: 2, channelFit: 3, packaging: 2, effort: 5 },
      note: 'Weak demand, competition, and packaging drag the score down — likely REFINE or PARK.',
    },
  ],
  faqs: [
    {
      question: 'what is the best youtube video idea validator?',
      answer:
        'The honest answer: no client-side tool can truly validate an idea because validation needs real search and competition data. This free validator is a structured gut-check — you rate five factors on a published weighted rubric (demand 30, competition 25, channel fit 20, packaging 15, effort 10) and get a GREENLIGHT, REFINE, or PARK verdict to help you compare ideas.',
    },
    {
      question: 'is there a free youtube video idea validator?',
      answer:
        'Yes — this validator is completely free with no signup. You self-rate five factors 1–5 and get a 0–100 score with a verdict and weakest-factor callout. Remember the ratings are your judgment, not YouTube data.',
    },
    {
      question: 'how to validate youtube video idea?',
      answer:
        'Rate the idea honestly on this tool\'s five-factor rubric to find its weak spots, then check YouTube autocomplete and Google Trends for the topic and look at what competing videos already exist. This validator structures your judgment — it does not replace real research, and it cannot predict views.',
    },
    {
      question: 'How does the youtube video idea validator work?',
      answer:
        'Enter your details using the inputs above and the youtube video idea validator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube video idea validator free to use?',
      answer:
        'Yes - this youtube video idea validator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube video idea validator?',
      answer:
        'A youtube video idea validator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the youtube video idea validator?',
      answer:
        'No account needed. Open the youtube video idea validator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'The score comes entirely from YOUR 1–5 ratings — honest input is required; the tool cannot verify your ratings.',
    'No search-volume, trend, or competitor data is available client-side. This is a structured gut-check, not validation, and cannot predict performance.',
    'The rubric weights (30/25/20/15/10) are a fixed editorial choice, not derived from YouTube algorithm data.',
    'Scores are rounded integers 0–100; the weakest factor is the lowest earned share, with ties broken in rubric order.',
  ],
  jsonLd: [
  ],
};
