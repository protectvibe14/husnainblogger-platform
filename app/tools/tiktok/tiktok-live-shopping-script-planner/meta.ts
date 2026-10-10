import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'products',
    label: 'Products (one per line)',
    type: 'textarea',
    required: true,
    placeholder: 'Silk pillowcase | $24.99\nVitamin C serum | $18.50\nJade roller',
    validation: { max: 1500 },
  },
  {
    id: 'liveDurationMin',
    label: 'Planned duration (minutes)',
    type: 'number',
    required: true,
    validation: { min: 10, max: 240 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'runOfShow', label: 'Timed run-of-show', type: 'table' },
  { id: 'productSegments', label: 'Product segments', type: 'list' },
  { id: 'priceDropMoments', label: 'Price-drop moments (sample lines)', type: 'list' },
  { id: 'pinProductCues', label: 'Pin-product cues', type: 'list' },
  { id: 'urgencyCtas', label: 'Urgency call-to-action lines', type: 'list' },
  { id: 'shopPolicyNote', label: 'TikTok Shop policy note', type: 'text' },
];

const DESCRIPTION =
  'Plan a TikTok live shopping script — product segments, sample price-drop lines, pin-product cues, and urgency CTAs. Free. Plan your live sale now.';

export const content: ToolContent = {
  title: 'TikTok Live Shopping Script',
  description: DESCRIPTION,
  howTo: [
    'List your products one per line — add " | price" after a product, e.g. "Silk pillowcase | $24.99", or leave the price off.',
    'Enter your planned live duration in minutes (10 to 240) so segments are timed to fit.',
    'Run the planner to get a timed run-of-show, one scripted segment per product, pin-product cues, and urgency CTAs.',
    'Replace every SAMPLE price-drop line with your real price before going live — the tool invents no prices.',
    'Add your products and verify every link in TikTok Shop, then check TikTok Shop policies for your region before you stream.',
  ],
  methodology:
    'The planner parses your product list (name plus optional price per line, up to 12 products), assigns each product a segment from a fixed 6-template bank deterministically, and distributes your minutes proportionally across intro, product segments, a flash-deal moment (30+ minute sessions), buyer Q&A, and close — the times always sum exactly to your duration. Price-drop lines are clearly labeled samples. There is no AI, no TikTok Shop integration, and no sales guarantees — it is a static planning template.',
  examples: [
    {
      title: '60-minute beauty live sale',
      inputs: { products: 'Silk pillowcase | $24.99\nVitamin C serum | $18.50\nJade roller', liveDurationMin: 60 },
      note: 'Three timed product segments, a flash-deal moment, pin cues, and urgency CTAs.',
    },
    {
      title: 'Quick 20-minute single-product live',
      inputs: { products: 'Protein shaker | $15', liveDurationMin: 20 },
      note: 'Compact script for one product — no flash-deal row on sessions under 30 minutes.',
    },
  ],
  faqs: [
    {
      question: 'what is the best tiktok live shopping script?',
      answer:
        'The best live-shopping script gives every product its own timed segment (demo, questions, social proof), pins each product as you sell it, and uses one time-boxed flash deal plus urgency CTAs. This free planner builds exactly that minute-by-minute run-of-show from your product list — with sample price-drop lines you replace with real prices.',
    },
    {
      question: 'is there a free tiktok live shopping script?',
      answer:
        'Yes — this live shopping script planner is completely free with no signup. It builds the run-of-show from fixed templates in your browser, so there is no usage limit.',
    },
    {
      question: 'how to use tiktok live shopping?',
      answer:
        'List your products (one per line, optionally with prices), enter your planned duration, and use the generated run-of-show to structure the stream. Before going live, add your products and verify every link in TikTok Shop, and check TikTok Shop policies for your region. This planner does not connect to TikTok Shop.',
    },
    {
      question: 'how does a tiktok live shopping script work?',
      answer:
        'You enter your products and duration; the tool assigns each product a deterministic segment template, times everything to sum exactly to your duration, and adds pin-product cues, sample price-drop lines, and urgency CTAs. Same inputs always produce the same script.',
    },
    {
      question: 'How does the tiktok live shopping script work?',
      answer:
        'Enter your details using the inputs above and the tiktok live shopping script calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok live shopping script free to use?',
      answer:
        'Yes - this tiktok live shopping script is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok live shopping script?',
      answer:
        'A tiktok live shopping script is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'This is a static planning template — it does NOT connect to TikTok Shop and cannot add or verify product links.',
    'Check TikTok Shop policies for your region before going live — eligibility, restricted categories, and disclosure rules change over time.',
    'Price-drop lines are labeled samples; the tool invents no prices and makes no sales guarantees.',
    'A single session covers at most 12 products; larger catalogs should be split across sessions.',
  ],
  jsonLd: [],
};
