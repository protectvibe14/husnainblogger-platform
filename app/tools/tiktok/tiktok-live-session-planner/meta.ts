import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'liveTopic',
    label: 'LIVE topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. beginner budgeting, skincare routine, guitar practice',
    validation: { max: 80 },
  },
  {
    id: 'niche',
    label: 'Your niche (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. personal finance',
    validation: { max: 60 },
  },
  {
    id: 'durationMin',
    label: 'Planned duration (minutes)',
    type: 'number',
    required: true,
    validation: { min: 5, max: 240 },
  },
  {
    id: 'sessionMode',
    label: 'Session mode',
    type: 'select',
    required: true,
    options: ['solo', 'co-host'],
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
  { id: 'runOfShow', label: 'Timed run-of-show', type: 'table' },
  { id: 'engagementPrompts', label: 'Engagement prompts', type: 'list' },
  { id: 'giftGoalMoments', label: 'Gift-goal moments (sample numbers)', type: 'list' },
  { id: 'closingCta', label: 'Closing call to action', type: 'text' },
  { id: 'eligibilityNote', label: 'LIVE eligibility note', type: 'text' },
];

const DESCRIPTION =
  'Go live with purpose using this TikTok live ideas planner — formats, talking points, and engagement hooks for every session. Plan segments that retain.';

export const content: ToolContent = {
  title: 'TikTok Live Session Planner',
  description: DESCRIPTION,
  howTo: [
    'Type your LIVE topic — for example "beginner budgeting" — and optionally your niche.',
    'Enter your planned duration in minutes (5 to 240; TikTok LIVE supports multi-hour broadcasts).',
    'Choose solo or co-host mode — co-host mode adds a guest-introduction segment to the plan.',
    'Optional: enter your follower count to get a personalized LIVE eligibility note.',
    'Run the planner and follow the timed run-of-show table, dropping the engagement prompts into chat at the marked moments.',
  ],
  methodology:
    'The planner builds a run-of-show from fixed segment templates (cold open, welcome, up to 6 main content blocks, a gift-goal push for 30+ minute sessions, Q&A, and close) and distributes your minutes proportionally across them so the times always sum exactly to your duration. Engagement prompts (4 of 8) are picked deterministically from a fixed bank. There is no AI and no TikTok access — it is a static template engine, and the eligibility note is a general banner, not an account check.',
  examples: [
    {
      title: '60-minute solo finance LIVE',
      inputs: { liveTopic: 'beginner budgeting', durationMin: 60, sessionMode: 'solo' },
      note: 'A full timed plan with 4 main content blocks, a gift-goal push, and a closing CTA.',
    },
    {
      title: '30-minute co-host stream',
      inputs: { liveTopic: 'skincare routine', durationMin: 30, sessionMode: 'co-host', niche: 'skincare' },
      note: 'Adds the co-host introduction segment and adjusts block timing to 30 minutes.',
    },
    {
      title: 'Short 15-minute LIVE',
      inputs: { liveTopic: 'guitar warm-ups', durationMin: 15, sessionMode: 'solo', followerCount: 800 },
      note: 'Compact plan for a short session, plus the below-1,000-followers eligibility heads-up.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok live ideas?',
      answer:
        'The best LIVE sessions mix formats: a live demo, a deep dive, Q&A breaks, and a rapid-fire tips segment. This free planner turns your topic and duration into a timed run-of-show with engagement prompts and gift-goal moments so you never run out of things to do on air.',
    },
    {
      question: 'Is there a free tiktok live ideas?',
      answer:
        'Yes — this LIVE session planner is completely free with no signup. It builds the run-of-show from fixed templates in your browser, so there is no usage limit.',
    },
    {
      question: 'How to use tiktok live?',
      answer:
        'You generally need at least 1,000 followers to access TikTok LIVE (verify in the TikTok app, as rules change). Then tap the + button, swipe to LIVE, add a title, and start. Use this planner first to map out what happens in each segment of your broadcast.',
    },
    {
      question: 'How does the tiktok live ideas work?',
      answer:
        'Enter your details using the inputs above and the tiktok live ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok live ideas free to use?',
      answer:
        'Yes - this tiktok live ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok live ideas?',
      answer:
        'A tiktok live ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the tiktok live ideas?',
      answer:
        'No account needed. Open the tiktok live ideas, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'This is a static template planner — it cannot check your TikTok account, your follower count, or whether you are eligible to go live.',
    'TikTok LIVE typically requires at least 1,000 followers, but eligibility rules change over time and vary by region; always verify in the TikTok app.',
    'Gift-goal numbers are illustrative samples scaled to your duration — set your own targets based on your audience.',
    'Segment timing is a starting plan; real LIVEs run long or short, so treat the table as a guide, not a script.',
  ],
  jsonLd: [
  ],
};
