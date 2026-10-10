import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-comment-reply-idea-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'pastedComment',
    label: 'Comment to reply to',
    type: 'textarea',
    required: true,
    placeholder: 'Paste the TikTok comment here (up to 150 characters)',
    validation: { max: 150 },
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: false,
    options: ['funny', 'warm', 'witty', 'redirect-to-video'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'replies',
    label: 'Reply ideas',
    type: 'list',
    description:
    'Free tiktok comment reply ideas 2026: Eight reply ideas: two each in funny, warm, witty, and redirect-to-video flavors. Fast, private now.',
  },
  {
    id: 'toneFocus',
    label: 'Tone focus',
    type: 'text',
    description:
    'Which tone leads the list, or "neutral boundary" for hostile comments.',
  },
  {
    id: 'guidance',
    label: 'How to use the replies',
    type: 'text',
    description:
    'Honest usage note: templates only, never auto-posted.',
  },
];

export const content: ToolContent = {
  title: 'TikTok Comment Reply Ideas',
  description:
    'Get free tiktok comment reply ideas: paste any comment and get funny, warm, witty, and reply-with-video templates to choose from. Generate replies now.',
  howTo: [
    'Paste the TikTok "Comment to reply to" (up to 150 characters — the TikTok comment limit).',
    'Pick a "Tone" to lead with (optional): funny, warm, witty, or redirect-to-video.',
    'Run the tool to get 8 reply ideas — two per flavor, your chosen tone first.',
    'Copy the one that fits your voice and paste it as your reply in TikTok.',
    'For hostile comments the tool only suggests neutral boundary replies — never roast-backs.',
  ],
  methodology:
    'Replies are assembled from 30 fixed, hand-written reply frames (6 per flavor: funny, warm, witty, redirect-to-video, plus 6 neutral boundary frames) — no AI, no account access, no live comment data. Two frames per flavor are picked deterministically from your pasted comment, with at most its first 40 characters quoted; every reply is capped at 150 characters. A 10-marker abuse list routes hostile comments to boundary templates only.',
  examples: [
    {
      title: 'Funny tone on a compliment',
      inputs: { pastedComment: 'This tutorial saved me hours!', tone: 'funny' },
      note: 'Funny replies lead, followed by warm, witty, and redirect-to-video ideas.',
    },
    {
      title: 'Balanced tone on a question',
      inputs: { pastedComment: 'How long did this take to film?', tone: '' },
      note: 'Two ideas per flavor; redirect-to-video frames suggest answering on camera.',
    },
    {
      title: 'Hostile comment',
      inputs: { pastedComment: 'you are such an idiot', tone: 'witty' },
      note: 'Only neutral boundary replies are returned — no roast-backs.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok comment reply ideas?',
      answer:
        'The best replies match the comment’s energy: funny for jokes, warm for compliments, witty for banter, and a video reply for questions worth answering on camera. This free tool gives you two ideas per flavor so you can pick the one that fits.',
    },
    {
      question: 'Is there a free tiktok comment reply ideas?',
      answer:
        'Yes — this comment reply idea generator is completely free with no signup. Paste any comment up to 150 characters and get 8 template reply ideas across four tones, all kept within the TikTok comment limit.',
    },
    {
      question: 'How to use tiktok comment reply?',
      answer:
        'Paste the comment, optionally pick a tone, and copy your favorite idea into TikTok as your reply — the tool never posts for you. For hostile comments it only offers neutral boundary replies, and "redirect-to-video" ideas help turn good questions into new videos.',
    },
    {
      question: 'What is a tiktok comment reply ideas?',
      answer:
        'A tiktok comment reply ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the tiktok comment reply ideas?',
      answer:
        'No account needed. Open the tiktok comment reply ideas, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Reply ideas are assembled from 30 fixed template frames — templated, not AI-written. Adapt them to your voice before posting.',
    'The tool never posts replies and cannot access your TikTok account or live comments.',
    'Abuse detection is a simple 10-word keyword list, not a content-moderation system — it can miss subtle hostility.',
    'No engagement outcome is promised; the tool drafts reply ideas, not results.',
  ],
  jsonLd: [],
};
