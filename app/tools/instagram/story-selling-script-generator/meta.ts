import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/story-selling-script-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'product',
    label: 'Product name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Glow Serum',
    validation: { max: 60 },
  },
  {
    id: 'price',
    label: 'Price (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. $29',
    validation: { max: 30 },
  },
  {
    id: 'objection',
    label: 'Main objection to handle',
    type: 'select',
    required: false,
    options: ['price', 'trust', 'timing', 'need', 'comparison'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'scriptHook',
    label: 'Hook (slide 1)',
    type: 'text',
    description: 'Free how to sell on instagram stories 2026: Opening line that stops the scroll, matched to the chosen objection. Fast, private, no signup - try it now!',
  },
  {
    id: 'scriptStory',
    label: 'Story (slides 2–3)',
    type: 'text',
    description: 'Relatable story beat that builds connection around your product.',
  },
  {
    id: 'scriptOffer',
    label: 'Offer (slide 4)',
    type: 'text',
    description: 'Your product offer line, with price woven in if you entered one.',
  },
  {
    id: 'scriptCta',
    label: 'Call to action (slide 6)',
    type: 'text',
    description: 'Closing CTA that tells viewers exactly what to do next.',
  },
  {
    id: 'slideBreakdown',
    label: '6-slide breakdown',
    type: 'list',
    description: 'Full slide-by-slide plan: text for each of 6 story slides plus a sticker suggestion per slide.',
  },
];

export const content: ToolContent = {
  title: 'How to Sell on Instagram Stories 2027',
  description:
    'Sell on stories with this free how to sell on instagram stories tool. Enter your product, pick an objection, and get a 6-slide selling script. Try it now!',
  howTo: [
    'Enter your product name (up to 60 characters).',
    'Add the price if you want it woven into the offer line (optional).',
    'Pick the main objection your audience has: price, trust, timing, need, or comparison.',
    'Run the tool to get your hook, story, offer, and CTA plus the 6-slide breakdown.',
    'Film the slides in Instagram Stories, add the suggested sticker on each slide, and post.',
  ],
  methodology:
    'The tool assembles scripts from a fixed bank of 70 hand-written sentence frames (5 objections x 14 frames: hooks, stories, offers, CTAs, problem and reframe lines) — no AI and no generated copy. It picks one deterministic variant per objection from your product name and builds a fixed 6-slide structure: Hook, Problem, Story, Offer, Objection reframe, CTA, each with a fixed sticker suggestion.',
  examples: [
    {
      title: 'Skincare product, price objection',
      inputs: { product: 'Glow Serum', price: '$29', objection: 'price' },
      note: 'Script reframes the price against the cost of doing nothing.',
    },
    {
      title: 'Course, trust objection',
      inputs: { product: 'Reels Mastery Course', price: '', objection: 'trust' },
      note: 'Script leads with honest skepticism to build credibility.',
    },
    {
      title: 'Fitness app, timing objection',
      inputs: { product: 'FitDaily App', price: '$9/mo', objection: 'timing' },
      note: 'Script sells the 10-minutes-a-day angle for busy followers.',
    },
  ],
  faqs: [
    {
      question: 'What is the best how to sell on instagram stories?',
      answer:
        'The best approach is a short story arc: hook, relatable problem, your story, the offer, one objection handled, then a clear CTA. This free tool builds that exact 6-slide arc for your product, matched to the objection holding your audience back.',
    },
    {
      question: 'Is there a free how to sell on instagram stories?',
      answer:
        'Yes — this story selling script generator is completely free with no signup. You get a full 6-slide script with hook, story, offer, CTA, and sticker suggestions for each slide.',
    },
    {
      question: 'How to use how to sell on instagram stories?',
      answer:
        'Enter your product and optional price, pick your audience\'s main objection, then film the six slides the tool gives you and add the suggested sticker on each one. The script handles one objection per story — run it again for other objections.',
    },
    {
      question: 'How does the how to sell on instagram stories work?',
      answer:
        'Enter your details using the inputs above and the how to sell on instagram stories calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the how to sell on instagram stories free to use?',
      answer:
        'Yes - this how to sell on instagram stories is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a how to sell on instagram stories?',
      answer:
        'A how to sell on instagram stories is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the how to sell on instagram stories?',
      answer:
        'No account needed. Open the how to sell on instagram stories, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Scripts are assembled from 70 fixed sentence frames — the wording is templated, not AI-written. Adapt the tone to your voice before posting.',
    'No sales results are promised or estimated; the tool plans structure, not outcomes.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'How to Sell on Instagram Stories 2026 | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free how to sell on instagram stories 2026: Opening line that stops the scroll, matched to the chosen objection. Fast, private, no signup - try it now!',
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
          name: 'Story Selling Script Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
