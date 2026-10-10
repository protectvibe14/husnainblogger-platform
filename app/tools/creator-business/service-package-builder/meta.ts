import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent, BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/service-package-builder/';
const DESCRIPTION =
  'Build freelance service packages that sell: bundle your services, set a discount, and get a ready-to-send sales sheet with pricing. Start now!';

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [
  { id: 'packagePrice', label: 'Package price', type: 'currency' },
  { id: 'savingsVsALaCarte', label: 'Savings vs a-la-carte', type: 'currency' },
  {
    id: 'packageSalesSheet',
    label: 'Sales sheet (copy)',
    type: 'copy',
    description:
    'The full package sales sheet — copy it into a proposal, email, or DM.',
  },
];

/**
 * BuilderTemplate only passes { items } to runTool, so package-level
 * config (name, discount, description) is collected on the item rows and
 * logic.ts reads them from the first filled row (top-level args win when
 * present). Field placeholders explain this on each row.
 */
export const itemFields: BuilderField[] = [
  { id: 'name', label: 'Service name', type: 'text', required: true, placeholder: 'e.g. Logo design' },
  { id: 'price', label: 'A-la-carte price (USD)', type: 'text', required: true, placeholder: 'e.g. 500' },
  {
    id: 'packageName',
    label: 'Package name (first row only)',
    type: 'text',
    placeholder: 'e.g. Starter Brand Pack',
  },
  {
    id: 'bundleDiscountPct',
    label: 'Bundle discount % (first row only)',
    type: 'text',
    placeholder: '0–100 (default 10)',
  },
  {
    id: 'packageDescription',
    label: 'Package description (first row only)',
    type: 'text',
    placeholder: 'one-line description of the package',
  },
];

export const content: ToolContent = {
  title: 'Freelance Service Packages',
  description: DESCRIPTION,
  howTo: [
    'Add one row per service with its name and a-la-carte price in USD.',
    'On the first row, fill in the package name, bundle discount percent, and a one-line description.',
    'Leave the discount empty to use the default 10%.',
    'Build to get the package price, the savings vs buying services separately, and a sales sheet.',
    'Copy the sales sheet into your proposal, email, or DM — adjust the CTA wording to your brand.',
  ],
  methodology:
    'This tool sums your service prices for the a-la-carte total, applies your bundle discount percent (package price = total × (1 − discount/100)), and assembles a sales sheet (package name, included services with prices, discount, savings, and a booking CTA) from a fixed template. No AI runs — it is arithmetic plus document assembly, using your own prices throughout.',
  faqs: [
    {
      question: 'What is the best freelance service packages?',
      answer:
        'The best package turns your service list into one priced offer with a clear bundle discount and a ready sales sheet. This free builder does that arithmetic from your own services and prices — your discount and price list drive everything.',
    },
    {
      question: 'Is there a free freelance service packages?',
      answer:
        'Yes — this package builder is completely free with no signup. Enter your services and prices, set a bundle discount, and copy the sales sheet into your proposal.',
    },
    {
      question: 'How to use freelance service packages?',
      answer:
        'List each service with its a-la-carte price on the rows, fill the package name, discount, and description on the first row, then build. You get the package price, the savings versus buying services separately, and a copy-ready sales sheet.',
    },
    {
      question: 'How does a freelance service packages work?',
      answer:
        'It sums your service prices, subtracts your bundle discount percent, and assembles a sales sheet — package name, included services, prices, discount, savings, and a booking call-to-action. No AI: just arithmetic plus document assembly from your own inputs.',
    },
    {
      question: 'How does the freelance service packages work?',
      answer:
        'Enter your details using the inputs above and the freelance service packages calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the freelance service packages free to use?',
      answer:
        'Yes - this freelance service packages is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a freelance service packages?',
      answer:
        'A freelance service packages is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Package name, discount, and description are read from the first row that has them (the form passes item rows only); defaults are "My Service Package", a 10% discount, and no description.',
    'Discount must be a number between 0 and 100; prices are your own figures, not market rates.',
    'The sales sheet is a starting draft — adjust the CTA and wording to your brand before sending.',
    'This is the generic builder by design; niche versions (e.g. wedding videographer, online coach packages) add niche-specific presets.',
  ],
  jsonLd: [
  ],
};
