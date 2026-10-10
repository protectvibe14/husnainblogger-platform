import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'videoCount',
    label: 'Number of UGC videos',
    type: 'number',
    required: true,
    placeholder: 'e.g. 3',
    validation: { min: 1 },
  },
  {
    id: 'usageRights',
    label: 'Usage rights',
    type: 'select',
    required: true,
    options: ['organic', 'paid_ads', 'whitelisting'],
  },
  {
    id: 'postingRequired',
    label: 'I must post the videos on my own channels',
    type: 'boolean',
    required: true,
  },
];

export const outputs: ToolOutput[] = [
  { id: 'rateLow', label: 'Suggested package rate — low (USD)', type: 'currency' },
  { id: 'rateHigh', label: 'Suggested package rate — high (USD)', type: 'currency' },
  { id: 'perVideoLow', label: 'Per-video equivalent — low (USD)', type: 'currency' },
  { id: 'perVideoHigh', label: 'Per-video equivalent — high (USD)', type: 'currency' },
  { id: 'currency', label: 'Currency', type: 'text' },
  { id: 'note', label: 'Estimate note', type: 'text' },
];

const DESCRIPTION =
  'Run this free ugc pricing calculator to quote packages — build an honest rate range from video count, usage rights, and posting add-ons. Start quoting now.';

export const content: ToolContent = {
  title: 'UGC Pricing Calculator',
  description: DESCRIPTION,
  howTo: [
    'Enter how many UGC videos the package includes in the videoCount field.',
    'Choose usage rights: organic (brand posts on its own channels), paid_ads (brand runs the videos as ads), or whitelisting (brand runs ads from your handle) — each applies a labeled multiplier estimate.',
    'Set postingRequired to yes if you must also publish the videos on your own channels (+25–50% labeled estimate), no if you only deliver the files.',
    'Run the tool and read the suggested total range plus the per-video equivalent in USD.',
    'Read the estimate note: the $500 base rate and all multipliers are 2026 benchmark estimates, not guarantees — adjust for your niche, portfolio, usage length, and exclusivity.',
  ],
  methodology:
    'The tool multiplies video count × a $500 base rate (UGC video without posting, labeled estimate) × a usage-rights multiplier (organic 1.0, paid ads 1.5–2.5, whitelisting 2.0–3.0, labeled estimates) × a posting add-on (1.25–1.5 when the creator must post, labeled estimate), rounding to the nearest $25. Defaults are user-editable estimates — the tool never presents them as verified platform rates.',
  examples: [
    {
      title: 'Simple organic package',
      inputs: { videoCount: 2, usageRights: 'organic', postingRequired: false },
      note: '2 × $500 × 1.0 = $1,000 total, $500 per video (estimated).',
    },
    {
      title: 'Paid-ads package with posting',
      inputs: { videoCount: 4, usageRights: 'paid_ads', postingRequired: true },
      note: '4 videos, paid ads, creator posts → $3,750–$7,500 total (estimated).',
    },
    {
      title: 'Whitelisting deal',
      inputs: { videoCount: 3, usageRights: 'whitelisting', postingRequired: false },
      note: '3 videos, whitelisting → $3,000–$4,500 total, $1,000–$1,500 per video (estimated).',
    },
  ],
  faqs: [
    {
      question: 'What is the best ugc pricing calculator?',
      answer:
        'The most honest one shows its math: this free calculator estimates your range from video count, usage rights, and posting add-ons using labeled 2026 benchmark estimates (a $500 base rate per video without posting). Use it as a quoting starting point, not a final price.',
    },
    {
      question: 'Is there a free ugc pricing calculator?',
      answer:
        'Yes — this tool is completely free with no signup. Enter your video count, usage-rights tier, and whether posting is required to get an estimated package range in seconds.',
    },
    {
      question: 'How to calculate ugc pricing?',
      answer:
        'Multiply your video count by a base rate (this tool uses $500 per video without posting as a labeled estimate), then apply usage-rights multipliers (paid ads 1.5–2.5×, whitelisting 2.0–3.0×) and add 25–50% if you must post. This tool runs that formula for you and shows both the total and per-video ranges.',
    },
    {
      question: 'What is an ugc pricing calculator?',
      answer:
        'An ugc pricing calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the ugc pricing calculator?',
      answer:
        'No account needed. Open the ugc pricing calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'The $500 base rate per video (no posting) and all multipliers are 2026 benchmark ESTIMATES, not verified platform or advertiser data.',
    'Usage length, exclusivity, revisions, and rush fees are not modeled — negotiate those separately.',
    'The base rate assumes video without posting; organic-only delivery is the floor scenario.',
    'Actual prices vary by niche, creator portfolio, and negotiation — this is guidance, not a guarantee.',
  ],
  jsonLd: [],
};
