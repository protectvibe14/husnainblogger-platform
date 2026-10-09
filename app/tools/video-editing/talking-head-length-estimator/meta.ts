import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'scriptText',
    label: 'Your script',
    type: 'textarea',
    required: true,
    placeholder: 'Paste the full talking-head script here...',
  },
  {
    id: 'wpm',
    label: 'Speaking rate (words/min, default 140)',
    type: 'number',
    required: false,
    placeholder: '140',
    validation: { min: 60, max: 250 },
  },
  {
    id: 'pauseAllowancePct',
    label: 'Pause allowance % (default 10)',
    type: 'number',
    required: false,
    placeholder: '10',
    validation: { min: 0, max: 50 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'estimatedSec', label: 'Estimated length (seconds)', type: 'number' },
  { id: 'wordCount', label: 'Word count', type: 'number' },
  { id: 'rangeLowSec', label: 'Range low (seconds)', type: 'number' },
  { id: 'rangeHighSec', label: 'Range high (seconds)', type: 'number' },
  { id: 'estimateBasis', label: 'Estimate basis', type: 'text' },
  { id: 'note', label: 'Estimate note', type: 'text' },
];

export const content: ToolContent = {
  title: 'Script to Video Length',
  description:
    'Convert script to video length: paste your talking-head script, set your speaking rate, and get an estimated duration range with pause allowance. Free.',
  howTo: [
    'Paste your full talking-head script into the script box.',
    'Set your speaking rate in words per minute — 140 is the default (typical conversational pace).',
    'Set the pause allowance % for breaths and beats — 10% is the default.',
    'Run the estimator to get the estimated length plus a low-high range in seconds.',
    'Plan your edit around the range, not the single number — speaking speed is personal.',
  ],
  methodology:
    'Published timing formula, no AI: estimatedSec = ceil((units / rate x 60) x (1 + pause% / 100)), with rangeLow = ceil(estimate x 0.8) and rangeHigh = ceil(estimate x 1.2). Units are words at your speaking rate (default 140 wpm, allowed 60-250); CJK scripts are detected and counted by character at an estimated 300 chars/min. All results round up to whole seconds. Because speaking speed varies per person, the tool always reports a range — an estimate, never an exact runtime.',
  examples: [
    {
      title: '140-word script',
      inputs: { scriptText: 'word '.repeat(140).trim(), wpm: 140, pauseAllowancePct: 10 },
      note: 'About 66 seconds, with a 53-80 second planning range.',
    },
    {
      title: '500-word script',
      inputs: { scriptText: 'word '.repeat(500).trim(), wpm: 140, pauseAllowancePct: 10 },
      note: 'About 236 seconds (3m 56s), with a 3m 9s-4m 44s planning range.',
    },
  ],
  faqs: [
    {
      question: 'What is the best script to video length?',
      answer:
        'The best estimator shows its formula and gives you a range, not a fake exact number. This free tool converts your script to video length from your own speaking rate (default 140 wpm) plus a pause allowance, and always returns a low-high range because speaking speed is personal.',
    },
    {
      question: 'Is there a free script to video length?',
      answer:
        'Yes — this estimator is completely free with no signup. Paste your script, optionally adjust the speaking rate (60-250 wpm) and pause allowance (0-50%), and get the estimated length with a planning range instantly.',
    },
    {
      question: 'How to use script to video length?',
      answer:
        'Paste the full script, set your speaking rate (time yourself reading a paragraph if you do not know it — 140 wpm is a typical conversational pace), set the pause allowance for breaths and beats, and run the estimator. Use the low-high range for planning your edit, not the point estimate.',
    },
    {
      question: 'How does the script to video length work?',
      answer:
        'Enter your details using the inputs above and the script to video length calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the script to video length free to use?',
      answer:
        'Yes - this script to video length is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a script to video length?',
      answer:
        'A script to video length is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the script to video length?',
      answer:
        'No account needed. Open the script to video length, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'The result is an estimate: speaking speed varies per person, so a range is always reported, never a single exact number.',
    'The 140 wpm default and 300 chars/min CJK rate are labeled estimates, not measurements of your voice.',
    'Pause allowance (default 10%) is a heuristic for breaths, beats, and emphasis pauses.',
    'CJK scripts are counted by character; mixed scripts fall back to whichever system dominates.',
    'Results are deterministic: the same script and settings always produce the same estimate.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Script to Video Length 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/video-editing/talking-head-length-estimator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Convert script to video length: paste your talking-head script, set your speaking rate, and get an estimated duration range with pause allowance. Free.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'CapCut & Video Editing',
          item: 'https://husnainblogger.com/tools/video-editing/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Talking-Head Length Estimator',
          item: 'https://husnainblogger.com/tools/video-editing/talking-head-length-estimator/',
        },
      ],
    },
  ],
};
