import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent, BuilderField } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [
  { id: 'mix', label: 'Hashtag mixes', type: 'list' },
  { id: 'readyToCopy', label: 'Ready-to-copy hashtag block', type: 'copy' },
  { id: 'copyNote', label: 'Honesty note', type: 'text' },
];

export const itemFields: BuilderField[] = [
  {
    id: 'niche',
    label: 'Niche',
    type: 'text',
    required: true,
    placeholder: 'fitness | food | travel | beauty | fashion | business | pets | photography',
  },
  {
    id: 'postType',
    label: 'Post type',
    type: 'text',
    required: true,
    placeholder: 'feed | reel | carousel | story',
  },
  {
    id: 'goal',
    label: 'Goal',
    type: 'text',
    placeholder: 'reach | community | branded (default: reach)',
  },
];

const DESCRIPTION =
  'Build a balanced 5-hashtag mix with this free instagram hashtag strategy builder — curated niche pools, fixed tier rules, no guesswork. Start building your mix.';

export const content: ToolContent = {
  title: 'Instagram Hashtag Strategy Builder',
  description: DESCRIPTION,
  howTo: [
    'Add a row and type your niche: fitness, food, travel, beauty, fashion, business, pets, or photography.',
    'Set the post type (feed, reel, carousel, or story) — it shifts which curated tags are picked.',
    'Choose your goal: reach (broad tags), community (niche + community tags), or branded (mixed).',
    'Generate to get a balanced mix capped at 5 hashtags — Instagram\'s current recommended limit.',
    'Copy the ready-to-copy block and paste it into your caption, then swap any tag that does not fit your audience.',
  ],
  methodology:
    'This tool does not use AI and has no live hashtag volume or reach data — Instagram publishes none publicly. It picks 5 tags from a fixed bundled pool (8 niches x 24 tags in broad/medium/niche/community tiers, plus a 24-tag generic pool = 216 curated tags) using a fixed tier template per goal (e.g. reach = broad, broad, medium, medium, niche). Tag selection is a deterministic rotation, so the same inputs always give the same mix.',
  faqs: [
    {
      question: 'What is the best instagram hashtag strategy builder?',
      answer:
        'A good strategy mixes broad, medium, and niche tags capped at 5 per post — Instagram\'s current recommendation. This free tool builds that mix for you from curated niche pools, with tier templates for reach, community, or branded goals.',
    },
    {
      question: 'Is there a free instagram hashtag strategy builder?',
      answer:
        'Yes — this tool is free with no signup. Add rows for your niche, post type, and goal, and get a ready-to-copy 5-tag block. The pools are curated starters; there is no live volume or reach data.',
    },
    {
      question: 'How to build instagram hashtag strategy?',
      answer:
        'Combine tag tiers instead of stacking only huge tags: pair broad tags for reach with niche and community tags that match your actual audience. Keep it to 5 tags per post, place them in the caption or first comment, and rotate mixes across posts.',
    },
    {
      question: 'How does the instagram hashtag strategy builder work?',
      answer:
        'Enter your details using the inputs above and the instagram hashtag strategy builder calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the instagram hashtag strategy builder free to use?',
      answer:
        'Yes - this instagram hashtag strategy builder is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an instagram hashtag strategy builder?',
      answer:
        'An instagram hashtag strategy builder is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the instagram hashtag strategy builder?',
      answer:
        'No account needed. Open the instagram hashtag strategy builder, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Hashtag pools are curated starter mixes (216 bundled tags) — not live popularity rankings and not personalized.',
    'No live volume or reach data is used or claimed; Instagram publishes no public hashtag volume API.',
    'Output is capped at 5 hashtags per Instagram\'s current recommended limit.',
    'Unknown niches fall back to a general pool with a note — pick a listed niche for tailored tags.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Instagram Hashtag Strategy Builder 2026 | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/instagram/hashtag-mix-builder/',
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
          name: 'Instagram Hashtag Strategy Builder',
          item: 'https://husnainblogger.com/tools/instagram/hashtag-mix-builder/',
        },
      ],
    },
  ],
};
