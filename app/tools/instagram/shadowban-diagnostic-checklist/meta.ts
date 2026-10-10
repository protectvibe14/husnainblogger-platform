import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import { TRACKER_ITEMS } from './logic.ts';

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [];

export const trackerMode: 'checklist' | 'library' = 'checklist';

export const trackerItems = TRACKER_ITEMS;

const DESCRIPTION =
  'Run this free instagram shadowban test — a 14-point checklist for reach drops and hashtag visibility. It cannot detect a real shadowban; start the checklist.';

export const content: ToolContent = {
  title: 'Instagram Shadowban Test',
  description: DESCRIPTION,
  howTo: [
    'Work through the 14 warning-sign items: reach drops, hashtag visibility, engagement, and account flags.',
    'Check off every symptom that is true for your account right now — be honest, the band reflects your checks.',
    'Read your risk band: LOW (0–4), MODERATE (5–8), or HIGH (9–14 symptoms checked).',
    'Remember what this is: a self-assessment checklist. It cannot detect a real shadowban.',
    'Verify inside Instagram: check Insights for non-follower reach, review Account Status, and test hashtag visibility from a non-follower account.',
  ],
  methodology:
    'A fixed 14-item checklist of commonly reported shadowban warning signs in 4 groups (reach: 3, hashtag visibility: 3, engagement: 3, account flags: 5). The tracker counts your checked symptoms and maps the count to a fixed band: 0–4 = LOW, 5–8 = MODERATE, 9–14 = HIGH. Nothing is fetched from Instagram and no model scores anything — the band is a plain count, not a diagnosis.',
  faqs: [
    {
      question: 'What is the best instagram shadowban test?',
      answer:
        'No online test can detect a real shadowban — Instagram exposes no such status. The best approach is a structured self-assessment like this 14-point checklist, followed by verification inside Instagram Insights and Account Status.',
    },
    {
      question: 'Is there a free instagram shadowban test?',
      answer:
        'Yes — this 14-point checklist is free with no signup, and your progress is saved in your browser. It is a self-assessment aid only, not a detector; always confirm suspicions inside the Instagram app itself.',
    },
    {
      question: 'What does the 14-point checklist actually check?',
      answer:
        'Four symptom groups: sudden or sustained reach drops (including non-follower reach collapsing), posts missing from hashtag search, engagement anomalies, and account-level signals such as restrictions shown in Account Status. You tick the symptoms you observe and get an honest count-based risk band — low, moderate, or high — as a self-assessment aid, never a diagnosis.',
    },
    {
      question: 'Is a shadowban permanent?',
      answer:
        '\'Shadowban\' is not an official Instagram status — most reach drops are temporary and come from policy violations, spammy behavior (aggressive follow/unfollow, automation), or algorithm shifts. Check Account Status in the app for any formal restrictions, fix what it flags, stop anything bot-like, and reach usually recovers over days to weeks. This checklist helps you narrow down the likely cause.',
    },
    {
      question: 'What should I check first if reach suddenly drops?',
      answer:
        'Work the checklist in order: confirm the drop is real and sustained (not one flop), check whether non-follower reach collapsed in Insights, test whether your posts appear on a small hashtag page from a non-follower account, and open Account Status for restrictions. That sequence rules out the common causes — content flop, hashtag issue, or account restriction — before you change your strategy.',
    },
    {
      question: 'Does the checklist read my Instagram account?',
      answer:
        'No — it cannot. There is no Instagram connection, no login, and no data sent anywhere; it is a manual self-assessment you fill in yourself, with your progress saved only in your browser. For anything the checklist cannot see (Account Status, Insights reach data), it tells you exactly where to look in the app.',
    },
    {
      question: 'My risk band is high — what now?',
      answer:
        'A high band means many warning signs are checked, not a confirmed restriction. Next steps: open Account Status and appeal or fix anything flagged, remove recently violating content, avoid automation and mass actions, and post normally for one to two weeks while watching Insights. If nothing is flagged in Account Status, the cause is more likely a content or algorithm shift than a restriction — focus on hooks and retention, not on the band.',
    },
  ],
  assumptions: [
    'Self-assessment only: this checklist CANNOT detect an actual shadowban — there is no API access to Instagram reach data.',
    'The risk band is a fixed count of user-checked symptoms (0–4 LOW, 5–8 MODERATE, 9–14 HIGH), not a diagnosis.',
    'A "shadowban" is not an official Instagram status; sudden reach drops can also come from algorithm shifts or content changes.',
    'Verify everything inside Instagram: Insights, Account Status, and a hashtag search from a non-follower account.',
  ],
  jsonLd: [],
};
