import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'productName',
    label: 'Product name',
    type: 'text',
    required: true,
    placeholder: 'e.g. LED sunset lamp',
    validation: { max: 120 },
  },
  {
    id: 'angle',
    label: 'Hook angle',
    type: 'select',
    required: true,
    options: ['problem', 'result', 'curiosity', 'offer'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'adHooks', label: 'Ad hook lines', type: 'list' },
  { id: 'claimFlags', label: 'Claim review flags', type: 'text' },
];

const DESCRIPTION =
  'Write scroll-stopping TikTok ad hooks for your product — pick problem, result, curiosity or offer angle. Free template-based hook writer. Try it now.';

export const content: ToolContent = {
  title: 'TikTok Ad Hooks',
  description: DESCRIPTION,
  howTo: [
    'Type your product name into the "Product name" box — for example "LED sunset lamp".',
    'Pick a hook angle: problem, result, curiosity, or offer — matching your ad\'s goal.',
    'Run the writer to get 10 opening-3-second hook lines built from fixed templates for that angle.',
    'Read the claim flags: any hook containing unverifiable superlatives (like "best" or "#1") is flagged for your review.',
    'Replace flagged words with specific, provable statements — or cut them.',
    'Use a hook as the first spoken or on-screen line of your TikTok ad.',
  ],
  methodology:
    'Each run takes 10 fixed hook templates for your chosen angle (40 templates across 4 angles), orders them deterministically from your product name, and frames each as an opening-3-seconds line capped at 140 characters for readability. A claim guard then scans every hook for unverifiable superlatives — "best", "#1", "guaranteed", and similar — and flags matches for you to verify or remove. There is no AI and no performance data; hooks are starting lines, not proven converters.',
  examples: [
    {
      title: 'Problem angle',
      inputs: { productName: 'LED sunset lamp', angle: 'problem' },
      note: '10 problem-framed hooks like "Still struggling with LED sunset lamp?" with [0:00–0:03] framing.',
    },
    {
      title: 'Offer angle',
      inputs: { productName: 'ceramic mug set', angle: 'offer' },
      note: '10 offer-framed hooks for sale and bundle messaging.',
    },
    {
      title: 'Claim flag demo',
      inputs: { productName: 'Best Blender Pro', angle: 'result' },
      note: 'Hooks containing "best" are flagged so you can verify the claim or reword it before publishing.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok ad hooks?',
      answer:
        'The best TikTok ad hooks state the payoff in the first 3 seconds — a problem solved, a result shown, curiosity sparked, or an offer stated. This free tool generates 10 such opening lines per angle from fixed templates; test several to see which your audience responds to.',
    },
    {
      question: 'Is there a free tiktok ad hooks?',
      answer:
        'Yes — this ad hook writer is completely free with no signup. It assembles hooks from fixed word banks in your browser, so there is no usage limit.',
    },
    {
      question: 'How to use tiktok ad hooks?',
      answer:
        'Enter your product name, pick an angle, and generate 10 hooks. Check the claim flags, then use a hook as the first spoken or on-screen line of your TikTok ad creative.',
    },
    {
      question: 'How does a tiktok ad hooks work?',
      answer:
        'You provide a product name and angle; the tool fills 10 fixed hook templates for that angle with your product name, orders them deterministically, and scans each for unverifiable superlatives to flag. It is template-based — there is no AI and no ad performance data.',
    },
    {
      question: 'How does the tiktok ad hooks work?',
      answer:
        'Enter your details using the inputs above and the tiktok ad hooks calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok ad hooks free to use?',
      answer:
        'Yes - this tiktok ad hooks is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok ad hooks?',
      answer:
        'A tiktok ad hooks is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Hooks come from 40 fixed templates (10 per angle) — they are opening lines, not AI copy, and the tool makes no claim that any hook will convert or go viral.',
    'The claim guard flags words like "best" and "#1" for your review; it cannot judge whether a claim is actually true or compliant with TikTok\'s ad policies.',
    'The 140-character cap is a readability best practice chosen by this tool, not a TikTok-published rule.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'TikTok Ad Hooks 2026 – Free Hook Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/tiktok/tiktok-ad-hook-writer/',
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
          name: 'TikTok Tools',
          item: 'https://husnainblogger.com/tools/tiktok/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'TikTok Ad Hook Writer',
          item: 'https://husnainblogger.com/tools/tiktok/tiktok-ad-hook-writer/',
        },
      ],
    },
  ],
};
