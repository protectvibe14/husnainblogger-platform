import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'creatorName',
    label: 'Creator / brand name (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. Jane Doe',
  },
  {
    id: 'platformRows',
    label: 'Platforms — one per line',
    type: 'textarea',
    required: true,
    placeholder: 'YouTube, 120000, 800-1500\nPodcast, 8000\nTikTok, 50000, 300-600',
    validation: { max: 10000 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'rateCard', label: 'Rate card document', type: 'copy' },
  { id: 'summary', label: 'Summary', type: 'text' },
  { id: 'disclaimer', label: 'Accuracy disclaimer', type: 'text' },
];

const DESCRIPTION =
  'Build with this free creator rate card generator — assemble your platform rates into a copy-ready card with honest estimate labels. Start your rate card.';

export const content: ToolContent = {
  title: 'Creator Rate Card Generator',
  description: DESCRIPTION,
  howTo: [
    'Optionally enter your creator or brand name in the creatorName field for the document header.',
    'In platformRows, add one platform per line using the format: platform, followers, baseLow-baseHigh — e.g. "YouTube, 120000, 800-1500". The base rate part is optional.',
    'For any platform where you skip the base rate, the tool fills a generic labeled ESTIMATE band based on audience size — never presented as your researched rate.',
    'Run the tool and read the rendered rate card: platform, audience, deliverable, USD rate range, and whether each row is your rate or an estimate.',
    'Copy the card, replace estimate rows with your real numbers, and read the accuracy disclaimer — the card is only as accurate as the inputs you gave.',
  ],
  methodology:
    'The generator parses each textarea line into platform, follower count, and an optional user base rate. Rows with user rates are used as-is (rounded to cents); rows without fall back to generic audience-size estimate bands ($50–$200 under 10k up to $50k–$300k at 10M+, rounded to $25) that are explicitly marked ESTIMATE. The document is assembled client-side with no dates or randomness, so identical inputs always produce the identical card.',
  examples: [
    {
      title: 'Two platforms, one with your rate',
      inputs: { creatorName: 'Jane Doe', platformRows: 'YouTube, 120000, 800-1500\nPodcast, 8000' },
      note: 'YouTube row uses your $800–$1,500 rate; Podcast row falls back to the $50–$200 estimate band.',
    },
    {
      title: 'All estimates',
      inputs: { platformRows: 'TikTok, 50000\nInstagram, 2500000' },
      note: 'Both rows use estimate bands ($200–$1,000 and $10k–$50k), marked ESTIMATE in the card.',
    },
  ],
  faqs: [
    {
      question: 'What is the best creator rate card generator?',
      answer:
        'The best one is honest about its sources: this free generator builds your card from your own rates and marks any missing numbers with clearly labeled estimate bands, so brands never mistake an estimate for your researched price. It runs fully client-side with no signup.',
    },
    {
      question: 'Is there a free creator rate card generator?',
      answer:
        'Yes — this tool is completely free with no signup. Add one platform per line (platform, followers, optional base rate), and it assembles a copy-ready rate card with USD ranges, deliverable labels, and an accuracy disclaimer.',
    },
    {
      question: 'How to generate creator rate?',
      answer:
        'Enter your platform, follower count, and the rate you actually charge as "platform, followers, baseLow-baseHigh" — e.g. "YouTube, 120000, 800-1500". If you leave the rate off, the tool estimates a band for you, clearly labeled, so you can replace it with your real number before sending the card.',
    },
    {
      question: 'How does a creator rate card generator work?',
      answer:
        'This one parses each line of your platform list, uses your base rates where given, and fills missing rates with generic audience-size estimate bands ($50–$200 under 10k followers up to $50k–$300k at 10M+). It renders a copy-ready document with every row tagged as your rate or an estimate, plus a disclaimer that the card is only as accurate as your inputs.',
    },
    {
      question: 'How does the creator rate card generator work?',
      answer:
        'Enter your details using the inputs above and the creator rate card generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the creator rate card generator free to use?',
      answer:
        'Yes - this creator rate card generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a creator rate card generator?',
      answer:
        'A creator rate card generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The card is only as accurate as the numbers YOU enter — said outright in the document, disclaimer, and FAQs.',
    'Fallback estimate bands are generic labeled ESTIMATES (not platform-verified), rounded to the nearest $25.',
    'User-supplied base rates are used as-is; the tool cannot verify whether they match the market.',
    'Actual deal prices vary by niche, engagement, audience geography, deliverables, and negotiation.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Creator Rate Card Generator 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/make-money/rate-card-generator/',
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
          name: 'Make Money Tools',
          item: 'https://husnainblogger.com/tools/make-money/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Rate Card Generator',
          item: 'https://husnainblogger.com/tools/make-money/rate-card-generator/',
        },
      ],
    },
  ],
};
