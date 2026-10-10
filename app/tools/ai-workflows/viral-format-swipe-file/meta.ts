import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import { TRACKER_ITEMS } from './logic.ts';

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [];

export const trackerMode: 'checklist' | 'library' = 'library';

export const trackerItems = TRACKER_ITEMS;

const DESCRIPTION =
  'Browse 48 free viral content formats — hook, story, list, tutorial, and UGC format cards with structure breakdowns and copy-paste prompts. Open the swipe file.';

export const content: ToolContent = {
  title: 'Viral Content Formats',
  description: DESCRIPTION,
  howTo: [
    'Browse the 8 format categories: hooks, storytelling, listicles, comparisons, tutorials, behind-the-scenes, UGC, and repurposing.',
    'Open a format card to read its structure breakdown.',
    'Copy the example prompt template and fill in the [PLACEHOLDERS] with your topic.',
    'Paste the finished prompt into your own AI tool, then rewrite the output in your voice.',
    'Mark formats as used to track which patterns you have tried.',
  ],
  methodology:
    'A fixed, human-written reference of 48 content format cards across 8 categories (6 each). Each card breaks down the format\'s structure and includes a copyable example prompt. Nothing is generated or scored at runtime, and the file makes no virality predictions — formats are patterns, not promises.',
  faqs: [
    {
      question: 'What is the best viral content formats?',
      answer:
        'There is no guaranteed-viral format — the best formats are proven patterns like strong hooks, failure-to-lesson stories, and step-by-step tutorials, adapted to your topic and audience. This free swipe file gives you 48 such patterns with structure breakdowns.',
    },
    {
      question: 'Is there a free viral content formats?',
      answer:
        'Yes — all 48 format cards in this swipe file are free to browse and copy, no signup needed. You run the example prompts in your own AI tool.',
    },
    {
      question: 'How to use viral content formats?',
      answer:
        'Pick a format card, study its structure, copy the example prompt, fill in your topic, generate a draft, then rewrite it in your own voice with real specifics. No format works without genuine substance behind it.',
    },
    {
      question: 'How does a viral content formats work?',
      answer:
        'A format is a reusable structure — hook, story arc, list, comparison — that you fill with your own content. This page is a fixed reference library, not a prediction tool: it shows you the pattern, you supply the substance.',
    },
    {
      question: 'What is a viral content formats?',
      answer:
        'A viral content formats is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Is this viral content formats tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
    {
      question: 'How do I use this viral content formats tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
  ],
  assumptions: [
    'A fixed reference of 48 human-written format cards — it does not predict virality, reach, or engagement.',
    'Example prompts must be run in your own AI tool and rewritten with real, verified specifics.',
  ],
  jsonLd: [
    {
      '@type': 'WebPage',
      name: 'Viral Content Formats 2026',
      url: 'https://husnainblogger.com/tools/ai-workflows/viral-format-swipe-file/',
      description: DESCRIPTION,
    },
  ],
};
