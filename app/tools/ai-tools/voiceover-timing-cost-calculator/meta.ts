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
    description: 'Free voiceover cost calculator 2026: Counted from script text, or your override. Instant, private, and mobile-friendly. No signup - try it free!',
  },
  {
    id: 'charCount',
    label: 'Character count',
    type: 'number',
    description: 'Counted from script text; estimated at 5/word if only a word count is given.',
  },
  {
    id: 'duration',
    label: 'Estimated duration',
    type: 'text',
    description: 'mm:ss estimate at your chosen words-per-minute rate.',
  },
  {
    id: 'estimatedCostUSD',
    label: 'Estimated cost (USD)',
    type: 'currency',
    description: 'Characters/1000 x your per-1k rate. Your rate is never invented by this tool.',
  },
  {
    id: 'finishedMinuteCostUSD',
    label: 'Finished-minute cost (USD)',
    type: 'currency',
    description: 'Duration in minutes x your optional per-finished-minute rate.',
  },
];

export const content: ToolContent = {
  title: 'Voiceover Cost Calculator',
  description:
    'Estimate voiceover timing and cost: paste a script, set WPM and your own per-1k-character rate. Duration, character count and cost — all estimates. Free.',
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
    {
      question: 'How does the voiceover cost calculator work?',
      answer:
        'Enter your details using the inputs above and the voiceover cost calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the voiceover cost calculator free to use?',
      answer:
        'Yes - this voiceover cost calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'Duration is an estimate at your chosen WPM — actual TTS pacing varies by voice and settings.',
    'All rates are user-entered; this tool contains no provider prices and makes no claim about what any provider charges.',
    'Character counts for word-count-only mode are estimated at 5 characters per word.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Voiceover Cost Calculator 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/voiceover-timing-cost-calculator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free voiceover cost calculator 2026: Counted from script text, or your override. Instant, private, and mobile-friendly. No signup - try it free!',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'AI Tools',
          item: 'https://husnainblogger.com/tools/ai-tools/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Voiceover Timing & Cost Calculator',
          item: 'https://husnainblogger.com/tools/ai-tools/voiceover-timing-cost-calculator/',
        },
      ],
    },
  ],
};
