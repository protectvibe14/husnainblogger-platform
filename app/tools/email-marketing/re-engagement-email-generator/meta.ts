import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'segmentName',
    label: 'Segment name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Lapsed buyers',
    validation: { max: 100 },
  },
  {
    id: 'inactiveDays',
    label: 'Days inactive',
    type: 'number',
    required: true,
    placeholder: 'e.g. 120 (30–730)',
    validation: { min: 30, max: 730 },
  },
  {
    id: 'incentive',
    label: 'Win-back incentive (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. 20% off your next order',
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
  { id: 'subjectOptions', label: 'Subject line options', type: 'list' },
  { id: 'bodyDraft', label: 'Email body draft', type: 'text' },
  { id: 'winbackOfferBlock', label: 'Win-back offer block', type: 'text' },
  { id: 'notices', label: 'Notes', type: 'text' },
];

export const content: ToolContent = {
  title: 'Re-Engagement Email Generator 2026 – Free | HusnainBlogger',
  description:
    'This free re-engagement email generator builds a win-back email from proven templates: 5 subject options, a body draft, and an offer block. No signup.',
  howTo: [
    'Name the inactive segment (e.g. lapsed buyers).',
    'Enter how many days the segment has been inactive (30–730).',
    'Optionally add a win-back incentive, like a discount or free bonus.',
    'Pick a tone: friendly, warm, professional, or playful.',
    'Copy the subject options and body draft, replace the [bracketed] placeholders, and send via your email platform.',
  ],
  methodology:
    'This tool assembles one re-engagement email from a fixed template library (10 subject templates, 4 body templates). A deterministic hash of your inputs picks 5 subject options by rotation and 1 body template, so identical inputs always produce the identical email. If you provide an incentive, a win-back offer block is added; otherwise the output explains where to add one. It runs no AI model.',
  examples: [
    {
      title: 'Ecommerce lapsed buyers',
      inputs: {
        segmentName: 'Lapsed buyers',
        inactiveDays: 120,
        incentive: '20% off your next order',
        tone: 'friendly',
      },
      note: 'A friendly win-back email with a discount offer block.',
    },
    {
      title: 'Newsletter sleepers',
      inputs: {
        segmentName: 'Dormant readers',
        inactiveDays: 200,
        incentive: '',
        tone: 'warm',
      },
      note: 'A warm re-engagement email with no incentive — the offer block explains what to add.',
    },
  ],
  faqs: [
    {
      question: 'What is the best re-engagement email generator?',
      answer:
        'The best win-back emails acknowledge the silence honestly, remind readers what they’re missing, offer a concrete reason to return, and make unsubscribing easy. This free generator builds that structure from fixed templates — personalize the copy and verify any incentive before sending.',
    },
    {
      question: 'Is there a free re-engagement email generator?',
      answer:
        'Yes — this generator is completely free with no signup. It assembles subject options, a body draft, and an offer block from a fixed template library, not AI, so treat the draft as a starting point.',
    },
    {
      question: 'How to generate re engagement email?',
      answer:
        'Enter your segment name and how many days subscribers have been inactive, optionally add an incentive, and pick a tone. The tool returns 5 subject line options, a full body draft, and a win-back offer block you can paste into your email platform.',
    },
    {
      question: 'How does a re-engagement email generator work?',
      answer:
        'It combines your segment details with a fixed library of win-back templates. Subject options are picked by deterministic rotation and the body from a fixed set, so the same inputs always produce the same email — no AI involved.',
    },
    {
      question: 'How does the re-engagement email generator work?',
      answer:
        'Enter your details using the inputs above and the re-engagement email generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the re-engagement email generator free to use?',
      answer:
        'Yes - this re-engagement email generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a re-engagement email generator?',
      answer:
        'A re-engagement email generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Copy comes from a fixed template library (10 subjects, 4 bodies) — it is not AI-written and needs your personal touch.',
    'Inactive days are clamped to 30–730; the tool does not connect to your email platform or know real engagement data.',
    'Without an incentive, no offer block is invented — add a real discount or perk before sending.',
    'This tool cannot predict re-engagement rates or deliverability.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Re-Engagement Email Generator 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/email-marketing/re-engagement-email-generator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'This free re-engagement email generator builds a win-back email from proven templates: 5 subject options, a body draft, and an offer block. No signup.',
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
          name: 'Re-Engagement Email Generator',
          item: 'https://husnainblogger.com/tools/email-marketing/re-engagement-email-generator/',
        },
      ],
    },
  ],
};
