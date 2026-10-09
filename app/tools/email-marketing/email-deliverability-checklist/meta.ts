import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import { TRACKER_ITEMS } from './logic.ts';

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [];

export const trackerMode: 'checklist' = 'checklist';

export const trackerItems = TRACKER_ITEMS;

const DESCRIPTION =
  'Free email deliverability checklist 2026: get instant results in your browser. Instant, private, and mobile-friendly. No signup - try it free!';

export const content: ToolContent = {
  title: 'Email Deliverability Checklist',
  description: DESCRIPTION,
  howTo: [
    'Open the checklist before your next email send.',
    'Work through each item top to bottom, checking it off as you complete it.',
    'Fix anything you cannot honestly check off — especially authentication items.',
    'Watch the progress bar and finish all 18 checks before sending.',
    'Your progress is saved in your browser automatically.',
  ],
  methodology:
    'A fixed, human-written list of 18 deliverability checks covering authentication (SPF/DKIM/DMARC), spam-rate limits, list hygiene, and content. Items cite real, publicly documented platform rules — Gmail/Yahoo bulk-sender requirements, CAN-SPAM opt-out rules, GDPR consent rules — and every detail is labeled as guidance. The tracker counts your checked items and shows progress; nothing is generated, estimated, personalized, or tested.',
  faqs: [
    {
      question: 'What is the best email deliverability checklist?',
      answer:
        'The best one covers authentication, spam-rate limits, list hygiene, and content before every send. This free tool gives you exactly that as an interactive 18-item checklist with guidance from real platform rules — but remember it guides you, it does not test anything.',
    },
    {
      question: 'Is there a free email deliverability checklist?',
      answer:
        'Yes — this interactive 18-item checklist is free with no signup, and your progress is saved in your browser as you check items off.',
    },
    {
      question: 'How to use email deliverability?',
      answer:
        'Work through the 18 checks before each send: authenticate your domain, clean your list, and review your content. Check off each item honestly and only send when you reach 100%.',
    },
    {
      question: 'Does this checklist test my email deliverability?',
      answer:
        'No — plainly: it cannot test deliverability. There are no DNS lookups, no inbox-placement tests, and no live verification of any kind. It is guidance only; to verify authentication, check your DNS records and Google Postmaster Tools yourself.',
    },
    {
      question: 'How does the email deliverability checklist work?',
      answer:
        'Enter your details using the inputs above and the email deliverability checklist calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the email deliverability checklist free to use?',
      answer:
        'Yes - this email deliverability checklist is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an email deliverability checklist?',
      answer:
        'An email deliverability checklist is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Guidance checklist only — it cannot test deliverability, verify DNS records, or check inbox placement.',
    'Items cite general platform rules; your provider’s exact requirements may change — verify against Gmail/Yahoo sender guidelines.',
    'Progress is stored in your browser only; clearing site data resets it.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Email Deliverability Checklist 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/email-marketing/email-deliverability-checklist/',
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
          name: 'Email Marketing Tools',
          item: 'https://husnainblogger.com/tools/email-marketing/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Email Deliverability Checklist',
          item: 'https://husnainblogger.com/tools/email-marketing/email-deliverability-checklist/',
        },
      ],
    },
  ],
};
