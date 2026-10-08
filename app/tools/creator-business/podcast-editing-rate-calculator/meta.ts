import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/podcast-editing-rate-calculator/';

export const inputs: ToolInput[] = [
  {
    id: 'episodeMinutes',
    label: 'Episode length (minutes)',
    type: 'number',
    required: true,
    placeholder: '45',
    validation: { min: 0 },
  },
  {
    id: 'editMultiplier',
    label: 'Editing hours per finished hour (your estimate)',
    type: 'number',
    required: true,
    placeholder: '3',
    validation: { min: 0 },
  },
  {
    id: 'hourlyRate',
    label: 'Your hourly rate (USD)',
    type: 'number',
    required: true,
    placeholder: '40',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'addOnShowNotesPrice',
    label: 'Show notes add-on price (USD; 0 = not included)',
    type: 'number',
    required: true,
    placeholder: '20',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'addOnAudiogramPrice',
    label: 'Audiogram add-on price (USD; 0 = not included)',
    type: 'number',
    required: true,
    placeholder: '15',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'addOnChaptersPrice',
    label: 'Chapters add-on price (USD; 0 = not included)',
    type: 'number',
    required: true,
    placeholder: '10',
    validation: { min: 0, unit: 'USD' },
  },
  {
    id: 'episodesPerMonth',
    label: 'Episodes per month (for retainer estimate)',
    type: 'number',
    required: true,
    placeholder: '4',
    validation: { min: 0 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'perEpisodePrice',
    label: 'Per-episode price (estimate)',
    type: 'currency',
    description: 'Editing labor plus your add-on prices for one episode.',
  },
  {
    id: 'monthlyRetainerEstimate',
    label: 'Monthly retainer estimate',
    type: 'currency',
    description: 'Per-episode price multiplied by your episodes per month.',
  },
  {
    id: 'addOnsIncluded',
    label: 'Add-ons included',
    type: 'list',
    description: 'The add-ons priced above 0 that were included in the total.',
  },
];

const DESCRIPTION =
  'Free podcast editing rates per hour 2026: Editing labor plus your add-on prices for one episode. Get instant results. No signup - try it free now!';

export const content: ToolContent = {
  title: 'Podcast Editing Rates Per Hour 2026 – Free | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Enter the episode length in minutes, your editing-hours-per-finished-hour estimate, and your own hourly rate in USD.',
    'Enter your price for each add-on — show notes, audiogram, chapters — or 0 to leave an add-on out.',
    'Enter episodes per month to get a monthly retainer estimate, then run the tool.',
    'Review the per-episode price and retainer alongside the add-ons you included.',
  ],
  methodology:
    'Editing hours are episode minutes ÷ 60 × your editing multiplier; labor cost is editing hours × your hourly rate; the per-episode price adds your add-on prices (0 = not included). The monthly retainer is the per-episode price × your episodes per month. This tool prices editing labor only — not ad slots — and uses no market rates, only your own inputs.',
  examples: [
    {
      title: '45-minute episode, show notes + chapters',
      inputs: {
        episodeMinutes: 45,
        editMultiplier: 3,
        hourlyRate: 40,
        addOnShowNotesPrice: 20,
        addOnAudiogramPrice: 0,
        addOnChaptersPrice: 15,
        episodesPerMonth: 4,
      },
      note: 'Per-episode 125 USD; 4-episode monthly retainer 500 USD.',
    },
    {
      title: 'Editing labor only, no add-ons',
      inputs: {
        episodeMinutes: 30,
        editMultiplier: 2,
        hourlyRate: 50,
        addOnShowNotesPrice: 0,
        addOnAudiogramPrice: 0,
        addOnChaptersPrice: 0,
        episodesPerMonth: 8,
      },
      note: 'Per-episode 50 USD; 8-episode monthly retainer 400 USD.',
    },
  ],
  faqs: [
    {
      question: 'What is the best podcast editing rates per hour?',
      answer:
        'The best way to price editing is your own math: your editing hours per finished hour × your hourly rate, plus your add-on prices. This calculator does exactly that — free, with no market averages involved.',
    },
    {
      question: 'Is there a free podcast editing rates per hour?',
      answer:
        'Yes — this podcast editing rate calculator is completely free with no signup. Re-run it for any episode length, multiplier, rate, or add-on mix.',
    },
    {
      question: 'How to use podcast editing rates per hour?',
      answer:
        'Enter the episode length, your editing-hours-per-hour estimate, and your hourly rate, then price each add-on (show notes, audiogram, chapters) with 0 meaning not included. The tool returns a per-episode price and a monthly retainer estimate.',
    },
    {
      question: 'How does the podcast editing rates per hour work?',
      answer:
        'Enter your details using the inputs above and the podcast editing rates per hour calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the podcast editing rates per hour free to use?',
      answer:
        'Yes - this podcast editing rates per hour is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a podcast editing rates per hour?',
      answer:
        'A podcast editing rates per hour is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the podcast editing rates per hour?',
      answer:
        'No account needed. Open the podcast editing rates per hour, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'The editing multiplier is your own assumption — actual editing time varies by audio quality, ums, and revision rounds.',
    'Add-on prices are yours to set; 0 means the add-on is not included in the price.',
    'This tool prices editing labor only; sponsorship/ad-slot pricing is a different tool.',
    'Results are ESTIMATES for your planning, not a promise of what clients will pay.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Podcast Editing Rates Per Hour 2026 – Free | HusnainBlogger',
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
          name: 'Podcast Editing Rate Calculator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
