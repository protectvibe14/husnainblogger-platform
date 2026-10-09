import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/logo-design-quote-builder/';

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [
  {
    id: 'itemizedQuote',
    label: 'Itemized quote',
    type: 'table',
    description:
    'Design fee plus every line item, ending with the quote total.',
  },
  {
    id: 'quoteDocument',
    label: 'Quote document (client-ready)',
    type: 'copy',
    description:
    'Plain-text quote you can paste into an email or invoice.',
  },
];

// Global quote settings are read from the first row only; every row adds one
// line item (description, quantity, unit price).
export const itemFields: BuilderField[] = [
  { id: 'conceptsCount', label: 'Number of concepts (whole number, min 1)', type: 'text', required: true, placeholder: '3' },
  { id: 'revisionRounds', label: 'Revision rounds included (whole number)', type: 'text', required: true, placeholder: '2' },
  { id: 'deliverableFormats', label: 'Deliverable formats (comma-separated)', type: 'text', required: true, placeholder: 'AI, EPS, PNG, SVG' },
  { id: 'baseRate', label: 'Your per-concept base rate (USD)', type: 'text', required: true, placeholder: '200' },
  { id: 'rushAddOn', label: 'Rush delivery requested?', type: 'text', placeholder: 'yes or no' },
  { id: 'usageScope', label: 'Usage scope', type: 'text', required: true, placeholder: 'exclusive | extended | full-buyout' },
  { id: 'itemDescription', label: 'Line item description', type: 'text', required: true, placeholder: 'e.g. Brand guidelines mini-book' },
  { id: 'quantity', label: 'Quantity', type: 'text', required: true, placeholder: '1' },
  { id: 'unitPrice', label: 'Unit price (USD)', type: 'text', required: true, placeholder: '150.00' },
];

const DESCRIPTION =
  'Free logo design quote template 2026: Design fee plus every line item, ending with the quote total. Get instant results. No signup - try it free now!';

export const content: ToolContent = {
  title: 'Logo Design Quote Template',
  description: DESCRIPTION,
  howTo: [
    'On the first row, enter your quote settings: number of concepts, revision rounds, deliverable formats, your per-concept base rate, rush (yes/no), and usage scope.',
    'Add one row per extra line item — a description, quantity, and your unit price.',
    'Click Build to itemize the quote: design fee plus every line item and the total.',
    'Copy the client-ready quote document and paste it into your email or invoice.',
  ],
  methodology:
    'The design fee is your per-concept base rate multiplied by your number of concepts; each line item is quantity × your unit price; the sum is the quote total. A requested rush delivery is recorded as a note — the tool adds no rush surcharge because it knows no market rates. Everything in the quote comes from your own inputs.',
  faqs: [
    {
      question: 'What is the best logo design quote template?',
      answer:
        'The best template itemizes your design fee, every extra line item, revisions, deliverables, and usage scope in one document you can send a client. This builder assembles exactly that from your own rates — free, with no invented prices.',
    },
    {
      question: 'Is there a free logo design quote template?',
      answer:
        'Yes — this logo design quote builder is completely free with no signup. Build as many itemized quotes as you need and copy the client-ready document each time.',
    },
    {
      question: 'How to use logo design quote?',
      answer:
        'Enter your settings on the first row — concepts, revisions, formats, your base rate, rush, and usage scope — then add one row per extra line item with quantity and unit price. The tool itemizes everything and produces a quote document you can send to your client.',
    },
    {
      question: 'How does the logo design quote template work?',
      answer:
        'Enter your details using the inputs above and the logo design quote template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the logo design quote template free to use?',
      answer:
        'Yes - this logo design quote template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a logo design quote template?',
      answer:
        'A logo design quote template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the logo design quote template?',
      answer:
        'No account needed. Open the logo design quote template, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'The per-concept base rate, line-item prices, and rush surcharge are all yours to set — the tool invents no market prices.',
    'A rush request is noted, not priced: agree the rush surcharge with your client before quoting.',
    'Usage scope labels describe the option you picked; they are not legal terms — put final terms in your contract.',
    'The quote total is an ESTIMATE assembled from your inputs, not a binding offer.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Logo Design Quote Template 2026 – Free | HusnainBlogger',
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
          name: 'Logo Design Quote Builder',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
