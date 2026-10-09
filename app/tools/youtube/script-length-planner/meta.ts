import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/script-length-planner/';

const DESCRIPTION =
  'Match script to runtime with this YouTube script length calculator — enter your target minutes and get the word count your video actually needs.';

export const inputs: ToolInput[] = [
  {
    id: 'mode',
    label: 'Conversion direction',
    type: 'select',
    required: true,
    options: ['duration_to_words', 'words_to_duration'],
  },
  {
    id: 'targetMinutes',
    label: 'Target duration (minutes)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 10',
    validation: { min: 0.1 },
  },
  {
    id: 'wordCount',
    label: 'Script word count',
    type: 'number',
    required: false,
    placeholder: 'e.g. 1500',
    validation: { min: 1 },
  },
  {
    id: 'wpm',
    label: 'Speaking rate (words per minute)',
    type: 'number',
    required: false,
    placeholder: '150 (default)',
    validation: { min: 1 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'words', label: 'Required word count', type: 'number' },
  { id: 'durationMinutes', label: 'Estimated duration (minutes)', type: 'number' },
  { id: 'segmentBudgets', label: 'Per-section word budgets', type: 'list' },
  { id: 'notes', label: 'Warnings and planning notes', type: 'list' },
  { id: 'summary', label: 'Plain-English result', type: 'text' },
];

export const content: ToolContent = {
  title: 'YouTube Script Length Calculator',
  description: DESCRIPTION,
  howTo: [
    'Pick the conversion direction: minutes → words (planning a new script) or words → minutes (timing a draft).',
    'Enter your target duration in minutes, or your script word count — only the matching field is required.',
    'Set your speaking rate in words per minute (150 is the default narration convention); adjust it to match your delivery.',
    'Run the planner to get the required word count, the estimated duration, and per-section budgets for hook, setup, value, payoff, and CTA.',
    'Read the planning notes: a Shorts-length check appears for targets of 3:00 or less, and a warning appears for unusual speaking rates.',
  ],
  methodology:
    'Pure arithmetic: words = minutes × wpm and minutes = words ÷ wpm. Section budgets use a fixed 5-part structure template (hook 5%, setup 10%, main value 60%, payoff 15%, CTA 10%) — a planning convention, not a YouTube rule. The 150 wpm default is a narration convention (an estimate); every figure this tool shows is labeled an estimate, and nothing is AI-generated.',
  examples: [
    {
      title: '10-minute tutorial script',
      inputs: { mode: 'duration_to_words', targetMinutes: 10, wpm: 150 },
      note: 'Needs roughly 1,500 words, split across the five fixed sections.',
    },
    {
      title: 'Timing a 900-word draft',
      inputs: { mode: 'words_to_duration', wordCount: 900, wpm: 150 },
      note: 'Takes about 6 minutes to read at a standard narration pace.',
    },
  ],
  faqs: [
    {
      question: 'what is the best youtube script length calculator?',
      answer:
        'The best one converts both ways (minutes to words and words to minutes), lets you set your own speaking rate, and breaks the result into section budgets. This free tool does exactly that — enter a target duration or a word count, pick your words-per-minute, and it plans the rest.',
    },
    {
      question: 'is there a free youtube script length calculator?',
      answer:
        'Yes — this tool is completely free with no signup. Convert video minutes to script words (or the reverse), adjust the speaking rate from the 150 wpm default, and get per-section word budgets for hook, setup, value, payoff, and CTA.',
    },
    {
      question: 'how to calculate youtube script length?',
      answer:
        'Multiply your target minutes by your speaking rate (around 150 words per minute for narration): a 10-minute video needs roughly 1,500 words. This tool does the math both ways and splits the total into section budgets — just remember pauses and B-roll add unscripted time on top.',
    },
    {
      question: 'How does the youtube script length calculator work?',
      answer:
        'Enter your details using the inputs above and the youtube script length calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube script length calculator free to use?',
      answer:
        'Yes - this youtube script length calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube script length calculator?',
      answer:
        'A youtube script length calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the youtube script length calculator?',
      answer:
        'No account needed. Open the youtube script length calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    '150 wpm is a narration convention (an estimate), not a YouTube rule — budgets are only as accurate as the speaking rate you set.',
    'All figures are estimates: pauses, B-roll, silence and demos add unscripted time, so finished videos usually run 10–20% longer than the script math.',
    'Section percentages (5/10/60/15/10) are a planning convention, not a requirement from YouTube.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'YouTube Script Length Calculator 2026 | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: DESCRIPTION,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        { '@type': 'ListItem', position: 3, name: 'YouTube Tools', item: 'https://husnainblogger.com/tools/youtube/' },
        { '@type': 'ListItem', position: 4, name: 'Script Length Planner', item: TOOL_URL },
      ],
    },
  ],
};
