import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'tutorialTopic',
    label: 'Tutorial topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. tie a tie',
    validation: { max: 200 },
  },
  {
    id: 'stepCount',
    label: 'Number of steps',
    type: 'number',
    required: true,
    validation: { min: 2, max: 12 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'hook', label: 'Opening hook', type: 'copy' },
  { id: 'level', label: 'Detected level', type: 'text' },
  { id: 'steps', label: 'Numbered steps with on-screen text', type: 'list' },
  { id: 'recapCta', label: 'Recap + CTA', type: 'copy' },
];

export const content: ToolContent = {
  title: 'How to Structure a Tiktok Tutorial 2027',
  description:
    'Free how to structure a tiktok tutorial 2026: Structure your TikTok tutorial with a clear template: hook, numbered steps, short. Fast, private, no signup - try!',
  howTo: [
    'Type your tutorialTopic — what you are teaching (e.g. "tie a tie").',
    'Set stepCount between 2 and 12 for how many teaching steps the video needs.',
    'Generate to get a hook, numbered steps with on-screen text lines, and a recap CTA.',
    'If your topic reads as advanced (e.g. contains "expert" or "masterclass"), a prerequisite beat is added automatically.',
    'Replace the generic step actions with your real technique, keeping each on-screen line short.',
    'Film one step per clip and pin the on-screen text so viewers can follow along.',
  ],
  methodology:
    'The structurer picks a hook and recap CTA from fixed banks of 8 and 6 lines using a deterministic hash of your inputs, then assigns stepCount action templates from a bank of 12 and short on-screen text lines from a bank of 12 (each capped at 140 characters). An advanced-keyword check on the topic adds a prerequisite beat. Same inputs always produce the same structure — no AI is involved.',
  examples: [
    {
      title: 'Beginner tutorial',
      inputs: { tutorialTopic: 'fold a fitted sheet', stepCount: 5 },
      note: 'Produces 5 numbered steps with short on-screen text lines.',
    },
    {
      title: 'Advanced tutorial',
      inputs: { tutorialTopic: 'advanced sourdough scoring', stepCount: 4 },
      note: 'Detects the advanced keyword and prepends a prerequisite beat.',
    },
  ],
  faqs: [
    {
      question: 'What is the best way to structure a TikTok tutorial?',
      answer:
        'A proven structure is: a hook that promises the outcome, short numbered steps (one per clip) with brief on-screen text, a common-mistake beat, and a recap with a CTA. This tool builds that exact structure from fixed templates — you supply the accurate technique.',
    },
    {
      question: 'Is there a free TikTok tutorial structure tool?',
      answer:
        'Yes — this structurer is free and runs entirely in your browser. You get the hook, numbered steps, on-screen text lines, and recap CTA with no signup.',
    },
    {
      question: 'How do I use the tutorial structurer?',
      answer:
        'Enter your tutorial topic and how many steps you need, then generate. Replace the template step actions with your real method, film one step per clip, and keep each on-screen text line short enough to read at a glance.',
    },
    {
      question: 'How does the how to structure a tiktok tutorial work?',
      answer:
        'Enter your details using the inputs above and the how to structure a tiktok tutorial calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the how to structure a tiktok tutorial free to use?',
      answer:
        'Yes - this how to structure a tiktok tutorial is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a how to structure a tiktok tutorial?',
      answer:
        'A how to structure a tiktok tutorial is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the how to structure a tiktok tutorial?',
      answer:
        'No account needed. Open the how to structure a tiktok tutorial, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Template-based, not AI: the tool cannot research your topic or verify your steps are factually correct — you are responsible for accuracy.',
    'On-screen text lines are capped at 140 characters for small-screen readability; the heuristic is a design choice, not TikTok guidance.',
    'The advanced-topic check is keyword-based ("advanced", "expert", "pro", "masterclass", "deep dive", "complicated") and may misfire on casual uses of those words.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'How to Structure a Tiktok Tutorial 2026 | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/tiktok/tiktok-tutorial-step-structurer/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free how to structure a tiktok tutorial 2026: Structure your TikTok tutorial with a clear template: hook, numbered steps, short. Fast, private, no signup - try!',
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
          name: 'TikTok Tutorial Step Structurer',
          item: 'https://husnainblogger.com/tools/tiktok/tiktok-tutorial-step-structurer/',
        },
      ],
    },
  ],
};
