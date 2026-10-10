import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/community-post-idea-bank/';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. sourdough baking, fitness, gaming',
    validation: { max: 80 },
  },
  {
    id: 'postType',
    label: 'Post type',
    type: 'select',
    required: true,
    options: ['poll', 'image', 'text', 'quiz'],
  },
  {
    id: 'count',
    label: 'Ideas wanted',
    type: 'number',
    required: false,
    placeholder: '1-8 (default 5)',
    validation: { min: 1, max: 8 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'ideas',
    label: 'Post ideas',
    type: 'list',
    description:
    'Free youtube community post ideas 2026: Ready-to-adapt post ideas with type, template number and character count. Fast, private now.',
  keywords: ['youtube community post ideas funny', 'youtube community post poll ideas', 'youtube quiz community post ideas'],
  },
  {
    id: 'note',
    label: 'Template note',
    type: 'text',
    description:
    'Bank size, no-publish disclaimer and character-limit guidance.',
  },
];

export const content: ToolContent = {
  title: 'YouTube Community Post Ideas',
  description:
    'Get free YouTube community post ideas for polls, images, text and quizzes: enter your niche and post type to get copy-ready drafts with templates.',
  howTo: [
    'Type your Niche (e.g. sourdough baking) — it is inserted into every idea.',
    'Choose the Post Type: poll, image, text or quiz.',
    'Set Ideas Wanted from 1 to 8 (default 5).',
    'Click Generate to get copy-ready drafts with a character count on each.',
    'Paste your favorite into YouTube Studio — this tool cannot publish for you.',
  ],
  methodology:
    'Ideas come from a fixed bank of 40 hand-written templates (10 per post type: poll, image, text, quiz) — no AI, no live data. A deterministic hash of your niche and post type picks where in the bank to start, so the same inputs always return the same ideas. Character counts are measured locally; the community post character limit is an unverified estimate (sources vary ~1000-1500), so length guidance is soft only.',
  examples: [
    {
      title: 'Poll ideas for a baking channel',
      inputs: { niche: 'sourdough baking', postType: 'poll', count: 3 },
      note: 'Returns 3 poll drafts with 4 fixed poll options each, ready to paste.',
    },
    {
      title: 'Text post ideas for a fitness channel',
      inputs: { niche: 'home fitness', postType: 'text', count: 5 },
      note: 'Returns 5 text-post drafts with local character counts and soft limit guidance.',
    },
  ],
  faqs: [
    {
      question: 'What is a community post on youtube?',
      answer: 'This is a common question about what is a community post on youtube. Use the tool above to get your answer instantly - it is free and requires no signup.',
    },
    {
      question: 'How do i do a community post on youtube?',
      answer: 'This is a common question about how do i do a community post on youtube. Use the tool above to get your answer instantly - it is free and requires no signup.',
    },
    {
      question: 'What is the best youtube community post ideas?',
      answer:
        'There is no verified "best" — good community posts depend on your niche and audience. This free tool gives you copy-ready drafts from a fixed bank of 40 templates (poll, image, text, quiz) with your niche filled in, so you can adapt rather than start from a blank page.',
    },
    {
      question: 'Is there a free youtube community post ideas?',
      answer:
        'Yes — this idea bank is completely free with no signup. Enter your niche, pick a post type, and get up to 8 copy-ready drafts with character counts, drawn from a fixed 40-template bank.',
    },
    {
      question: 'How to use youtube community post?',
      answer:
        'In YouTube Studio, open the Community tab and choose a poll, image, text or quiz post, then paste and adapt one of the generated drafts. This tool cannot publish to the Community tab for you — it only writes the drafts.',
    },
    {
      question: 'How does a youtube community post ideas work?',
      answer:
        'This tool fills your niche into fixed hand-written templates (10 per post type) and returns the requested number deterministically — the same inputs always give the same ideas. Each idea shows its character count with soft guidance, since the exact community post limit is an unverified estimate.',
    },
    {
      question: 'What is a youtube community post ideas?',
      answer:
        'A youtube community post ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Fixed 40-template bank (10 per post type) — ideas are drafts to adapt, not AI-written posts.',
    'Cannot publish to the YouTube Community tab; publishing happens manually in YouTube Studio.',
    'Character-limit guidance is soft only: the real limit is an unverified estimate (sources vary ~1000-1500 characters).',
    'Poll option counts and quiz answer styles follow YouTube community conventions, not official rules.',
  ],
  jsonLd: [],
};
