import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-voiceover-script-formatter/';

export const inputs: ToolInput[] = [
  {
    id: 'rawScript',
    label: 'Raw voiceover script',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. Welcome to the fastest way to fold a fitted sheet.\n\nLay it flat on the bed first.',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'formattedScript',
    label: 'Formatted script',
    type: 'copy',
    description:
    'Free tiktok voiceover script 2026: Scene-numbered lines with [pause] markers between scenes — ready to read aloud or paste. Fast, private.',
  },
  {
    id: 'captionLines',
    label: 'Caption-ready lines',
    type: 'list',
    description:
    'Each scene word-wrapped to 42 characters per line for mobile caption readability.',
  },
  {
    id: 'stats',
    label: 'Script stats',
    type: 'text',
    description:
    'Scene count, caption-line count, and word count for your script.',
  },
];

export const content: ToolContent = {
  title: 'TikTok Voiceover Script',
  description:
    'Format a free tiktok voiceover script: scene-numbered lines, pause markers, and caption-ready lines wrapped at 42 chars. Paste your raw script —.',
  howTo: [
    'Paste your raw voiceover script into the "Raw voiceover script" box (one line per beat works best).',
    'Run the tool: every non-empty line becomes a numbered scene with a [pause] marker between scenes.',
    'Read the "Formatted script" aloud to time your voiceover, or copy it into your editor notes.',
    'Use the "Caption-ready lines" list for on-screen captions — every line is wrapped to 42 characters.',
    'Check "Script stats" for your scene count, caption-line count, and total word count.',
  ],
  methodology:
    'This tool splits your script into non-empty lines with a fixed rule (line breaks only — no AI, no translation, no text-to-speech). Each line becomes a numbered scene, a [pause] marker is placed between scenes, and every scene is word-wrapped to a 42-character caption readability guideline. Mixed-language scripts are kept exactly as-is. The stats line counts scenes, caption lines, and whitespace-separated words.',
  examples: [
    {
      title: 'Three-beat cooking script',
      inputs: {
        rawScript: 'Welcome to the fastest way to fold a fitted sheet.\n\nLay it flat on the bed first.\nTuck the corners together and smooth it out.',
      },
      note: 'Returns 3 numbered scenes, 2 pause markers, 5 caption lines, and the stats line.',
    },
    {
      title: 'Single-line script',
      inputs: { rawScript: 'One line only.' },
      note: 'Becomes a single scene with one caption line and no pause markers.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok voiceover script?',
      answer:
        'The best tiktok voiceover script is written in short spoken beats with natural pauses — one idea per line, read the way you would say it out loud. This free formatter turns a raw script into numbered scenes with [pause] markers between them, plus caption-ready lines wrapped at 42 characters for mobile readability.',
    },
    {
      question: 'Is there a free tiktok voiceover script?',
      answer:
        'Yes — this TikTok voiceover script formatter is completely free with no signup. Paste any script and get scene-numbered lines, pause markers, and caption-ready lines, as many times as you like.',
    },
    {
      question: 'How to use tiktok voiceover?',
      answer:
        'Record your voiceover in the TikTok app by tapping the microphone icon after filming, or record it in your editor against the formatted script. Paste your script here first to get scene numbers and [pause] markers so you know exactly where to breathe between beats, then read each scene in one take.',
    },
    {
      question: 'How does the tiktok voiceover script work?',
      answer:
        'Enter your details using the inputs above and the tiktok voiceover script calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok voiceover script free to use?',
      answer:
        'Yes - this tiktok voiceover script is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok voiceover script?',
      answer:
        'A tiktok voiceover script is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the tiktok voiceover script?',
      answer:
        'No account needed. Open the tiktok voiceover script, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'This is pure text formatting: it does not generate audio, translate, or perform text-to-speech.',
    'Scene splitting follows line breaks — a paragraph on one line becomes a single scene.',
    'The 42-character caption wrap is a readability guideline, not a TikTok rule.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'TikTok Voiceover Script 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free tiktok voiceover script 2026: Scene-numbered lines with [pause] markers between scenes — ready to read aloud or paste. Fast, private.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'TikTok Tools',
          item: 'https://husnainblogger.com/tools/tiktok/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'TikTok Voiceover Script Formatter',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
