import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/facebook-post-idea-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'pageType',
    label: 'Page type',
    type: 'text',
    required: true,
    placeholder: 'e.g. bakery, fitness coaching, local news',
    validation: { max: 60 },
  },
  {
    id: 'goal',
    label: 'Post goal',
    type: 'select',
    required: false,
    options: ['engagement', 'traffic', 'community'],
  },
  {
    id: 'yourDraft',
    label: 'Your draft (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'Paste an existing draft to keep it alongside the ideas (optional).',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'postDrafts',
    label: 'Post drafts',
    type: 'list',
    description:
    'Free facebook post ideas 2026: 5 post drafts with hook, body, and CTA — hooks front-loaded for feed truncation. Fast, private now.',
  },
  {
    id: 'copyAll',
    label: 'Copy all drafts',
    type: 'copy',
    description:
    'All 5 drafts as plain text, ready to adapt and publish.',
  },
  {
    id: 'trimTip',
    label: 'Length guidance',
    type: 'text',
    description:
    'Front-loading and truncation guidance (best practice, not a hard cap).',
  },
  {
    id: 'yourDraft',
    label: 'Your draft, kept',
    type: 'text',
    description:
    'Your pasted draft, returned verbatim with a trim note if it is long.',
  },
];

export const content: ToolContent = {
  title: 'Facebook Post Ideas',
  description:
    'Beat the blank page on posting day: pick an engagement, traffic, or community goal and get 5 complete post drafts with hooks, bodies, and CTAs.',
  howTo: [
    'Type your page type into the "Page type" field (e.g. bakery).',
    'Pick a "Post goal": engagement, traffic, or community. Leave blank to default to engagement.',
    'Optionally paste an existing draft into "Your draft" — it is kept verbatim with a trim note if it is long.',
    'Run the tool to get 5 drafts, each with a front-loaded hook, body, and CTA.',
    'Read the "Length guidance": keep the key message in the first ~125–150 characters for mobile feeds, then adapt a draft to your voice and publish.',
  ],
  methodology:
    'This tool assembles drafts from a fixed bank of 24 hand-written post ideas (8 per goal: engagement, traffic, community), inserting your page type. The 5 drafts per run are picked deterministically from your inputs — no AI is involved. Every hook is written under 120 characters so the key message lands before mobile feed truncation (~125–150 characters) — this is best-practice guidance, not a hard cap. The technical 63,206-character maximum is noted but never targeted.',
  examples: [
    {
      title: 'Engagement posts for a bakery',
      inputs: { pageType: 'bakery', goal: 'engagement' },
      note: 'Returns 5 comment-driven drafts like polls and caption challenges.',
    },
    {
      title: 'Traffic posts for a blog',
      inputs: { pageType: 'fitness coaching', goal: 'traffic' },
      note: 'Returns 5 link-driven drafts pointing to articles and free downloads.',
    },
  ],
  faqs: [
    {
      question: 'What is the best facebook post ideas?',
      answer:
        'The best facebook post ideas match a clear goal: questions and challenges drive engagement, how-to teasers with a link drive traffic, and introductions and spotlights build community. Every format needs a hook in the first line because mobile feeds truncate posts around 125–150 characters. This free generator builds 5 drafts per goal from proven patterns.',
    },
    {
      question: 'Is there a free facebook post ideas?',
      answer:
        'Yes — this facebook post idea generator is completely free with no signup. You get 5 hook/body/CTA drafts per run for engagement, traffic, or community goals, as many times as you like.',
    },
    {
      question: 'How to use facebook post?',
      answer:
        'Enter your page type, pick a goal, and run the tool. Then adapt a draft to your voice, keep the key message in the first ~125–150 characters, add your link or photo, and publish from your Page.',
    },
    {
      question: 'How does a facebook post ideas work?',
      answer:
        'It inserts your page type into 24 hand-written post ideas (8 per goal), picking 5 deterministically from your inputs — no AI involved. Drafts are front-loaded for feed truncation as best practice; the 63,206-character technical maximum is noted but not a target.',
    },
    {
      question: 'What is a facebook post ideas?',
      answer:
        'A facebook post ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'What makes a good facebook post ideas?',
      answer: 'Clarity, specificity, and relevance to your audience. Avoid generic phrases — the more specific your input, the better the output.',
    },
    {
      question: 'How do I create facebook post ideas?',
      answer: 'Describe what you need in the input fields, then click generate. You can regenerate as many times as you like and copy the version that fits best.',
    },
  ],
  assumptions: [
    'Drafts come from a fixed bank of 24 ideas (8 per goal) — the tool assembles text; it does not write with AI or predict performance.',
    'The ~125–150 character truncation guidance is best practice for mobile feeds, not a hard cap.',
    'Adapt every draft to your voice and audience; replace "[link]" placeholders with real URLs before publishing.',
  ],
  jsonLd: [],
};
