import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-script-structurer/';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Video topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. meal prep for beginners',
    validation: { max: 200 },
  },
  {
    id: 'niche',
    label: 'Niche (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. fitness, food, finance — matched to a niche hook bank',
    validation: { max: 60 },
  },
  {
    id: 'targetDurationSec',
    label: 'Target duration (seconds)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 30',
    validation: { min: 3, max: 600 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'fullScript',
    label: 'Full beat sheet',
    type: 'copy',
    description:
    'Free tiktok script template 2026: Numbered, copy-ready script structure: hook, beats, and CTA with timings. Fast, private now.',
  },
  {
    id: 'beats',
    label: 'Timed beats',
    type: 'list',
    description:
    'Each beat with its time range and approximate word count.',
  },
  {
    id: 'timingNote',
    label: 'Timing summary',
    type: 'text',
    description:
    'Planned duration, beat count, and estimated spoken words.',
  },
];

export const content: ToolContent = {
  title: 'TikTok Script Template',
  description:
    'Create a free tiktok script template: enter your topic, pick a duration, and get a timed hook-beats-CTA beat sheet fitted to your video. Start.',
  howTo: [
    'Enter your "Video topic" in a few words (up to 200 characters).',
    'Add your "Niche" (optional) to pull hooks from a niche-matched bank — leave it blank for generic hooks.',
    'Set the "Target duration (seconds)" between 3 and 600.',
    'Run the tool to get the full beat sheet, timed beats, and the timing summary.',
    'Film beat by beat — each beat shows its time range and approximate word count.',
  ],
  methodology:
    'The tool assembles the beat sheet from 82 fixed, hand-written sentence frames (12 generic hooks, 32 niche hooks across 8 niches, setups, value beats, re-hooks, twists, and CTAs) — no AI and no TikTok platform data. Beat count scales with duration (3 beats at 15s up to 9 beats over 60s); word budgets per beat are pacing estimates at 150 spoken words per minute. Picks are deterministic: the same topic and niche always produce the same script.',
  examples: [
    {
      title: 'Food niche, 30 seconds',
      inputs: { topic: 'meal prep for beginners', niche: 'food', targetDurationSec: 30 },
      note: 'Five beats with a food-niche hook and a mid-video value stack.',
    },
    {
      title: 'No niche, 60 seconds',
      inputs: { topic: 'home organization', niche: '', targetDurationSec: 60 },
      note: 'Seven beats with generic hooks and a twist before the CTA.',
    },
    {
      title: 'Long-form, 5 minutes',
      inputs: { topic: 'budget travel tips', niche: 'travel', targetDurationSec: 300 },
      note: 'Nine beats including a mid-video re-hook for retention.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok script template?',
      answer:
        'The best template follows a fixed beat structure: a hook in the first 3 seconds, 2–7 value beats fitted to your duration, and a clear CTA at the end. This free tool builds exactly that structure from your topic and target duration, with timings and word budgets for every beat.',
    },
    {
      question: 'Is there a free tiktok script template?',
      answer:
        'Yes — this TikTok script structurer is completely free with no signup. You get a full numbered beat sheet with timed beats (hook, setup, value, twist, CTA) matched to the duration you choose, from 3 seconds up to 10 minutes.',
    },
    {
      question: 'How to use tiktok?',
      answer:
        'For scripting: enter your video topic, optionally add your niche for matched hooks, set your target duration, and film the beat sheet the tool returns — hook first, value in the middle, CTA last. The tool caps plans at 600 seconds, the standard TikTok upload ceiling.',
    },
    {
      question: 'What is a tiktok script template?',
      answer:
        'A tiktok script template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the tiktok script template?',
      answer:
        'No account needed. Open the tiktok script template, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Scripts are assembled from 82 fixed template frames — the wording is templated, not AI-written. Rewrite lines in your own voice before filming.',
    'Word counts are pacing estimates at ~150 words per minute; your actual speaking speed will differ.',
    'The tool caps plans at 600 seconds (10 minutes). Longer uploads need special account eligibility — check the TikTok app.',
    'No performance outcome is promised or estimated; the tool plans structure, not reach.',
  ],
  jsonLd: [],
};
