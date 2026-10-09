import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/channel-trailer-script-builder/';

const DESCRIPTION =
  'Build a youtube channel trailer script in minutes — timed beats for who you are, why to subscribe and your schedule, sized to 30–60 seconds. Create yours free.';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'niche',
    label: 'Channel niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. budget travel',
  },
  {
    id: 'targetViewer',
    label: 'Target viewer',
    type: 'text',
    required: true,
    placeholder: 'e.g. busy parents',
  },
  {
    id: 'uploadSchedule',
    label: 'Upload schedule',
    type: 'text',
    required: true,
    placeholder: 'e.g. every Tuesday and Friday',
  },
  {
    id: 'durationSec',
    label: 'Trailer length (seconds)',
    type: 'text',
    required: true,
    placeholder: '30, 45 or 60',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'scripts', label: 'Timed trailer scripts', type: 'copy' },
  { id: 'wordBudgets', label: 'Word budget report', type: 'list' },
  { id: 'count', label: 'Scripts built', type: 'number' },
];

export const content: ToolContent = {
  title: 'Youtube Channel Trailer Script | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Add one item per trailer version you want and enter your channel niche (e.g. budget travel).',
    'Describe your target viewer — who the channel is for (e.g. busy parents).',
    'Enter your upload schedule exactly as you would say it (e.g. every Tuesday and Friday).',
    'Pick a trailer length: 30, 45, or 60 seconds — the word budget is calculated at 150 words per minute.',
    'Run the builder and record the timed script, replacing [Your Name] and the proof line with your real details.',
  ],
  methodology:
    'This is a fixed-template scaffold, not AI copywriting. Seven beats (hook, what, who, why subscribe, proof, schedule, CTA) are filled with your niche, target viewer, and schedule into fixed sentences, with timestamps allocated proportionally to each beat\'s word share. The word budget assumes 150 words per minute; the result reports the script\'s actual word count next to the budget so you can trim or expand to fit.',
  faqs: [
    {
      question: 'what is the best youtube channel trailer script?',
      answer:
        'The best trailer answers five things in 30–60 seconds: who you are, what the channel is about, who it is for, why someone should subscribe, and when new videos land. This free tool builds that exact structure as timed beats so you can read straight to camera.',
    },
    {
      question: 'is there a free youtube channel trailer script?',
      answer:
        'Yes — this builder is completely free with no signup. Enter your niche, target viewer, and upload schedule to get a timed 30, 45, or 60-second script with word-budget guidance.',
    },
    {
      question: 'how to use youtube channel trailer?',
      answer:
        'Record the script as your channel trailer, upload it, then set it as the featured trailer in YouTube Studio → Customization → Layout so new visitors see it first. Keep it under 60 seconds.',
    },
    {
      question: 'how does a youtube channel trailer script work?',
      answer:
        'This tool fills your niche, target viewer, and schedule into a fixed 7-beat template with timestamps and a word budget at 150 words per minute. It is a scaffold, not AI copywriting — replace the bracketed placeholders with your real name and numbers before recording.',
    },
    {
      question: 'How does the youtube channel trailer script work?',
      answer:
        'Enter your details using the inputs above and the youtube channel trailer script calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube channel trailer script free to use?',
      answer:
        'Yes - this youtube channel trailer script is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube channel trailer script?',
      answer:
        'A youtube channel trailer script is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Fixed-template scaffold, not AI copywriting — delivery and persuasion quality depend on your recording and real proof.',
    'Word budget assumes a 150 wpm speaking pace; actual pacing varies by speaker and should be timed in rehearsal.',
    'Bracketed placeholders ([Your Name], proof numbers) must be replaced with real details before publishing.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Youtube Channel Trailer Script 2026 – Free | HusnainBlogger',
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
        { '@type': 'ListItem', position: 4, name: 'Channel Trailer Script Builder', item: TOOL_URL },
      ],
    },
  ],
};
