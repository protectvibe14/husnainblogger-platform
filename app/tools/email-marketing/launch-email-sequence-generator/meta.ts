import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'product',
    label: 'Product name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Glow Habit Tracker',
    validation: { max: 100 },
  },
  {
    id: 'launchDate',
    label: 'Launch date',
    type: 'date',
    required: true,
  },
  {
    id: 'audience',
    label: 'Target audience',
    type: 'text',
    required: true,
    placeholder: 'e.g. busy parents',
    validation: { max: 100 },
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: false,
    options: ['friendly', 'warm', 'professional', 'playful'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'sequence', label: 'Launch email sequence', type: 'table' },
  { id: 'notices', label: 'Notes', type: 'text' },
];

export const content: ToolContent = {
  title: 'Product Launch Email Sequence',
  description:
    'Plan a product launch email sequence fast: enter your product, launch date, and audience for 7 emails with phases, send dates, and drafts. Free, no signup.',
  howTo: [
    'Enter your product name in the product field.',
    'Pick your launch date — send dates are calculated from it automatically.',
    'Describe your target audience in a few words.',
    'Choose a tone: friendly, warm, professional, or playful.',
    'Copy each email’s subject and body draft, fill in the [bracketed] placeholders, and schedule them in your email tool.',
  ],
  methodology:
    'This tool assembles a fixed 7-email launch arc (tease → tease → announce → cart open → social proof → FAQ → last call, sent T-7 through T+7) from a template library of 35 subject templates and 28 body templates. Send dates are computed from your launch date with UTC date arithmetic. A deterministic hash of your inputs selects the template variant per email, so identical inputs always produce the identical sequence. It runs no AI model.',
  examples: [
    {
      title: 'App launch',
      inputs: {
        product: 'Glow Habit Tracker',
        launchDate: '2026-11-15',
        audience: 'busy parents',
        tone: 'warm',
      },
      note: 'A 7-email warm-toned launch arc for a habit-tracking app.',
    },
    {
      title: 'Course launch',
      inputs: {
        product: 'Sourdough Basics Course',
        launchDate: '2026-12-01',
        audience: 'home bakers',
        tone: 'friendly',
      },
      note: 'Friendly launch emails for an online baking course.',
    },
  ],
  faqs: [
    {
      question: 'What is the best product launch email sequence?',
      answer:
        'Strong launch sequences follow a proven arc: tease the product, announce it, open the cart, share early proof, answer objections, then close with urgency. This free generator builds that 7-email arc from fixed templates — adapt the copy and verify every claim before sending.',
    },
    {
      question: 'Is there a free product launch email sequence?',
      answer:
        'Yes — this generator is completely free with no signup. It assembles subject lines and body drafts from a fixed template library, not AI, so treat the drafts as starting points and personalize them for your audience.',
    },
    {
      question: 'How to use product launch email sequence?',
      answer:
        'Enter your product, launch date, and audience, then copy the 7 generated emails with their send dates (T-7 to T+7) into your email platform. Replace every [bracketed] placeholder — links, prices, guarantees, testimonials — with your real details.',
    },
    {
      question: 'How does a product launch email sequence work?',
      answer:
        'It maps your product and launch date onto a fixed 7-phase launch arc and fills each phase from a template library. Send dates are calculated from your launch date, and template selection is deterministic: the same inputs always produce the same sequence.',
    },
    {
      question: 'How does the product launch email sequence work?',
      answer:
        'Enter your details using the inputs above and the product launch email sequence calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the product launch email sequence free to use?',
      answer:
        'Yes - this product launch email sequence is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a product launch email sequence?',
      answer:
        'A product launch email sequence is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Copy comes from a fixed template library (35 subjects, 28 bodies) — it is not AI-written and needs your personal touch.',
    '[Bracketed] placeholders (links, prices, testimonials, guarantees) must be replaced with real details before sending.',
    'The T-7 to T+7 cadence is a common launch pattern, not a guarantee of best send times for your audience.',
    'This tool cannot predict open rates, sales, or deliverability.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Product Launch Email Sequence 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/email-marketing/launch-email-sequence-generator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Plan a product launch email sequence fast: enter your product, launch date, and audience for 7 emails with phases, send dates, and drafts. Free, no signup.',
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
          name: 'Launch Email Sequence Generator',
          item: 'https://husnainblogger.com/tools/email-marketing/launch-email-sequence-generator/',
        },
      ],
    },
  ],
};
