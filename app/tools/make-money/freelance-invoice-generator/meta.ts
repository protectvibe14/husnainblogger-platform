import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: "freelancerName",
    label: "Your name (freelancer)",
    type: "text",
    required: true,
    placeholder: "e.g. Ayesha Khan",
  },
  {
    id: "clientName",
    label: "Client name",
    type: "text",
    required: true,
    placeholder: "e.g. Acme Corp",
  },
  {
    id: "lineItems",
    label: "Line items (one per line)",
    type: "textarea",
    required: true,
    placeholder: "Logo design | 1 | 500\nRevisions | 2 | 50",
  },
  {
    id: "taxRatePct",
    label: "Tax rate (%)",
    type: "number",
    required: false,
    placeholder: "e.g. 10",
    validation: { min: 0, max: 100 },
  },
  {
    id: "invoiceNumber",
    label: "Invoice number (optional — auto-generated if blank)",
    type: "text",
    required: false,
    placeholder: "e.g. INV-001",
  },
  {
    id: "issueDate",
    label: "Issue date (optional — defaults to today)",
    type: "date",
    required: false,
  },
  {
    id: "dueDate",
    label: "Due date",
    type: "date",
    required: true,
  },
  {
    id: "currency",
    label: "Currency code (optional — defaults to USD)",
    type: "text",
    required: false,
    placeholder: "USD",
  },
  {
    id: "notes",
    label: "Notes (optional — e.g. payment instructions)",
    type: "textarea",
    required: false,
    placeholder: "e.g. Pay via bank transfer within 30 days.",
  },
];

export const outputs: ToolOutput[] = [
  { id: "invoiceDocument", label: "Invoice document (copy / print)", type: "copy" },
  { id: "subtotal", label: "Subtotal", type: "currency" },
  { id: "taxAmount", label: "Tax amount", type: "currency" },
  { id: "total", label: "Total due", type: "currency" },
  { id: "warnings", label: "Warnings", type: "list" },
];

export const content: ToolContent = {
  title: "Freelance Invoice Generator",
  description:
    "Free freelance invoice generator 2026: generate a freelance invoice with this free invoice generator. Add line items, tax and. Fast, private - try.",
  howTo: [
    "Enter your name and the client's name.",
    "Add line items in the box, one per line, as: description | quantity | rate (e.g. \"Logo design | 1 | 500\").",
    "Set the tax rate percent, invoice number (or leave blank for an auto-generated one), and the due date.",
    "Generate the invoice: the tool builds the document, subtotal, tax, and total — copy or print it from your browser.",
    "Review any warnings shown (e.g. a 100% tax rate) before sending the invoice to your client.",
  ],
  methodology:
    "The generator computes each line as quantity × rate, sums the lines into a subtotal, " +
    "applies tax as a single flat percent, and totals subtotal + tax — all arithmetic runs " +
    "client-side on your inputs with no external data. Dates are UTC calendar dates; " +
    "due date = issue date + payment terms days. A blank invoice number is auto-generated " +
    "deterministically from the invoice content.",
  examples: [
    {
      title: "Design project invoice",
      inputs: {
        freelancerName: "Ayesha Khan",
        clientName: "Acme Corp",
        lineItems: "Logo design | 1 | 500\nRevisions | 2 | 50",
        taxRatePct: 10,
        dueDate: "2026-10-31",
      },
      note: "Subtotal 600, tax 60, total 660.",
    },
    {
      title: "Hourly consulting invoice",
      inputs: {
        freelancerName: "Bilal Ahmed",
        clientName: "Beta LLC",
        lineItems: "SEO audit | 12 | 75",
        taxRatePct: 0,
        invoiceNumber: "INV-042",
        dueDate: "2026-11-15",
      },
      note: "Single hourly line, no tax, custom invoice number.",
    },
  ],
  faqs: [
    {
      question: "What is the best freelance invoice generator?",
      answer:
        "A good one keeps the math transparent: line items, a flat tax rate, and clear totals you can verify. This free generator builds a printable invoice document client-side with copyable output and warnings for edge cases.",
    },
    {
      question: "Is there a free freelance invoice generator?",
      answer:
        "Yes — this generator is free to use with no sign-up. It creates the invoice document, subtotal, tax, and total entirely in your browser.",
    },
    {
      question: "How to generate freelance invoice?",
      answer:
        "Enter your and your client's names, add one line per billable item as \"description | quantity | rate\", set the tax rate and due date, then generate. Copy the document and send or print it.",
    },
    {
      question: "How does a freelance invoice generator work?",
      answer:
        "It multiplies each line's quantity by its rate, sums the lines into a subtotal, adds a flat tax percent, and renders the document with dates and an invoice number. Everything runs client-side — your data never leaves your browser.",
    },
    {
      question: 'What is a freelance invoice generator?',
      answer:
        'A freelance invoice generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'What should I include on a freelance invoice?',
      answer: 'Include your business name and contact, client details, unique invoice number, issue and due dates, itemized services with rates, subtotal, tax if applicable, total due, and payment terms.',
    },
    {
      question: 'How do I number my invoices?',
      answer: 'Use sequential numbering like INV-001, INV-002. This keeps records organized and helps track which invoices are paid or overdue.',
    },
    {
      question: 'What payment terms should I set?',
      answer: 'Net 14 or Net 30 are standard. For new clients, consider requiring 50% upfront. Always state late payment fees clearly on the invoice.',
    },
    {
      question: 'Should I charge tax on freelance invoices?',
      answer: 'Depends on your location and client location. Research your local tax obligations — this tool includes a tax line item you can adjust or remove.',
    },
      {
      question: 'How do I create freelance invoice generator?',
      answer: 'Describe what you need in the input fields, then click generate. You can regenerate as many times as you like and copy the version that fits best.',
    },
    {
      question: 'What makes a good freelance invoice generator?',
      answer: 'Clarity, specificity, and relevance to your audience. Avoid generic phrases — the more specific your input, the better the output.',
    },
  ],
  assumptions: [
    "Discount, if any, is applied BEFORE tax (flat discount on the subtotal, then tax on the remainder) — a documented convention, not a tax rule.",
    "Tax is a single flat percentage. Multi-rate or jurisdiction-specific rules (e.g. VAT reverse charge) are NOT modeled — set the correct rate yourself.",
    "All amounts, dates, and rates are user-provided. The invoice is only as correct as its inputs; this tool performs no tax or legal validation.",
    "The document is rendered as plain text for copying; use your browser's print-to-PDF for a PDF copy.",
  ],
  jsonLd: [],
};
