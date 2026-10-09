import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/wedding-photographer-pricing-calculator/';

export const inputs: ToolInput[] = [
  {
    id: 'hoursOfCoverage',
    label: 'Hours of coverage',
    type: 'number',
    required: true,
    placeholder: '8',
    validation: { min: 0 },
  },
  {
    id: 'baseRate',
    label: 'Your hourly rate (USD)',
    type: 'number',
    required: true,
    placeholder: '100',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'editingHoursPerShootingHour',
    label: 'Editing hours per shooting hour (your estimate)',
    type: 'number',
    required: true,
    placeholder: '3',
    validation: { min: 0 },
  },
  {
    id: 'secondShooter',
    label: 'Include a second shooter?',
    type: 'boolean',
    required: false,
  },
  {
    id: 'secondShooterRate',
    label: 'Second shooter hourly rate (USD)',
    type: 'number',
    required: false,
    placeholder: '50',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'printsAlbumsCost',
    label: 'Prints & albums cost (USD)',
    type: 'number',
    required: true,
    placeholder: '250',
    validation: { min: 0, unit: 'USD' },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'recommendedPackagePrice',
    label: 'Recommended package price (estimate)',
    type: 'currency',
    description:
    'Total package price from your own rates and hours.',
  },
  {
    id: 'costBreakdown',
    label: 'Cost breakdown',
    type: 'table',
    description:
    'Itemized labor and extras rows that sum to the total.',
  },
];

const DESCRIPTION =
  'Free wedding photography pricing calculator 2026: Total package price from your own rates and hours. Get instant results. No signup - try it free now!';

export const content: ToolContent = {
  title: 'Wedding Photography Pricing Calculator',
  description: DESCRIPTION,
  howTo: [
    'Enter your hours of coverage and your own hourly rate in USD.',
    'Enter your editing estimate as editing hours per shooting hour (e.g. 3).',
    'Toggle the second shooter on and add their hourly rate, if you use one.',
    'Enter what you pay for prints and albums, then run the tool.',
    'Read the itemized cost breakdown — every row adds up to the package total.',
  ],
  methodology:
    'The tool multiplies your hours of coverage by your own hourly rate for shooting labor, multiplies coverage by your editing-hours-per-hour estimate for editing labor, adds the second shooter (coverage × their hourly rate, when enabled) and your prints-and-albums cost. The sum is the recommended package price. No market data or "typical" rates are involved — the estimate reflects only the numbers you enter.',
  examples: [
    {
      title: '8-hour wedding, no second shooter',
      inputs: {
        hoursOfCoverage: 8,
        baseRate: 100,
        editingHoursPerShootingHour: 3,
        secondShooter: false,
        printsAlbumsCost: 250,
      },
      note: '800 shooting + 2400 editing + 250 prints = 3,450 USD package.',
    },
    {
      title: '10-hour wedding with second shooter',
      inputs: {
        hoursOfCoverage: 10,
        baseRate: 150,
        editingHoursPerShootingHour: 2.5,
        secondShooter: true,
        secondShooterRate: 75,
        printsAlbumsCost: 400,
      },
      note: '1500 shooting + 3750 editing + 750 second shooter + 400 prints = 6,400 USD.',
    },
  ],
  faqs: [
    {
      question: 'What is the best wedding photography pricing calculator?',
      answer:
        'The best calculator builds the price from your own numbers — your hours of coverage, your hourly rate, your editing time, and your extras — instead of quoting someone else\'s market average. This one does exactly that and shows an itemized breakdown, free.',
    },
    {
      question: 'Is there a free wedding photography pricing calculator?',
      answer:
        'Yes — this wedding photography pricing calculator is completely free with no signup. You can re-run it for as many packages and price scenarios as you like.',
    },
    {
      question: 'How to calculate wedding photography pricing?',
      answer:
        'Multiply your coverage hours by your hourly rate for shooting labor, add your editing time (coverage hours × your editing-hours-per-hour estimate × your rate), then add extras like a second shooter, prints, and albums. The total is your package price — an estimate based on your own rates, which is what this tool computes.',
    },
    {
      question: 'How does the wedding photography pricing calculator work?',
      answer:
        'Enter your details using the inputs above and the wedding photography pricing calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the wedding photography pricing calculator free to use?',
      answer:
        'Yes - this wedding photography pricing calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a wedding photography pricing calculator?',
      answer:
        'A wedding photography pricing calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the wedding photography pricing calculator?',
      answer:
        'No account needed. Open the wedding photography pricing calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'The editing-hours-per-shooting-hour multiplier is your own assumption, not an industry standard — honest culling/editing time varies by style and deliverables.',
    'The second shooter rate is treated as an hourly rate multiplied by coverage hours; if you pay a flat day fee, enter the fee divided by your coverage hours.',
    'All rates and costs are user-provided — the result is an ESTIMATE for your planning, not a promise of what clients will pay.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Wedding Photography Pricing Calculator 2026 | HusnainBlogger',
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
          name: 'Wedding Photographer Pricing Calculator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
