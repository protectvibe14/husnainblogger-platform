import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-account-audit-checklist/';

const SCALE_OPTIONS = ['0', '1', '2', '3', '4', '5'];

function criterion(id: string, label: string): ToolInput {
  return {
    id,
    label,
    type: 'select',
    required: true,
    options: SCALE_OPTIONS,
    placeholder: '0 = not true · 5 = fully true',
  };
}

export const inputs: ToolInput[] = [
  criterion('bio-who-help', 'Bio says who you help and what you post about'),
  criterion('bio-name-keyword', 'Display name contains a searchable keyword'),
  criterion('bio-link', 'Bio has one link and a clear next step'),
  criterion('bio-photo', 'Profile photo is clear and recognizable'),
  criterion('content-hook', 'Most videos hook in the first 2 seconds'),
  criterion('content-niche', 'Your last 9 videos fit one clear niche'),
  criterion('content-captions', 'You use on-screen text/captions on most videos'),
  criterion('content-quality', 'Videos are well-lit with clear audio'),
  criterion('consistency-posting', 'You posted at least 3 times in the last 7 days'),
  criterion('consistency-rhythm', 'You have a posting rhythm you can actually keep'),
  criterion('consistency-engage', 'You reply to comments within 24 hours'),
  criterion('consistency-analytics', 'You check TikTok analytics at least weekly'),
  criterion('engagement-comments', 'Your videos get real comments (not just emojis)'),
  criterion('engagement-saves', 'Viewers save or share your videos'),
  criterion('engagement-replies', 'You reply to most comments on your videos'),
  criterion('engagement-growth', 'Your followers grew in the last 30 days'),
];

export const outputs: ToolOutput[] = [
  {
    id: 'totalScore',
    label: 'Audit score',
    type: 'number',
    description:
    'Free tiktok account audit 2026: Overall score 0–100. A manual self-audit estimate, not TikTok analytics. Get instant results. free now.',
  },
  {
    id: 'grade',
    label: 'Grade',
    type: 'text',
    description:
    'Audit-Ready (85+), Solid (70–84), Needs work (50–69), or Rebuild (below 50).',
  },
  {
    id: 'sectionScores',
    label: 'Section scores',
    type: 'table',
    description:
    '0–100 per section: Bio & profile, Content quality, Consistency, Engagement.',
  },
  {
    id: 'gapList',
    label: 'Gap list',
    type: 'list',
    description:
    'Criteria you scored 0–2 on — your biggest gaps.',
  },
  {
    id: 'prioritizedFixes',
    label: 'Prioritized fixes',
    type: 'list',
    description:
    'What to fix first, ordered by lowest score then highest weight.',
  },
];

export const content: ToolContent = {
  title: 'TikTok Account Audit',
  description:
    'Run a tiktok account audit with a free self-scored checklist: 4 categories, 0–100 scores, gap list, and prioritized fixes on a published rubric.',
  howTo: [
    'Open your TikTok profile and analytics in another tab so you answer honestly.',
    'Rate each of the 16 checklist questions 0–5 (0 = not true, 5 = fully true) across Bio & profile, Content quality, Consistency, and Engagement.',
    'Run the tool to get your 0–100 score, grade, per-section breakdown, gap list, and prioritized fixes.',
    'Start at the top of "Prioritized fixes" — the list is ordered by lowest score first, then highest impact.',
    'Re-audit monthly to track improvement. Remember: this is a self-audit estimate, not TikTok analytics.',
  ],
  methodology:
    'This is a transparent, fully client-side rubric scorer — not an AI judge and not connected to TikTok: it cannot fetch your account; you answer 16 fixed questions on a 0–5 scale across four sections (Bio & profile, Content quality, Consistency, Engagement). Each criterion has a weight of 1 or 2 (total weight 24). Per section: score = round(sum(answer × weight) / sum(5 × weight) × 100). Overall score = round(mean of the four section scores). Bands: 85–100 Audit-Ready, 70–84 Solid, 50–69 Needs work, 0–49 Rebuild. Gaps are criteria scored 0–2; fixes are fixed, rule-based tips ordered by lowest score then highest weight — never generated.',
  examples: [
    {
      title: 'Strong account',
      inputs: Object.fromEntries(inputs.map((i) => [i.id, '5'])),
      note: 'Scores 100 — Audit-Ready, no gaps, no fixes needed.',
    },
    {
      title: 'New account',
      inputs: Object.fromEntries(inputs.map((i) => [i.id, i.id.startsWith('bio') ? '3' : '1'])),
      note: 'Low score with a gap list and prioritized fixes — start at the top.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok account audit?',
      answer:
        'The best audit is a transparent one: it shows exactly what it measures. This tiktok account audit scores 16 fixed criteria across your bio, content quality, consistency, and engagement with a published rubric — and tells you exactly which fix to make first.',
    },
    {
      question: 'Is there a free tiktok account audit?',
      answer:
        'Yes — this audit checklist is completely free with no signup. Answer 16 questions on a 0–5 scale and get a 0–100 score, a grade, a gap list, and prioritized fixes instantly.',
    },
    {
      question: 'How to use tiktok account?',
      answer:
        'Open your TikTok profile alongside the tool, rate each of the 16 questions honestly from 0 to 5, then run the audit. Work through the prioritized fixes from the top down and re-audit after each round of changes. The score is a self-audit estimate, not TikTok analytics.',
    },
    {
      question: 'How does the tiktok account audit work?',
      answer:
        'Enter your details using the inputs above and the tiktok account audit calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok account audit free to use?',
      answer:
        'Yes - this tiktok account audit is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok account audit?',
      answer:
        'A tiktok account audit is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the tiktok account audit?',
      answer:
        'No account needed. Open the tiktok account audit, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'A manual self-audit: the tool cannot fetch or read your real TikTok account — answers are your own judgment, so answer honestly.',
    'The score is a checklist-based estimate of account health, never a measure of real performance, reach, or follower growth.',
    'Timeliness criteria ("posted 3 times in 7 days", "followers grew in 30 days") rely on your memory of your own analytics, not live data.',
    'The rubric is fixed; TikTok features and best practices change over time.',
  ],
  jsonLd: [],
};
