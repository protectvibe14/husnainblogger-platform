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
  title: 'Instagram Shadowban Test 2026 – Free Tool | HusnainBlogger',
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
      question: 'How does the instagram shadowban test work?',
      answer:
        'Enter your details using the inputs above and the instagram shadowban test calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the instagram shadowban test free to use?',
      answer:
        'Yes - this instagram shadowban test is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an instagram shadowban test?',
      answer:
        'An instagram shadowban test is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the instagram shadowban test?',
      answer:
        'No account needed. Open the instagram shadowban test, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
    {
      question: 'How accurate is the instagram shadowban test?',
      answer:
        'The instagram shadowban test uses transparent arithmetic on the values you enter - what you see is exactly what the math produces. Always double-check critical numbers against official sources, as rates and rules can change.',
    },
  ],
  assumptions: [
    'Self-assessment only: this checklist CANNOT detect an actual shadowban — there is no API access to Instagram reach data.',
    'The risk band is a fixed count of user-checked symptoms (0–4 LOW, 5–8 MODERATE, 9–14 HIGH), not a diagnosis.',
    'A "shadowban" is not an official Instagram status; sudden reach drops can also come from algorithm shifts or content changes.',
    'Verify everything inside Instagram: Insights, Account Status, and a hashtag search from a non-follower account.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Instagram Shadowban Test 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/instagram/shadowban-diagnostic-checklist/',
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
          name: 'Instagram Tools',
          item: 'https://husnainblogger.com/tools/instagram/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Instagram Shadowban Test',
          item: 'https://husnainblogger.com/tools/instagram/shadowban-diagnostic-checklist/',
        },
      ],
    },
  ],
};
