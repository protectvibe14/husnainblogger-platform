import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-pinned-comment-idea-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'videoTopic',
    label: 'Video topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. meal prep, home workouts, study tips',
    validation: { max: 60 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'comments',
    label: 'Pinned comment ideas',
    type: 'list',
    description:
    'Free tiktok pinned comment ideas 2026: 8 comment ideas (2 each: question, call to action, link in bio, follow-up), every one. Fast, private.',
  },
  {
    id: 'copyAll',
    label: 'Copy all comments',
    type: 'copy',
    description:
    'All 8 comments as plain text — paste the one you like, then pin it in the TikTok app.',
  },
];

export const content: ToolContent = {
  title: 'TikTok Pinned Comment Ideas',
  description:
    'Drive replies with TikTok pinned comment ideas — questions and prompts that keep your comment section buzzing daily. Try it now!',
  howTo: [
    'Enter your "Video topic" (up to 60 characters).',
    'Run the tool to get 8 pinned comment ideas: 2 questions, 2 calls to action, 2 link-in-bio pointers, and 2 follow-ups.',
    'Pick the comment that fits your video and check the wording fits your voice.',
    'Use "Copy all comments" to grab the plain text, paste it as a comment on your video in the TikTok app, then pin it.',
  ],
  methodology:
    'This tool assembles comments from a fixed bank of 20 hand-written templates (5 per category: question, call to action, link in bio, follow-up), filling in your video topic. A deterministic hash of your topic rotates which 2 templates are picked per category — the same topic always returns the same 8 ideas. Every filled comment is kept within TikTok\'s 150-character comment limit. Nothing is AI-generated, and the tool never pins anything: pinning happens in the TikTok app.',
  examples: [
    {
      title: 'Pinned comments for a meal-prep video',
      inputs: { videoTopic: 'meal prep' },
      note: 'Returns 8 ideas, 2 per category, each within 150 characters.',
    },
    {
      title: 'Pinned comments for a study-tips video',
      inputs: { videoTopic: 'study tips' },
      note: 'A different topic rotates to a different set of templates.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok pinned comment ideas?',
      answer:
        'The best tiktok pinned comment ideas add value instead of just asking for engagement — a question that continues the topic, a free checklist offered in the replies, or a pointer to the full tutorial in your bio. This free generator gives you 8 such ideas per topic: 2 questions, 2 value-first CTAs, 2 link-in-bio pointers, and 2 follow-ups.',
    },
    {
      question: 'Is there a free tiktok pinned comment ideas?',
      answer:
        'Yes — this pinned comment idea generator is completely free with no signup. Enter any video topic and get 8 comment ideas, as many times as you like.',
    },
    {
      question: 'How to use tiktok pinned comment?',
      answer:
        'Copy one of the generated ideas, post it as a comment on your own TikTok video, then long-press the comment and tap "Pin comment" in the TikTok app. A pinned comment sits at the top of your comment section, so use it to ask a question, offer a freebie, or point viewers to the link in your bio.',
    },
    {
      question: 'What is a tiktok pinned comment ideas?',
      answer:
        'A tiktok pinned comment ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the tiktok pinned comment ideas?',
      answer:
        'No account needed. Open the tiktok pinned comment ideas, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'How do I create tiktok pinned comment ideas?',
      answer: 'Describe what you need in the input fields, then click generate. You can regenerate as many times as you like and copy the version that fits best.',
    },
    {
      question: 'Can I customize the generated tiktok pinned comment ideas?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
  ],
  assumptions: [
    'Ideas come from a fixed 20-template bank — the same topic always returns the same 8 ideas.',
    'This tool generates comment text only; it cannot pin comments — pinning happens in the TikTok app.',
    'CTAs are written value-first; adapt the wording to your voice before posting.',
  ],
  jsonLd: [],
};
