import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/online-coach-package-builder/';

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [
  {
    id: 'packagePrice',
    label: 'Package price (estimate)',
    type: 'currency',
    description: 'Final package price with your discount applied.',
  },
  {
    id: 'packageTiers',
    label: 'Package tiers',
    type: 'table',
    description: 'Starter / Standard / Premium tiers derived from your numbers.',
  },
  {
    id: 'packageDescription',
    label: 'Package description (client-ready)',
    type: 'copy',
    description: 'Plain-text offer you can paste into a sales page or DM.',
  },
];

// Global package settings are read from the first row only; every row adds
// one support add-on (description + your price, 0 if unpriced).
export const itemFields: BuilderField[] = [
  { id: 'packageName', label: 'Package name (optional)', type: 'text', placeholder: 'e.g. Clarity Sprint' },
  { id: 'sessionsPerPackage', label: 'Sessions per package (whole number, min 1)', type: 'text', required: true, placeholder: '8' },
  { id: 'sessionLengthMin', label: 'Session length (minutes)', type: 'text', required: true, placeholder: '60' },
  { id: 'pricePerSession', label: 'Your price per session (USD)', type: 'text', required: true, placeholder: '75' },
  { id: 'packageDiscountPct', label: 'Package discount (%)', type: 'text', required: true, placeholder: '10' },
  { id: 'addOnDescription', label: 'Add-on description', type: 'text', required: true, placeholder: 'e.g. Voxer support between sessions' },
  { id: 'addOnPrice', label: 'Add-on price (USD; 0 if unpriced)', type: 'text', required: true, placeholder: '150' },
];

const DESCRIPTION =
  'Free coaching package pricing 2026: Final package price with your discount applied. Instant, private, and mobile-friendly. No signup - try it free!';

export const content: ToolContent = {
  title: 'Coaching Package Pricing Builder 2027',
  description: DESCRIPTION,
  howTo: [
    'On the first row, enter your package settings: name, sessions per package, session length in minutes, your price per session, and your package discount percent.',
    'Add one row per support add-on — a description and your price (0 if the package has no paid add-ons).',
    'Click Build to get the package price, three derived tiers, and a client-ready description.',
    'Copy the package description into your sales page, proposal, or DM.',
  ],
  methodology:
    'The session total is your sessions per package × your price per session; add-on prices are added to reach the undiscounted price; your discount percent is applied for the final package price. The Starter/Standard/Premium tiers are the same arithmetic sliced three ways — sessions only, sessions + add-ons, and sessions + add-ons with your discount. Every rate is user-provided; no coaching market prices are used.',
  faqs: [
    {
      question: 'What is the best coaching package pricing?',
      answer:
        'The best coaching package pricing starts from your own numbers — your session price, your support add-ons, and the discount you choose to offer. This builder prices exactly that and drafts a client-ready offer, free.',
    },
    {
      question: 'Is there a free coaching package pricing?',
      answer:
        'Yes — this coaching package builder is completely free with no signup. Build as many package offers and tier combinations as you like.',
    },
    {
      question: 'How to use coaching package pricing?',
      answer:
        'Enter your package settings on the first row — sessions, session length, your price per session, and your discount — then add one row per support add-on with your price. The tool computes the package price, three tiers, and a description you can send to clients.',
    },
    {
      question: 'How does the coaching package pricing work?',
      answer:
        'Enter your details using the inputs above and the coaching package pricing calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the coaching package pricing free to use?',
      answer:
        'Yes - this coaching package pricing is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a coaching package pricing?',
      answer:
        'A coaching package pricing is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the coaching package pricing?',
      answer:
        'No account needed. Open the coaching package pricing, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'All session prices, add-on prices, and the discount are yours — the tool knows no coaching market rates.',
    'The three tiers are derived from your own numbers, not prescribed package structures.',
    'The package price is an ESTIMATE for your planning, not a binding offer — put final terms in your client agreement.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Coaching Package Pricing Builder 2026 | HusnainBlogger',
      url: TOOL_URL,
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
          name: 'Creator Business Tools',
          item: 'https://husnainblogger.com/tools/creator-business/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Online Coach Package Builder',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
