import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'format',
    label: 'Book format',
    type: 'select',
    required: false,
    options: ['ebook', 'paperback'],
  },
  {
    id: 'listPrice',
    label: 'List price',
    type: 'number',
    required: true,
    placeholder: 'e.g. 4.99',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'royaltyRate70',
    label: '70% tier rate % (estimate — KDP default 70)',
    type: 'number',
    required: false,
    placeholder: '70 — edit if KDP changes it',
    validation: { min: 0, max: 100, unit: '%' },
  },
  {
    id: 'royaltyRate35',
    label: '35% tier rate % (estimate — KDP default 35)',
    type: 'number',
    required: false,
    placeholder: '35 — edit if KDP changes it',
    validation: { min: 0, max: 100, unit: '%' },
  },
  {
    id: 'bandMin',
    label: '70% band lower bound (estimate — KDP default 2.99)',
    type: 'number',
    required: false,
    placeholder: '2.99',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'bandMax',
    label: '70% band upper bound (estimate — KDP default 9.99; a $12.99 ceiling is unverified)',
    type: 'number',
    required: false,
    placeholder: '9.99',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'fileSizeMB',
    label: 'eBook file size in MB (delivery fee is charged per MB in the 70% tier)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 2 — 0 if unknown',
    validation: { min: 0, unit: 'MB' },
  },
  {
    id: 'deliveryFeePerMB',
    label: 'Delivery fee per MB, USD (estimate — KDP default 0.15)',
    type: 'number',
    required: false,
    placeholder: '0.15 — edit if KDP changes it',
    validation: { min: 0 },
  },
  {
    id: 'pageCount',
    label: 'Paperback page count (required for paperback)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 200',
    validation: { min: 0 },
  },
  {
    id: 'inkType',
    label: 'Paperback ink type (sets the per-page print rate)',
    type: 'select',
    required: false,
    options: ['bw', 'standard', 'premium'],
  },
  {
    id: 'paperbackRoyaltyRate',
    label: 'Paperback royalty % (estimate — KDP default 60; band boundary disputed)',
    type: 'number',
    required: false,
    placeholder: '60 — edit if KDP changes it',
    validation: { min: 0, max: 100, unit: '%' },
  },
  {
    id: 'printFixedFee',
    label: 'Fixed print cost per copy, USD (estimate — KDP default 1.00)',
    type: 'number',
    required: false,
    placeholder: '1.00',
    validation: { min: 0 },
  },
  {
    id: 'marketplace',
    label: 'Marketplace (same schedule applied for all in v1 — verify your territory)',
    type: 'select',
    required: false,
    options: ['US', 'UK', 'DE', 'FR', 'CA', 'AU'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'royaltyPerSale', label: 'Royalty per sale (estimate)', type: 'currency' },
  { id: 'royaltyRateApplied', label: 'Royalty rate applied', type: 'percent' },
  {
    id: 'printingCost',
    label: 'Printing cost',
    type: 'currency',
    description:
    'Paperback only — $0 for ebooks.',
  },
  {
    id: 'notice',
    label: 'Notices',
    type: 'text',
    description:
    'Explains automatic 70%/35% switches and any $0 floors.',
  },
];

const DESCRIPTION =
  'Estimate book royalties with this KDP royalty calculator — list price, royalty rate, and delivery costs modeled for USD earnings. Compare royalty.';

