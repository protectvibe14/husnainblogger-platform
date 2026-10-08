import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/welcome-dm-template-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'brandName',
    label: 'Brand name',
    type: 'text',
    required: true,
    placeholder: 'e.g. GlowSkin',
    validation: { max: 60 },
  },
  {
    id: 'offer',
    label: 'What you offer',
    type: 'text',
    required: true,
    placeholder: 'e.g. skincare routines for busy women',
    validation: { max: 140 },
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: false,
    options: ['friendly', 'professional', 'playful', 'bold'],
  },
  {
    id: 'count',
    label: 'How many templates (1–5)',
    type: 'number',
    required: false,
    placeholder: '3',
    validation: { min: 1, max: 5 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'dms',
    label: 'Welcome DM templates',
    type: 'list',
    description: 'Free welcome dm new followers instagram 2026: Copy-ready welcome DM templates with your brand and offer filled in. Each stays under. Fast, private, no signup -!',
  },
  {
    id: 'personalizationSlots',
    label: 'Personalization slots',
    type: 'list',
    description: 'Placeholders to fill per follower, e.g. {name} for the follower\'s first name.',
  },
];

export const content: ToolContent = {
  title: 'Welcome Dm New Followers Instagram 2026 | HusnainBlogger',
  description:
    'Write welcome DMs for new followers with this free welcome dm new followers instagram tool. Add your brand, offer, tone for copy-ready templates. Try it now!',
  howTo: [
    'Enter your brand name (up to 60 characters).',
    'Describe what you offer in one line (up to 140 characters).',
    'Pick a tone: friendly, professional, playful, or bold.',
    'Choose how many templates you want (1–5, default 3) and run the tool.',
    'Copy a template, replace {name} with the follower\'s first name, and send it manually from your Instagram app.',
  ],
  methodology:
    'The tool assembles DMs from a fixed bank of 20 hand-written templates (4 tones x 5 templates) — no AI and no generation from a model. It fills your brand name and offer into the placeholders, keeps {name} as a manual personalization slot, and caps every DM at 1,000 characters.',
  examples: [
    {
      title: 'Skincare brand, friendly tone',
      inputs: { brandName: 'GlowSkin', offer: 'skincare routines for busy women', tone: 'friendly', count: 3 },
      note: 'Three warm welcome DMs with reply prompts to start conversations.',
    },
    {
      title: 'Coach, bold tone',
      inputs: { brandName: 'FitWithAva', offer: '12-week fat-loss coaching', tone: 'bold', count: 2 },
      note: 'Two direct DMs with strong calls to reply.',
    },
    {
      title: 'Freelancer, professional tone',
      inputs: { brandName: 'DesignBySam', offer: 'logo design for startups', tone: 'professional', count: 1 },
      note: 'One polite welcome DM for a service business.',
    },
  ],
  faqs: [
    {
      question: 'What is the best welcome dm new followers instagram?',
      answer:
        'The best welcome DM is short, names the follower, and invites a reply — a question beats a sales pitch. This free tool gives you copy-ready templates in four tones with a built-in reply prompt so new followers actually respond.',
    },
    {
      question: 'Is there a free welcome dm new followers instagram?',
      answer:
        'Yes — this welcome DM generator is completely free with no signup. You get up to 5 templates per run in friendly, professional, playful, or bold tones.',
    },
    {
      question: 'How to use welcome dm new followers instagram?',
      answer:
        'Enter your brand name and offer, pick a tone and template count, then copy a template, replace {name} with the follower\'s first name, and send it manually from the Instagram app. You cannot auto-send DMs — every message goes out by hand.',
    },
    {
      question: 'How does a welcome dm new followers instagram work?',
      answer:
        'You generate a template, personalize it with the follower\'s name, and send it yourself. Templates only — the tool does not connect to Instagram and does not send anything automatically, which keeps your account safe.',
    },
    {
      question: 'How does the welcome dm new followers instagram work?',
      answer:
        'Enter your details using the inputs above and the welcome dm new followers instagram calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the welcome dm new followers instagram free to use?',
      answer:
        'Yes - this welcome dm new followers instagram is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a welcome dm new followers instagram?',
      answer:
        'A welcome dm new followers instagram is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Templates only — the tool does not send DMs automatically. Automation of DMs is not allowed; every message is sent manually by you.',
    'Every template stays under Instagram\'s 1,000-character DM limit; {name} must be replaced by you before sending.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Welcome Dm New Followers Instagram 2026 | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free welcome dm new followers instagram 2026: Copy-ready welcome DM templates with your brand and offer filled in. Each stays under. Fast, private, no signup -!',
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
          name: 'Welcome DM Template Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
