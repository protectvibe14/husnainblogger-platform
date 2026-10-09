import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/facebook-giveaway-idea-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'business',
    label: 'Your business',
    type: 'text',
    required: true,
    placeholder: 'e.g. Sunny Side Bakery, GlowFit Studio',
  },
  {
    id: 'prize',
    label: 'Prize (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. a $50 gift card (leave blank for a suggestion)',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'concepts',
    label: 'Giveaway concepts',
    type: 'list',
    description:
    'Free facebook giveaway ideas 2026: 4 giveaway idea frameworks, each with concept, entry mechanic and prize suggestion. Fast, private now.',
  },
  {
    id: 'checklist',
    label: 'Compliance checklist',
    type: 'list',
    description:
    '5 honest compliance reminders — no-purchase-necessary, posted rules, Facebook disclaimer.',
  },
  {
    id: 'count',
    label: 'Concepts generated',
    type: 'number',
    description:
    'How many giveaway concepts were generated.',
  },
];

export const content: ToolContent = {
  title: 'Facebook Giveaway Ideas',
  description:
    'Run a giveaway that grows your page safely: enter your business for 4 concept frameworks plus a compliance checklist to stay out of trouble.',
  howTo: [
    'Type Your business name into the field (e.g. Sunny Side Bakery).',
    'Optionally type the Prize you want to offer — or leave it blank for a prize suggestion.',
    'Click run to get 4 giveaway concept frameworks with entry mechanics.',
    'Pick a concept and read the compliance checklist before posting anything.',
    'Post your own official rules (dates, eligibility, winner selection) and state Facebook is not affiliated.',
  ],
  methodology:
    'This tool returns 4 fixed, hand-written giveaway concept frameworks (comment-to-win, photo showcase, poll vote, caption this) with your business and prize inserted — deterministic template assembly, no AI. A fixed 5-item compliance checklist is always attached because the tool cannot verify policy compliance or predict results; it never promises a guaranteed-viral mechanic and never suggests spammy "tag 50 friends" entry mechanics.',
  examples: [
    {
      title: 'Giveaway for a bakery with a gift-card prize',
      inputs: { business: 'Sunny Side Bakery', prize: 'a $50 gift card' },
      note: 'Returns 4 concepts with your prize in each prize suggestion.',
    },
    {
      title: 'Giveaway without a set prize',
      inputs: { business: 'GlowFit Studio' },
      note: 'Prize left blank, so the tool suggests a best-seller bundle from your business.',
    },
  ],
  faqs: [
    {
      question: 'What is the best facebook giveaway ideas?',
      answer:
        'There is no verified "best" — comment-to-win, photo contests, poll votes, and caption contests all work when the prize fits the audience. This free generator gives you 4 concept frameworks with entry mechanics, plus a compliance checklist, built from fixed templates — never a promised viral result.',
    },
    {
      question: 'Is there a free facebook giveaway ideas?',
      answer:
        'Yes — this Facebook giveaway idea generator is completely free with no signup. Enter your business name (and optionally a prize) to get 4 concept frameworks plus a compliance checklist, as many times as you like.',
    },
    {
      question: 'How to use facebook giveaway?',
      answer:
        'Pick a concept from the generator, add your official rules (eligibility, start/end dates, how the winner is picked), state clearly that Facebook does not sponsor the promotion, and never require tagging friends or sharing on personal timelines as the entry mechanic.',
    },
    {
      question: 'How does a facebook giveaway ideas work?',
      answer:
        'This tool inserts your business and prize into 4 fixed concept templates and always attaches the same 5-item compliance checklist. It cannot verify that your giveaway complies with Facebook policies or local laws — check those yourself before launching.',
    },
    {
      question: 'How does the facebook giveaway ideas work?',
      answer:
        'Enter your details using the inputs above and the facebook giveaway ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the facebook giveaway ideas free to use?',
      answer:
        'Yes - this facebook giveaway ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a facebook giveaway ideas?',
      answer:
        'A facebook giveaway ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Ideas are frameworks from a fixed 4-concept library — not AI-generated, and never a guarantee of virality or entries.',
    'The compliance checklist is guidance only; the tool cannot verify policy compliance — check Facebook\'s current Page promotion policies and your local contest laws.',
    'Entry mechanics are intentionally spam-free: no "tag 50 friends" style mechanics are suggested.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Facebook Giveaway Ideas 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free facebook giveaway ideas 2026: 4 giveaway idea frameworks, each with concept, entry mechanic and prize suggestion. Fast, private now.',
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
          name: 'Facebook Giveaway Idea Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
