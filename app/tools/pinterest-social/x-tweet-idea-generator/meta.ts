import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/x-tweet-idea-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. sourdough baking for beginners',
  },
  {
    id: 'goal',
    label: 'Goal',
    type: 'select',
    required: false,
    options: ['engagement', 'traffic', 'followers'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'tweets',
    label: 'Tweet drafts',
    type: 'list',
    description:
    'Free tweet ideas 2026: 8 ready-to-post drafts, each within 280 weighted characters. free.',
  },
  {
    id: 'notes',
    label: 'Notes',
    type: 'list',
    description:
    'Weighted-count method and the link-in-reply best practice.',
  },
];

export const content: ToolContent = {
  title: 'Tweet Ideas Generator',
  description:
    'Generate tweet ideas for any topic: pick a goal and get 8 ready-to-post X drafts, each checked against weighted character rules. Free — get ideas now.',
  howTo: [
    'Type your topic (for example, "sourdough baking for beginners").',
    'Pick a goal: engagement (replies and debate), traffic (link-in-reply posts), or followers (follow-me framing). Leave it blank for general ideas.',
    'Click run to get 8 tweet drafts — each one is validated to fit 280 weighted characters.',
    'Copy a draft, tweak it in your voice, and post it — keep links in the first reply, not the tweet text.',
  ],
  methodology:
    'This tool is a client-side template engine, not AI. It fills 24 fixed templates (8 per goal: engagement, traffic, followers) plus 4 generic templates with your topic and returns 8 deterministic drafts. Every draft is checked with a conservative weighted count — links count as 23 characters, emoji as 2 each, everything else as 1 — and long topics are cut at a word boundary with an ellipsis so drafts always fit 280 weighted characters. A topic that alone exceeds 280 weighted characters is rejected with a pointer to the Thread Planner instead.',
  examples: [
    {
      title: 'Sourdough, engagement goal',
      inputs: { topic: 'sourdough baking', goal: 'engagement' },
      note: 'Gets debate-style drafts like hot takes and "unpopular opinion" openers.',
    },
    {
      title: 'Fitness guide, traffic goal',
      inputs: { topic: 'home workouts', goal: 'traffic' },
      note: 'Gets link-in-reply drafts that keep the tweet text clean.',
    },
    {
      title: 'No goal selected',
      inputs: { topic: 'budget travel' },
      note: 'Gets a mix of generic and engagement drafts.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tweet ideas?',
      answer:
        'The best tweet ideas match your goal: engagement drafts ask questions and take stances, traffic drafts tease a link kept in the first reply, and follower drafts invite people to follow for more. This tool generates 8 drafts per goal from fixed templates, so you always start from a proven shape.',
    },
    {
      question: 'Is there a free tweet ideas?',
      answer:
        'Yes — this Tweet Idea Generator is completely free with no signup. Enter any topic, pick engagement, traffic, or followers as your goal, and get 8 ready-to-post drafts instantly.',
    },
    {
      question: 'How to use tweet?',
      answer:
        'Pick a draft that fits your goal, rewrite it in your own voice, and post it — then put any link as the first reply rather than in the tweet text, which keeps the main tweet clean and readable. Every draft this tool returns already fits the 280 weighted-character limit.',
    },
    {
      question: 'How does the tweet ideas work?',
      answer:
        'Enter your details using the inputs above and the tweet ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tweet ideas free to use?',
      answer:
        'Yes - this tweet ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tweet ideas?',
      answer:
        'A tweet ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the tweet ideas?',
      answer:
        'No account needed. Open the tweet ideas, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Drafts come from 24 fixed templates plus 4 generic ones — the tool does not write original copy.',
    'The weighted count (links = 23, emoji = 2, rest = 1) is a conservative client-side rule, not X\u2019s official counter — always re-check before posting.',
    'Topics longer than 280 weighted characters on their own belong in a thread, not a single tweet.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Tweet Ideas Generator 2026 – 100+ Ideas | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free tweet ideas 2026: 8 ready-to-post drafts, each within 280 weighted characters. free.',
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
          name: 'Pinterest & Social Tools',
          item: 'https://husnainblogger.com/tools/pinterest-social/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'X Tweet Idea Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
