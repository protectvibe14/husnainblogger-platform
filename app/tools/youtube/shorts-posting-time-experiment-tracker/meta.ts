import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import { TRACKER_ITEMS } from './logic.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/shorts-posting-time-experiment-tracker/';

const DESCRIPTION =
  'Run a best time to post shorts tracker experiment — log views at 24h per slot and let the sample-size guard name a winner only on real data. Start free.';

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [];

export const trackerMode: 'checklist' = 'checklist';
export const trackerItems = TRACKER_ITEMS;

export const content: ToolContent = {
  title: 'Shorts Posting Time Tracker',
  description: DESCRIPTION,
  howTo: [
    'Work through the 12-step experiment checklist: set a 2–3 week test window and pick 3–4 posting slots.',
    'Post similar Shorts across all slots, rotating them evenly so each slot gets a fair sample.',
    'For every Short, log the exact posting datetime, views at exactly 24 hours, and average view duration.',
    'Keep logging until each slot has at least 5 Shorts — the guard refuses to name a winner on thinner data.',
    'Compare average views per slot (never totals). If no slot leads clearly, accept the "keep testing" verdict and run longer.',
  ],
  methodology:
    'Self-collected experiment data only — this tool cannot fetch your YouTube analytics (YouTube Studio data is not importable client-side without OAuth/API), so every number comes from entries you log manually: posting datetime, views at exactly 24 hours, and average view duration. Entries are grouped by posting hour; each slot reports its count, average views, and average view duration. A best slot is named only when it has at least 5 logged Shorts — highest average views wins, ties break by larger sample then earlier hour. Below the guard the verdict is always "keep testing", never a false winner. The 12-item checklist is a fixed experiment protocol (rotate slots, hold content type constant, read views at 24h).',
  faqs: [
    {
      question: 'What is the best best time to post shorts tracker?',
      answer:
        'The useful kind is an experiment tracker, not a guesser: you log each Short\u2019s posting time, views at 24 hours, and average view duration, then compare slots on equal samples. This free tracker adds a 12-step protocol and a sample-size guard so a slot is only named best with 5+ logged Shorts.',
    },
    {
      question: 'Is there a free best time to post shorts tracker?',
      answer:
        'Yes — this tracker is completely free with no signup. Work through the 12 experiment steps, log your Shorts manually, and your progress is saved in your browser. No analytics connection is required or possible.',
    },
    {
      question: 'How to track best time to post shorts?',
      answer:
        'Pick 3–4 posting slots, rotate similar Shorts across them for 2–3 weeks, and log each one\u2019s datetime, views at exactly 24 hours, and average view duration. Compare average views per slot — and only trust a slot with at least 5 Shorts behind it.',
    },
    {
      question: 'How does a best time to post shorts tracker work?',
      answer:
        'You log every Short manually: when you posted it, its views at exactly 24 hours, and its average view duration. The tracker groups entries by posting hour and averages the metrics per slot. A winner is declared only with 5+ Shorts per slot; otherwise you get an honest "keep testing" verdict. It never invents data — YouTube analytics cannot be fetched from the browser.',
    },
    {
      question: 'What is a best time to post shorts tracker?',
      answer:
        'A best time to post shorts tracker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'How do I use this shorts posting time tracker tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
    {
      question: 'Is this shorts posting time tracker tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
  ],
  assumptions: [
    'All metrics are manually logged by you — the tool cannot import YouTube Studio analytics, so results describe your logged sample, not your channel\u2019s true analytics.',
    'A slot is only named best with 5+ logged Shorts; comparing slots on fewer is noise, so the tool refuses rather than guessing.',
    'Fair comparisons need similar content across slots — changing niche, format, or quality mid-test invalidates the result.',
    'The best slot is seasonal: re-run the test when your audience mix, school terms, or holidays change.',
    'Progress is saved in your browser\u2019s localStorage only; clearing site data resets it.',
  ],
  jsonLd: [],
};