export const content: ToolContent = {
  title: 'KDP Royalty Calculator',
  description: DESCRIPTION,
  howTo: [
    'Choose your book format (ebook or paperback) and enter your list price.',
    'For ebooks, enter your file size in MB — the delivery fee is deducted in the 70% tier. Review the editable 70% band bounds ($2.99–$9.99 default).',
    'For paperbacks, enter your page count and ink type (B&W, standard color, premium color) to compute the printing cost.',
    'Pick your marketplace and adjust any editable rate if KDP has changed its terms.',
    'Run the calculator to see your estimated royalty per sale, the rate applied, printing cost, and any automatic tier-switch notices.',
  ],
  methodology:
    'eBook: if the list price is inside the 70% band ($2.99–$9.99 default), royalty = price × 70% − file size × delivery fee ($0.15/MB default); otherwise the 35% rate is applied automatically with a notice. Paperback: royalty = price × paperback rate (60% default) − printing cost ($1.00 fixed + pages × per-page ink rate: B&W $0.012, standard color $0.0255, premium color $0.065). Royalties are floored at $0. The $12.99 70%-ceiling claimed by one source is UNVERIFIED and not used; the paperback band boundary under $9.98 is disputed — both are disclosed as estimates, and all rates are user-editable.',
  examples: [
    {
      title: '$4.99 ebook, 2 MB file',
      inputs: { format: 'ebook', listPrice: 4.99, fileSizeMB: 2 },
      note: '70% tier: $4.99 × 70% − 2 × $0.15 = $3.19 royalty per sale (estimate).',
    },
    {
      title: '$14.99 paperback, 200 pages B&W',
      inputs: { format: 'paperback', listPrice: 14.99, pageCount: 200, inkType: 'bw' },
      note: 'Printing cost $3.40; royalty $14.99 × 60% − $3.40 = $5.59 per sale (estimate).',
    },
    {
      title: '$1.99 ebook outside the band',
      inputs: { format: 'ebook', listPrice: 1.99, fileSizeMB: 0 },
      note: 'Price is below $2.99, so the 35% rate auto-applies with a notice: $0.70 royalty per sale (estimate).',
    },
  ],
  faqs: [
    {
      question: 'What is the best kdp royalty calculator?',
      answer:
        'A good KDP royalty calculator handles both ebooks (70%/35% price bands plus the delivery fee) and paperbacks (printing cost by page count and ink type), and says which rate it applied. This free calculator does that — with editable rates labeled as estimates.',
    },
    {
      question: 'Is there a free kdp royalty calculator?',
      answer:
        'Yes — this KDP royalty calculator is completely free with no signup. Enter your list price and format details to get an estimated per-sale royalty.',
    },
    {
      question: 'How to calculate kdp royalty?',
      answer:
        'For ebooks priced $2.99–$9.99, multiply the price by 70% and subtract the delivery fee (file size × $0.15/MB); other prices use 35%. For paperbacks, multiply the price by 60% and subtract the printing cost ($1.00 plus pages × the ink rate).',
    },
    {
      question: 'Why does this calculator say the $12.99 ceiling is unverified?',
      answer:
        'One source claimed the 70% tier extends to $12.99, but that claim could not be verified against KDP\'s public terms, so this tool does not present it as fact. The editable band upper bound defaults to $9.99 — if KDP confirms a different ceiling, type it in yourself.',
    },
    {
      question: 'How much royalty does Amazon KDP pay in 2026?',
      answer:
        'For ebooks priced $2.99-$9.99, KDP pays 70% royalty (minus delivery costs). Books outside that range earn 35%. Paperbacks earn 60% of list price minus printing costs. This calculator handles all formats with current rates.',
    },
    {
      question: 'What is the KDP delivery cost per MB?',
      answer:
        'Amazon charges a delivery fee of $0.15 per MB for ebooks in the 70% royalty tier (based on file size). A 3MB book costs $0.45 in delivery fees, deducted from your royalty. This calculator factors it in automatically.',
    },
    {
      question: 'Is KDP Select worth it for royalties?',
      answer:
        'KDP Select requires exclusivity but gives access to Kindle Unlimited page-read royalties (KENP) plus promotional tools. Whether it is worth it depends on your genre — wide distribution often earns more for established authors, while KU can boost new authors.',
    },
  ],
  assumptions: [
    'All royalty rates and band bounds are user-editable ESTIMATES — KDP terms change; verify current terms on KDP before publishing decisions.',
    'The 70% band default ($2.99–$9.99) follows the public KDP schedule; a claimed $12.99 ceiling is UNVERIFIED and is not used as a default.',
    'Paperback royalty band boundary under $9.98 is disputed across sources — the 60% default is an estimate.',
    'Delivery fees apply only inside the 70% tier and are deducted before the royalty is floored at $0.',
    'Same schedule is applied for every marketplace in v1 — KDP terms can differ by territory.',
    'KU (Kindle Unlimited) page-read revenue is not included — treat it as a separate line.',
  ],
  jsonLd: [],
};
