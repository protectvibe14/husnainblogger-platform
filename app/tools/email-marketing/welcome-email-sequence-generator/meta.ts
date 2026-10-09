import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'brand',
    label: 'Brand name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Bright Bloom Co',
    validation: { max: 100 },
  },
  {
    id: 'leadMagnet',
    label: 'Lead magnet',
    type: 'text',
    required: true,
    placeholder: 'e.g. 10-page spring lookbook (the freebie new subscribers get)',
    validation: { max: 100 },
  },
  {
    id: 'emailCount',
    label: 'Number of emails',
    type: 'number',
    required: false,
    placeholder: '3–7 (default: 5)',
    validation: { min: 3, max: 7 },
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
  { id: 'sequence', label: 'Welcome email sequence', type: 'table' },
  { id: 'notices', label: 'Notes', type: 'text' },
];

export const content: ToolContent = {
  title: 'Welcome Email Sequence Generator',
  description:
    'Welcome new subscribers like you mean it: enter your brand, lead magnet, and email count for subject lines plus full drafts for every email.',
  howTo: [
    'Enter your brand name in the brand field.',
    'Describe your lead magnet — the freebie new subscribers receive.',
    'Choose how many emails you want (3–7; 5 is the default).',
    'Pick a tone: friendly, warm, professional, or playful.',
    'Copy each email’s subject line and body draft, replace [link] and {{firstName}} placeholders, and paste into your email tool.',
  ],
  methodology:
    'This tool assembles your welcome sequence from a fixed template library (42 subject templates, 28 body templates, 12 greetings, 8 sign-offs) following a standard 7-email welcome arc: deliver the lead magnet, introduce the brand, quick win, social proof, soft offer, FAQ, and recap. A deterministic hash of your inputs selects the template variant for each email, so the same inputs always produce the same sequence. It runs no AI model.',
  examples: [
    {
      title: 'Online boutique',
      inputs: {
        brand: 'Bright Bloom Co',
        leadMagnet: '10-page spring lookbook',
        emailCount: 5,
        tone: 'friendly',
      },
      note: 'A 5-email friendly welcome series for a boutique’s new subscribers.',
    },
    {
      title: 'Coach',
      inputs: {
        brand: 'Calm Focus Coaching',
        leadMagnet: 'Morning routine checklist',
        emailCount: 7,
        tone: 'warm',
      },
      note: 'The full 7-email warm-toned arc for a coaching email list.',
    },
    {
      title: 'SaaS trial',
      inputs: {
        brand: 'Trackly',
        leadMagnet: 'Free 14-day trial guide',
        emailCount: 3,
        tone: 'professional',
      },
      note: 'A short 3-email professional sequence for trial users.',
    },
  ],
  faqs: [
    {
      question: 'What is the best welcome email sequence generator?',
      answer:
        'The best welcome sequences deliver the promised freebie immediately, introduce the brand, share one quick win, add social proof, and end with a soft offer. This free generator builds exactly that arc from fixed templates — you still need to adapt the copy to your voice before sending.',
    },
    {
      question: 'Is there a free welcome email sequence generator?',
      answer:
        'Yes — this generator is completely free with no signup. It assembles subject lines and body drafts from a fixed template library, not AI, so treat the drafts as starting points and personalize them.',
    },
    {
      question: 'How to generate welcome email sequence?',
      answer:
        'Enter your brand name, describe your lead magnet, choose 3–7 emails, and pick a tone. The tool returns a day-by-day sequence with a goal, subject line, and body draft per email. Replace the [link] and {{firstName}} placeholders with your own before pasting into your email platform.',
    },
    {
      question: 'How does a welcome email sequence generator work?',
      answer:
        'It combines your brand, lead magnet, and tone with a fixed library of subject and body templates arranged in a proven welcome arc (delivery → introduction → quick win → proof → offer → FAQ → recap). Selection is deterministic: identical inputs always produce the identical sequence.',
    },
    {
      question: 'How does the welcome email sequence generator work?',
      answer:
        'Enter your details using the inputs above and the welcome email sequence generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the welcome email sequence generator free to use?',
      answer:
        'Yes - this welcome email sequence generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a welcome email sequence generator?',
      answer:
        'A welcome email sequence generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Copy comes from a fixed template library (42 subjects, 28 bodies) — it is not AI-written and will need your personal touch.',
    '[link] and {{firstName}} placeholders must be replaced with your real links and merge tags before sending.',
    'The day offsets (0, 1, 3, 5, 7, 10, 14) are a common welcome cadence, not a guarantee of best send times for your audience.',
    'This tool cannot predict open rates or deliverability.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Welcome Email Sequence Generator 2026 | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/email-marketing/welcome-email-sequence-generator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Welcome new subscribers like you mean it: enter your brand, lead magnet, and email count for subject lines plus full drafts for every email.',
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
          name: 'Welcome Email Sequence Generator',
          item: 'https://husnainblogger.com/tools/email-marketing/welcome-email-sequence-generator/',
        },
      ],
    },
  ],
};
