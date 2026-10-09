import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  { id: 'adjBold', label: 'Bold', type: 'boolean', required: false },
  { id: 'adjFriendly', label: 'Friendly', type: 'boolean', required: false },
  { id: 'adjPlayful', label: 'Playful', type: 'boolean', required: false },
  { id: 'adjProfessional', label: 'Professional', type: 'boolean', required: false },
  { id: 'adjHonest', label: 'Honest', type: 'boolean', required: false },
  { id: 'adjInspiring', label: 'Inspiring', type: 'boolean', required: false },
  { id: 'adjWitty', label: 'Witty', type: 'boolean', required: false },
  { id: 'adjCalm', label: 'Calm', type: 'boolean', required: false },
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. budget travel',
    validation: { max: 120 },
  },
  {
    id: 'exampleLine',
    label: 'An example line you wrote (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'Paste one caption line in your current style',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'doPhrases',
    label: 'Voice do’s',
    type: 'list',
    description: 'Free instagram brand voice examples 2026: Writing rules your brand voice follows. Instant, private, and mobile-friendly. No signup - try it free!',
  },
  {
    id: 'dontPhrases',
    label: 'Voice don’ts',
    type: 'list',
    description: 'Writing habits your brand voice avoids.',
  },
  {
    id: 'sampleLines',
    label: 'Sample captions in your voice',
    type: 'list',
    description: 'Four caption openers using your niche and adjectives.',
  },
  {
    id: 'copyAll',
    label: 'Full voice profile (copy)',
    type: 'copy',
    description: 'The complete profile as one block you can paste anywhere.',
  },
];

export const content: ToolContent = {
  title: 'Instagram Brand Voice Examples',
  description:
    'Get instagram brand voice examples for your niche: pick 3-5 adjectives and get do’s, don’ts, and sample captions in your voice. Free, instant — try it now!',
  howTo: [
    'Tick 3 to 5 adjectives that describe how you want to sound (for example, Bold, Friendly, Honest).',
    'Type your niche in the "Your niche" field (for example, "budget travel").',
    'Optionally paste one caption line you wrote so it is included in your profile.',
    'Click run to get your voice do’s, don’ts, four sample captions, and the full profile to copy.',
  ],
  methodology:
    'This tool is a client-side template engine, not AI. Each of the 8 adjectives has fixed banks of 4 "do" and 4 "don’t" phrases; the tool picks 2 of each per chosen adjective through a deterministic hash of the adjective and your niche, and fills 4 caption templates with your niche and adjectives. Same inputs always produce the same profile.',
  examples: [
    {
      title: 'Budget travel creator',
      inputs: { adjBold: true, adjFriendly: true, adjHonest: true, niche: 'budget travel' },
      note: 'Gets a bold-friendly-honest voice profile with do’s, don’ts, and sample captions.',
    },
    {
      title: 'Skincare educator',
      inputs: { adjProfessional: true, adjCalm: true, adjInspiring: true, niche: 'skincare basics' },
      note: 'Gets a professional-calm-inspiring profile with four sample caption openers.',
    },
  ],
  faqs: [
    {
      question: 'What is the best instagram brand voice examples?',
      answer:
        'The best examples show a clear pattern: what the brand always says (do’s), what it never says (don’ts), and sample lines in that tone. This tool builds exactly that profile from 3-5 adjectives you pick, so your captions sound like one person, not a committee.',
    },
    {
      question: 'Is there a free instagram brand voice examples?',
      answer:
        'Yes — this Brand Voice Generator is completely free with no signup. Pick your adjectives, enter your niche, and get your do’s, don’ts, sample captions, and a copyable profile instantly.',
    },
    {
      question: 'How to use instagram brand voice examples?',
      answer:
        'Pick 3-5 adjectives for your tone, enter your niche, and run the tool. Then keep the profile open while you write captions and check each draft against your do’s and don’ts — consistency is what makes a voice recognizable.',
    },
    {
      question: 'How does the instagram brand voice examples work?',
      answer:
        'Enter your details using the inputs above and the instagram brand voice examples calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the instagram brand voice examples free to use?',
      answer:
        'Yes - this instagram brand voice examples is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an instagram brand voice examples?',
      answer:
        'An instagram brand voice examples is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the instagram brand voice examples?',
      answer:
        'No account needed. Open the instagram brand voice examples, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'The tool assembles fixed phrase banks — it does not analyze your writing and cannot learn your real style.',
    'Phrase picks are a curated starting point; refine the wording until it sounds like you.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Instagram Brand Voice Examples 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/instagram/brand-voice-generator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free instagram brand voice examples 2026: Writing rules your brand voice follows. Instant, private, and mobile-friendly. No signup - try it free!',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Instagram Tools',
          item: 'https://husnainblogger.com/tools/instagram/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Brand Voice Generator',
          item: 'https://husnainblogger.com/tools/instagram/brand-voice-generator/',
        },
      ],
    },
  ],
};
