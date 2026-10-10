import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import { TRACKER_ITEMS } from './logic.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/thumbnail-a-b-test-tracker/';

const DESCRIPTION =
  'Run fair thumbnail tests with this YouTube thumbnail A/B test tracker — log variants side by side, track CTR, and pick winners with real data.';

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [];

export const trackerMode: 'checklist' | 'library' = 'checklist';

export const trackerItems = TRACKER_ITEMS;

export const content: ToolContent = {
  title: 'Youtube Thumbnail Ab Test Tracker',
  description: DESCRIPTION,
  howTo: [
    'Name the video under test at the top of your log so every variant row refers to the same video.',
    'Log each thumbnail variant (A, B, or C) with a short description and the dates it ran.',
    'Copy impressions and clicks per variant from YouTube Studio into your manual log — the tool cannot fetch analytics.',
    'Validate the numbers: impressions ≥ clicks, no negatives, and at least 2 variants with data.',
    'Declare a winner only when every variant has ≥ 1,000 impressions; anything less is "inconclusive", never "A wins".',
  ],
  methodology:
    'A fixed 10-step checklist for manual A/B logging plus a pure comparison helper: CTR = clicks ÷ impressions × 100 per variant (2 decimals, 0 impressions → 0). A winner is declared only when every variant has at least 1,000 logged impressions — a documented rule of thumb, not a statistical significance test. Tied top CTRs are reported as a tie. The tool cannot pull YouTube Analytics data client-side (no API keys or OAuth), so all results are labeled manual tracking.',
  faqs: [
    {
      question: 'what is the best youtube thumbnail ab test tracker?',
      answer:
        'For real tested data, YouTube\'s own "Test & Compare" (it uploads three thumbnails and picks a winner) is the most reliable option. This free tracker is a manual companion: a 10-step log where you record variant impressions and clicks yourself, with a built-in rule that refuses to crown a winner below 1,000 impressions per variant.',
    },
    {
      question: 'is there a free youtube thumbnail ab test tracker?',
      answer:
        'Yes — this tracker is completely free with no signup. It is a manual log with a 1,000-impression-per-variant rule of thumb; it cannot import your YouTube Analytics data, so every result is labeled manual tracking.',
    },
    {
      question: 'how to track youtube thumbnail ab test?',
      answer:
        'Name the video, log each thumbnail variant with its run dates, then copy impressions and clicks per variant from YouTube Studio into your log. Compute CTR per variant (clicks ÷ impressions × 100) and only judge a winner once every variant has at least 1,000 impressions — otherwise the result is inconclusive.',
    },
    {
      question: 'how does a youtube thumbnail ab test tracker work?',
      answer:
        'This tracker walks you through a 10-step checklist: describe variants A/B (or C), record impressions and clicks from YouTube Studio, validate the numbers, and apply the winner rule. The helper computes CTR per variant and declares a winner only at full sample; below the sample rule the verdict is "inconclusive".',
    },
    {
      question: 'How does the youtube thumbnail ab test tracker work?',
      answer:
        'Enter your details using the inputs above and the youtube thumbnail ab test tracker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube thumbnail ab test tracker free to use?',
      answer:
        'Yes - this youtube thumbnail ab test tracker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube thumbnail ab test tracker?',
      answer:
        'A youtube thumbnail ab test tracker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Manual log only: the tool CANNOT pull YouTube Analytics data — no API keys or OAuth are used, so results describe your logged sample, not your channel analytics.',
    'The 1,000-impressions-per-variant rule is a documented rule of thumb, not a statistical significance test.',
    'YouTube\'s own "Test & Compare" uploads three thumbnails and is the reliable source of real test data; use the native test when possible.',
    'External factors (traffic sources, seasonality) are not controlled by this log — treat results as directional.',
  ],
  jsonLd: [],
};
