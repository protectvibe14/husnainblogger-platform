import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. vegan baking, car detailing, study tips',
    validation: { max: 60 },
  },
  {
    id: 'sessionType',
    label: 'Session type',
    type: 'select',
    required: true,
    options: ['live', 'video-comments'],
  },
  {
    id: 'followerCount',
    label: 'Your follower count (optional)',
    type: 'number',
    required: false,
    validation: { min: 0 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'questionBank', label: 'Question bank (warm-up, rapid-fire, deep-dive)', type: 'list' },
  { id: 'runOfShow', label: 'Run-of-show by phase', type: 'table' },
  { id: 'callToAction', label: 'Closing call to action', type: 'text' },
  { id: 'eligibilityNote', label: 'LIVE eligibility note', type: 'text' },
];

const DESCRIPTION =
  'Get TikTok Q&A ideas for live or video comments — warm-up, rapid-fire, and deep-dive questions plus a timed run-of-show. Free. Build your kit now.';

export const content: ToolContent = {
  title: 'TikTok Q&A Ideas',
  description: DESCRIPTION,
  howTo: [
    'Type your niche — for example "vegan baking" — so every question is tailored to your audience.',
    'Choose a session type: "live" for a real-time Q&A stream, or "video-comments" to answer questions in comment replies and follow-up videos.',
    'Optional: enter your follower count to get a personalized TikTok LIVE eligibility note.',
    'Run the kit to get 14 ready-to-answer questions (warm-up, rapid-fire, deep-dive) plus a 4-phase run-of-show script.',
    'Copy the questions into your notes app and work through the phases in order during your session.',
  ],
  methodology:
    'The kit assembles 14 questions deterministically from fixed banks (10 warm-up, 10 rapid-fire, 8 deep-dive templates — 5, 6, and 3 picked per run using a hash of your niche and session type) and pairs them with fixed phase scripts for either a TikTok LIVE or a video-comments format. There is no AI and no TikTok access — it is a static template engine, and the eligibility note is a general banner, not an account check.',
  examples: [
    {
      title: 'Vegan baking LIVE Q&A',
      inputs: { niche: 'vegan baking', sessionType: 'live' },
      note: '14 audience questions plus a live run-of-show with chat-pinning prompts.',
    },
    {
      title: 'Car detailing comment answers',
      inputs: { niche: 'car detailing', sessionType: 'video-comments', followerCount: 300 },
      note: 'Questions structured for reply videos — no LIVE access needed at any follower count.',
    },
  ],
  faqs: [
    {
      question: 'what is the best tiktok q&a ideas?',
      answer:
        'The best TikTok Q&A sessions mix question types: warm-up questions to get the chat moving, rapid-fire rounds for pace, and deep-dive questions for substance. This free kit gives you 14 ready-to-answer questions across all three, plus a 4-phase run-of-show script for either a LIVE or video-comments format.',
    },
    {
      question: 'is there a free tiktok q&a ideas?',
      answer:
        'Yes — this Q&A session kit is completely free with no signup. It builds your question bank from fixed templates in your browser, so there is no usage limit.',
    },
    {
      question: 'how to use tiktok q a?',
      answer:
        'You can run a Q&A as a TikTok LIVE (ask-me-anything style, which generally needs around 1,000 followers — verify in the app) or as video comments (collect questions from your comments and answer them in reply videos). Enter your niche, pick a format, and use the generated run-of-show to structure the session.',
    },
    {
      question: 'how does a tiktok q&a ideas work?',
      answer:
        'Enter your niche and choose "live" or "video-comments". The tool deterministically picks 14 questions from fixed warm-up, rapid-fire, and deep-dive banks and arranges them into a 4-phase run-of-show (warm-up, rapid-fire, deep-dive, CTA) with scripts matched to your format. Same inputs always produce the same kit.',
    },
    {
      question: 'How does the tiktok q&a ideas work?',
      answer:
        'Enter your details using the inputs above and the tiktok q&a ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok q&a ideas free to use?',
      answer:
        'Yes - this tiktok q&a ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok q&a ideas?',
      answer:
        'A tiktok q&a ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'This is a static template kit — it cannot check your TikTok account, your followers, or your LIVE eligibility.',
    'TikTok LIVE typically requires around 1,000 followers, but eligibility rules change over time and vary by region; verify in the TikTok app.',
    'Question picks are template-based, not personalized by AI — customize them with your own voice before posting.',
    'Best questions come from your real comments; use the bank as a starting point, not a script you must follow.',
  ],
  jsonLd: [],
};
