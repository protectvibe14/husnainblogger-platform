import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import { TRACKER_ITEMS } from './logic.ts';

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [];

export const trackerMode: 'checklist' | 'library' = 'library';

export const trackerItems = TRACKER_ITEMS;

const DESCRIPTION =
  'Browse 48 free email subject line prompts — copy-paste AI prompt templates for newsletters, promos, welcome series, and abandoned carts. Try the pack now.';

export const content: ToolContent = {
  title: 'Email Subject Line Prompts',
  description: DESCRIPTION,
  howTo: [
    'Pick the email type you are writing: newsletter, promo, welcome, or abandoned cart.',
    'Find a prompt template that fits your email and click Copy.',
    'Fill in the [PLACEHOLDERS] (topic, audience, offer) with your details.',
    'Paste the finished prompt into your own AI tool to get subject lines.',
    'Mark prompts as tried to track which templates you use most.',
  ],
  methodology:
    'A fixed, human-written pack of 48 prompt templates across 4 email categories (12 each: newsletter, promo, welcome, abandoned cart). Nothing is generated at runtime — you copy a template and run it in your own AI tool.',
  faqs: [
    {
      question: 'What is the best email subject line prompts?',
      answer:
        'The best email subject line prompts name your email type, audience, and one constraint like length or tone. This free pack of 48 human-written prompt templates does exactly that for newsletters, promos, welcome emails, and abandoned carts.',
    },
    {
      question: 'Is there a free email subject line prompts?',
      answer:
        'Yes — all 48 prompt templates in this pack are free to browse and copy, no signup needed. You run them in your own AI tool.',
    },
    {
      question: 'How to use email subject line prompts?',
      answer:
        'Copy a template from the pack, fill in the placeholders (topic, audience, offer), paste it into your AI tool, then keep the subject lines that match your brand voice. Never use fake urgency or false discounts.',
    },
    {
      question: 'How does an email subject line prompts work?',
      answer:
        'A subject line prompt tells an AI tool what kind of email subject lines to write and what rules to follow. This page does not run any AI itself — it hands you ready-made, copy-paste prompt templates.',
    },
    {
      question: 'How does the email subject line prompts work?',
      answer:
        'Enter your details using the inputs above and the email subject line prompts calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the email subject line prompts free to use?',
      answer:
        'Yes - this email subject line prompts is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an email subject line prompts?',
      answer:
        'An email subject line prompts is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'A fixed pack of 48 human-written templates — nothing is generated, personalized, or AI-run at runtime.',
    'You need your own AI tool account to turn a template into subject lines.',
    'Email results depend on your list and offer — no prompt can guarantee open rates.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Email Subject Line Prompts 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-workflows/email-subject-line-prompt-pack/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free Email Subject Line Prompts 2026 – Free - no signup required.',
    },
    {
      '@type': 'WebPage',
      name: 'Email Subject Line Prompts 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-workflows/email-subject-line-prompt-pack/',
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
          name: 'Email Subject Line Prompt Pack',
          item: 'https://husnainblogger.com/tools/ai-workflows/email-subject-line-prompt-pack/',
        },
      ],
    },
  ],
};
