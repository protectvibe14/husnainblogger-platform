import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'productName',
    label: 'Product name',
    type: 'text',
    required: true,
    placeholder: 'e.g. mini portable blender',
    validation: { max: 150 },
  },
  {
    id: 'triedProduct',
    label: 'Have you personally tried this product?',
    type: 'boolean',
    required: true,
  },
  {
    id: 'experienceNotes',
    label: 'What did you actually experience? (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'e.g.\nBlends frozen fruit smoothly\nCharges over USB-C\nA bit loud on max speed',
    validation: { max: 2000 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'reviewScript', label: 'Review script', type: 'copy' },
  { id: 'disclosure', label: 'Affiliate disclosure guidance', type: 'text' },
];

const DESCRIPTION =
  'Review products that sell with this TikTok affiliate marketing video script — honest angles structured to drive real commissions. Earn viewer trust.';

export const content: ToolContent = {
  title: 'TikTok Affiliate Marketing Video',
  description: DESCRIPTION,
  howTo: [
    'Type the product name into the "Product name" box — for example "mini portable blender".',
    'Answer "Have you personally tried this product?" honestly — this picks a tested-review or first-impressions frame.',
    'If you tried it, add what you actually experienced in "What did you actually experience?", one point per line.',
    'Run the writer to get a full script: 3-second hook, intro, pros, an honest downside, 5 demo shots, and an affiliate CTA with #ad.',
    'Fill in the [bracketed] downside and first-impression lines with your real experience before filming.',
    'Say the #ad disclosure on camera or pin it as a comment when you post.',
  ],
  methodology:
    'Scripts are assembled from fixed templates — 6 tested-review hooks and 4 first-impression hooks, chosen deterministically from your product name, plus a fixed 5-shot demo list. Pros come only from your own experience notes; nothing is ever invented. If you have not tried the product, the script is forced into a first-impressions/unboxing frame that explicitly disclaims testing and makes no durability or results claims. Every script ends with an affiliate disclosure.',
  examples: [
    {
      title: 'Tested product',
      inputs: {
        productName: 'mini portable blender',
        triedProduct: true,
        experienceNotes: 'Blends frozen fruit smoothly\nCharges over USB-C',
      },
      note: 'Full tested-review script: your notes become the pros, plus a labeled placeholder for one honest downside.',
    },
    {
      title: 'Not tried yet',
      inputs: { productName: 'LED sunset lamp', triedProduct: false },
      note: 'First-impressions/unboxing script that states the product is not tested yet — no results claims, with a part-2 follow-up CTA.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok affiliate marketing video?',
      answer:
        'The best affiliate videos open with a 3-second hook, show the product actually being used, stay honest about downsides, and disclose the affiliate link clearly. This free tool builds that script structure from your real experience — or an honest first-impressions frame if you have not tried the product yet.',
    },
    {
      question: 'Is there a free tiktok affiliate marketing video?',
      answer:
        'Yes — this review script writer is completely free with no signup. It assembles scripts from fixed templates in your browser, so there is no usage limit.',
    },
    {
      question: 'How to use tiktok affiliate marketing video?',
      answer:
        'Enter the product name, say whether you have tried it, add your real experience notes, then generate the script. Fill in the bracketed lines with your own words, film the 5 demo shots, and include the #ad disclosure when you post.',
    },
    {
      question: 'How does the tiktok affiliate marketing video work?',
      answer:
        'Enter your details using the inputs above and the tiktok affiliate marketing video calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok affiliate marketing video free to use?',
      answer:
        'Yes - this tiktok affiliate marketing video is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok affiliate marketing video?',
      answer:
        'A tiktok affiliate marketing video is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the tiktok affiliate marketing video?',
      answer:
        'No account needed. Open the tiktok affiliate marketing video, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'The script never invents experience claims — pros come only from your notes; untested products get a first-impressions frame with no durability or results promises.',
    'The #ad disclosure included follows general FTC guidance for affiliate marketing, but it is general information, not legal advice.',
    'Scripts are template-based, not AI-written, and cannot promise views, clicks, or affiliate earnings.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'TikTok Affiliate Marketing Video 2026 | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/tiktok/tiktok-affiliate-review-script/',
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
          name: 'TikTok Affiliate Review Script',
          item: 'https://husnainblogger.com/tools/tiktok/tiktok-affiliate-review-script/',
        },
      ],
    },
  ],
};
