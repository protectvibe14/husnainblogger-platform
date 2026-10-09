import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'profession',
    label: 'Your profession',
    type: 'text',
    required: true,
    placeholder: 'e.g. nurse, barista, student',
    validation: { max: 100 },
  },
  {
    id: 'niche',
    label: 'Day type',
    type: 'select',
    required: true,
    options: [
      'Morning routine',
      'Full workday',
      'Weekend / day off',
      'Student day',
      'Parent day',
      'Fitness day',
      'Creative workday',
      'Other',
    ],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'group', label: 'Matched profession group', type: 'text' },
  { id: 'shots', label: 'Timestamped shot list', type: 'list' },
  { id: 'captions', label: 'Caption lines', type: 'list' },
  { id: 'transitions', label: 'Transition suggestions', type: 'list' },
];

export const content: ToolContent = {
  title: 'Day in My Life Shot List',
  description:
    'Free day in my life shot list 2026: generate a day-in-my-life TikTok shot list: timestamped shots for your profession. Fast, private now.',
  howTo: [
    'Enter your profession (e.g. "nurse", "barista", "student").',
    'Pick the day type — morning routine, full workday, student day, and more.',
    'Generate to get 10 timestamped shots matched to your profession, caption lines, and transitions.',
    'If your profession is unusual, you get generic shots with "swap in your real tasks" slots — replace them with your real day.',
    'Film the shots in order, one per clip, keeping each under a few seconds.',
    'Use the transition suggestions to stitch clips smoothly and post with one of the caption lines.',
  ],
  methodology:
    'The generator matches your profession to one of 8 keyword groups (each with 10 fixed shot templates; 90 shots total) or falls back to a generic group with swap-in slots. It pairs shots with one of 8 fixed time schedules (80 time labels), then picks 4 caption lines from a bank of 12 and 3 transitions from a bank of 10 — all deterministically from your inputs. No AI is involved.',
  examples: [
    {
      title: 'Nurse workday',
      inputs: { profession: 'nurse', niche: 'Full workday' },
      note: 'Matches the healthcare group with a full workday time schedule.',
    },
    {
      title: 'Unusual profession',
      inputs: { profession: 'professional taxidermist', niche: 'Other' },
      note: 'Falls back to generic shots with swap-in-your-real-tasks slots.',
    },
  ],
  faqs: [
    {
      question: 'What is the best day in my life shot list?',
      answer:
        'The best shot lists follow your real day in order — wake-up, getting ready, commute, work blocks, meals, highlight moment, wind-down — with each shot kept to a few seconds and smooth transitions between them. This tool builds that structure from fixed templates matched to your profession; the "best" version uses your actual routine.',
    },
    {
      question: 'Is there a free day in my life shot list?',
      answer:
        'Yes — this generator is free and runs entirely in your browser. You get 10 timestamped shots, caption lines, and transition suggestions with no signup.',
    },
    {
      question: 'How do I use a day in my life shot list?',
      answer:
        'Enter your profession and day type, then generate. Film the 10 shots in order throughout your real day, stitch them with the suggested transitions, and post with one of the caption lines.',
    },
    {
      question: 'How does a day in my life shot list work?',
      answer:
        'It is a filming checklist: each entry pairs a time of day with a specific shot to capture. You work through the list during your day so the edit assembles itself in order — no guessing what to film next.',
    },
    {
      question: 'How does the day in my life shot list work?',
      answer:
        'Enter your details using the inputs above and the day in my life shot list calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the day in my life shot list free to use?',
      answer:
        'Yes - this day in my life shot list is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a day in my life shot list?',
      answer:
        'A day in my life shot list is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Template-based, not AI: shots are generic templates matched by profession keywords — adapt them to your real day.',
    'Unusual professions get generic shots with explicit swap-in slots; keyword matching is approximate (e.g. "coach" matches fitness).',
    'Time labels are fixed schedules per day type, not your actual times — adjust to your real routine.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Day in My Life Shot List 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/tiktok/tiktok-day-in-my-life-shot-list/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free day in my life shot list 2026: generate a day-in-my-life TikTok shot list: timestamped shots for your profession. Fast, private now.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        { '@type': 'ListItem', position: 3, name: 'TikTok Tools', item: 'https://husnainblogger.com/tools/tiktok/' },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'TikTok Day-in-My-Life Shot List',
          item: 'https://husnainblogger.com/tools/tiktok/tiktok-day-in-my-life-shot-list/',
        },
      ],
    },
  ],
};
