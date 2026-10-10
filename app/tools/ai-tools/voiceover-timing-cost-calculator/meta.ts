import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'scriptText',
    label: 'Script text',
    type: 'textarea',
    required: false,
    placeholder: 'Paste your voiceover script here\u2026',
  },
  {
    id: 'wordCountOverride',
    label: 'Word count (optional override)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 450',
  },
  {
    id: 'wpm',
    label: 'Speech rate (words per minute)',
    type: 'number',
    required: false,
    placeholder: '150',
  },
  {
    id: 'ratePer1kChars',
    label: 'Provider rate per 1,000 characters (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 0.30 — your own rate, example only',
  },
  {
    id: 'voiceoverRatePerMin',
    label: 'Voiceover rate per finished minute (USD, optional)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 50 — your own rate, example only',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'wordCount',
    label: 'Word count',
    type: 'number',
    description:
    'Free voiceover cost calculator 2026: Counted from script text, or your override. free.',
  },
  {
    id: 'charCount',
    label: 'Character count',
    type: 'number',
    description:
    'Counted from script text; estimated at 5/word if only a word count is given.',
  },
  {
    id: 'duration',
    label: 'Estimated duration',
    type: 'text',
    description:
    'mm:ss estimate at your chosen words-per-minute rate.',
  },
  {
    id: 'estimatedCostUSD',
    label: 'Estimated cost (USD)',
    type: 'currency',
    description:
    'Characters/1000 x your per-1k rate. Your rate is never invented by this tool.',
  },
  {
    id: 'finishedMinuteCostUSD',
    label: 'Finished-minute cost (USD)',
    type: 'currency',
    description:
    'Duration in minutes x your optional per-finished-minute rate.',
  },
];

export const content: ToolContent = {
  title: 'Voiceover Cost Calculator',
  description:
    'Calculate voiceover cost and timing free — counted from your script text or your own override, free. Calculate yours now!',
  howTo: [
    'Paste your script text, or enter a word count directly.',
    'Set the speech rate in words per minute (default 150 — an estimate).',
    'Enter YOUR provider rate per 1,000 characters in USD (the example placeholder is not a real price).',
    'Optionally add your voiceover rate per finished minute.',
    'Click Calculate to see word count, character count, estimated duration and estimated cost.',
  ],
  methodology:
    'This tool uses fixed arithmetic, all in your browser: duration = words / WPM x 60; cost = characters / 1000 x your rate. WPM is a labeled estimate (real pacing varies by voice and delivery), and every rate is user-entered — the tool ships no price list. If only a word count is given, characters are estimated at 5 per word and flagged as estimated.',
  examples: [
    {
      title: 'Explainer video script',
      inputs: { scriptText: 'Welcome to our product tour.', wordCountOverride: 450, wpm: 150, ratePer1kChars: 0.3 },
      note: '450 words at 150 WPM = 3:00 estimated; cost uses the counted characters times your $0.30 rate.',
    },
    {
      title: 'Word count only',
      inputs: { wordCountOverride: 900, wpm: 130, ratePer1kChars: 0.5, voiceoverRatePerMin: 40 },
      note: '900 words at 130 WPM = ~6:55; characters estimated (900 x 5) and flagged as estimated.',
    },
  ],
  faqs: [
    {
      question: 'Where does the price per 1,000 characters come from?',
      answer:
        'From you. This tool has no built-in prices — enter the rate your provider actually charges (the "e.g. 0.30" placeholder is only an example format, not a real price). Enter 0 if your tier is free.',
    },
    {
      question: 'How accurate is the duration estimate?',
      answer:
        'It is a labeled estimate: words divided by your WPM setting. Real pacing depends on the voice, speed setting, pauses and emphasis, so treat the mm:ss as a planning number, not a promise.',
    },
    {
      question: 'What if I only know the word count?',
      answer:
        'Enter it in the override field. Characters are then estimated at 5 per word and clearly flagged as estimated in the output.',
    },
    {
      question: 'Does this tool synthesize the voiceover?',
      answer:
        'No. It only calculates timing and cost from your text and your rates. Nothing here generates audio.',
    },
    {
      question: 'Is the calculator free?',
      answer:
        'Yes — completely free, no signup. It runs in your browser using simple math.',
    },
  ],
  assumptions: [
    'Duration is an estimate at your chosen WPM — actual TTS pacing varies by voice and settings.',
    'All rates are user-entered; this tool contains no provider prices and makes no claim about what any provider charges.',
    'Character counts for word-count-only mode are estimated at 5 characters per word.',
  ],
  jsonLd: [],
};
