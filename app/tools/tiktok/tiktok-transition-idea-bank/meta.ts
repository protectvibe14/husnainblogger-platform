import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-transition-idea-bank/';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Your niche',
    type: 'select',
    required: true,
    options: [
      'Fashion',
      'Beauty',
      'Fitness',
      'Food & Drink',
      'Travel',
      'Comedy',
      'Lifestyle',
      'Education',
      'Gaming',
      'Pets',
      'Music & Dance',
      'DIY & Crafts',
    ],
  },
  {
    id: 'transitionCount',
    label: 'Number of transition ideas',
    type: 'number',
    required: true,
    placeholder: '8',
    validation: { min: 1, max: 20 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'ideas',
    label: 'Transition ideas',
    type: 'list',
    description:
    'Free tiktok transition ideas 2026: Transition ideas with a filming how-to for each. free.',
  },
  {
    id: 'copyAll',
    label: 'Copy all ideas',
    type: 'copy',
    description:
    'All transition ideas as plain text, ready to paste into your shoot notes.',
  },
];

export const content: ToolContent = {
  title: 'TikTok Transition Ideas',
  description:
    'Generate free tiktok transition ideas from a static bank of 24 hand-written transitions, each with a filming how-to. Pick your niche and count —.',
  howTo: [
    'Choose your niche from the "Your niche" dropdown (e.g. Fashion, Fitness, Comedy).',
    'Enter the "Number of transition ideas" you want, between 1 and 20.',
    'Run the tool to get transition ideas with a filming how-to for each.',
    'Ideas labelled "Needs CapCut or manual editing" require an editor — the rest are filmable in the TikTok app alone.',
    'Use "Copy all ideas" to paste the list into your shoot notes or script doc.',
  ],
  methodology:
    'This tool picks from a fixed bank of 24 hand-written transition ideas (snap change, whip pan, outfit change, object pass, jump cut, and more), each with a one-line filming how-to. A deterministic hash of your niche chooses the starting point in the bank, and ideas are taken in bank order — the same niche and count always returns the same ideas. Nothing is AI-generated and nothing is edited or rendered: this is a static idea bank.',
  examples: [
    {
      title: '8 ideas for a Fashion account',
      inputs: { niche: 'Fashion', transitionCount: 8 },
      note: 'Returns 8 transitions with how-tos; advanced ones are labelled as needing CapCut.',
    },
    {
      title: '1 idea for a Comedy account',
      inputs: { niche: 'Comedy', transitionCount: 1 },
      note: 'Returns a single transition idea with its filming how-to.',
    },
    {
      title: '20 ideas for a Travel account',
      inputs: { niche: 'Travel', transitionCount: 20 },
      note: 'Returns the maximum 20 ideas, mixing in-app and advanced transitions.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok transition ideas?',
      answer:
        'The best tiktok transition ideas are the ones you can film cleanly every time — snap change, outfit change, object pass, and whip pan are the most reliable because they hide the cut in a single motion. This free idea bank gives you up to 20 transition ideas per run, each with a filming how-to.',
    },
    {
      question: 'Is there a free tiktok transition ideas?',
      answer:
        'Yes — this TikTok transition idea bank is completely free with no signup. You can generate 1 to 20 transition ideas per run, for any of the 12 niches, as many times as you like.',
    },
    {
      question: 'How to use tiktok transition?',
      answer:
        'Pick a transition idea, film the "before" clip ending in the trigger motion (a snap, a hand covering the lens, a fast pan), then film the "after" clip starting from the same motion. Join the two clips at the motion point so the cut is invisible — the how-to under each idea tells you exactly what to film.',
    },
    {
      question: 'How does a tiktok transition ideas work?',
      answer:
        'This tool works as a static idea bank: it deterministically picks transitions from a fixed 24-idea bank based on your niche and the count you request. It does not edit or render video — transitions marked "Needs CapCut or manual editing" must be finished in an editor rather than the TikTok app.',
    },
    {
      question: 'What is a tiktok transition ideas?',
      answer:
        'A tiktok transition ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Ideas come from a fixed 24-transition bank — the same niche and count always returns the same ideas.',
    'This is a static idea bank; it does not edit, render, or automate video in the TikTok app.',
    'Advanced transitions genuinely need CapCut or another editor; they are never presented as doable in-app.',
  ],
  jsonLd: [],
};
