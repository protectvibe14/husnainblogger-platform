import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'projectType',
    label: 'Project type',
    type: 'select',
    required: true,
    options: ['narration', 'elearning', 'commercial', 'audiobook', 'ivr'],
  },
  {
    id: 'finishedMinutes',
    label: 'Finished audio length (minutes)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 5',
    validation: { min: 0 },
  },
  {
    id: 'wordCount',
    label: 'Script word count (optional)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 750',
    validation: { min: 0 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'projectFeeLow', label: 'Suggested project fee — low (estimate)', type: 'currency' },
  { id: 'projectFeeHigh', label: 'Suggested project fee — high (estimate)', type: 'currency' },
  { id: 'pricingNote', label: 'How the fee was built (estimate)', type: 'text' },
];

const DESCRIPTION =
  'Quote voiceover work confidently with this free voiceover rates calculator. Select the project type and audio length for an estimated fee range.';

export const content: ToolContent = {
  title: 'Voiceover Rates Calculator',
  description: DESCRIPTION,
  howTo: [
    'Pick the project type: narration, e-learning, commercial spot, audiobook, or IVR/phone system.',
    'Enter the finished audio length in minutes — narration uses length-based tiers, e-learning and audiobooks price per finished hour.',
    'Optionally enter your script word count — it is used only to report the words-per-minute pace for context.',
    'Run the calculator to see the suggested project fee range, rounded to the nearest $25.',
    'Read the pricing note (it explains the tier or rate used), then adjust for your experience and any usage/buyout terms before quoting.',
  ],
  methodology:
    'The tool looks up fixed benchmark tables in code: narration tiers by finished minutes (6 rows, $350 at 2 min → $1,500–$2,200 over 40 min), e-learning $300–$600 per finished hour, audiobook $200–$400 per finished hour (PFH), commercial flat $350–$1,000 per project, IVR $100–$300 per finished minute. Length-based types multiply the rate by your minutes; narration looks up the tier bracket. There is no AI and no live market lookup — every figure is a GVAA-derived survey estimate, not an official rate.',
  examples: [
    {
      title: 'Narration, 5 finished minutes',
      inputs: { projectType: 'narration', finishedMinutes: 5 },
      note: 'Returns $500–$750 — the up-to-5-minute narration tier.',
    },
    {
      title: 'E-learning, 90 finished minutes, 13,500-word script',
      inputs: { projectType: 'elearning', finishedMinutes: 90, wordCount: 13500 },
      note: 'Returns $450–$900 (1.5 finished hours × $300–$600/hr) plus a pace note of ~150 words/minute.',
    },
  ],
  faqs: [
    {
      question: 'What is the best voiceover rates calculator?',
      answer:
        'The best one separates project types — narration, e-learning, commercials, audiobooks, and IVR all price differently. This free calculator uses fixed per-type benchmark tables (narration tiers by length, per-finished-hour rates for e-learning and audiobooks), all labeled as GVAA-derived survey estimates.',
    },
    {
      question: 'Is there a free voiceover rates calculator?',
      answer:
        'Yes — this calculator is completely free with no signup. Select the project type, enter the finished audio length, and optionally add your script word count to get an estimated fee range.',
    },
    {
      question: 'How to calculate voiceover rates?',
      answer:
        'Look up the going band for the project type (tiered by finished minutes for narration, per finished hour for e-learning and audiobooks, flat for commercials and IVR), multiply by your length, and round sensibly. This tool does that with fixed, labeled estimate tables — then add usage/buyout terms, which it deliberately does not model.',
    },
    {
      question: 'What is a voiceover rates calculator?',
      answer:
        'A voiceover rates calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the voiceover rates calculator?',
      answer:
        'No account needed. Open the voiceover rates calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'All bands (narration tiers $350–$2,200; e-learning $300–$600/hr; audiobook $200–$400 PFH; commercial $350–$1,000 flat; IVR $100–$300/min) are GVAA-derived survey/market estimates — NOT official union or guild rates and NOT current verified market data.',
    'Broadcast, buyout, and usage tiers are not modeled — add them separately when they apply.',
    'Word count is informational only (pace context) and does not change the fee.',
    'All amounts are USD per project.',
  ],
  jsonLd: [],
};
