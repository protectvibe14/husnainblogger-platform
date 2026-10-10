import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/facebook-ad-headline-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'product',
    label: 'Product name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Glow Serum',
    validation: { max: 60 },
  },
  {
    id: 'benefit',
    label: 'Main benefit',
    type: 'text',
    required: true,
    placeholder: 'e.g. clearer skin in weeks',
    validation: { max: 80 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'headlines',
    label: 'Ad headlines',
    type: 'list',
    description:
    'Free facebook ad headline ideas 2026: 10 benefit-led headlines, each 40 characters or fewer (strict cap). Get instant results. free now.',
  },
];

export const content: ToolContent = {
  title: 'Facebook Ad Headline Ideas',
  description:
    'Write Facebook ad headlines under 40 characters: enter your product and its main benefit for punchy, benefit-led lines built on proven copy frameworks.',
  howTo: [
    'Enter your product name (up to 60 characters).',
    'Enter the main benefit your ad promises (up to 80 characters).',
    'Run the tool to get 10 benefit-led headlines — every one capped at 40 characters.',
    'Pick the strongest headline and rewrite it in your own words before launching your ad.',
  ],
  methodology:
    'Headlines are assembled from a fixed bank of 18 hand-written copywriting templates — benefit-led formulas such as benefit-plus-time-window, product-equals-benefit, and shortcut framing. No AI is used and no filler openers ("Introducing…") are emitted. The 40-character cap is enforced strictly: any over-length headline is compressed at a word boundary, never emitted over-cap, since Facebook ad delivery truncates beyond 40 characters.',
  examples: [
    {
      title: 'Skincare product headlines',
      inputs: { product: 'Glow Serum', benefit: 'clearer skin' },
      note: '10 benefit-led headlines, all under 40 characters.',
    },
    {
      title: 'Fitness app headlines',
      inputs: { product: 'FitTrack', benefit: 'lose weight at home' },
      note: 'Benefit-first headlines with the product slotted in.',
    },
  ],
  faqs: [
    {
      question: 'What is the best facebook ad headline ideas?',
      answer:
        'The best Facebook ad headlines lead with the benefit in 40 characters or fewer and skip filler openers. This free tool gives you 10 benefit-led headlines built on proven copy frameworks — use them as starting points, then rewrite the winner in your own voice.',
    },
    {
      question: 'Is there a free facebook ad headline ideas?',
      answer:
        'Yes — this Facebook ad headline generator is completely free with no signup. Enter your product and benefit for 10 headlines, every one strictly capped at 40 characters.',
    },
    {
      question: 'How to use facebook ad headline?',
      answer:
        'Enter your product name and its main benefit, then run the tool. Copy the strongest headline into your ad, and pair it with primary text that carries the same benefit — headlines work best when they match the ad body.',
    },
    {
      question: 'How does a facebook ad headline ideas work?',
      answer:
        'It slots your product and benefit into a fixed bank of 18 proven headline templates, then compresses each result at a word boundary so none exceed 40 characters. No AI is involved — the same inputs always return the same headlines.',
    },
    {
      question: 'What is a facebook ad headline ideas?',
      answer:
        'A facebook ad headline ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Headlines are assembled from fixed copywriting templates — starting points that need your own offer details and voice, not AI-written copy.',
    'This tool makes no delivery or performance claims: it cannot predict or guarantee ad results.',
  ],
  jsonLd: [],
};
