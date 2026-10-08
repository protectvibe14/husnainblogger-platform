import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/email-marketing/sale-promo-email-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'offer',
    label: 'Offer',
    type: 'text',
    required: true,
    placeholder: 'e.g. Pro Annual Plan',
  },
  {
    id: 'discount',
    label: 'Discount',
    type: 'text',
    required: true,
    placeholder: 'e.g. 40% or $20 off',
  },
  {
    id: 'deadline',
    label: 'Deadline (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. October 31, 2026',
  },
  {
    id: 'audience',
    label: 'Audience',
    type: 'text',
    required: true,
    placeholder: 'e.g. newsletter subscribers',
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['professional', 'friendly', 'playful', 'urgent'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'subjectOptions',
    label: 'Subject line options',
    type: 'list',
    description: 'Free sale email template generator 2026: 5 subject-line options assembled from fixed templates with your offer and discount. Fast, private, no signup - try it!',
  },
  {
    id: 'bodyDraft',
    label: 'Promo email draft',
    type: 'copy',
    description: 'Full promo draft in your chosen tone. Contains no invented urgency.',
  },
  {
    id: 'urgencyBlock',
    label: 'Urgency copy',
    type: 'text',
    description:
      'Deadline-based urgency lines generated ONLY from the deadline you entered. States plainly that no urgency was generated when no deadline is given.',
  },
];

export const content: ToolContent = {
  title: 'Sale Email Template Generator 2026 – Free | HusnainBlogger',
  description:
    'Build a high-converting sale email with this free sale email template generator. Add your offer, discount, and real deadline for honest urgency copy. Start now!',
  howTo: [
    'Enter your offer name and the exact discount (e.g. 40% or $20 off).',
    'Optionally enter the real sale deadline — urgency copy is generated only from this.',
    'Describe your audience and pick a tone: professional, friendly, playful, or urgent.',
    'Run the tool to get 5 subject lines, a full promo draft, and an urgency block.',
    'Copy the draft into your email platform and replace [Your Brand] with your name.',
  ],
  methodology:
    'The generator assembles your email from fixed template banks (12 subject patterns, 12 tone openers, 4 body paragraphs, 12 tone CTA lines, 6 urgency lines, 4 sign-offs) filled with your own inputs — no AI, no guessing. The honesty guardrail is a hard rule: urgency copy is generated only when you supply a deadline; without one, urgency-implying subjects are filtered out and the urgency block states that nothing was generated. Variant selection is a deterministic hash of your inputs.',
  examples: [
    {
      title: 'Annual plan sale',
      inputs: {
        offer: 'Pro Annual Plan',
        discount: '40%',
        deadline: 'October 31, 2026',
        audience: 'newsletter subscribers',
        tone: 'friendly',
      },
      note: 'Friendly tone with a real deadline driving the urgency copy.',
    },
    {
      title: 'Evergreen discount, no deadline',
      inputs: {
        offer: 'Starter Bundle',
        discount: '$20 off',
        deadline: '',
        audience: 'new customers',
        tone: 'professional',
      },
      note: 'No deadline entered, so no urgency claims appear anywhere.',
    },
  ],
  faqs: [
    {
      question: 'What is the best sale email template generator?',
      answer:
        'The best one keeps your offer, discount, and deadline honest: this free generator builds subject lines and a full promo draft from fixed templates in your chosen tone, and it never invents deadlines or countdowns — urgency copy only uses the deadline you enter.',
    },
    {
      question: 'Is there a free sale email template generator?',
      answer:
        'Yes — this sale email template generator is completely free with no signup. You get 5 subject lines, a tone-matched promo draft, and an honesty-guarded urgency block.',
    },
    {
      question: 'How to generate sale email?',
      answer:
        'Enter your offer, discount, audience, and tone; add your real deadline only if the sale actually ends. Run the tool, pick a subject line, copy the draft, and replace [Your Brand] with your business name.',
    },
    {
      question: 'How does a sale email template generator work?',
      answer:
        'It fills fixed template patterns with your details — offer, discount, audience, and tone shape the copy, while the deadline field alone controls any urgency wording. Leave the deadline empty and no urgency claims are generated at all.',
    },
    {
      question: 'How does the sale email template generator work?',
      answer:
        'Enter your details using the inputs above and the sale email template generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the sale email template generator free to use?',
      answer:
        'Yes - this sale email template generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a sale email template generator?',
      answer:
        'A sale email template generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'HONESTY GUARDRAIL: urgency copy is generated ONLY from the deadline you enter. Without a deadline, no urgency claims appear in subjects, body, or the urgency block — the tool never invents false scarcity, countdowns, or seat limits.',
    'Drafts are assembled from fixed template banks (12 subject patterns, 12 openers, 4 body paragraphs, 12 CTA lines, 6 urgency lines, 4 sign-offs) — no AI copywriting is involved.',
    'The tool does not verify your discount terms or deadline — confirm them in your store before sending.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Sale Email Template Generator 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free sale email template generator 2026: 5 subject-line options assembled from fixed templates with your offer and discount. Fast, private, no signup - try it!',
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
          name: 'Sale/Promo Email Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
