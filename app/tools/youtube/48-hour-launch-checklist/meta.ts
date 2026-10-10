import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import { TRACKER_ITEMS } from './logic.ts';

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [];

export const trackerMode: 'checklist' = 'checklist';

export const trackerItems = TRACKER_ITEMS;

const DESCRIPTION =
  'Launch every video right with this YouTube video launch checklist — 48 hours of promotion tasks, from premiere setup to community posts and shorts.';

export const content: ToolContent = {
  title: 'YouTube Video Launch Checklist',
  description: DESCRIPTION,
  howTo: [
    'Set your publish datetime in YouTube Studio first — every T-48h … T+48h step anchors to it.',
    'Open this checklist and work the phases in order: prep (T-48h), buzz (T-24h), QA (T-2h), launch (T+0), amplification (T+24h), review (T+48h).',
    'Check off each step as you finish it — your progress is saved in your browser automatically.',
    'Only publish when the pre-launch phases are done; do not skip the T-2h processing check.',
    'At T+48h, review the analytics step and write down one lesson for the next launch.',
  ],
  methodology:
    'A fixed, human-written list of 18 launch steps grouped into 7 timed phases (T-48h preparation, T-24h buzz, T-2h QA, T+0 launch, T+24h amplification, T+48h review). The tracker counts your checked items and shows your progress — nothing is generated, estimated, or personalized, and the checklist never posts or automates anything on your behalf.',
  faqs: [
    {
      question: 'What is the best YouTube video launch checklist?',
      answer:
        'The best YouTube video launch checklist covers the full timeline, not just the upload: title and thumbnail prep at T-48h, teaser and promo at T-24h, processing checks at T-2h, pinned comments at T+0, and analytics review at T+48h. This free tool gives you exactly that as an interactive 18-step list.',
    },
    {
      question: 'Is there a free YouTube video launch checklist?',
      answer:
        'Yes — this interactive checklist is free with no signup, and your progress is saved in your browser as you check items off.',
    },
    {
      question: 'How to use YouTube video launch?',
      answer:
        'Set your publish datetime in YouTube Studio, then anchor each phase to it: start the T-48h prep items two days out, and do not publish until the T-2h QA checks are green. The checklist tracks your progress automatically.',
    },
    {
      question: 'How does a YouTube video launch checklist work?',
      answer:
        'You tick off each fixed checklist step as you complete it; the tool tracks your progress and saves it in your browser\'s local storage. The 18 steps never change — only your checked state does.',
    },
    {
      question: 'How does the youtube video launch checklist work?',
      answer:
        'Enter your details using the inputs above and the youtube video launch checklist calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube video launch checklist free to use?',
      answer:
        'Yes - this youtube video launch checklist is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube video launch checklist?',
      answer:
        'A youtube video launch checklist is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'A fixed, general-purpose list — it is not tailored to your niche, channel size, or content format.',
    'The checklist is advisory only; it does not post, schedule, or automate anything on YouTube.',
    'Timing assumes you set a real publish datetime in YouTube Studio to anchor the T-phases.',
    'Progress is stored in your browser only; clearing site data resets it.',
  ],
  jsonLd: [],
};
