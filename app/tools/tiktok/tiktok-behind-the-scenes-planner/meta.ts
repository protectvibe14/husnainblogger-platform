import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'businessType',
    label: 'Business type',
    type: 'text',
    required: true,
    placeholder: 'e.g. coffee shop, clothing store — or type "no business" for a creator plan',
    validation: { max: 80 },
  },
  {
    id: 'niche',
    label: 'Your niche (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. coffee culture, streetwear',
    validation: { max: 60 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'momentsToFilm', label: 'Moments to film', type: 'list' },
  { id: 'captionTemplates', label: 'Caption templates', type: 'list' },
  { id: 'postingCadence', label: 'Posting cadence', type: 'text' },
  { id: 'weeklySchedule', label: 'Weekly schedule', type: 'table' },
];

const DESCRIPTION =
  'Plan behind the scenes TikTok ideas for any business — film-ready moments, caption templates, and a weekly posting cadence. Free. Plan your BTS now.';

export const content: ToolContent = {
  title: 'Behind the Scenes TikTok Ideas',
  description: DESCRIPTION,
  howTo: [
    'Type your business type — for example "coffee shop" — or type "no business" to switch to a creator-personal BTS plan.',
    'Optional: add your niche (like "coffee culture") to flavor the captions and moments.',
    'Run the planner to get 8 film-ready BTS moments, 4 caption templates, and a weekly posting cadence.',
    'Follow the 7-day schedule: post on Monday, Wednesday, and Friday, and batch-film the rest of the week.',
    'Keep every clip under 30 seconds and unpolished — film on the same day you post whenever possible.',
  ],
  methodology:
    'The planner deterministically picks 8 moments from a fixed bank (12 business moments or 12 creator-personal moments, chosen by whether your business field says "no business") and 4 captions from a fixed 8-caption bank, using a hash of your business type — so the same inputs always produce the same plan. A fixed Mon/Wed/Fri cadence rule pairs each posting day with a moment and a caption. There is no AI and no TikTok access — it is a static template planner, and it makes no claims about reach or performance.',
  examples: [
    {
      title: 'Coffee shop BTS week',
      inputs: { businessType: 'coffee shop', niche: 'coffee culture' },
      note: 'Business track: order-packing, messy-middle, and after-hours moments with a Mon/Wed/Fri schedule.',
    },
    {
      title: 'Solo creator BTS week',
      inputs: { businessType: 'no business' },
      note: 'Creator-personal track: setup tours, bloopers, and planning-process moments instead of storefront shots.',
    },
  ],
  faqs: [
    {
      question: 'what is the best behind the scenes tiktok ideas?',
      answer:
        'The best BTS content shows the unpolished truth: the messy middle of your work, order packing, setup routines, bloopers, and after-hours resets. This free planner gives you 8 film-ready moments for your business (or a creator-personal track if you have no business), plus captions and a Mon/Wed/Fri posting schedule.',
    },
    {
      question: 'is there a free behind the scenes tiktok ideas?',
      answer:
        'Yes — this behind-the-scenes planner is completely free with no signup. It builds the plan from fixed templates in your browser, so there is no usage limit.',
    },
    {
      question: 'how to use behind the scenes tiktok?',
      answer:
        'Enter your business type (or "no business" for a creator plan), optionally add your niche, and run the planner. Film the 8 moments on the Monday/Wednesday/Friday schedule, pair each with a suggested caption, and keep clips under 30 seconds and unpolished.',
    },
    {
      question: 'how does a behind the scenes tiktok ideas work?',
      answer:
        'Enter your business type and the tool picks 8 moments from a fixed BTS bank (business or creator-personal track, based on your answer), 4 captions from a fixed caption bank, and lays out a 7-day posting schedule. Picks are deterministic — the same inputs always produce the same plan.',
    },
    {
      question: 'How does the behind the scenes tiktok ideas work?',
      answer:
        'Enter your details using the inputs above and the behind the scenes tiktok ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the behind the scenes tiktok ideas free to use?',
      answer:
        'Yes - this behind the scenes tiktok ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a behind the scenes tiktok ideas?',
      answer:
        'A behind the scenes tiktok ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'This is a static template planner — it cannot check your TikTok account or predict how any video will perform.',
    'BTS content builds trust over time; this tool makes no claims about views, followers, or virality.',
    'The "no business" switch only works when your business field says things like "no business", "none", or "personal" — anything else uses the business track.',
    'The Mon/Wed/Fri cadence is a fixed starting suggestion, not a proven optimal schedule — adjust to what you can sustain.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Behind the Scenes TikTok Ideas 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/tiktok/tiktok-behind-the-scenes-planner/',
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
          name: 'TikTok Tools',
          item: 'https://husnainblogger.com/tools/tiktok/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'TikTok Behind-the-Scenes Planner',
          item: 'https://husnainblogger.com/tools/tiktok/tiktok-behind-the-scenes-planner/',
        },
      ],
    },
  ],
};
