import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/email-marketing/lead-magnet-title-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'magnetType',
    label: 'Magnet type',
    type: 'text',
    required: true,
    placeholder: 'e.g. checklist',
  },
  {
    id: 'topic',
    label: 'Topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. morning routines',
  },
  {
    id: 'outcome',
    label: 'Reader outcome',
    type: 'text',
    required: true,
    placeholder: 'e.g. more focused workdays',
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['professional', 'friendly', 'playful', 'bold'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'titles',
    label: 'Lead magnet titles',
    type: 'table',
    description:
    'Free lead magnet title generator 2026: Table of 10 title options with character counts, assembled from fixed patterns in your. Fast, private - try.',
  },
];

export const content: ToolContent = {
  title: 'Lead Magnet Title Generator',
  description:
    'Name your freebie like a bestseller: enter the magnet format, topic, and reader outcome for 10 catchy, character-counted titles in 4 distinct tones.',
  howTo: [
    'Enter your magnet type (checklist, ebook, template, video, or email course).',
    'Enter the topic your freebie covers and the outcome the reader gets.',
    'Pick a tone: professional, friendly, playful, or bold.',
    'Run the tool to get 10 title options, each with its character count.',
    'Pick the shortest strong title — shorter names fit better on opt-in forms.',
  ],
  methodology:
    'Titles are assembled from fixed banks (12 title patterns, 16 tone adjectives across 4 tones) filled with your type, topic, and outcome — no AI, no guessing. Selection is a deterministic hash of your inputs, so the same inputs always produce the same 10 titles. Character counts measure Unicode code points, so emoji count as one character each.',
  examples: [
    {
      title: 'Bold checklist title',
      inputs: {
        magnetType: 'checklist',
        topic: 'morning routines',
        outcome: 'more focused workdays',
        tone: 'bold',
      },
      note: 'Punchy titles for a productivity checklist.',
    },
    {
      title: 'Friendly ebook title',
      inputs: {
        magnetType: 'ebook',
        topic: 'sourdough baking',
        outcome: 'your first perfect loaf',
        tone: 'friendly',
      },
      note: 'Warm titles for a beginner baking guide.',
    },
  ],
  faqs: [
    {
      question: 'What is the best lead magnet title generator?',
      answer:
        'The best one names the format, topic, and outcome in one line: this free generator combines your magnet type, topic, and reader outcome with 12 fixed title patterns in 4 tones, and shows a character count for each of the 10 options.',
    },
    {
      question: 'Is there a free lead magnet title generator?',
      answer:
        'Yes — this lead magnet title generator is completely free with no signup. You get 10 tone-matched titles with character counts per run.',
    },
    {
      question: 'How to generate lead magnet title ideas?',
      answer:
        'Name the format (checklist, ebook, template…), the topic, and the single outcome the reader gets, then pick a tone that matches your brand. Shorter titles win on opt-in forms, so compare the character counts this tool shows.',
    },
    {
      question: 'How does a lead magnet title generator work?',
      answer:
        'It fills fixed title patterns with your magnet type, topic, outcome, and a tone adjective, then counts the characters of each result. Every title is assembled from template banks — nothing is written by AI.',
    },
    {
      question: 'How does the lead magnet title generator work?',
      answer:
        'Enter your details using the inputs above and the lead magnet title generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the lead magnet title generator free to use?',
      answer:
        'Yes - this lead magnet title generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a lead magnet title generator?',
      answer:
        'A lead magnet title generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Titles are assembled from fixed banks (12 title patterns, 16 tone adjectives) — no AI copywriting is involved; results are formulaic by design.',
    'Character counts use Unicode code points (emoji count as one each), matching how most platforms measure length.',
    'Very long inputs are truncated with a visible notice.',
  ],
  jsonLd: [],
};
