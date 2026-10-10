import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'grwmTopic',
    label: 'GRWM topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. 5-minute work makeup',
    validation: { max: 200 },
  },
  {
    id: 'niche',
    label: 'Niche',
    type: 'select',
    required: true,
    options: [
      'Skincare',
      'Makeup / Beauty',
      'Fashion / Outfits',
      'Hair',
      'Fragrance',
      'Lifestyle / Other',
    ],
  },
  {
    id: 'stepCount',
    label: 'Number of steps',
    type: 'number',
    required: true,
    validation: { min: 3, max: 10 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'hook', label: 'Opening hook', type: 'copy' },
  { id: 'branch', label: 'Template branch used', type: 'text' },
  { id: 'steps', label: 'Step-by-step plan', type: 'list' },
  { id: 'productSlots', label: 'Product mention slots', type: 'list' },
  { id: 'cta', label: 'Closing CTA', type: 'copy' },
];

export const content: ToolContent = {
  title: 'GRWM TikTok Script Planner',
  description:
    'Plan a GRWM TikTok script step by step: hook, talking points, and product slots from fixed templates. Free, runs in your browser — build your GRWM plan.',
  howTo: [
    'Type your GRWM topic in the grwmTopic field (e.g. "5-minute work makeup").',
    'Pick your niche — Skincare and Fashion / Outfits load dedicated template branches.',
    'Set stepCount between 3 and 10 for how many GRWM steps to plan.',
    'Generate to get your hook, step-by-step talking points, product slots, and CTA.',
    'Swap in your real product names wherever the plan marks a product slot.',
    'Film each step as one clip, stitch them together, and add on-screen captions.',
  ],
  methodology:
    'The planner picks a hook and CTA from fixed banks of 8 each using a deterministic hash of your inputs, then fills stepCount talking-point templates from the Skincare, Fashion, or General bank of 10 templates each. Same inputs always produce the same plan — no AI is involved.',
  examples: [
    {
      title: 'Nighttime skincare routine',
      inputs: { grwmTopic: 'glowy night skincare routine', niche: 'Skincare', stepCount: 6 },
      note: 'Loads the Skincare template branch with layering talking points.',
    },
    {
      title: 'Date-night outfit',
      inputs: { grwmTopic: 'date night outfit', niche: 'Fashion / Outfits', stepCount: 5 },
      note: 'Loads the Fashion branch with fit-check and styling talking points.',
    },
  ],
  faqs: [
    {
      question: 'What is the best GRWM TikTok script?',
      answer:
        'There is no single best script — the strongest GRWM videos use a proven structure (hook, real-time talking points, clear CTA) and personalize it. This planner gives you that structure from fixed templates; the "best" version is the one you fill with your real products and honest reactions.',
    },
    {
      question: 'Is there a free GRWM TikTok script?',
      answer:
        'Yes — this planner is free and runs entirely in your browser. You get the full plan (hook, step-by-step talking points, product mention slots, and CTA) with no signup and no cost.',
    },
    {
      question: 'How do I use a GRWM TikTok script?',
      answer:
        'GRWM means "get ready with me": you film yourself getting ready while talking viewers through each step. Use the planner to structure your topic, talking points, and product mentions before filming, then record each step as a separate clip and stitch them together.',
    },
    {
      question: 'What is a grwm tiktok script?',
      answer:
        'A grwm tiktok script is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the grwm tiktok script?',
      answer:
        'No account needed. Open the grwm tiktok script, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'What should I include in my grwm tiktok script planner plan?',
      answer: 'Cover your objectives, timeline, resources needed, and success metrics. This tool prompts you for each element so nothing gets missed.',
    },
    {
      question: 'How do I plan grwm tiktok script planner?',
      answer: 'Start by entering your goals and constraints above. The planner organizes everything into a step-by-step plan you can follow or share with your team.',
    },
  ],
  assumptions: [
    'Template-based planner, not AI: plans are assembled from fixed banks (8 hooks, 8 CTAs, 10 step templates per niche branch, 6 product-slot lines).',
    'It cannot watch your video or write in your voice — treat the output as a starting outline to personalize.',
    'Skincare and Fashion / Outfits niches load dedicated template branches; all other niches use the general branch.',
  ],
  jsonLd: [],
};
