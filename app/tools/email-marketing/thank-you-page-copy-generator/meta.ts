import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/email-marketing/thank-you-page-copy-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'completedAction',
    label: 'Completed action',
    type: 'text',
    required: true,
    placeholder: 'e.g. newsletter signup',
  },
  {
    id: 'nextStep',
    label: 'Next step',
    type: 'text',
    required: true,
    placeholder: 'e.g. confirm your email',
  },
  {
    id: 'brand',
    label: 'Brand',
    type: 'text',
    required: true,
    placeholder: 'e.g. Acme Blog',
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['friendly', 'professional', 'playful', 'warm'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'headlines',
    label: 'Headline options',
    type: 'list',
    description:
    'Free thank you page copy generator 2026: 3 thank-you page headline options assembled from fixed templates. Fast, private now.',
  },
  {
    id: 'body',
    label: 'Body draft',
    type: 'copy',
    description:
    'A short body paragraph: a tone-matched opening line plus one templated confirmation paragraph naming the action, brand, and next step.',
  },
  {
    id: 'nextCta',
    label: 'Next-step CTA',
    type: 'copy',
    description:
    'A single call-to-action line pointing the reader at the next step.',
  },
  {
    id: 'notices',
    label: 'Notices',
    type: 'list',
    description:
    'Notices about input adjustments such as truncation.',
  },
];

export const content: ToolContent = {
  title: 'Thank You Page Copy Generator',
  description:
    'Make the thank-you page work harder: enter the completed action and the next step you want for headlines, body copy, and a CTA in your tone. Get started!',
  howTo: [
    'Enter the completed action (e.g. newsletter signup) — what the visitor just did.',
    'Enter the next step you want them to take (e.g. confirm your email).',
    'Enter your brand name and pick a tone: friendly, professional, playful, or warm.',
    'Run the tool to get 3 headline options, a body draft, and a next-step call-to-action.',
    'Paste the winners into your thank-you page and link the CTA to the next step.',
  ],
  methodology:
    'Copy is assembled from fixed banks (16 headline patterns, 8 body paragraphs, 8 next-step CTAs, and 4 tone opening lines) filled with your inputs — no AI, no guessing. Selection is a deterministic hash of your inputs, so the same inputs always produce the same draft. Nothing here measures or predicts conversion.',
  examples: [
    {
      title: 'Warm copy for a newsletter signup',
      inputs: {
        completedAction: 'newsletter signup',
        nextStep: 'confirm your email',
        brand: 'Acme Blog',
        tone: 'warm',
      },
      note: 'Headlines, body, and CTA in a warm tone for a signup confirmation.',
    },
    {
      title: 'Professional copy for a purchase',
      inputs: {
        completedAction: 'course purchase',
        nextStep: 'log in to your dashboard',
        brand: 'Acme Academy',
        tone: 'professional',
      },
      note: 'Professional-tone thank-you copy for a paid order.',
    },
  ],
  faqs: [
    {
      question: 'What is the best thank you page copy generator?',
      answer:
        'The best one confirms the action, sets expectations, and points at one clear next step. This free generator does exactly that from 36 fixed copy templates, matched to your tone — every line is assembled from templates, nothing is written by AI.',
    },
    {
      question: 'Is there a free thank you page copy generator?',
      answer:
        'Yes — this thank you page copy generator is completely free with no signup. Each run gives you 3 headline options, a body draft, and a next-step call-to-action.',
    },
    {
      question: 'How to generate thank you?',
      answer:
        'Confirm what just happened, tell the visitor what happens next, and give them one clear action. Enter the completed action, next step, brand, and tone into this tool, then place the winning copy on your confirmation page.',
    },
    {
      question: 'How does a thank you page copy generator work?',
      answer:
        'It fills fixed copy patterns with your completed action, next step, and brand, prefixes the body with an opening line matched to your tone, and deterministically picks the set from your inputs. The output is assembled from a bundled template library, with no network calls or AI.',
    },
    {
      question: 'What is a thank you page copy generator?',
      answer:
        'A thank you page copy generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Copy is template-based and generic — it knows nothing about your brand, audience, or data, and makes no performance claims.',
    '36 total patterns (16 headlines, 8 body paragraphs, 8 CTAs, 4 tone intros); drafts may feel formulaic by design.',
    'Template copy is a starting point — always proofread and adapt it to your brand voice before publishing.',
  ],
  jsonLd: [],
};
