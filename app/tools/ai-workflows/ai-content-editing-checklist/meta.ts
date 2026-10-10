import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import { TRACKER_ITEMS } from './logic.ts';

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [];

export const trackerMode: 'checklist' | 'library' = 'checklist';

export const trackerItems = TRACKER_ITEMS;

const DESCRIPTION =
  'Edit AI-written drafts with this free ai content editing checklist — humanize, fact-check, and polish articles, scripts, and emails. Start your checklist now.';

export const content: ToolContent = {
  title: 'AI Content Editing Checklist',
  description: DESCRIPTION,
  howTo: [
    'Open the checklist whenever you finish an AI-generated draft.',
    'Work through the 5 groups: humanize, verify, tone, structure, and polish.',
    'Check each item off only when you have honestly done it — the list never edits for you.',
    'Fix anything you cannot check off, then re-check it.',
    'Publish only when the progress bar reads 100%. Your progress is saved in your browser.',
  ],
  methodology:
    'A fixed, human-written list of 18 editing checks in 5 groups (humanize: 4, verify: 4, tone: 3, structure: 4, polish: 3). The tracker counts your checked items and shows your progress — nothing is generated, edited, or personalized.',
  faqs: [
    {
      question: 'What is the best ai content editing checklist?',
      answer:
        'The best ai content editing checklist starts by humanizing the draft, verifies every factual claim, matches tone to your brand, tightens the structure, and ends with a read-aloud polish pass. This free tool gives you that flow as an interactive 18-item checklist.',
    },
    {
      question: 'Is there a free ai content editing checklist?',
      answer:
        'Yes — this interactive editing checklist is free with no signup, and your progress is saved in your browser as you check items off.',
    },
    {
      question: 'How to use ai content editing?',
      answer:
        'Work the checklist top to bottom on every AI draft: add your real experience, verify each claim against a source, fix the tone, restructure for readability, then read it aloud before publishing.',
    },
    {
      question: 'How does an ai content editing checklist work?',
      answer:
        'It does not edit anything itself — it is a fixed 18-item list you work through manually. Checking items off tracks your progress toward a publish-ready draft.',
    },
    {
      question: 'What is an ai content editing checklist?',
      answer:
        'An ai content editing checklist is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'How do I use this ai content editing checklist tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
    {
      question: 'Is this ai content editing checklist tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
  ],
  assumptions: [
    'A fixed checklist of general guidance — it performs no editing and cannot look at your draft.',
    'Fact verification is on you: the checklist reminds you to check sources but cannot do it for you.',
  ],
  jsonLd: [],
};
