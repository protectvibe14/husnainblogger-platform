import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/billable-hours-invoice-builder/';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'description',
    label: 'Work description',
    type: 'text',
    required: true,
    placeholder: 'e.g. Logo design revisions',
  },
  {
    id: 'hours',
    label: 'Hours',
    type: 'text',
    required: true,
    placeholder: 'e.g. 4.5',
  },
  {
    id: 'rate',
    label: 'Hourly rate (USD)',
    type: 'text',
    required: true,
    placeholder: 'e.g. 80',
  },
  {
    id: 'clientName',
    label: 'Client name (first line only)',
    type: 'text',
    required: false,
    placeholder: 'e.g. Acme Corp',
  },
  {
    id: 'invoiceNumber',
    label: 'Invoice number (first line only)',
    type: 'text',
    required: false,
    placeholder: 'e.g. INV-001',
  },
  {
    id: 'dueDate',
    label: 'Due date (first line only)',
    type: 'text',
    required: false,
    placeholder: 'e.g. 2026-11-01',
  },
  {
    id: 'taxRatePct',
    label: 'Tax rate % (first line only; empty = no tax)',
    type: 'text',
    required: false,
    placeholder: 'e.g. 7.5',
  },
  {
    id: 'paymentDetails',
    label: 'Payment details (first line only)',
    type: 'text',
    required: false,
    placeholder: 'e.g. Bank transfer to ...',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'invoiceDocument',
    label: 'Invoice document',
    type: 'copy',
    description:
    'Free billable hours tracker for freelancers 2026: Itemized, printable invoice text ready to copy. Get instant results. free now.',
  },
  {
    id: 'subtotal',
    label: 'Subtotal',
    type: 'currency',
    description:
    'Sum of all line totals before tax.',
  },
  {
    id: 'taxAmount',
    label: 'Tax amount',
    type: 'currency',
    description:
    'Tax on the subtotal, only when you entered a tax rate.',
  },
  {
    id: 'totalDue',
    label: 'Total due',
    type: 'currency',
    description:
    'Subtotal plus tax.',
  },
];

export const content: ToolContent = {
  title: 'Billable Hours Tracker for Freelancers',
  description:
    'Build professional freelance invoices free — itemized, printable invoice text ready to copy in seconds. Build yours today!',
  howTo: [
    'Add one line per piece of work: a description, the hours spent, and your hourly rate in USD.',
    'On the FIRST line only, fill in the client name, invoice number, due date, payment details, and (optionally) your tax rate % — these apply to the whole invoice.',
    'Leave the tax rate empty if no tax applies: the tool adds no tax line and never assumes 0%.',
    'Run the tool to get the itemized invoice document plus subtotal, tax amount, and total due.',
    'Copy the invoice document and send it to your client.',
  ],
  methodology:
    'Formula J-BILLABLE-INVOICE: each line total = hours × rate; subtotal = sum of line totals; tax = subtotal × tax rate % / 100 only when you entered a rate (an empty tax field means no tax line, not 0%); total due = subtotal + tax. All money values are rounded to 2 decimals. The document is assembled from a fixed template — no AI writes anything, and no tax rates are pre-filled.',
  faqs: [
    {
      question: 'What is the best billable hours tracker for freelancers?',
      answer:
        'The best tracker is the one you will actually fill in after every work session. This free builder turns your tracked hours into an itemized invoice: add each task’s hours and rate, optionally add your tax rate, and get a copy-ready invoice document.',
    },
    {
      question: 'Is there a free billable hours tracker for freelancers?',
      answer:
        'Yes — this invoice builder is completely free with no signup. Add unlimited line items with hours and rates, and it computes subtotal, tax, and total due for you.',
    },
    {
      question: 'How to track billable hours tracker for freelancers?',
      answer:
        'Log each task with its hours as you work, then paste them here as line items with your hourly rate. Fill the client name, invoice number, and due date once on the first line, add your tax rate if one applies, and run the tool to get your invoice.',
    },
    {
      question: 'What is a billable hours tracker for freelancers?',
      answer:
        'A billable hours tracker for freelancers is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the billable hours tracker for freelancers?',
      answer:
        'No account needed. Open the billable hours tracker for freelancers, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'The tax rate is entered by you only — nothing is pre-filled, and an empty tax rate means no tax line (not 0%). This is not tax advice; check your local tax rules.',
    'Client name, invoice number, due date, payment details, and tax rate are read from the first line item only and apply to the whole invoice.',
    'All amounts are rounded to 2 decimals; totals are computed from your hours and rates only.',
  ],
  jsonLd: [],
};
