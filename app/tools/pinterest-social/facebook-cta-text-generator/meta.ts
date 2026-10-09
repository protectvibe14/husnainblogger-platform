import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/facebook-cta-text-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'goal',
    label: 'Your goal',
    type: 'text',
    required: true,
    placeholder: 'e.g. shop now, book a call, learn more, join my list',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'ctaPhrases',
    label: 'CTA phrases',
    type: 'list',
    description:
    'Free facebook cta examples 2026: 6 short, verb-led in-post call-to-action phrases for your goal. Get instant results. free now.',
  },
  {
    id: 'platformNote',
    label: 'Page button note',
    type: 'text',
    description:
    'Why this writes in-post CTA text, not your Page CTA button.',
  },
];

export const content: ToolContent = {
  title: 'Facebook CTA Examples',
  description:
    'End your posts with CTAs that actually get clicks: enter your goal to get 6 short, verb-led call-to-action phrases matched to your captions.',
  howTo: [
    'Type Your goal into the field (e.g. shop now, book a call, learn more).',
    'Click run to get 6 short, verb-led CTA phrases matched to your goal.',
    'Pick one and paste it at the end of your post caption as the call to action.',
    'Read the Page button note — this writes in-post text, not your Page CTA button.',
    'A/B test two phrases across posts and keep the one that gets more clicks.',
  ],
  methodology:
    'This tool matches your goal to one of 7 families (shop, book, learn, join, download, contact, general) by keyword and returns that family\'s 6 fixed hand-written phrases — 42 phrases total, all verb-led and 60 characters or fewer. No AI is involved; output is deterministic template assembly. A fixed platform note clarifies that Facebook Page CTA buttons are a fixed Facebook list this tool cannot change.',
  examples: [
    {
      title: 'CTA for an online store',
      inputs: { goal: 'shop now' },
      note: 'Returns 6 shop-family phrases like "Shop the collection now".',
    },
    {
      title: 'CTA for a service business',
      inputs: { goal: 'book a free call' },
      note: 'Returns 6 book-family phrases like "Book your free consult".',
    },
    {
      title: 'CTA for a newsletter',
      inputs: { goal: 'join my newsletter' },
      note: 'Returns 6 join-family phrases like "Subscribe for weekly tips".',
    },
  ],
  faqs: [
    {
      question: 'What is the best facebook cta examples?',
      answer:
        'There is no verified "best" — the best CTA is short, verb-led, and matched to one goal per post. This free generator gives you 6 such phrases per goal from a fixed 42-phrase bank, plus a note explaining this is in-post CTA text, not your Page CTA button.',
    },
    {
      question: 'Is there a free facebook cta examples?',
      answer:
        'Yes — this Facebook CTA generator is completely free with no signup. Enter your goal (shop now, book a call, learn more...) to get 6 short verb-led phrases for your captions, as many times as you like.',
    },
    {
      question: 'How to use facebook cta examples?',
      answer:
        'Place one CTA at the end of your caption as the single action you want readers to take. Keep it verb-led and under 60 characters. Remember: this tool writes in-post CTA text — your Page CTA button itself comes from Facebook\'s fixed list.',
    },
    {
      question: 'How does a facebook cta examples work?',
      answer:
        'This tool matches your goal to one of 7 families by keyword and returns that family\'s 6 fixed phrases deterministically. It never touches your Page CTA button, which Facebook controls — the platform note says this prominently.',
    },
    {
      question: 'How does the facebook cta examples work?',
      answer:
        'Enter your details using the inputs above and the facebook cta examples calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the facebook cta examples free to use?',
      answer:
        'Yes - this facebook cta examples is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a facebook cta examples?',
      answer:
        'A facebook cta examples is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Phrases come from a fixed bank of 42 hand-written options (7 families x 6) — no AI, no performance data.',
    'All phrases are verb-led and 60 characters or fewer; they are starting points, not guaranteed click-winners.',
    'This tool writes in-post CTA text only — Facebook Page CTA buttons are Facebook\'s fixed list and cannot be customized by this tool.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Facebook CTA Examples 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free facebook cta examples 2026: 6 short, verb-led in-post call-to-action phrases for your goal. Get instant results. free now.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Pinterest & Social Tools',
          item: 'https://husnainblogger.com/tools/pinterest-social/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Facebook CTA Text Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
