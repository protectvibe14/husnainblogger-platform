import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'prize',
    label: 'Prize',
    type: 'text',
    required: true,
    placeholder: 'e.g. a $50 skincare bundle',
    validation: { max: 150 },
  },
  {
    id: 'durationDays',
    label: 'Giveaway duration (days)',
    type: 'number',
    required: true,
    validation: { min: 1, max: 30 },
  },
  {
    id: 'entryMethod',
    label: 'Entry method',
    type: 'select',
    required: true,
    options: [
      'Follow + comment',
      'Follow + like + comment',
      'Tag a friend',
      'Duet / Stitch entry',
      'Comment a keyword',
    ],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'planRules', label: 'Official rules text', type: 'copy' },
  { id: 'timeline', label: 'Day-by-day timeline', type: 'list' },
  { id: 'scripts', label: 'Announcement + winner scripts', type: 'copy' },
  { id: 'legalReminder', label: 'Legal reminder', type: 'text' },
];

const DESCRIPTION =
  'Free tiktok giveaway ideas 2026: get instant results in your browser. Instant, private, and mobile-friendly. No signup - try it free!';

export const content: ToolContent = {
  title: 'TikTok Giveaway Ideas 2026 – Free Tool | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Type your prize into the "Prize" box — for example "a $50 skincare bundle".',
    'Set "Giveaway duration" to how many days entries stay open (1–30).',
    'Pick an "Entry method" — follow + comment, tag a friend, duet/stitch, and more.',
    'Run the planner to get official rules text, entry mechanics, a day-by-day timeline, and announcement + winner scripts.',
    'Replace every [bracketed] placeholder (dates, eligibility, winner handle) with your real details.',
    'Read the legal reminder and check your country\'s giveaway rules before launching.',
  ],
  methodology:
    'The plan is assembled from fixed templates: 5 entry-method definitions (each with 3 mechanics steps and an announcement line), a rules template with bracketed placeholders you must fill in, and a timeline computed arithmetically from your duration (launch, midpoint reminder, final 24 hours, winner selection, winner announcement). A legal reminder is always included. There is no AI, no invented dates or costs — and the tool is not legal advice.',
  examples: [
    {
      title: 'Week-long giveaway',
      inputs: {
        prize: 'a $50 skincare bundle',
        durationDays: 7,
        entryMethod: 'Follow + comment',
      },
      note: 'Full plan: rules text, 5-step timeline (days 1, 4, 7, 8, 9), and both video scripts.',
    },
    {
      title: 'Tag-a-friend contest',
      inputs: {
        prize: 'wireless earbuds',
        durationDays: 14,
        entryMethod: 'Tag a friend',
      },
      note: 'Plan with tag-based entry mechanics capped at 5 entries and a spam-tag disqualification note.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok giveaway ideas?',
      answer:
        'The best TikTok giveaways offer a prize your audience actually wants, use a simple entry method (follow + comment or tag a friend), run 7–14 days, and publish clear rules. This free planner builds the full plan — rules, timeline, and scripts — from your prize and duration.',
    },
    {
      question: 'Is there a free tiktok giveaway ideas?',
      answer:
        'Yes — this giveaway planner is completely free with no signup. It assembles plans from fixed templates in your browser, so there is no usage limit.',
    },
    {
      question: 'How to use tiktok giveaway?',
      answer:
        'Enter your prize, duration (1–30 days), and entry method, then generate the plan. Fill in the bracketed placeholders (dates, eligibility, winner handle), read the legal reminder, post the announcement video, and follow the day-by-day timeline.',
    },
    {
      question: 'How does the tiktok giveaway ideas work?',
      answer:
        'Enter your details using the inputs above and the tiktok giveaway ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok giveaway ideas free to use?',
      answer:
        'Yes - this tiktok giveaway ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok giveaway ideas?',
      answer:
        'A tiktok giveaway ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the tiktok giveaway ideas?',
      answer:
        'No account needed. Open the tiktok giveaway ideas, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Giveaway and sweepstakes rules differ by country and US state — the legal reminder is general information, not legal advice; confirm local requirements before launching.',
    'Plans are template-based (5 fixed entry methods) and cannot verify eligibility, pick real winners, or guarantee entries or follower growth.',
    'Timelines are computed from your duration only — they do not account for holidays, time zones, or TikTok algorithm behavior.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'TikTok Giveaway Ideas 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/tiktok/tiktok-giveaway-planner/',
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
          name: 'TikTok Giveaway Planner',
          item: 'https://husnainblogger.com/tools/tiktok/tiktok-giveaway-planner/',
        },
      ],
    },
  ],
};
