import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'productName',
    label: 'Product name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Aurora Vitamin C Serum',
    validation: { max: 150 },
  },
  {
    id: 'niche',
    label: 'Niche',
    type: 'select',
    required: true,
    options: [
      'Beauty / Skincare',
      'Tech / Gadgets',
      'Fashion / Clothing',
      'Food / Snacks',
      'Toys / Collectibles',
      'ASMR / Sensory',
      'Other',
    ],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'teaser', label: 'Opening teaser', type: 'copy' },
  { id: 'style', label: 'Plan style', type: 'text' },
  { id: 'beats', label: 'Shot-by-shot plan', type: 'list' },
  { id: 'revealCta', label: 'Reveal + CTA', type: 'copy' },
];

export const content: ToolContent = {
  title: 'TikTok Unboxing Video Script',
  description:
    'Free tiktok unboxing video script 2026: Plan a TikTok unboxing video shot by shot: teaser, opening beats, reaction lines, and a. Fast, private, no signup - try!',
  howTo: [
    'Enter the productName you are unboxing (e.g. "Aurora Vitamin C Serum").',
    'Pick the niche that fits the product — or "ASMR / Sensory" for a sound-focused unboxing.',
    'Generate to get a teaser, 7 shot-by-shot beats with reaction lines, and a reveal CTA.',
    'ASMR-style plans add a sound cue to every shot — record close to the mic.',
    'Film the beats in order: box teaser, opening, first look, layers, reveal, detail scan, first touch.',
    'Read each reaction line naturally — genuine first reactions beat scripted ones.',
  ],
  methodology:
    'The planner selects a teaser and reveal CTA from fixed banks of 8 and 6 lines using a deterministic hash of your inputs, then fills a fixed 7-shot sequence with reaction lines from a bank of 10. When the niche is "ASMR / Sensory" or the product name contains "asmr", every shot gains a sound cue from a bank of 8. Same inputs always produce the same plan — no AI is involved.',
  examples: [
    {
      title: 'Skincare unboxing',
      inputs: { productName: 'Aurora Vitamin C Serum', niche: 'Beauty / Skincare' },
      note: 'Standard 7-shot plan with reaction lines.',
    },
    {
      title: 'ASMR snack box',
      inputs: { productName: 'Mystery Snack Box', niche: 'ASMR / Sensory' },
      note: 'Every shot gains a mic-close sound cue.',
    },
  ],
  faqs: [
    {
      question: 'What is the best TikTok unboxing video script?',
      answer:
        'The best unboxing videos follow a fixed shot flow: box teaser, slow opening, genuine first look, layer-by-layer reveal, close-up detail scan, and first touch — with natural reactions. This planner builds that flow from fixed templates; the "best" version is the one with your real, unscripted reactions.',
    },
    {
      question: 'Is there a free TikTok unboxing video script?',
      answer:
        'Yes — this planner is free and runs entirely in your browser. You get the teaser, 7 shot-by-shot beats with reaction lines, and a reveal CTA with no signup.',
    },
    {
      question: 'How do I use an unboxing video plan?',
      answer:
        'Enter your product name and niche, then generate. Film the 7 shots in the listed order, say the reaction lines in your own words, and finish with the reveal CTA. For ASMR-style plans, record each sound cue close to the microphone.',
    },
    {
      question: 'How does the tiktok unboxing video script work?',
      answer:
        'Enter your details using the inputs above and the tiktok unboxing video script calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok unboxing video script free to use?',
      answer:
        'Yes - this tiktok unboxing video script is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok unboxing video script?',
      answer:
        'A tiktok unboxing video script is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the tiktok unboxing video script?',
      answer:
        'No account needed. Open the tiktok unboxing video script, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Template-based, not AI: reaction lines are generic templates — rewrite them in your own voice for authenticity.',
    'ASMR-style is triggered by the "ASMR / Sensory" niche or "asmr" in the product name; it adds sound cues but cannot mix or check audio.',
    'The 7-shot sequence is a fixed structure that works for most product types, not a rule every video must follow.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'TikTok Unboxing Video Script 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/tiktok/tiktok-unboxing-flow-planner/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free tiktok unboxing video script 2026: Plan a TikTok unboxing video shot by shot: teaser, opening beats, reaction lines, and a. Fast, private, no signup - try!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        { '@type': 'ListItem', position: 3, name: 'TikTok Tools', item: 'https://husnainblogger.com/tools/tiktok/' },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'TikTok Unboxing Flow Planner',
          item: 'https://husnainblogger.com/tools/tiktok/tiktok-unboxing-flow-planner/',
        },
      ],
    },
  ],
};
