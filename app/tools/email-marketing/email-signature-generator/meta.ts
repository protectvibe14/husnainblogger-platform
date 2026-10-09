import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/email-marketing/email-signature-generator/';

export const inputs: ToolInput[] = [
  { id: 'name', label: 'Your name', type: 'text', required: true, placeholder: 'e.g. Amara Osei' },
  { id: 'title', label: 'Job title', type: 'text', required: true, placeholder: 'e.g. Founder' },
  { id: 'company', label: 'Company', type: 'text', required: true, placeholder: 'e.g. Inbox Craft Co.' },
  { id: 'phone', label: 'Phone (optional)', type: 'text', required: false, placeholder: 'e.g. +1 555 123 4567' },
  { id: 'website', label: 'Website (optional)', type: 'url', required: false, placeholder: 'e.g. example.com' },
  {
    id: 'socialLinks',
    label: 'Social links (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'e.g. LinkedIn: https://linkedin.com/in/you, https://x.com/you',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'signatureHTML',
    label: 'Signature HTML',
    type: 'copy',
    description:
    'Free email signature generator 2026: Email-client-safe HTML (table-based, inline styles) — paste it into your email client’s. Fast, private.',
  },
  {
    id: 'signatureText',
    label: 'Plain-text signature',
    type: 'copy',
    description:
    'Plain-text twin of the signature for clients that strip HTML.',
  },
];

export const content: ToolContent = {
  title: 'Email Signature Generator',
  description:
    'Create a professional email signature with client-safe HTML. Enter your name, title, and links to get a copy-paste signature plus plain text. Free.',
  howTo: [
    'Enter your name, job title, and company (required).',
    'Optionally add your phone, website, and social links ("Label: URL", comma separated).',
    'Run the tool to build the signature HTML and a plain-text twin.',
    'Copy the HTML into your email client’s signature editor and save it.',
    'Send yourself a test email — this tool has no live email-client preview, so always check the real rendering.',
  ],
  methodology:
    'The generator renders your details into one fixed, email-client-safe layout: a table-based block with inline styles only (no external CSS, no scripts) using a fixed font stack and color palette — no AI, no guessing. It is a pure string template: the output is copy-paste HTML with no live email-client preview, so rendering is only confirmed inside your actual email client.',
  examples: [
    {
      title: 'Founder signature with links',
      inputs: {
        name: 'Amara Osei',
        title: 'Founder',
        company: 'Inbox Craft Co.',
        phone: '+1 555 123 4567',
        website: 'inboxcraft.co',
        socialLinks: 'LinkedIn: https://linkedin.com/in/amaraosei',
      },
      note: 'Full signature with a tel: phone link, website link, and one social link.',
    },
    {
      title: 'Minimal signature, no links',
      inputs: { name: 'Jo', title: 'Writer', company: 'Solo' },
      note: 'Only the required fields — a clean three-line signature with no contact or social rows.',
    },
  ],
  faqs: [
    {
      question: 'What is the best email signature generator?',
      answer:
        'The best email signature generator produces client-safe HTML (tables and inline styles, no external CSS) that survives Gmail, Outlook, and Apple Mail, plus a plain-text fallback. This free generator builds exactly that from your details — copy the HTML into your email client’s signature editor and always send yourself a test email.',
    },
    {
      question: 'Is there a free email signature generator?',
      answer:
        'Yes — this email signature generator is completely free with no signup. You get email-client-safe signature HTML and a plain-text version to copy into Gmail, Outlook, or any other email client.',
    },
    {
      question: 'How to generate email signature?',
      answer:
        'Enter your name, job title, and company, then optionally add your phone, website, and social links. Run the tool, copy the generated HTML, and paste it into your email client’s signature settings (usually under Settings → Signature).',
    },
    {
      question: 'How does an email signature generator work?',
      answer:
        'It takes your details and renders them into a fixed, email-client-safe HTML template — a table-based layout with inline styles — that you paste into your email client. This one is pure string templating with no live preview: the only true test is sending yourself an email and checking how it looks.',
    },
    {
      question: 'How does the email signature generator work?',
      answer:
        'Enter your details using the inputs above and the email signature generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the email signature generator free to use?',
      answer:
        'Yes - this email signature generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an email signature generator?',
      answer:
        'An email signature generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Output is copy-paste HTML built by fixed string templating — there is no live email-client preview; always send a test email to confirm rendering.',
    'One fixed professional layout and color palette; the tool does not offer theme or image/logo customization.',
    'Very long inputs are truncated with a visible notice (an HTML comment in the HTML, a bracketed note in the plain text).',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Email Signature Generator 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free email signature generator 2026: Email-client-safe HTML (table-based, inline styles) — paste it into your email client’s. Fast, private.',
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
          name: 'Email Signature Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
