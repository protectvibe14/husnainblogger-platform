import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'brandGoal',
    label: 'What should the pinned post do?',
    type: 'select',
    required: true,
    options: ['offer', 'proof', 'announcement'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'pinnedTweets',
    label: 'Pinned post drafts',
    type: 'list',
    description: 'Free pinned tweet ideas 2026: 5 self-contained, CTA-led pinned post drafts for your goal — each within 280 weighted. Fast, private, no signup - try it now!',
  },
];

export const content: ToolContent = {
  title: 'Pinned Tweet Ideas',
  description:
    'Get pinned tweet ideas that convert: pick offer, proof, or announcement and receive 5 CTA-led drafts within X\'s 280-char limit. Free — try it now!',
  howTo: [
    'Choose what your pinned post should do: Promote an offer, Show proof / results, or Make an announcement.',
    'Click run to get 5 self-contained draft ideas for that goal.',
    'Pick the draft that fits your profile best.',
    'Replace the [BRACKETED] placeholders with your real offer, results, or announcement details.',
    'Post it on X, then pin it to the top of your profile.',
  ],
  methodology:
    'This tool is a template library, not AI: 5 hand-written drafts per goal (15 total), each CTA-led and self-contained so it works as a first impression with no thread or prior context. Square-bracket placeholders mark exactly what you must fill in — the tool never invents your offer, results, or prices. Every draft is verified against X\'s weighted character budget (URL = 23 chars, emoji/CJK = 2 chars) to fit the 280-character limit for free accounts, and the same goal always returns the same 5 drafts.',
  examples: [
    {
      title: 'Creator promoting a course',
      inputs: { brandGoal: 'offer' },
      note: 'Gets 5 offer-led drafts with link CTAs and placeholders for audience, benefits, and link.',
    },
    {
      title: 'Freelancer showing results',
      inputs: { brandGoal: 'proof' },
      note: 'Gets 5 proof-led drafts with slots for testimonials, results, and before/after stories.',
    },
    {
      title: 'Founder announcing a launch',
      inputs: { brandGoal: 'announcement' },
      note: 'Gets 5 announcement drafts with slots for the news, key points, and next steps.',
    },
  ],
  faqs: [
    {
      question: 'What is the best pinned tweet ideas?',
      answer:
        'The best pinned tweet matches your current goal: an offer post for sales, a proof post for trust, or an announcement for news. This tool gives you 5 drafts per goal — pick one, fill in your real details, and pin it.',
    },
    {
      question: 'Is there a free pinned tweet ideas?',
      answer:
        'Yes — this Pinned Tweet Ideas tool is completely free with no signup. Choose your goal and get 5 ready-to-customize drafts instantly.',
    },
    {
      question: 'How to use pinned tweet?',
      answer:
        'Post the tweet on X, open it, tap the share icon, and choose "Pin to your profile". Your pinned post is the first thing visitors see, so keep it self-contained with a clear call to action — exactly what these drafts are built for.',
    },
    {
      question: 'Do the drafts include my actual offer and results?',
      answer:
        'No — and that is deliberate. The drafts use [BRACKETED] placeholders for your offer, results, links, and prices because the tool cannot know your business. Fill them in with your real details before posting; never post placeholder text.',
    },
    {
      question: 'How does the pinned tweet ideas work?',
      answer:
        'Enter your details using the inputs above and the pinned tweet ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the pinned tweet ideas free to use?',
      answer:
        'Yes - this pinned tweet ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a pinned tweet ideas?',
      answer:
        'A pinned tweet ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Drafts are templates with placeholders — you supply the real offer, results, and links.',
    'All drafts target the 280-character limit for free X accounts; Premium’s 25,000-char limit is not used.',
    'Weighted character counting (URL = 23, emoji/CJK = 2) is an approximation of X’s proprietary counting.',
    'Same goal always returns the same 5 drafts; variety comes from picking a different goal.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Pinned Tweet Ideas 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/pinterest-social/x-pinned-tweet-idea-generator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free pinned tweet ideas 2026: 5 self-contained, CTA-led pinned post drafts for your goal — each within 280 weighted. Fast, private, no signup - try it now!',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Pinterest, X & Facebook',
          item: 'https://husnainblogger.com/tools/pinterest-social/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'X Pinned Tweet Idea Generator',
          item: 'https://husnainblogger.com/tools/pinterest-social/x-pinned-tweet-idea-generator/',
        },
      ],
    },
  ],
};
