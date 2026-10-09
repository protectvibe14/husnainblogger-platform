import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/proposal-template-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'clientName',
    label: 'Client name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Acme Studio',
  },
  {
    id: 'projectTitle',
    label: 'Project title',
    type: 'text',
    required: true,
    placeholder: 'e.g. Brand refresh',
  },
  {
    id: 'approach',
    label: 'Your approach (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'How you will tackle the project and why you are the right fit',
  },
  {
    id: 'deliverables',
    label: 'Deliverables — one per line (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'New logo\nBrand guidelines PDF\nSocial media kit',
  },
  {
    id: 'timeline',
    label: 'Timeline (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. 4 weeks, with weekly check-ins',
  },
  {
    id: 'investment',
    label: 'Investment (number, your currency)',
    type: 'number',
    required: true,
    validation: { min: 0 },
  },
  {
    id: 'termsSummary',
    label: 'Terms summary (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'e.g. 50% deposit, 50% on delivery; 2 revision rounds',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'proposal',
    label: 'Proposal document (copy)',
    type: 'copy',
    description: 'Free freelance proposal template 2026: The full sectioned proposal: overview, deliverables, timeline, investment, terms, next. Fast, private, no signup - try!',
  },
];

export const content: ToolContent = {
  title: 'Freelance Proposal Template',
  description:
    'Write a freelance proposal template in minutes: enter the client, project, deliverables, and investment to get a sectioned, client-ready proposal. Free.',
  howTo: [
    'Enter the client name and your project title.',
    'Describe your approach — how you will tackle the project.',
    'List deliverables one per line, and add your timeline.',
    'Enter the investment as a number (0 or more); add your currency before sending.',
    'Summarize your terms, then copy the finished proposal and fill the [bracketed] placeholders.',
  ],
  methodology:
    'This is template assembly, not copywriting: your client name, project title, approach, deliverables, timeline, investment, and terms are placed into a fixed proposal structure (overview, deliverables, timeline, investment, terms, next steps). It invents no pricing, no scope, and no legal terms — sections you skip become visible [placeholders] to complete before sending.',
  examples: [
    {
      title: 'Brand refresh for a studio',
      inputs: {
        clientName: 'Acme Studio',
        projectTitle: 'Brand refresh',
        approach: 'I will audit the current identity, present 2 creative directions, then build the full system.',
        deliverables: 'New logo\nBrand guidelines PDF\nSocial media kit',
        timeline: '4 weeks, with weekly check-ins',
        investment: 2500,
        termsSummary: '50% deposit, 50% on delivery; 2 revision rounds included.',
      },
      note: 'Deliverables become a bullet list; investment is shown with your currency to add.',
    },
    {
      title: 'Minimal input — placeholders show',
      inputs: {
        clientName: 'Northbeam',
        projectTitle: 'Onboarding email sequence',
        investment: 1200,
      },
      note: 'Skipped sections appear as [bracketed] placeholders so nothing ships half-finished.',
    },
  ],
  faqs: [
    {
      question: 'What is the best freelance proposal template?',
      answer:
        'The best one covers scope, not just price: overview, deliverables, timeline, investment, terms, and next steps. This free generator assembles exactly that document from your details — unlike a bare quote, which is only a price list.',
    },
    {
      question: 'Is there a free freelance proposal template?',
      answer:
        'Yes — this generator is completely free with no signup. Enter the client, project, and investment to get a sectioned, client-ready proposal instantly.',
    },
    {
      question: 'How to use freelance proposal?',
      answer:
        'Enter the client name, project title, and investment (a number, 0 or more). Add your approach, deliverables, timeline, and terms, then copy the document and fill in the [bracketed] placeholders — your name, date, and currency — before sending.',
    },
    {
      question: 'How does a freelance proposal template work?',
      answer:
        'It does not write or price anything for you. It places your inputs into a fixed proposal structure and marks anything you skipped as a visible placeholder. It is not a contract and not legal advice — have a qualified professional review your agreements.',
    },
    {
      question: 'How does the freelance proposal template work?',
      answer:
        'Enter your details using the inputs above and the freelance proposal template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the freelance proposal template free to use?',
      answer:
        'Yes - this freelance proposal template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a freelance proposal template?',
      answer:
        'A freelance proposal template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The tool invents no pricing, scope, or legal terms — skipped sections become visible placeholders.',
    'Investment is shown without a currency; add yours before sending.',
    'This is not a contract and not legal advice.',
    'Unlike a price-only quote, a proposal documents scope and approach — use both together.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Freelance Proposal Template 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free freelance proposal template 2026: The full sectioned proposal: overview, deliverables, timeline, investment, terms, next. Fast, private, no signup - try!',
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
          name: 'Proposal Template Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
