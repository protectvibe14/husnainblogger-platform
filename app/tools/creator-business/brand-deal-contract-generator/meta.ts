import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/brand-deal-contract-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'brandName',
    label: 'Brand name',
    type: 'text',
    required: true,
    placeholder: 'GlowCo',
  },
  {
    id: 'creatorName',
    label: 'Creator name / channel name',
    type: 'text',
    required: true,
    placeholder: 'Ayesha Khan',
  },
  {
    id: 'deliverables',
    label: 'Deliverables (one per line)',
    type: 'textarea',
    required: true,
    placeholder: '2 x Instagram Reel | launch teaser\n3 x Instagram Story',
  },
  {
    id: 'feeAmount',
    label: 'Total fee (USD)',
    type: 'number',
    required: true,
    placeholder: '1500',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'paymentTerms',
    label: 'Payment terms',
    type: 'select',
    required: true,
    options: [
      '50% upfront / 50% on delivery',
      '100% on delivery',
      'Net 30',
      'Net 15',
      '100% upfront',
    ],
  },
  {
    id: 'usageRightsSummary',
    label: 'Usage rights',
    type: 'select',
    required: true,
    options: [
      'Organic social only (30 days)',
      'Organic social only (perpetual)',
      'Paid whitelisting (30 days)',
      'Paid whitelisting (90 days)',
      'Full buyout (perpetual)',
    ],
  },
  {
    id: 'timelineDates',
    label: 'Delivery window',
    type: 'text',
    required: true,
    placeholder: '2026-11-01 to 2026-11-30',
  },
  {
    id: 'revisionLimit',
    label: 'Revision rounds included',
    type: 'number',
    required: false,
    placeholder: '2',
    validation: { min: 0 },
  },
  {
    id: 'exclusivityClause',
    label: 'Exclusivity clause (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'skincare, 90 days',
  },
  {
    id: 'killFeePct',
    label: 'Kill fee, % of fee (optional)',
    type: 'number',
    required: false,
    placeholder: '50',
    validation: { min: 0, max: 100 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'contractText',
    label: 'Contract draft (copy)',
    type: 'copy',
    description: 'Free brand deal contract template 2026: Sectioned contract draft with your terms filled in — includes the not-legal-advice. Fast, private, no signup - try it!',
  },
  {
    id: 'contractSummary',
    label: 'Deal summary',
    type: 'text',
    description: 'One-line plain-English summary of the deal.',
  },
  {
    id: 'warnings',
    label: 'Review flags',
    type: 'list',
    description: 'Items to double-check, e.g. gifted collaborations or long exclusivity.',
  },
];

export const content: ToolContent = {
  title: 'Brand Deal Contract Template',
  description:
    'Generate a brand deal contract draft from your deal terms — parties, deliverables, compensation, usage rights, and more. Template only, not legal advice. Free!',
  howTo: [
    'Enter the brand name and your creator name or channel name.',
    'List the deliverables one per line, e.g. "2 x Instagram Reel | launch teaser" (quantity and notes are optional).',
    'Enter the total fee, pick the payment terms, and choose the usage rights option.',
    'Set the delivery window like "2026-11-01 to 2026-11-30", plus revision rounds, an optional exclusivity clause, and an optional kill fee percent.',
    'Run the generator and copy the sectioned contract draft — then review every clause with an attorney before signing.',
  ],
  methodology:
    'Client-side template assembly with variable substitution — no AI and no legal research. Deliverable types, usage-rights options, and payment terms come from fixed lists; unknown values are rejected. Dates are ISO YYYY-MM-DD, money rounds to the nearest cent, and a kill-fee clause is inserted when you set a kill fee percent. The output is an outline with template wording only.',
  examples: [
    {
      title: 'Reel + stories deal',
      inputs: {
        brandName: 'GlowCo',
        creatorName: 'Ayesha Khan',
        deliverables: '2 x Instagram Reel | launch teaser\n3 x Instagram Story',
        feeAmount: 1500,
        paymentTerms: '50% upfront / 50% on delivery',
        usageRightsSummary: 'Paid whitelisting (90 days)',
        timelineDates: '2026-11-01 to 2026-11-30',
        revisionLimit: 2,
        killFeePct: 50,
      },
      note: 'Produces a sectioned draft with a 50% kill fee clause and the not-legal-advice disclaimer.',
    },
    {
      title: 'Gifted collaboration',
      inputs: {
        brandName: 'GlowCo',
        creatorName: 'Ayesha Khan',
        deliverables: '1 x TikTok Video',
        feeAmount: 0,
        paymentTerms: '100% on delivery',
        usageRightsSummary: 'Organic social only (30 days)',
        timelineDates: '2026-11-01 to 2026-11-15',
      },
      note: 'A fee of 0 is flagged as a gifted / product-only collaboration.',
    },
    {
      title: 'Exclusivity included',
      inputs: {
        brandName: 'GlowCo',
        creatorName: 'Ayesha Khan',
        deliverables: '1 x YouTube Video',
        feeAmount: 3000,
        paymentTerms: 'Net 30',
        usageRightsSummary: 'Full buyout (perpetual)',
        timelineDates: '2026-11-01 to 2026-12-31',
        exclusivityClause: 'skincare, 90 days',
      },
      note: 'Adds an Exclusivity section; long exclusivity is flagged for attorney review.',
    },
  ],
  faqs: [
    {
      question: 'What is the best brand deal contract template?',
      answer:
        'The best brand deal contract template covers parties, deliverables, compensation, usage rights, timeline, revisions, exclusivity, and termination — and reminds you it is not legal advice. This tool assembles all of those sections from your deal terms as a structured draft you can copy and review.',
    },
    {
      question: 'Is there a free brand deal contract template?',
      answer:
        'Yes — this brand deal contract generator is completely free with no signup. Enter your deal terms and get a sectioned contract draft instantly, ready to review with an attorney.',
    },
    {
      question: 'How to use brand deal contract?',
      answer:
        'Enter the parties, deliverables, fee, payment terms, usage rights, and delivery dates, then copy the generated draft. Treat it as a starting outline — fill in legal names, addresses, governing law, and signatures, and have an attorney review it before anyone signs.',
    },
    {
      question: 'How does a brand deal contract template work?',
      answer:
        'It fills fixed template clauses with your values — no AI and no legal research. Deliverable types, usage-rights options, and payment terms come from fixed lists, dates use ISO format, and a kill-fee clause is added when you set one. The output always carries a "template only — not legal advice" disclaimer.',
    },
    {
      question: 'How does the brand deal contract template work?',
      answer:
        'Enter your details using the inputs above and the brand deal contract template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the brand deal contract template free to use?',
      answer:
        'Yes - this brand deal contract template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a brand deal contract template?',
      answer:
        'A brand deal contract template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Template only — not legal advice. Consult a licensed attorney before signing.',
    'The draft is jurisdiction-neutral; it makes no claims about any country\'s contract law.',
    'Fill in full legal names, addresses, governing law, and signatures in the final agreement.',
    'Advertising disclosure rules vary by country — confirm the local requirements.',
    'Review every clause before use; usage-rights pricing is not included in the draft.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Brand Deal Contract Template 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free brand deal contract template 2026: Sectioned contract draft with your terms filled in — includes the not-legal-advice. Fast, private, no signup - try it!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Creator Business',
          item: 'https://husnainblogger.com/tools/creator-business/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Brand Deal Contract Template',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
