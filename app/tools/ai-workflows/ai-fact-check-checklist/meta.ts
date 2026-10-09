import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import { TRACKER_ITEMS } from './logic.ts';

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [];

export const trackerMode: 'checklist' | 'library' = 'checklist';

export const trackerItems = TRACKER_ITEMS;

const DESCRIPTION =
  'Fact check ai content the honest way — a free 16-step verification workflow to confirm statistics, sources, quotes, and claims. Verify your draft now.';

export const content: ToolContent = {
  title: 'Fact Check AI Content',
  description: DESCRIPTION,
  howTo: [
    'Open the checklist with your AI-generated draft beside you.',
    'Work the inventory group first: list every factual claim the draft makes.',
    'Verify numbers, open every source, and confirm each quote and name yourself.',
    'Finish with the publish gate: cut or label anything you could not verify.',
    'Your progress is saved in your browser — publish only at 100%.',
  ],
  methodology:
    'A fixed, human-written list of 16 verification steps in 5 groups (inventory: 4, numbers: 3, sources: 3, media: 3, publish gate: 3). The tracker counts your completed steps and shows progress — it does not verify anything itself; verification is manual work you do.',
  faqs: [
    {
      question: 'What is the best fact check ai content?',
      answer:
        'The best fact check ai content workflow is manual: list every claim, verify each statistic and date against a real source, open every citation, confirm quotes, and cut what you cannot verify. This free tool gives you that workflow as an interactive 16-step checklist.',
    },
    {
      question: 'Is there a free fact check ai content?',
      answer:
        'Yes — this interactive verification checklist is free with no signup. It walks you through the steps; the actual checking is done by you.',
    },
    {
      question: 'How to use fact check ai content?',
      answer:
        'Inventory the claims in your draft, verify numbers and dates against primary sources, open every link, confirm quotes and names, then use the publish gate to cut or label anything unverifiable.',
    },
    {
      question: 'How does a fact check ai content work?',
      answer:
        'It does not check facts automatically — no client-side page can. This tool is a fixed 16-step checklist that organizes the manual verification work so no claim slips through.',
    },
    {
      question: 'How does the fact check ai content work?',
      answer:
        'Enter your details using the inputs above and the fact check ai content calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the fact check ai content free to use?',
      answer:
        'Yes - this fact check ai content is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a fact check ai content?',
      answer:
        'A fact check ai content is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'A checklist of verification STEPS only — it does not verify facts, contact sources, or detect hallucinations automatically.',
    'Verification quality depends on your own source checking; start with the highest-risk claims.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Fact Check AI Content 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-workflows/ai-fact-check-checklist/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: DESCRIPTION,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'AI Workflow Tools',
          item: 'https://husnainblogger.com/tools/ai-workflows/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'AI Fact-Check Checklist',
          item: 'https://husnainblogger.com/tools/ai-workflows/ai-fact-check-checklist/',
        },
      ],
    },
  ],
};
