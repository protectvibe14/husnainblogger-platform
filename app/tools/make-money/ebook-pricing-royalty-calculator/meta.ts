import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'format',
    label: 'Format',
    type: 'select',
    required: true,
    options: ['kindle_ebook', 'paperback'],
  },
  {
    id: 'listPrice',
    label: 'List price (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 9.99',
    validation: { min: 0.01, unit: 'USD' },
  },
  {
    id: 'fileSizeMB',
    label: 'eBook file size (MB)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 5 — eBook only',
    validation: { min: 0, unit: 'MB' },
  },
  {
    id: 'pageCount',
    label: 'Page count',
    type: 'number',
    required: false,
    placeholder: 'e.g. 200 — paperback only',
    validation: { min: 1 },
  },
  {
    id: 'inkType',
    label: 'Ink type (paperback)',
    type: 'select',
    required: false,
    options: ['bw', 'standard', 'premium'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'royaltyPerSale', label: 'Royalty per sale', type: 'currency' },
  { id: 'royaltyRate', label: 'Royalty rate', type: 'percent' },
  { id: 'printCost', label: 'Printing cost (paperback)', type: 'currency' },
  { id: 'note', label: 'Schedule note', type: 'text' },
];

const DESCRIPTION =
  'See the per-sale royalty for your Kindle eBook or paperback under the KDP schedule with this free ebook pricing calculator. Verify rates first.';

export const content: ToolContent = {
  title: 'eBook Pricing Calculator',
  description: DESCRIPTION,
  howTo: [
    'Choose your format: Kindle eBook or paperback.',
    'Enter your list price in USD (must be above $0).',
    'For an eBook, enter the file size in MB — the $0.15/MB delivery fee applies inside the 70% band.',
    'For a paperback, enter the page count and pick the ink type — printing cost is $1.00 plus a per-page rate.',
    'Compare royalties at different prices, then verify the current schedule with Amazon before you publish.',
  ],
  methodology:
    'Kindle eBook: 70% of list price minus a $0.15/MB delivery fee when priced $2.99–$9.99; otherwise 35% of list price (floored at $0). Paperback: 60% of list price minus printing cost ($1.00 + pages × per-page rate: B&W $0.012, standard color $0.0255, premium color $0.065). Money rounds half-up to 2 decimals. Royalty schedules change per retailer — the result always reminds you to verify the current KDP schedule with Amazon.',
  examples: [
    {
      title: '$9.99 eBook, 5 MB file',
      inputs: { format: 'kindle_ebook', listPrice: 9.99, fileSizeMB: 5 },
      note: '70% band: $9.99 × 70% − $0.75 delivery = $6.24 royalty per sale.',
    },
    {
      title: '$19.99 paperback, 200 pages B&W',
      inputs: { format: 'paperback', listPrice: 19.99, pageCount: 200, inkType: 'bw' },
      note: '60% minus $3.40 print cost = $8.59 royalty per sale (42.97% effective rate).',
    },
    {
      title: '$14.99 eBook (35% band)',
      inputs: { format: 'kindle_ebook', listPrice: 14.99 },
      note: 'Above $9.99 the 70% rate no longer applies: $14.99 × 35% = $5.25 per sale.',
    },
  ],
  faqs: [
    {
      question: 'What is the best ebook pricing calculator?',
      answer:
        'The best one shows the royalty schedule it uses and tells you to verify it: this free calculator applies the KDP-style schedule (70% in $2.99–$9.99 minus delivery fee; 35% outside; 60% minus print cost for paperback) and reminds you that schedules change — verify with Amazon before pricing.',
    },
    {
      question: 'Is there a free ebook pricing calculator?',
      answer:
        'Yes — this ebook pricing calculator is completely free with no signup. Pick Kindle eBook or paperback, enter your list price (plus file size or page count and ink type), and see your per-sale royalty instantly.',
    },
    {
      question: 'How to calculate ebook pricing?',
      answer:
        'Work backwards from the royalty schedule: in the $2.99–$9.99 band you keep 70% minus $0.15/MB delivery, outside it you keep 35%; paperbacks keep 60% minus printing cost. Enter candidate prices in this calculator to compare what you actually earn per sale at each price.',
    },
    {
      question: 'What is the KDP 70% royalty band?',
      answer:
        'In the schedule this calculator uses, Kindle eBooks priced $2.99–$9.99 earn a 70% royalty minus a $0.15/MB delivery fee; prices outside that band earn 35%. This schedule can change — always verify the current band with Amazon KDP before you set your price.',
    },
    {
      question: 'How does the ebook pricing calculator work?',
      answer:
        'Enter your details using the inputs above and the ebook pricing calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ebook pricing calculator free to use?',
      answer:
        'Yes - this ebook pricing calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an ebook pricing calculator?',
      answer:
        'An ebook pricing calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Implements the KDP schedule from the spec (same rule set as tool-060): 70% band $2.99–$9.99 with $0.15/MB delivery; 35% otherwise; paperback 60% minus print cost.',
    'The claimed 70% ceiling of $12.99 is UNVERIFIED and is NOT used — the formula uses the plain $2.99–$9.99 band.',
    'Royalty schedules change per retailer — verify the current KDP schedule with Amazon before pricing; this is not official Amazon data.',
    'A paperback price whose printing cost exceeds 60% of the price shows a $0 royalty with a "not viable" warning — raise the list price.',
    'inkType only affects paperback; fileSizeMB only affects eBooks. Money rounds half-up to 2 decimals.',
    'Not financial advice.',
  ],
  jsonLd: [],
};
