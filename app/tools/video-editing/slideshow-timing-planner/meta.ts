import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'slideCount',
    label: 'Number of slides (1 or more)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 5',
    validation: { min: 1 },
  },
  {
    id: 'totalDurationSec',
    label: 'Total duration (seconds, above 0)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 12',
    validation: { min: 0.1, unit: 's' },
  },
  {
    id: 'transitionMs',
    label: 'Transition per cut (ms, default 500)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 500',
    validation: { min: 0, unit: 'ms' },
  },
  {
    id: 'holdStyle',
    label: 'Hold style',
    type: 'select',
    required: true,
    options: ['equal', 'weightedByText'],
  },
  {
    id: 'textLengths',
    label: 'Per-slide text lengths (comma-separated character counts, for weighted-by-text)',
    type: 'text',
    required: false,
    placeholder: 'e.g. 100, 20, 40',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'timeline', label: 'Slide timeline (start/end ms)', type: 'copy' },
  { id: 'totalCheck', label: 'Total check and notes', type: 'text' },
];

export const content: ToolContent = {
  title: 'Slideshow Timing Calculator 2026 – Free | HusnainBlogger',
  description:
    'Split video time across slides free: this slideshow timing calculator builds a start/end timeline with transitions and equal or text-weighted holds. Try it now.',
  howTo: [
    'Enter the number of slides and the total duration in seconds.',
    'Set the transition length per cut in milliseconds (default 500).',
    'Choose equal holds or weighted-by-text — text-heavy slides get more time.',
    'For weighted-by-text, enter comma-separated character counts, one per slide.',
    'Copy the timeline: each slide\'s start and end in milliseconds plus its outgoing transition.',
    'Read the totals check — the plan always sums to your total exactly.',
  ],
  methodology:
    'Pure arithmetic, never AI: the tool subtracts all transitions from the total (non-overlapping model), then divides the remaining hold time equally or proportionally to per-slide character counts (minimum weight 10 so empty slides still get a beat). Milliseconds are allocated with the largest-remainder method so the timeline always sums to the total exactly. Output is a timing plan — no media is rendered, and holds exclude export time.',
  examples: [
    {
      title: 'Five-slide product teaser',
      inputs: { slideCount: 5, totalDurationSec: 12, transitionMs: 500, holdStyle: 'equal' },
      note: '2,000ms per slide with 500ms transitions — each hold stays above the 1.5s readability line.',
    },
    {
      title: 'Text-weighted tutorial slideshow',
      inputs: { slideCount: 3, totalDurationSec: 12, transitionMs: 500, holdStyle: 'weightedByText', textLengths: '100, 20, 40' },
      note: 'The 100-character slide gets the longest hold automatically.',
    },
  ],
  faqs: [
    {
      question: 'What is the best slideshow timing calculator?',
      answer:
        'The best one proves its math. This free calculator turns your slide count, total duration, and transition length into a start/end timeline per slide — with equal or text-weighted holds — and a totals check confirming the plan sums to your exact duration.',
    },
    {
      question: 'Is there a free slideshow timing calculator?',
      answer:
        'Yes — this calculator is completely free with no signup. Enter your slide count, total duration, transition length, and hold style (equal or weighted-by-text) to get the full timeline and totals check instantly.',
    },
    {
      question: 'How to calculate slideshow timing?',
      answer:
        'Subtract all transitions from the total first, then divide what remains across slides — equally, or proportionally to each slide\'s text length. This calculator does that arithmetic for you and lays out each slide\'s start and end in milliseconds so the plan sums to the total exactly.',
    },
    {
      question: 'How does a slideshow timing calculator work?',
      answer:
        'It is pure arithmetic, not AI: transitions are subtracted from the total (non-overlapping model), then the remaining hold time is split equally or weighted by character counts, allocated in whole milliseconds with the largest-remainder method. If transitions would eat the whole duration, it errors instead of producing an impossible plan.',
    },
    {
      question: 'How does the slideshow timing calculator work?',
      answer:
        'Enter your details using the inputs above and the slideshow timing calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the slideshow timing calculator free to use?',
      answer:
        'Yes - this slideshow timing calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a slideshow timing calculator?',
      answer:
        'A slideshow timing calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Non-overlapping model: sum(holds) + transitions = total; cross-dissolves that overlap holds are not modeled.',
    'The transition must be shorter than each slide\'s hold — otherwise the tool errors.',
    'Weighted-by-text needs exactly one character count per slide; empty slides get a minimum weight of 10.',
    'Holds under 1.5s raise a readability note but are still planned.',
    'Output is a timing plan only — no media rendering, and holds exclude export time.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Slideshow Timing Calculator 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/video-editing/slideshow-timing-planner/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Split video time across slides free: this slideshow timing calculator builds a start/end timeline with transitions and equal or text-weighted holds. Try it now.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Video Editing Tools',
          item: 'https://husnainblogger.com/tools/video-editing/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Slideshow Timing Planner',
          item: 'https://husnainblogger.com/tools/video-editing/slideshow-timing-planner/',
        },
      ],
    },
  ],
};
