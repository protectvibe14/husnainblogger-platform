import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-series-episode-planner/';

export const inputs: ToolInput[] = [
  {
    id: 'seriesTitle',
    label: 'Series title',
    type: 'text',
    required: true,
    placeholder: 'e.g. 30 Days of Sourdough',
    validation: { max: 120 },
  },
  {
    id: 'niche',
    label: 'Niche (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. baking, fitness, finance',
    validation: { max: 60 },
  },
  {
    id: 'episodeCount',
    label: 'Number of episodes',
    type: 'number',
    required: true,
    placeholder: 'e.g. 8',
    validation: { min: 1, max: 50 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'episodes',
    label: 'Episode plan',
    type: 'list',
    description: 'Free tiktok series planner 2026: Per-episode hook, beats, and CTA in posting order. Instant, private, and mobile-friendly. No signup - try it free!',
  },
  {
    id: 'arcSummary',
    label: 'Arc summary',
    type: 'text',
    description: 'The series arc structure and the long-form eligibility note.',
  },
  {
    id: 'postingOrder',
    label: 'Posting order',
    type: 'text',
    description: 'How to post the episodes: order, cadence, and caption numbering.',
  },
];

export const content: ToolContent = {
  title: 'TikTok Series Planner 2026 – Free Tool | HusnainBlogger',
  description:
    'Plan a free tiktok series planner: name your series and get an episode-by-episode plan with hooks, beats, recaps, and CTAs. Plan your series now!',
  howTo: [
    'Enter your "Series title" (up to 120 characters).',
    'Add your "Niche" (optional) so hooks and beats name your topic.',
    'Set the "Number of episodes" between 1 and 50.',
    'Run the tool to get the full episode plan with hooks, beats, and CTAs in posting order.',
    'Post in order, one episode per day, and pin episode 1 as the series entry point.',
  ],
  methodology:
    'The plan is assembled from 44 fixed, hand-written frames (10 episode hooks, 6 setups, 10 value beats, 1 fixed "Previously on" recap frame, 6 twists, 4 payoffs, 6 CTAs, 1 closing CTA) — no AI and no platform data. Fixed arc rules assign each episode a kind: opener, value, every-5th recap, pre-finale twist, finale (a single episode becomes standalone). Picks are deterministic: the same title and niche always produce the same plan.',
  examples: [
    {
      title: '8-episode baking series',
      inputs: { seriesTitle: '30 Days of Sourdough', niche: 'baking', episodeCount: 8 },
      note: 'Opener, value episodes, a recap at episode 5, a twist at 7, and a finale.',
    },
    {
      title: '3-episode mini series',
      inputs: { seriesTitle: 'Fixer Upper', niche: 'DIY', episodeCount: 3 },
      note: 'Opener, twist, finale — compact arc with no recap episodes.',
    },
    {
      title: 'Single episode',
      inputs: { seriesTitle: 'One-Off Tutorial', niche: '', episodeCount: 1 },
      note: 'One standalone episode with setup and payoff.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok series planner?',
      answer:
        'The best planner gives every episode a job: episode 1 hooks the promise, middle episodes deliver value, every 5th recaps for new viewers, the second-to-last twists, and the last pays off. This free tool builds exactly that arc from your title and episode count.',
    },
    {
      question: 'Is there a free tiktok series planner?',
      answer:
        'Yes — this TikTok series episode planner is completely free with no signup. Name your series, set 1–50 episodes, and get a per-episode plan with hooks, beats, CTAs, and a posting order.',
    },
    {
      question: 'How to plan tiktok series?',
      answer:
        'Name the series, decide the episode count (1–50), and plan the arc before filming: hook the promise in episode 1, deliver one lesson per episode, recap every 5th episode, twist before the finale, and close with a follow CTA. This tool generates that full plan for you.',
    },
    {
      question: 'How does the tiktok series planner work?',
      answer:
        'Enter your details using the inputs above and the tiktok series planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok series planner free to use?',
      answer:
        'Yes - this tiktok series planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok series planner?',
      answer:
        'A tiktok series planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the tiktok series planner?',
      answer:
        'No account needed. Open the tiktok series planner, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Plans are assembled from 44 fixed template frames — templated, not AI-written. Rewrite lines in your voice before filming.',
    'Long-form note: plan each episode in 600-second-or-shorter sections; 60-minute uploads need special account eligibility — check the TikTok app.',
    'No performance outcome is promised; the tool plans episode structure, not reach.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'TikTok Series Planner 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free tiktok series planner 2026: Per-episode hook, beats, and CTA in posting order. Instant, private, and mobile-friendly. No signup - try it free!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'TikTok Tools',
          item: 'https://husnainblogger.com/tools/tiktok/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'TikTok Series Episode Planner',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
